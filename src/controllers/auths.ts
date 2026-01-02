import type {
  RegisterDomainInput,
  ResponseDomain,
  LoginDomainInput,
  LoginDomainOutput,
  GenerateAccessTokenInput,
  GenerateAccessTokenOutput,
  LogoutDomainInput,
} from "../types/domain";
import {
  registerService,
  loginService,
  generateAccessTokenService,
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

export async function generateAccessTokenController(
  input: GenerateAccessTokenInput
): Promise<GenerateAccessTokenOutput> {
  const result = await generateAccessTokenService(input);
  return result;
}

export async function logoutController(
  input: LogoutDomainInput
): Promise<ResponseDomain> {
  const result = logoutService(input);
  return result;
}
