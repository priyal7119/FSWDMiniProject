-- =========================================================
-- MapOut — Career Planner Preferences Migration
-- Run this in your Supabase SQL Editor to enable full
-- preference persistence for the Career Planner feature.
-- =========================================================

-- Add new preference columns to user_roadmaps table
ALTER TABLE IF EXISTS user_roadmaps
  ADD COLUMN IF NOT EXISTS experience_level VARCHAR(50)  DEFAULT 'beginner',
  ADD COLUMN IF NOT EXISTS time_per_week    VARCHAR(20)  DEFAULT '10',
  ADD COLUMN IF NOT EXISTS learning_style   VARCHAR(50)  DEFAULT 'project',
  ADD COLUMN IF NOT EXISTS timeline         VARCHAR(50)  DEFAULT '6months';

-- Optional: verify columns exist
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'user_roadmaps'
ORDER BY ordinal_position;
