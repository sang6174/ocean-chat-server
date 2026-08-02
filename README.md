# Ocean Chat Server

Real-time chat backend — Bun.js + TypeScript + PostgreSQL.

## Quick Start

```bash
git clone https://github.com/sang6174/ocean-chat-server.git
cd ocean-chat-server
bun install
cp .env.example .env   # fill in your DATABASE_URL and secrets
psql -d ocean_chat -f db/migration/001_main_schema.sql
psql -d ocean_chat -f db/migration/002_add_is_read_to_notifications.sql
bun run dev
# Server → http://localhost:3012
```

## Stack

| Layer      | Tech                                  |
| ---------- | ------------------------------------- |
| Runtime    | Bun.js                                |
| Language   | TypeScript                            |
| Database   | PostgreSQL                            |
| Auth       | JWT (access + refresh token rotation) |
| Real-time  | WebSocket via Bun.serve               |
| Validation | Custom validators (HTTP + Domain)     |
| Testing    | Vitest (87 tests)                     |

## Project Layout

```
src/
├── index.ts              # Entry — router, CORS, rate limiter, WS upgrade
├── configs/              # env, database pool, router
├── routes/               # HTTP handlers (parse → validate → respond)
├── controllers/          # Thin layer — call services
├── services/             # Business logic
├── repository/           # Data access abstraction
├── models/               # Raw SQL queries
├── middlewares/          # Auth, validation, rate limiting
├── helpers/              # Logger, errors, sanitizer, contexts
├── websocket/            # WS manager, event bus, debounce
└── types/                # Domain + HTTP + WebSocket types
```

## API

| Method | Path                                     | Auth   |
| ------ | ---------------------------------------- | ------ |
| `POST` | `/v1/auth/register`                      | No     |
| `POST` | `/v1/auth/login`                         | No     |
| `POST` | `/v1/auth/refresh`                       | Cookie |
| `POST` | `/v1/auth/logout`                        | Bearer |
| `GET`  | `/v1/profile/user`                       | Bearer |
| `GET`  | `/v1/profile/users`                      | Bearer |
| `POST` | `/v1/conversation/group`                 | Bearer |
| `POST` | `/v1/conversation/message`               | Bearer |
| `POST` | `/v1/conversation/participants`          | Bearer |
| `GET`  | `/v1/conversations`                      | Bearer |
| `GET`  | `/v1/conversation/messages`              | Bearer |
| `POST` | `/v1/notification/friend-request`        | Bearer |
| `GET`  | `/v1/notifications`                      | Bearer |
| `PUT`  | `/v1/notifications/read`                 | Bearer |
| `POST` | `/v1/notification/friend-request/accept` | Bearer |
| `POST` | `/v1/notification/friend-request/reject` | Bearer |
| `POST` | `/v1/notification/friend-request/cancel` | Bearer |
| `WS`   | `/` (Upgrade header)                     | Bearer |

### Example: Register

```bash
curl -X POST http://localhost:3012/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Sang","email":"sang@example.com","username":"sang","password":"StrongP@ss1"}'
```

## Environment Variables

| Variable                   | Default                                     |
| -------------------------- | ------------------------------------------- |
| `PORT`                     | `3012`                                      |
| `LOG_LEVEL`                | `debug`                                     |
| `DATABASE_URL`             | — (required)                                |
| `ACCESS_TOKEN_SECRET`      | — (required)                                |
| `ACCESS_TOKEN_EXPIRES_IN`  | `1h`                                        |
| `REFRESH_TOKEN_SECRET`     | — (required)                                |
| `REFRESH_TOKEN_EXPIRES_IN` | `5d`                                        |
| `CORS_ORIGIN`              | `https://ocean-chat-web.vercel.app`         |
| `REDIS_URL`                | — (optional, for distributed rate limiting) |

## Test

```bash
bun test          # 87 tests
bun run test      # via vitest
```
