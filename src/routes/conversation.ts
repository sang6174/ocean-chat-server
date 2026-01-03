import type {
  HttpCreateGroupConversationPost,
  HttpSendMessagePost,
  HttpAddParticipantsPost,
} from "../types/http";
import { ConversationType } from "../types/domain";
import type {
  ResponseDomain,
  UserTokenPayload,
  CreateGroupConversationDomainInput,
  SendMessageDomainInput,
  AddParticipantsDomainInput,
} from "../types/domain";
import {
  extractAndParseAccessToken,
  parseBodyJSON,
  checkAccessTokenMiddleware,
  assertHttpCreateGroupConversationPost,
  assertHttpSendMessagePost,
  assertHttpAddParticipantsPost,
  assertCreateGroupConversationDomainInput,
  assertAddParticipantsDomainInput,
} from "../middlewares";
import {
  createGroupConversationController,
  sendMessageController,
  addParticipantsController,
} from "../controllers";
import { logger } from "../helpers/logger";
import { handleError } from "../helpers/errors";
import { RequestContextAccessor } from "../helpers/contexts";

// ============================================================
// POST /v1/conversation/group
// ============================================================
export async function handleCreateGroupConversation(
  req: Request,
  corsHeaders: any
) {
  try {
    logger.debug("Start handle create a new group conversation");

    // Parse refresh token
    const accessToken = extractAndParseAccessToken(req);

    // Verify refresh token
    const authResult = checkAccessTokenMiddleware(accessToken);

    // Parse request body
    const rawBody = await parseBodyJSON<HttpCreateGroupConversationPost>(req);

    assertHttpCreateGroupConversationPost(rawBody);

    // Sanitize, validate and assert input of controller
    let cleanBody: CreateGroupConversationDomainInput;
    cleanBody = {
      type: ConversationType.Group,
      name: rawBody.conversation.name,
      creator: {
        id: authResult.data.userId,
        username: authResult.data.username,
      },
      participantIds: rawBody.participantIds,
    };
    assertCreateGroupConversationDomainInput(cleanBody);

    // Call create conversation controller
    const result = await createGroupConversationController(cleanBody);

    logger.debug("Create a new group conversation successfully");
    return new Response(JSON.stringify(result), {
      status: 201,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "x-request-id": RequestContextAccessor.getRequestId(),
        "x-tab-id": RequestContextAccessor.getTabId(),
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
          "x-request-id": RequestContextAccessor.getRequestId(),
          "x-tab-id": RequestContextAccessor.getTabId(),
        },
      }
    );
  }
}

// ============================================================
// POST /v1/conversation/message
// ============================================================
export async function handleSendMessage(req: Request, corsHeaders: any) {
  try {
    logger.debug("Start handle send a message");

    // Parse auth token
    const auth = extractAndParseAccessToken(req);

    // Verify auth token
    const authResult = checkAccessTokenMiddleware(auth);

    // Parse request body
    const rawBody = await parseBodyJSON<HttpSendMessagePost>(req);

    assertHttpSendMessagePost(rawBody);

    // Sanitize validated body
    const cleanBody: SendMessageDomainInput = {
      sender: {
        id: authResult.data.userId,
        username: authResult.data.username,
      },
      conversationId: rawBody.conversationId,
      message: rawBody.message,
    };

    const result = await sendMessageController(cleanBody);

    logger.debug("Send the message successfully");
    return new Response(
      JSON.stringify({ code: result.code, message: result.message }),
      {
        status: result.status,
        headers: {
          ...corsHeaders,
          "x-request-id": RequestContextAccessor.getRequestId(),
          "x-tab-id": RequestContextAccessor.getTabId(),
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
          "x-request-id": RequestContextAccessor.getRequestId(),
          "x-tab-id": RequestContextAccessor.getTabId(),
        },
      }
    );
  }
}

// ============================================================
// POST /v1/conversation/participants
// ============================================================
export async function handleAddParticipants(req: Request, corsHeaders: any) {
  try {
    logger.debug("Start handle add new participants");

    // Parse refresh token
    const auth: ResponseDomain | string = extractAndParseAccessToken(req);

    // Verify refresh token
    const authResult: UserTokenPayload | null =
      checkAccessTokenMiddleware(auth);
    if (!authResult) {
      return new Response(
        JSON.stringify({ message: "Invalid or expired auth token." }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "x-request-id": RequestContextAccessor.getRequestId(),
            "x-tab-id": RequestContextAccessor.getTabId(),
          },
        }
      );
    }

    // Parse request body
    const rawBody = await parseBodyJSON<HttpAddParticipantsPost>(req);

    assertHttpAddParticipantsPost(rawBody);

    const cleanBody: AddParticipantsDomainInput = {
      creator: {
        id: authResult.data.userId,
        username: authResult.data.username,
      },
      conversationId: rawBody.conversationId,
      participantIds: rawBody.participantIds,
    };

    assertAddParticipantsDomainInput(cleanBody);

    const result = await addParticipantsController(cleanBody);

    logger.debug("Add the new participants successfully");
    return new Response(
      JSON.stringify({ code: result.code, message: result.message }),
      {
        status: result.status,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "x-request-id": RequestContextAccessor.getRequestId(),
          "x-tab-id": RequestContextAccessor.getTabId(),
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
          "x-request-id": RequestContextAccessor.getRequestId(),
          "x-tab-id": RequestContextAccessor.getTabId(),
        },
      }
    );
  }
}
