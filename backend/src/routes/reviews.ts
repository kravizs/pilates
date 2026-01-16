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
 * /api/reviews:
 *   get:
 *     summary: Get all public reviews
 *     tags: [Reviews]
 *     parameters:
 *       - in: query
 *         name: class_instance_id
 *         schema:
 *           type: string
 *         description: Filter by class instance
 *       - in: query
 *         name: instructor_id
 *         schema:
 *           type: string
 *         description: Filter by instructor
 *       - in: query
 *         name: rating
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         description: Filter by rating
 *     responses:
 *       200:
 *         description: Reviews retrieved successfully
 */
router.get('/',
  [
    query('class_instance_id').optional().isUUID().withMessage('Invalid class instance ID'),
    query('instructor_id').optional().isUUID().withMessage('Invalid instructor ID'),
    query('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5')
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

      const { class_instance_id, instructor_id, rating, page = 1, limit = 20 } = req.query;

      let query = db('reviews as r')
        .select([
          'r.*',
          'u.first_name as user_first_name',
          'u.last_name as user_last_name',
          'ci.class_date',
          'ct.name as class_type_name',
          'i.first_name as instructor_first_name',
          'i.last_name as instructor_last_name'
        ])
        .leftJoin('users as u', 'r.user_id', 'u.id')
        .leftJoin('class_instances as ci', 'r.class_instance_id', 'ci.id')
        .leftJoin('class_types as ct', 'ci.class_type_id', 'ct.id')
        .leftJoin('instructors as i', 'r.instructor_id', 'i.id')
        .where('r.is_public', true)
        .orderBy('r.created_at', 'desc');

      if (class_instance_id) {
        query = query.where('r.class_instance_id', class_instance_id as string);
      }

      if (instructor_id) {
        query = query.where('r.instructor_id', instructor_id as string);
      }

      if (rating) {
        query = query.where('r.rating', Number(rating));
      }

      const offset = (Number(page) - 1) * Number(limit);
      query = query.offset(offset).limit(Number(limit));

      const reviews = await query;

      // Get total count
      const totalQuery = db('reviews as r').where('r.is_public', true);
      if (class_instance_id) totalQuery.where('r.class_instance_id', class_instance_id as string);
      if (instructor_id) totalQuery.where('r.instructor_id', instructor_id as string);
      if (rating) totalQuery.where('r.rating', Number(rating));

      const [{ total }] = await totalQuery.count('* as total');

      res.json({
        success: true,
        data: reviews,
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
 * /api/reviews:
 *   post:
 *     summary: Create a new review
 *     tags: [Reviews]
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
 *               - rating
 *             properties:
 *               class_instance_id:
 *                 type: string
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *               detailed_ratings:
 *                 type: object
 *               is_public:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Review created successfully
 */
router.post('/',
  requireAuth,
  [
    body('class_instance_id').isUUID().withMessage('Invalid class instance ID'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').optional().isString().trim().isLength({ max: 1000 }).withMessage('Comment too long'),
    body('detailed_ratings').optional().isObject(),
    body('is_public').optional().isBoolean()
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

      const { class_instance_id, rating, comment, detailed_ratings, is_public = true } = req.body;

      // Check if class instance exists and user attended
      const booking = await db('bookings as b')
        .select(['b.id', 'b.checked_in_at', 'ci.instructor_id'])
        .leftJoin('class_instances as ci', 'b.class_instance_id', 'ci.id')
        .where('b.user_id', req.user.id)
        .where('b.class_instance_id', class_instance_id)
        .where('b.booking_status', 'confirmed')
        .first();

      if (!booking) {
        const error: APIError = new Error('You can only review classes you have attended') as APIError;
        error.status = 400;
        error.code = 'NOT_ATTENDED';
        throw error;
      }

      // Check if user already reviewed this class
      const existingReview = await db('reviews')
        .where({
          user_id: req.user.id,
          class_instance_id: class_instance_id
        })
        .first();

      if (existingReview) {
        const error: APIError = new Error('You have already reviewed this class') as APIError;
        error.status = 400;
        error.code = 'REVIEW_EXISTS';
        throw error;
      }

      const reviewData = {
        id: uuidv4(),
        user_id: req.user.id,
        class_instance_id,
        instructor_id: booking.instructor_id,
        rating,
        comment,
        detailed_ratings,
        is_public,
        is_verified: booking.checked_in_at ? true : false, // Verified if they checked in
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const [review] = await db('reviews')
        .insert(reviewData)
        .returning('*');

      logger.info(`New review created: ${review.id} by ${req.user.email}`);

      res.status(201).json({
        success: true,
        data: review,
        message: 'Review created successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/reviews/{id}:
 *   put:
 *     summary: Update a review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Review ID
 *     responses:
 *       200:
 *         description: Review updated successfully
 */
router.put('/:id',
  requireAuth,
  [
    param('id').isUUID().withMessage('Invalid review ID'),
    body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').optional().isString().trim().isLength({ max: 1000 }).withMessage('Comment too long'),
    body('detailed_ratings').optional().isObject(),
    body('is_public').optional().isBoolean()
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

      const review = await db('reviews')
        .where('id', req.params.id)
        .first();

      if (!review) {
        const error: APIError = new Error('Review not found') as APIError;
        error.status = 404;
        error.code = 'REVIEW_NOT_FOUND';
        throw error;
      }

      // Users can only update their own reviews
      if (review.user_id !== req.user.id && !req.user.is_admin) {
        const error: APIError = new Error('Unauthorized') as APIError;
        error.status = 403;
        error.code = 'UNAUTHORIZED';
        throw error;
      }

      const updateData = {
        ...req.body,
        updated_at: new Date().toISOString()
      };

      const [updatedReview] = await db('reviews')
        .where('id', req.params.id)
        .update(updateData)
        .returning('*');

      logger.info(`Review updated: ${req.params.id} by ${req.user.email}`);

      res.json({
        success: true,
        data: updatedReview,
        message: 'Review updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/reviews/{id}/helpful:
 *   post:
 *     summary: Mark review as helpful
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Review ID
 *     responses:
 *       200:
 *         description: Review marked as helpful
 */
router.post('/:id/helpful',
  [param('id').isUUID().withMessage('Invalid review ID')],
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

      const review = await db('reviews')
        .where('id', req.params.id)
        .where('is_public', true)
        .first();

      if (!review) {
        const error: APIError = new Error('Review not found') as APIError;
        error.status = 404;
        error.code = 'REVIEW_NOT_FOUND';
        throw error;
      }

      const [updatedReview] = await db('reviews')
        .where('id', req.params.id)
        .increment('helpful_count', 1)
        .returning('*');

      res.json({
        success: true,
        data: updatedReview,
        message: 'Review marked as helpful'
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/reviews/stats/instructor/{instructorId}:
 *   get:
 *     summary: Get instructor review statistics
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: instructorId
 *         required: true
 *         schema:
 *           type: string
 *         description: Instructor ID
 *     responses:
 *       200:
 *         description: Instructor review stats retrieved successfully
 */
router.get('/stats/instructor/:instructorId',
  [param('instructorId').isUUID().withMessage('Invalid instructor ID')],
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

      const stats = await db('reviews')
        .where('instructor_id', req.params.instructorId)
        .where('is_public', true)
        .select([
          db.raw('AVG(rating) as average_rating'),
          db.raw('COUNT(*) as total_reviews'),
          db.raw('COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star'),
          db.raw('COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star'),
          db.raw('COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star'),
          db.raw('COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star'),
          db.raw('COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star')
        ])
        .first();

      const reviewStats = {
        average_rating: stats?.average_rating ? parseFloat(stats.average_rating) : 0,
        total_reviews: Number(stats?.total_reviews || 0),
        rating_distribution: {
          5: Number(stats?.five_star || 0),
          4: Number(stats?.four_star || 0),
          3: Number(stats?.three_star || 0),
          2: Number(stats?.two_star || 0),
          1: Number(stats?.one_star || 0)
        }
      };

      res.json({
        success: true,
        data: reviewStats
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;