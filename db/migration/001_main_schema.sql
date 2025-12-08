
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
    id              UUID NOT NULL REFERENCES main.users(id) ON DELETE CASCADE,
    username        TEXT UNIQUE NOT NULL,
    password        TEXT NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ,
    is_deleted      BOOLEAN DEFAULT FALSE,
    deleted_at      TIMESTAMPTZ,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS main.conversations (
    id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    type            conversation_type NOT NULL,
    metadata        JSONB DEFAULT '{}'::JSONB,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ,
    is_deleted      BOOLEAN DEFAULT FALSE,
    deleted_at      TIMESTAMPTZ,
    last_message_created_at    TIMESTAMPTZ DEFAULT NOW()
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

-- ============================================================
-- Indexing
-- ============================================================
CREATE INDEX idx_messages_conversation_id ON main.messages(conversation_id, created_at);
CREATE INDEX idx_conversations_last_message_created_at ON main.conversations(last_message_created_at);
