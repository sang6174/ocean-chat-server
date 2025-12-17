import {
  ConversationType,
  type RegisterDomainInput,
  type ResponseDomain,
  type LoginDomainInput,
  type LoginDomainOutput,
  type RefreshAuthTokenInput,
  type RefreshAuthTokenOutput,
  type LogoutDomainInput,
} from "../types/domain";
import type { HttpResponse } from "../types/http";
import {
  registerService,
  loginService,
  refreshAuthTokenService,
  logoutService,
} from "../services";
import type { BaseLogger } from "../helpers/logger";

export async function registerController(
  baseLogger: BaseLogger,
  input: RegisterDomainInput
): Promise<HttpResponse> {
  const result = await registerService(baseLogger, input);

  if (!result) {
    return {
      status: 500,
      message: "Sign up the account error, please try again.",
    };
  }

  if (
    "code" in result &&
    "table" in result &&
    "constraint" in result &&
    "detail" in result
  ) {
    if (result.code === "23505" && result.table === "users") {
      return {
        status: 409,
        message: "The email address is already in use by another user.",
      };
    }

    if (result.code === "23505" && result.table === "accounts") {
      return {
        status: 409,
        message: "The username is already in use by another account.",
      };
    }

    return {
      status: 500,
      message: "Sign up the account error, please try again.",
    };
  }

  return {
    status: 201,
    message: "Registration successfully",
  };
}

export async function loginController(
  baseLogger: BaseLogger,
  input: LoginDomainInput
): Promise<HttpResponse | LoginDomainOutput> {
  const result = await loginService(baseLogger, input);

  if (!result) {
    return {
      status: 500,
      message: "Login error.",
    };
  }

  if ("status" in result && "message" in result) {
    return result;
  }
  return result;
}

export async function logoutController(
  input: LogoutDomainInput
): Promise<ResponseDomain> {
  const result = logoutService(input);
  return result;
}

export async function refreshAuthTokenController(
  baseLogger: BaseLogger,
  input: RefreshAuthTokenInput
): Promise<RefreshAuthTokenOutput | ResponseDomain> {
  const result = await refreshAuthTokenService(baseLogger, input);
  if (!result) {
    return {
      status: 500,
      message: "Refresh token service error.",
    };
  }
  return result;
}
