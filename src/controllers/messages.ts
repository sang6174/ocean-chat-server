import type {
  SendMessageDomainInput,
  ResponseDomain,
  GetMessagesDomainInput,
} from "../types/domain";
import { sendMessageService, getMessagesService } from "../services";
import type { BaseLogger } from "../helpers/logger";

export async function sendMessageController(
  baseLogger: BaseLogger,
  input: SendMessageDomainInput
): Promise<ResponseDomain | null> {
  const result = await sendMessageService(baseLogger, input);
  return result;
}

export async function getMessagesController(
  baseLogger: BaseLogger,
  input: GetMessagesDomainInput
) {
  const result = getMessagesService(baseLogger, input);
  return result;
}
