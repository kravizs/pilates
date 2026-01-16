import { Router } from 'express';
import { body, query, param, validationResult } from 'express-validator';
import { db } from '@/config/database';
import { requireAuth, requireRole } from '@/middleware/auth';
import { APIError } from '@/types';
import { logger } from '@/utils/logger';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

/**
 * @swagger
 * /api/bookings:
 *   get:
 *     summary: Get user bookings or all bookings (admin)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [confirmed, pending, cancelled, no_show, completed]
 *         description: Filter by booking status
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: string
 *         description: Filter by user (admin only)
 *     responses:
 *       200:
 *         description: Bookings retrieved successfully
 */
router.get('/',
  requireAuth,
  [
    query('status').optional().isIn(['confirmed', 'pending', 'cancelled', 'no_show', 'completed']),
    query('user_id').optional().isUUID().withMessage('Invalid user ID')
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

      const { status, user_id, page = 1, limit = 20 } = req.query;

      let query = db('bookings as b')
        .select([
          'b.*',
          'ci.class_date',
          'ci.start_time',
          'ci.end_time',
          'ci.room_name',
          'ct.name as class_type_name',
          'ct.description as class_type_description',
          'ct.duration',
          'ct.price',
          'i.first_name as instructor_first_name',
          'i.last_name as instructor_last_name',
          'u.first_name as user_first_name',
          'u.last_name as user_last_name',
          'u.email as user_email'
        ])
        .leftJoin('class_instances as ci', 'b.class_instance_id', 'ci.id')
        .leftJoin('class_types as ct', 'ci.class_type_id', 'ct.id')
        .leftJoin('instructors as i', 'ci.instructor_id', 'i.id')
        .leftJoin('users as u', 'b.user_id', 'u.id')
        .orderBy('b.booking_time', 'desc');

      // If not admin, only show user's own bookings
      if (!req.user.is_admin) {
        query = query.where('b.user_id', req.user.id);
      } else if (user_id) {
        query = query.where('b.user_id', user_id as string);
      }

      if (status) {
        query = query.where('b.booking_status', status as string);
      }

      const offset = (Number(page) - 1) * Number(limit);
      query = query.offset(offset).limit(Number(limit));

      const bookings = await query;

      // Get total count
      const totalQuery = db('bookings as b');
      if (!req.user.is_admin) {
        totalQuery.where('b.user_id', req.user.id);
      } else if (user_id) {
        totalQuery.where('b.user_id', user_id as string);
      }
      if (status) totalQuery.where('b.booking_status', status as string);

      const [{ total }] = await totalQuery.count('* as total');

      res.json({
        success: true,
        data: bookings,
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
 * /api/bookings:
 *   post:
 *     summary: Create a new booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - class_instance_id
 *             properties:
 *               class_instance_id:
 *                 type: string
 *               payment_method:
 *                 type: string
 *               special_requests:
 *                 type: string
 *     responses:
 *       201:
 *         description: Booking created successfully
 */
router.post('/',
  requireAuth,
  [
    body('class_instance_id').isUUID().withMessage('Invalid class instance ID'),
    body('payment_method').optional().isString().trim(),
    body('special_requests').optional().isString().trim()
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

      const { class_instance_id, payment_method, special_requests } = req.body;

      // Check if class exists and has capacity
      const classInstance = await db('class_instances')
        .select(['id', 'max_capacity', 'current_bookings', 'status', 'class_date', 'start_time'])
        .where('id', class_instance_id)
        .first();

      if (!classInstance) {
        const error: APIError = new Error('Class not found') as APIError;
        error.status = 404;
        error.code = 'CLASS_NOT_FOUND';
        throw error;
      }

      if (classInstance.status !== 'scheduled') {
        const error: APIError = new Error('Class is not available for booking') as APIError;
        error.status = 400;
        error.code = 'CLASS_NOT_AVAILABLE';
        throw error;
      }

      // Check if user already booked this class
      const existingBooking = await db('bookings')
        .where({
          user_id: req.user.id,
          class_instance_id: class_instance_id
        })
        .whereIn('booking_status', ['confirmed', 'pending'])
        .first();

      if (existingBooking) {
        const error: APIError = new Error('Already booked for this class') as APIError;
        error.status = 400;
        error.code = 'ALREADY_BOOKED';
        throw error;
      }

      // Check capacity
      const currentBookings = await db('bookings')
        .where('class_instance_id', class_instance_id)
        .whereIn('booking_status', ['confirmed', 'pending'])
        .count('* as count');

      const bookedCount = Number(currentBookings[0].count);

      if (bookedCount >= classInstance.max_capacity) {
        // Add to waitlist instead
        const waitlistEntry = {
          id: uuidv4(),
          user_id: req.user.id,
          class_instance_id: class_instance_id,
          position: bookedCount + 1,
          status: 'waiting',
          joined_at: new Date().toISOString()
        };

        const [waitlist] = await db('waitlist')
          .insert(waitlistEntry)
          .returning('*');

        return res.status(201).json({
          success: true,
          data: waitlist,
          message: 'Added to waitlist - you will be notified if a spot opens up'
        });
      }

      // Get class price for payment
      const classWithPrice = await db('class_instances as ci')
        .select('ct.price')
        .leftJoin('class_types as ct', 'ci.class_type_id', 'ct.id')
        .where('ci.id', class_instance_id)
        .first();

      const bookingData = {
        id: uuidv4(),
        user_id: req.user.id,
        class_instance_id: class_instance_id,
        booking_status: 'confirmed',
        payment_status: 'pending',
        payment_method: payment_method,
        amount_paid: classWithPrice?.price || 0,
        special_requests: special_requests,
        booking_time: new Date().toISOString()
      };

      const [booking] = await db('bookings')
        .insert(bookingData)
        .returning('*');

      // Update class current_bookings count
      await db('class_instances')
        .where('id', class_instance_id)
        .increment('current_bookings', 1);

      logger.info(`New booking created: ${booking.id} for user ${req.user.email}`);

      res.status(201).json({
        success: true,
        data: booking,
        message: 'Booking created successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/bookings/{id}/cancel:
 *   post:
 *     summary: Cancel a booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Booking cancelled successfully
 */
router.post('/:id/cancel',
  requireAuth,
  [
    param('id').isUUID().withMessage('Invalid booking ID'),
    body('reason').optional().isString().trim()
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

      const booking = await db('bookings')
        .where('id', req.params.id)
        .first();

      if (!booking) {
        const error: APIError = new Error('Booking not found') as APIError;
        error.status = 404;
        error.code = 'BOOKING_NOT_FOUND';
        throw error;
      }

      // Check if user owns the booking or is admin
      if (booking.user_id !== req.user.id && !req.user.is_admin) {
        const error: APIError = new Error('Unauthorized') as APIError;
        error.status = 403;
        error.code = 'UNAUTHORIZED';
        throw error;
      }

      if (booking.booking_status === 'cancelled') {
        const error: APIError = new Error('Booking already cancelled') as APIError;
        error.status = 400;
        error.code = 'ALREADY_CANCELLED';
        throw error;
      }

      // Update booking status
      const [cancelledBooking] = await db('bookings')
        .where('id', req.params.id)
        .update({
          booking_status: 'cancelled',
          cancellation_reason: req.body.reason,
          cancelled_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .returning('*');

      // Decrease class current_bookings count
      await db('class_instances')
        .where('id', booking.class_instance_id)
        .decrement('current_bookings', 1);

      // Check if someone is on waitlist and notify them
      const waitlistEntry = await db('waitlist')
        .where({
          class_instance_id: booking.class_instance_id,
          status: 'waiting'
        })
        .orderBy('position', 'asc')
        .first();

      if (waitlistEntry) {
        await db('waitlist')
          .where('id', waitlistEntry.id)
          .update({
            status: 'notified',
            notified_at: new Date().toISOString(),
            response_deadline: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // 2 hours
          });
      }

      logger.info(`Booking cancelled: ${req.params.id} by ${req.user.email}`);

      res.json({
        success: true,
        data: cancelledBooking,
        message: 'Booking cancelled successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;