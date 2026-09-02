# FarmWise Security Guidelines

## Overview

Security is a foundational concern in FarmWise. All features and components must follow these security principles.

## Authentication & Authorization

### Principles
- **Never store plaintext passwords** - Always hash with bcrypt or similar
- **Use secure tokens** - JWT with proper expiration
- **Environment secrets only** - API keys, tokens, secrets in `.env`, never in code
- **Backend enforcement** - Authorization checked server-side, not just frontend

### Implementation (Sprint 1)
- Email/SMS OTP verification
- Secure password hashing
- JWT token generation and validation
- Refresh token rotation
- Session management

## Multi-Tenancy / Farm Isolation

### Critical Rule
Every protected endpoint must verify:
```javascript
// 1. User is authenticated
const user = await validateToken(req.headers.authorization);

// 2. User has access to the farm
const farmAccess = await userHasFarmAccess(user.id, farmId);

// 3. Query includes farm filter
const results = await db.query.where({ farmId, ...otherFilters });
```

### Never Do This
```javascript
// ❌ DANGEROUS - User can change ID and access other farms
app.get('/api/v1/farms/:farmId', (req, res) => {
  const farm = db.farms.findById(req.params.farmId);
  res.json(farm);
});

// ✅ CORRECT - User's farm access validated
app.get('/api/v1/farms/:farmId', (req, res) => {
  const userId = req.user.id;
  const farmId = req.params.farmId;
  
  // Verify access
  const access = db.farmAccess.findOne({ userId, farmId });
  if (!access) return res.status(403).json({ error: 'Unauthorized' });
  
  const farm = db.farms.findById(farmId);
  res.json(farm);
});
```

## Input Validation

### Rules
- **Validate on frontend** - For user experience
- **Validate on backend** - For security and integrity (REQUIRED)
- **Type check** - Ensure correct data types
- **Range check** - Ensure values within acceptable ranges
- **Format check** - Email, phone, date formats
- **Sanitize** - Remove potentially harmful input

### Example
```javascript
// ❌ Not validated
app.post('/api/v1/expenses', (req, res) => {
  const expense = db.expenses.create(req.body);
  res.json(expense);
});

// ✅ Validated
app.post('/api/v1/expenses', (req, res) => {
  const { amount, category, description } = req.body;
  
  // Validation
  if (!amount || typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ error: 'Invalid amount' });
  }
  
  if (!category || typeof category !== 'string') {
    return res.status(400).json({ error: 'Invalid category' });
  }
  
  const expense = db.expenses.create({
    farmId: req.user.farmId,
    amount,
    category,
    description: description || '',
  });
  res.json(expense);
});
```

## Environment Secrets

### Never Commit
- `.env` files with real values
- API keys
- Database passwords
- JWT secrets
- Third-party credentials

### Do This
1. Create `.env.example` with placeholder values
2. Document required variables
3. Load from environment in code
4. Use different secrets per environment

### Example
```javascript
// ✅ CORRECT
const dbUrl = process.env.DATABASE_URL;
const jwtSecret = process.env.JWT_SECRET;

// ❌ WRONG
const dbUrl = 'postgresql://user:password@localhost/db';
const jwtSecret = 'my-super-secret-key-123';
```

## API Security

### Headers
Helmet.js is configured to add security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security`

### Rate Limiting
- Prevent brute-force attacks
- Limit API requests per IP
- Stricter limits on auth endpoints

### CORS
- Only allow requests from trusted origins
- Credentials require explicit handling
- Options pre-flight requests

## Data Protection

### In Transit
- HTTPS only in production
- TLS 1.2 or higher
- No sensitive data in URLs

### At Rest
- Encrypt sensitive fields (future)
- Secure password hashing
- Database encryption
- Backup encryption

### In Memory
- Don't store sensitive data longer than needed
- Clear sensitive variables when done
- Use secure deletion for secrets

## Logging & Monitoring

### Log Strategy
- Log all authentication events
- Log all authorization failures
- Log data modifications
- Don't log passwords or sensitive data

### Example
```javascript
// ✅ GOOD
console.log(`User ${userId} accessed farm ${farmId}`);
console.log(`Failed login attempt for email ${email}`);

// ❌ BAD
console.log(`Password reset for user: ${password}`);
console.log(`API Key: ${apiKey}`);
```

## SQL Injection Prevention

### Use Parameterized Queries
```javascript
// ❌ VULNERABLE
const user = db.query(`SELECT * FROM users WHERE email = '${email}'`);

// ✅ SAFE with Prisma
const user = await prisma.user.findUnique({
  where: { email },
});
```

## XSS Prevention

### Rules
- Sanitize user input
- Never inject HTML
- Use frameworks that escape by default
- Content Security Policy (future)

### Example
```javascript
// ❌ VULNERABLE
res.send(`<div>${userInput}</div>`);

// ✅ SAFE in React
<div>{userInput}</div>
```

## CSRF Protection

### Strategy
- Use SameSite cookies
- CSRF tokens for state-changing operations
- Origin validation

## File Upload Security

### Rules (Future Implementation)
- Validate file type
- Limit file size (max 10MB currently configured)
- Scan for malware
- Store outside web root
- Use CDN for serving

## Third-Party Integrations

### Services
- **Hubtel SMS** - Use for SMS OTP only
- **Email Service** - Use for OTP and notifications only
- **AI Service** - Validate responses, don't trust blindly
- **Cloud Storage** - Use pre-signed URLs

### Key Management
- Store API keys in environment variables
- Rotate keys regularly
- Use service-specific keys
- Monitor for unauthorized usage

## Security Checklist

### Before Each Sprint
- [ ] All secrets in environment, not code
- [ ] Input validation on backend
- [ ] Authorization checks enforced
- [ ] No SQL injection vulnerabilities
- [ ] No XSS vulnerabilities
- [ ] Sensitive data not logged
- [ ] HTTPS configured
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Security headers set

### Before Production
- [ ] Security audit completed
- [ ] Penetration testing done
- [ ] Dependencies scanned for vulnerabilities
- [ ] Database encrypted
- [ ] Backups encrypted and tested
- [ ] Monitoring and alerting configured
- [ ] Incident response plan ready
- [ ] Security training completed

## Reporting Security Issues

If you find a security vulnerability:
1. **Do NOT** open a public issue
2. Send details privately to security@farmwise.example
3. Include reproduction steps
4. Allow time for patch development

---

**Last Updated:** Prompt 0
**Next Update:** Sprint 1 - Detailed security implementation
