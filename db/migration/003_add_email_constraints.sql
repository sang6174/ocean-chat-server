CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_unique_not_deleted 
ON main.users(email) 
WHERE is_deleted = false;

-- Add check constraint to ensure email format is valid
ALTER TABLE main.users 
ADD CONSTRAINT chk_email_format 
CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$') 
NOT VALID;

ALTER TABLE main.users 
VALIDATE CONSTRAINT chk_email_format;
