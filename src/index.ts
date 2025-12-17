import type { DataWebSocket } from "./types/ws";
import type { BaseLogger } from "./helpers/logger";
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
import { blacklistSessions } from "./models";
import { addWsConnection, removeWsConnection } from "./websocket/gateway";

setInterval(() => {
  blacklistSessions.clear();
  console.log("Blacklist of access token cleared");
}, 60 * 60 * 1000);

const PORT = Number(process.env.PORT || 8080);

const server = Bun.serve<DataWebSocket>({
  port: PORT,
  hostname: "0.0.0.0",

  async fetch(req, server) {
    const url = new URL(req.url);
    const path = url.pathname;
    const method = req.method;

    const requestId = crypto.randomUUID();

    const baseLogger: BaseLogger = {
      endpoint: `${method} ${path}`,
      requestId,
      event: "HTTP Request",
      timestamp: new Date().toISOString(),
    };

    const corsHeaders = {
      "Access-Control-Allow-Origin": "http://localhost:3000",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Expose-Headers": "x-trace-id",
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
      return await handleRegister(baseLogger, req, corsHeaders);
    }

    // POST /auth/login
    if (path === "/auth/login" && method === "POST") {
      return await handleLogin(baseLogger, req, corsHeaders);
    }

    // POST /auth/logout
    if (path === "/auth/logout" && method === "POST") {
      return await handleLogout(baseLogger, req, corsHeaders);
    }

    // POST /auth/refresh/token
    if (path === "/auth/refresh/token" && method === "GET") {
      return await handleRefreshAuthToken(baseLogger, req, corsHeaders);
    }

    // POST /conversation
    if (path === "/conversation" && method === "POST") {
      return await handleCreateConversation(baseLogger, req, corsHeaders);
    }

    // POST /conversation/message
    if (path === "/conversation/message" && method === "POST") {
      return await handleSendMessage(baseLogger, req, corsHeaders);
    }

    // POST /conversation/participants
    if (path === "/conversation/participants" && method === "POST") {
      return await handleAddParticipants(baseLogger, req, corsHeaders);
    }

    // POST /notification/friend
    if (path === "/notification/friend") {
      return await handleNotificationAddFriend(
        baseLogger,
        url,
        req,
        corsHeaders
      );
    }

    // POST /notification/friend/accept
    if (path === "/notification/friend/accept" && method === "POST") {
      return await handleNotificationAcceptFriend(
        baseLogger,
        url,
        req,
        corsHeaders
      );
    }

    // POST /notification/friend/deny
    if (path === "/notification/friend/deny" && method === "POST") {
      return await handleNotificationDenyFriend(
        baseLogger,
        url,
        req,
        corsHeaders
      );
    }

    // GET /profile/users
    if (path === "/profile/users" && method === "GET") {
      return await handleGetAllProfileUsers(baseLogger, req, corsHeaders);
    }

    // GET /profile/user
    if (path === "/profile/user" && method === "GET") {
      return await handleGetProfileUser(baseLogger, url, req, corsHeaders);
    }

    // GET /conversations?userId=...
    if (path === "/conversations" && method === "GET") {
      return await handleGetConversations(baseLogger, url, req, corsHeaders);
    }

    // GET /conversations/messages?conversationId=...&limit=...&offset=...
    if (path === "/conversations/messages" && method === "GET") {
      return await handleGetMessages(baseLogger, url, req, corsHeaders);
    }

    // Upgrade websocket
    if (req.headers.get("Upgrade")?.toLowerCase() === "websocket") {
      return await handleUpgradeWebSocket(baseLogger, server, req, corsHeaders);
    }

    return new Response(JSON.stringify({ message: "not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  },

  websocket: {
    data: {} as DataWebSocket,

    open(ws) {
      console.log("Upgrade websocket successfully.");
      addWsConnection(ws);
    },

    async message(ws) {},

    close(ws) {
      removeWsConnection(ws);
    },
  },
});

console.log(`Server listening on ${server.url}`);
