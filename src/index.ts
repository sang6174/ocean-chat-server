import type { DataWebSocket } from "./types/ws";
import { env } from "./configs/env";
import { router } from "./configs/router";
import { requestContextStorage } from "./helpers/contexts";
import { logger } from "./helpers/logger";
import { checkRateLimit, getRateLimitKey, getRateLimitStatus } from "./middlewares/rateLimiting";
import {
  handleRegister,
  handleLogin,
  handleLogout,
  handleGenerateAuthToken,
  handleCreateGroupConversation,
  handleSendMessage,
  handleAddParticipants,
  handleSendFriendRequest,
  handleAcceptFriendRequest,
  handleRejectFriendRequest,
  handleGetAllProfileUsers,
  handleGetProfileUser,
  handleGetConversations,
  handleGetMessages,
  handleUpgradeWebSocket,
  handleGetNotifications,
  handleCancelFriendRequest,
  handleMarkNotificationsAsRead,
} from "./routes";
import { addWsConnection, removeWsConnection } from "./websocket/main";

// Register routes
router.post("/v1/auth/register", handleRegister);
router.post("/v1/auth/login", handleLogin);
router.post("/v1/auth/refresh", handleGenerateAuthToken);
router.post("/v1/auth/logout", handleLogout);
router.get("/v1/profile/user", handleGetProfileUser);
router.get("/v1/profile/users", handleGetAllProfileUsers);
router.post("/v1/conversation/group", handleCreateGroupConversation);
router.post("/v1/conversation/message", handleSendMessage);
router.post("/v1/conversation/participants", handleAddParticipants);
router.get("/v1/conversations", handleGetConversations);
router.get("/v1/conversation/messages", handleGetMessages);
router.post("/v1/notification/friend-request", handleSendFriendRequest);
router.get("/v1/notifications", handleGetNotifications);
router.put("/v1/notifications/read", handleMarkNotificationsAsRead);
router.post("/v1/notification/friend-request/cancel", handleCancelFriendRequest);
router.post("/v1/notification/friend-request/accept", handleAcceptFriendRequest);
router.post("/v1/notification/friend-request/reject", handleRejectFriendRequest);

const server = Bun.serve<DataWebSocket>({
  port: env.port,
  hostname: "0.0.0.0",

  async fetch(req, server) {
    const url = new URL(req.url);
    const path = url.pathname;
    const method = req.method;

    const headers = req.headers;
    const tabId: string = headers.get("X-Tab-Id") ?? crypto.randomUUID();
    const ctx = {
      tabId,
      requestId: crypto.randomUUID(),
      method,
      path,
      startTime: Date.now(),
    };

    // Rate limiting check
    const rateLimitKey = getRateLimitKey(req);
    if (!checkRateLimit(rateLimitKey)) {
      const status = getRateLimitStatus(rateLimitKey);
      return new Response(
        JSON.stringify({
          code: "RATE_LIMIT_EXCEEDED",
          message: "Too many requests. Please try again later.",
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "X-RateLimit-Remaining": status.remaining.toString(),
            "X-RateLimit-Reset": status.reset.toString(),
          },
        }
      );
    }

    const origin = req.headers.get("Origin") || env.corsOrigin;
    const corsHeaders = {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Tab-Id",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Expose-Headers": "x-request-id",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
      "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    };

    // OPTIONS (CORS preflight)
    if (method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // WebSocket upgrade
    if (req.headers.get("Upgrade")?.toLowerCase() === "websocket") {
      return requestContextStorage.run(ctx, () =>
        handleUpgradeWebSocket(server, req, corsHeaders)
      );
    }

    // Router dispatch
    const match = router.match(method, path);
    if (match) {
      return requestContextStorage.run(ctx, () =>
        match.handler(req, corsHeaders, match.params)
      );
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

    async message() {},

    close(ws) {
      removeWsConnection(ws);
    },
  },
});

console.log(`Server listening on ${server.url}`);
