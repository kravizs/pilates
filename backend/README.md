# Hi Studio Backend - Installation & Setup Guide

## 🚀 Quick Start

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Setup environment variables:**
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` with your actual configuration values.

4. **Setup PostgreSQL Database:**
   - Create a PostgreSQL database named `hi_studio_db`
   - Update database credentials in `.env`

5. **Run database migrations:**
   ```bash
   npm run migrate
   ```

6. **Seed initial data (optional):**
   ```bash
   npm run seed
   ```

7. **Start development server:**
   ```bash
   npm run dev
   ```

The API will be available at: `http://localhost:5000`
API Documentation at: `http://localhost:5000/api-docs`
Health Check at: `http://localhost:5000/health`

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Database and app configuration
│   ├── controllers/     # Route controllers (business logic)
│   ├── middleware/      # Custom middleware (auth, validation, etc.)
│   ├── models/          # Database models and schemas
│   ├── routes/          # API route definitions
│   ├── services/        # Business services (email, socket, etc.)
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions and helpers
│   └── server.ts        # Main application entry point
├── migrations/          # Database migration files
├── seeds/              # Database seed files
├── uploads/            # File upload storage
├── logs/              # Application logs
└── dist/              # Compiled JavaScript (production)
```

## 🔧 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run test suite
- `npm run migrate` - Run database migrations
- `npm run migrate:rollback` - Rollback last migration
- `npm run seed` - Run database seeds
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

## 🌐 API Endpoints Overview

### Authentication (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `GET /profile` - Get user profile
- `POST /logout` - User logout

### Classes (`/api/classes`)
- `GET /types` - Get class types
- `GET /instances` - Get class instances
- `POST /types` - Create class type [ADMIN]
- `PUT /types/:id` - Update class type [ADMIN]

### Bookings (`/api/bookings`)
- `GET /` - Get user bookings
- `POST /` - Create booking
- `DELETE /:id` - Cancel booking

### Users (`/api/users`)
- `GET /` - Get all users [ADMIN]
- `GET /:id` - Get user details [ADMIN]
- `PUT /:id` - Update user [ADMIN]

### Additional Routes
- Memberships (`/api/memberships`)
- Instructors (`/api/instructors`)
- Reviews (`/api/reviews`)
- Content (`/api/content`)
- Dashboard (`/api/dashboard`)
- Payments (`/api/payments`)
- Waitlist (`/api/waitlist`)
- MindBody (`/api/mindbody`)

## 🔒 Authentication

The API uses JWT (JSON Web Tokens) for authentication:

1. Register/Login to receive a JWT token
2. Include token in requests: `Authorization: Bearer <your_token>`
3. Token expires in 24 hours by default

## 👤 User Roles

- **Client** - Regular users who book classes
- **Coach** - Instructors who can view their classes
- **Admin** - Full access to all endpoints

## 🔐 Environment Configuration

Key environment variables to configure:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/hi_studio_db

# JWT
JWT_SECRET=your-super-secure-secret-key
JWT_EXPIRES_IN=24h

# Email (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Payment (Stripe)
STRIPE_SECRET_KEY=sk_test_your_stripe_key

# MindBody Integration
MINDBODY_API_KEY=your_api_key
MINDBODY_ENABLED=false
```

## 🐳 Docker Support (Coming Soon)

Docker configuration will be added for easy deployment.

## 📚 API Documentation

Interactive API documentation is available via Swagger UI at:
`http://localhost:5000/api-docs`

## 🧪 Testing

Run tests with:
```bash
npm test
```

## 📝 Logging

Logs are written to:
- `logs/app.log` - All application logs
- `logs/error.log` - Error logs only
- Console output in development

## 🚀 Production Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Start production server:
   ```bash
   npm start
   ```

## 🤝 Integration with Frontend

This backend is designed to work with the Hi Studio Next.js frontend. The API endpoints match the expected frontend integration patterns.

## 📞 Support

For issues or questions, please check the documentation or create an issue in the repository.