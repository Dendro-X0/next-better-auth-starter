"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { isAuthError } from "@/lib/auth/auth-utils";
import { Verify2FASchema } from "@/lib/validations/auth";
import { rateLimit, getClientIp } from "@/lib/security";

export type FormState = {
  error?: {
    form?: string;
    fields?: {
      code?: string[];
      backupCode?: string[];
    };
  };
  message?: string;
};

export async function verifyTwoFactorAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const data = Object.fromEntries(formData.entries());
  const validatedFields = Verify2FASchema.safeParse(data);

  if (!validatedFields.success) {
    const formErrors = validatedFields.error.flatten().formErrors;
    const fieldErrors = validatedFields.error.flatten().fieldErrors;
    return {
      error: {
        form: formErrors.join(", "),
        fields: {
          code: fieldErrors.code,
          backupCode: fieldErrors.backupCode,
        },
      },
    };
  }

  const { code, backupCode, rememberDevice } = validatedFields.data;
  const shouldRemember = rememberDevice === "on";

  try {
    const verificationCode = code || backupCode;
    const h = await headers();
    const ip: string = getClientIp(h);
    const rl = await rateLimit({ action: "verify_2fa", identifier: ip, ip });
    if (!rl.ok) {
      return { error: { form: "Too many verification attempts. Please try again later." } };
    }

    await auth.api.verifyTwoFactorOTP({
      headers: h,
      body: {
        code: verificationCode!,
        trustDevice: shouldRemember,
      },
    });
    redirect("/user?message=Successfully signed in!");
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }

    console.error("Verify 2FA error:", error);

    if (isAuthError(error)) {
      return { error: { form: error.body.message } };
    }

    return { error: { form: "An unexpected error occurred." } };
  }
}
