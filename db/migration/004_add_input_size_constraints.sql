-- Add length constraint on message content
ALTER TABLE main.messages 
ADD CONSTRAINT chk_message_length 
CHECK (length(content) > 0 AND length(content) <= 5000);

-- Add length constraint on conversation names
ALTER TABLE main.conversations 
ADD CONSTRAINT chk_conversation_name_length 
CHECK (length(name) > 0 AND length(name) <= 255) 
NOT VALID;

ALTER TABLE main.conversations 
VALIDATE CONSTRAINT chk_conversation_name_length;

-- Add length constraint on usernames
ALTER TABLE main.accounts 
ADD CONSTRAINT chk_username_length 
CHECK (length(username) >= 3 AND length(username) <= 32)
NOT VALID;

ALTER TABLE main.accounts 
VALIDATE CONSTRAINT chk_username_length;

-- Add length constraint on user names
ALTER TABLE main.users 
ADD CONSTRAINT chk_user_name_length 
CHECK (length(name) >= 2 AND length(name) <= 255)
NOT VALID;

ALTER TABLE main.users 
VALIDATE CONSTRAINT chk_user_name_length;
