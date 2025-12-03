import type { HttpRegisterPost, HttpResponse } from "../types";
import { parseBodyFormData, isRegisterInput } from "../middlewares";
import { registerController } from "../controllers";

export async function handleRegister(req: Request, corsHeaders: any) {
  try {
    // Parse request body and sanitize fields.
    const form = await parseBodyFormData(req);
    if ("status" in form && "message" in form) {
      return new Response(JSON.stringify({ message: form.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const rawBody = {
      name: form.get("name"),
      email: form.get("email"),
      username: form.get("username"),
      password: form.get("password"),
    };

    // Validation request body
    if (!isRegisterInput(rawBody)) {
      return new Response(
        JSON.stringify({
          message:
            "Missing or invalid fields: name, email, username, password.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Sanitize validated body
    const cleanBody: HttpRegisterPost = {
      name: rawBody.name.toLowerCase(),
      email: rawBody.email.toLowerCase(),
      username: rawBody.username.toLowerCase(),
      password: rawBody.password,
    };

    // Call register controller: handle business logic & interact with database
    const result: HttpResponse | null = await registerController(
      cleanBody.name,
      cleanBody.email,
      cleanBody.username,
      cleanBody.password
    );
    if (!result) {
      return new Response(
        JSON.stringify("Registration failed. Please resend request."),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // HTTP response successfully
    return new Response(JSON.stringify({ message: result.message }), {
      status: result.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.log(
      `[ROUTE_ERROR] - ${new Date().toISOString()} - Register error.\n`,
      err
    );
    return new Response(
      JSON.stringify({
        message: "Register error. Please try again later.",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
}
