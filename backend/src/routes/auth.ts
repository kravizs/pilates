import { Router } from 'express';
import bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { db } from '@/config/database';
import { User, CreateUserDto, LoginDto, AuthResponse, APIError } from '@/types';
import { requireAuth } from '@/middleware/auth';
import { authRateLimiter } from '@/middleware/rateLimiter';
import { logger } from '@/utils/logger';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - first_name
 *               - last_name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               phone:
 *                 type: string
 *               preferred_language:
 *                 type: string
 *                 enum: [en, fr, es]
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 */
router.post('/register', 
  authRateLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('first_name').trim().isLength({ min: 1 }).withMessage('First name is required'),
    body('last_name').trim().isLength({ min: 1 }).withMessage('Last name is required'),
    body('phone').optional().isMobilePhone('any'),
    body('preferred_language').optional().isIn(['en', 'fr', 'es'])
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

      const userData: CreateUserDto = req.body;

      // Check if user already exists
      const existingUser = await db<User>('users')
        .where({ email: userData.email })
        .first();

      if (existingUser) {
        const error: APIError = new Error('Email already registered') as APIError;
        error.status = 409;
        error.code = 'EMAIL_EXISTS';
        throw error;
      }

      // Hash password
      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
      const passwordHash = await bcrypt.hash(userData.password, saltRounds);

      // Create user
      const [user] = await db<User>('users')
        .insert({
          id: uuidv4(),
          email: userData.email,
          password_hash: passwordHash,
          first_name: userData.first_name,
          last_name: userData.last_name,
          phone: userData.phone,
          preferred_language: userData.preferred_language || 'en',
          is_active: true,
          is_admin: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .returning(['id', 'email', 'first_name', 'last_name', 'phone', 'preferred_language', 'is_admin', 'created_at']);

      // Generate JWT token
      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not configured');
      }

      const payload = {
        userId: user.id,
        email: user.email,
        role: 'client' as const,
        isAdmin: false
      };

      const token = (jwt.sign as any)(
        payload,
        process.env.JWT_SECRET!,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      logger.info(`New user registered: ${user.email}`);

      res.status(201).json({
        success: true,
        data: user,
        token,
        message: 'User registered successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login',
  authRateLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    body('password').exists().withMessage('Password is required')
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

      const { email, password }: LoginDto = req.body;

      // Find user
      const user = await db<User>('users')
        .where({ email, is_active: true })
        .first();

      if (!user || !user.password_hash) {
        const error: APIError = new Error('Invalid credentials') as APIError;
        error.status = 401;
        error.code = 'INVALID_CREDENTIALS';
        throw error;
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        const error: APIError = new Error('Invalid credentials') as APIError;
        error.status = 401;
        error.code = 'INVALID_CREDENTIALS';
        throw error;
      }

      // Check if user is a coach
      const instructor = await db('instructors')
        .where({ user_id: user.id })
        .first();

      const role = user.is_admin ? 'admin' : instructor ? 'coach' : 'client';

      // Generate JWT token
      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not configured');
      }

      const payload = {
        userId: user.id,
        email: user.email,
        role,
        isAdmin: user.is_admin
      };

      const token = (jwt.sign as any)(
        payload,
        process.env.JWT_SECRET!,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      // Remove password hash from response
      const { password_hash, ...userResponse } = user;

      logger.info(`User logged in: ${user.email}`);

      res.json({
        success: true,
        data: userResponse,
        token,
        message: 'Login successful'
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 */
router.get('/profile', requireAuth, async (req, res, next) => {
  try {
    if (!req.user) {
      const error: APIError = new Error('User not found') as APIError;
      error.status = 404;
      error.code = 'USER_NOT_FOUND';
      throw error;
    }

    const { password_hash, ...userProfile } = req.user;

    res.json({
      success: true,
      data: userProfile
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post('/logout', requireAuth, (req, res) => {
  // For JWT, logout is handled client-side by removing the token
  // In a production app, you might want to blacklist tokens
  logger.info(`User logged out: ${req.user?.email}`);
  
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

export default router;