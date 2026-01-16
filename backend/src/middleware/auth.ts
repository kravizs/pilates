import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '@/config/database';
import { User, JWTPayload, APIError } from '@/types';
import { logger } from '@/utils/logger';

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const error: APIError = new Error('Access token is required') as APIError;
      error.status = 401;
      error.code = 'UNAUTHORIZED';
      throw error;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not configured');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;
    
    // Fetch user from database
    const user = await db<User>('users')
      .where({ id: decoded.userId, is_active: true })
      .first();

    if (!user) {
      const error: APIError = new Error('User not found or inactive') as APIError;
      error.status = 401;
      error.code = 'USER_NOT_FOUND';
      throw error;
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        error: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    next(error);
  }
};

export const requireAuth = authenticate;

export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Continue without user
    }

    const token = authHeader.substring(7);
    
    if (!process.env.JWT_SECRET) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;
    
    const user = await db<User>('users')
      .where({ id: decoded.userId, is_active: true })
      .first();

    if (user) {
      req.user = user;
    }
    
    next();
  } catch (error) {
    // Ignore auth errors for optional auth
    next();
  }
};

// Accept a single role string, an array of roles, or variadic list
export const requireRole = (rolesInput: string | string[], ...rest: string[]) => {
  // Normalize roles: if first arg is array ignore rest, else combine
  const roles: string[] = Array.isArray(rolesInput) ? rolesInput : [rolesInput, ...rest];
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'UNAUTHORIZED'
      });
    }

    let userRole = 'client';
    
    if (req.user.is_admin) {
      userRole = 'admin';
    } else {
      // Check if user is a coach
      const instructor = await db('instructors')
        .where({ user_id: req.user.id, is_active: true })
        .first();
      
      if (instructor) {
        userRole = 'coach';
      }
    }
    
    if (!roles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        code: 'FORBIDDEN'
      });
    }

    next();
  };
};

export const requireAdmin = requireRole('admin');

export const requireCoachOrAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
      code: 'UNAUTHORIZED'
    });
  }

  if (req.user.is_admin) {
    return next();
  }

  // Check if user is a coach
  const instructor = await db('instructors')
    .where({ user_id: req.user.id, is_available: true })
    .first();

  if (!instructor) {
    return res.status(403).json({
      success: false,
      error: 'Coach or admin access required',
      code: 'FORBIDDEN'
    });
  }

  next();
};