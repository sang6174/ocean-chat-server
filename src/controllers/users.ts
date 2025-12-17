import type {
  GetProfileUserDomainInput,
  ResponseDomain,
  GetProfileUserDomainOutput,
} from "../types/domain";
import {
  getProfileUsersService,
  getProfileUserService,
} from "../services/users";
import type { BaseLogger } from "../helpers/logger";

export async function getProfileUsersController(
  baseLogger: BaseLogger
): Promise<ResponseDomain | GetProfileUserDomainOutput[]> {
  return await getProfileUsersService(baseLogger);
}

export async function getProfileUserController(
  baseLogger: BaseLogger,
  input: GetProfileUserDomainInput
): Promise<ResponseDomain | GetProfileUserDomainOutput> {
  return await getProfileUserService(baseLogger, input);
}
