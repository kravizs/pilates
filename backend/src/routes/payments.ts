import { Router } from 'express';
import { body, query, param, validationResult } from 'express-validator';
import { db } from '@/config/database';
import { requireAuth, requireRole } from '@/middleware/auth';
import { APIError } from '@/types';
import { logger } from '@/utils/logger';
import { v4 as uuidv4 } from 'uuid';
import Stripe from 'stripe';

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-08-16'
});

/**
 * @swagger
 * /api/payments/create-payment-intent:
 *   post:
 *     summary: Create payment intent for membership or class booking
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - currency
 *               - payment_type
 *             properties:
 *               amount:
 *                 type: number
 *               currency:
 *                 type: string
 *               payment_type:
 *                 type: string
 *                 enum: [membership, booking, package]
 *               membership_plan_id:
 *                 type: string
 *               class_instance_id:
 *                 type: string
 *               metadata:
 *                 type: object
 *     responses:
 *       200:
 *         description: Payment intent created successfully
 */
router.post('/create-payment-intent',
  requireAuth,
  [
    body('amount').isFloat({ min: 0.5 }).withMessage('Amount must be at least 0.5'),
    body('currency').isLength({ min: 3, max: 3 }).withMessage('Invalid currency code'),
    body('payment_type').isIn(['membership', 'booking', 'package']).withMessage('Invalid payment type'),
    body('membership_plan_id').optional().isUUID().withMessage('Invalid membership plan ID'),
    body('class_instance_id').optional().isUUID().withMessage('Invalid class instance ID'),
    body('metadata').optional().isObject()
  ],
  async (req: any, res: any, next: any) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const error: APIError = new Error('Validation failed') as APIError;
        error.status = 400;
        error.code = 'VALIDATION_ERROR';
        error.details = errors.array();
        throw error;
      }

      const { amount, currency, payment_type, membership_plan_id, class_instance_id, metadata } = req.body;

      // Validate the payment type and associated IDs
      if (payment_type === 'membership' && !membership_plan_id) {
        const error: APIError = new Error('Membership plan ID is required for membership payments') as APIError;
        error.status = 400;
        error.code = 'MISSING_MEMBERSHIP_PLAN_ID';
        throw error;
      }

      if (payment_type === 'booking' && !class_instance_id) {
        const error: APIError = new Error('Class instance ID is required for booking payments') as APIError;
        error.status = 400;
        error.code = 'MISSING_CLASS_INSTANCE_ID';
        throw error;
      }

      // Create payment intent with Stripe
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        metadata: {
          user_id: req.user.id,
          payment_type,
          membership_plan_id: membership_plan_id || '',
          class_instance_id: class_instance_id || '',
          ...metadata
        },
        automatic_payment_methods: {
          enabled: true
        }
      });

      // Store payment record
      const paymentData = {
        id: uuidv4(),
        user_id: req.user.id,
        payment_intent_id: paymentIntent.id,
        amount,
        currency: currency.toUpperCase(),
        payment_type,
        membership_plan_id,
        class_instance_id,
        status: 'pending',
        metadata: metadata || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await db('payments').insert(paymentData);

      logger.info(`Payment intent created: ${paymentIntent.id} for user ${req.user.email}`);

      res.json({
        success: true,
        data: {
          client_secret: paymentIntent.client_secret,
          payment_intent_id: paymentIntent.id,
          amount,
          currency
        }
      });
    } catch (error) {
      if (error instanceof Stripe.errors.StripeError) {
        logger.error('Stripe error:', error);
        const apiError: APIError = new Error('Payment service error') as APIError;
        apiError.status = 400;
        apiError.code = 'STRIPE_ERROR';
        apiError.details = { stripe_error: error.message };
        next(apiError);
      } else {
        next(error);
      }
    }
  }
);

/**
 * @swagger
 * /api/payments/webhook:
 *   post:
 *     summary: Handle Stripe webhook events
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 */
router.post('/webhook', 
  async (req: any, res: any, next: any) => {
    try {
      const sig = req.headers['stripe-signature'];
      const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

      if (!endpointSecret) {
        throw new Error('Stripe webhook secret not configured');
      }

      let event;

      try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
      } catch (err: any) {
        logger.error('Webhook signature verification failed:', err.message);
        const error: APIError = new Error('Webhook signature verification failed') as APIError;
        error.status = 400;
        error.code = 'WEBHOOK_SIGNATURE_INVALID';
        throw error;
      }

      // Handle the event
      switch (event.type) {
        case 'payment_intent.succeeded':
          await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
          break;
        case 'payment_intent.payment_failed':
          await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
          break;
        case 'payment_intent.canceled':
          await handlePaymentIntentCanceled(event.data.object as Stripe.PaymentIntent);
          break;
        default:
          logger.info(`Unhandled event type ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/payments/history:
 *   get:
 *     summary: Get user payment history
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: payment_type
 *         schema:
 *           type: string
 *           enum: [membership, booking, package]
 *         description: Filter by payment type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, succeeded, failed, canceled]
 *         description: Filter by payment status
 *     responses:
 *       200:
 *         description: Payment history retrieved successfully
 */
router.get('/history',
  requireAuth,
  [
    query('payment_type').optional().isIn(['membership', 'booking', 'package']),
    query('status').optional().isIn(['pending', 'succeeded', 'failed', 'canceled'])
  ],
  async (req: any, res: any, next: any) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const error: APIError = new Error('Validation failed') as APIError;
        error.status = 400;
        error.code = 'VALIDATION_ERROR';
        error.details = errors.array();
        throw error;
      }

      const { payment_type, status, page = 1, limit = 20 } = req.query;

      let query = db('payments as p')
        .select([
          'p.*',
          'mp.name as membership_plan_name',
          'ct.name as class_name',
          'ci.scheduled_date as class_date'
        ])
        .leftJoin('membership_plans as mp', 'p.membership_plan_id', 'mp.id')
        .leftJoin('class_instances as ci', 'p.class_instance_id', 'ci.id')
        .leftJoin('class_types as ct', 'ci.class_type_id', 'ct.id')
        .where('p.user_id', req.user.id)
        .orderBy('p.created_at', 'desc');

      if (payment_type) {
        query = query.where('p.payment_type', payment_type as string);
      }

      if (status) {
        query = query.where('p.status', status as string);
      }

      const offset = (Number(page) - 1) * Number(limit);
      query = query.offset(offset).limit(Number(limit));

      const payments = await query;

      // Get total count
      const totalQuery = db('payments').where('user_id', req.user.id);
      if (payment_type) totalQuery.where('payment_type', payment_type as string);
      if (status) totalQuery.where('status', status as string);

      const [{ total }] = await totalQuery.count('* as total');

      res.json({
        success: true,
        data: payments,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: Number(total),
          totalPages: Math.ceil(Number(total) / Number(limit))
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/payments/{id}:
 *   get:
 *     summary: Get payment details
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment ID
 *     responses:
 *       200:
 *         description: Payment details retrieved successfully
 */
router.get('/:id',
  requireAuth,
  [param('id').isUUID().withMessage('Invalid payment ID')],
  async (req: any, res: any, next: any) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const error: APIError = new Error('Validation failed') as APIError;
        error.status = 400;
        error.code = 'VALIDATION_ERROR';
        error.details = errors.array();
        throw error;
      }

      const payment = await db('payments as p')
        .select([
          'p.*',
          'mp.name as membership_plan_name',
          'mp.duration_months',
          'ct.name as class_name',
          'ct.duration',
          'ci.scheduled_date as class_date',
          'i.first_name as instructor_first_name',
          'i.last_name as instructor_last_name'
        ])
        .leftJoin('membership_plans as mp', 'p.membership_plan_id', 'mp.id')
        .leftJoin('class_instances as ci', 'p.class_instance_id', 'ci.id')
        .leftJoin('class_types as ct', 'ci.class_type_id', 'ct.id')
        .leftJoin('class_schedules as cs', 'ci.class_schedule_id', 'cs.id')
        .leftJoin('instructors as inst', 'cs.instructor_id', 'inst.id')
        .leftJoin('users as i', 'inst.user_id', 'i.id')
        .where('p.id', req.params.id)
        .where('p.user_id', req.user.id)
        .first();

      if (!payment) {
        const error: APIError = new Error('Payment not found') as APIError;
        error.status = 404;
        error.code = 'PAYMENT_NOT_FOUND';
        throw error;
      }

      res.json({
        success: true,
        data: payment
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/payments/admin/overview:
 *   get:
 *     summary: Get payment overview for admin
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payment overview retrieved successfully
 */
router.get('/admin/overview',
  requireAuth,
  requireRole('admin'),
  async (req: any, res: any, next: any) => {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

      // Total revenue
      const [totalRevenue] = await db('payments')
        .where('status', 'succeeded')
        .sum('amount as total');

      // Revenue this month
      const [revenueThisMonth] = await db('payments')
        .where('status', 'succeeded')
        .where('created_at', '>=', startOfMonth.toISOString())
        .sum('amount as total');

      // Revenue last month
      const [revenueLastMonth] = await db('payments')
        .where('status', 'succeeded')
        .where('created_at', '>=', startOfLastMonth.toISOString())
        .where('created_at', '<=', endOfLastMonth.toISOString())
        .sum('amount as total');

      // Payment counts by status
      const paymentsByStatus = await db('payments')
        .select('status')
        .count('* as count')
        .groupBy('status');

      // Revenue by payment type
      const revenueByType = await db('payments')
        .select('payment_type')
        .sum('amount as total')
        .where('status', 'succeeded')
        .groupBy('payment_type');

      // Recent transactions
      const recentTransactions = await db('payments as p')
        .select([
          'p.*',
          'u.first_name',
          'u.last_name',
          'u.email',
          'mp.name as membership_plan_name',
          'ct.name as class_name'
        ])
        .join('users as u', 'p.user_id', 'u.id')
        .leftJoin('membership_plans as mp', 'p.membership_plan_id', 'mp.id')
        .leftJoin('class_instances as ci', 'p.class_instance_id', 'ci.id')
        .leftJoin('class_types as ct', 'ci.class_type_id', 'ct.id')
        .orderBy('p.created_at', 'desc')
        .limit(10);

      // Calculate growth
      const revenueGrowth = Number(revenueLastMonth?.total || 0) > 0 
        ? ((Number(revenueThisMonth?.total || 0) - Number(revenueLastMonth?.total || 0)) / Number(revenueLastMonth?.total || 0)) * 100
        : 0;

      res.json({
        success: true,
        data: {
          overview: {
            totalRevenue: Number(totalRevenue?.total || 0),
            revenueThisMonth: Number(revenueThisMonth?.total || 0),
            revenueGrowth: Math.round(revenueGrowth * 100) / 100
          },
          paymentsByStatus,
          revenueByType,
          recentTransactions
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

// Helper functions for webhook handling
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    // Update payment status
    await db('payments')
      .where('payment_intent_id', paymentIntent.id)
      .update({
        status: 'succeeded',
        updated_at: new Date().toISOString()
      });

    const payment = await db('payments')
      .where('payment_intent_id', paymentIntent.id)
      .first();

    if (!payment) return;

    // Handle membership purchase
    if (payment.payment_type === 'membership' && payment.membership_plan_id) {
      const membershipPlan = await db('membership_plans')
        .where('id', payment.membership_plan_id)
        .first();

      if (membershipPlan) {
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + membershipPlan.duration_months);

        await db('user_memberships').insert({
          id: uuidv4(),
          user_id: payment.user_id,
          membership_plan_id: payment.membership_plan_id,
          start_date: new Date().toISOString(),
          end_date: endDate.toISOString(),
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

        logger.info(`Membership activated for user ${payment.user_id}`);
      }
    }

    // Handle booking payment
    if (payment.payment_type === 'booking' && payment.class_instance_id) {
      // Check if booking already exists
      const existingBooking = await db('bookings')
        .where('user_id', payment.user_id)
        .where('class_instance_id', payment.class_instance_id)
        .first();

      if (!existingBooking) {
        await db('bookings').insert({
          id: uuidv4(),
          user_id: payment.user_id,
          class_instance_id: payment.class_instance_id,
          status: 'confirmed',
          payment_status: 'paid',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

        // Decrease available spots
        await db('class_instances')
          .where('id', payment.class_instance_id)
          .decrement('available_spots', 1);

        logger.info(`Booking confirmed for user ${payment.user_id}`);
      }
    }

    logger.info(`Payment succeeded: ${paymentIntent.id}`);
  } catch (error) {
    logger.error('Error handling payment success:', error);
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    await db('payments')
      .where('payment_intent_id', paymentIntent.id)
      .update({
        status: 'failed',
        updated_at: new Date().toISOString()
      });

    logger.info(`Payment failed: ${paymentIntent.id}`);
  } catch (error) {
    logger.error('Error handling payment failure:', error);
  }
}

async function handlePaymentIntentCanceled(paymentIntent: Stripe.PaymentIntent) {
  try {
    await db('payments')
      .where('payment_intent_id', paymentIntent.id)
      .update({
        status: 'canceled',
        updated_at: new Date().toISOString()
      });

    logger.info(`Payment canceled: ${paymentIntent.id}`);
  } catch (error) {
    logger.error('Error handling payment cancellation:', error);
  }
}

export default router;