import type {
  GetProfileUserDomainInput,
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

function buildHeaders(corsHeaders: any): Record<string, string> {
  return {
    ...corsHeaders,
    "Content-Type": "application/json",
    "x-request-id": RequestContextAccessor.getRequestId() ?? "",
    "x-tab-id": RequestContextAccessor.getTabId() ?? "",
  };
}

// ============================================================
// GET /v1/profile/user
// ============================================================
export async function handleGetProfileUser(req: Request, corsHeaders: any) {
  try {
    logger.debug("Start handle get user's profile");

    const auth = extractAndParseAccessToken(req);
    const authResult = checkAccessTokenMiddleware(auth);

    const input: GetProfileUserDomainInput = { userId: authResult.data.userId };
    const result = await getProfileUserController(input);

    logger.debug("Get user's profile successfully");
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: buildHeaders(corsHeaders),
    });
  } catch (err) {
    return handleError(err, corsHeaders) ?? new Response(
      JSON.stringify({ code: "INTERNAL_ERROR", message: "Get all users error. Please try again." }),
      { status: 500, headers: buildHeaders(corsHeaders) }
    );
  }
}

// ============================================================
// GET /v1/profile/users
// ============================================================
export async function handleGetAllProfileUsers(req: Request, corsHeaders: any) {
  try {
    logger.debug("Start get all users' profile");

    const auth = extractAndParseAccessToken(req);
    checkAccessTokenMiddleware(auth);

    const result = await getProfileUsersController();

    logger.debug("Get all users' profile successfully");
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: buildHeaders(corsHeaders),
    });
  } catch (err) {
    return handleError(err, corsHeaders) ?? new Response(
      JSON.stringify({ code: "INTERNAL_ERROR", message: "Get all users error. Please try again." }),
      { status: 500, headers: buildHeaders(corsHeaders) }
    );
  }
}
