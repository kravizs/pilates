import { Router } from 'express';
import { query, param, validationResult } from 'express-validator';
import { db } from '@/config/database';
import { requireAuth, requireRole } from '@/middleware/auth';
import { APIError } from '@/types';
import { logger } from '@/utils/logger';

const router = Router();

/**
 * @swagger
 * /api/dashboard/admin:
 *   get:
 *     summary: Get admin dashboard data
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin dashboard data retrieved successfully
 */
router.get('/admin',
  requireAuth,
  requireRole('admin'),
  async (req: any, res: any, next: any) => {
    try {
      // Get current date ranges
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      const startOfYear = new Date(now.getFullYear(), 0, 1);

      // Users statistics
      const [totalUsers] = await db('users').count('* as count');
      const [newUsersThisMonth] = await db('users')
        .where('created_at', '>=', startOfMonth.toISOString())
        .count('* as count');
      const [newUsersLastMonth] = await db('users')
        .where('created_at', '>=', startOfLastMonth.toISOString())
        .where('created_at', '<=', endOfLastMonth.toISOString())
        .count('* as count');

      // Bookings statistics
      const [totalBookings] = await db('bookings').count('* as count');
      const [bookingsThisMonth] = await db('bookings')
        .where('created_at', '>=', startOfMonth.toISOString())
        .count('* as count');
      const [bookingsLastMonth] = await db('bookings')
        .where('created_at', '>=', startOfLastMonth.toISOString())
        .where('created_at', '<=', endOfLastMonth.toISOString())
        .count('* as count');

      // Revenue statistics
      const revenueThisMonth = await db('user_memberships as um')
        .join('membership_plans as mp', 'um.membership_plan_id', 'mp.id')
        .where('um.created_at', '>=', startOfMonth.toISOString())
        .sum('mp.price as total_revenue')
        .first();

      const revenueLastMonth = await db('user_memberships as um')
        .join('membership_plans as mp', 'um.membership_plan_id', 'mp.id')
        .where('um.created_at', '>=', startOfLastMonth.toISOString())
        .where('um.created_at', '<=', endOfLastMonth.toISOString())
        .sum('mp.price as total_revenue')
        .first();

      // Active memberships
      const [activeMemberships] = await db('user_memberships')
        .where('status', 'active')
        .where('end_date', '>', now.toISOString())
        .count('* as count');

      // Class statistics
      const [totalClasses] = await db('class_instances').count('* as count');
      const [classesThisMonth] = await db('class_instances')
        .where('created_at', '>=', startOfMonth.toISOString())
        .count('* as count');

      // Top performing classes
      const topClasses = await db('class_instances as ci')
        .select([
          'ct.name',
          db.raw('COUNT(b.id) as total_bookings'),
          db.raw('AVG(ci.capacity - ci.available_spots) as avg_attendance')
        ])
        .join('class_types as ct', 'ci.class_type_id', 'ct.id')
        .leftJoin('bookings as b', 'ci.id', 'b.class_instance_id')
        .where('ci.scheduled_date', '>=', startOfMonth.toISOString())
        .groupBy('ct.id', 'ct.name')
        .orderBy('total_bookings', 'desc')
        .limit(5);

      // Recent bookings
      const recentBookings = await db('bookings as b')
        .select([
          'b.id',
          'b.status',
          'b.created_at',
          'u.first_name',
          'u.last_name',
          'u.email',
          'ct.name as class_name',
          'ci.scheduled_date'
        ])
        .join('users as u', 'b.user_id', 'u.id')
        .join('class_instances as ci', 'b.class_instance_id', 'ci.id')
        .join('class_types as ct', 'ci.class_type_id', 'ct.id')
        .orderBy('b.created_at', 'desc')
        .limit(10);

      // Calculate growth percentages
      const userGrowth = Number(newUsersLastMonth.count) > 0 
        ? ((Number(newUsersThisMonth.count) - Number(newUsersLastMonth.count)) / Number(newUsersLastMonth.count)) * 100
        : 0;

      const bookingGrowth = Number(bookingsLastMonth.count) > 0 
        ? ((Number(bookingsThisMonth.count) - Number(bookingsLastMonth.count)) / Number(bookingsLastMonth.count)) * 100
        : 0;

      const revenueGrowth = Number(revenueLastMonth?.total_revenue || 0) > 0 
        ? ((Number(revenueThisMonth?.total_revenue || 0) - Number(revenueLastMonth?.total_revenue || 0)) / Number(revenueLastMonth?.total_revenue || 0)) * 100
        : 0;

      res.json({
        success: true,
        data: {
          overview: {
            totalUsers: Number(totalUsers.count),
            newUsersThisMonth: Number(newUsersThisMonth.count),
            userGrowth: Math.round(userGrowth * 100) / 100,
            totalBookings: Number(totalBookings.count),
            bookingsThisMonth: Number(bookingsThisMonth.count),
            bookingGrowth: Math.round(bookingGrowth * 100) / 100,
            totalRevenue: Number(revenueThisMonth?.total_revenue || 0),
            revenueGrowth: Math.round(revenueGrowth * 100) / 100,
            activeMemberships: Number(activeMemberships.count),
            totalClasses: Number(totalClasses.count),
            classesThisMonth: Number(classesThisMonth.count)
          },
          topClasses,
          recentBookings
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/dashboard/coach:
 *   get:
 *     summary: Get coach dashboard data
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Coach dashboard data retrieved successfully
 */
router.get('/coach',
  requireAuth,
  requireRole(['admin', 'coach']),
  async (req: any, res: any, next: any) => {
    try {
      // Get instructor data for the authenticated user
      const instructor = await db('instructors')
        .where('user_id', req.user.id)
        .first();

      if (!instructor) {
        const error: APIError = new Error('Instructor profile not found') as APIError;
        error.status = 404;
        error.code = 'INSTRUCTOR_NOT_FOUND';
        throw error;
      }

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());

      // My classes this month
      const myClasses = await db('class_instances as ci')
        .select([
          'ci.id',
          'ci.scheduled_date',
          'ci.capacity',
          'ci.available_spots',
          'ct.name as class_name',
          'ct.duration',
          db.raw('COUNT(b.id) as total_bookings')
        ])
        .join('class_schedules as cs', 'ci.class_schedule_id', 'cs.id')
        .join('class_types as ct', 'ci.class_type_id', 'ct.id')
        .leftJoin('bookings as b', 'ci.id', 'b.class_instance_id')
        .where('cs.instructor_id', instructor.id)
        .where('ci.scheduled_date', '>=', startOfMonth.toISOString())
        .groupBy([
          'ci.id', 'ci.scheduled_date', 'ci.capacity', 'ci.available_spots',
          'ct.name', 'ct.duration'
        ])
        .orderBy('ci.scheduled_date', 'desc');

      // Upcoming classes this week
      const upcomingClasses = await db('class_instances as ci')
        .select([
          'ci.id',
          'ci.scheduled_date',
          'ci.capacity',
          'ci.available_spots',
          'ct.name as class_name',
          'ct.duration'
        ])
        .join('class_schedules as cs', 'ci.class_schedule_id', 'cs.id')
        .join('class_types as ct', 'ci.class_type_id', 'ct.id')
        .where('cs.instructor_id', instructor.id)
        .where('ci.scheduled_date', '>=', now.toISOString())
        .where('ci.scheduled_date', '<', new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString())
        .orderBy('ci.scheduled_date', 'asc');

      // Student statistics
      const uniqueStudents = await db('bookings as b')
        .join('class_instances as ci', 'b.class_instance_id', 'ci.id')
        .join('class_schedules as cs', 'ci.class_schedule_id', 'cs.id')
        .where('cs.instructor_id', instructor.id)
        .where('b.created_at', '>=', startOfMonth.toISOString())
        .distinct('b.user_id')
        .count('* as count')
        .first();

      // Reviews for my classes
      const reviews = await db('reviews as r')
        .select([
          'r.rating',
          'r.comment',
          'r.created_at',
          'u.first_name',
          'u.last_name',
          'ct.name as class_name'
        ])
        .join('class_instances as ci', 'r.class_instance_id', 'ci.id')
        .join('class_schedules as cs', 'ci.class_schedule_id', 'cs.id')
        .join('users as u', 'r.user_id', 'u.id')
        .join('class_types as ct', 'ci.class_type_id', 'ct.id')
        .where('cs.instructor_id', instructor.id)
        .where('r.is_public', true)
        .orderBy('r.created_at', 'desc')
        .limit(10);

      // Average rating
      const avgRating = await db('reviews as r')
        .join('class_instances as ci', 'r.class_instance_id', 'ci.id')
        .join('class_schedules as cs', 'ci.class_schedule_id', 'cs.id')
        .where('cs.instructor_id', instructor.id)
        .avg('r.rating as avg_rating')
        .first();

      res.json({
        success: true,
        data: {
          instructor: {
            id: instructor.id,
            bio: instructor.bio,
            specialties: instructor.specialties,
            certifications: instructor.certifications,
            experience_years: instructor.experience_years,
            average_rating: Math.round((Number(avgRating?.avg_rating) || 0) * 100) / 100
          },
          overview: {
            classesThisMonth: myClasses.length,
            uniqueStudents: Number(uniqueStudents?.count || 0),
            upcomingClasses: upcomingClasses.length,
            totalReviews: reviews.length,
            averageRating: Math.round((Number(avgRating?.avg_rating) || 0) * 100) / 100
          },
          myClasses,
          upcomingClasses,
          recentReviews: reviews
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/dashboard/analytics:
 *   get:
 *     summary: Get detailed analytics (admin only)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [week, month, quarter, year]
 *         description: Analytics period
 *     responses:
 *       200:
 *         description: Analytics data retrieved successfully
 */
router.get('/analytics',
  requireAuth,
  requireRole('admin'),
  [query('period').optional().isIn(['week', 'month', 'quarter', 'year'])],
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

      const period = req.query.period || 'month';
      const now = new Date();
      let startDate: Date;

      switch (period) {
        case 'week':
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 7);
          break;
        case 'quarter':
          startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default: // month
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }

      // Bookings trend
      const bookingsTrend = await db('bookings')
        .select([
          db.raw('DATE(created_at) as date'),
          db.raw('COUNT(*) as count')
        ])
        .where('created_at', '>=', startDate.toISOString())
        .groupBy('date')
        .orderBy('date', 'asc');

      // Revenue trend
      const revenueTrend = await db('user_memberships as um')
        .select([
          db.raw('DATE(um.created_at) as date'),
          db.raw('SUM(mp.price) as revenue')
        ])
        .join('membership_plans as mp', 'um.membership_plan_id', 'mp.id')
        .where('um.created_at', '>=', startDate.toISOString())
        .groupBy('date')
        .orderBy('date', 'asc');

      // Class popularity
      const classPopularity = await db('class_instances as ci')
        .select([
          'ct.name',
          db.raw('COUNT(b.id) as total_bookings'),
          db.raw('AVG(ci.capacity - ci.available_spots) as avg_attendance'),
          db.raw('AVG(r.rating) as avg_rating')
        ])
        .join('class_types as ct', 'ci.class_type_id', 'ct.id')
        .leftJoin('bookings as b', 'ci.id', 'b.class_instance_id')
        .leftJoin('reviews as r', 'ci.id', 'r.class_instance_id')
        .where('ci.created_at', '>=', startDate.toISOString())
        .groupBy('ct.id', 'ct.name')
        .orderBy('total_bookings', 'desc');

      // Membership distribution
      const membershipDistribution = await db('user_memberships as um')
        .select([
          'mp.name',
          'mp.price',
          db.raw('COUNT(*) as count')
        ])
        .join('membership_plans as mp', 'um.membership_plan_id', 'mp.id')
        .where('um.status', 'active')
        .groupBy('mp.id', 'mp.name', 'mp.price')
        .orderBy('count', 'desc');

      res.json({
        success: true,
        data: {
          period,
          startDate: startDate.toISOString(),
          endDate: now.toISOString(),
          bookingsTrend,
          revenueTrend,
          classPopularity,
          membershipDistribution
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;