"use client"

import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuthCard } from "@/components/auth/auth-card";
import { SubmitButton } from "@/components/auth/submit-button";
import { FormMessage } from "@/components/auth/form-message";
import { FieldMessage } from "@/components/auth/field-message";
import { verifyTwoFactorAction, type FormState } from "@/actions/verify-2fa";
import { useActionState } from "react";

export default function Verify2FAPage() {
  const initialState: FormState = {};
  const [state, formAction] = useActionState(verifyTwoFactorAction, initialState);

  return (
    <AuthCard
      title="Two-factor authentication"
      description="Enter your verification code to complete sign in"
    >
      <form action={formAction} className="space-y-4">
        <FormMessage state={state} />
        <Tabs defaultValue="totp" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="totp">Authenticator</TabsTrigger>
            <TabsTrigger value="backup">Backup Code</TabsTrigger>
          </TabsList>

          <TabsContent value="totp" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                name="code"
                type="text"
                placeholder="Enter 6-digit code"
                maxLength={6}
                className="text-center text-lg tracking-widest"
              />
              <FieldMessage messages={state.error?.fields?.code} />
              <p className="text-xs text-muted-foreground">
                Enter the 6-digit code from your authenticator app
              </p>
            </div>
          </TabsContent>

          <TabsContent value="backup" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="backupCode">Backup Code</Label>
              <Input id="backupCode" name="backupCode" type="text" placeholder="Enter backup code" />
              <FieldMessage messages={state.error?.fields?.backupCode} />
              <p className="text-xs text-muted-foreground">
                Enter one of your backup codes
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex items-center space-x-2">
          <Checkbox id="rememberDevice" name="rememberDevice" />
          <Label htmlFor="rememberDevice" className="text-sm">
            Trust this device for 30 days
          </Label>
        </div>
        <SubmitButton className="w-full">Verify</SubmitButton>
      </form>

      <div className="mt-6 text-center">
        <Link href="/auth/login" className="text-sm text-primary hover:underline">
          Back to sign in
        </Link>
      </div>
    </AuthCard>
  );
}
