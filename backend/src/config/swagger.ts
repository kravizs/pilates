import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Hi Studio API',
      version: '1.0.0',
      description: 'Premium fitness/wellness studio management system API',
      contact: {
        name: 'Hi Studio',
        email: 'api@histudio.com'
      }
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://api.histudio.com' 
          : `http://localhost:${process.env.PORT || 5000}`,
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['email', 'first_name', 'last_name'],
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            first_name: { type: 'string' },
            last_name: { type: 'string' },
            phone: { type: 'string' },
            preferred_language: { type: 'string', enum: ['en', 'fr', 'es'] },
            is_admin: { type: 'boolean' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          }
        },
        ClassType: {
          type: 'object',
          required: ['name', 'duration_minutes', 'max_capacity', 'price'],
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            description: { type: 'string' },
            duration_minutes: { type: 'integer' },
            max_capacity: { type: 'integer' },
            difficulty_level: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'] },
            price: { type: 'number' },
            image_url: { type: 'string' },
            equipment_needed: { type: 'array', items: { type: 'string' } },
            is_active: { type: 'boolean' }
          }
        },
        Booking: {
          type: 'object',
          required: ['user_id', 'class_instance_id'],
          properties: {
            id: { type: 'string', format: 'uuid' },
            user_id: { type: 'string', format: 'uuid' },
            class_instance_id: { type: 'string', format: 'uuid' },
            booking_status: { type: 'string', enum: ['confirmed', 'cancelled', 'completed', 'no_show'] },
            payment_status: { type: 'string', enum: ['pending', 'paid', 'refunded'] },
            payment_amount: { type: 'number' },
            created_at: { type: 'string', format: 'date-time' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            status: { type: 'integer' },
            message: { type: 'string' },
            code: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts']
};

const specs = swaggerJSDoc(options);

export function setupSwagger(app: Express): void {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customSiteTitle: 'Hi Studio API Documentation'
  }));
}