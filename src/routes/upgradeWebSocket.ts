import type {
  UserTokenPayload,
  GetConversationIdsRepositoryInput,
} from "../types/domain";
import type { DataWebSocket } from "../types/ws";
import { checkAccessTokenMiddleware } from "../middlewares";
import { getConversationIdsController } from "../controllers";
import { handleError } from "../helpers/errors";
import { logger } from "../helpers/logger";
import { RequestContextAccessor } from "../helpers/contexts";

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
    logger.info("Start handle upgrade websocket");

    // Get auth token from search params
    const token = url.searchParams.get("token");
    if (!token) {
      return new Response(
        JSON.stringify({
          code: "SEARCH_PARAMS_INVALID",
          message: "Please send token via search params",
        }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "x-request-id": RequestContextAccessor.getRequestId(),
            "x-tab-id": RequestContextAccessor.getTabId(),
          },
        }
      );
    }

    // Verify auth token
    const authResult = checkAccessTokenMiddleware(token);

    // Call controller
    const input: GetConversationIdsRepositoryInput = {
      userId: authResult.data.userId,
    };

    const conversation = await getConversationIdsController(input);

    // Upgrade websocket
    const upgraded = server.upgrade(req, {
      data: {
        ...authResult.data,
        authToken: token,
        conversationIds: conversation.ids,
      },
    });

    if (!upgraded) {
      return new Response("Upgrade failed", {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "x-request-id": RequestContextAccessor.getRequestId(),
          "x-tab-id": RequestContextAccessor.getTabId(),
        },
      });
    }

    logger.info("Upgrade websocket successfully");
    return;
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
          "x-request-id": RequestContextAccessor.getRequestId(),
          "x-tab-id": RequestContextAccessor.getTabId(),
        },
      }
    );
  }
}
