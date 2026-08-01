import type {
  GetConversationIdsRepositoryInput,
} from "../types/domain";
import type { DataWebSocket } from "../types/ws";
import { checkAccessTokenMiddleware } from "../middlewares";
import { getConversationIdsController } from "../controllers";
import { handleError } from "../helpers/errors";
import { logger } from "../helpers/logger";
import { RequestContextAccessor } from "../helpers/contexts";

function buildHeaders(corsHeaders: any): Record<string, string> {
  return {
    ...corsHeaders,
    "Content-Type": "application/json",
    "x-request-id": RequestContextAccessor.getRequestId() ?? "",
    "x-tab-id": RequestContextAccessor.getTabId() ?? "",
  };
}

// ============================================================
// Upgrade WebSocket
// ============================================================
export async function handleUpgradeWebSocket(
  server: Bun.Server<DataWebSocket>,
  req: Request,
  corsHeaders: any
) {
  try {
    logger.info("Start handle upgrade websocket");

    let token = "";
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.slice(7);
    } else {
      const protocol = req.headers.get("Sec-WebSocket-Protocol");
      if (protocol?.startsWith("authorization-")) {
        token = protocol.slice(14);
      }
    }

    if (!token) {
      return new Response(
        JSON.stringify({ code: "AUTHORIZATION_REQUIRED", message: "Authorization required" }),
        { status: 401, headers: buildHeaders(corsHeaders) }
      );
    }

    const authResult = checkAccessTokenMiddleware(token);

    const input: GetConversationIdsRepositoryInput = {
      userId: authResult.data.userId,
    };

    const conversation = await getConversationIdsController(input);

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
        headers: buildHeaders(corsHeaders),
      });
    }

    logger.info("Upgrade websocket successfully");
    return;
  } catch (err) {
    return handleError(err, corsHeaders) ?? new Response(
      JSON.stringify({ code: "INTERNAL_ERROR", message: "Upgrade websocket error. Please try again later." }),
      { status: 500, headers: buildHeaders(corsHeaders) }
    );
  }
}
