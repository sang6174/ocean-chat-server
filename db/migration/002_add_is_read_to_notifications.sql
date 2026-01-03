-- Migration to add is_read column to notifications table
ALTER TABLE main.notifications ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE;
