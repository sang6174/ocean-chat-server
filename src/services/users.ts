import type { ResponseDomain, GetInfoUsersDomainOutput } from "../types/domain";
import { getInfoUsersRepository } from "../repository";

export async function getInfoUsersService(): Promise<
  ResponseDomain | GetInfoUsersDomainOutput[]
> {
  try {
    const result = await getInfoUsersRepository();
    if (!result) {
      return {
        status: 500,
        message: "Get all user from database error. Please try again.",
      };
    }
    return result;
  } catch (err) {
    console.log(
      `[SERVICE_ERROR] - ${new Date().toISOString()} - Get all info users.`,
      err
    );
    return {
      status: 500,
      message: "Get all user from database error. Please try again.",
    };
  }
}
