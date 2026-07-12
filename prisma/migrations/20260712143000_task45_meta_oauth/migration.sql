-- TASK-45 Meta OAuth — extend CompanySocialAccount with Meta-specific fields.
-- Applied via `prisma db push` (Prisma 7.8 CLI arg-parse issue with `migrate dev`).

ALTER TABLE "CompanySocialAccount"
  ADD COLUMN IF NOT EXISTS "instagramBusinessId" TEXT,
  ADD COLUMN IF NOT EXISTS "pageName" TEXT,
  ADD COLUMN IF NOT EXISTS "permissions" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "access_token_status" TEXT,
  ADD COLUMN IF NOT EXISTS "provider" TEXT NOT NULL DEFAULT 'manual';
