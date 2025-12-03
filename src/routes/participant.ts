import type {
  HttpResponse,
  HttpParticipantPost,
  UserTokenPayload,
  AddParticipantsInput,
} from "../types";
import {
  parseAuthToken,
  parseBodyJSON,
  authMiddleware,
  validateAddParticipants,
} from "../middlewares";
import { addParticipantsController } from "../controllers";

export async function handleAddParticipants(req: Request, corsHeaders: any) {
  try {
    // Parse refresh token
    const auth: HttpResponse | string = parseAuthToken(req);
    if (typeof auth !== "string" && "status" in auth && "message" in auth) {
      return new Response(JSON.stringify({ message: auth.message }), {
        status: auth.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify refresh token
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
    const rawBody: HttpParticipantPost | HttpResponse =
      await parseBodyJSON<HttpParticipantPost>(req);
    if ("status" in rawBody && "message" in rawBody) {
      return new Response(JSON.stringify({ message: rawBody.message }), {
        status: rawBody.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate request body
    const validatedResult = validateAddParticipants(
      rawBody.conversation,
      rawBody.participantIds
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

    const cleanBody: AddParticipantsInput = {
      userId: authResult.data.userId,
      accessToken: auth,
      conversation: rawBody.conversation,
      participantIds: rawBody.participantIds,
    };

    // Call create add participants controller
    const result = await addParticipantsController(
      cleanBody.userId,
      cleanBody.accessToken,
      cleanBody.conversation,
      cleanBody.participantIds
    );
    if (!result) {
      return new Response(
        JSON.stringify({ message: "Add participants error." }),
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
    console.log("Handle add participants error: ", err);
    return new Response(
      JSON.stringify({
        message: "Create a conversation error. Please try again later.",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
}
