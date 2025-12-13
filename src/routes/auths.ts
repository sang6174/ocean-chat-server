import type {
  HttpRegisterPost,
  HttpResponse,
  HttpLoginPost,
  HttpLoginPostResponse,
} from "../types/http";
import type { RefreshTokenPayload, UserTokenPayload } from "../types/domain";
import {
  parseBodyFormData,
  parseRefreshToken,
  refreshTokenMiddleware,
  isRegisterInput,
  isLoginInput,
  parseAuthToken,
  authMiddleware,
} from "../middlewares";
import {
  registerController,
  loginController,
  refreshAccessTokenController,
  logoutController,
} from "../controllers";
import type { LoginDomainOutput } from "../types/domain";

const refreshTokenMaxAge = process.env.REFRESH_TOKEN_MAX_AGE!;

// POST /auth/register
export async function handleRegister(req: Request, corsHeaders: any) {
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
      name: form.get("name"),
      email: form.get("email"),
      username: form.get("username"),
      password: form.get("password"),
    };

    // Validation request body
    if (!isRegisterInput(rawBody)) {
      return new Response(
        JSON.stringify({
          message:
            "Missing or invalid fields: name, email, username, password.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Sanitize validated body
    const cleanBody: HttpRegisterPost = {
      name: rawBody.name.toLowerCase(),
      email: rawBody.email.toLowerCase(),
      username: rawBody.username.toLowerCase(),
      password: rawBody.password,
    };

    // Call register controller: handle business logic & interact with database
    const result: HttpResponse | null = await registerController(
      cleanBody.name,
      cleanBody.email,
      cleanBody.username,
      cleanBody.password
    );
    if (!result) {
      return new Response(
        JSON.stringify("Registration failed. Please resend request."),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // HTTP response successfully
    return new Response(JSON.stringify({ message: result.message }), {
      status: result.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.log(
      `[ROUTE_ERROR] - ${new Date().toISOString()} - Register error.\n`,
      err
    );
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

// POST /auth/login
export async function handleLogin(req: Request, corsHeaders: any) {
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

    // Validate request body
    if (!isLoginInput(rawBody)) {
      return new Response(
        JSON.stringify({
          message: "Missing or invalid fields: username, password.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Sanitize validated body
    const cleanBody: HttpLoginPost = {
      username: rawBody.username.toLowerCase(),
      password: rawBody.password,
    };

    // Call login controller:
    const result: HttpResponse | LoginDomainOutput = await loginController(
      cleanBody.username,
      cleanBody.password
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
      accessToken: result.accessToken,
    };

    // HTTP response successfully
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Set-Cookie": `refresh_token=${result.refreshToken}; HttpOnly; SameSite=Lax; Path=/auth/refresh/token; Max-Age=${refreshTokenMaxAge}`,
      },
    });
  } catch (err) {
    console.log(
      `[ROUTE_ERROR] - ${new Date().toISOString()} - Login error.\n`,
      err
    );
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

// GET /auth/logout
export async function handleLogout(req: Request, corsHeaders: any) {
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

    const result = await logoutController({
      userId: authResult.data.userId,
      accessToken: auth,
    });
  } catch (err) {
    console.log(
      `[ROUTE_ERROR] - ${new Date().toISOString()} - Logout error.\n`,
      err
    );
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

// POST /auth/refresh/token
export async function handleRefresh(req: Request, corsHeaders: any) {
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

    const result = await refreshAccessTokenController({
      userId: authResult.data.userId,
    });

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
    console.log(
      `[ROUTE_ERROR] - ${new Date().toISOString()} - Login error.\n`,
      err
    );
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
