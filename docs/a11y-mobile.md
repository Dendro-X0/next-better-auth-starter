# Mobile & Accessibility (A11y)

This starter ships with A11y and mobile-friendly defaults:

- Skip to content: A visually hidden skip link is injected in `src/app/layout.tsx`. The main content uses `<main id="main-content" tabIndex={-1}>` for quick keyboard access.
- Landmarks & nav: `src/components/layout/header.tsx` wraps controls in a `<nav aria-label="Primary">` and labels the home link for assistive tech.
- Forms:
  - Inputs use `autoComplete`/`inputMode` hints (e.g., `email`, `current-password`, `new-password`, `username`, `one-time-code`, `numeric`).
  - Field-level messages appear near their inputs via `FieldMessage`; top-level outcomes are shown with `FormMessage`.
- 2FA input UX: Verification code uses `inputMode="numeric"` and `autoComplete="one-time-code"` for OTP auto-fill on supported devices.
- Focus visibility: All interactive components include visible `:focus-visible` styles from Tailwind/shadcn tokens.
- Mobile viewport: `export const viewport` is declared in `src/app/layout.tsx` for correct device scaling.

When adding new pages or forms:

1. Ensure a unique main region exists for the skip link.
2. Add `autoComplete` and `inputMode` on inputs to improve mobile and accessibility.
3. Prefer buttons for actions and links for navigation; keep focus states obvious.
