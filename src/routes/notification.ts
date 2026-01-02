import type {
  HttpFriendRequest,
  HttpFriendRequestWithNotificationId,
} from "../types/http";
import type {
  UserTokenPayload,
  FriendRequestDomainInput,
  FriendRequestWithNotificationIdDomainInput,
} from "../types/domain";
import {
  extractAndParseAccessToken,
  checkAccessTokenMiddleware,
  assertHttpFriendRequest,
  assertHttpFriendRequestWithNotificationId,
  parseBodyJSON,
} from "../middlewares";
import {
  sendFriendRequestController,
  acceptFriendRequestController,
  denyFriendRequestController,
  getNotificationsController,
  cancelFriendRequestController,
} from "../controllers";
import { logger } from "../helpers/logger";
import { handleError } from "../helpers/errors";
import { RequestContextAccessor } from "../helpers/contexts";

// ============================================================
// POST /v1/notification/friend-request
// ============================================================
export async function handleSendFriendRequest(
  url: URL,
  req: Request,
  corsHeaders: any
) {
  try {
    logger.debug("Start handle send friend request");

    // Parse auth token
    const auth = extractAndParseAccessToken(req);

    // Verify auth token
    const authResult = checkAccessTokenMiddleware(auth);

    // Parse Body
    const rawBody = await parseBodyJSON<HttpFriendRequest>(req);
    assertHttpFriendRequest(rawBody);

    // Sanitize for input of controller
    const cleanBody: FriendRequestDomainInput = {
      sender: {
        id: authResult.data.userId,
        username: authResult.data.username,
      },
      recipient: rawBody.recipient,
    };

    const result = await sendFriendRequestController(cleanBody);

    logger.debug("Handle send friend request successfully");
    return new Response(JSON.stringify(result), {
      status: 201,
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
        message: "Friend request notification is failed. Please try again.",
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
// GET /v1/notifications
// ============================================================
export async function handleGetNotifications(
  url: URL,
  req: Request,
  corsHeaders: any
) {
  try {
    logger.debug("Start handle get notifications by user id");

    // Parse auth token
    const auth = extractAndParseAccessToken(req);

    // Verify auth token
    const authResult = checkAccessTokenMiddleware(auth);

    // Parse Body
    const rawBody = await parseBodyJSON<HttpFriendRequestWithNotificationId>(
      req
    );
    assertHttpFriendRequestWithNotificationId(rawBody);

    // Sanitize for input of controller
    const cleanBody: FriendRequestWithNotificationIdDomainInput = {
      sender: {
        id: authResult.data.userId,
        username: authResult.data.username,
      },
      recipient: rawBody.recipient,
      notificationId: rawBody.notificationId,
    };

    const result = await getNotificationsController(cleanBody);

    logger.debug("Handle get notifications by user id successfully");
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
        message: "Friend request notification is failed. Please try again.",
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
// POST /v1/notification/friend-request/cancel
// ============================================================
export async function handleCancelFriendRequest(
  url: URL,
  req: Request,
  corsHeaders: any
) {
  try {
    logger.debug("Start handle cancel friend request");

    // Parse auth token
    const auth = extractAndParseAccessToken(req);

    // Verify auth token
    const authResult = checkAccessTokenMiddleware(auth);

    // Parse Body
    const rawBody = await parseBodyJSON<HttpFriendRequestWithNotificationId>(
      req
    );
    assertHttpFriendRequestWithNotificationId(rawBody);

    // Sanitize for input of controller
    const cleanBody: FriendRequestWithNotificationIdDomainInput = {
      sender: {
        id: authResult.data.userId,
        username: authResult.data.username,
      },
      recipient: rawBody.recipient,
      notificationId: rawBody.notificationId,
    };

    // Call notification cancel friend controller
    const result = await cancelFriendRequestController(cleanBody);

    logger.debug("Handle cancel friend request successfully");
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
          "x-request-id": RequestContextAccessor.getRequestId(),
          "x-tab-id": RequestContextAccessor.getTabId(),
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
          "x-request-id": RequestContextAccessor.getRequestId(),
          "x-tab-id": RequestContextAccessor.getTabId(),
        },
      }
    );
  }
}

// ============================================================
// POST /v1/notification/friend-request/accept
// ============================================================
export async function handleAcceptFriendRequest(
  url: URL,
  req: Request,
  corsHeaders: any
) {
  try {
    logger.debug("Start handle accept friend request");

    // Parse auth token
    const auth = extractAndParseAccessToken(req);

    // Verify auth token
    const authResult = checkAccessTokenMiddleware(auth);

    // Parse Body
    const rawBody = await parseBodyJSON<HttpFriendRequestWithNotificationId>(
      req
    );
    assertHttpFriendRequestWithNotificationId(rawBody);

    // Sanitize for input of controller
    const cleanBody: FriendRequestWithNotificationIdDomainInput = {
      sender: {
        id: authResult.data.userId,
        username: authResult.data.username,
      },
      recipient: rawBody.recipient,
      notificationId: rawBody.notificationId,
    };

    // Call notification accept friend controller
    const result = await acceptFriendRequestController(cleanBody);

    logger.debug("Handle accept friend request successfully");
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
        message: "Accepted notification sended failed. Please try again.",
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
// POST /v1/notification/friend-request/deny
// ============================================================
export async function handleDenyFriendRequest(
  url: URL,
  req: Request,
  corsHeaders: any
) {
  try {
    logger.debug("Start handle deny friend request");

    // Parse auth token
    const auth = extractAndParseAccessToken(req);

    // Verify auth token
    const authResult: UserTokenPayload | null =
      checkAccessTokenMiddleware(auth);
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
            "x-request-id": RequestContextAccessor.getRequestId(),
            "x-tab-id": RequestContextAccessor.getTabId(),
          },
        }
      );
    }

    // Parse Body
    const rawBody = await parseBodyJSON<HttpFriendRequestWithNotificationId>(
      req
    );
    assertHttpFriendRequestWithNotificationId(rawBody);

    // Sanitize for input of controller
    const cleanBody: FriendRequestWithNotificationIdDomainInput = {
      sender: {
        id: authResult.data.userId,
        username: authResult.data.username,
      },
      recipient: rawBody.recipient,
      notificationId: rawBody.notificationId,
    };

    // Call notification deny friend controller
    const result = await denyFriendRequestController(cleanBody);

    logger.debug("Handle deny friend request successfully");
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
          "x-request-id": RequestContextAccessor.getRequestId(),
          "x-tab-id": RequestContextAccessor.getTabId(),
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
          "x-request-id": RequestContextAccessor.getRequestId(),
          "x-tab-id": RequestContextAccessor.getTabId(),
        },
      }
    );
  }
}
