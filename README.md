# Next.js Better Auth Starterkit

![CI](https://github.com/your-username/next-better-auth-starter/actions/workflows/ci.yml/badge.svg)

This is a production-ready boilerplate for Next.js 15, featuring a robust authentication system powered by **Better Auth**. It includes everything you need to get started with a secure, modern web application, including email/password login, social providers, magic links, and two-factor authentication (2FA).
> Beta: This project is in active development. Interfaces and behavior may change. External contributions are temporarily closed.

## ✨ Features

- **Full-Stack Framework**: Built with the latest Next.js 15 App Router.
- **Modern Authentication**: Powered by [Better Auth](https://www.better-auth.com), providing a secure and flexible authentication foundation.
- **Complete Auth Flows**: 
  - Email & Password (with password strength indicator)
  - Social Login (Google & GitHub)
  - Passwordless Magic Links
  - Secure Password Reset
  - **Two-Factor Authentication (2FA)** with TOTP and Backup Codes
- **Database & ORM**: PostgreSQL with [Drizzle ORM](https://orm.drizzle.team) for type-safe database access.
- **UI & Styling**: Beautifully designed components from [Shadcn UI](https://ui.shadcn.com/) and styled with [Tailwind CSS](https://tailwindcss.com/).
- **Form Handling**: Robust and type-safe forms using Server Actions and `useActionState`.
- **Type Safety**: End-to-end type safety with TypeScript.
- **Environment Variables**: Zod-based validation for environment variables using T3 Env.

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18 or later)
- [pnpm](https://pnpm.io/)
- A [PostgreSQL](https://www.postgresql.org/) database

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/next-better-auth-starter.git
cd next-better-auth-starter
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up Environment Variables

Create a `.env` file by copying the example file:

```bash
cp .env.example .env
```

Now, fill in the required values in your `.env` file:

```env
# Better Auth Secret: A long, random string for signing tokens.
# Generate one with: openssl rand -base64 32
BETTER_AUTH_SECRET="your_super_secret_string"

# Database
DATABASE_URL="postgresql://user:password@host:port/db"

# Public URL of your application
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Email Provider (Resend)
# Get your key from https://resend.com
RESEND_API_KEY="your_resend_api_key"
EMAIL_FROM="you@example.com"

# Google OAuth Credentials
# Get them from https://console.cloud.google.com/
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"

# GitHub OAuth Credentials
# Get them from your GitHub developer settings
GITHUB_CLIENT_ID="your_github_client_id"
GITHUB_CLIENT_SECRET="your_github_client_secret"

# Upstash Redis for Distributed Rate Limiting
UPSTASH_REDIS_URL="https://your-upstash-redis-url"
UPSTASH_REDIS_TOKEN="your-upstash-redis-rest-token"
```

### 4. Apply Database Migrations

Apply the database schema (users, sessions, 2FA, profiles) using migrations:

```bash
pnpm db:migrate
```

For rapid local prototyping, you can alternatively sync schema without migrations:

```bash
pnpm db:push
```

### 5. Run the Development Server

```bash
pnpm dev
```

Your application should now be running at [http://localhost:3000](http://localhost:3000).

## 🔧 Authentication Configuration

### Social Providers (OAuth)

To enable Google and GitHub login, you must create OAuth applications and add the credentials to your `.env` file.

When creating your OAuth apps, use the following callback URL:

`http://localhost:3000/api/auth/callback/[provider]`

Replace `[provider]` with `google` or `github`.

### Two-Factor Authentication (2FA)

2FA is enabled by default. Users can set it up from their profile page after signing up. The flow supports both standard TOTP authenticator apps (like Google Authenticator) and backup codes.

## 🚀 Deployment

### Vercel (Recommended)

Deploy with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/next-better-auth-starter&project-name=next-better-auth-starter&repository-name=next-better-auth-starter&env=BETTER_AUTH_SECRET,DATABASE_URL,NEXT_PUBLIC_APP_URL,RESEND_API_KEY,EMAIL_FROM,MAIL_PROVIDER,SMTP_HOST,SMTP_PORT,SMTP_SECURE,SMTP_USER,SMTP_PASS,GOOGLE_CLIENT_ID,GOOGLE_CLIENT_SECRET,GITHUB_CLIENT_ID,GITHUB_CLIENT_SECRET,UPSTASH_REDIS_URL,UPSTASH_REDIS_TOKEN)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard (listed above)
4. Deploy!

## 📂 Project Structure

```
.
├── src
│   ├── actions         # Server Actions for forms
│   ├── app             # Next.js App Router pages and layouts
│   ├── components      # Shared React components
│   ├── lib             # Core logic, utilities, and configurations
│   │   ├── auth        # Better Auth client/config
│   │   ├── db          # Drizzle ORM schema and client
│   │   ├── security    # Rate limiting, IP utilities
│   │   ├── services    # External integrations (e.g., email)
│   │   ├── types       # Type definitions
│   │   ├── ui          # Toast utilities
│   │   ├── utils       # Utility functions
│   │   └── validations # Zod validation schemas
│   └── ...
├── drizzle           # Drizzle ORM migration files
├── env.ts            # Environment variable validation
└── ...
```

## 🛡️ Distributed Rate Limiting

This starter includes distributed rate limiting for critical authentication actions using Upstash Redis. The following actions are protected by sliding window limits: signup, login, forgot password, magic link sending, 2FA verification, and reset password.

### Configuration

1) Create an Upstash Redis database and obtain your REST URL and Token.
2) Add the following variables to your `.env` file:

```env
UPSTASH_REDIS_URL="https://your-upstash-redis-url"
UPSTASH_REDIS_TOKEN="your-upstash-redis-rest-token"
```

If these are not set (e.g., during local development), rate limiting is safely disabled (no-op) so you can continue working without an Upstash account.

### Implementation

- Rate limiter utility lives under `src/lib/security/rate-limit.ts` (re-export).
- Client IP extraction is under `src/lib/security/ip.ts`.
- Server actions call the limiter using a composite key (action + identifier + IP) to reduce abuse and enumeration risk.

Example usage inside a server action:

```ts
import { headers } from "next/headers";
import { rateLimit, getClientIp } from "@/lib/security";

const h = await headers();
const ip = getClientIp(h);
const rl = await rateLimit({ action: "login", identifier: email, ip });
if (!rl.ok) {
  return { error: { message: "Too many attempts. Please try again later." } };
}
```

## 📄 License

This project is licensed under the MIT License.

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Forms**: React Server Actions
- **Icons**: Lucide React

## Additional Notes

- See `.env.example` for all required environment variables (OAuth, email provider, database).
- Distributed rate limiting via Upstash is optional; when `UPSTASH_REDIS_*` are unset, it is disabled locally.
- This is a beta release; APIs and flows may change before public release.
