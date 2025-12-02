import type {
  HttpResponse,
  HttpMessagePost,
  SendMessageInput,
  UserTokenPayload,
} from "../types";
import {
  parseAuthToken,
  parseBodyJSON,
  authMiddleware,
  validateSendMessageInput,
} from "../middlewares";
import { sendMessageController } from "../controllers";

export async function handleSendMessage(req: Request, corsHeaders: any) {
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

    // Parse request body
    const rawBody = await parseBodyJSON<HttpMessagePost>(req);
    if ("status" in rawBody && "message" in rawBody) {
      return new Response(JSON.stringify({ message: rawBody.message }), {
        status: rawBody.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate request body
    const validatedResult = validateSendMessageInput(
      rawBody.conversation,
      rawBody.message
    );
    if (!validatedResult.valid) {
      return new Response(
        JSON.stringify({ message: validatedResult.message }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Sanitize validated body
    const cleanBody: SendMessageInput = {
      senderId: authResult.data.userId,
      accessToken: auth,
      conversation: rawBody.conversation,
      message: rawBody.message,
    };
    const result: HttpResponse | null = await sendMessageController(
      cleanBody.senderId,
      cleanBody.accessToken,
      cleanBody.conversation,
      cleanBody.message
    );
    if (!result) {
      return new Response(
        JSON.stringify({
          message: "Send message error, please resend message.",
        }),
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
    console.log("handleRegister error: ", err);
    return new Response(
      JSON.stringify({
        message: "Send a message error. Please try again later.",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
}
