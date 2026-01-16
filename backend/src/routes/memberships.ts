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
 * /api/memberships/plans:
 *   get:
 *     summary: Get all membership plans
 *     tags: [Memberships]
 *     responses:
 *       200:
 *         description: Membership plans retrieved successfully
 */
router.get('/plans', async (req: any, res: any, next: any) => {
  try {
    const plans = await db('membership_plans')
      .select('*')
      .where('is_active', true)
      .orderBy('sort_order');

    res.json({
      success: true,
      data: plans
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/memberships/user/{userId}:
 *   get:
 *     summary: Get user memberships
 *     tags: [Memberships]
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
 *         description: User memberships retrieved successfully
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

      // Users can only access their own memberships, admins can access any
      if (req.params.userId !== req.user.id && !req.user.is_admin) {
        const error: APIError = new Error('Unauthorized') as APIError;
        error.status = 403;
        error.code = 'UNAUTHORIZED';
        throw error;
      }

      const memberships = await db('user_memberships as um')
        .select([
          'um.*',
          'mp.name as plan_name',
          'mp.description as plan_description',
          'mp.duration_type',
          'mp.class_credits as plan_credits'
        ])
        .leftJoin('membership_plans as mp', 'um.membership_plan_id', 'mp.id')
        .where('um.user_id', req.params.userId)
        .orderBy('um.created_at', 'desc');

      res.json({
        success: true,
        data: memberships
      });
    } catch (error) {
      next(error);
    }
  }
);
export default router;