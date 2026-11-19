ALTER TYPE "BookingStatus" ADD VALUE IF NOT EXISTS 'EXPIRED';

ALTER TABLE "Booking"
  ALTER COLUMN "userId" DROP NOT NULL,
  ADD COLUMN "customerName" TEXT,
  ADD COLUMN "customerPhone" TEXT,
  ADD COLUMN "holdExpiresAt" TIMESTAMP(3);

CREATE TABLE "CourtSchedule" (
  "id" TEXT NOT NULL,
  "courtId" TEXT NOT NULL,
  "weekday" INTEGER NOT NULL,
  "opensAt" TEXT NOT NULL,
  "closesAt" TEXT NOT NULL,
  "slotDurationMinutes" INTEGER NOT NULL DEFAULT 60,
  "bufferMinutes" INTEGER NOT NULL DEFAULT 0,
  "active" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "CourtSchedule_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "CourtSchedule_weekday_check" CHECK ("weekday" BETWEEN 0 AND 6),
  CONSTRAINT "CourtSchedule_slot_duration_check" CHECK ("slotDurationMinutes" > 0 AND "bufferMinutes" >= 0)
);

CREATE TABLE "CourtClosure" (
  "id" TEXT NOT NULL,
  "courtId" TEXT NOT NULL,
  "startsAt" TIMESTAMP(3) NOT NULL,
  "endsAt" TIMESTAMP(3) NOT NULL,
  "reason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CourtClosure_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "CourtClosure_time_check" CHECK ("endsAt" > "startsAt")
);

CREATE INDEX "CourtSchedule_courtId_weekday_active_idx" ON "CourtSchedule"("courtId", "weekday", "active");
CREATE INDEX "CourtClosure_courtId_startsAt_endsAt_idx" ON "CourtClosure"("courtId", "startsAt", "endsAt");
CREATE INDEX "Booking_courtId_status_startsAt_endsAt_idx" ON "Booking"("courtId", "status", "startsAt", "endsAt");

ALTER TABLE "CourtSchedule" ADD CONSTRAINT "CourtSchedule_courtId_fkey"
  FOREIGN KEY ("courtId") REFERENCES "Court"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CourtClosure" ADD CONSTRAINT "CourtClosure_courtId_fkey"
  FOREIGN KEY ("courtId") REFERENCES "Court"("id") ON DELETE CASCADE ON UPDATE CASCADE;
