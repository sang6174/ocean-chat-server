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
  rejectFriendRequestController,
  getNotificationsController,
  cancelFriendRequestController,
  markNotificationsAsReadController,
} from "../controllers";
import { logger } from "../helpers/logger";
import { handleError } from "../helpers/errors";
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
// POST /v1/notification/friend-request
// ============================================================
export async function handleSendFriendRequest(req: Request, corsHeaders: any) {
  try {
    logger.debug("Start handle send friend request");

    const auth = extractAndParseAccessToken(req);
    const authResult = checkAccessTokenMiddleware(auth);

    const rawBody = await parseBodyJSON<HttpFriendRequest>(req);
    assertHttpFriendRequest(rawBody);

    const cleanBody: FriendRequestDomainInput = {
      sender: { id: authResult.data.userId, username: authResult.data.username },
      recipient: rawBody.recipient,
    };

    const result = await sendFriendRequestController(cleanBody);

    logger.debug("Handle send friend request successfully");
    return new Response(JSON.stringify(result), {
      status: 201,
      headers: buildHeaders(corsHeaders),
    });
  } catch (err) {
    return handleError(err, corsHeaders) ?? new Response(
      JSON.stringify({ code: "INTERNAL_ERROR", message: "Friend request notification is failed. Please try again." }),
      { status: 500, headers: buildHeaders(corsHeaders) }
    );
  }
}

// ============================================================
// GET /v1/notifications
// ============================================================
export async function handleGetNotifications(req: Request, corsHeaders: any) {
  try {
    logger.debug("Start handle get notifications by user id");

    const auth = extractAndParseAccessToken(req);
    const authResult = checkAccessTokenMiddleware(auth);

    const result = await getNotificationsController({ userId: authResult.data.userId });

    logger.debug("Handle get notifications by user id successfully");
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: buildHeaders(corsHeaders),
    });
  } catch (err) {
    return handleError(err, corsHeaders) ?? new Response(
      JSON.stringify({ code: "INTERNAL_ERROR", message: "Friend request notification is failed. Please try again." }),
      { status: 500, headers: buildHeaders(corsHeaders) }
    );
  }
}

// ============================================================
// POST /v1/notification/friend-request/cancel
// ============================================================
export async function handleCancelFriendRequest(req: Request, corsHeaders: any) {
  try {
    logger.debug("Start handle cancel friend request");

    const auth = extractAndParseAccessToken(req);
    const authResult = checkAccessTokenMiddleware(auth);

    const rawBody = await parseBodyJSON<HttpFriendRequestWithNotificationId>(req);
    assertHttpFriendRequestWithNotificationId(rawBody);

    const cleanBody: FriendRequestWithNotificationIdDomainInput = {
      sender: { id: authResult.data.userId, username: authResult.data.username },
      recipient: rawBody.recipient,
      notificationId: rawBody.notificationId,
    };

    const result = await cancelFriendRequestController(cleanBody);

    logger.debug("Handle cancel friend request successfully");
    return new Response(
      JSON.stringify({ code: result.code, message: result.message }),
      { status: result.status, headers: buildHeaders(corsHeaders) }
    );
  } catch (err) {
    return handleError(err, corsHeaders) ?? new Response(
      JSON.stringify({ code: "INTERNAL_ERROR", message: "Friend request notification is failed. Please try again." }),
      { status: 500, headers: buildHeaders(corsHeaders) }
    );
  }
}

// ============================================================
// POST /v1/notification/friend-request/accept
// ============================================================
export async function handleAcceptFriendRequest(req: Request, corsHeaders: any) {
  try {
    logger.debug("Start handle accept friend request");

    const auth = extractAndParseAccessToken(req);
    const authResult = checkAccessTokenMiddleware(auth);

    const rawBody = await parseBodyJSON<HttpFriendRequestWithNotificationId>(req);
    assertHttpFriendRequestWithNotificationId(rawBody);

    const cleanBody: FriendRequestWithNotificationIdDomainInput = {
      sender: { id: authResult.data.userId, username: authResult.data.username },
      recipient: rawBody.recipient,
      notificationId: rawBody.notificationId,
    };

    const result = await acceptFriendRequestController(cleanBody);

    logger.debug("Handle accept friend request successfully");
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: buildHeaders(corsHeaders),
    });
  } catch (err) {
    return handleError(err, corsHeaders) ?? new Response(
      JSON.stringify({ code: "INTERNAL_ERROR", message: "Accepted notification sended failed. Please try again." }),
      { status: 500, headers: buildHeaders(corsHeaders) }
    );
  }
}

// ============================================================
// POST /v1/notification/friend-request/reject
// ============================================================
export async function handleRejectFriendRequest(req: Request, corsHeaders: any) {
  try {
    logger.debug("Start handle reject friend request");

    const auth = extractAndParseAccessToken(req);
    const authResult = checkAccessTokenMiddleware(auth);
    if (!authResult) {
      return new Response(
        JSON.stringify({ code: "TOKEN_INVALID", message: "Invalid or expired auth token." }),
        { status: 401, headers: buildHeaders(corsHeaders) }
      );
    }

    const rawBody = await parseBodyJSON<HttpFriendRequestWithNotificationId>(req);
    assertHttpFriendRequestWithNotificationId(rawBody);

    const cleanBody: FriendRequestWithNotificationIdDomainInput = {
      sender: { id: authResult.data.userId, username: authResult.data.username },
      recipient: rawBody.recipient,
      notificationId: rawBody.notificationId,
    };

    const result = await rejectFriendRequestController(cleanBody);

    logger.debug("Handle reject friend request successfully");
    return new Response(
      JSON.stringify({ code: result.code, message: result.message }),
      { status: result.status, headers: buildHeaders(corsHeaders) }
    );
  } catch (err) {
    return handleError(err, corsHeaders) ?? new Response(
      JSON.stringify({ code: "INTERNAL_ERROR", message: "Rejected notification sended failed. Please try again." }),
      { status: 500, headers: buildHeaders(corsHeaders) }
    );
  }
}

// ============================================================
// PUT /v1/notifications/read
// ============================================================
export async function handleMarkNotificationsAsRead(req: Request, corsHeaders: any) {
  try {
    logger.debug("Start handle mark notifications as read");

    const auth = extractAndParseAccessToken(req);
    const authResult = checkAccessTokenMiddleware(auth);

    const result = await markNotificationsAsReadController({ userId: authResult.data.userId });

    logger.debug("Handle mark notifications as read successfully");
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: buildHeaders(corsHeaders),
    });
  } catch (err) {
    return handleError(err, corsHeaders) ?? new Response(
      JSON.stringify({ code: "INTERNAL_ERROR", message: "Mark notifications as read failed. Please try again." }),
      { status: 500, headers: buildHeaders(corsHeaders) }
    );
  }
}
