# FarmWise V1 Production Deployment Checklist

## Before deployment

- [ ] Create a controlled Prisma migration baseline for the existing database.
- [ ] Back up PostgreSQL and verify the backup can be restored.
- [ ] Review migration SQL for destructive operations.
- [ ] Supply production `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `CORS_ORIGIN`, and `BACKEND_URL` through the secret manager.
- [ ] Rotate any credential that was ever present in `.env.example` or shared during development.
- [ ] Configure real Hubtel, email, storage, and notification providers outside source control.
- [ ] Implement and test the missing 2FA verification flow.
- [ ] Configure HTTPS termination and secure headers.
- [ ] Run backend integration, authorization, IDOR, and financial integrity tests.
- [ ] Build and smoke-test Android debug and release variants in Android Studio/CI.

## Deployment

- [ ] Deploy backend to staging.
- [ ] Apply migrations with `prisma migrate deploy` from the approved baseline.
- [ ] Run `/api/v1/health` and authenticated smoke checks.
- [ ] Verify farm isolation with two users and two farms.
- [ ] Verify worker permissions and financial visibility.
- [ ] Verify OTP delivery and rate limits without logging codes.
- [ ] Verify notification fallback to in-app delivery.
- [ ] Promote the immutable backend artifact.
- [ ] Publish only a signed Android artifact with production HTTPS configuration.

## Rollback

1. Stop promotion and preserve logs/correlation IDs.
2. Roll back the backend artifact if schema-compatible.
3. Do not automatically roll back destructive database changes.
4. Restore from the verified backup only under the approved incident procedure.
5. Re-run health, auth, farm-isolation, financial-integrity, and notification checks.

## After deployment

- [ ] Monitor error rates, authentication failures, database latency, and queue failures.
- [ ] Verify scheduled backups and perform periodic restore tests.
- [ ] Review security logs without collecting tokens, passwords, OTPs, or unnecessary financial details.
- [ ] Record deployment version, migration ID, rollback decision, and operator.

Marketplace V2, AI diagnosis, predictive analytics, and full offline synchronization are intentionally excluded from V1.
