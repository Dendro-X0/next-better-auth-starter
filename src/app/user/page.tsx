import { Suspense } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileForm } from "@/components/user/profile-form"
import { PasswordForm } from "@/components/user/password-form"
import { TwoFactorSettings } from "@/components/user/two-factor-settings"
import { NotificationSettings } from "@/components/user/notification-settings"
import { TrustedDevices } from "@/components/user/trusted-devices"
import { getUserProfile, getUserSettings } from "@/actions/user"
import { Skeleton } from "@/components/ui/skeleton"
import { User, Settings } from "lucide-react"

async function UserContent({ searchParamsPromise }: { searchParamsPromise: Promise<{ hasPassword?: string }> }) {
  const [profileResult, settingsResult] = await Promise.all([getUserProfile(), getUserSettings()]);

  if ("error" in profileResult || "error" in settingsResult) {
    return <div>Error loading user data. Please try again later.</div>;
  }

  // Resolve the searchParams promise to get the hasPassword value
  const searchParams = await searchParamsPromise;
  const hasPassword = searchParams.hasPassword ? searchParams.hasPassword === "true" : settingsResult.settings.hasPassword;

  return (
    <Tabs defaultValue="profile" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="profile" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          Profile
        </TabsTrigger>
        <TabsTrigger value="settings" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Settings
        </TabsTrigger>
      </TabsList>

      <TabsContent value="profile" className="space-y-6">
        <ProfileForm profile={profileResult.profile} />
      </TabsContent>

      <TabsContent value="settings" className="space-y-6">
        <PasswordForm hasPassword={hasPassword} />
        <TwoFactorSettings
          isEnabled={settingsResult.settings.twoFactorEnabled}
          backupCodes={settingsResult.settings.backupCodes}
        />
        <NotificationSettings settings={settingsResult.settings.notifications} />
        <TrustedDevices devices={settingsResult.settings.trustedDevices} />
      </TabsContent>
    </Tabs>
  );
}

function UserSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex space-x-1">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  )
}

export default function UserPage({ searchParams }: { searchParams: Promise<{ hasPassword?: string }> }) {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Account Dashboard</h1>
        <p className="text-muted-foreground">Manage your profile and account settings</p>
      </div>

      <Suspense fallback={<UserSkeleton />}>
        <UserContent searchParamsPromise={searchParams} />
      </Suspense>
    </div>
  )
}
