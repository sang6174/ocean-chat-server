import type { HttpLoginPostResponse } from "../types/http";
import type {
  ResponseDomain,
  LoginDomainInput,
  LogoutDomainInput,
  RefreshAuthTokenInput,
  RegisterDomainInput,
} from "../types/domain";
import {
  parseBodyFormData,
  refreshTokenMiddleware,
  extractAndParseAuthToken,
  authMiddleware,
  assertHttpRegisterPost,
  assertHttpLoginPost,
  assertLogoutDomainInput,
} from "../middlewares";
import {
  registerController,
  loginController,
  refreshAuthTokenController,
  logoutController,
} from "../controllers";
import { logger } from "../helpers/logger";
import { handleError } from "../helpers/errors";

const refreshTokenMaxAge = process.env.REFRESH_TOKEN_MAX_AGE!;

// ============================================================
// POST /auth/register
// ============================================================
export async function handleRegister(req: Request, corsHeaders: any) {
  try {
    logger.info("Start handle register");

    // Parse request body
    const form = await parseBodyFormData(req);

    // Sanitize request body
    const rawBody = {
      name: form.get("name"),
      email: form.get("email"),
      username: form.get("username"),
      password: form.get("password"),
    };

    // Validate and assert request body
    assertHttpRegisterPost(rawBody);

    // Sanitize validated body
    const cleanBody: RegisterDomainInput = {
      name: rawBody.name.toLowerCase(),
      email: rawBody.email.toLowerCase(),
      username: rawBody.username.toLowerCase(),
      password: rawBody.password,
    };

    // Call register controller
    const result: ResponseDomain = await registerController(cleanBody);

    logger.info("Register successfully");
    return new Response(
      JSON.stringify({ code: result.code, message: result.message }),
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
        message: "Register error. Please try again later.",
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
// POST /auth/login
// ============================================================
export async function handleLogin(req: Request, corsHeaders: any) {
  try {
    logger.info("Start handle login");

    // Parse request body and sanitize fields.
    const form = await parseBodyFormData(req);

    // Sanitize request body
    const rawBody = {
      username: form.get("username"),
      password: form.get("password"),
    };

    // Validate and assert request body
    assertHttpLoginPost(rawBody);

    // Sanitize validated body
    const cleanBody: LoginDomainInput = {
      username: rawBody.username.toLowerCase(),
      password: rawBody.password,
    };

    const result = await loginController(cleanBody);

    const response: HttpLoginPostResponse = {
      userId: result.userId,
      username: result.username,
      authToken: result.authToken,
    };

    logger.info("Login successfully");
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "x-request-id": logger.requestId,
        "Set-Cookie": `refresh_token=${result.refreshToken}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${refreshTokenMaxAge}`,
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
        message: "Login error. Please try again later.",
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
// GET /auth/logout
// ============================================================
export async function handleLogout(url: URL, req: Request, corsHeaders: any) {
  try {
    logger.info("Start handle logout");

    const authToken = extractAndParseAuthToken(req);

    const refreshToken =
      req.headers
        .get("cookie")
        ?.split(";")
        .map((c) => c.trim())
        .find((c) => c.startsWith("refresh_token="))
        ?.slice("refresh_token=".length) ?? null;

    if (!refreshToken) {
      logger.info("No refresh token found during logout, clearing cookie only.");
      return new Response(
        JSON.stringify({ message: "Logout successfully, no token to revoke." }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "Set-Cookie": "refresh_token=; HttpOnly; Path=/; Max-Age=0",
            "x-request-id": logger.requestId,
          },
        }
      );
    }

    const authResult = authMiddleware(authToken);
    refreshTokenMiddleware(refreshToken);

    const input: LogoutDomainInput = {
      userId: authResult.data.userId,
      authToken,
      refreshToken,
    };

    assertLogoutDomainInput(input);
    const result = await logoutController(input);

    logger.info("Logout successfully");
    return new Response(
      JSON.stringify({
        message: result.message,
      }),
      {
        status: result.status,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Set-Cookie": "refresh_token=; HttpOnly; Path=/; Max-Age=0",
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
        message: "Logout error. Please try again later.",
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
// POST /auth/refresh/token
// ============================================================
export async function handleRefreshAuthToken(req: Request, corsHeaders: any) {
  try {
    logger.info("Start handle refresh auth token");

    // Parse refresh token
    const authToken = extractAndParseAuthToken(req);

    // Verify refresh token
    const authResult = refreshTokenMiddleware(authToken);

    // Call controller
    const input: RefreshAuthTokenInput = {
      userId: authResult.data.userId,
    };
    const result = await refreshAuthTokenController(input);

    logger.info("Refresh auth token successfully");
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "x-request-id": logger.requestId,
      },
    });
  } catch (err: any) {
    const errorResponse = handleError(err, corsHeaders);
    if (errorResponse) {
      return errorResponse;
    }

    return new Response(
      JSON.stringify({
        code: "INTERNAL_ERROR",
        message: "Refresh token error. Please try again later.",
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
