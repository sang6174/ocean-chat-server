import { ConversationType } from "../types";
import type { HttpResponse, HttpLoginPostResponse } from "../types";
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
  const result = await registerService(name, email, username, password);
  if (!result) {
    return null;
  }
  if ("status" in result && "message" in result && !("data" in result)) {
    return result;
  }

  const type = ConversationType.Myself;
  const metadata = {
    name: "you",
    creator: "",
  };
  const participantIds = [result.data.user.id];
  const senderId = result.data.user.id;
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
  const result = await loginService(username, password);
  return result;
}
