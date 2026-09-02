# Authentication System - Quick Start Guide

## 1. Setup Database Schema

### Option A: Fresh Database
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Run Prisma migrations
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate
```

### Option B: Existing Database
```bash
# Pull current schema from database
npx prisma db pull

# Generate Prisma Client
npx prisma generate
```

## 2. Configure Environment

Create `.env` file in `backend/` directory:

```env
# App
NODE_ENV=development
PORT=3000
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/farmwise

# JWT
JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# OTP
OTP_EXPIRY_MINUTES=10
OTP_MAX_ATTEMPTS=5
OTP_LENGTH=6

# Email (Gmail example)
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@farmwise.com

# SMS (Hubtel)
HUBTEL_API_KEY=your-api-key
HUBTEL_CLIENT_ID=your-client-id
HUBTEL_SMS_FROM=FarmWise
```

### Generate Secure Secrets
```bash
# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate JWT_REFRESH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 3. Initialize Database with Seed Data

### Create Seed Script

Create `backend/prisma/seed.js`:

```javascript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create roles
  const superadminRole = await prisma.role.upsert({
    where: { name: 'SUPERADMIN' },
    update: {},
    create: { name: 'SUPERADMIN', description: 'System administrator' },
  });

  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: { name: 'ADMIN', description: 'Farm administrator' },
  });

  const farmOwnerRole = await prisma.role.upsert({
    where: { name: 'FARM_OWNER' },
    update: {},
    create: { name: 'FARM_OWNER', description: 'Farm owner' },
  });

  const workerRole = await prisma.role.upsert({
    where: { name: 'WORKER' },
    update: {},
    create: { name: 'WORKER', description: 'Farm worker' },
  });

  console.log('✓ Roles created');

  // Create permissions (example)
  const permissions = [
    { code: 'CREATE_FARM', description: 'Create new farm' },
    { code: 'READ_FARM', description: 'View farm details' },
    { code: 'UPDATE_FARM', description: 'Update farm information' },
    { code: 'DELETE_FARM', description: 'Delete farm' },
    { code: 'CREATE_CROP', description: 'Create crop record' },
    { code: 'MANAGE_USERS', description: 'Manage system users' },
    { code: 'VIEW_REPORTS', description: 'View system reports' },
    { code: 'EXPORT_DATA', description: 'Export farm data' },
  ];

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { code: perm.code },
      update: {},
      create: perm,
    });
  }

  console.log('✓ Permissions created');

  // Assign permissions to roles
  const farmOwnerPerms = await prisma.permission.findMany({
    where: { code: { in: ['CREATE_FARM', 'READ_FARM', 'UPDATE_FARM', 'CREATE_CROP', 'VIEW_REPORTS', 'EXPORT_DATA'] } },
  });

  for (const perm of farmOwnerPerms) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: farmOwnerRole.id, permissionId: perm.id } },
      update: {},
      create: { roleId: farmOwnerRole.id, permissionId: perm.id },
    });
  }

  console.log('✓ Role-Permission mappings created');
  console.log('Database seeded successfully! ✓');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### Update `package.json`

Add seed script to `package.json`:

```json
{
  "prisma": {
    "seed": "node prisma/seed.js"
  }
}
```

### Run Seed

```bash
npx prisma db seed
```

## 4. Start Development Server

```bash
# Start backend
npm run dev

# In another terminal, test health endpoint
curl http://localhost:3000/api/v1/health
```

Expected response:
```json
{
  "success": true,
  "message": "FarmWise API is running",
  "version": "v1",
  "timestamp": "2024-01-15T10:30:00Z",
  "environment": "development"
}
```

## 5. Test Authentication Endpoints

### 1. Register User

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "phone": "0551234567",
    "firstName": "John",
    "lastName": "Doe",
    "password": "SecurePass123!",
    "confirmPassword": "SecurePass123!",
    "verificationMethod": "EMAIL"
  }'
```

Response includes `userId` and OTP sent to email.

### 2. Verify OTP (Check Email for Code)

```bash
curl -X POST http://localhost:3000/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "clx...",
    "code": "123456",
    "channel": "EMAIL"
  }'
```

### 3. Login

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

Response includes `accessToken` and `refreshToken`.

### 4. Get Current User

```bash
curl -X GET http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer <accessToken>"
```

## 6. Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution**: Ensure PostgreSQL is running and DATABASE_URL is correct

### OTP Email Not Sent
- Check EMAIL_* environment variables are correct
- Enable "Less secure app access" for Gmail
- Use app-specific password for Gmail 2FA accounts
- Check Nodemailer logs in console

### JWT Token Errors
```
"Invalid token" or "Token has expired"
```
**Solution**: 
- Ensure JWT_SECRET and JWT_REFRESH_SECRET are set in .env
- Use `refresh` endpoint to get new access token
- Re-login to get new tokens

### Rate Limiting (429 Error)
```
"Too many requests from this IP"
```
**Solution**: Wait 15 minutes or change IP address

## 7. File Structure Reference

```
backend/
├── src/
│   ├── controllers/
│   │   └── authController.js       # HTTP request handlers
│   ├── services/
│   │   ├── authService.js          # Authentication logic
│   │   └── otpService.js           # OTP logic
│   ├── repositories/
│   │   ├── userRepository.js       # User queries
│   │   ├── otpRepository.js        # OTP queries
│   │   └── authSessionRepository.js # Session queries
│   ├── validators/
│   │   └── authValidator.js        # Input validation
│   ├── middleware/
│   │   └── authMiddleware.js       # Auth middleware
│   ├── routes/
│   │   └── authRoutes.js           # API routes
│   ├── utils/
│   │   ├── crypto.js               # Password/token hashing
│   │   ├── jwt.js                  # JWT generation/verification
│   │   ├── phone.js                # Phone normalization
│   │   ├── emailProvider.js        # Email sending
│   │   └── smsProvider.js          # SMS sending
│   └── app.js                      # Express app setup
├── prisma/
│   ├── schema.prisma               # Database schema
│   └── seed.js                     # Seed data
├── .env                            # Environment variables
├── AUTHENTICATION_API.md           # Full API docs
└── SPRINT3_COMPLETION_REPORT.md   # Implementation report
```

## 8. Common Development Tasks

### Create Test User

```bash
# Call register endpoint
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "phone": "0551234567",
    "firstName": "Test",
    "lastName": "User",
    "password": "TestPass123!",
    "confirmPassword": "TestPass123!",
    "verificationMethod": "EMAIL"
  }'

# In development, check logs for OTP code
# Or use SMS to see mock OTP in console
```

### View Database

```bash
# Open Prisma Studio
npx prisma studio

# Inspect User, OtpVerification, AuthSession tables
```

### Reset Database

```bash
# Drop and recreate database
npx prisma migrate reset

# Reseed with initial data
npx prisma db seed
```

### View Logs

```bash
# Backend logs include:
# - Authentication attempts
# - OTP generation/verification
# - Email/SMS sending
# - Authorization checks
# - Error details

# Check console output during development
# Production: Configure external logging (e.g., Sentry, LogRocket)
```

## 9. Production Deployment Checklist

- [ ] Set NODE_ENV=production
- [ ] Generate strong JWT secrets (use `openssl rand -base64 32`)
- [ ] Configure production email provider (SMTP)
- [ ] Configure production SMS provider (Hubtel account)
- [ ] Set up database backups
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS for production domain
- [ ] Set up monitoring and alerting
- [ ] Run security audit
- [ ] Configure rate limiting per endpoint
- [ ] Enable database query logging
- [ ] Set up error tracking (Sentry)
- [ ] Run full test suite
- [ ] Performance testing
- [ ] Load testing

## 10. API Documentation

Full API documentation available in `AUTHENTICATION_API.md`

Quick links:
- Endpoints: Section 2
- Authentication Flow: Section 2 (Introduction)
- Environment Variables: Section 3
- Error Handling: Section 13
- Examples: Section 13

## Support

For issues or questions:
1. Check AUTHENTICATION_API.md troubleshooting section
2. Review logs for error details
3. Check .env configuration
4. Verify database connection
5. Run test endpoints with curl

---

**Happy coding! 🚀**
