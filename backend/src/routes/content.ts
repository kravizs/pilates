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
 * /api/content:
 *   get:
 *     summary: Get all published content
 *     tags: [Content]
 *     parameters:
 *       - in: query
 *         name: content_type
 *         schema:
 *           type: string
 *           enum: [page, blog_post, announcement, faq, policy]
 *         description: Filter by content type
 *       - in: query
 *         name: featured
 *         schema:
 *           type: boolean
 *         description: Filter by featured status
 *     responses:
 *       200:
 *         description: Content retrieved successfully
 */
router.get('/',
  [
    query('content_type').optional().isIn(['page', 'blog_post', 'announcement', 'faq', 'policy']),
    query('featured').optional().isBoolean()
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

      const { content_type, featured, page = 1, limit = 20 } = req.query;

      let query = db('cms_content as c')
        .select([
          'c.*',
          'u.first_name as author_first_name',
          'u.last_name as author_last_name'
        ])
        .leftJoin('users as u', 'c.author_id', 'u.id')
        .where('c.status', 'published')
        .orderBy([
          { column: 'c.is_featured', order: 'desc' },
          { column: 'c.sort_order', order: 'asc' },
          { column: 'c.published_at', order: 'desc' }
        ]);

      if (content_type) {
        query = query.where('c.content_type', content_type as string);
      }

      if (featured !== undefined) {
        query = query.where('c.is_featured', featured === 'true');
      }

      const offset = (Number(page) - 1) * Number(limit);
      query = query.offset(offset).limit(Number(limit));

      const content = await query;

      // Get total count
      const totalQuery = db('cms_content as c').where('c.status', 'published');
      if (content_type) totalQuery.where('c.content_type', content_type as string);
      if (featured !== undefined) totalQuery.where('c.is_featured', featured === 'true');

      const [{ total }] = await totalQuery.count('* as total');

      res.json({
        success: true,
        data: content,
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
 * /api/content/slug/{slug}:
 *   get:
 *     summary: Get content by slug
 *     tags: [Content]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Content slug
 *     responses:
 *       200:
 *         description: Content retrieved successfully
 */
router.get('/slug/:slug',
  [param('slug').isString().trim().withMessage('Invalid slug')],
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

      const content = await db('cms_content as c')
        .select([
          'c.*',
          'u.first_name as author_first_name',
          'u.last_name as author_last_name'
        ])
        .leftJoin('users as u', 'c.author_id', 'u.id')
        .where('c.slug', req.params.slug)
        .where('c.status', 'published')
        .first();

      if (!content) {
        const error: APIError = new Error('Content not found') as APIError;
        error.status = 404;
        error.code = 'CONTENT_NOT_FOUND';
        throw error;
      }

      // Increment view count
      await db('cms_content')
        .where('id', content.id)
        .increment('view_count', 1);

      res.json({
        success: true,
        data: {
          ...content,
          view_count: content.view_count + 1
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/content/{id}:
 *   get:
 *     summary: Get content by ID
 *     tags: [Content]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Content ID
 *     responses:
 *       200:
 *         description: Content retrieved successfully
 */
router.get('/:id',
  [param('id').isUUID().withMessage('Invalid content ID')],
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

      const content = await db('cms_content as c')
        .select([
          'c.*',
          'u.first_name as author_first_name',
          'u.last_name as author_last_name'
        ])
        .leftJoin('users as u', 'c.author_id', 'u.id')
        .where('c.id', req.params.id)
        .first();

      if (!content) {
        const error: APIError = new Error('Content not found') as APIError;
        error.status = 404;
        error.code = 'CONTENT_NOT_FOUND';
        throw error;
      }

      // Only show published content to non-admin users
      if (content.status !== 'published' && (!req.user || !req.user.is_admin)) {
        const error: APIError = new Error('Content not found') as APIError;
        error.status = 404;
        error.code = 'CONTENT_NOT_FOUND';
        throw error;
      }

      res.json({
        success: true,
        data: content
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/content:
 *   post:
 *     summary: Create new content (admin only)
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content_type
 *               - title
 *               - content
 *             properties:
 *               content_type:
 *                 type: string
 *                 enum: [page, blog_post, announcement, faq, policy]
 *               title:
 *                 type: string
 *               slug:
 *                 type: string
 *               content:
 *                 type: string
 *               excerpt:
 *                 type: string
 *               metadata:
 *                 type: object
 *               status:
 *                 type: string
 *                 enum: [draft, published, archived]
 *               is_featured:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Content created successfully
 */
router.post('/',
  requireAuth,
  requireRole('admin'),
  [
    body('content_type').isIn(['page', 'blog_post', 'announcement', 'faq', 'policy']).withMessage('Invalid content type'),
    body('title').trim().isLength({ min: 1, max: 255 }).withMessage('Title is required and must be under 255 characters'),
    body('slug').optional().trim().isSlug().withMessage('Invalid slug format'),
    body('content').trim().isLength({ min: 1 }).withMessage('Content is required'),
    body('excerpt').optional().trim().isLength({ max: 500 }).withMessage('Excerpt too long'),
    body('metadata').optional().isObject(),
    body('translations').optional().isObject(),
    body('status').optional().isIn(['draft', 'published', 'archived']),
    body('is_featured').optional().isBoolean(),
    body('sort_order').optional().isInt({ min: 0 })
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

      // Generate slug if not provided
      let slug = req.body.slug;
      if (!slug) {
        slug = req.body.title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim('-');
      }

      // Check if slug already exists
      const existingContent = await db('cms_content')
        .where('slug', slug)
        .first();

      if (existingContent) {
        slug = `${slug}-${Date.now()}`;
      }

      const contentData = {
        id: uuidv4(),
        content_type: req.body.content_type,
        title: req.body.title,
        slug,
        content: req.body.content,
        excerpt: req.body.excerpt,
        metadata: req.body.metadata || {},
        translations: req.body.translations || {},
        status: req.body.status || 'draft',
        author_id: req.user.id,
        published_at: req.body.status === 'published' ? new Date().toISOString() : null,
        is_featured: req.body.is_featured || false,
        sort_order: req.body.sort_order || 0,
        view_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const [content] = await db('cms_content')
        .insert(contentData)
        .returning('*');

      logger.info(`New content created: ${content.id} by ${req.user.email}`);

      res.status(201).json({
        success: true,
        data: content,
        message: 'Content created successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/content/{id}:
 *   put:
 *     summary: Update content (admin only)
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Content ID
 *     responses:
 *       200:
 *         description: Content updated successfully
 */
router.put('/:id',
  requireAuth,
  requireRole('admin'),
  [
    param('id').isUUID().withMessage('Invalid content ID'),
    body('title').optional().trim().isLength({ min: 1, max: 255 }).withMessage('Title must be under 255 characters'),
    body('slug').optional().trim().isSlug().withMessage('Invalid slug format'),
    body('content').optional().trim().isLength({ min: 1 }).withMessage('Content cannot be empty'),
    body('excerpt').optional().trim().isLength({ max: 500 }).withMessage('Excerpt too long'),
    body('metadata').optional().isObject(),
    body('translations').optional().isObject(),
    body('status').optional().isIn(['draft', 'published', 'archived']),
    body('is_featured').optional().isBoolean(),
    body('sort_order').optional().isInt({ min: 0 })
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

      const content = await db('cms_content')
        .where('id', req.params.id)
        .first();

      if (!content) {
        const error: APIError = new Error('Content not found') as APIError;
        error.status = 404;
        error.code = 'CONTENT_NOT_FOUND';
        throw error;
      }

      const updateData = {
        ...req.body,
        updated_at: new Date().toISOString()
      };

      // Set published_at when status changes to published
      if (req.body.status === 'published' && content.status !== 'published') {
        updateData.published_at = new Date().toISOString();
      }

      const [updatedContent] = await db('cms_content')
        .where('id', req.params.id)
        .update(updateData)
        .returning('*');

      logger.info(`Content updated: ${req.params.id} by ${req.user.email}`);

      res.json({
        success: true,
        data: updatedContent,
        message: 'Content updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/content/{id}:
 *   delete:
 *     summary: Delete content (admin only)
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Content ID
 *     responses:
 *       200:
 *         description: Content deleted successfully
 */
router.delete('/:id',
  requireAuth,
  requireRole('admin'),
  [param('id').isUUID().withMessage('Invalid content ID')],
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

      const content = await db('cms_content')
        .where('id', req.params.id)
        .first();

      if (!content) {
        const error: APIError = new Error('Content not found') as APIError;
        error.status = 404;
        error.code = 'CONTENT_NOT_FOUND';
        throw error;
      }

      await db('cms_content')
        .where('id', req.params.id)
        .del();

      logger.info(`Content deleted: ${req.params.id} by ${req.user.email}`);

      res.json({
        success: true,
        message: 'Content deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;