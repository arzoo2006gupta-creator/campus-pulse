import React from "react";
import { getCurrentProfile } from "@/lib/actions/profile";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { Header } from "@/components/navigation/header";
import { ProfileForm } from "./profile-form";
import { EmptyState } from "@/components/empty-state";
import { User } from "lucide-react";

export const revalidate = 0;

export default async function ProfilePage() {
  const profile = await getCurrentProfile();
  const configured = isSupabaseConfigured();

  return (
    <div className="min-h-full pb-16">
      <Header
        profile={profile}
        title="Student Profile & Settings"
        description="Manage your campus directory details, academic department, and notification preferences."
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {profile ? (
          <ProfileForm profile={profile} />
        ) : (
          <EmptyState
            icon={User}
            title={configured ? "Please sign in" : "Supabase Not Connected"}
            description={
              configured
                ? "You must be signed in to manage your profile and preferences."
                : "Please configure Supabase environment variables in .env.local to enable student authentication."
            }
            actionHref="/login"
            actionLabel="Go to Sign In"
          />
        )}
      </div>
    </div>
  );
}
