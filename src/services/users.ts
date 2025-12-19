import type {
  GetProfileUserDomainInput,
  GetProfileUserDomainOutput,
} from "../types/domain";
import {
  getAllProfileUsersRepository,
  getProfileUserRepository,
} from "../repository";
import { DomainError } from "../helpers/errors";

export async function getProfileUsersService(): Promise<
  GetProfileUserDomainOutput[]
> {
  const result = await getAllProfileUsersRepository();
  if (!result) {
    throw new DomainError({
      status: 500,
      code: "GET_OTHER_USER_PROFILE_ERROR",
      message: "Get other user profile error",
    });
  }
  return result;
}

export async function getProfileUserService(
  input: GetProfileUserDomainInput
): Promise<GetProfileUserDomainOutput> {
  const result = await getProfileUserRepository(input);
  if (!result) {
    throw new DomainError({
      status: 400,
      code: "USER_ID_INVALID",
      message: "Get the user profile error",
    });
  }
  return result;
}
