import type { DataWebSocket } from "./types/ws";
import { requestContextStorage } from "./helpers/contexts";
import { logger } from "./helpers/logger";
import {
  handleRegister,
  handleLogin,
  handleLogout,
  handleGenerateAccessToken,
  handleCreateGroupConversation,
  handleSendMessage,
  handleAddParticipants,
  handleSendFriendRequest,
  handleAcceptFriendRequest,
  handleDenyFriendRequest,
  handleGetAllProfileUsers,
  handleGetProfileUser,
  handleGetConversations,
  handleGetMessages,
  handleUpgradeWebSocket,
  handleGetNotifications,
  handleCancelFriendRequest,
  handleMarkNotificationsAsRead,
} from "./routes";
import { blacklistAccessToken, blacklistRefreshToken } from "./models";
import { addWsConnection, removeWsConnection } from "./websocket/main";

setInterval(() => {
  blacklistAccessToken.clear();
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

    const headers = req.headers;
    let tabId: string = headers.get("X-Tab-Id") ?? crypto.randomUUID();
    const ctx = {
      tabId,
      requestId: crypto.randomUUID(),
      method,
      path,
      startTime: Date.now(),
    };

    const origin =
      req.headers.get("Origin") || "https://ocean-chat-web.vercel.app";
    const corsHeaders = {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Tab-Id",
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

    // POST /v1/auth/register
    if (path === "/v1/auth/register" && method === "POST") {
      return requestContextStorage.run(ctx, () => {
        return handleRegister(req, corsHeaders);
      });
    }

    // POST /v1/auth/login
    if (path === "/v1/auth/login" && method === "POST") {
      return requestContextStorage.run(ctx, () => {
        return handleLogin(req, corsHeaders);
      });
    }

    // GET /v1/auth/access-token
    if (path === "/v1/auth/access-token" && method === "GET") {
      return requestContextStorage.run(ctx, () => {
        return handleGenerateAccessToken(req, corsHeaders);
      });
    }

    // POST /v1/auth/logout
    if (path === "/v1/auth/logout" && method === "POST") {
      return requestContextStorage.run(ctx, () => {
        return handleLogout(url, req, corsHeaders);
      });
    }

    // GET /v1/profile/user
    if (path === "/v1/profile/user" && method === "GET") {
      return requestContextStorage.run(ctx, () => {
        return handleGetProfileUser(req, corsHeaders);
      });
    }

    // GET /v1/profile/users
    if (path === "/v1/profile/users" && method === "GET") {
      return requestContextStorage.run(ctx, () => {
        return handleGetAllProfileUsers(req, corsHeaders);
      });
    }

    // POST /v1/conversation/group
    if (path === "/v1/conversation/group" && method === "POST") {
      return requestContextStorage.run(ctx, () => {
        return handleCreateGroupConversation(req, corsHeaders);
      });
    }

    // POST /v1/conversation/message
    if (path === "/v1/conversation/message" && method === "POST") {
      return requestContextStorage.run(ctx, () => {
        return handleSendMessage(req, corsHeaders);
      });
    }

    // POST /v1/conversation/participants
    if (path === "/v1/conversation/participants" && method === "POST") {
      return requestContextStorage.run(ctx, () => {
        return handleAddParticipants(req, corsHeaders);
      });
    }

    // GET /v1/conversations
    if (path === "/v1/conversations" && method === "GET") {
      return requestContextStorage.run(ctx, () => {
        return handleGetConversations(url, req, corsHeaders);
      });
    }

    // GET /v1/conversation/messages?conversationId=...&limit=...&offset=...
    if (path === "/v1/conversation/messages" && method === "GET") {
      return requestContextStorage.run(ctx, () => {
        return handleGetMessages(url, req, corsHeaders);
      });
    }

    // POST /v1/notification/friend-request
    if (path === "/v1/notification/friend-request" && method === "POST") {
      return requestContextStorage.run(ctx, () => {
        return handleSendFriendRequest(url, req, corsHeaders);
      });
    }

    // GET /v1/notifications
    if (path === "/v1/notifications" && method === "GET") {
      return requestContextStorage.run(ctx, () => {
        return handleGetNotifications(req, corsHeaders);
      });
    }

    // PUT /v1/notifications/read
    if (path === "/v1/notifications/read" && method === "PUT") {
      return requestContextStorage.run(ctx, () => {
        return handleMarkNotificationsAsRead(url, req, corsHeaders);
      });
    }

    // POST /v1/notification/friend-request/cancel
    if (
      path === "/v1/notification/friend-request/cancel" &&
      method === "POST"
    ) {
      return requestContextStorage.run(ctx, () => {
        return handleCancelFriendRequest(url, req, corsHeaders);
      });
    }

    // POST /v1/notification/friend-request/accept
    if (
      path === "/v1/notification/friend-request/accept" &&
      method === "POST"
    ) {
      return requestContextStorage.run(ctx, () => {
        return handleAcceptFriendRequest(url, req, corsHeaders);
      });
    }

    // POST /v1/notification/friend-request/deny
    if (path === "/v1/notification/friend-request/deny" && method === "POST") {
      return requestContextStorage.run(ctx, () => {
        return handleDenyFriendRequest(url, req, corsHeaders);
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

    async message(ws) {},

    close(ws) {
      removeWsConnection(ws);
    },
  },
});

console.log(`Server listening on ${server.url}`);
