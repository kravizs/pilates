import { Router } from 'express';
import { body, query, param, validationResult } from 'express-validator';
import { db } from '@/config/database';
import { requireAuth, requireRole } from '@/middleware/auth';
import { APIError } from '@/types';
import { logger } from '@/utils/logger';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

const router = Router();

// MindBody API configuration
const MINDBODY_API_BASE = process.env.MINDBODY_API_BASE || 'https://api.mindbodyonline.com';
const MINDBODY_SITE_ID = process.env.MINDBODY_SITE_ID;
const MINDBODY_API_KEY = process.env.MINDBODY_API_KEY;
const MINDBODY_USER_TOKEN = process.env.MINDBODY_USER_TOKEN;

/**
 * @swagger
 * /api/mindbody/sync-classes:
 *   post:
 *     summary: Sync classes from MindBody (admin only)
 *     tags: [MindBody]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               start_date:
 *                 type: string
 *                 format: date
 *               end_date:
 *                 type: string
 *                 format: date
 *               location_ids:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Classes synced successfully
 */
router.post('/sync-classes',
  requireAuth,
  requireRole('admin'),
  [
    body('start_date').optional().isISO8601().withMessage('Invalid start date format'),
    body('end_date').optional().isISO8601().withMessage('Invalid end date format'),
    body('location_ids').optional().isArray().withMessage('Location IDs must be an array')
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

      if (!MINDBODY_API_KEY || !MINDBODY_SITE_ID) {
        const error: APIError = new Error('MindBody API credentials not configured') as APIError;
        error.status = 500;
        error.code = 'MINDBODY_CONFIG_ERROR';
        throw error;
      }

      const { start_date, end_date, location_ids } = req.body;

      // Default to next 30 days if no date range provided
      const startDate = start_date || new Date().toISOString().split('T')[0];
      const endDate = end_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // Call MindBody API to get classes
      const response = await axios.get(`${MINDBODY_API_BASE}/public/v6/class/classes`, {
        headers: {
          'Api-Key': MINDBODY_API_KEY,
          'SiteId': MINDBODY_SITE_ID,
          'Authorization': MINDBODY_USER_TOKEN ? `Bearer ${MINDBODY_USER_TOKEN}` : undefined
        },
        params: {
          StartDateTime: startDate,
          EndDateTime: endDate,
          LocationIds: location_ids?.join(','),
          limit: 200
        }
      });

      const classes = response.data.Classes || [];
      let syncedCount = 0;
      let errorCount = 0;

      for (const mbClass of classes) {
        try {
          // Check if class type exists, create if not
          let classType = await db('class_types')
            .where('mindbody_id', mbClass.ClassDescription.Id)
            .first();

          if (!classType) {
            classType = {
              id: uuidv4(),
              name: mbClass.ClassDescription.Name,
              description: mbClass.ClassDescription.Description || '',
              duration: mbClass.ClassDescription.Program?.Duration || 60,
              capacity: mbClass.MaxCapacity || 20,
              price: 0, // Will be updated based on pricing
              category: mbClass.ClassDescription.Category || 'General',
              difficulty_level: 'intermediate',
              equipment_needed: [],
              mindbody_id: mbClass.ClassDescription.Id,
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };

            await db('class_types').insert(classType);
          }

          // Check if instructor exists, create if not
          let instructor = null;
          if (mbClass.Staff && mbClass.Staff.length > 0) {
            const staff = mbClass.Staff[0];
            instructor = await db('instructors')
              .where('mindbody_id', staff.Id)
              .first();

            if (!instructor) {
              // Create a user account for the instructor
              const instructorUser = {
                id: uuidv4(),
                email: staff.Email || `instructor${staff.Id}@histudio.com`,
                password_hash: '', // Will need to be set up separately
                first_name: staff.FirstName || '',
                last_name: staff.LastName || '',
                phone: staff.MobilePhone || '',
                is_active: true,
                is_admin: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              };

              await db('users').insert(instructorUser);

              instructor = {
                id: uuidv4(),
                user_id: instructorUser.id,
                bio: staff.Bio || '',
                specialties: [],
                certifications: [],
                experience_years: 0,
                mindbody_id: staff.Id,
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              };

              await db('instructors').insert(instructor);
            }
          }

          // Check if class schedule exists, create if not
          let classSchedule = await db('class_schedules')
            .where('mindbody_id', mbClass.Id)
            .first();

          if (!classSchedule) {
            classSchedule = {
              id: uuidv4(),
              class_type_id: classType.id,
              instructor_id: instructor?.id || null,
              day_of_week: new Date(mbClass.StartDateTime).getDay(),
              start_time: new Date(mbClass.StartDateTime).toTimeString().split(' ')[0],
              end_time: new Date(mbClass.EndDateTime).toTimeString().split(' ')[0],
              location: mbClass.Location?.Name || 'Main Studio',
              capacity: mbClass.MaxCapacity || classType.capacity,
              price: 0, // Will be updated based on pricing
              mindbody_id: mbClass.Id,
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };

            await db('class_schedules').insert(classSchedule);
          }

          // Check if class instance exists, create if not
          const existingInstance = await db('class_instances')
            .where('mindbody_id', mbClass.Id)
            .where('scheduled_date', new Date(mbClass.StartDateTime).toISOString())
            .first();

          if (!existingInstance) {
            const classInstance = {
              id: uuidv4(),
              class_schedule_id: classSchedule.id,
              class_type_id: classType.id,
              scheduled_date: new Date(mbClass.StartDateTime).toISOString(),
              capacity: mbClass.MaxCapacity || classType.capacity,
              available_spots: (mbClass.MaxCapacity || classType.capacity) - (mbClass.TotalBooked || 0),
              status: mbClass.IsWaitlistAvailable ? 'waitlist_available' : 'scheduled',
              mindbody_id: mbClass.Id,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };

            await db('class_instances').insert(classInstance);
            syncedCount++;
          }

        } catch (classError) {
          logger.error(`Error syncing class ${mbClass.Id}:`, classError);
          errorCount++;
        }
      }

      logger.info(`MindBody sync completed: ${syncedCount} classes synced, ${errorCount} errors`);

      res.json({
        success: true,
        data: {
          total_classes: classes.length,
          synced_count: syncedCount,
          error_count: errorCount
        },
        message: `Synced ${syncedCount} classes from MindBody`
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        logger.error('MindBody API error:', error.response?.data || error.message);
        const apiError: APIError = new Error('MindBody API error') as APIError;
        apiError.status = error.response?.status || 500;
        apiError.code = 'MINDBODY_API_ERROR';
        apiError.details = error.response?.data || { message: error.message };
        next(apiError);
      } else {
        next(error);
      }
    }
  }
);

/**
 * @swagger
 * /api/mindbody/book-class:
 *   post:
 *     summary: Book class through MindBody API
 *     tags: [MindBody]
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
 *             properties:
 *               class_instance_id:
 *                 type: string
 *               mindbody_client_id:
 *                 type: string
 *               waitlist:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Class booked successfully
 */
router.post('/book-class',
  requireAuth,
  [
    body('class_instance_id').isUUID().withMessage('Invalid class instance ID'),
    body('mindbody_client_id').optional().isString(),
    body('waitlist').optional().isBoolean()
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

      const { class_instance_id, mindbody_client_id, waitlist = false } = req.body;

      // Get class instance with MindBody ID
      const classInstance = await db('class_instances as ci')
        .select([
          'ci.*',
          'ct.name as class_name',
          'cs.mindbody_id as schedule_mindbody_id'
        ])
        .join('class_types as ct', 'ci.class_type_id', 'ct.id')
        .join('class_schedules as cs', 'ci.class_schedule_id', 'cs.id')
        .where('ci.id', class_instance_id)
        .first();

      if (!classInstance) {
        const error: APIError = new Error('Class instance not found') as APIError;
        error.status = 404;
        error.code = 'CLASS_INSTANCE_NOT_FOUND';
        throw error;
      }

      if (!classInstance.mindbody_id) {
        const error: APIError = new Error('Class not synchronized with MindBody') as APIError;
        error.status = 400;
        error.code = 'CLASS_NOT_SYNCED';
        throw error;
      }

      // Check if user already has a booking
      const existingBooking = await db('bookings')
        .where('user_id', req.user.id)
        .where('class_instance_id', class_instance_id)
        .first();

      if (existingBooking) {
        const error: APIError = new Error('Already booked for this class') as APIError;
        error.status = 400;
        error.code = 'ALREADY_BOOKED';
        throw error;
      }

      if (!MINDBODY_API_KEY || !MINDBODY_SITE_ID) {
        const error: APIError = new Error('MindBody API credentials not configured') as APIError;
        error.status = 500;
        error.code = 'MINDBODY_CONFIG_ERROR';
        throw error;
      }

      // Make booking request to MindBody
      const bookingData = {
        ClientId: mindbody_client_id || req.user.mindbody_client_id,
        Classes: [{
          Id: classInstance.mindbody_id
        }],
        Waitlist: waitlist
      };

      const response = await axios.post(
        `${MINDBODY_API_BASE}/public/v6/class/addbookings`,
        bookingData,
        {
          headers: {
            'Api-Key': MINDBODY_API_KEY,
            'SiteId': MINDBODY_SITE_ID,
            'Authorization': MINDBODY_USER_TOKEN ? `Bearer ${MINDBODY_USER_TOKEN}` : undefined,
            'Content-Type': 'application/json'
          }
        }
      );

      const bookingResult = response.data;

      // Create local booking record
      const booking = {
        id: uuidv4(),
        user_id: req.user.id,
        class_instance_id: class_instance_id,
        status: waitlist ? 'waitlisted' : 'confirmed',
        payment_status: 'pending',
        mindbody_booking_id: bookingResult.Bookings?.[0]?.Id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await db('bookings').insert(booking);

      // Update available spots if not waitlisted
      if (!waitlist && classInstance.available_spots > 0) {
        await db('class_instances')
          .where('id', class_instance_id)
          .decrement('available_spots', 1);
      }

      logger.info(`Class booked through MindBody: ${class_instance_id} for user ${req.user.email}`);

      res.json({
        success: true,
        data: {
          booking_id: booking.id,
          mindbody_booking_id: booking.mindbody_booking_id,
          status: booking.status,
          class_name: classInstance.class_name,
          scheduled_date: classInstance.scheduled_date
        },
        message: waitlist ? 'Added to waitlist successfully' : 'Class booked successfully'
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        logger.error('MindBody booking error:', error.response?.data || error.message);
        const apiError: APIError = new Error('MindBody booking failed') as APIError;
        apiError.status = error.response?.status || 500;
        apiError.code = 'MINDBODY_BOOKING_ERROR';
        apiError.details = error.response?.data || { message: error.message };
        next(apiError);
      } else {
        next(error);
      }
    }
  }
);

/**
 * @swagger
 * /api/mindbody/cancel-booking:
 *   post:
 *     summary: Cancel booking through MindBody API
 *     tags: [MindBody]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - booking_id
 *             properties:
 *               booking_id:
 *                 type: string
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Booking canceled successfully
 */
router.post('/cancel-booking',
  requireAuth,
  [
    body('booking_id').isUUID().withMessage('Invalid booking ID'),
    body('reason').optional().isString().trim()
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

      const { booking_id, reason } = req.body;

      // Get booking with MindBody ID
      const booking = await db('bookings')
        .where('id', booking_id)
        .where('user_id', req.user.id)
        .first();

      if (!booking) {
        const error: APIError = new Error('Booking not found') as APIError;
        error.status = 404;
        error.code = 'BOOKING_NOT_FOUND';
        throw error;
      }

      if (booking.status === 'canceled') {
        const error: APIError = new Error('Booking already canceled') as APIError;
        error.status = 400;
        error.code = 'BOOKING_ALREADY_CANCELED';
        throw error;
      }

      if (!booking.mindbody_booking_id) {
        // Local booking only - update directly
        await db('bookings')
          .where('id', booking_id)
          .update({
            status: 'canceled',
            cancellation_reason: reason || 'User canceled',
            canceled_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
      } else {
        // Cancel through MindBody API
        if (!MINDBODY_API_KEY || !MINDBODY_SITE_ID) {
          const error: APIError = new Error('MindBody API credentials not configured') as APIError;
          error.status = 500;
          error.code = 'MINDBODY_CONFIG_ERROR';
          throw error;
        }

        await axios.post(
          `${MINDBODY_API_BASE}/public/v6/class/removebookings`,
          {
            BookingIds: [booking.mindbody_booking_id]
          },
          {
            headers: {
              'Api-Key': MINDBODY_API_KEY,
              'SiteId': MINDBODY_SITE_ID,
              'Authorization': MINDBODY_USER_TOKEN ? `Bearer ${MINDBODY_USER_TOKEN}` : undefined,
              'Content-Type': 'application/json'
            }
          }
        );

        // Update local booking
        await db('bookings')
          .where('id', booking_id)
          .update({
            status: 'canceled',
            cancellation_reason: reason || 'User canceled',
            canceled_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
      }

      // Increase available spots if was confirmed
      if (booking.status === 'confirmed') {
        await db('class_instances')
          .where('id', booking.class_instance_id)
          .increment('available_spots', 1);
      }

      logger.info(`Booking canceled through MindBody: ${booking_id} for user ${req.user.email}`);

      res.json({
        success: true,
        message: 'Booking canceled successfully'
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        logger.error('MindBody cancellation error:', error.response?.data || error.message);
        const apiError: APIError = new Error('MindBody cancellation failed') as APIError;
        apiError.status = error.response?.status || 500;
        apiError.code = 'MINDBODY_CANCELLATION_ERROR';
        apiError.details = error.response?.data || { message: error.message };
        next(apiError);
      } else {
        next(error);
      }
    }
  }
);

/**
 * @swagger
 * /api/mindbody/sync-status:
 *   get:
 *     summary: Get MindBody synchronization status
 *     tags: [MindBody]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sync status retrieved successfully
 */
router.get('/sync-status',
  requireAuth,
  requireRole('admin'),
  async (req: any, res: any, next: any) => {
    try {
      // Get sync statistics
      const [totalClasses] = await db('class_instances').count('* as count');
      const [syncedClasses] = await db('class_instances')
        .whereNotNull('mindbody_id')
        .count('* as count');
      
      const [totalBookings] = await db('bookings').count('* as count');
      const [syncedBookings] = await db('bookings')
        .whereNotNull('mindbody_booking_id')
        .count('* as count');

      const [totalInstructors] = await db('instructors').count('* as count');
      const [syncedInstructors] = await db('instructors')
        .whereNotNull('mindbody_id')
        .count('* as count');

      // Get last sync time (from most recent class instance with mindbody_id)
      const lastSync = await db('class_instances')
        .whereNotNull('mindbody_id')
        .orderBy('created_at', 'desc')
        .select('created_at')
        .first();

      // Check API connectivity
      let apiConnected = false;
      try {
        if (MINDBODY_API_KEY && MINDBODY_SITE_ID) {
          const response = await axios.get(`${MINDBODY_API_BASE}/public/v6/site/locations`, {
            headers: {
              'Api-Key': MINDBODY_API_KEY,
              'SiteId': MINDBODY_SITE_ID
            },
            timeout: 5000
          });
          apiConnected = response.status === 200;
        }
      } catch (error) {
        apiConnected = false;
      }

      res.json({
        success: true,
        data: {
          api_configured: !!(MINDBODY_API_KEY && MINDBODY_SITE_ID),
          api_connected: apiConnected,
          last_sync: lastSync?.created_at || null,
          statistics: {
            classes: {
              total: Number(totalClasses.count),
              synced: Number(syncedClasses.count),
              sync_percentage: Number(totalClasses.count) > 0 ? Math.round((Number(syncedClasses.count) / Number(totalClasses.count)) * 100) : 0
            },
            bookings: {
              total: Number(totalBookings.count),
              synced: Number(syncedBookings.count),
              sync_percentage: Number(totalBookings.count) > 0 ? Math.round((Number(syncedBookings.count) / Number(totalBookings.count)) * 100) : 0
            },
            instructors: {
              total: Number(totalInstructors.count),
              synced: Number(syncedInstructors.count),
              sync_percentage: Number(totalInstructors.count) > 0 ? Math.round((Number(syncedInstructors.count) / Number(totalInstructors.count)) * 100) : 0
            }
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/mindbody/webhook:
 *   post:
 *     summary: Handle MindBody webhook events
 *     tags: [MindBody]
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 */
router.post('/webhook',
  async (req: any, res: any, next: any) => {
    try {
      const { eventType, data } = req.body;

      logger.info(`MindBody webhook received: ${eventType}`);

      switch (eventType) {
        case 'class.booking.created':
          await handleBookingCreated(data);
          break;
        case 'class.booking.canceled':
          await handleBookingCanceled(data);
          break;
        case 'class.updated':
          await handleClassUpdated(data);
          break;
        case 'client.updated':
          await handleClientUpdated(data);
          break;
        default:
          logger.info(`Unhandled MindBody webhook event: ${eventType}`);
      }

      res.json({ success: true, message: 'Webhook processed' });
    } catch (error) {
      logger.error('MindBody webhook error:', error);
      next(error);
    }
  }
);

// Helper functions for webhook handling
async function handleBookingCreated(data: any) {
  try {
    // Update local booking if it exists
    if (data.BookingId && data.ClassId) {
      await db('bookings')
        .join('class_instances', 'bookings.class_instance_id', 'class_instances.id')
        .where('class_instances.mindbody_id', data.ClassId)
        .whereNull('bookings.mindbody_booking_id')
        .update({
          mindbody_booking_id: data.BookingId,
          status: 'confirmed',
          updated_at: new Date().toISOString()
        });
    }
  } catch (error) {
    logger.error('Error handling booking created webhook:', error);
  }
}

async function handleBookingCanceled(data: any) {
  try {
    if (data.BookingId) {
      await db('bookings')
        .where('mindbody_booking_id', data.BookingId)
        .update({
          status: 'canceled',
          canceled_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
    }
  } catch (error) {
    logger.error('Error handling booking canceled webhook:', error);
  }
}

async function handleClassUpdated(data: any) {
  try {
    if (data.ClassId) {
      // Update class instance capacity and availability
      await db('class_instances')
        .where('mindbody_id', data.ClassId)
        .update({
          capacity: data.MaxCapacity || undefined,
          available_spots: data.MaxCapacity ? (data.MaxCapacity - (data.TotalBooked || 0)) : undefined,
          updated_at: new Date().toISOString()
        });
    }
  } catch (error) {
    logger.error('Error handling class updated webhook:', error);
  }
}

async function handleClientUpdated(data: any) {
  try {
    if (data.ClientId) {
      // Update user mindbody_client_id if it matches
      await db('users')
        .where('mindbody_client_id', data.ClientId)
        .update({
          first_name: data.FirstName || undefined,
          last_name: data.LastName || undefined,
          email: data.Email || undefined,
          updated_at: new Date().toISOString()
        });
    }
  } catch (error) {
    logger.error('Error handling client updated webhook:', error);
  }
}

export default router;