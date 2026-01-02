import type {
  SendMessageDomainInput,
  ResponseDomain,
  GetMessagesByConversationIdDomainInput,
  GetMessagesByConversationIdDomainOutput,
} from "../types/domain";
import { sendMessageService, getMessagesService } from "../services";

export async function sendMessageController(
  input: SendMessageDomainInput
): Promise<ResponseDomain> {
  const result = await sendMessageService(input);
  return result;
}

export async function getMessagesController(
  input: GetMessagesByConversationIdDomainInput
): Promise<GetMessagesByConversationIdDomainOutput[]> {
  const result = await getMessagesService(input);

  return result;
}
