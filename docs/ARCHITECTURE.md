# FarmWise Architecture

## Overview

FarmWise is a progressive web application (PWA) designed for agricultural management. It uses a three-tier architecture with clear separation of concerns:

```
┌─────────────────┐
│  React PWA      │
│  (Frontend)     │
└────────┬────────┘
         │ HTTPS
         ↓
┌─────────────────┐
│  Express API    │
│  (Backend)      │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  PostgreSQL     │
│  (Database)     │
└─────────────────┘
```

## Technology Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **JavaScript** - Language
- **PWA** - Progressive Web App capabilities
- **IndexedDB** - Offline data persistence
- **Service Workers** - Offline support

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **JavaScript** - Language
- **Helmet** - Security headers
- **CORS** - Cross-origin requests
- **Rate Limiting** - DDoS protection

### Database
- **PostgreSQL** - Relational database
- **Prisma** - ORM

### External Services
- **Hubtel** - SMS OTP
- **Email Service** - Email OTP and notifications
- **Storage** - Image/file uploads
- **AI Service** - Recommendations and image analysis
- **Push Notifications** - Real-time alerts

## Project Structure

```
FarmWise/
│
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   ├── manifest.json (PWA manifest)
│   │   ├── sw.js (Service worker)
│   │   └── assets/
│   │
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── main.jsx
│   │   ├── index.css
│   │   ├── components/
│   │   ├── pages/
│   │   ├── utils/
│   │   ├── services/ (API communication)
│   │   └── store/ (State management - future)
│   │
│   ├── vite.config.js
│   ├── package.json
│   └── .env
│
├── backend/
│   ├── src/
│   │   ├── server.js
│   │   ├── middleware/
│   │   │   ├── errorHandler.js
│   │   │   ├── logger.js
│   │   │   └── auth.js (future)
│   │   │
│   │   ├── routes/
│   │   │   ├── health.js
│   │   │   ├── auth.js (future)
│   │   │   ├── farms.js (future)
│   │   │   └── (more...)
│   │   │
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── models/
│   │   └── utils/
│   │
│   ├── package.json
│   └── .env
│
├── database/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   │
│   ├── package.json
│   └── seed.js (future)
│
├── docs/
│   ├── REQUIREMENTS.md
│   ├── ARCHITECTURE.md
│   ├── database/
│   ├── api/
│   ├── security/
│   └── (more...)
│
└── infrastructure/
    ├── docker/
    ├── kubernetes/
    └── ci-cd/
```

## Core Principles

### 1. Separation of Concerns
- **Frontend** - Handles UI/UX and user interaction
- **Backend** - Handles business logic and API
- **Database** - Handles data persistence

### 2. Modularity
Each domain (auth, farms, livestock, crops, etc.) is independent and maintainable.

### 3. Extensibility
Architecture designed to support:
- Multiple livestock species
- Multiple crop types
- Additional features without redesign
- Different deployment scenarios

### 4. Security by Design
- Authentication required for sensitive operations
- Authorization enforced at backend
- Environment-based secrets
- Rate limiting and helmet headers
- Input validation on both client and server

### 5. Offline-First
- PWA with service worker
- IndexedDB for local storage
- Sync queue for pending changes
- Conflict resolution strategy

### 6. API Versioning
- `/api/v1/` - Current version
- Future versions as `/api/v2/`, etc.
- Allows safe evolution without breaking clients

## Data Flow

### Create Operation
```
User Input
  ↓
Frontend Validation
  ↓
API Request (POST)
  ↓
Backend Validation
  ↓
Business Logic
  ↓
Database Write
  ↓
Response to Frontend
  ↓
UI Update
```

### Offline Operation
```
User Action
  ↓
Frontend Validation
  ↓
IndexedDB Write
  ↓
Add to Sync Queue
  ↓
UI Shows "Pending"
  ↓
Network Available?
  ↓ Yes
  Sync Dequeuer
  ↓
Backend API Call
  ↓
Update IndexedDB
  ↓
Update UI
```

## Multi-Tenancy / Farm Isolation

### Request Flow
```
Authenticated User
  ↓
Extract User ID
  ↓
Get User's Farms
  ↓
Verify Requested Farm in User's Farms
  ↓
Apply Farm Filter to Query
  ↓
Return Results (Farm-Isolated Data)
```

Every query must include farm isolation logic.

## Authentication Flow

### Current State (Prompt 0)
- Framework prepared
- No authentication implemented

### Future (Sprint 1)
```
User Registration/Login
  ↓
Email/SMS OTP Verification
  ↓
JWT Token Generation
  ↓
Token Storage in Secure Cookie/LocalStorage
  ↓
API Requests with Authorization Header
  ↓
Backend Token Validation
  ↓
Authorized Response
```

## Error Handling

### Frontend
- User-friendly error messages
- Form validation feedback
- Network error handling
- Offline indicators

### Backend
```json
{
  "success": false,
  "message": "User-friendly message",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### Database
- Transaction support for data consistency
- Referential integrity constraints
- Audit trails for important operations

## Performance Optimization

### Frontend
- Code splitting by route
- Lazy loading of components
- Image optimization
- CSS-in-JS bundling
- Caching strategies

### Backend
- Database indexing
- Query optimization
- Connection pooling
- Caching layer (future)
- CDN for static assets (future)

### Database
- Proper normalization
- Strategic indexes
- Query planning
- Archive strategy for old records

## Testing Strategy

### Unit Tests
- Utility functions
- Service methods
- Business logic

### Integration Tests
- API endpoints
- Database operations
- Service interactions

### E2E Tests
- User workflows
- Cross-system operations
- Offline sync

### Security Tests
- Authorization checks
- Input validation
- Authentication flows

## Deployment

### Development
```bash
npm run dev  # Runs both frontend and backend
```

### Production
```bash
npm run build  # Builds both frontend and backend
npm start      # Starts production server
```

### Environment Management
- `.env` files for each environment
- Environment-specific secrets
- Configuration management
- Feature flags (future)

---

**Last Updated:** Prompt 0 Foundation
**Next Update:** Sprint 1 - Authentication & User Management
