import {
  extractAndParseAuthToken,
  authMiddleware,
  isUUIDv4,
} from "../middlewares";
import {
  getConversationsController,
  getMessagesController,
} from "../controllers";
import { logger } from "../helpers/logger";
import { handleError, ValidateError } from "../helpers/errors";

// ============================================================
// GET /conversations?userId=...
// ============================================================
export async function handleGetConversations(
  url: URL,
  req: Request,
  corsHeaders: any
) {
  try {
    logger.info("Start handle get conversations");

    // Parse auth token
    const auth = extractAndParseAuthToken(req);

    // Verify auth token
    authMiddleware(auth);

    // Get userId from search params
    const userId = url.searchParams.get("userId");
    if (!userId || !isUUIDv4(userId)) {
      return new Response(
        JSON.stringify({
          code: "SEARCH_PARAMS_INVALID",
          message: "Search params is invalid ...",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "x-request-id": logger.requestId,
          },
        }
      );
    }

    const result = await getConversationsController({ userId });

    logger.info("Get the conversations successfully");
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "x-request-id": logger.requestId,
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
          "x-request-id": logger.requestId,
        },
      }
    );
  }
}

// ============================================================
// GET /conversations/messages?conversationId=...&limit=...&offset=...
// ============================================================
export async function handleGetMessages(
  url: URL,
  req: Request,
  corsHeaders: any
) {
  try {
    logger.info("Start handle get messages");

    // Parse auth token
    const auth = extractAndParseAuthToken(req);

    // Verify auth token
    authMiddleware(auth);

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

    logger.info("Get the messages successfully");
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "x-request-id": logger.requestId,
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
          "x-request-id": logger.requestId,
        },
      }
    );
  }
}
