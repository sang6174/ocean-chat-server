import type { DataWebSocket } from "./types/ws";
import { logger, requestContextStorage } from "./helpers/logger";
import {
  handleRegister,
  handleLogin,
  handleLogout,
  handleRefreshAuthToken,
  handleCreateConversation,
  handleSendMessage,
  handleAddParticipants,
  handleNotificationAddFriend,
  handleNotificationAcceptFriend,
  handleNotificationDenyFriend,
  handleGetAllProfileUsers,
  handleGetProfileUser,
  handleGetConversations,
  handleGetMessages,
  handleUpgradeWebSocket,
} from "./routes";
import { blacklistAuthToken, blacklistRefreshToken } from "./models";
import { addWsConnection, removeWsConnection } from "./websocket/gateway";

setInterval(() => {
  blacklistAuthToken.clear();
  console.log("Blacklist of auth token cleared");
}, 60 * 60 * 1000);

setInterval(() => {
  blacklistRefreshToken.clear;
  console.log("Blacklist of refresh token cleared");
}, 5 * 24 * 60 * 60 * 1000);

const PORT = Number(process.env.PORT || 8080);

const server = Bun.serve<DataWebSocket>({
  port: PORT,
  hostname: "0.0.0.0",

  async fetch(req, server) {
    const url = new URL(req.url);
    const path = url.pathname;
    const method = req.method;

    const ctx = {
      requestId: crypto.randomUUID(),
      method,
      path,
      startTime: Date.now(),
    };

    const corsHeaders = {
      "Access-Control-Allow-Origin": "http://localhost:5173",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Expose-Headers": "x-request-id",
    };

    // OPTIONS
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    // POST /auth/register
    if (path === "/auth/register" && method === "POST") {
      return requestContextStorage.run(ctx, () => {
        return handleRegister(req, corsHeaders);
      });
    }

    // POST /auth/login
    if (path === "/auth/login" && method === "POST") {
      return requestContextStorage.run(ctx, () => {
        return handleLogin(req, corsHeaders);
      });
    }

    // GET /profile/users
    if (path === "/profile/users" && method === "GET") {
      return requestContextStorage.run(ctx, () => {
        return handleGetAllProfileUsers(req, corsHeaders);
      });
    }

    // GET /profile/user
    if (path === "/profile/user" && method === "GET") {
      return requestContextStorage.run(ctx, () => {
        return handleGetProfileUser(req, corsHeaders);
      });
    }

    // GET /conversations?userId=...
    if (path === "/conversations" && method === "GET") {
      return requestContextStorage.run(ctx, () => {
        return handleGetConversations(url, req, corsHeaders);
      });
    }

    // GET /conversations/messages?conversationId=...&limit=...&offset=...
    if (path === "/conversations/messages" && method === "GET") {
      return requestContextStorage.run(ctx, () => {
        return handleGetMessages(url, req, corsHeaders);
      });
    }

    // GET /auth/refresh/token
    if (path === "/auth/refresh/token" && method === "GET") {
      return requestContextStorage.run(ctx, () => {
        return handleRefreshAuthToken(req, corsHeaders);
      });
    }

    // POST /auth/logout
    if (path === "/auth/logout" && method === "POST") {
      return requestContextStorage.run(ctx, () => {
        return handleLogout(url, req, corsHeaders);
      });
    }

    // POST /conversation
    if (path === "/conversation" && method === "POST") {
      return requestContextStorage.run(ctx, () => {
        return handleCreateConversation(req, corsHeaders);
      });
    }

    // POST /conversation/message
    if (path === "/conversation/message" && method === "POST") {
      return requestContextStorage.run(ctx, () => {
        return handleSendMessage(req, corsHeaders);
      });
    }

    // POST /conversation/participants
    if (path === "/conversation/participants" && method === "POST") {
      return requestContextStorage.run(ctx, () => {
        return handleAddParticipants(req, corsHeaders);
      });
    }

    // POST /notification/friend
    if (path === "/notification/friend") {
      return requestContextStorage.run(ctx, () => {
        return handleNotificationAddFriend(url, req, corsHeaders);
      });
    }

    // POST /notification/friend/accept
    if (path === "/notification/friend/accept" && method === "POST") {
      return requestContextStorage.run(ctx, () => {
        return handleNotificationAcceptFriend(url, req, corsHeaders);
      });
    }

    // POST /notification/friend/deny
    if (path === "/notification/friend/deny" && method === "POST") {
      return requestContextStorage.run(ctx, () => {
        return handleNotificationDenyFriend(url, req, corsHeaders);
      });
    }

    // Upgrade websocket
    if (req.headers.get("Upgrade")?.toLowerCase() === "websocket") {
      return requestContextStorage.run(ctx, () => {
        return handleUpgradeWebSocket(server, url, req, corsHeaders);
      });
    }

    return new Response(JSON.stringify({ message: "not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  },

  websocket: {
    data: {} as DataWebSocket,

    open(ws) {
      logger.info("Upgrade websocket successfully.");
      addWsConnection(ws);
    },

    async message(ws) { },

    close(ws) {
      removeWsConnection(ws);
    },
  },
});

console.log(`Server listening on ${server.url}`);
