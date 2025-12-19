import type { UserTokenPayload } from "../types/domain";
import {
  parseAuthToken,
  authMiddleware,
  isUUIDv4,
  isUsername,
  assertHttpNotificationFriendPost,
} from "../middlewares";
import {
  notificationAddFriendController,
  notificationAcceptFriendController,
  notificationDenyFriendController,
} from "../controllers";
import { logger } from "../helpers/logger";
import { handleError } from "../helpers/errors";

// ============================================================
// POST /notification/friend
// ============================================================
export async function handleNotificationAddFriend(
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
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "x-request-id": logger.requestId,
        },
      });
    }

    // Verify auth token
    const authResult: UserTokenPayload | null = authMiddleware(auth);
    if (!authResult) {
      return new Response(
        JSON.stringify({
          code: "TOKEN_INVALID",
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

    // Get recipient id from search params
    const httpBody = {
      sender: {
        id: authResult.data.userId,
        username: authResult.data.username,
      },
      recipient: {
        id: url.searchParams.get("id"),
        username: url.searchParams.get("username"),
      },
    };

    // validate recipient id from search params
    assertHttpNotificationFriendPost(httpBody);

    const result = await notificationAddFriendController(httpBody);

    logger.info("Send notification add friend successfully");
    return new Response(
      JSON.stringify({
        code: result.code,
        message: result.message,
      }),
      {
        status: result.status,
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
        message: "Friend request notification is failed. Please try again.",
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
// POST /notification/friend/accept
// ============================================================
export async function handleNotificationAcceptFriend(
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
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "x-request-id": logger.requestId,
        },
      });
    }

    // Verify auth token
    const authResult: UserTokenPayload | null = authMiddleware(auth);
    if (!authResult) {
      return new Response(
        JSON.stringify({
          code: "TOKEN_INVALID",
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

    // Get recipient id from search params
    const httpBody = {
      sender: {
        id: authResult.data.userId,
        username: authResult.data.username,
      },
      recipient: {
        id: url.searchParams.get("id"),
        username: url.searchParams.get("username"),
      },
    };

    // validate recipient id from search params
    assertHttpNotificationFriendPost(httpBody);

    // Call notification accept friend controller
    const result = await notificationAcceptFriendController(httpBody);

    logger.info("Accepted notification sended successfully");
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
        message: "Accepted notification sended failed. Please try again.",
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
// POST /notification/friend/deny
// ============================================================
export async function handleNotificationDenyFriend(
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
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "x-request-id": logger.requestId,
        },
      });
    }

    // Verify auth token
    const authResult: UserTokenPayload | null = authMiddleware(auth);
    if (!authResult) {
      return new Response(
        JSON.stringify({
          code: "TOKEN_INVALID",
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

    // Get recipient id from search params
    const httpBody = {
      sender: {
        id: authResult.data.userId,
        username: authResult.data.username,
      },
      recipient: {
        id: url.searchParams.get("id"),
        username: url.searchParams.get("username"),
      },
    };

    // validate recipient id from search params
    assertHttpNotificationFriendPost(httpBody);

    // Call notification deny friend controller
    const result = await notificationDenyFriendController(httpBody);

    logger.info("Denied notification sended successfully");
    return new Response(
      JSON.stringify({
        code: result.code,
        message: result.message,
      }),
      {
        status: result.status,
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
        message: "Denied notification sended failed. Please try again.",
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
