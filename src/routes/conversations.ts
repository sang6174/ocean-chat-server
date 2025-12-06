import type { UserTokenPayload } from "../types/domain";
import { parseAuthToken, authMiddleware } from "../middlewares";
import { getConversationsController } from "../controllers";

export async function handleGetConversations(req: Request, corsHeaders: any) {
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

    // Call get conversations controller
    const result = await getConversationsController(authResult.data.userId);
    if (!result) {
      return new Response(
        JSON.stringify({
          message: "Get conversations error, please try again.",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
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
      `[ROUTE_ERROR] - ${new Date().toISOString()} - Get all conversation for a user error.\n`,
      err
    );
    return new Response(
      JSON.stringify({
        message: "Get conversations error. Please try again later.",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
}
