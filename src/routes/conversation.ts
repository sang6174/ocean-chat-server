import type { HttpResponse, HttpConversationPost } from "../types/http";
import { ConversationType } from "../types/domain";
import type {
  UserTokenPayload,
  CreateConversationDomainInput,
} from "../types/domain";
import {
  parseAuthToken,
  parseBodyJSON,
  authMiddleware,
  validateCreateMyselfConversation,
  validateCreateDirectConversation,
  validateCreateGroupConversation,
} from "../middlewares";
import { createConversationController } from "../controllers";

export async function handleCreateConversation(req: Request, corsHeaders: any) {
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
    const rawBody: HttpConversationPost | HttpResponse =
      await parseBodyJSON<HttpConversationPost>(req);
    if ("status" in rawBody && "message" in rawBody) {
      return new Response(JSON.stringify({ message: rawBody.message }), {
        status: rawBody.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate request body according to conversation type
    let validatedResult;
    if (rawBody.type === ConversationType.Myself) {
      validatedResult = validateCreateMyselfConversation(rawBody);
    } else if (rawBody.type === ConversationType.Direct) {
      validatedResult = validateCreateDirectConversation(rawBody);
    } else if (rawBody.type === ConversationType.Group) {
      validatedResult = validateCreateGroupConversation(
        rawBody,
        authResult.data.userId
      );
    } else {
      const validTypes = Object.values(ConversationType);
      return new Response(
        JSON.stringify({ message: "Invalid conversation type.", validTypes }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    if (!validatedResult.valid) {
      return new Response(
        JSON.stringify({ message: validatedResult.message }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Sanitize request body according to conversation type
    let cleanBody: CreateConversationDomainInput;
    if (rawBody.type === ConversationType.Myself) {
      cleanBody = {
        type: ConversationType.Myself,
        metadata: {
          name: rawBody.metadata.name,
          creator: authResult.data.userId,
        },
        participantIds: [authResult.data.userId],
        senderId: authResult.data.userId,
        accessToken: auth,
      };
    } else if (rawBody.type === ConversationType.Direct) {
      cleanBody = {
        type: ConversationType.Direct,
        metadata: {
          name: "",
          creator: "",
        },
        participantIds: rawBody.participantIds,
        senderId: authResult.data.userId,
        accessToken: auth,
      };
    } else if (rawBody.type === ConversationType.Group) {
      cleanBody = {
        type: ConversationType.Group,
        metadata: {
          name: rawBody.metadata.name,
          creator: authResult.data.userId,
        },
        participantIds: rawBody.participantIds,
        senderId: authResult.data.userId,
        accessToken: auth,
      };
    } else {
      const validTypes = Object.values(ConversationType);
      return new Response(
        JSON.stringify({ message: "Invalid conversation type.", validTypes }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Call create conversation controller
    const result = await createConversationController(
      cleanBody.type,
      cleanBody.metadata,
      cleanBody.participantIds,
      cleanBody.senderId,
      cleanBody.accessToken
    );
    if (!result) {
      return new Response(
        JSON.stringify({ message: "Create a new conversation is failed." }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // HTTP response successfully
    return new Response(
      JSON.stringify({ message: "Create a new conversation is successful." }),
      {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.log(
      `[ROUTE_ERROR] - ${new Date().toISOString()} - Create a new conversation error.\n`,
      err
    );
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
