import type {
  ResponseDomain,
  AddParticipantsDomainInput,
} from "../types/domain";
import { addParticipantsService } from "../services";

export async function addParticipantsController(
  input: AddParticipantsDomainInput
): Promise<ResponseDomain> {
  const result = await addParticipantsService(input);
  return result;
}
