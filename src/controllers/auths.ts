import { ConversationType } from "../types/domain";
import type { HttpResponse, HttpLoginPostResponse } from "../types/http";
import {
  registerService,
  loginService,
  createConversationService,
} from "../services";

export async function registerController(
  name: string,
  email: string,
  username: string,
  password: string
): Promise<HttpResponse | null> {
  // Register a new user and account
  const result = await registerService({ name, email, username, password });
  if (!result) {
    return null;
  }
  if ("status" in result && "message" in result) {
    return result;
  }

  // Create a private conversation
  const type = ConversationType.Myself;
  const metadata = {
    name: "you",
    creator: "",
  };
  const participantIds = [result.user.id];
  const senderId = result.user.id;
  const resultConversation = await createConversationService(
    type,
    metadata,
    participantIds,
    senderId
  );
  if (!resultConversation) {
    return null;
  }

  return {
    status: 201,
    message: "Registration successfully",
  };
}

export async function loginController(
  username: string,
  password: string
): Promise<HttpResponse | HttpLoginPostResponse | null> {
  const result = await loginService({ username, password });
  return result;
}
