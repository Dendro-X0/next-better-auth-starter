import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(1, {
    message: "Password is required.",
  }),
});

export const SignupSchema = z
  .object({
    name: z.string().min(3, {
      message: "Name must be at least 3 characters long.",
    }),
    email: z.string().email({
      message: "Please enter a valid email address.",
    }),
    password: z.string().min(8, {
      message: "Password must be at least 8 characters long.",
    }),
    confirmPassword: z.string(),
    // Accept HTML form checkbox values ("on") as true, or boolean true.
    // Using union+transform avoids z.coerce.boolean() pitfalls with "on".
    agreeToTerms: z
      .union([z.literal("on"), z.boolean()])
      .transform((v) => (v === "on" ? true : v))
      .refine((val) => val === true, {
      message: "You must agree to the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const ForgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address."),
});

export const ResetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters long."),
    confirmPassword: z.string(),
    token: z.string().min(1, "Reset token is required."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const setPasswordSchema = z
  .object({
    newPassword: z.string().min(8, "Password must be at least 8 characters long"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const MagicLinkSchema = z.object({
  email: z.string().email("Invalid email address."),
});

export const Verify2FASchema = z
  .object({
    code: z.string().trim().optional(),
    backupCode: z.string().trim().optional(),
    rememberDevice: z.string().optional(), // 'on' or undefined
  })
  .superRefine((data, ctx) => {
    const hasCode = data.code && data.code.length > 0;
    const hasBackupCode = data.backupCode && data.backupCode.length > 0;

    if (hasCode && hasBackupCode) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please provide either a verification code or a backup code, not both.",
        path: ["code"],
      });
    }

    if (!hasCode && !hasBackupCode) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Verification code is required.",
        path: ["code"],
      });
    }

    if (hasCode) {
      if (!/^\d{6}$/.test(data.code!)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Code must be a 6-digit number.",
          path: ["code"],
        });
      }
    }
  });

export const ProfileSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long."),
  username: z.string().min(3, "Username must be at least 3 characters long."),
  bio: z.string().max(160, "Bio must be less than 160 characters").optional(),
  location: z.string().optional(),
  website: z.string().url("Invalid URL").optional().or(z.literal('')),
});

export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters long"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"],
  });

export const NotificationSettingsSchema = z
  .object({
    email: z
      .object({
        security: z.coerce.boolean().default(false),
        marketing: z.coerce.boolean().default(false),
        updates: z.coerce.boolean().default(false),
      })
      .default({ security: false, marketing: false, updates: false }),
    push: z
      .object({
        security: z.coerce.boolean().default(false),
        mentions: z.coerce.boolean().default(false),
        updates: z.coerce.boolean().default(false),
      })
      .default({ security: false, mentions: false, updates: false }),
  })
  .default({
    email: { security: false, marketing: false, updates: false },
    push: { security: false, mentions: false, updates: false },
  });

export const PrivacySettingsSchema = z.object({
  profileVisibility: z.enum(["public", "private"]).default("public"),
  showEmail: z.coerce.boolean().default(false),
  showLocation: z.coerce.boolean().default(true),
});

