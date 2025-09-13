# Distributed Rate Limiting

This starter includes distributed rate limiting for critical authentication actions using Upstash Redis. The following actions are protected by sliding window limits: signup, login, forgot password, magic link sending, 2FA verification, and reset password.

## Configuration

1) Create an Upstash Redis database and obtain your REST URL and Token.
2) Add the following variables to your `.env` file:

```env
UPSTASH_REDIS_URL="https://your-upstash-redis-url"
UPSTASH_REDIS_TOKEN="your-upstash-redis-rest-token"
```

If these are not set (e.g., during local development), rate limiting is safely disabled (no-op).

## Implementation

- Limiter utilities are under `src/lib/security/`.
- Server actions call the limiter using a composite key (action + identifier + IP) to reduce abuse and enumeration risk.

### Example usage inside a server action

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
