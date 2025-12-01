import type { HttpResponse, HttpLoginPostResponse } from "../types";
import { registerService, loginService } from "../services";

export async function registerController(
  name: string,
  email: string,
  username: string,
  password: string
): Promise<HttpResponse | null> {
  const result = await registerService(name, email, username, password);
  return result;
}

export async function loginController(
  username: string,
  password: string
): Promise<HttpResponse | HttpLoginPostResponse | null> {
  const result = await loginService(username, password);
  return result;
}
