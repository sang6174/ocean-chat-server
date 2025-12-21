import type {
  GetProfileUserDomainInput,
  UserTokenPayload,
} from "../types/domain";
import { extractAndParseAuthToken, authMiddleware } from "../middlewares";
import {
  getProfileUsersController,
  getProfileUserController,
} from "../controllers";
import { logger } from "../helpers/logger";
import { handleError } from "../helpers/errors";

// ============================================================
// Get All Profile User
// ============================================================
export async function handleGetAllProfileUsers(req: Request, corsHeaders: any) {
  try {
    // Parse auth token
    const auth = extractAndParseAuthToken(req);

    // Verify auth token
    authMiddleware(auth);

    const result = await getProfileUsersController();

    logger.info("Get all users' profile successfully");
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
        message: "Get all users error. Please try again.",
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
// Get Profile User
// ============================================================
export async function handleGetProfileUser(req: Request, corsHeaders: any) {
  try {
    // Parse auth token
    const auth = extractAndParseAuthToken(req);

    // Verify auth token
    const authResult = authMiddleware(auth);

    // Call get info user controller
    const input: GetProfileUserDomainInput = { userId: authResult.data.userId };
    const result = await getProfileUserController(input);

    logger.info("Get user's profile successfully");
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
        message: "Get all users error. Please try again.",
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
