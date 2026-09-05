-- FarmWise worker role foundation. Apply with the project's normal Prisma deployment flow.
CREATE TABLE "WorkerFarmPermission" (
  "id" TEXT NOT NULL,
  "farmMemberId" TEXT NOT NULL,
  "permissionId" TEXT NOT NULL,
  "grantedById" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "WorkerFarmPermission_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "WorkerFarmPermission_farmMemberId_fkey" FOREIGN KEY ("farmMemberId") REFERENCES "FarmMember"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "WorkerFarmPermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "WorkerFarmPermission_grantedById_fkey" FOREIGN KEY ("grantedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "WorkerFarmPermission_farmMemberId_permissionId_key" ON "WorkerFarmPermission"("farmMemberId", "permissionId");
CREATE INDEX "WorkerFarmPermission_farmMemberId_idx" ON "WorkerFarmPermission"("farmMemberId");
CREATE INDEX "WorkerFarmPermission_permissionId_idx" ON "WorkerFarmPermission"("permissionId");
CREATE INDEX "WorkerFarmPermission_grantedById_idx" ON "WorkerFarmPermission"("grantedById");