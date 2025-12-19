import type {
  RegisterDomainInput,
  ResponseDomain,
  LoginDomainInput,
  LoginDomainOutput,
  RefreshAuthTokenInput,
  RefreshAuthTokenOutput,
  LogoutDomainInput,
} from "../types/domain";
import {
  registerService,
  loginService,
  refreshAuthTokenService,
  logoutService,
} from "../services";

export async function registerController(
  input: RegisterDomainInput
): Promise<ResponseDomain> {
  const result = await registerService(input);

  return {
    status: 201,
    code: "REGISTER_SUCCESS",
    message: "Register successfully",
  };
}

export async function loginController(
  input: LoginDomainInput
): Promise<LoginDomainOutput> {
  const result = await loginService(input);
  return result;
}

export async function logoutController(
  input: LogoutDomainInput
): Promise<ResponseDomain> {
  const result = logoutService(input);
  return result;
}

export async function refreshAuthTokenController(
  input: RefreshAuthTokenInput
): Promise<RefreshAuthTokenOutput> {
  const result = await refreshAuthTokenService(input);
  return result;
}
