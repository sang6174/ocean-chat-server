import type { UserTokenPayload } from "../types/domain";
import { parseAuthToken, authMiddleware, isUUIDv4 } from "../middlewares";
import {
  notificationAddFriendController,
  notificationAcceptFriendController,
  notificationDenyFriendController,
} from "../controllers";
import type { HttpResponse } from "../types/http";
import type { BaseLogger } from "../helpers/logger";

// POST /notification/friend
export async function handleNotificationAddFriend(
  baseLogger: BaseLogger,
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
          message: "recipientId is invalid. Please try again.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const result = await notificationAddFriendController(baseLogger, {
      senderId: authResult.data.userId,
      senderUsername: authResult.data.username,
      recipientId: recipientId,
    });

    return new Response(
      JSON.stringify({
        message: result.message,
      }),
      {
        status: result.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        message: "Send notification add friend error. Please try again.",
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
  baseLogger: BaseLogger,
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
          message: "recipientId is invalid. Please try again.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Call notification accept friend controller
    const result = await notificationAcceptFriendController(baseLogger, {
      senderId: authResult.data.userId,
      recipientId: recipientId,
    });

    if ("status" in result && "message" in result) {
      return new Response(
        JSON.stringify({
          message: result.message,
        }),
        {
          status: result.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        message: "Send notification add friend error. Please try again.",
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
  baseLogger: BaseLogger,
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
          message: "recipientId is invalid. Please try again.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Call notification deny friend controller
    const result = await notificationDenyFriendController(baseLogger, {
      senderId: authResult.data.userId,
      senderUsername: authResult.data.username,
      recipientId: recipientId,
    });

    return new Response(
      JSON.stringify({
        message: result.message,
      }),
      {
        status: result.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        message: "Send notification add friend error. Please try again.",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
}
