
CREATE SCHEMA IF NOT EXISTS main;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- CREATE TYPE 
-- ============================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'conversation_type') THEN
        CREATE TYPE conversation_type AS ENUM ('myself', 'direct', 'group');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'chat_role_type') THEN
        CREATE TYPE chat_role_type AS ENUM ('admin', 'member');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN 
        CREATE TYPE notification_type AS ENUM (
            'friend_request', 
            'accept_friend_request', 
            'deny_friend_request'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_status') THEN 
        CREATE TYPE notification_status AS ENUM (
            'pending', 
            'accepted',
            'rejected',
            'cancelled'
        );
    END IF;
END
$$;

-- ============================================================
-- TABLE 
-- ============================================================
CREATE TABLE IF NOT EXISTS main.users (
    id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name            TEXT NOT NULL,
    email           TEXT UNIQUE NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ,
    is_deleted      BOOLEAN DEFAULT FALSE,
    deleted_at      TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS main.accounts (
    id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    username        TEXT UNIQUE NOT NULL,
    password        TEXT NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ,
    is_deleted      BOOLEAN DEFAULT FALSE,
    deleted_at      TIMESTAMPTZ,
    user_id         UUID NOT NULL REFERENCES main.users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS main.conversations (
    id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    type            conversation_type NOT NULL,
    name            VARCHAR(100),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ,
    is_deleted      BOOLEAN DEFAULT FALSE,
    deleted_at      TIMESTAMPTZ,
    last_event      TIMESTAMPTZ DEFAULT NOW(),
    creator_id      UUID REFERENCES main.users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS main.participants (
    conversation_id UUID NOT NULL REFERENCES main.conversations(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES main.users(id) ON DELETE CASCADE,
    role            chat_role_type NOT NULL DEFAULT 'member',
    last_seen       TIMESTAMPTZ,
    joined_at       TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS main.messages (
    id              BIGSERIAL PRIMARY KEY,
    content         TEXT NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ,
    is_deleted      BOOLEAN DEFAULT FALSE,
    deleted_at      TIMESTAMPTZ,
    sender_id       UUID REFERENCES main.users(id),
    conversation_id UUID REFERENCES main.conversations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS main.notifications (
    id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    type            notification_type NOT NULL, 
    status          notification_status NOT NULL,
    content         TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ,
    is_deleted      BOOLEAN DEFAULT FALSE,
    deleted_at      TIMESTAMPTZ,
    sender_id       UUID NOT NULL REFERENCES main.users(id),
    recipient_id    UUID NOT NULL REFERENCES main.users(id)
);

-- ============================================================
-- Indexing
-- ============================================================
CREATE INDEX idx_accounts_user_id ON main.accounts(user_id);
CREATE INDEX idx_participants_user_id ON main.participants(user_id);
CREATE INDEX idx_conversations_last_event ON main.conversations(last_event DESC);
CREATE INDEX idx_messages_conversation_id ON main.messages(conversation_id, created_at DESC);
CREATE INDEX idx_participants_conversation_id ON main.participants(conversation_id);
CREATE INDEX idx_notifications_recipient_id ON main.notifications(recipient_id);
