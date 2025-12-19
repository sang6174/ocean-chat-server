import type {
  GetProfileUserDomainInput,
  GetProfileUserDomainOutput,
} from "../types/domain";
import {
  getProfileUsersService,
  getProfileUserService,
} from "../services/users";

export async function getProfileUsersController(): Promise<
  GetProfileUserDomainOutput[]
> {
  return await getProfileUsersService();
}

export async function getProfileUserController(
  input: GetProfileUserDomainInput
): Promise<GetProfileUserDomainOutput> {
  return await getProfileUserService(input);
}
