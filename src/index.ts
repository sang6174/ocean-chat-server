import { handleRegister, handleLogin } from "./routes";

const PORT = Number(process.env.PORT || 3000);

const server = Bun.serve({
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

    return new Response(JSON.stringify({ message: "not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  },
});

console.log(`Server listening on ${server.url}`);
