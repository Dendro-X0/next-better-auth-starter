"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import {
  ChangePasswordSchema,
  NotificationSettingsSchema,
  PrivacySettingsSchema,
  ProfileSchema,
  setPasswordSchema,
} from "@/lib/validations/auth";
import { db } from "@/lib/db";
import { account, user, userProfile } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import type { UserProfile as UserProfileType, UserSettings } from "@/lib/types/user";
import type { FormState } from "@/lib/types/actions";

export async function getUserProfile(): Promise<{ profile: UserProfileType } | { error: string }> {
  const session = await auth.api.getSession({ headers: new Headers(await headers()) });
  if (!session?.user) {
    return { error: "Not authenticated" };
  }

  const data = await db.query.user.findFirst({
    where: eq(user.id, session.user.id),
    with: {
      profile: true,
    },
  });

  if (!data) {
    return { error: "User not found." };
  }

  const profile: UserProfileType = {
    id: data.id,
    name: data.name,
    email: data.email,
    avatar: data.image || "",
    username: data.username || "",
    bio: data.profile?.bio || "",
    location: data.profile?.location || "",
    website: data.profile?.website || "",
    createdAt: data.createdAt.toISOString(),
    updatedAt: data.updatedAt.toISOString(),
    emailVerified: data.emailVerified,
  };
  return { profile };
}

export async function getUserSettings(): Promise<{ settings: UserSettings } | { error: string }> {
  const session = await auth.api.getSession({ headers: new Headers(await headers()) });
  if (!session?.user) {
    return { error: "Not authenticated" };
  }

  const data = await db.query.user.findFirst({
    where: eq(user.id, session.user.id),
    with: {
      profile: true,
    },
  });

  if (!data) {
    return { error: "User not found." };
  }

  const emailAccount = await db.query.account.findFirst({
    where: and(eq(account.userId, session.user.id), eq(account.providerId, "email")),
    columns: { password: true },
  });

  const notifications = NotificationSettingsSchema.parse(data.profile?.notifications || {});
  const privacy = PrivacySettingsSchema.parse(data.profile?.privacy || {});

  const settings: UserSettings = {
    hasPassword: !!emailAccount?.password,
    twoFactorEnabled: data.twoFactorEnabled ?? false,
    backupCodes: [], // This would be stored securely, not in the user record
    trustedDevices: [], // This would be managed separately
    notifications,
    privacy,
  };
  return { settings };
}

export async function updateProfileAction(_prevState: FormState | null, formData: FormData): Promise<FormState> {
  const session = await auth.api.getSession({ headers: new Headers(await headers()) });
  if (!session?.user) {
    return { error: { form: "Not authenticated" } };
  }

  const validatedFields = ProfileSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return { 
      error: { 
        fields: validatedFields.error.flatten().fieldErrors 
      }
    };
  }

  try {
    const { name, username, bio, location, website } = validatedFields.data;

    await db.update(user).set({ name, username }).where(eq(user.id, session.user.id));

    await db
      .insert(userProfile)
      .values({ id: session.user.id, bio, location, website })
      .onConflictDoUpdate({
        target: userProfile.id,
        set: { bio, location, website },
      });

    return { success: true, message: "Profile updated successfully" };
  } catch {
    return { error: { form: "An unexpected error occurred." } };
  }
}

export async function setPasswordAction(_prevState: FormState | null, formData: FormData): Promise<FormState> {
  const validatedFields = setPasswordSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return { 
      error: { 
        fields: validatedFields.error.flatten().fieldErrors 
      }
    };
  }

  try {
    const res = await fetch(new URL("/api/auth/set-password", process.env.NEXT_PUBLIC_APP_URL), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: (await headers()).get("Cookie") || "",
      },
      body: JSON.stringify({ password: validatedFields.data.newPassword }),
    });

    if (!res.ok) {
      const data = await res.json();
      return { error: { form: data.error?.message || "Failed to set password." } };
    }

    return { success: true, message: "Password set successfully." };
  } catch {
    return { error: { form: "An unexpected error occurred." } };
  }
}

export async function changePasswordAction(_prevState: FormState | null, formData: FormData): Promise<FormState> {
  const validatedFields = ChangePasswordSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return { 
      error: { 
        fields: validatedFields.error.flatten().fieldErrors 
      }
    };
  }

  const { currentPassword, newPassword } = validatedFields.data;

  try {
    const res = await fetch(new URL("/api/auth/change-password", process.env.NEXT_PUBLIC_APP_URL), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: (await headers()).get("Cookie") || "",
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    if (!res.ok) {
      const { error } = await res.json();
      return { error: { form: error?.message || "Failed to change password." } };
    }

    return { success: true, message: "Password changed successfully." };
  } catch {
    return { error: { form: "An unexpected error occurred." } };
  }
}

export async function updateNotificationSettingsAction(
  _prevState: FormState | null,
  formData: FormData,
): Promise<FormState> {
  const session = await auth.api.getSession({ headers: new Headers(await headers()) });
  if (!session?.user) {
    return { error: { form: "Not authenticated" } };
  }

  const validatedFields = NotificationSettingsSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return { error: { form: "Invalid fields provided." } };
  }

  try {
    await db
      .insert(userProfile)
      .values({ id: session.user.id, notifications: validatedFields.data })
      .onConflictDoUpdate({
        target: userProfile.id,
        set: { notifications: validatedFields.data },
      });
    return { success: true, message: "Notification settings updated successfully" };
  } catch {
    return { error: { form: "An unexpected error occurred." } };
  }
}

export async function enable2FAAction(_prevState: FormState | null, formData: FormData): Promise<FormState> {
  const password = formData.get("password") as string;
  if (!password) {
    return { error: { form: "Password is required." } };
  }

  try {
    const res = await fetch(new URL("/api/auth/two-factor/enable", process.env.NEXT_PUBLIC_APP_URL), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: (await headers()).get("Cookie") || "",
      },
      body: JSON.stringify({ password }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { error: { form: data.error?.message || "Failed to enable 2FA." } };
    }

    return {
      success: true,
      message: "2FA enabled successfully. Scan the QR code below.",
      qrCode: data.totpURI,
      secret: data.secret,
      backupCodes: data.backupCodes,
    };
  } catch {
    return { error: { form: "An unexpected error occurred." } };
  }
}

export async function disable2FAAction(): Promise<FormState> {
  try {
    const res = await fetch(new URL("/api/auth/two-factor/disable", process.env.NEXT_PUBLIC_APP_URL), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: (await headers()).get("Cookie") || "",
      },
    });

    if (!res.ok) {
      const data = await res.json();
      return { error: { form: data.error?.message || "Failed to disable 2FA." } };
    }

    return { success: true, message: "2FA disabled successfully" };
  } catch {
    return { error: { form: "An unexpected error occurred." } };
  }
}

export async function generateBackupCodesAction(): Promise<FormState> {
  try {
    const res = await fetch(new URL("/api/auth/two-factor/generate-backup-codes", process.env.NEXT_PUBLIC_APP_URL), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: (await headers()).get("Cookie") || "",
      },
    });

    const data = await res.json();

    if (!res.ok) {
      return { error: { form: data.error?.message || "Failed to generate backup codes." } };
    }

    return {
      success: true,
      message: "New backup codes generated. Please save them in a safe place.",
      backupCodes: data.backupCodes,
    };
  } catch {
    return { error: { form: "An unexpected error occurred." } };
  }
}

export async function uploadAvatarAction(_prevState: FormState | null, formData: FormData): Promise<FormState> {
  const file = formData.get("avatar") as File;

  if (!file || file.size === 0) {
    return { error: { form: "Please select a file to upload." } };
  }

  if (file.size > 5 * 1024 * 1024) {
    return { error: { form: "File size must be less than 5MB" } };
  }

  if (!file.type.startsWith("image/")) {
    return { error: { form: "File must be an image" } };
  }

  try {
    // This is a placeholder for your file upload logic.
    // You would typically upload the file to a service like S3, Cloudinary, etc.
    // and then update the user's avatar URL in the database.
    console.log("Uploading avatar:", file.name);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return { success: true, message: "Avatar uploaded successfully" };
  } catch {
    return { error: { form: "Failed to upload avatar." } };
  }
}
