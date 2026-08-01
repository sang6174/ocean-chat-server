import type { HttpLoginPostResponse } from "../types/http";
import type {
  ResponseDomain,
  LoginDomainInput,
  LogoutDomainInput,
  GenerateAuthTokenDomainInput,
  RegisterDomainInput,
} from "../types/domain";
import {
  parseBodyJSON,
  checkRefreshTokenMiddleware,
  extractAndParseAccessToken,
  checkAccessTokenMiddleware,
  assertHttpRegisterPost,
  assertHttpLoginPost,
  assertLogoutDomainInput,
  assertHttpLoginPostResponse,
  assertGenerateAuthTokenOutput,
} from "../middlewares";
import {
  registerController,
  loginController,
  generateAuthTokenController,
  logoutController,
} from "../controllers";
import { env } from "../configs/env";
import { logger } from "../helpers/logger";
import { handleError } from "../helpers/errors";
import { RequestContextAccessor } from "../helpers/contexts";

const refreshTokenMaxAge = env.refreshTokenMaxAge.toString();

function buildHeaders(corsHeaders: any, extra: Record<string, string> = {}): Record<string, string> {
  return {
    ...corsHeaders,
    "Content-Type": "application/json",
    "x-request-id": RequestContextAccessor.getRequestId() ?? "",
    "x-tab-id": RequestContextAccessor.getTabId() ?? "",
    ...extra,
  };
}

// ============================================================
// POST /v1/auth/register
// ============================================================
export async function handleRegister(req: Request, corsHeaders: any) {
  try {
    logger.debug("Start handle register");

    const rawBody = await parseBodyJSON<{
      name: unknown;
      email: unknown;
      username: unknown;
      password: unknown;
    }>(req);

    assertHttpRegisterPost(rawBody);

    const cleanBody: RegisterDomainInput = {
      name: rawBody.name.toLowerCase(),
      email: rawBody.email.toLowerCase(),
      username: rawBody.username.toLowerCase(),
      password: rawBody.password,
    };

    const result: ResponseDomain = await registerController(cleanBody);

    logger.debug("Register successfully");
    return new Response(
      JSON.stringify({ code: result.code, message: result.message }),
      { status: result.status, headers: buildHeaders(corsHeaders) }
    );
  } catch (err) {
    return handleError(err, corsHeaders) ?? new Response(
      JSON.stringify({ code: "INTERNAL_ERROR", message: "Register error. Please try again later." }),
      { status: 500, headers: buildHeaders(corsHeaders) }
    );
  }
}

// ============================================================
// POST /v1/auth/login
// ============================================================
export async function handleLogin(req: Request, corsHeaders: any) {
  try {
    logger.debug("Start handle login");

    const rawBody = await parseBodyJSON<{
      username: unknown;
      password: unknown;
    }>(req);

    assertHttpLoginPost(rawBody);

    const cleanBody: LoginDomainInput = {
      username: rawBody.username.toLowerCase(),
      password: rawBody.password,
    };

    const result = await loginController(cleanBody);

    const response: HttpLoginPostResponse = {
      userId: result.userId,
      username: result.username,
      accessToken: result.accessToken,
    };
    assertHttpLoginPostResponse(response);

    logger.debug("Login successfully");
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: buildHeaders(corsHeaders, {
        "Set-Cookie": `refresh_token=${result.refreshToken}; HttpOnly; SameSite=None; Secure; Path=/; Max-Age=${refreshTokenMaxAge}`,
      }),
    });
  } catch (err) {
    return handleError(err, corsHeaders) ?? new Response(
      JSON.stringify({ code: "INTERNAL_ERROR", message: "Login error. Please try again later." }),
      { status: 500, headers: buildHeaders(corsHeaders) }
    );
  }
}

// ============================================================
// POST /v1/auth/refresh
// ============================================================
export async function handleGenerateAuthToken(req: Request, corsHeaders: any) {
  try {
    logger.info("Start handle generate access token");

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
        JSON.stringify({ code: "LOGOUT_SUCCESS", message: "Logout successfully, no token to revoke." }),
        {
          status: 200,
          headers: buildHeaders(corsHeaders, {
            "Set-Cookie": "refresh_token=; HttpOnly; Path=/; Max-Age=0",
          }),
        }
      );
    }

    const refreshResult = checkRefreshTokenMiddleware(refreshToken);
    const input: GenerateAuthTokenDomainInput = {
      userId: refreshResult.data.userId,
      refreshToken,
    };

    const result = await generateAuthTokenController(input);
    assertGenerateAuthTokenOutput(result);

    const response: HttpLoginPostResponse = {
      userId: result.userId,
      username: result.username,
      accessToken: result.accessToken,
    };

    logger.debug("Generate auth token successfully");
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: buildHeaders(corsHeaders, {
        "Set-Cookie": `refresh_token=${result.refreshToken}; HttpOnly; SameSite=None; Secure; Path=/; Max-Age=${refreshTokenMaxAge}`,
      }),
    });
  } catch (err: any) {
    return handleError(err, corsHeaders) ?? new Response(
      JSON.stringify({ code: "INTERNAL_ERROR", message: "Refresh token error. Please try again later." }),
      { status: 500, headers: buildHeaders(corsHeaders) }
    );
  }
}

// ============================================================
// POST /v1/auth/logout
// ============================================================
export async function handleLogout(req: Request, corsHeaders: any) {
  try {
    logger.debug("Start handle logout");

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
        JSON.stringify({ code: "LOGOUT_SUCCESS", message: "Logout successfully, no token to revoke." }),
        {
          status: 200,
          headers: buildHeaders(corsHeaders, {
            "Set-Cookie": "refresh_token=; HttpOnly; Path=/; Max-Age=0",
          }),
        }
      );
    }

    let refreshResult;
    try {
      refreshResult = checkRefreshTokenMiddleware(refreshToken);
    } catch {
      logger.warn("Invalid refresh token during logout, clearing cookie anyway.");
      return new Response(
        JSON.stringify({ code: "LOGOUT_SUCCESS", message: "Logout successfully (invalid token cleared)." }),
        {
          status: 200,
          headers: buildHeaders(corsHeaders, {
            "Set-Cookie": "refresh_token=; HttpOnly; Path=/; Max-Age=0",
          }),
        }
      );
    }

    const input: LogoutDomainInput = {
      userId: refreshResult.data.userId,
      refreshToken,
    };

    assertLogoutDomainInput(input);
    const result = await logoutController(input);

    logger.debug("Logout successfully");
    return new Response(JSON.stringify({ message: result.message }), {
      status: result.status,
      headers: buildHeaders(corsHeaders, {
        "Set-Cookie": "refresh_token=; HttpOnly; Path=/; Max-Age=0",
      }),
    });
  } catch (err) {
    return handleError(err, corsHeaders) ?? new Response(
      JSON.stringify({ code: "INTERNAL_ERROR", message: "Logout error. Please try again later." }),
      { status: 500, headers: buildHeaders(corsHeaders) }
    );
  }
}
