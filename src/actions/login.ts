"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { isAuthError } from "@/lib/auth/auth-utils";
import { LoginSchema } from "@/lib/validations/auth";
import { headers } from "next/headers";
import { rateLimit, getClientIp } from "@/lib/security";

/**
 * Form state type for login action
 */
export type LoginFormState = {
  success?: boolean;
  error?: {
    message?: string;
    fields?: {
      identifier?: string[];
      password?: string[];
    };
  };
};

/**
 * Robust login action using AuthService abstraction
 * Handles validation, authentication, and error states
 */
export async function loginAction(
  prevState: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  try {
    const credentials = Object.fromEntries(formData.entries());
    const validatedFields = LoginSchema.safeParse(credentials);

    if (!validatedFields.success) {
      return {
        error: {
          fields: validatedFields.error.flatten().fieldErrors,
        },
      };
    }

    const { identifier, password } = validatedFields.data;
    const isEmail = /.+@.+\..+/.test(identifier);

    // Rate limit logins by email + client IP
    const h = await headers();
    const ip: string = getClientIp(h);
    const rl = await rateLimit({ action: "login", identifier, ip });
    if (!rl.ok) {
      return { error: { message: "Too many login attempts. Please try again later." } };
    }

    if (isEmail) {
      await auth.api.signInEmail({ body: { email: identifier, password } });
    } else {
      // Username sign-in provided by Better Auth username plugin
      // https://www.better-auth.com/docs/plugins/username
      // Server API: auth.api.signInUsername({ body: { username, password } })
      await auth.api.signInUsername({ body: { username: identifier, password } });
    }
    redirect("/user?message=Logged%20in%20successfully");
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }

    console.error("Login action error:", error);

    if (isAuthError(error)) {
      return { error: { message: error.body.message } };
    }

    return { error: { message: "Invalid email or password. Please try again." } };
  }
}
