import type {
  GetInfoUserDomainInput,
  ResponseDomain,
  GetInfoUserDomainOutput,
} from "../types/domain";
import { getInfoUsersService, getInfoUserService } from "../services/users";

export async function getInfoUsersController(): Promise<
  ResponseDomain | GetInfoUserDomainOutput[]
> {
  return await getInfoUsersService();
}

export async function getInfoUserController({
  userId,
}: GetInfoUserDomainInput): Promise<ResponseDomain | GetInfoUserDomainOutput> {
  return await getInfoUserService({ userId });
}
