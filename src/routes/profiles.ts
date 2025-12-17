import type {
  GetProfileUserDomainInput,
  UserTokenPayload,
} from "../types/domain";
import { parseAuthToken, authMiddleware, isUUIDv4 } from "../middlewares";
import {
  getProfileUsersController,
  getProfileUserController,
} from "../controllers";
import type { HttpResponse } from "../types/http";
import type { BaseLogger } from "../helpers/logger";

export async function handleGetAllProfileUsers(
  baseLogger: BaseLogger,
  req: Request,
  corsHeaders: any
) {
  try {
    // Parse auth token
    const auth = parseAuthToken(req);
    if (typeof auth !== "string" && "status" in auth && "message" in auth) {
      return new Response(JSON.stringify({ message: auth.message }), {
        status: auth.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify auth token
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

    // Call get messages controller
    const result = await getProfileUsersController(baseLogger);

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
      JSON.stringify({ message: "Get all users error. Please try again." }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
}

export async function handleGetProfileUser(
  baseLogger: BaseLogger,
  url: URL,
  req: Request,
  corsHeaders: any
) {
  try {
    // Parse auth token
    const auth = parseAuthToken(req);
    if (typeof auth !== "string" && "status" in auth && "message" in auth) {
      return new Response(JSON.stringify({ message: auth.message }), {
        status: auth.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify auth token
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

    // Call get info user controller
    const input: GetProfileUserDomainInput = { userId: authResult.data.userId };
    const result = await getProfileUserController(baseLogger, input);

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
      JSON.stringify({ message: "Get all users error. Please try again." }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
}
