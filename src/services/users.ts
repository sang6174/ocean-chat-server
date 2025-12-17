import type {
  GetProfileUserDomainInput,
  ResponseDomain,
  GetProfileUserDomainOutput,
} from "../types/domain";
import {
  getAllProfileUsersRepository,
  getProfileUserRepository,
} from "../repository";
import type { BaseLogger } from "../helpers/logger";

export async function getProfileUsersService(
  baseLogger: BaseLogger
): Promise<ResponseDomain | GetProfileUserDomainOutput[]> {
  try {
    const result = await getAllProfileUsersRepository(baseLogger);
    if (!result) {
      return {
        status: 500,
        message: "Get all users from database error. Please try again.",
      };
    }
    return result;
  } catch (err) {
    return {
      status: 500,
      message: "Get all users from database error. Please try again.",
    };
  }
}

export async function getProfileUserService(
  baseLogger: BaseLogger,
  input: GetProfileUserDomainInput
): Promise<ResponseDomain | GetProfileUserDomainOutput> {
  try {
    const result = await getProfileUserRepository(baseLogger, input);
    if (!result) {
      return {
        status: 500,
        message: "Get the user from database error. Please try again.",
      };
    }
    return result;
  } catch (err) {
    return {
      status: 500,
      message: "Get all user from database error. Please try again.",
    };
  }
}
