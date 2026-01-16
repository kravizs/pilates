import { Request, Response, NextFunction } from 'express';
import { APIError } from '@/types';
import { logger } from '@/utils/logger';

export const errorHandler = (
  error: Error | APIError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Error occurred:', {
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id
  });

  // Handle specific error types
  if ('status' in error) {
    const apiError = error as APIError;
    return res.status(apiError.status).json({
      success: false,
      error: apiError.message,
      code: apiError.code,
      timestamp: new Date().toISOString(),
      path: req.path,
      ...(process.env.NODE_ENV === 'development' && { 
        details: apiError.details,
        stack: apiError.stack 
      })
    });
  }

  // Handle validation errors
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: error.message,
      timestamp: new Date().toISOString(),
      path: req.path
    });
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid token',
      timestamp: new Date().toISOString(),
      path: req.path
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Token expired',
      timestamp: new Date().toISOString(),
      path: req.path
    });
  }

  // Handle database errors
  if (error.message.includes('duplicate key')) {
    return res.status(409).json({
      success: false,
      error: 'Resource already exists',
      timestamp: new Date().toISOString(),
      path: req.path
    });
  }

  if (error.message.includes('foreign key')) {
    return res.status(400).json({
      success: false,
      error: 'Invalid reference to related resource',
      timestamp: new Date().toISOString(),
      path: req.path
    });
  }

  // Default error response
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
    timestamp: new Date().toISOString(),
    path: req.path,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};