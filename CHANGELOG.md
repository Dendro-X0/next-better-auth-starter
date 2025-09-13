# Changelog

All notable changes to this project will be documented in this file.

## 2025-09-12

### Added
- Auth UX: Enabled `emailVerification.sendOnSignIn` and `emailVerification.autoSignInAfterVerification` in `src/lib/auth/auth.ts` to recover from missed/failed first emails and improve post-verification flow.
- Feature: Implemented a "Resend verification" flow.
  - Server action: `src/actions/resend-verification.ts` (rate-limited; neutral responses to avoid user enumeration).
  - UI: `src/components/auth/resend-verification-form.tsx` mounted on `src/app/auth/login/page.tsx` under social logins.
- Docs: Updated `docs/getting-started.md` with a "Resend Verification Email" section and linked example.
- Docs: Expanded `docs/configuration.md` with provider casing and SMTP setup guidance; emphasized `NEXT_PUBLIC_APP_URL` alignment.

### Notes
- Email provider casing is uppercase in this starter kit: `MAIL_PROVIDER=RESEND | SMTP`.
- For development, SMTP with MailHog is recommended; for production, Resend or a production SMTP provider with a verified `EMAIL_FROM`.
