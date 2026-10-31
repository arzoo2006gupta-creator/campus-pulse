"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { signInSchema, signUpSchema, resetPasswordSchema, updatePasswordSchema } from "@/lib/validations/schemas";

export interface ActionResult<T = unknown> {
  success: boolean;
  error?: string;
  data?: T;
}

export async function signInAction(formData: FormData): Promise<ActionResult> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error: "Supabase credentials are not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local",
    };
  }

  const rawData = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const validated = signInSchema.safeParse(rawData);
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.errors[0]?.message || "Invalid credentials",
    };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: validated.data.email,
    password: validated.data.password,
  });

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function signUpAction(
  formData: FormData
): Promise<ActionResult<{ needsEmailConfirmation: boolean }>> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error: "Supabase credentials are not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local",
    };
  }

  const rawData = {
    email: formData.get("email"),
    password: formData.get("password"),
    fullName: formData.get("fullName"),
    department: formData.get("department"),
    year: formData.get("year"),
  };

  const validated = signUpSchema.safeParse(rawData);
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.errors[0]?.message || "Invalid registration data",
    };
  }

  const supabase = createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const { data, error } = await supabase.auth.signUp({
    email: validated.data.email,
    password: validated.data.password,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback`,
      data: {
        full_name: validated.data.fullName,
        department: validated.data.department,
        year: validated.data.year,
        role: "student", // Always student on signup
      },
    },
  });

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  // Ensure profile row exists
  if (data.user) {
    await supabase.from("profiles").upsert(
      {
        id: data.user.id,
        full_name: validated.data.fullName,
        department: validated.data.department,
        year: validated.data.year,
        role: "student",
      },
      { onConflict: "id" }
    );
  }

  revalidatePath("/", "layout");
  return {
    success: true,
    data: {
      needsEmailConfirmation: !data.session,
    },
  };
}

export async function signOutAction(): Promise<void> {
  if (isSupabaseConfigured()) {
    const supabase = createClient();
    await supabase.auth.signOut();
  }
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function resetPasswordAction(formData: FormData): Promise<ActionResult> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error: "Supabase credentials are not configured.",
    };
  }

  const rawData = {
    email: formData.get("email"),
  };

  const validated = resetPasswordSchema.safeParse(rawData);
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.errors[0]?.message || "Invalid email",
    };
  }

  const supabase = createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const { error } = await supabase.auth.resetPasswordForEmail(validated.data.email, {
    redirectTo: `${siteUrl}/update-password`,
  });

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return { success: true };
}

export async function updatePasswordAction(formData: FormData): Promise<ActionResult> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error: "Supabase credentials are not configured.",
    };
  }

  const rawData = {
    password: formData.get("password"),
  };

  const validated = updatePasswordSchema.safeParse(rawData);
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.errors[0]?.message || "Invalid password",
    };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({
    password: validated.data.password,
  });

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return { success: true };
}
