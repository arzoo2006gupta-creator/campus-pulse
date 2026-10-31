"use server";

import { revalidatePath } from "next/cache";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { updateProfileSchema } from "@/lib/validations/schemas";
import { Profile } from "@/lib/types/database";

export interface ProfileActionResult {
  success: boolean;
  error?: string;
  profile?: Profile;
}

export async function getCurrentUser() {
  if (!isSupabaseConfigured()) {
    return null;
  }
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentProfile(): Promise<Profile | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return profile as Profile | null;
}

export async function updateProfileAction(
  payload: unknown
): Promise<ProfileActionResult> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error: "Supabase credentials are not configured.",
    };
  }

  const validated = updateProfileSchema.safeParse(payload);
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.errors[0]?.message || "Invalid profile data",
    };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: "You must be signed in to update your profile",
    };
  }

  // Explicitly sanitize update payload to prevent ANY role escalation
  const updateData = {
    full_name: validated.data.full_name,
    department: validated.data.department,
    year: validated.data.year,
    avatar_url: validated.data.avatar_url || null,
    notification_preferences: validated.data.notification_preferences,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", user.id)
    .select()
    .single();

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  revalidatePath("/", "layout");
  return {
    success: true,
    profile: data as Profile,
  };
}
