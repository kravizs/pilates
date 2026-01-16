import { Router, Request, Response, NextFunction } from 'express';
import { body, query, param, validationResult } from 'express-validator';
import { db } from '@/config/database';
import { requireAuth, requireRole } from '@/middleware/auth';
import { APIError } from '@/types';
import { logger } from '@/utils/logger';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

/**
 * @swagger
 * /api/classes:
 *   get:
 *     summary: Get all classes with filters
 *     tags: [Classes]
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by specific date
 *       - in: query
 *         name: instructor_id
 *         schema:
 *           type: string
 *         description: Filter by instructor
 *       - in: query
 *         name: class_type_id
 *         schema:
 *           type: string
 *         description: Filter by class type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [scheduled, cancelled, completed]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: List of classes retrieved successfully
 */
router.get('/', 
  [
    query('date').optional().isISO8601().withMessage('Invalid date format'),
    query('instructor_id').optional().isUUID().withMessage('Invalid instructor ID'),
    query('class_type_id').optional().isUUID().withMessage('Invalid class type ID'),
    query('status').optional().isIn(['scheduled', 'cancelled', 'completed'])
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const error: APIError = new Error('Validation failed') as APIError;
        error.status = 400;
        error.code = 'VALIDATION_ERROR';
        error.details = errors.array();
        throw error;
      }

      const { date, instructor_id, class_type_id, status, page = 1, limit = 20 } = req.query;

      let query = db('class_instances as ci')
        .select([
          'ci.*',
          'ct.name as class_type_name',
          'ct.description as class_type_description',
          'ct.duration_minutes as duration',
          'ct.price',
          'ct.difficulty_level',
          'i.first_name as instructor_first_name',
          'i.last_name as instructor_last_name',
          'i.bio as instructor_bio'
        ])
        .leftJoin('class_types as ct', 'ci.class_type_id', 'ct.id')
        .leftJoin('instructors as i', 'ci.instructor_id', 'i.id')
        .where('ci.class_date', '>=', new Date().toISOString().split('T')[0])
        .orderBy(['ci.class_date', 'ci.start_time']);

      if (date) {
        query = query.where('ci.class_date', date as string);
      }

      if (instructor_id) {
        query = query.where('ci.instructor_id', instructor_id as string);
      }

      if (class_type_id) {
        query = query.where('ci.class_type_id', class_type_id as string);
      }

      if (status) {
        query = query.where('ci.status', status as string);
      }

      const offset = (Number(page) - 1) * Number(limit);
      query = query.offset(offset).limit(Number(limit));

      const classes = await query;

      // Get total count for pagination
      const totalQuery = db('class_instances as ci')
        .count('* as total')
        .where('ci.class_date', '>=', new Date().toISOString().split('T')[0]);

      if (date) totalQuery.where('ci.class_date', date as string);
      if (instructor_id) totalQuery.where('ci.instructor_id', instructor_id as string);
      if (class_type_id) totalQuery.where('ci.class_type_id', class_type_id as string);
      if (status) totalQuery.where('ci.status', status as string);

      const [{ total }] = await totalQuery;

      res.json({
        success: true,
        data: classes,
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
 * /api/classes/{id}:
 *   get:
 *     summary: Get class by ID
 *     tags: [Classes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Class instance ID
 *     responses:
 *       200:
 *         description: Class retrieved successfully
 *       404:
 *         description: Class not found
 */
router.get('/:id',
  [param('id').isUUID().withMessage('Invalid class ID')],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const error: APIError = new Error('Validation failed') as APIError;
        error.status = 400;
        error.code = 'VALIDATION_ERROR';
        error.details = errors.array();
        throw error;
      }

      const classInstance = await db('class_instances as ci')
        .select([
          'ci.*',
          'ct.name as class_type_name',
          'ct.description as class_type_description',
          'ct.duration_minutes as duration',
          'ct.price',
          'ct.difficulty_level',
          'i.first_name as instructor_first_name',
          'i.last_name as instructor_last_name',
          'i.bio as instructor_bio'
        ])
        .leftJoin('class_types as ct', 'ci.class_type_id', 'ct.id')
        .leftJoin('instructors as i', 'ci.instructor_id', 'i.id')
        .where('ci.id', req.params.id)
        .first();

      if (!classInstance) {
        const error: APIError = new Error('Class not found') as APIError;
        error.status = 404;
        error.code = 'CLASS_NOT_FOUND';
        throw error;
      }

      // Get current bookings for this class
      const bookings = await db('bookings')
        .where('class_instance_id', req.params.id)
        .whereIn('booking_status', ['confirmed', 'pending']);

      const classWithBookings = {
        ...classInstance,
        current_bookings: bookings.length,
        available_spots: classInstance.max_capacity - bookings.length
      };

      res.json({
        success: true,
        data: classWithBookings
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/classes:
 *   post:
 *     summary: Create a new class instance
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - class_type_id
 *               - instructor_id
 *               - class_date
 *               - start_time
 *               - end_time
 *               - max_capacity
 *             properties:
 *               class_type_id:
 *                 type: string
 *               instructor_id:
 *                 type: string
 *               class_date:
 *                 type: string
 *                 format: date
 *               start_time:
 *                 type: string
 *                 format: time
 *               end_time:
 *                 type: string
 *                 format: time
 *               max_capacity:
 *                 type: integer
 *               room_name:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Class created successfully
 */
router.post('/',
  requireAuth,
  requireRole(['admin', 'coach']),
  [
    body('class_type_id').isUUID().withMessage('Invalid class type ID'),
    body('instructor_id').isUUID().withMessage('Invalid instructor ID'),
    body('class_date').isISO8601().withMessage('Invalid date format'),
    body('start_time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid time format'),
    body('end_time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid time format'),
    body('max_capacity').isInt({ min: 1, max: 100 }).withMessage('Max capacity must be between 1 and 100'),
    body('room_name').optional().isString().trim(),
    body('notes').optional().isString().trim()
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const error: APIError = new Error('Validation failed') as APIError;
        error.status = 400;
        error.code = 'VALIDATION_ERROR';
        error.details = errors.array();
        throw error;
      }

      const classData = {
        id: uuidv4(),
        class_type_id: req.body.class_type_id,
        instructor_id: req.body.instructor_id,
        class_date: req.body.class_date,
        start_time: req.body.start_time,
        end_time: req.body.end_time,
        max_capacity: req.body.max_capacity,
        room_name: req.body.room_name,
        notes: req.body.notes,
        current_bookings: 0,
        status: 'scheduled',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const [newClass] = await db('class_instances')
        .insert(classData)
        .returning('*');

      logger.info(`New class created: ${newClass.id} by ${req.user?.email}`);

      res.status(201).json({
        success: true,
        data: newClass,
        message: 'Class created successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/classes/{id}:
 *   put:
 *     summary: Update a class instance
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Class instance ID
 *     responses:
 *       200:
 *         description: Class updated successfully
 */
router.put('/:id',
  requireAuth,
  requireRole(['admin', 'coach']),
  [
    param('id').isUUID().withMessage('Invalid class ID'),
    body('class_type_id').optional().isUUID().withMessage('Invalid class type ID'),
    body('instructor_id').optional().isUUID().withMessage('Invalid instructor ID'),
    body('class_date').optional().isISO8601().withMessage('Invalid date format'),
    body('start_time').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid time format'),
    body('end_time').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid time format'),
    body('max_capacity').optional().isInt({ min: 1, max: 100 }).withMessage('Max capacity must be between 1 and 100'),
    body('status').optional().isIn(['scheduled', 'cancelled', 'completed']),
    body('room_name').optional().isString().trim(),
    body('notes').optional().isString().trim()
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const error: APIError = new Error('Validation failed') as APIError;
        error.status = 400;
        error.code = 'VALIDATION_ERROR';
        error.details = errors.array();
        throw error;
      }

      const classExists = await db('class_instances')
        .where('id', req.params.id)
        .first();

      if (!classExists) {
        const error: APIError = new Error('Class not found') as APIError;
        error.status = 404;
        error.code = 'CLASS_NOT_FOUND';
        throw error;
      }

      const updateData = {
        ...req.body,
        updated_at: new Date().toISOString()
      };

      const [updatedClass] = await db('class_instances')
        .where('id', req.params.id)
        .update(updateData)
        .returning('*');

      logger.info(`Class updated: ${req.params.id} by ${req.user?.email}`);

      res.json({
        success: true,
        data: updatedClass,
        message: 'Class updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/classes/{id}:
 *   delete:
 *     summary: Delete a class instance
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Class instance ID
 *     responses:
 *       200:
 *         description: Class deleted successfully
 */
router.delete('/:id',
  requireAuth,
  requireRole('admin'),
  [param('id').isUUID().withMessage('Invalid class ID')],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const error: APIError = new Error('Validation failed') as APIError;
        error.status = 400;
        error.code = 'VALIDATION_ERROR';
        error.details = errors.array();
        throw error;
      }

      const classExists = await db('class_instances')
        .where('id', req.params.id)
        .first();

      if (!classExists) {
        const error: APIError = new Error('Class not found') as APIError;
        error.status = 404;
        error.code = 'CLASS_NOT_FOUND';
        throw error;
      }

      // Check if there are any bookings
      const bookings = await db('bookings')
        .where('class_instance_id', req.params.id)
        .whereIn('booking_status', ['confirmed', 'pending']);

      if (bookings.length > 0) {
        const error: APIError = new Error('Cannot delete class with existing bookings') as APIError;
        error.status = 400;
        error.code = 'CLASS_HAS_BOOKINGS';
        throw error;
      }

      await db('class_instances')
        .where('id', req.params.id)
        .del();

      logger.info(`Class deleted: ${req.params.id} by ${req.user?.email}`);

      res.json({
        success: true,
        message: 'Class deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;