import type { HttpLoginPostResponse } from "../types/http";
import type {
  ResponseDomain,
  LoginDomainInput,
  LogoutDomainInput,
  RefreshAuthTokenInput,
  RefreshTokenPayload,
  RegisterDomainInput,
  UserTokenPayload,
} from "../types/domain";
import {
  parseBodyFormData,
  refreshTokenMiddleware,
  parseAuthToken,
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
    if ("status" in form && "message" in form) {
      return new Response(JSON.stringify({ message: form.message }), {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "x-request-id": logger.requestId,
        },
      });
    }

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
    console.log("Start controller.");
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
    // Parse request body and sanitize fields.
    const form = await parseBodyFormData(req);
    if ("status" in form && "message" in form) {
      return new Response(JSON.stringify({ message: form.message }), {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "x-request-id": logger.requestId,
        },
      });
    }

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
export async function handleLogout(req: Request, corsHeaders: any) {
  try {
    const auth: ResponseDomain | string = parseAuthToken(req);
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

    const authResult: UserTokenPayload | null = authMiddleware(auth);
    if (!authResult) {
      return new Response(
        JSON.stringify({ message: "Invalid or expired auth token." }),
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

    const input: LogoutDomainInput = {
      userId: authResult.data.userId,
      authToken: auth,
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
    // Parse refresh token
    const auth: ResponseDomain | string = parseAuthToken(req);
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

    // Verify refresh token
    const authResult: RefreshTokenPayload | null = refreshTokenMiddleware(auth);
    if (!authResult) {
      return new Response(
        JSON.stringify({ message: "Invalid or expired auth token." }),
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
