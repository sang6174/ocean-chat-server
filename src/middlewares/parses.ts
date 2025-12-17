import type { HttpResponse } from "../types/http";

export async function safeFormData(req: Request) {
  try {
    return await req.formData();
  } catch (err) {
    console.log(`[${new Date().toISOString()}] Form-data parse error:`, err);
    return null;
  }
}

export async function parseBodyFormData(req: Request) {
  const form = await safeFormData(req);

  if (!form) {
    return {
      status: 400,
      message:
        "Invalid request body. Please submit the data using multipart/form-data.",
    };
  }

  return form;
}

export async function safeJSON(req: Request): Promise<object | null> {
  try {
    const data = await req.json();
    if (data && typeof data === "object" && !Array.isArray(data)) {
      return data;
    }
    return null;
  } catch (err) {
    console.log(`[${new Date().toISOString()}] JSON parse error:`, err);
    return null;
  }
}

export async function parseBodyJSON<T = any>(
  req: Request
): Promise<HttpResponse | T> {
  const body = (await safeJSON(req)) as T | null;
  if (!body) {
    return {
      status: 400,
      message: "Invalid request body. Please send a valid JSON object.",
    };
  }
  return body;
}

export function parseAuthToken(req: Request): HttpResponse | string {
  let auth = req.headers.get("Authorization")?.slice(7);
  const isBearer = req.headers.get("Authorization")?.startsWith("Bearer ");

  if (!auth || !isBearer) {
    const url = new URL(req.url);
    const tokenParam = url.searchParams.get("token");
    if (tokenParam) {
      auth = tokenParam;
    }
  }

  if (!auth) {
    console.log("Error");
    return {
      status: 401,
      message: "Missing or invalid authentication token",
    };
  }
  return auth;
}

export function parseRefreshToken(req: Request): HttpResponse | string {
  const auth = req.headers.get("Authorization")?.slice(7);
  if (!auth || !req.headers.get("Authorization")?.startsWith("Bearer ")) {
    return {
      status: 401,
      message: "Missing or invalid refresh token.",
    };
  }
  return auth;
}
