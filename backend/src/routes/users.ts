import { Router } from 'express';
import { body, query, param, validationResult } from 'express-validator';
import { db } from '@/config/database';
import { requireAuth, requireRole } from '@/middleware/auth';
import { APIError } from '@/types';
import { logger } from '@/utils/logger';
import bcrypt from 'bcryptjs';

const router = Router();

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 */
router.get('/',
  requireAuth,
  requireRole('admin'),
  async (req: any, res: any, next: any) => {
    try {
      const { page = 1, limit = 20 } = req.query;

      const offset = (Number(page) - 1) * Number(limit);
      
      const users = await db('users')
        .select([
          'id', 'email', 'first_name', 'last_name', 'phone', 'date_of_birth',
          'preferred_language', 'is_active', 'is_admin', 'email_verified',
          'last_login', 'profile', 'created_at', 'updated_at'
        ])
        .orderBy('created_at', 'desc')
        .offset(offset)
        .limit(Number(limit));

      const [{ total }] = await db('users').count('* as total');

      res.json({
        success: true,
        data: users,
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
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User retrieved successfully
 */
router.get('/:id',
  requireAuth,
  [param('id').isUUID().withMessage('Invalid user ID')],
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

      // Users can only access their own profile, admins can access any
      if (req.params.id !== req.user.id && !req.user.is_admin) {
        const error: APIError = new Error('Unauthorized') as APIError;
        error.status = 403;
        error.code = 'UNAUTHORIZED';
        throw error;
      }

      const user = await db('users')
        .select([
          'id', 'email', 'first_name', 'last_name', 'phone', 'date_of_birth',
          'preferred_language', 'is_active', 'is_admin', 'email_verified',
          'last_login', 'profile', 'created_at', 'updated_at'
        ])
        .where('id', req.params.id)
        .first();

      if (!user) {
        const error: APIError = new Error('User not found') as APIError;
        error.status = 404;
        error.code = 'USER_NOT_FOUND';
        throw error;
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User updated successfully
 */
router.put('/:id',
  requireAuth,
  [
    param('id').isUUID().withMessage('Invalid user ID'),
    body('first_name').optional().isString().trim().isLength({ min: 1 }),
    body('last_name').optional().isString().trim().isLength({ min: 1 }),
    body('phone').optional().isMobilePhone('any'),
    body('date_of_birth').optional().isISO8601().toDate(),
    body('preferred_language').optional().isIn(['en', 'fr', 'es']),
    body('profile').optional().isObject()
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

      // Users can only update their own profile, admins can update any
      if (req.params.id !== req.user.id && !req.user.is_admin) {
        const error: APIError = new Error('Unauthorized') as APIError;
        error.status = 403;
        error.code = 'UNAUTHORIZED';
        throw error;
      }

      const updateData = {
        ...req.body,
        updated_at: new Date().toISOString()
      };

      const [updatedUser] = await db('users')
        .where('id', req.params.id)
        .update(updateData)
        .returning([
          'id', 'email', 'first_name', 'last_name', 'phone', 'date_of_birth',
          'preferred_language', 'is_active', 'is_admin', 'email_verified',
          'last_login', 'profile', 'created_at', 'updated_at'
        ]);

      if (!updatedUser) {
        const error: APIError = new Error('User not found') as APIError;
        error.status = 404;
        error.code = 'USER_NOT_FOUND';
        throw error;
      }

      logger.info(`User updated: ${req.params.id} by ${req.user.email}`);

      res.json({
        success: true,
        data: updatedUser,
        message: 'User updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;