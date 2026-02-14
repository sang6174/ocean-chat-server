# Ocean Chat Server

Backend server for Ocean Chat - a real-time messaging application built with Bun.js, TypeScript, and PostgreSQL.

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [WebSocket Events](#websocket-events)
- [Development](#development)
- [Deployment](#deployment)
- [Observability](#observability)

## Overview

The Ocean Chat server is a high-performance backend built with Bun.js that provides:

- RESTful API for chat operations
- WebSocket-based real-time communication
- JWT authentication with token refresh
- PostgreSQL database with optimized indexing
- Custom error handling and logging
- Layered architecture for maintainability

## Tech Stack

| Technology     | Purpose               | Version |
| -------------- | --------------------- | ------- |
| **Bun.js**     | JavaScript runtime    | >= 1.3  |
| **TypeScript** | Type-safe development | ^5      |
| **PostgreSQL** | Relational database   | >= 14   |
| **JWT**        | Authentication tokens | ^9.0.2  |
| **pg**         | PostgreSQL client     | ^8.16.3 |
| **Fly.io**     | Deployment platform   | -       |
| **Neon**       | Managed PostgreSQL    | -       |
| **Grafana**    | Observability         | -       |

## Architecture

### Layered Architecture Pattern

```
┌─────────────────────────────────────┐
│  Controllers (Presentation Layer)   │
│  - Handle HTTP requests             │
│  - Parse input                      │
│  - Return responses                 │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  Services (Business Logic Layer)    │
│  - Core business rules              │
│  - Orchestration logic              │
│  - Transaction management           │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  Repositories (Data Access Layer)   │
│  - Abstract database operations     │
│  - Query composition                │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  Models (Data Persistence)          │
│  - Direct database queries          │
│  - SQL execution                    │
└─────────────────────────────────────┘
```

### Key Components

- **Controllers**: Route handlers in `/src/routes`
- **Services**: Business logic in `/src/services`
- **Repositories**: Data access in `/src/repository`
- **Models**: Database queries in `/src/models`
- **Middlewares**: Request processing in `/src/middlewares`
- **WebSocket**: Real-time handlers in `/src/websocket`

## Getting Started

### Prerequisites

- **Bun** >= 1.3 ([Install Bun](https://bun.sh))
- **PostgreSQL** >= 14
- **Git**

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/sang6174/ocean-chat-server.git
   cd ocean-chat-server
   ```

2. **Install dependencies**

   ```bash
   bun install
   ```

3. **Set up environment variables**

   Create `.env` file:

   ```env
   ENV_MODE=development
   PORT=8080
   LOG_LEVEL=info
   DATABASE_URL=postgresql://user:password@localhost:5432/ocean_chat

   ACCESS_TOKEN_SECRET=your-access-token-secret-min-32-chars
   ACCESS_TOKEN_EXPIRES_IN=15m
   REFRESH_TOKEN_SECRET=your-refresh-token-secret-min-32-chars
   REFRESH_TOKEN_EXPIRES_IN=7d
   REFRESH_TOKEN_MAX_AGE=604800000
   ```

4. **Set up the database**

   ```bash
   # Create database
   createdb ocean_chat

   # Run migrations
   psql -d ocean_chat -f db/migration/001_main_schema.sql
   psql -d ocean_chat -f db/migration/002_add_is_read_to_notifications.sql
   ```

5. **Start the server**

   ```bash
   bun run dev
   ```

   Server will start at `http://localhost:8080`

## Project Structure

```
src/
├── configs/              # Configuration files
├── controllers/          # Route handlers
│   ├── auths.ts         # Authentication routes
│   ├── conversation.ts  # Conversation routes
│   ├── conversations.ts # Conversations list routes
│   ├── notification.ts  # Notification routes
│   ├── profiles.ts      # Profile routes
│   └── upgradeWebSocket.ts
├── helpers/              # Utility functions
│   ├── contexts.ts      # AsyncLocalStorage context
│   ├── errors.ts        # Custom error classes
│   ├── logger.ts        # Logging utilities
│   └── validators.ts    # Validation helpers
├── middlewares/          # Request middlewares
│   ├── auth.ts          # Authentication middleware
│   ├── cors.ts          # CORS handling
│   └── validation/      # Input validation
├── models/               # Database models
│   ├── accounts.ts      # Account queries
│   ├── conversations.ts # Conversation queries
│   └── messages.ts      # Message queries
├── repository/           # Data access layer
│   ├── auth.ts          # Auth repository
│   ├── conversation.ts  # Conversation repository
│   └── notification.ts  # Notification repository
├── routes/               # Route exports
│   └── index.ts         # Route aggregation
├── services/             # Business logic
│   ├── auths.ts         # Auth service
│   ├── conversations.ts # Conversation service
│   ├── messages.ts      # Message service
│   ├── notifications.ts # Notification service
│   ├── participants.ts  # Participant service
│   └── users.ts         # User service
├── types/                # TypeScript types
│   ├── auth.types.ts    # Auth types
│   ├── conversation.types.ts
│   ├── notification.types.ts
│   └── ws.ts            # WebSocket types
├── websocket/            # WebSocket handlers
│   └── main.ts          # WebSocket connection manager
└── index.ts              # Application entry point
```

## API Documentation

### Authentication Endpoints

#### POST /v1/auth/register

Register a new user account.

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "username": "johndoe",
  "password": "securePassword123"
}
```

**Response:** `201 Created`

```json
{
  "message": "User registered successfully"
}
```

---

#### POST /v1/auth/login

Authenticate user and receive tokens.

**Request Body:**

```json
{
  "username": "johndoe",
  "password": "securePassword123"
}
```

**Response:** `200 OK`

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "userId": "uuid-here",
  "username": "johndoe"
}
```

**Cookies:** Sets `refreshToken` HTTP-only cookie

---

#### POST /v1/auth/refresh

Generate new access token using refresh token.

**Cookies:** Requires `refreshToken` cookie

**Response:** `200 OK`

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

#### POST /v1/auth/logout

Log out user and revoke refresh token.

**Headers:** `Authorization: Bearer <access_token>`

**Response:** `200 OK`

---

### Profile Endpoints

#### GET /v1/profile/user

Get current user's profile.

**Headers:** `Authorization: Bearer <access_token>`

**Response:** `200 OK`

```json
{
  "id": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "username": "johndoe"
}
```

---

#### GET /v1/profile/users

Get all users in the system.

**Headers:** `Authorization: Bearer <access_token>`

**Response:** `200 OK`

```json
[
  {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "username": "johndoe"
  }
]
```

---

### Conversation Endpoints

#### POST /v1/conversation/group

Create a new group conversation.

**Headers:** `Authorization: Bearer <access_token>`

**Request Body:**

```json
{
  "name": "Team Chat",
  "participantIds": ["uuid1", "uuid2", "uuid3"]
}
```

**Response:** `201 Created`

```json
{
  "id": "conversation-uuid",
  "type": "group",
  "name": "Team Chat",
  "creatorId": "uuid",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

---

#### POST /v1/conversation/message

Send a message to a conversation.

**Headers:** `Authorization: Bearer <access_token>`

**Request Body:**

```json
{
  "conversationId": "uuid",
  "content": "Hello, world!"
}
```

**Response:** `201 Created`

```json
{
  "id": "123",
  "content": "Hello, world!",
  "senderId": "uuid",
  "conversationId": "uuid",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

---

#### POST /v1/conversation/participants

Add participants to a group conversation.

**Headers:** `Authorization: Bearer <access_token>`

**Request Body:**

```json
{
  "conversationId": "uuid",
  "userIds": ["uuid1", "uuid2"]
}
```

**Response:** `200 OK`

---

#### GET /v1/conversations

Get all conversations for the current user.

**Headers:** `Authorization: Bearer <access_token>`

**Response:** `200 OK`

```json
[
  {
    "id": "uuid",
    "type": "direct",
    "name": null,
    "lastEvent": "2024-01-01T00:00:00Z",
    "participants": [...],
    "lastMessage": {...}
  }
]
```

---

#### GET /v1/conversation/messages

Get messages for a conversation.

**Headers:** `Authorization: Bearer <access_token>`

**Query Parameters:**

- `conversationId` (required): Conversation UUID
- `limit` (optional): Number of messages (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Response:** `200 OK`

```json
[
  {
    "id": "123",
    "content": "Hello!",
    "createdAt": "2024-01-01T00:00:00Z",
    "sender": {
      "id": "uuid",
      "name": "John Doe",
      "username": "johndoe"
    }
  }
]
```

---

### Notification Endpoints

#### POST /v1/notification/friend-request

Send a friend request to another user.

**Headers:** `Authorization: Bearer <access_token>`

**Request Body:**

```json
{
  "recipientId": "uuid"
}
```

**Response:** `201 Created`

```json
{
  "id": "notification-uuid",
  "type": "friend_request",
  "status": "pending"
}
```

---

#### POST /v1/notification/friend-request/accept

Accept a friend request.

**Headers:** `Authorization: Bearer <access_token>`

**Request Body:**

```json
{
  "notificationId": "uuid"
}
```

**Response:** `200 OK`

```json
{
  "conversationId": "uuid"
}
```

---

#### POST /v1/notification/friend-request/reject

Reject a friend request.

**Headers:** `Authorization: Bearer <access_token>`

**Request Body:**

```json
{
  "notificationId": "uuid"
}
```

**Response:** `200 OK`

---

#### POST /v1/notification/friend-request/cancel

Cancel a sent friend request.

**Headers:** `Authorization: Bearer <access_token>`

**Request Body:**

```json
{
  "notificationId": "uuid"
}
```

**Response:** `200 OK`

---

#### GET /v1/notifications

Get all notifications for the current user.

**Headers:** `Authorization: Bearer <access_token>`

**Response:** `200 OK`

```json
[
  {
    "id": "uuid",
    "type": "friend_request",
    "status": "pending",
    "isRead": false,
    "createdAt": "2024-01-01T00:00:00Z",
    "sender": {
      "id": "uuid",
      "name": "Jane Doe",
      "username": "janedoe"
    }
  }
]
```

---

#### PUT /v1/notifications/read

Mark all notifications as read.

**Headers:** `Authorization: Bearer <access_token>`

**Response:** `200 OK`

---

## 🗄️ Database Schema

### Tables

#### users

```sql
CREATE TABLE main.users (
    id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name            TEXT NOT NULL,
    email           TEXT UNIQUE NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ,
    is_deleted      BOOLEAN DEFAULT FALSE,
    deleted_at      TIMESTAMPTZ
);
```

#### accounts

```sql
CREATE TABLE main.accounts (
    id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    username        TEXT UNIQUE NOT NULL,
    password        TEXT NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ,
    is_deleted      BOOLEAN DEFAULT FALSE,
    deleted_at      TIMESTAMPTZ,
    user_id         UUID NOT NULL REFERENCES main.users(id) ON DELETE CASCADE
);
```

#### refresh_tokens

```sql
CREATE TABLE main.refresh_tokens (
    id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id         UUID NOT NULL REFERENCES main.users(id) ON DELETE CASCADE,
    token_hash      TEXT NOT NULL,
    expires_at      TIMESTAMPTZ NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    revoked_at      TIMESTAMP,
    replaced_by     UUID
);
```

#### conversations

```sql
CREATE TABLE main.conversations (
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
```

#### participants

```sql
CREATE TABLE main.participants (
    conversation_id UUID NOT NULL REFERENCES main.conversations(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES main.users(id) ON DELETE CASCADE,
    role            chat_role_type NOT NULL DEFAULT 'member',
    last_seen       TIMESTAMPTZ,
    joined_at       TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (conversation_id, user_id)
);
```

#### messages

```sql
CREATE TABLE main.messages (
    id              BIGSERIAL PRIMARY KEY,
    content         TEXT NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ,
    is_deleted      BOOLEAN DEFAULT FALSE,
    deleted_at      TIMESTAMPTZ,
    sender_id       UUID REFERENCES main.users(id),
    conversation_id UUID REFERENCES main.conversations(id) ON DELETE CASCADE
);
```

#### notifications

```sql
CREATE TABLE main.notifications (
    id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    type            notification_type NOT NULL,
    status          notification_status NOT NULL,
    content         TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ,
    is_deleted      BOOLEAN DEFAULT FALSE,
    deleted_at      TIMESTAMPTZ,
    is_read         BOOLEAN DEFAULT FALSE,
    sender_id       UUID NOT NULL REFERENCES main.users(id),
    recipient_id    UUID NOT NULL REFERENCES main.users(id)
);
```

### Indexes

Performance-optimized indexes:

```sql
CREATE INDEX idx_accounts_user_id ON main.accounts(user_id);
CREATE INDEX idx_participants_user_id ON main.participants(user_id);
CREATE INDEX idx_conversations_last_event ON main.conversations(last_event DESC);
CREATE INDEX idx_messages_conversation_id ON main.messages(conversation_id, created_at DESC);
CREATE INDEX idx_participants_conversation_id ON main.participants(conversation_id);
CREATE INDEX idx_notifications_recipient_id ON main.notifications(recipient_id);
CREATE UNIQUE INDEX idx_refresh_token_hash ON main.refresh_tokens(token_hash) WHERE revoked_at IS NULL;
CREATE INDEX idx_refresh_token_user ON main.refresh_tokens(user_id) WHERE revoked_at IS NULL;
```

## 🔌 WebSocket Events

### Connection

**Upgrade Request:**

```
GET /ws?userId=<uuid> HTTP/1.1
Upgrade: websocket
Connection: Upgrade
```

### Server → Client Events

#### new_message

Sent when a new message is created in a conversation.

```json
{
  "event": "new_message",
  "data": {
    "id": "123",
    "content": "Hello!",
    "senderId": "uuid",
    "conversationId": "uuid",
    "createdAt": "2024-01-01T00:00:00Z",
    "sender": {
      "id": "uuid",
      "name": "John Doe",
      "username": "johndoe"
    }
  }
}
```

#### new_conversation

Sent when a new conversation is created.

```json
{
  "event": "new_conversation",
  "data": {
    "id": "uuid",
    "type": "direct",
    "name": null,
    "participants": [...]
  }
}
```

#### friend_request

Sent when a friend request is received.

```json
{
  "event": "friend_request",
  "data": {
    "id": "uuid",
    "senderId": "uuid",
    "sender": {...}
  }
}
```

#### friend_accepted

Sent when a friend request is accepted.

#### friend_rejected

Sent when a friend request is rejected.

#### friend_cancelled

Sent when a friend request is cancelled.

## 💻 Development

### Running Development Server

```bash
# Start with hot reload
bun run dev

# The server will restart automatically on file changes
```

### Environment Variables

| Variable                   | Description                  | Example                               |
| -------------------------- | ---------------------------- | ------------------------------------- |
| `ENV_MODE`                 | Environment mode             | `development` or `production`         |
| `PORT`                     | Server port                  | `8080`                                |
| `LOG_LEVEL`                | Logging level                | `debug`, `info`, `warn`, `error`      |
| `DATABASE_URL`             | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `ACCESS_TOKEN_SECRET`      | JWT access token secret      | Min 32 characters                     |
| `ACCESS_TOKEN_EXPIRES_IN`  | Access token TTL             | `15m`, `1h`                           |
| `REFRESH_TOKEN_SECRET`     | JWT refresh token secret     | Min 32 characters                     |
| `REFRESH_TOKEN_EXPIRES_IN` | Refresh token TTL            | `7d`, `30d`                           |
| `REFRESH_TOKEN_MAX_AGE`    | Cookie max age (ms)          | `604800000` (7 days)                  |

### Database Migrations

```bash
# Run all migrations
psql -d ocean_chat -f db/migration/001_main_schema.sql
psql -d ocean_chat -f db/migration/002_add_is_read_to_notifications.sql

# Rollback (manual - create down migrations as needed)
```

## 🚢 Deployment

### Fly.io Deployment

1. **Install Fly CLI**

   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login**

   ```bash
   fly auth login
   ```

3. **Deploy**

   ```bash
   fly deploy
   ```

4. **Set secrets**
   ```bash
   fly secrets set DATABASE_URL="postgresql://..."
   fly secrets set ACCESS_TOKEN_SECRET="your-secret"
   fly secrets set REFRESH_TOKEN_SECRET="your-secret"
   ```

### Docker Deployment

```bash
# Build image
docker build -t ocean-chat-server .

# Run container
docker run -p 8080:8080 --env-file .env ocean-chat-server
```

### Production Checklist

- [ ] Set strong JWT secrets (min 32 characters)
- [ ] Configure production DATABASE_URL
- [ ] Set ENV_MODE=production
- [ ] Configure CORS allowed origins
- [ ] Set up database backups
- [ ] Configure Grafana monitoring
- [ ] Enable HTTPS/TLS
- [ ] Set appropriate LOG_LEVEL

## Observability

### Logging

The server uses custom structured logging with:

- Request ID tracking
- Tab ID tracking
- Timestamp
- Log level
- Context metadata

**Example log:**

```json
{
  "level": "info",
  "timestamp": "2024-01-01T00:00:00Z",
  "requestId": "uuid",
  "tabId": "uuid",
  "message": "User logged in",
  "userId": "uuid"
}
```

### Error Handling

Custom error classes extend native Error:

- `ValidationError` - Input validation failures
- `AuthenticationError` - Auth failures
- `AuthorizationError` - Permission denied
- `NotFoundError` - Resource not found
- `ConflictError` - Duplicate operations
- `DatabaseError` - Database failures

### Monitoring

Logs are integrated with **Grafana** for:

- Request rate monitoring
- Error rate tracking
- Response time analysis
- Database query performance
- WebSocket connection metrics

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License

## Author

**Sang Le Thanh**  
Backend Developer

---

**Built with using Bun.js**
