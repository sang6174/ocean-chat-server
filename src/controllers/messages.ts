import type {
  SendMessageDomainInput,
  ResponseDomain,
  GetMessagesDomainInput,
  GetMessagesDomainOutput,
} from "../types/domain";
import { sendMessageService, getMessagesService } from "../services";

export async function sendMessageController(
  input: SendMessageDomainInput
): Promise<ResponseDomain> {
  const result = await sendMessageService(input);
  return result;
}

export async function getMessagesController(
  input: GetMessagesDomainInput
): Promise<GetMessagesDomainOutput[]> {
  const result = getMessagesService(input);
  return result;
}
