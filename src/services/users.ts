import type {
  GetInfoUserDomainInput,
  ResponseDomain,
  GetInfoUserDomainOutput,
} from "../types/domain";
import { getInfoUsersRepository, getInfoUserRepository } from "../repository";

export async function getInfoUsersService(): Promise<
  ResponseDomain | GetInfoUserDomainOutput[]
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
      `[SERVICE_ERROR] - ${new Date().toISOString()} - Get all info users error.`,
      err
    );
    return {
      status: 500,
      message: "Get all user from database error. Please try again.",
    };
  }
}

export async function getInfoUserService({
  userId,
}: GetInfoUserDomainInput): Promise<ResponseDomain | GetInfoUserDomainOutput> {
  try {
    const result = await getInfoUserRepository({ userId });
    if (!result) {
      return {
        status: 500,
        message: "Get the user from database error. Please try again.",
      };
    }
    return result;
  } catch (err) {
    console.log(
      `[SERVICE_ERROR] - ${new Date().toISOString()} - Get the info user error.`,
      err
    );
    return {
      status: 500,
      message: "Get all user from database error. Please try again.",
    };
  }
}
