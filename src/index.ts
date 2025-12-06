import type { DataWebSocket } from "./types/ws";
import {
  handleRegister,
  handleLogin,
  handleCreateConversation,
  handleSendMessage,
  handleAddParticipants,
  handleNotificationFriend,
  handleNotificationAcceptFriend,
  handleNotificationDenyFriend,
  handleGetAllInfoUsers,
  handleGetConversations,
  handleGetMessages,
  handleUpgradeWebSocket,
} from "./routes";
import { addWsConnection, removeWsConnection } from "./websocket/gateway";

const PORT = Number(process.env.PORT || 3000);

const server = Bun.serve<DataWebSocket>({
  port: PORT,
  hostname: "localhost",

  async fetch(req, server) {
    const url = new URL(req.url);
    const path = url.pathname;
    const method = req.method;

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    // POST /register
    if (path === "/register" && method === "POST") {
      return await handleRegister(req, corsHeaders);
    }

    // POST /login
    if (path === "/login" && method === "POST") {
      return await handleLogin(req, corsHeaders);
    }

    // POST /conversation
    if (path === "/conversation" && method === "POST") {
      return await handleCreateConversation(req, corsHeaders);
    }

    // POST /message
    if (path === "/message" && method === "POST") {
      return await handleSendMessage(req, corsHeaders);
    }

    // POST /participants
    if (path === "/participants" && method === "POST") {
      return await handleAddParticipants(req, corsHeaders);
    }

    // POST /notification/friend
    if (path === "/notification/friend") {
      return await handleNotificationFriend(url, req, corsHeaders);
    }

    // POST /notification/friend/accept
    if (path === "/notification/friend/accept" && method === "POST") {
      return await handleNotificationAcceptFriend(url, req, corsHeaders);
    }

    // POST /notification/friend/deny
    if (path === "/notification/friend/deny" && method === "POST") {
      return await handleNotificationDenyFriend(url, req, corsHeaders);
    }

    // GET /users
    if (path === "/users" && method === "GET") {
      return await handleGetAllInfoUsers(req, corsHeaders);
    }

    // GET /conversations
    if (path === "/conversations" && method === "GET") {
      return await handleGetConversations(req, corsHeaders);
    }

    // GET /messages
    if (path === "/messages" && method === "GET") {
      return await handleGetMessages(url, req, corsHeaders);
    }

    // Upgrade websocket
    if (req.headers.get("Upgrade")?.toLowerCase() === "websocket") {
      return await handleUpgradeWebSocket(server, req, corsHeaders);
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
