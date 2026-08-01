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

function buildHeaders(corsHeaders: any): Record<string, string> {
  return {
    ...corsHeaders,
    "Content-Type": "application/json",
    "x-request-id": RequestContextAccessor.getRequestId() ?? "",
    "x-tab-id": RequestContextAccessor.getTabId() ?? "",
  };
}

// ============================================================
// POST /v1/conversation/group
// ============================================================
export async function handleCreateGroupConversation(
  req: Request,
  corsHeaders: any
) {
  try {
    logger.debug("Start handle create a new group conversation");

    const accessToken = extractAndParseAccessToken(req);
    const authResult = checkAccessTokenMiddleware(accessToken);
    const rawBody = await parseBodyJSON<HttpCreateGroupConversationPost>(req);

    assertHttpCreateGroupConversationPost(rawBody);

    const cleanBody: CreateGroupConversationDomainInput = {
      type: ConversationType.Group,
      name: rawBody.conversation.name,
      creator: {
        id: authResult.data.userId,
        username: authResult.data.username,
      },
      participantIds: rawBody.participantIds,
    };
    assertCreateGroupConversationDomainInput(cleanBody);

    const result = await createGroupConversationController(cleanBody);

    logger.debug("Create a new group conversation successfully");
    return new Response(JSON.stringify(result), {
      status: 201,
      headers: buildHeaders(corsHeaders),
    });
  } catch (err) {
    return handleError(err, corsHeaders) ?? new Response(
      JSON.stringify({ code: "INTERNAL_ERROR", message: "Create a conversation error. Please try again later." }),
      { status: 500, headers: buildHeaders(corsHeaders) }
    );
  }
}

// ============================================================
// POST /v1/conversation/message
// ============================================================
export async function handleSendMessage(req: Request, corsHeaders: any) {
  try {
    logger.debug("Start handle send a message");

    const auth = extractAndParseAccessToken(req);
    const authResult = checkAccessTokenMiddleware(auth);
    const rawBody = await parseBodyJSON<HttpSendMessagePost>(req);

    assertHttpSendMessagePost(rawBody);

    const cleanBody: SendMessageDomainInput = {
      sender: { id: authResult.data.userId, username: authResult.data.username },
      conversationId: rawBody.conversationId,
      message: rawBody.message,
    };

    const result = await sendMessageController(cleanBody);

    logger.debug("Send the message successfully");
    return new Response(
      JSON.stringify({ code: result.code, message: result.message }),
      { status: result.status, headers: buildHeaders(corsHeaders) }
    );
  } catch (err) {
    return handleError(err, corsHeaders) ?? new Response(
      JSON.stringify({ code: "INTERNAL_ERROR", message: "Send a message error. Please try again later." }),
      { status: 500, headers: buildHeaders(corsHeaders) }
    );
  }
}

// ============================================================
// POST /v1/conversation/participants
// ============================================================
export async function handleAddParticipants(req: Request, corsHeaders: any) {
  try {
    logger.debug("Start handle add new participants");

    const auth = extractAndParseAccessToken(req);
    const authResult = checkAccessTokenMiddleware(auth);
    if (!authResult) {
      return new Response(
        JSON.stringify({ message: "Invalid or expired auth token." }),
        { status: 401, headers: buildHeaders(corsHeaders) }
      );
    }

    const rawBody = await parseBodyJSON<HttpAddParticipantsPost>(req);

    assertHttpAddParticipantsPost(rawBody);

    const cleanBody: AddParticipantsDomainInput = {
      creator: { id: authResult.data.userId, username: authResult.data.username },
      conversationId: rawBody.conversationId,
      participantIds: rawBody.participantIds,
    };

    assertAddParticipantsDomainInput(cleanBody);

    const result = await addParticipantsController(cleanBody);

    logger.debug("Add the new participants successfully");
    return new Response(
      JSON.stringify({ code: result.code, message: result.message }),
      { status: result.status, headers: buildHeaders(corsHeaders) }
    );
  } catch (err) {
    return handleError(err, corsHeaders) ?? new Response(
      JSON.stringify({ code: "INTERNAL_ERROR", message: "Create a conversation error. Please try again later." }),
      { status: 500, headers: buildHeaders(corsHeaders) }
    );
  }
}
