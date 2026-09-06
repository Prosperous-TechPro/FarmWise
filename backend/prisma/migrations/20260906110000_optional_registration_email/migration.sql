-- Allow phone-first farmer registration.
ALTER TABLE "User" ALTER COLUMN "email" DROP NOT NULL;
ALTER TABLE "PendingRegistration" ALTER COLUMN "email" DROP NOT NULL;
