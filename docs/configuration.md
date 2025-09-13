# Configuration

Configure these environment variables in your `.env` file.

```env
# Better Auth Secret (generate with: openssl rand -base64 32)
BETTER_AUTH_SECRET="your_super_secret_string"

# Database
DATABASE_URL="postgresql://user:password@host:port/db"

# Public URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Email Provider (Resend)
RESEND_API_KEY="your_resend_api_key"
EMAIL_FROM="you@example.com"

# Google OAuth
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"

# GitHub OAuth
GITHUB_CLIENT_ID="your_github_client_id"
GITHUB_CLIENT_SECRET="your_github_client_secret"

# Upstash Redis (optional, for distributed rate limiting)
UPSTASH_REDIS_URL="https://your-upstash-redis-url"
UPSTASH_REDIS_TOKEN="your-upstash-redis-rest-token"
```

Notes
- `EMAIL_FROM` can be omitted in local development if your provider supports a default sender.
- Upstash variables are optional; when unset, rate limiting is disabled locally.
- Make sure `NEXT_PUBLIC_APP_URL` matches your deployed URL in production (HTTPS recommended).

## Email Provider

Set the email provider using `MAIL_PROVIDER`. Valid values are uppercase: `RESEND` or `SMTP`.

```env
# Choose one provider
MAIL_PROVIDER=RESEND
# or
MAIL_PROVIDER=SMTP

# When using RESEND
RESEND_API_KEY="your_resend_api_key"
EMAIL_FROM="you@example.com" # use a verified sender in production

# When using SMTP (e.g., MailHog for local dev)
SMTP_HOST="localhost"
SMTP_PORT="1025"
SMTP_SECURE="false" # true for 465, false for most dev servers
SMTP_USER=""        # optional
SMTP_PASS=""        # optional
```

Tip: For development, MailHog is very convenient:

- Start MailHog locally and open its UI at http://localhost:8025
- Configure `MAIL_PROVIDER=SMTP` with the settings above

Important: Keep `NEXT_PUBLIC_APP_URL` aligned with the port you are using (e.g., `http://localhost:3000`). This ensures verification links, cookies, and redirects work on the same origin.
