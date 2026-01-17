-- Migration: Add branding column to Project table
-- Run this on production database

-- Add branding JSON column with default empty object
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "branding" JSONB DEFAULT '{}';

-- Verify the column was added
-- SELECT column_name, data_type, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'Project' AND column_name = 'branding';
