-- Migration: Add profile photo support to users table
-- Run this migration to add profile photo functionality

-- Add profile_photo column to users table
ALTER TABLE users ADD COLUMN profile_photo VARCHAR(500);

-- Add comment to explain the column
COMMENT ON COLUMN users.profile_photo IS 'Relative path to user profile photo in /images/profiles/ folder';

-- Create index for profile photo queries (optional but good for performance)
CREATE INDEX idx_users_profile_photo ON users(profile_photo) WHERE profile_photo IS NOT NULL;

-- Update the updated_at trigger to include profile_photo changes
-- (This ensures updated_at is automatically updated when profile_photo changes)