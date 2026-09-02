# FarmWise Quick Start Guide

## Prerequisites
- Node.js 16+ and npm
- PostgreSQL (for database features in future sprints)

## Installation

### 1. Install Backend Dependencies
```bash
cd backend
npm install
```

### 2. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

### 3. Install Database Dependencies
```bash
cd ../database
npm install
```

## Configuration

### 1. Backend Environment
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your settings:
```
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=your-secret-key-min-32-characters
# Add other settings as needed
```

### 2. Frontend Environment (Optional)
```bash
cd ../frontend
cp .env.example .env.local
```

Default values will work for development:
```
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

## Running the Application

### Option 1: Run Both Simultaneously

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

### Option 2: Run Individual Components

**Backend Only:**
```bash
cd backend
npm run dev
# Server runs on http://localhost:3000
# API available at http://localhost:3000/api/v1
```

**Frontend Only:**
```bash
cd frontend
npm run dev
# App runs on http://localhost:5173
```

## Verification

1. **Backend Health Check:**
   ```
   GET http://localhost:3000/api/v1/health
   ```
   Should return:
   ```json
   {
     "success": true,
     "message": "API is healthy",
     "version": "1.0.0",
     "timestamp": "2025-...",
     "environment": "development"
   }
   ```

2. **Frontend Access:**
   Open browser and navigate to `http://localhost:5173`
   - You should see the FarmWise landing page
   - Status card should show "✓ Connected" in green

## Available Scripts

### Backend
```bash
npm run dev      # Start development server with auto-reload
npm start        # Start production server
npm test         # Run tests (after jest is installed)
npm run lint     # Run ESLint
npm run format   # Format code with Prettier
```

### Frontend
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
npm run format   # Format code with Prettier
```

### Database
```bash
npm run migrate       # Run pending migrations
npm run migrate:deploy # Deploy migrations (CI/CD)
npm run migrate:reset # Reset database (dev only!)
npm run generate      # Generate Prisma client
npm run studio        # Open Prisma Studio (GUI)
```

## Architecture Overview

### Backend (http://localhost:3000)
- Express.js server
- Centralized configuration management
- Structured logging
- Request ID tracking
- Security: Helmet, CORS, Rate limiting
- Error handling middleware

### Frontend (http://localhost:5173)
- React 18 with Vite
- Progressive Web App (PWA)
- Service Worker for offline support
- Centralized API client
- Error boundaries
- Loading & empty states
- Mobile-responsive design

### Database
- PostgreSQL with Prisma ORM
- Migrations support
- Schema templates (no models yet)

## Troubleshooting

### Backend won't start
```
Error: Cannot find module
→ Run: cd backend && npm install

Error: PORT 3000 already in use
→ Change PORT in .env or kill existing process

Error: Configuration validation failed
→ Check .env file has required settings
```

### Frontend won't compile
```
Error: VITE_API_BASE_URL is not configured
→ Vite will use default: http://localhost:3000/api/v1
→ Or set VITE_API_BASE_URL in .env.local

Error: ReactDOM not found
→ Already fixed in Sprint 1, but run: npm install react-dom
```

### API Connection Issues
```
GET /api/v1/health returns 404
→ Backend is not running
→ Backend is running on wrong port
→ Check FRONTEND_URL in backend .env

CORS errors in browser console
→ Check CORS_ORIGIN in backend .env
→ Should match frontend URL exactly

Timeout errors
→ Backend server is not responding
→ Check backend logs for errors
```

## Development Workflow

1. **Make backend changes:**
   - Edit files in `backend/src/`
   - Server automatically reloads with `npm run dev`
   - Check logs in terminal

2. **Make frontend changes:**
   - Edit files in `frontend/src/`
   - Vite automatically reloads in browser
   - Check browser console for errors

3. **Add new endpoints:**
   - Create controller in `backend/src/controllers/`
   - Create service in `backend/src/services/`
   - Create route in `backend/src/routes/`
   - Register route in `backend/src/app.js`

4. **Add new pages:**
   - Create component in `frontend/src/pages/`
   - Add route in `frontend/src/routes/`
   - Use API client: `await apiClient.get('/endpoint')`

## Testing

### Backend Tests (TODO - requires Jest installation)
```bash
cd backend
npm install --save-dev jest
npm test
```

See `backend/src/routes/health.test.js` for test examples.

### Frontend Tests (TODO - requires Testing Library)
```bash
cd frontend
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest
npm run test
```

## Production Deployment

### Environment Variables
1. Set `NODE_ENV=production` in backend .env
2. Update database connection to production database
3. Set strong `JWT_SECRET`
4. Set appropriate `CORS_ORIGIN` for production domain
5. Configure email service (Gmail, SendGrid, etc.)
6. Configure SMS service (Hubtel)
7. Set feature flags as needed

### Build Frontend
```bash
cd frontend
npm run build
# Output in frontend/dist/
```

### Start Backend (Production)
```bash
cd backend
npm start
```

## Documentation

- [Sprint 1 Completion Report](./SPRINT_1_COMPLETION_REPORT.md)
- [Sprint 1 Verification Checklist](./SPRINT_1_VERIFICATION_CHECKLIST.md)
- [Architecture](./docs/ARCHITECTURE.md)
- [API Documentation](./docs/API.md)
- [Security Guide](./docs/SECURITY.md)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the relevant documentation file
3. Check terminal/console logs
4. Verify all environment variables are set correctly

---

**Happy Farming with FarmWise! 🌾**
