# FarmWise Backend

Express.js REST API for the FarmWise agricultural management platform.

## Quick Start

### Prerequisites
- Node.js 16+
- PostgreSQL (for production)

### Installation

```bash
cd backend
npm install
```

### Development

```bash
# Run with auto-reload
npm run dev
```

Backend will start on `http://localhost:3000` by default.

### Environment Variables

Copy `.env.example` from root and configure:

```bash
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/farmwise_db
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
JWT_SECRET=your_secret_key
```

## API Structure

```
src/
├── server.js           # Main Express app setup
├── middleware/         # Express middleware
│   ├── errorHandler.js
│   └── logger.js
├── routes/             # API route handlers
│   ├── health.js       # Health check endpoint
│   └── (more in future sprints)
├── controllers/        # Business logic (future)
├── services/           # Domain services (future)
├── models/             # Data models (future)
└── utils/              # Utility functions (future)
```

## Endpoints

### Health Check
- `GET /api/v1/health` - Basic health status
- `GET /api/v1/health/detailed` - Detailed system health

(Additional endpoints to be implemented in future sprints)

## Architecture Notes

- Uses ES modules (import/export)
- Async error handling with wrapper middleware
- CORS configured for frontend communication
- Rate limiting enabled for API endpoints
- Helmet for security headers
- Structured error responses

## Testing

```bash
npm test
```

## Linting

```bash
npm run lint
npm run format
```

## Production Deployment

```bash
npm start
```

Ensure all environment variables are properly configured before deployment.
