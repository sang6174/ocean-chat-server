import type { ResponseDomain, GetInfoUsersDomainOutput } from "../types/domain";
import { getInfoUsersService } from "../services/users";

export async function getInfoUsersController(): Promise<
  ResponseDomain | GetInfoUsersDomainOutput[]
> {
  return await getInfoUsersService();
}
