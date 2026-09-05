-- FarmWise global FAQ and feedback foundation.
-- Apply through the normal PostgreSQL deployment process after reviewing the generated Prisma migration.
ALTER TABLE "AuditLog" ALTER COLUMN "farmId" DROP NOT NULL;
ALTER TABLE "Notification" ALTER COLUMN "farmId" DROP NOT NULL;
CREATE TYPE "FAQStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE "FeedbackStatus" AS ENUM ('NEW', 'IN_REVIEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');
CREATE TYPE "FeedbackPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

CREATE TABLE "FAQCategory" (
  "id" TEXT NOT NULL, "name" VARCHAR(120) NOT NULL, "description" TEXT,
  "displayOrder" INTEGER NOT NULL DEFAULT 0, "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "FAQCategory_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "FAQCategory_name_key" ON "FAQCategory"("name");
CREATE INDEX "FAQCategory_isActive_displayOrder_idx" ON "FAQCategory"("isActive", "displayOrder");

CREATE TABLE "FAQ" (
  "id" TEXT NOT NULL, "question" VARCHAR(500) NOT NULL, "answer" TEXT NOT NULL, "categoryId" TEXT NOT NULL,
  "status" "FAQStatus" NOT NULL DEFAULT 'DRAFT', "displayOrder" INTEGER NOT NULL DEFAULT 0,
  "createdById" TEXT NOT NULL, "updatedById" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "FAQ_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "FAQ_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "FAQCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "FAQ_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "FAQ_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "FAQ_categoryId_status_displayOrder_idx" ON "FAQ"("categoryId", "status", "displayOrder");
CREATE INDEX "FAQ_status_updatedAt_idx" ON "FAQ"("status", "updatedAt");

CREATE TABLE "FAQFeedback" ("id" TEXT NOT NULL, "faqId" TEXT NOT NULL, "userId" TEXT, "helpful" BOOLEAN NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "FAQFeedback_pkey" PRIMARY KEY ("id"), CONSTRAINT "FAQFeedback_faqId_fkey" FOREIGN KEY ("faqId") REFERENCES "FAQ"("id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "FAQFeedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE);
CREATE UNIQUE INDEX "FAQFeedback_faqId_userId_key" ON "FAQFeedback"("faqId", "userId");
CREATE INDEX "FAQFeedback_faqId_helpful_idx" ON "FAQFeedback"("faqId", "helpful");

CREATE TABLE "Feedback" ("id" TEXT NOT NULL, "reference" VARCHAR(30) NOT NULL, "userId" TEXT NOT NULL, "subject" VARCHAR(200) NOT NULL, "category" VARCHAR(80) NOT NULL, "description" TEXT NOT NULL, "priority" "FeedbackPriority" NOT NULL DEFAULT 'MEDIUM', "status" "FeedbackStatus" NOT NULL DEFAULT 'NEW', "pageUrl" VARCHAR(500), "farmId" TEXT, "assignedToId" TEXT, "resolvedAt" TIMESTAMP(3), "closedAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id"), CONSTRAINT "Feedback_reference_key" UNIQUE ("reference"), CONSTRAINT "Feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE, CONSTRAINT "Feedback_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE, CONSTRAINT "Feedback_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE SET NULL ON UPDATE CASCADE);
CREATE INDEX "Feedback_userId_createdAt_idx" ON "Feedback"("userId", "createdAt");
CREATE INDEX "Feedback_status_priority_createdAt_idx" ON "Feedback"("status", "priority", "createdAt");
CREATE INDEX "Feedback_category_idx" ON "Feedback"("category");
CREATE INDEX "Feedback_assignedToId_idx" ON "Feedback"("assignedToId");
CREATE INDEX "Feedback_farmId_idx" ON "Feedback"("farmId");

CREATE TABLE "FeedbackResponse" ("id" TEXT NOT NULL, "feedbackId" TEXT NOT NULL, "authorId" TEXT NOT NULL, "message" TEXT NOT NULL, "isInternal" BOOLEAN NOT NULL DEFAULT false, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "FeedbackResponse_pkey" PRIMARY KEY ("id"), CONSTRAINT "FeedbackResponse_feedbackId_fkey" FOREIGN KEY ("feedbackId") REFERENCES "Feedback"("id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "FeedbackResponse_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE);
CREATE INDEX "FeedbackResponse_feedbackId_isInternal_createdAt_idx" ON "FeedbackResponse"("feedbackId", "isInternal", "createdAt");
CREATE INDEX "FeedbackResponse_authorId_idx" ON "FeedbackResponse"("authorId");

CREATE TABLE "FeedbackInternalNote" ("id" TEXT NOT NULL, "feedbackId" TEXT NOT NULL, "authorId" TEXT NOT NULL, "note" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "FeedbackInternalNote_pkey" PRIMARY KEY ("id"), CONSTRAINT "FeedbackInternalNote_feedbackId_fkey" FOREIGN KEY ("feedbackId") REFERENCES "Feedback"("id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "FeedbackInternalNote_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE);
CREATE INDEX "FeedbackInternalNote_feedbackId_createdAt_idx" ON "FeedbackInternalNote"("feedbackId", "createdAt");
CREATE INDEX "FeedbackInternalNote_authorId_idx" ON "FeedbackInternalNote"("authorId");

CREATE TABLE "FeedbackAttachment" ("id" TEXT NOT NULL, "feedbackId" TEXT NOT NULL, "mediaFileId" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "FeedbackAttachment_pkey" PRIMARY KEY ("id"), CONSTRAINT "FeedbackAttachment_feedbackId_fkey" FOREIGN KEY ("feedbackId") REFERENCES "Feedback"("id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "FeedbackAttachment_mediaFileId_fkey" FOREIGN KEY ("mediaFileId") REFERENCES "MediaFile"("id") ON DELETE RESTRICT ON UPDATE CASCADE);
CREATE UNIQUE INDEX "FeedbackAttachment_feedbackId_mediaFileId_key" ON "FeedbackAttachment"("feedbackId", "mediaFileId");
CREATE INDEX "FeedbackAttachment_mediaFileId_idx" ON "FeedbackAttachment"("mediaFileId");