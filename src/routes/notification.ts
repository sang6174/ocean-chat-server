import type { UserTokenPayload } from "../types/domain";
import { parseAuthToken, authMiddleware, isUUIDv4 } from "../middlewares";
import {
  notificationAddFriendController,
  notificationAcceptFriendController,
  notificationDenyFriendController,
} from "../controllers";
import { logger } from "../helpers/logger";
import { handleError } from "../helpers/errors";

// POST /notification/friend
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
        headers: { ...corsHeaders, "Content-Type": "application/json" },
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
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get recipient id from search params
    const recipientId = url.searchParams.get("recipientId");
    if (!recipientId) {
      return new Response(
        JSON.stringify({ message: "Search params is invalid." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // validate recipient id from search params
    const isValidRecipient = isUUIDv4(recipientId);
    if (!isValidRecipient) {
      return new Response(
        JSON.stringify({
          code: "VALIDATE_ERROR",
          message: "recipientId is invalid. Please try again.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const result = await notificationAddFriendController({
      senderId: authResult.data.userId,
      senderUsername: authResult.data.username,
      recipientId: recipientId,
    });

    logger.info("Send notification add friend successfully");
    return new Response(
      JSON.stringify({
        code: result.code,
        message: result.message,
      }),
      {
        status: result.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
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
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
}

// POST /notification/friend/accept
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
        headers: { ...corsHeaders, "Content-Type": "application/json" },
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
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get recipient id from search params
    const recipientId = url.searchParams.get("recipientId");
    if (!recipientId) {
      return new Response(
        JSON.stringify({ message: "Search params is invalid." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // validate recipient id from search params
    const isValidRecipient = isUUIDv4(recipientId);
    if (!isValidRecipient) {
      return new Response(
        JSON.stringify({
          code: "VALIDATE_ERROR",
          message: "recipientId is invalid. Please try again.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Call notification accept friend controller
    const result = await notificationAcceptFriendController({
      senderId: authResult.data.userId,
      recipientId: recipientId,
    });

    logger.info("Accepted notification sended successfully");
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
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
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
}

// POST /notification/friend/deny
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
        headers: { ...corsHeaders, "Content-Type": "application/json" },
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
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get recipient id from search params
    const recipientId = url.searchParams.get("recipientId");
    if (!recipientId) {
      return new Response(
        JSON.stringify({ message: "Search params is invalid." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // validate recipient id from search params
    const isValidRecipient = isUUIDv4(recipientId);
    if (!isValidRecipient) {
      return new Response(
        JSON.stringify({
          code: "VALIDATE_ERROR",
          message: "recipientId is invalid. Please try again.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Call notification deny friend controller
    const result = await notificationDenyFriendController({
      senderId: authResult.data.userId,
      senderUsername: authResult.data.username,
      recipientId: recipientId,
    });

    logger.info("Denied notification sended successfully");
    return new Response(
      JSON.stringify({
        code: result.code,
        message: result.message,
      }),
      {
        status: result.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
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
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
}
