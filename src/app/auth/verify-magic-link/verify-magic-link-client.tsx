"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, type JSX } from "react";
import { useActionState } from "react";
import { Loader2 } from "lucide-react";

import { verifyMagicLinkAction, type FormState } from "@/actions/verify-magic-link";
import { AuthCard } from "@/components/auth/auth-card";
import { FormMessage } from "@/components/auth/form-message";

/**
 * Client component that reads the token from the URL and submits the verification action.
 */
export default function VerifyMagicLinkClient(): JSX.Element {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const formRef = useRef<HTMLFormElement>(null);
  const submitted = useRef<boolean>(false);
  const [state, formAction, isPending] = useActionState(verifyMagicLinkAction, {} as FormState);
  useEffect(() => {
    if (token && !submitted.current) {
      submitted.current = true;
      formRef.current?.requestSubmit();
    }
  }, [token]);
  if (!token) {
    return (
      <AuthCard title="Invalid Link" description="This magic link is invalid or has expired.">
        <div className="text-center">
          <Link href="/auth/magic-link" className="text-sm text-primary hover:underline">
            Request a new link
          </Link>
        </div>
      </AuthCard>
    );
  }
  if (isPending || !submitted.current) {
    return (
      <AuthCard title="Verifying..." description="Please wait while we verify your magic link.">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <form ref={formRef} action={formAction} className="hidden">
          <input type="hidden" name="token" value={token} />
          <FormMessage state={state} />
          {isPending && (
            <div className="flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}
        </form>
      </AuthCard>
    );
  }
  return (
    <AuthCard title="Verification Failed" description="This magic link is invalid or has expired.">
      <FormMessage state={state} />
      <div className="mt-6 text-center">
        <Link href="/auth/magic-link" className="text-sm text-primary hover:underline">
          Request a new link
        </Link>
      </div>
    </AuthCard>
  );
}
