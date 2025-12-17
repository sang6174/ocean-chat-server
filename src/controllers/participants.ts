import type {
  ResponseDomain,
  AddParticipantsDomainInput,
} from "../types/domain";
import { addParticipantsService } from "../services";
import type { BaseLogger } from "../helpers/logger";

export async function addParticipantsController(
  baseLogger: BaseLogger,
  input: AddParticipantsDomainInput
): Promise<ResponseDomain | null> {
  const result = await addParticipantsService(baseLogger, input);
  return result;
}
