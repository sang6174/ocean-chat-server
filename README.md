# Ocean Chat Server

## Tech Stack

- **Language**: TypeScript
- **Runtime**: BunJS
- **Database**: PostgreSQL
- **WebSocket**: Websocket in BunJS
- **Authentication**: JWT
- **Validation**: Self-written
- **Pub/Sub**: Self-written
- **Observability**: Extending Error, AsyncContextStorage and Grafana
- **Deployment**: Fly.io, Neon

## Architecture Overview

The project follows a **Layered Architecture** pattern to separate concerns and improve maintainability:

- **Presentation Layer (Controllers)**: Handles HTTP requests, parses input, and invokes services.
- **Business Logic Layer (Services)**: Contains the core business rules and orchestration logic.
- **Data Access Layer (Repositories)**: Abstracts database interactions.
- **Data Persistence (Models)**: Direct database queries and interactions using `pg`.

The application uses **Bun** as the JavaScript runtime for performance and built-in tooling (test runner, bundler). \*\*WebSocket\*\* communication is handled natively by Bun's `Bun.serve` for real-time features.

## Project Structure

```bash
src/
├── configs/
├── controllers/
├── helpers/
├── middlewares/
├── models/
├── repository/
├── routes/
├── services/
├── types/
├── websocket/
└── index.ts
```

## Setup & Installation

### Prerequisites

- BunJS >= 1.3
- PostgreSQL

### Installation

```Bash
git clone https://github.com/sang6174/ocean-chat-server.git
cd ocean-chat-server
npm install
```

### .ENV

```Bash
ENV_MODE
PORT
LOG_LEVEL
DATABASE_URL

ACCESS_TOKEN_SECRET
ACCESS_TOKEN_EXPIRES_IN
REFRESH_TOKEN_SECRET
REFRESH_TOKEN_EXPIRES_IN
REFRESH_TOKEN_MAX_AGE
```

### Running the Project

## API Endpoints

### POST /v1/auth/register - Register a new account/user

### POST /v1/auth/login - Log in by a account

### GET /v1/auth/access-token - Generate a new access token due to old access token is expired

### POST /v1/auth/logout - Log out of a account

### GET /v1/profile/user - Get profile of the user by user id via access token

### GET /v1/profile/users - Get all profile of all users in database

### POST /v1/conversation/group - Create a new group conversation

### POST /v1/conversation/message - Send a message to the conversation

### GET /v1/conversations - Get all conversation of a user

### GET /v1/conversation/messages?conversationId=...&limit=...&offset=... - Get messages for a conversation

### POST /v1/notification/friend-request - Send a friend request to a user

### GET /v1/notifications - Get all notifications of a user

### PUT /v1/notification/read - Update when the user read user's notifications

### POST /v1/notification/friend-request/cancel - The sender cancel the friend request they had sent to the recipient.

### POST /v1/notification/friend-request/accept - The person who received the friend request accepted the friend request.

### POST /v1/notification/friend-request/deny - The person who received the friend request declined the friend request.

## Database Schema

This project uses a relational database to store user, account and domain-specific data.

### Entity Relationships

- A `User` has one `Account`.
- A `User` can participate in multiple `Conversations`.
- A `User` can generate multiple `Notifications`.
- A `User` can receive multiple `Notifications`.
- A `Conversation` can be of type `myself`. `direct` or `group`.
- A `Conversation` has multiple `Participants`.
- A `Conversation` contains multiple `Messages`.
- A `Participant` represents a user's membership in a conversation.
- A `Message` is sent by a `Participant`.

### Indexing

- `idx_accounts_user_id` for one-one mapping.
- `idx_participants_user_id` for fetch all conversations of a user
- `idx_conversations_last_event` for sort conversation along to last event
- `idx_messages_conversation_id` for fetch messages in a conversation
- `idx_participants_conversation_id` for fetch participants in a conversation
- `idx_notifications_recipient_id` for fetch notifications sended to a user

## Observability

- Custom error handling implemented by extending the native `Error` class to provide
  structured and consistent error metadata.
- Centralized logging integrated with Fly.io observability stack.
- Logs are collected using Grafana for monitoring, debugging, and performance analysis.

## Future Improvements

## Author

Sang Le Thanh\
Backend Developer
