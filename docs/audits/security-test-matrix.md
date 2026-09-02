# FarmWise V1 Security Test Matrix

Date: 2026-09-02

| Control | Test / evidence | Expected | Actual | Status |
|---|---|---|---|---|
| Password hashing | Review auth service and bcrypt dependency | Passwords hashed, never returned | bcrypt implementation exists; route suite incomplete | PARTIAL |
| OTP storage | Review OTP service/schema/tests | Hash, expiry, one-time use, attempt limits | Hashing/expiry/attempt logic exists; integration suite incomplete | PARTIAL |
| 2FA | Search routes/services and attempt flow | Second factor required and verifiable | No dedicated verification endpoint | FAIL |
| JWT algorithm | Review `jwt.js` | Fixed safe algorithm | HS256 is explicitly verified | PASS |
| JWT secrets | Scan source and config | No predictable production fallback | Fallbacks removed from middleware/controller; production requires secrets | PASS |
| Farm isolation | Review `requireFarmAccess` and farm-scoped services | Unauthorized farm returns 403/404 | Middleware exists; API integration matrix not executable | PARTIAL |
| Worker restrictions | Review role middleware/routes | Worker cannot mutate owner-only records | Most write routes require OWNER/MANAGER; dedicated worker tests incomplete | PARTIAL |
| IDOR | Inspect resource service farm checks | IDs cannot cross farms | Crop/livestock/activity services perform checks; broad automated test unavailable | PARTIAL |
| Notification access | Review user/farm notification queries | User sees only authorized farm notifications | User/farm filters exist | PARTIAL |
| Device token exposure | Review device repository | Push tokens not returned in lists | List projection excludes pushToken | PASS |
| Input validation | Run validator suite | Invalid data rejected | 37/37 validator tests passed | PASS |
| ORM injection | Review repositories | Parameterized Prisma access | Prisma APIs used; no raw SQL found in backend source | PASS |
| File uploads | Search upload routes/middleware | MIME, size, filename, authorization checks | No upload implementation found | NOT IMPLEMENTED |
| Headers/CORS/rate limits | Review `app.js` | Security headers, CORS, rate limiting | Helmet, CORS, API rate limit present; production CORS config must be supplied | PARTIAL |
| Error disclosure | Review error/auth controllers | No secrets/stacks to clients | Production stack hidden; OTP provider error disclosure fixed | PASS |
| Secrets in templates | Scan tracked files | Templates contain placeholders only | `.env.example` Neon credential removed; rotation recommended if credential was real | PASS |
| Session invalidation | Review auth session services | Logout/password changes revoke sessions | Service implementation exists; integration tests incomplete | PARTIAL |
| Database migration safety | Run Prisma validation/migration | Versioned, deployable migrations | Schema validates; migration history/baseline missing | BLOCKED |

## Critical findings

1. **2FA is incomplete**: no verifiable dedicated endpoint.
2. **File upload security is unimplemented** because uploads are unimplemented.
3. **Database migration baseline is unresolved** for the configured Neon database.
4. **End-to-end security tests are not passing/executable** under the current test environment.

No marketplace, AI diagnosis, or predictive feature was added.
