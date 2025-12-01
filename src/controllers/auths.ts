import type { HttpResponse } from "../types";
import { registerService } from "../services";

export async function registerController(
  name: string,
  email: string,
  username: string,
  password: string
): Promise<HttpResponse | null> {
  const result = await registerService(name, email, username, password);
  return result;
}
