import type {
  RegisterDomainInput,
  ResponseDomain,
  LoginDomainInput,
  LoginDomainOutput,
  GenerateAuthTokenDomainInput,
  GenerateAuthTokenDomainOutput,
  LogoutDomainInput,
} from "../types/domain";
import {
  registerService,
  loginService,
  generateAuthTokenService,
  logoutService,
} from "../services";

export async function registerController(
  input: RegisterDomainInput
): Promise<ResponseDomain> {
  await registerService(input);

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

export async function generateAuthTokenController(
  input: GenerateAuthTokenDomainInput
): Promise<GenerateAuthTokenDomainOutput> {
  const result = await generateAuthTokenService(input);
  return result;
}

export async function logoutController(
  input: LogoutDomainInput
): Promise<ResponseDomain> {
  const result = logoutService(input);
  return result;
}
