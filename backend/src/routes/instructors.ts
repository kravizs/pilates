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
 * /api/instructors:
 *   get:
 *     summary: Get all instructors
 *     tags: [Instructors]
 *     responses:
 *       200:
 *         description: Instructors retrieved successfully
 */
router.get('/', async (req: any, res: any, next: any) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const offset = (Number(page) - 1) * Number(limit);
    
    const instructors = await db('instructors as i')
      .select([
        'i.*',
        'u.email',
        'u.preferred_language'
      ])
      .leftJoin('users as u', 'i.user_id', 'u.id')
      .where('i.is_active', true)
      .orderBy('i.first_name')
      .offset(offset)
      .limit(Number(limit));

    const [{ total }] = await db('instructors')
      .where('is_active', true)
      .count('* as total');

    res.json({
      success: true,
      data: instructors,
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
});

/**
 * @swagger
 * /api/instructors/{id}:
 *   get:
 *     summary: Get instructor by ID
 *     tags: [Instructors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Instructor ID
 *     responses:
 *       200:
 *         description: Instructor retrieved successfully
 */
router.get('/:id',
  [param('id').isUUID().withMessage('Invalid instructor ID')],
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

      const instructor = await db('instructors as i')
        .select([
          'i.*',
          'u.email',
          'u.preferred_language'
        ])
        .leftJoin('users as u', 'i.user_id', 'u.id')
        .where('i.id', req.params.id)
        .first();

      if (!instructor) {
        const error: APIError = new Error('Instructor not found') as APIError;
        error.status = 404;
        error.code = 'INSTRUCTOR_NOT_FOUND';
        throw error;
      }

      res.json({
        success: true,
        data: instructor
      });
    } catch (error) {
      next(error);
    }
  }
);
export default router;