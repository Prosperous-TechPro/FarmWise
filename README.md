# FarmWise

**Agricultural Management Platform**

A production-ready, multi-user progressive web application (PWA) designed to help farmers manage and monitor their agricultural enterprises including pig farming, maize farming, cassava farming, and tomato farming.

## Overview

FarmWise enables farmers to:

- Manage farm information and multiple farms
- Track fields and crop cycles
- Monitor livestock (pigs, cattle, etc.)
- Record daily activities and inputs
- Track expenses and production
- Monitor harvests and sales
- Calculate profitability metrics
- Maintain health and breeding records
- Receive alerts and notifications
- Generate reports
- Receive AI-assisted recommendations
- Perform AI-assisted image assessment

## Technology Stack

### Frontend
- **React** - UI framework
- **Vite** - Build tool and dev server
- **JavaScript** - Frontend language
- **PWA** - Progressive Web App technologies
- **IndexedDB** - Offline data storage

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **JavaScript** - Backend language

### Database
- **PostgreSQL** - Primary database
- **Prisma** - ORM

### External Services (Planned)
- Hubtel for SMS OTP
- Email service for OTP and notifications
- Image storage for uploaded images
- AI service for recommendations and image analysis
- Push notification service

## Project Structure

```
FarmWise/
├── frontend/              # React + Vite PWA application
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
│
├── backend/               # Express.js REST API
│   ├── src/
│   ├── package.json
│   └── .env (git-ignored)
│
├── database/              # Prisma ORM configuration
│   ├── prisma/
│   │   └── schema.prisma
│   └── package.json
│
├── docs/                  # Project documentation
│   ├── requirements/
│   ├── architecture/
│   ├── database/
│   ├── api/
│   ├── security/
│   ├── ui-ux/
│   ├── offline-sync/
│   ├── ai/
│   ├── testing/
│   └── deployment/
│
├── infrastructure/        # DevOps and deployment config
│
├── .env.example          # Environment variable template
├── .gitignore            # Git ignore rules
├── package.json          # Root package configuration
└── README.md             # This file
```

## Quick Start

For detailed setup instructions, see **[QUICK_START.md](./QUICK_START.md)**

**TL;DR:**
```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

Access frontend at `http://localhost:5173` and backend API at `http://localhost:3000/api/v1`

## Sprint 1 Foundation Status

✅ **Sprint 1 Complete:** Configuration management, logging, request tracing, error handling, and UI components foundation established.

- **Sprint 1 Report:** [SPRINT_1_COMPLETION_REPORT.md](./SPRINT_1_COMPLETION_REPORT.md)
- **Verification Checklist:** [SPRINT_1_VERIFICATION_CHECKLIST.md](./SPRINT_1_VERIFICATION_CHECKLIST.md)
- **Quick Start Guide:** [QUICK_START.md](./QUICK_START.md)

### Prerequisites

- Node.js 16+
- npm or yarn
- PostgreSQL 12+ (for production)
- Git

### Development Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd FarmWise
   ```

2. **Copy environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your development configuration.

3. **Install dependencies:**
   ```bash
   npm run setup
   ```
   This installs dependencies for all workspaces (frontend, backend, database).

4. **Start development servers:**
   
   In separate terminals:

   **Terminal 1 - Backend:**
   ```bash
   cd backend
   npm run dev
   ```
   Backend runs on `http://localhost:3000`

   **Terminal 2 - Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend runs on `http://localhost:5173`

5. **Verify connectivity:**
   
   Navigate to `http://localhost:5173` in your browser. The frontend should successfully communicate with the backend health-check endpoint.

### Database Setup

Database setup and migrations are handled during Sprint 1. Currently, Prisma is configured but no schema exists.

## Architecture Principles

### Separation of Concerns
- Clear separation between UI, business logic, data access, and API communication
- Modular domain architecture for each major feature

### Modularity
Domain modules include:
- auth, users, farms, workers, livestock, crops, activities, inputs, finance, production, sales, notifications, reports, ai, sync

### Extensibility
- Architecture designed to support additional livestock species and crops
- Extensible domain concepts for future feature additions

### Security by Design
- Backend-enforced authorization (not just frontend hiding)
- Proper authentication and session management
- Environment-based secrets management
- No hardcoded credentials

### Offline-First
- Progressive Web App capabilities
- Designed to support offline operation with sync capabilities

### API Versioning
- Versioned API: `/api/v1/`
- Breaking changes introduced through new API versions

## User Roles

The system supports:
- **SUPERADMIN** - Full system access
- **ADMIN** - Administrative access (equal to SUPERADMIN currently)
- **FARM_OWNER** - Can manage multiple farms and add workers
- **WORKER** - Limited access based on assigned permissions

**Important:** Authorization is enforced at the backend level, not just frontend.

## Multi-Farm / Data Isolation

- A farm owner can manage multiple farms
- Farm records are properly isolated
- Every protected resource verifies: authenticated user + role + farm membership/ownership + required permission

## Development Workflow

### Branches
- `main` - Production-ready releases
- `develop` - Development branch
- `feature/*` - Feature branches
- `bugfix/*` - Bug fix branches

### Commits
- Use meaningful commit messages
- Never commit `.env`, API keys, passwords, or credentials

### Testing
- Unit tests for business logic
- Integration tests for API endpoints
- Tests are run as part of the development workflow

## API Endpoints

### Health Check
- `GET /api/v1/health` - Backend health status

(Additional endpoints documented in future sprints)

## Environment Variables

Create a `.env` file based on `.env.example`. Key variables:

```
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://...
JWT_SECRET=...
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

Never commit `.env` to version control.

## Documentation

- [Architecture Overview](docs/architecture/ARCHITECTURE.md)
- [Database Design](docs/database/DATABASE.md)
- [API Documentation](docs/api/API.md)
- [Security Guidelines](docs/security/SECURITY.md)
- [UI/UX Guidelines](docs/ui-ux/UI_UX.md)

## Sprint-Based Development

FarmWise development follows a sprint-based approach:

- **Prompt 0** - Foundation and initialization (this phase)
- **Prompt 1** - Sprint 1 (planned)
- **Prompt 2** - Sprint 2 (planned)
- ...

Each sprint builds on the established foundation without redesigning core architecture.

## Current Status

✅ Prompt 0 - Foundation initialized
- Project structure created
- Frontend scaffold (React + Vite)
- Backend scaffold (Express + Node.js)
- Prisma configuration prepared
- PWA foundation ready
- Environment configuration template
- Git configuration ready
- Documentation structure created

⏳ Upcoming - Sprint 1
- Authentication system
- User management
- Farm management
- Initial UI implementation

## Contributing

(Guidelines to be established in future phases)

## License

UNLICENSED - Proprietary software

## Support

For questions or issues, please refer to the documentation in the `docs/` directory.

---

**Last Updated:** Prompt 0 Foundation
**Next Sprint:** Prompt 1 - Authentication & User Management
