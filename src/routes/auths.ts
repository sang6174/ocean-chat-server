import type { HttpResponse, HttpLoginPostResponse } from "../types/http";
import type {
  LoginDomainInput,
  LogoutDomainInput,
  RefreshAuthTokenInput,
  RefreshTokenPayload,
  RegisterDomainInput,
  UserTokenPayload,
} from "../types/domain";
import {
  parseBodyFormData,
  parseRefreshToken,
  refreshTokenMiddleware,
  assertRegisterBody,
  validateRegisterInput,
  assertLoginBody,
  validateLoginInput,
  parseAuthToken,
  authMiddleware,
} from "../middlewares";
import {
  registerController,
  loginController,
  refreshAuthTokenController,
  logoutController,
} from "../controllers";
import type { LoginDomainOutput } from "../types/domain";
import type { BaseLogger } from "../helpers/logger";

const refreshTokenMaxAge = process.env.REFRESH_TOKEN_MAX_AGE!;

// ============================================================
// POST /auth/register
// ============================================================
export async function handleRegister(
  baseLogger: BaseLogger,
  req: Request,
  corsHeaders: any
) {
  try {
    // Parse request body
    const form = await parseBodyFormData(req);
    if ("status" in form && "message" in form) {
      return new Response(JSON.stringify({ message: form.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Sanitize and assert request body
    const rawBody = {
      name: form.get("name"),
      email: form.get("email"),
      username: form.get("username"),
      password: form.get("password"),
    };
    assertRegisterBody(rawBody);

    // Validation request body
    const validateResult = validateRegisterInput(rawBody);
    if (!validateResult.valid) {
      return new Response(JSON.stringify({ message: validateResult.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Sanitize validated body
    const cleanBody: RegisterDomainInput = {
      name: rawBody.name.toLowerCase(),
      email: rawBody.email.toLowerCase(),
      username: rawBody.username.toLowerCase(),
      password: rawBody.password,
    };

    // Call register controller
    const result: HttpResponse = await registerController(
      baseLogger,
      cleanBody
    );

    return new Response(JSON.stringify({ message: result.message }), {
      status: result.status,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "x-trace-id": baseLogger.requestId,
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        message: "Register error. Please try again later.",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
}

// ============================================================
// POST /auth/login
// ============================================================
export async function handleLogin(
  baseLogger: BaseLogger,
  req: Request,
  corsHeaders: any
) {
  try {
    // Parse request body and sanitize fields.
    const form = await parseBodyFormData(req);
    if ("status" in form && "message" in form) {
      return new Response(JSON.stringify({ message: form.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const rawBody = {
      username: form.get("username"),
      password: form.get("password"),
    };
    assertLoginBody(rawBody);

    // Validate request body
    const validateResult = validateLoginInput(rawBody);
    if (!validateResult.valid) {
      return new Response(
        JSON.stringify({
          message: validateResult.message,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Sanitize validated body
    const cleanBody: LoginDomainInput = {
      username: rawBody.username.toLowerCase(),
      password: rawBody.password,
    };

    // Call login controller:
    const result: HttpResponse | LoginDomainOutput = await loginController(
      baseLogger,
      cleanBody
    );

    if ("status" in result && "message" in result) {
      return new Response(JSON.stringify({ message: result.message }), {
        status: result.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response: HttpLoginPostResponse = {
      userId: result.userId,
      username: result.username,
      authToken: result.accessToken,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Set-Cookie": `refresh_token=${result.refreshToken}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${refreshTokenMaxAge}`,
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        message: "Login error. Please try again later.",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
}

// ============================================================
// GET /auth/logout
// ============================================================
export async function handleLogout(
  baseLogger: BaseLogger,
  req: Request,
  corsHeaders: any
) {
  try {
    const auth: HttpResponse | string = parseAuthToken(req);
    if (typeof auth !== "string" && "status" in auth && "message" in auth) {
      return new Response(JSON.stringify({ message: auth.message }), {
        status: auth.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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

    const input: LogoutDomainInput = {
      userId: authResult.data.userId,
      authToken: auth,
    };
    const result = await logoutController(input);

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
        message: "Logout error. Please try again later.",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
}

// ============================================================
// POST /auth/refresh/token
// ============================================================
export async function handleRefreshAuthToken(
  baseLogger: BaseLogger,
  req: Request,
  corsHeaders: any
) {
  try {
    // Parse refresh token
    const auth: HttpResponse | string = parseRefreshToken(req);
    if (typeof auth !== "string" && "status" in auth && "message" in auth) {
      return new Response(JSON.stringify({ message: auth.message }), {
        status: auth.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify refresh token
    const authResult: RefreshTokenPayload | null = refreshTokenMiddleware(auth);
    if (!authResult) {
      return new Response(
        JSON.stringify({ message: "Invalid or expired auth token." }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const input: RefreshAuthTokenInput = {
      userId: authResult.data.userId,
    };
    const result = await refreshAuthTokenController(baseLogger, input);

    if ("status" in result && "message" in result) {
      return new Response(JSON.stringify({ message: result.message }), {
        status: result.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // HTTP response successfully
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        message: "Refresh token error. Please try again later.",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
}
