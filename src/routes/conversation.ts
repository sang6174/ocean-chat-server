import type {
  HttpCreateConversationPost,
  HttpSendMessagePost,
  HttpAddParticipantPost,
} from "../types/http";
import { ConversationType } from "../types/domain";
import type {
  ResponseDomain,
  UserTokenPayload,
  CreateConversationDomainInput,
  SendMessageDomainInput,
  AddParticipantsDomainInput,
} from "../types/domain";
import {
  parseAuthToken,
  parseBodyJSON,
  authMiddleware,
  assertHttpCreateConversationPost,
  assertHttpSendMessagePost,
  assertHttpAddParticipantPost,
  assertCreateGroupConversationDomainInput,
  assertSendMessageDomainInput,
  assertAddParticipantsDomainInput,
} from "../middlewares";
import {
  createConversationController,
  sendMessageController,
  addParticipantsController,
} from "../controllers";
import { logger } from "../helpers/logger";
import { handleError } from "../helpers/errors";

// ============================================================
// POST /conversation
// ============================================================
export async function handleCreateConversation(req: Request, corsHeaders: any) {
  try {
    logger.info("Start handle create a conversation");
    // Parse refresh token
    const auth = parseAuthToken(req);
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
    const authResult = authMiddleware(auth);
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

    // Parse request body
    const rawBody = await parseBodyJSON<HttpCreateConversationPost>(req);
    if ("status" in rawBody && "code" in rawBody && "message" in rawBody) {
      return new Response(JSON.stringify({ message: rawBody.message }), {
        status: rawBody.status,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "x-request-id": logger.requestId,
        },
      });
    }
    assertHttpCreateConversationPost(rawBody);

    // Sanitize, validate and assert request body according to conversation type
    let cleanBody: CreateConversationDomainInput;
    if (rawBody.conversation.type === ConversationType.Group) {
      console.log("Be group");
      cleanBody = {
        type: ConversationType.Group,
        metadata: {
          name: rawBody.conversation.metadata.name,
          creator: {
            id: authResult.data.userId,
            username: authResult.data.username,
          },
        },
        participants: rawBody.participants,
        authToken: auth,
      };
      assertCreateGroupConversationDomainInput(cleanBody);
    } else {
      console.log("be not group");
      return new Response(
        JSON.stringify({
          code: "CONVERSATION_TYPE_INVALID",
          message:
            "Invalid conversation type. Type must is 'myself' or 'group'.",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "x-request-id": logger.requestId,
          },
        }
      );
    }

    // Call create conversation controller
    const result = await createConversationController(cleanBody);

    logger.info("Create a new conversation successfully");
    return new Response(JSON.stringify(result), {
      status: 201,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "x-request-id": logger.requestId,
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
        message: "Create a conversation error. Please try again later.",
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
// POST /conversation/message
// ============================================================
export async function handleSendMessage(req: Request, corsHeaders: any) {
  try {
    logger.info("Start handle send a message");
    // Parse auth token
    const auth = parseAuthToken(req);
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

    // Verify auth token
    const authResult = authMiddleware(auth);
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

    // Parse request body
    const rawBody = await parseBodyJSON<HttpSendMessagePost>(req);
    if ("status" in rawBody && "code" in rawBody && "message" in rawBody) {
      return new Response(JSON.stringify({ message: rawBody.message }), {
        status: rawBody.status,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "x-request-id": logger.requestId,
        },
      });
    }
    assertHttpSendMessagePost(rawBody);

    // Sanitize validated body
    const cleanBody: SendMessageDomainInput = {
      sender: {
        id: authResult.data.userId,
        username: authResult.data.username,
      },
      authToken: auth,
      conversationId: rawBody.conversationId,
      message: rawBody.message,
    };

    assertSendMessageDomainInput(cleanBody);
    const result = await sendMessageController(cleanBody);

    logger.info("Send the message successfully");
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
        message: "Send a message error. Please try again later.",
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
// POST /conversation/participants
// ============================================================
export async function handleAddParticipants(req: Request, corsHeaders: any) {
  try {
    logger.info("Start handle add participants");
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

    // Parse request body
    const rawBody = await parseBodyJSON<HttpAddParticipantPost>(req);
    if ("status" in rawBody && "code" in rawBody && "message" in rawBody) {
      return new Response(
        JSON.stringify({ code: rawBody.code, message: rawBody.message }),
        {
          status: rawBody.status,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "x-request-id": logger.requestId,
          },
        }
      );
    }
    assertHttpAddParticipantPost(rawBody);

    const cleanBody: AddParticipantsDomainInput = {
      authToken: auth,
      creator: {
        id: authResult.data.userId,
        username: authResult.data.username,
      },
      conversationId: rawBody.conversationId,
      participants: rawBody.participants,
    };
    assertAddParticipantsDomainInput(cleanBody);

    const result = await addParticipantsController(cleanBody);

    logger.info("Add new participants successfully");
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
        message: "Create a conversation error. Please try again later.",
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
