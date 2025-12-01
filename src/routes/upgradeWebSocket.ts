import type {
  DataWebSocket,
  ConversationIdentifier,
  UserTokenPayload,
  HttpResponse,
} from "../types";
import { parseAuthToken, authMiddleware } from "../middlewares";
import { getConversationIdentifiersController } from "../controllers";

export async function handleUpgradeWebSocket(
  server: Bun.Server<DataWebSocket>,
  req: Request,
  corsHeaders: any
) {
  try {
    // Parse auth token
    const auth = parseAuthToken(req);
    if (typeof auth !== "string" && "status" in auth && "message" in auth) {
      return new Response(JSON.stringify({ message: auth.message }), {
        status: auth.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify auth token
    const authResult: UserTokenPayload | null = authMiddleware(auth);
    if (!authResult) {
      return new Response(
        JSON.stringify({ message: "Invalid or expired auth token." }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Call conversation identifiers controller
    const conversationIdentifiers:
      | HttpResponse
      | ConversationIdentifier[]
      | null = await getConversationIdentifiersController(
      authResult.data.userId
    );
    if (!conversationIdentifiers) {
      return new Response(
        JSON.stringify({ message: "Failed to get conversation identifier." }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    if (
      "status" in conversationIdentifiers &&
      "message" in conversationIdentifiers
    ) {
      return new Response(
        JSON.stringify({ message: conversationIdentifiers.message }),
        {
          status: conversationIdentifiers.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Upgrade websocket
    const upgraded = server.upgrade(req, {
      data: {
        ...authResult.data,
        accessToken: auth,
        conversationIdentifiers,
      },
    });

    if (!upgraded) {
      return new Response("Upgrade failed", {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ message: "Upgrade websocket successfully" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.log("Handle upgrade websocket error: ", err);
    return new Response(
      JSON.stringify({
        message: "Upgrade websocket error. Please try again later.",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
}
