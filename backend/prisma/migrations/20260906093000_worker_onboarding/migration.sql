CREATE TABLE "WorkerOnboarding" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "farmId" TEXT NOT NULL,
  "createdById" TEXT NOT NULL,
  "tokenHash" VARCHAR(64) NOT NULL,
  "status" VARCHAR(50) NOT NULL DEFAULT 'PHONE_VERIFICATION_REQUIRED',
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "phoneVerifiedAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "WorkerOnboarding_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "WorkerOnboarding_tokenHash_key" UNIQUE ("tokenHash"),
  CONSTRAINT "WorkerOnboarding_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "WorkerOnboarding_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "WorkerOnboarding_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "WorkerOnboarding_userId_status_idx" ON "WorkerOnboarding"("userId", "status");
CREATE INDEX "WorkerOnboarding_farmId_status_idx" ON "WorkerOnboarding"("farmId", "status");
CREATE INDEX "WorkerOnboarding_expiresAt_idx" ON "WorkerOnboarding"("expiresAt");
