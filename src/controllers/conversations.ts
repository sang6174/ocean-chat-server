import type {
  CreateGroupConversationDomainInput,
  GetConversationsByUserIdDomainOutput,
  GetConversationIdsRepositoryOutput,
  CreateConversationRepositoryOutput,
} from "../types/domain";
import { getConversationIdsRepository } from "../repository";
import {
  createConversationService,
  getConversationsByUserIdService,
} from "../services";
import { DomainError } from "../helpers/errors";

export async function createGroupConversationController(
  input: CreateGroupConversationDomainInput
): Promise<CreateConversationRepositoryOutput> {
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
}): Promise<GetConversationsByUserIdDomainOutput[]> {
  const conversations = await getConversationsByUserIdService(input);

  return conversations;
}
