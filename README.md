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

The application uses **Bun** as the JavaScript runtime for performance and built-in tooling (test runner, bundler). **WebSocket** communication is handled natively by Bun's `Bun.serve` for real-time features.

## Project Structure

```bash
src/
├── configs/        # Configuration files (Database)
├── controllers/    # Request handlers (API endpoints)
├── helpers/        # Utility functions (Error handling, Logger, etc.)
├── middlewares/    # Custom middlewares (Validation, Authentication)
├── models/         # Database models and raw SQL queries
├── repository/     # Repository pattern implementation
├── routes/         # Route definitions
├── services/       # Business logic implementation
├── types/          # TypeScript type definitions (Domain entities, DTOs)
├── websocket/      # WebSocket event handlers and logic
└── index.ts        # Application entry point
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

### **`POST /v1/auth/register`**: Used to register a new user/account

**Request**

```Bash
POST /v1/auth/register
Content-Type: application/json

{
  "name": "Nguyễn Văn An",
  "email": "vanan1234@gmail.com",
  "username": "vanan1234",
  "password": "vanan2004"
}
```

**Successful Response**

```Bash
POST /v1/auth/register
Content-Type: application/json
X-request-id: uuidv4
X-tab-Id: uuidv4

{
  "status": 201,
  "code": "REGISTER_SUCCESS",
  "message": "Register successfully"
}
```

**Error Response**

**Validation Rules**

- body must be FormData
- name must be string, length is more than 1, less than 33
- email must be valid email. (/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
- username must be string, length is more than 7, less than 33.
- password must be string, length is more than 7, less than 33.

**Notes**

- Hashed password, create a new user/account.
- Use transaction for create a user, account and private chat.

### **`POST /v1/auth/login`**: Used to log in ocean chat

**Request**

```Bash
POST /v1/auth/login
Content-Type: application/json

{
  "username": "vanan1234",
  "password": "vanan2004"
}
```

**Successful Response**

```Bash
POST /v1/auth/login
Content-Type: application/json
X-request-id: uuidv4
X-tab-Id: uuidv4

{
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "username": "vanan1234",
  "accessToken": "ey...",
  "refreshToken": "ey..."
}
```

**Error Response**

**Validation Rules**

**Notes**

- Get account by username and verify password
- Generate access token and refresh token

### **`GET /v1/auth/access-token`**: Used to generate a new access token

**Request**

```Bash
GET /v1/auth/access-token
Content-Type: application/json
Authorization: Bearer refresh_token

```

**Successful Response**

```Bash
GET /v1/auth/access-token
Content-Type: application/json
X-request-id: uuidv4
X-tab-Id: uuidv4

{
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "username": "vanan1234",
  "accessToken": "ey..."
}
```

**Error Response**

**Validation Rules**

**Notes**

- Verify refresh token
- Get account by id. This id in payload of refresh token
- Generate new access token

### **`POST /v1/auth/logout`**: Used to log out ocean chat

**Request**

```Bash
POST /v1/auth/logout
Content-Type: application/json
Authorization: Bearer access_token

```

**Successful Response**

```Bash
POST /v1/auth/logout
Content-Type: application/json
X-request-id: uuidv4
X-tab-Id: uuidv4
{
    "status": 200,
    "code": "LOGOUT_SUCCESS",
    "message": "Logout successfully"
}
"Set-Cookie": "refresh_token=; HttpOnly; Path=/; Max-Age=0",

```

**Error Response**

**Validation Rules**

**Notes**

- Add access token in access token blacklist
- Add refresh token in refresh token blacklist
- After a period equal to the token's expires in, the blacklist will be cleared.

### **`Upgrade WebSocket`**:

**Request**

```Bash
Upgrade: WebSocket
url: /v1?token=...

```

**Successful Response**

```Bash
BunJS handle
```

**Error Response**

```Bash
POST /v1
Content-Type: application/json
X-request-id: uuidv4
X-tab-Id: uuidv4
```

**Validation Rules**

**Notes**

- Access token sended via search params
- Get conversation id of the user and add into contextual data of websocket
- Upgrade websocket by upgrade method of server in BunJS
- In upgrade websocket handler, BunJS help me handshake and switch http to websocket

### **`GET /v1/profile/user`**:

**Request**

```Bash
GET /v1/profile/user
Content-Type: application/json
Authorization: Bearer access_token
```

**Successful Response**

```Bash
GET /v1/profile/user
Content-Type: application/json
X-request-id: uuidv4
X-tab-Id: uuidv4

```

**Error Response**

**Validation Rules**

### **`GET /v1/profile/users`**:

**Request**

```Bash
GET /v1/profile/users
Content-Type: application/json
Authorization: Bearer access_token

```

**Successful Response**

```Bash
GET /v1/profile/users
Content-Type: application/json
X-request-id: uuidv4
X-tab-Id: uuidv4

```

**Error Response**

**Validation Rules**

### **`GET /v1/conversations/group`**: Retrieve all of the user's conversations, limit 10 messages

**Request**

```Bash
GET /v1/conversations
Content-Type: application/json
Authorization: Bearer access_token
{
  "conversation": {
    "type": "group",
    "name": "vanan, vanba, vanbon",
  },
  "participants": {
    "id": uuidv4,
    "username": van
  }
}
```

**Successful Response**

```Bash
GET /v1/conversations
Content-Type: application/json
X-request-id: uuidv4
X-tab-Id: uuidv4

```

**Error Response**

**Validation Rules**

**Notes**

- Retrieve all conversation id of the user
- Retrieve all of the user's conversations sequentially, taking only the 10 most recent messages from each conversation.

### **`GET /v1/conversation/messages?id=uuidv4&limit=...&offset=...`**:

**Request**

```Bash
GET /v1/conversation/messages?id=uuidv4&limit=...&offset=...
Content-Type: application/json

```

**Successful Response**

```Bash
GET /v1/conversation/messages?id=uuidv4&limit=...&offset=...
Content-Type: application/json
X-request-id: uuidv4
X-tab-Id: uuidv4

```

**Error Response**

**Validation Rules**

**Notes**

- Retrieve batch messages along to limit and offset (Pagination with limit and offset)

### **`POST /v1/conversation`**: Create a new group conversation

**Request**

```Bash
POST /v1/conversation
Content-Type: application/json

```

**Successful Response**

```Bash
POST /v1/conversation
Content-Type: application/json
X-request-id: uuidv4
X-tab-Id: uuidv4

```

**Error Response**

**Validation Rules**

**Notes**

- Create a new conversation
- Publish the new conversation to the online client via websocket

### **`POST /v1/conversation/message`**:

**Request**

```Bash
POST /v1/conversation/message
Content-Type: application/json

```

**Successful Response**

```Bash
POST /v1/conversation/message
Content-Type: application/json
X-request-id: uuidv4
X-tab-Id: uuidv4

```

**Error Response**

**Validation Rules**

**Notes**

- Create a new message and get all participants in a transaction
- Publish a new message to the online client via websocket

### **`POST /v1/conversation/participants`**:

**Request**

```Bash
POST /v1/conversation/participants
Content-Type: application/json

```

**Successful Response**

```Bash
POST /v1/conversation/participants
Content-Type: application/json
X-request-id: uuidv4
X-tab-Id: uuidv4

```

**Error Response**

**Validation Rules**

**Notes**

- Add participants into participants table and get the conversation in a transaction
- Publish the conversation to new participants via websocket
- Publish new participant to old participants via websocket

### **`POST /v1/notification/friend-request`**:

**Request**

```Bash
POST /v1/notification/friend-request
Content-Type: application/json

```

**Successful Response**

```Bash
POST /v1/notification/friend-request
Content-Type: application/json
X-request-id: uuidv4
X-tab-Id: uuidv4

```

**Error Response**

**Validation Rules**

**Notes**

- Create a new notification with `status is pending`
- Publish the notification to the recipient

### **`POST /v1/notification/friend-request/deny`**:

**Request**

```Bash
POST /v1/notification/friend-request/deny
Content-Type: application/json

```

**Successful Response**

```Bash
POST /v1/notification/friend-request/deny
Content-Type: application/json
X-request-id: uuidv4
X-tab-Id: uuidv4

```

**Error Response**

**Validation Rules**

**Notes**

- Update status of old notification to deny
- Allow user who sended friend request send new friend request

### **`POST /v1/notification/friend-request/accept`**:

**Request**

```Bash
POST /v1/notification/friend-request/accept
Content-Type: application/json

```

**Successful Response**

```Bash
POST /v1/notification/friend-request/accept
Content-Type: application/json
X-request-id: uuidv4
X-tab-Id: uuidv4

```

**Error Response**

**Validation Rules**

**Notes**

- Update status of notification to accepted
- Create a new conversation with type is direct
- Publish the new conversation to recipient whom sended friend request

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
