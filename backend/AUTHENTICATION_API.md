# FarmWise Authentication API Documentation

## Overview

The FarmWise Authentication API provides secure user registration, login, session management, and role-based access control. It uses JWT tokens for stateless authentication combined with session-based refresh token management for enhanced security.

## Architecture

```
Client Request
    ↓
Express Middleware (Security Headers, CORS, Rate Limiting)
    ↓
Route Handler
    ↓
Input Validation (validators)
    ↓
Business Logic (services)
    ↓
Database Access (repositories)
    ↓
Prisma ORM → PostgreSQL
```

## Authentication Flow

### Registration Flow
```
1. POST /auth/register → Register new account
2. System generates OTP (6 digits)
3. OTP sent via EMAIL or SMS
4. User receives OTP code
5. POST /auth/verify-otp → Verify code
6. Account activated, email/phone verified
7. User can now login
```

### Login Flow
```
1. POST /auth/login (email/phone + password)
2. System authenticates credentials
3. Creates AuthSession (refresh token hash)
4. Returns accessToken (24h) + refreshToken (7d)
5. Client stores tokens
6. All API requests include accessToken in Authorization header
```

### Token Refresh Flow
```
1. AccessToken expires
2. Client sends refreshToken to POST /auth/refresh
3. System validates refreshToken against database
4. Returns new accessToken
5. Client uses new accessToken for requests
```

## Base URL

```
http://localhost:3000/api/v1/auth
```

## Environment Variables

```env
# JWT Configuration
JWT_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-key-here
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# OTP Configuration
OTP_EXPIRY_MINUTES=10
OTP_MAX_ATTEMPTS=5
OTP_LENGTH=6

# Email Configuration (for OTP delivery)
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@farmwise.com

# SMS Configuration (Hubtel for Ghana)
HUBTEL_API_KEY=your-hubtel-api-key
HUBTEL_CLIENT_ID=your-hubtel-client-id
HUBTEL_SMS_FROM=FarmWise
```

## Endpoints

### 1. User Registration

**POST** `/register`

Register a new user account.

#### Request Body
```json
{
  "email": "user@example.com",
  "phone": "0551234567",
  "firstName": "John",
  "lastName": "Doe",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!",
  "verificationMethod": "EMAIL"
}
```

#### Parameters
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | Valid email address (unique) |
| phone | string | Yes | Ghana phone number (0551234567 or +233551234567) |
| firstName | string | Yes | First name (2-50 chars) |
| lastName | string | Yes | Last name (2-50 chars) |
| password | string | Yes | Min 8 chars, uppercase, lowercase, number, special char |
| confirmPassword | string | Yes | Must match password |
| verificationMethod | string | Yes | EMAIL or SMS |

#### Response (201 Created)
```json
{
  "success": true,
  "message": "Account created. Verification code sent to your email.",
  "data": {
    "userId": "clx1234567890abcdef1234",
    "email": "user@example.com",
    "verificationMethod": "EMAIL",
    "otpExpiresIn": 600
  }
}
```

#### Password Requirements
- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character (!@#$%^&*()_+-=[]{}';:"\\|,.<>\/?)

#### Phone Number Support
- Ghana numbers in multiple formats: 0551234567, +233551234567, 233551234567
- Normalized to international format: 233XXXXXXXXX

#### Errors
- `400 Bad Request` - Validation error
- `409 Conflict` - Email or phone already registered
- `500 Internal Server Error` - Server error

---

### 2. Verify OTP

**POST** `/verify-otp`

Verify OTP code and activate account.

#### Request Body
```json
{
  "userId": "clx1234567890abcdef1234",
  "code": "123456",
  "channel": "EMAIL"
}
```

#### Parameters
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| userId | string | Yes | User ID from registration response |
| code | string | Yes | OTP code (numeric) |
| channel | string | Yes | EMAIL or SMS |

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Account verified successfully. You can now log in.",
  "data": {
    "userId": "clx1234567890abcdef1234"
  }
}
```

#### Constraints
- OTP expires after 10 minutes (configurable)
- Maximum 5 verification attempts (configurable)
- Cannot reuse same OTP code

#### Errors
- `400 Bad Request` - Invalid code or validation error
- `404 Not Found` - User or OTP not found
- `429 Too Many Requests` - Max attempts exceeded

---

### 3. Resend OTP

**POST** `/resend-otp`

Request a new OTP code.

#### Request Body
```json
{
  "userId": "clx1234567890abcdef1234",
  "channel": "EMAIL"
}
```

#### Parameters
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| userId | string | Yes | User ID |
| channel | string | Yes | EMAIL or SMS |

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Verification code resent to your email",
  "data": {
    "userId": "clx1234567890abcdef1234",
    "channel": "EMAIL",
    "expiresIn": 600
  }
}
```

#### Constraints
- Previous OTP remains valid until expiry
- Prevents spam (active OTP required for channel)

---

### 4. User Login

**POST** `/login`

Authenticate user and create session.

#### Request Body
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "deviceId": "device-identifier-optional"
}
```

Or with phone:
```json
{
  "phone": "233551234567",
  "password": "SecurePass123!",
  "deviceId": "device-identifier-optional"
}
```

#### Parameters
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Either email or phone | User email address |
| phone | string | Either email or phone | User phone number |
| password | string | Yes | User password |
| deviceId | string | No | Unique device identifier |

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "sessionId": "clx9876543210fedcba0987",
    "user": {
      "id": "clx1234567890abcdef1234",
      "email": "user@example.com",
      "phone": "233551234567",
      "firstName": "John",
      "lastName": "Doe",
      "status": "ACTIVE",
      "roles": ["FARM_OWNER"]
    }
  }
}
```

#### Token Details
- **accessToken**: JWT valid for 24 hours
- **refreshToken**: JWT valid for 7 days, must be stored securely
- **sessionId**: Track session in database

#### Session Tracking
- IP address captured
- User agent stored
- Device identifier saved (if provided)
- Enables multi-device session management

#### Requirements
- Account must be email-verified OR phone-verified
- Account must be in ACTIVE status
- Password must be correct

#### Errors
- `400 Bad Request` - Missing or invalid input
- `401 Unauthorized` - Wrong credentials or unverified account
- `403 Forbidden` - Account suspended

---

### 5. Refresh Access Token

**POST** `/refresh`

Get a new access token using refresh token.

#### Request Body
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Parameters
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| refreshToken | string | Yes | Valid refresh token from login |

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Constraints
- Refresh token must be valid (not expired)
- Refresh token must not be revoked
- Session must be active

#### Errors
- `400 Bad Request` - Missing refresh token
- `401 Unauthorized` - Invalid or expired refresh token

---

### 6. Get Current User

**GET** `/me`

Get current authenticated user information.

#### Headers
```
Authorization: Bearer <accessToken>
```

#### Response (200 OK)
```json
{
  "success": true,
  "message": "User information retrieved",
  "data": {
    "user": {
      "id": "clx1234567890abcdef1234",
      "email": "user@example.com",
      "phone": "233551234567",
      "firstName": "John",
      "lastName": "Doe",
      "status": "ACTIVE",
      "emailVerified": true,
      "phoneVerified": false,
      "twoFactorEnabled": false,
      "roles": [
        {
          "id": "clxrole1234567890",
          "name": "FARM_OWNER",
          "permissions": [
            { "id": "clxperm1234", "code": "CREATE_FARM", "description": "Create new farm" },
            { "id": "clxperm5678", "code": "READ_FARM", "description": "View farm details" }
          ]
        }
      ],
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

#### Requirements
- Valid access token required (Authorization header)
- Must be authenticated

#### Errors
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - User not found

---

### 7. Change Password

**POST** `/change-password`

Change user password (requires current password verification).

#### Headers
```
Authorization: Bearer <accessToken>
```

#### Request Body
```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass456!",
  "confirmPassword": "NewPass456!"
}
```

#### Parameters
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| currentPassword | string | Yes | Current password for verification |
| newPassword | string | Yes | New password (must meet strength requirements) |
| confirmPassword | string | Yes | Must match newPassword |

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Password changed successfully. Please log in again."
}
```

#### Effects
- All existing sessions revoked
- User must re-login on all devices
- Previous refresh tokens no longer valid

#### Requirements
- Current password must be correct
- New password must meet strength requirements
- Authenticated user required

#### Errors
- `400 Bad Request` - Validation error or new password too weak
- `401 Unauthorized` - Invalid current password or not authenticated
- `500 Internal Server Error` - Server error

---

### 8. Reset Password

**POST** `/reset-password`

Reset password (typically after OTP verification for forgot password flow).

#### Request Body
```json
{
  "userId": "clx1234567890abcdef1234",
  "newPassword": "NewPass456!",
  "confirmPassword": "NewPass456!"
}
```

#### Parameters
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| userId | string | Yes | User ID |
| newPassword | string | Yes | New password |
| confirmPassword | string | Yes | Must match newPassword |

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Password reset successfully. Please log in with your new password."
}
```

#### Effects
- All existing sessions revoked
- User must re-login on all devices
- Password reset via forgot-password flow

#### Errors
- `400 Bad Request` - Validation error
- `404 Not Found` - User not found

---

### 9. Logout

**POST** `/logout`

Logout and revoke current session.

#### Headers
```
Authorization: Bearer <accessToken>
```

#### Request Body
```json
{
  "sessionId": "clx9876543210fedcba0987"
}
```

#### Parameters
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| sessionId | string | Yes | Session ID from login response |

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### Effects
- Current session revoked
- Refresh token no longer usable
- User remains logged in on other devices

#### Requirements
- Authenticated user required

#### Errors
- `400 Bad Request` - Missing sessionId
- `401 Unauthorized` - Not authenticated

---

### 10. Logout All Sessions

**POST** `/logout-all`

Logout from all devices/sessions.

#### Headers
```
Authorization: Bearer <accessToken>
```

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Logged out from all sessions",
  "data": {
    "sessionsRevoked": 3
  }
}
```

#### Effects
- All user sessions revoked
- All refresh tokens invalidated
- User must re-login on all devices

#### Requirements
- Authenticated user required

#### Errors
- `400 Bad Request` - Error during logout
- `401 Unauthorized` - Not authenticated

---

## Authentication Headers

All protected endpoints require the following header:

```
Authorization: Bearer <accessToken>
```

Example:
```
GET /api/v1/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbHgxMjM0NTY3ODkwYWJjZGVmMTIzNCIsImVtYWlsIjoiand0QGV4YW1wbGUuY29tIiwicm9sZXMiOlsiRkFSTVdfT1dORVIiXSwiaWF0IjoxNjc0NzYxNTk0LCJleHAiOjE2NzQ4NDc5OTR9.abc123...
```

## JWT Token Structure

### Access Token Payload
```json
{
  "sub": "clx1234567890abcdef1234",
  "email": "user@example.com",
  "roles": ["FARM_OWNER", "WORKER"],
  "iat": 1674761594,
  "exp": 1674847994
}
```

### Refresh Token Payload
```json
{
  "sub": "clx1234567890abcdef1234",
  "sessionToken": "abcd1234efgh5678ijkl9012",
  "iat": 1674761594,
  "exp": 1676571594
}
```

## Response Format

All responses follow this structure:

### Success Response
```json
{
  "success": true,
  "message": "Operation description",
  "data": {
    "key": "value"
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": {
    "field": "Error message",
    "anotherField": "Another error"
  }
}
```

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 400 | Bad Request - Validation error |
| 401 | Unauthorized - Authentication required or invalid |
| 403 | Forbidden - Authenticated but not authorized |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 429 | Too Many Requests - Rate limited |
| 500 | Internal Server Error - Server error |

## Rate Limiting

Global rate limiting: **100 requests per 15 minutes per IP**

Per-endpoint rate limiting:
- Registration: 5 attempts per hour per IP
- Login: 10 failed attempts per 15 minutes per IP
- OTP requests: 5 per hour per email/phone
- Token refresh: No limit (legitimate use)

## Security Considerations

### Token Storage
- **Access Token**: Store in memory or short-lived sessionStorage (not localStorage)
- **Refresh Token**: Store in httpOnly secure cookie (server-set) or sessionStorage with extra caution

### Token Lifetime
- Access Token: 24 hours (active use)
- Refresh Token: 7 days (extended use, rotate recommended)

### HTTPS
- Always use HTTPS in production
- Never send tokens over HTTP

### Session Security
- Each login creates new session (tracked by session ID)
- IP address and user agent recorded
- Device identifiers supported for multi-device tracking
- Sessions can be individually revoked
- Password changes revoke all sessions automatically

### Password Security
- Never sent in URLs or as query parameters
- Always use POST requests
- Passwords hashed with bcrypt (10 rounds)
- Never returned in API responses
- Minimum strength requirements enforced

### OTP Security
- 6-digit codes (0-999999)
- 10-minute expiration
- 5-attempt limit
- Code hash stored in database (not plaintext)
- Supports email and SMS delivery

## Error Handling

### Validation Errors
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": "Invalid email address",
    "password": "Password must be at least 8 characters"
  }
}
```

### Authentication Errors
```json
{
  "success": false,
  "message": "Login failed",
  "errors": {
    "credentials": "Invalid credentials"
  }
}
```

### Authorization Errors
```json
{
  "success": false,
  "message": "Insufficient permissions",
  "errors": {
    "authorization": "You must have one of these roles: ADMIN"
  }
}
```

## Examples

### Complete Registration & Login Flow

```bash
# 1. Register
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

# Response includes userId
# userId: "clx1234567890abcdef1234"

# 2. Verify OTP (check email for code)
curl -X POST http://localhost:3000/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "clx1234567890abcdef1234",
    "code": "123456",
    "channel": "EMAIL"
  }'

# 3. Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'

# Response includes tokens
# accessToken: "eyJ...",
# refreshToken: "eyJ...",
# sessionId: "clx..."

# 4. Use access token for protected endpoints
curl -X GET http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer eyJ..."

# 5. Refresh token when expired
curl -X POST http://localhost:3000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJ..."
  }'

# 6. Logout
curl -X POST http://localhost:3000/api/v1/auth/logout \
  -H "Authorization: Bearer eyJ..." \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "clx..."
  }'
```

## Troubleshooting

### "Invalid credentials" on login
- Wrong password or email/phone doesn't exist
- Check email/phone for typos
- Ensure account is verified before login

### "Token has expired" on protected endpoint
- Access token expired (24h limit)
- Use refresh endpoint to get new access token

### "Refresh token is invalid"
- Refresh token expired (7d limit)
- Session was revoked (logout, password change, or admin action)
- Must re-login

### "You must verify your email/phone"
- Register but didn't complete OTP verification
- Use resend-otp endpoint to get new code

### Rate limit exceeded
- Too many requests from same IP
- Wait for 15-minute window to reset
- Implement exponential backoff in client

## Support

For issues or questions, contact: support@farmwise.com
