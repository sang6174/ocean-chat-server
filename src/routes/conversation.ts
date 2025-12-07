import type {
  HttpResponse,
  HttpConversationPost,
  HttpMessagePost,
  HttpParticipantsPost,
} from "../types/http";
import { ConversationType } from "../types/domain";
import type {
  UserTokenPayload,
  CreateConversationDomainInput,
  SendMessageDomainInput,
  AddParticipantsDomainInput,
} from "../types/domain";
import {
  parseAuthToken,
  parseBodyJSON,
  authMiddleware,
  validateCreateMyselfConversation,
  validateCreateGroupConversation,
  validateSendMessageInput,
  validateAddParticipants,
} from "../middlewares";
import {
  createConversationController,
  sendMessageController,
  addParticipantsController,
} from "../controllers";

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
    const cleanBody: SendMessageDomainInput = {
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
    console.log(
      `[ROUTE_ERROR] - ${new Date().toISOString()} - Send message error.\n`,
      err
    );
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
    const rawBody: HttpParticipantsPost | HttpResponse =
      await parseBodyJSON<HttpParticipantsPost>(req);
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

    const cleanBody: AddParticipantsDomainInput = {
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
    console.log(
      `[ROUTE_ERROR] - ${new Date().toISOString()} - Add participants error.\n`,
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
