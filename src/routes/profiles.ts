import type {
  GetProfileUserDomainInput,
  UserTokenPayload,
} from "../types/domain";
import {
  extractAndParseAccessToken,
  checkAccessTokenMiddleware,
} from "../middlewares";
import {
  getProfileUsersController,
  getProfileUserController,
} from "../controllers";
import { logger } from "../helpers/logger";
import { handleError } from "../helpers/errors";
import { RequestContextAccessor } from "../helpers/contexts";

// ============================================================
// GET /v1/profile/users
// ============================================================
export async function handleGetProfileUser(req: Request, corsHeaders: any) {
  try {
    logger.debug("Start handle get user's profile");

    // Parse auth token
    const auth = extractAndParseAccessToken(req);

    // Verify auth token
    const authResult = checkAccessTokenMiddleware(auth);

    // Call get info user controller
    const input: GetProfileUserDomainInput = { userId: authResult.data.userId };
    const result = await getProfileUserController(input);

    logger.debug("Get user's profile successfully");
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
        message: "Get all users error. Please try again.",
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
// GET /v1/profile/user
// ============================================================
export async function handleGetAllProfileUsers(req: Request, corsHeaders: any) {
  try {
    logger.debug("Start get all users' profile");

    // Parse auth token
    const auth = extractAndParseAccessToken(req);

    // Verify auth token
    checkAccessTokenMiddleware(auth);

    const result = await getProfileUsersController();

    logger.debug("Get all users' profile successfully");
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
        message: "Get all users error. Please try again.",
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
