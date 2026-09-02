# FarmWise API Documentation

## Overview

FarmWise uses a RESTful API with versioning. All endpoints use the `/api/v1/` prefix.

**Base URL:** `http://localhost:3000/api/v1` (development)

## API Response Format

All API responses follow a consistent structure:

### Success Response
```json
{
  "success": true,
  "data": {
    "id": "123",
    "name": "Farm Name"
  },
  "message": "Optional message"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

## Authentication

Currently not implemented. Will be added in Sprint 1.

## Health Check Endpoints

### Basic Health Check
```
GET /api/v1/health
```

Returns basic system status.

**Response:**
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2025-01-01T12:00:00Z",
  "uptime": 3600,
  "environment": "development",
  "version": "0.0.1",
  "api": {
    "version": "v1",
    "baseUrl": "http://localhost:3000/api/v1"
  },
  "services": {
    "database": "pending",
    "cache": "not-configured",
    "storage": "not-configured"
  },
  "message": "FarmWise backend is running"
}
```

### Detailed Health Check
```
GET /api/v1/health/detailed
```

Returns detailed system information including memory usage.

**Response:**
```json
{
  "success": true,
  "timestamp": "2025-01-01T12:00:00Z",
  "system": {
    "uptime": 3600,
    "memory": {
      "rss": 12345678,
      "heapTotal": 87654321,
      "heapUsed": 45678901,
      "external": 1234567
    },
    "environment": "development"
  },
  "api": {
    "version": "v1",
    "status": "operational"
  },
  "features": {
    "authentication": "not-implemented",
    "database": "not-implemented",
    "notifications": "not-implemented",
    "ai": "not-implemented",
    "sync": "not-implemented"
  }
}
```

## Endpoints by Sprint

### Sprint 1 - Authentication & User Management
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/verify-otp`
- `POST /api/v1/auth/refresh-token`
- `POST /api/v1/auth/logout`
- `GET /api/v1/users/profile`
- `PUT /api/v1/users/profile`

### Sprint 2 - Farm Management
- `GET /api/v1/farms`
- `POST /api/v1/farms`
- `GET /api/v1/farms/:farmId`
- `PUT /api/v1/farms/:farmId`
- `GET /api/v1/farms/:farmId/fields`
- `POST /api/v1/farms/:farmId/fields`

### Sprint 3 - Livestock Management
- `GET /api/v1/farms/:farmId/livestock`
- `POST /api/v1/farms/:farmId/livestock`
- `GET /api/v1/farms/:farmId/livestock/:livestockId`
- `PUT /api/v1/farms/:farmId/livestock/:livestockId`
- `GET /api/v1/farms/:farmId/livestock/:livestockId/health`
- `GET /api/v1/farms/:farmId/livestock/:livestockId/breeding`

### Sprint 4 - Crop Management
- `GET /api/v1/farms/:farmId/crops`
- `POST /api/v1/farms/:farmId/crops`
- `GET /api/v1/farms/:farmId/crops/:cropId`
- `GET /api/v1/farms/:farmId/crops/:cropId/cycles`
- `GET /api/v1/farms/:farmId/production`

### Sprint 5 - Finance Tracking
- `GET /api/v1/farms/:farmId/expenses`
- `POST /api/v1/farms/:farmId/expenses`
- `GET /api/v1/farms/:farmId/revenue`
- `GET /api/v1/farms/:farmId/profitability`

### Sprint 6 - Sales & Notifications
- `GET /api/v1/farms/:farmId/sales`
- `POST /api/v1/farms/:farmId/sales`
- `GET /api/v1/notifications`
- `PUT /api/v1/notifications/:notificationId`

### Sprint 7 - AI & Reporting
- `POST /api/v1/ai/analyze-image`
- `GET /api/v1/ai/recommendations/:farmId`
- `GET /api/v1/farms/:farmId/reports`

## Error Codes

### Common HTTP Status Codes
- `200 OK` - Request successful
- `201 Created` - Resource created
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not authorized
- `404 Not Found` - Resource not found
- `409 Conflict` - Data conflict (e.g., duplicate)
- `500 Internal Server Error` - Server error
- `503 Service Unavailable` - Service down

## Rate Limiting

API endpoints are rate-limited to prevent abuse:
- **General endpoints:** 100 requests per 15 minutes per IP
- **Authentication endpoints:** 5 requests per minute (future)
- **File uploads:** 10 requests per hour (future)

## CORS Policy

CORS is enabled for:
- `http://localhost:5173` (development frontend)
- Production domains (configured via environment variables)

## Pagination

Large result sets are paginated. Request parameters:
```
?page=1&limit=20&sort=createdAt&order=desc
```

Response includes:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

## Filtering

Query parameters support filtering. Example:
```
GET /api/v1/farms?status=active&region=north
```

## Search

Full-text search on text fields. Example:
```
GET /api/v1/farms?search=dairy%20farm
```

---

**Last Updated:** Prompt 0
**Next Update:** Sprint 1 - Detailed endpoint specifications
