import {
  extractAndParseAccessToken,
  checkAccessTokenMiddleware,
  isUUIDv4,
} from "../middlewares";
import {
  getConversationsController,
  getMessagesController,
} from "../controllers";
import { logger } from "../helpers/logger";
import { handleError, ValidateError } from "../helpers/errors";
import { RequestContextAccessor } from "../helpers/contexts";

// ============================================================
// GET /v1/conversations
// ============================================================
export async function handleGetConversations(
  url: URL,
  req: Request,
  corsHeaders: any
) {
  try {
    logger.debug("Start handle get conversations by user id");

    // Parse auth token
    const auth = extractAndParseAccessToken(req);

    // Verify auth token
    const authResult = checkAccessTokenMiddleware(auth);

    const result = await getConversationsController({ userId: authResult.data.userId });

    logger.debug("Get the conversations by user id successfully");
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "x-request-id": RequestContextAccessor.getRequestId(),
        "x-tab-id": RequestContextAccessor.getTabId(),
      },
    });
  } catch (err) {
    const errorResponse = handleError(err, corsHeaders);
    if (errorResponse) {
      return errorResponse;
    }

    return new Response(
      JSON.stringify({
        code: "INTERNAL_ERROR",
        message: "Get conversations error. Please try again later.",
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

// ============================================================
// GET /v1/conversation/messages?conversationId=...&limit=...&offset=...
// ============================================================
export async function handleGetMessages(
  url: URL,
  req: Request,
  corsHeaders: any
) {
  try {
    logger.debug("Start handle get messages of a conversation");

    // Parse auth token
    const auth = extractAndParseAccessToken(req);

    // Verify auth token
    checkAccessTokenMiddleware(auth);

    // Get and validate search params
    const conversationId = url.searchParams.get("conversationId");
    const limit = url.searchParams.get("limit") ?? 10;
    const offset = url.searchParams.get("offset") ?? 0;
    if (!conversationId || !isUUIDv4(conversationId)) {
      throw new ValidateError("Search params is invalid.");
    }

    const limitNum = Number(limit);
    const offsetNum = Number(offset);
    if (
      isNaN(limitNum) ||
      limitNum <= 0 ||
      !Number.isInteger(limitNum) ||
      !Number.isFinite(limitNum)
    ) {
      throw new ValidateError("Limit must be a positive integer");
    }
    if (
      isNaN(offsetNum) ||
      offsetNum < 0 ||
      !Number.isInteger(offsetNum) ||
      !Number.isFinite(offsetNum)
    ) {
      throw new ValidateError("Limit must be a non-negative integer");
    }

    const result = await getMessagesController({
      conversationId,
      limit: limitNum,
      offset: offsetNum,
    });

    logger.debug("Get the messages of a conversation successfully");
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "x-request-id": RequestContextAccessor.getRequestId(),
        "x-tab-id": RequestContextAccessor.getTabId(),
      },
    });
  } catch (err) {
    const errorResponse = handleError(err, corsHeaders);
    if (errorResponse) {
      return errorResponse;
    }

    return new Response(
      JSON.stringify({
        code: "INTERNAL_ERROR",
        message: "Get messages error. Please try again later.",
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
