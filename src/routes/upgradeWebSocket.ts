import type {
  UserTokenPayload,
  GetConversationIdsRepositoryInput,
} from "../types/domain";
import type { DataWebSocket } from "../types/ws";
import { authMiddleware } from "../middlewares";
import { getConversationIdsController } from "../controllers";
import { handleError } from "../helpers/errors";
import { logger } from "../helpers/logger";

// ============================================================
// Upgrade WebSocket
// ============================================================
export async function handleUpgradeWebSocket(
  server: Bun.Server<DataWebSocket>,
  url: URL,
  req: Request,
  corsHeaders: any
) {
  try {
    // Get auth token
    const token = url.searchParams.get("token");
    if (!token) {
      return new Response(
        JSON.stringify({
          code: "AUTH_ERROR",
          message: "Please send token via search params",
        }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "x-request-id": logger.requestId,
          },
        }
      );
    }
    const auth = "Bearer " + token;

    // Verify auth token
    const authResult: UserTokenPayload | null = authMiddleware(auth);
    if (!authResult) {
      return new Response(
        JSON.stringify({
          code: "AUTH_ERROR",
          message: "Invalid or expired auth token.",
        }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "x-request-id": logger.requestId,
          },
        }
      );
    }

    // Call conversation identifiers controller
    const input: GetConversationIdsRepositoryInput = {
      userId: authResult.data.userId,
    };

    const conversation = await getConversationIdsController(input);

    // Upgrade websocket
    const upgraded = server.upgrade(req, {
      data: {
        ...authResult.data,
        authToken: auth,
        conversationIds: conversation.ids,
      },
    });

    if (!upgraded) {
      return new Response("Upgrade failed", {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "x-request-id": logger.requestId,
        },
      });
    }

    return new Response(
      JSON.stringify({ message: "Upgrade websocket successfully" }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "x-request-id": logger.requestId,
        },
      }
    );
  } catch (err) {
    const errorResponse = handleError(err, corsHeaders);
    if (errorResponse) {
      return errorResponse;
    }

    return new Response(
      JSON.stringify({
        code: "INTERNAL_ERROR",
        message: "Upgrade websocket error. Please try again later.",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "x-request-id": logger.requestId,
        },
      }
    );
  }
}
