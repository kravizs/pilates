import { Router } from 'express';
import { body, query, param, validationResult } from 'express-validator';
import { db } from '@/config/database';
import { requireAuth, requireRole } from '@/middleware/auth';
import { APIError } from '@/types';
import { logger } from '@/utils/logger';

const router = Router();

/**
 * @swagger
 * /api/waitlist:
 *   get:
 *     summary: Get waitlist entries (admin/coach only)
 *     tags: [Waitlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: class_instance_id
 *         schema:
 *           type: string
 *         description: Filter by class instance
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [waiting, notified, booked, cancelled, expired]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: Waitlist entries retrieved successfully
 */
router.get('/',
  requireAuth,
  requireRole('admin', 'coach'),
  [
    query('class_instance_id').optional().isUUID().withMessage('Invalid class instance ID'),
    query('status').optional().isIn(['waiting', 'notified', 'booked', 'cancelled', 'expired'])
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

      const { class_instance_id, status, page = 1, limit = 20 } = req.query;

      let query = db('waitlist as w')
        .select([
          'w.*',
          'u.first_name as user_first_name',
          'u.last_name as user_last_name',
          'u.email as user_email',
          'ci.class_date',
          'ci.start_time',
          'ct.name as class_type_name'
        ])
        .leftJoin('users as u', 'w.user_id', 'u.id')
        .leftJoin('class_instances as ci', 'w.class_instance_id', 'ci.id')
        .leftJoin('class_types as ct', 'ci.class_type_id', 'ct.id')
        .orderBy(['w.class_instance_id', 'w.position']);

      if (class_instance_id) {
        query = query.where('w.class_instance_id', class_instance_id as string);
      }

      if (status) {
        query = query.where('w.status', status as string);
      }

      const offset = (Number(page) - 1) * Number(limit);
      query = query.offset(offset).limit(Number(limit));

      const waitlist = await query;

      // Get total count
      const totalQuery = db('waitlist as w');
      if (class_instance_id) totalQuery.where('w.class_instance_id', class_instance_id as string);
      if (status) totalQuery.where('w.status', status as string);

      const [{ total }] = await totalQuery.count('* as total');

      res.json({
        success: true,
        data: waitlist,
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
 * /api/waitlist/user/{userId}:
 *   get:
 *     summary: Get user's waitlist entries
 *     tags: [Waitlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User waitlist entries retrieved successfully
 */
router.get('/user/:userId',
  requireAuth,
  [param('userId').isUUID().withMessage('Invalid user ID')],
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

      // Users can only access their own waitlist, admins can access any
      if (req.params.userId !== req.user.id && !req.user.is_admin) {
        const error: APIError = new Error('Unauthorized') as APIError;
        error.status = 403;
        error.code = 'UNAUTHORIZED';
        throw error;
      }

      const waitlist = await db('waitlist as w')
        .select([
          'w.*',
          'ci.class_date',
          'ci.start_time',
          'ci.end_time',
          'ct.name as class_type_name',
          'i.first_name as instructor_first_name',
          'i.last_name as instructor_last_name'
        ])
        .leftJoin('class_instances as ci', 'w.class_instance_id', 'ci.id')
        .leftJoin('class_types as ct', 'ci.class_type_id', 'ct.id')
        .leftJoin('instructors as i', 'ci.instructor_id', 'i.id')
        .where('w.user_id', req.params.userId)
        .whereIn('w.status', ['waiting', 'notified'])
        .orderBy('w.joined_at', 'desc');

      res.json({
        success: true,
        data: waitlist
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/waitlist/{id}/notify:
 *   post:
 *     summary: Notify waitlist user of available spot
 *     tags: [Waitlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Waitlist entry ID
 *     responses:
 *       200:
 *         description: User notified successfully
 */
router.post('/:id/notify',
  requireAuth,
  requireRole('admin', 'coach'),
  [param('id').isUUID().withMessage('Invalid waitlist ID')],
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

      const waitlistEntry = await db('waitlist')
        .where('id', req.params.id)
        .where('status', 'waiting')
        .first();

      if (!waitlistEntry) {
        const error: APIError = new Error('Waitlist entry not found or already processed') as APIError;
        error.status = 404;
        error.code = 'WAITLIST_NOT_FOUND';
        throw error;
      }

      // Set response deadline to 2 hours from now
      const responseDeadline = new Date();
      responseDeadline.setHours(responseDeadline.getHours() + 2);

      const [updatedEntry] = await db('waitlist')
        .where('id', req.params.id)
        .update({
          status: 'notified',
          notified_at: new Date().toISOString(),
          response_deadline: responseDeadline.toISOString(),
          updated_at: new Date().toISOString()
        })
        .returning('*');

      // TODO: Send notification email/SMS to user

      logger.info(`Waitlist user notified: ${req.params.id} by ${req.user.email}`);

      res.json({
        success: true,
        data: updatedEntry,
        message: 'User notified successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/waitlist/{id}/cancel:
 *   post:
 *     summary: Cancel waitlist entry
 *     tags: [Waitlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Waitlist entry ID
 *     responses:
 *       200:
 *         description: Waitlist entry cancelled successfully
 */
router.post('/:id/cancel',
  requireAuth,
  [param('id').isUUID().withMessage('Invalid waitlist ID')],
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

      const waitlistEntry = await db('waitlist')
        .where('id', req.params.id)
        .first();

      if (!waitlistEntry) {
        const error: APIError = new Error('Waitlist entry not found') as APIError;
        error.status = 404;
        error.code = 'WAITLIST_NOT_FOUND';
        throw error;
      }

      // Users can only cancel their own waitlist entries
      if (waitlistEntry.user_id !== req.user.id && !req.user.is_admin) {
        const error: APIError = new Error('Unauthorized') as APIError;
        error.status = 403;
        error.code = 'UNAUTHORIZED';
        throw error;
      }

      if (waitlistEntry.status === 'cancelled') {
        const error: APIError = new Error('Waitlist entry already cancelled') as APIError;
        error.status = 400;
        error.code = 'ALREADY_CANCELLED';
        throw error;
      }

      const [cancelledEntry] = await db('waitlist')
        .where('id', req.params.id)
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .returning('*');

      // Update positions for remaining waitlist entries
      await db('waitlist')
        .where('class_instance_id', waitlistEntry.class_instance_id)
        .where('position', '>', waitlistEntry.position)
        .whereIn('status', ['waiting', 'notified'])
        .decrement('position', 1);

      logger.info(`Waitlist entry cancelled: ${req.params.id} by ${req.user.email}`);

      res.json({
        success: true,
        data: cancelledEntry,
        message: 'Waitlist entry cancelled successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;