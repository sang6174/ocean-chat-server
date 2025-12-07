import type { UserTokenPayload } from "../types/domain";
import { parseAuthToken, authMiddleware, isUUIDv4 } from "../middlewares";
import { getMessagesController } from "../controllers";

export async function handleGetMessages(
  url: URL,
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

    // Get and validate search params
    const conversationId = url.searchParams.get("conversationId");
    const limit = url.searchParams.get("limit") || 10;
    const offset = url.searchParams.get("offset") || 0;
    if (!conversationId) {
      return new Response(
        JSON.stringify({ message: "Search params is invalid." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const isValidConversationId = isUUIDv4(conversationId);
    if (!isValidConversationId) {
      return new Response(
        JSON.stringify({ message: "Search params is invalid." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const limitNum = Number(limit);
    if (isNaN(limitNum) || limitNum <= 0) {
      return new Response(
        JSON.stringify({
          message:
            "search params is invalid. Limit must be a positive integer.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const offsetNum = Number(offset);
    if (isNaN(offsetNum) || offsetNum < 0) {
      return new Response(
        JSON.stringify({
          message:
            "search params is invalid. Offset must be a non-negative integer.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Call get messages controller
    const result = await getMessagesController(
      conversationId,
      limitNum,
      offsetNum
    );
    if (!result) {
      return new Response(JSON.stringify("Get all messages error"), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // HTTP response successfully
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.log(
      `[ROUTE_ERROR] - ${new Date().toISOString()} - Get messages error.\n`,
      err
    );
    return new Response(
      JSON.stringify({
        message: "Get messages error. Please try again later.",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
}
