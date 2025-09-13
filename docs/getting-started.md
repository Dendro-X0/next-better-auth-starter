# Getting Started

Follow these steps to set up and run the project locally.

## Prerequisites

- Node.js v18 or later
- pnpm
- A PostgreSQL database

## 1) Clone the repository

```bash
git clone https://github.com/Dendro-X0/next-better-auth-starter.git
cd next-better-auth-starter
```

## 2) Install dependencies

```bash
pnpm install
```

## 3) Set up environment variables

Create a `.env` file from the example and fill in required values:

```bash
cp .env.example .env
```

See `docs/configuration.md` for a full list and guidance.

## 4) Apply database migrations

```bash
pnpm db:migrate
```

For rapid prototyping (alternative):

```bash
pnpm db:push
```

## 5) Run the development server

```bash
pnpm dev
```

Open http://localhost:3000 in your browser.

## Resend Verification Email

If a user didn’t receive the initial verification email or it expired, you can resend the verification link.

This starter kit ships with Better Auth configured to help recover automatically:

- `emailVerification.sendOnSignIn = true` automatically resends a verification email if a user signs in while unverified.
- `emailVerification.autoSignInAfterVerification = true` signs the user in immediately after verification.

You can also provide a dedicated “Resend verification” form on the login page. A minimal server action looks like this:

```ts
"use server";
import { auth } from "@/lib/auth/auth";

export async function resendVerification(_: unknown, formData: FormData) {
  const email = String(formData.get("resend_email") ?? "").trim();
  if (!email) return { error: "Please enter an email." } as const;
  await auth.api.sendVerificationEmail({ body: { email, callbackURL: "/" } });
  return { success: "Verification email sent." } as const;
}
```

See `src/actions/resend-verification.ts` and `src/components/auth/resend-verification-form.tsx` in this repo for a full implementation.
