import type {
  ResponseDomain,
  CreateConversationDomainInput,
  GetConversationDomainOutput,
  GetConversationIdsRepositoryOutput,
} from "../types/domain";
import { getConversationIdsRepository } from "../repository";
import {
  createConversationService,
  getConversationsService,
} from "../services";
import { DomainError } from "../helpers/errors";

export async function createConversationController(
  input: CreateConversationDomainInput
) {
  const result = await createConversationService(input);
  return result;
}

export async function getConversationIdsController(input: {
  userId: string;
}): Promise<GetConversationIdsRepositoryOutput> {
  const result = await getConversationIdsRepository(input);

  if (!result) {
    throw new DomainError({
      status: 500,
      code: "USER_ID_INVALID",
      message: "userId is invalid",
    });
  }

  return result;
}

export async function getConversationsController(input: {
  userId: string;
}): Promise<GetConversationDomainOutput[]> {
  const conversations = await getConversationsService(input);
  return conversations;
}
