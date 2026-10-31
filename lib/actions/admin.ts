"use server";

import { revalidatePath } from "next/cache";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import {
  announcementSchema,
  eventSchema,
  academicCalendarSchema,
  resourceSchema,
  clubSchema,
} from "@/lib/validations/schemas";
import { ActionResult } from "./auth";

async function verifyAdmin(): Promise<{ authorized: boolean; userId?: string; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { authorized: false, error: "Supabase credentials are not configured." };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { authorized: false, error: "Authentication required." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return { authorized: false, error: "Unauthorized: Administrator privileges required." };
  }

  return { authorized: true, userId: user.id };
}

// ================= ANNOUNCEMENTS CRUD =================
export async function createAnnouncementAction(payload: unknown): Promise<ActionResult> {
  const auth = await verifyAdmin();
  if (!auth.authorized) return { success: false, error: auth.error };

  const validated = announcementSchema.safeParse(payload);
  if (!validated.success) {
    return { success: false, error: validated.error.errors[0]?.message };
  }

  const supabase = createClient();
  const { error } = await supabase.from("announcements").insert({
    title: validated.data.title,
    content: validated.data.content,
    category: validated.data.category,
    is_published: validated.data.is_published,
    attachment_url: validated.data.attachment_url || null,
    attachment_name: validated.data.attachment_name || null,
    author_id: auth.userId,
    publish_date: new Date().toISOString(),
  });

  if (error) return { success: false, error: error.message };

  revalidatePath("/announcements");
  revalidatePath("/admin");
  revalidatePath("/");
  return { success: true };
}

export async function updateAnnouncementAction(
  id: string,
  payload: unknown
): Promise<ActionResult> {
  const auth = await verifyAdmin();
  if (!auth.authorized) return { success: false, error: auth.error };

  const validated = announcementSchema.safeParse(payload);
  if (!validated.success) {
    return { success: false, error: validated.error.errors[0]?.message };
  }

  const supabase = createClient();
  const { error } = await supabase
    .from("announcements")
    .update({
      title: validated.data.title,
      content: validated.data.content,
      category: validated.data.category,
      is_published: validated.data.is_published,
      attachment_url: validated.data.attachment_url || null,
      attachment_name: validated.data.attachment_name || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/announcements");
  revalidatePath(`/announcements/${id}`);
  revalidatePath("/admin");
  revalidatePath("/");
  return { success: true };
}

export async function deleteAnnouncementAction(id: string): Promise<ActionResult> {
  const auth = await verifyAdmin();
  if (!auth.authorized) return { success: false, error: auth.error };

  const supabase = createClient();
  const { error } = await supabase.from("announcements").delete().eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/announcements");
  revalidatePath("/admin");
  revalidatePath("/");
  return { success: true };
}

// ================= EVENTS CRUD =================
export async function createEventAction(payload: unknown): Promise<ActionResult> {
  const auth = await verifyAdmin();
  if (!auth.authorized) return { success: false, error: auth.error };

  const validated = eventSchema.safeParse(payload);
  if (!validated.success) {
    return { success: false, error: validated.error.errors[0]?.message };
  }

  const supabase = createClient();
  const { error } = await supabase.from("events").insert({
    title: validated.data.title,
    description: validated.data.description,
    category: validated.data.category,
    start_time: new Date(validated.data.start_time).toISOString(),
    end_time: new Date(validated.data.end_time).toISOString(),
    venue: validated.data.venue,
    organizer: validated.data.organizer,
    image_url: validated.data.image_url || null,
    is_published: validated.data.is_published,
  });

  if (error) return { success: false, error: error.message };

  revalidatePath("/events");
  revalidatePath("/admin");
  revalidatePath("/");
  return { success: true };
}

export async function updateEventAction(id: string, payload: unknown): Promise<ActionResult> {
  const auth = await verifyAdmin();
  if (!auth.authorized) return { success: false, error: auth.error };

  const validated = eventSchema.safeParse(payload);
  if (!validated.success) {
    return { success: false, error: validated.error.errors[0]?.message };
  }

  const supabase = createClient();
  const { error } = await supabase
    .from("events")
    .update({
      title: validated.data.title,
      description: validated.data.description,
      category: validated.data.category,
      start_time: new Date(validated.data.start_time).toISOString(),
      end_time: new Date(validated.data.end_time).toISOString(),
      venue: validated.data.venue,
      organizer: validated.data.organizer,
      image_url: validated.data.image_url || null,
      is_published: validated.data.is_published,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/events");
  revalidatePath(`/events/${id}`);
  revalidatePath("/admin");
  revalidatePath("/");
  return { success: true };
}

export async function deleteEventAction(id: string): Promise<ActionResult> {
  const auth = await verifyAdmin();
  if (!auth.authorized) return { success: false, error: auth.error };

  const supabase = createClient();
  const { error } = await supabase.from("events").delete().eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/events");
  revalidatePath("/admin");
  revalidatePath("/");
  return { success: true };
}

// ================= CALENDAR CRUD =================
export async function createCalendarItemAction(payload: unknown): Promise<ActionResult> {
  const auth = await verifyAdmin();
  if (!auth.authorized) return { success: false, error: auth.error };

  const validated = academicCalendarSchema.safeParse(payload);
  if (!validated.success) {
    return { success: false, error: validated.error.errors[0]?.message };
  }

  const supabase = createClient();
  const { error } = await supabase.from("academic_calendar").insert({
    title: validated.data.title,
    description: validated.data.description || null,
    event_type: validated.data.event_type,
    start_date: validated.data.start_date,
    end_date: validated.data.end_date,
    is_published: validated.data.is_published,
  });

  if (error) return { success: false, error: error.message };

  revalidatePath("/calendar");
  revalidatePath("/admin");
  revalidatePath("/");
  return { success: true };
}

export async function updateCalendarItemAction(
  id: string,
  payload: unknown
): Promise<ActionResult> {
  const auth = await verifyAdmin();
  if (!auth.authorized) return { success: false, error: auth.error };

  const validated = academicCalendarSchema.safeParse(payload);
  if (!validated.success) {
    return { success: false, error: validated.error.errors[0]?.message };
  }

  const supabase = createClient();
  const { error } = await supabase
    .from("academic_calendar")
    .update({
      title: validated.data.title,
      description: validated.data.description || null,
      event_type: validated.data.event_type,
      start_date: validated.data.start_date,
      end_date: validated.data.end_date,
      is_published: validated.data.is_published,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/calendar");
  revalidatePath("/admin");
  revalidatePath("/");
  return { success: true };
}

export async function deleteCalendarItemAction(id: string): Promise<ActionResult> {
  const auth = await verifyAdmin();
  if (!auth.authorized) return { success: false, error: auth.error };

  const supabase = createClient();
  const { error } = await supabase.from("academic_calendar").delete().eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/calendar");
  revalidatePath("/admin");
  revalidatePath("/");
  return { success: true };
}

// ================= RESOURCES CRUD =================
export async function createResourceAction(payload: unknown): Promise<ActionResult> {
  const auth = await verifyAdmin();
  if (!auth.authorized) return { success: false, error: auth.error };

  const validated = resourceSchema.safeParse(payload);
  if (!validated.success) {
    return { success: false, error: validated.error.errors[0]?.message };
  }

  const supabase = createClient();
  const { error } = await supabase.from("resources").insert({
    title: validated.data.title,
    description: validated.data.description || null,
    category: validated.data.category,
    resource_type: validated.data.resource_type,
    link_url: validated.data.link_url || null,
    file_url: validated.data.file_url || null,
    file_name: validated.data.file_name || null,
    file_size_bytes: validated.data.file_size_bytes || null,
    is_published: validated.data.is_published,
  });

  if (error) return { success: false, error: error.message };

  revalidatePath("/resources");
  revalidatePath("/admin");
  revalidatePath("/");
  return { success: true };
}

export async function updateResourceAction(id: string, payload: unknown): Promise<ActionResult> {
  const auth = await verifyAdmin();
  if (!auth.authorized) return { success: false, error: auth.error };

  const validated = resourceSchema.safeParse(payload);
  if (!validated.success) {
    return { success: false, error: validated.error.errors[0]?.message };
  }

  const supabase = createClient();
  const { error } = await supabase
    .from("resources")
    .update({
      title: validated.data.title,
      description: validated.data.description || null,
      category: validated.data.category,
      resource_type: validated.data.resource_type,
      link_url: validated.data.link_url || null,
      file_url: validated.data.file_url || null,
      file_name: validated.data.file_name || null,
      file_size_bytes: validated.data.file_size_bytes || null,
      is_published: validated.data.is_published,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/resources");
  revalidatePath("/admin");
  revalidatePath("/");
  return { success: true };
}

export async function deleteResourceAction(id: string): Promise<ActionResult> {
  const auth = await verifyAdmin();
  if (!auth.authorized) return { success: false, error: auth.error };

  const supabase = createClient();
  const { error } = await supabase.from("resources").delete().eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/resources");
  revalidatePath("/admin");
  revalidatePath("/");
  return { success: true };
}

// ================= CLUBS CRUD =================
export async function createClubAction(payload: unknown): Promise<ActionResult> {
  const auth = await verifyAdmin();
  if (!auth.authorized) return { success: false, error: auth.error };

  const validated = clubSchema.safeParse(payload);
  if (!validated.success) {
    return { success: false, error: validated.error.errors[0]?.message };
  }

  const supabase = createClient();
  const { error } = await supabase.from("clubs").insert({
    name: validated.data.name,
    description: validated.data.description,
    category: validated.data.category,
    contact_email: validated.data.contact_email || null,
    website_url: validated.data.website_url || null,
    logo_url: validated.data.logo_url || null,
    meeting_info: validated.data.meeting_info || null,
    is_published: validated.data.is_published,
  });

  if (error) return { success: false, error: error.message };

  revalidatePath("/clubs");
  revalidatePath("/admin");
  revalidatePath("/");
  return { success: true };
}

export async function updateClubAction(id: string, payload: unknown): Promise<ActionResult> {
  const auth = await verifyAdmin();
  if (!auth.authorized) return { success: false, error: auth.error };

  const validated = clubSchema.safeParse(payload);
  if (!validated.success) {
    return { success: false, error: validated.error.errors[0]?.message };
  }

  const supabase = createClient();
  const { error } = await supabase
    .from("clubs")
    .update({
      name: validated.data.name,
      description: validated.data.description,
      category: validated.data.category,
      contact_email: validated.data.contact_email || null,
      website_url: validated.data.website_url || null,
      logo_url: validated.data.logo_url || null,
      meeting_info: validated.data.meeting_info || null,
      is_published: validated.data.is_published,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/clubs");
  revalidatePath("/admin");
  revalidatePath("/");
  return { success: true };
}

export async function deleteClubAction(id: string): Promise<ActionResult> {
  const auth = await verifyAdmin();
  if (!auth.authorized) return { success: false, error: auth.error };

  const supabase = createClient();
  const { error } = await supabase.from("clubs").delete().eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/clubs");
  revalidatePath("/admin");
  revalidatePath("/");
  return { success: true };
}

// ================= STORAGE ASSET UPLOAD =================
const PERMITTED_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
]);

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export async function uploadAssetAction(
  formData: FormData
): Promise<ActionResult<{ url: string; fileName: string; fileSize: number }>> {
  const auth = await verifyAdmin();
  if (!auth.authorized) return { success: false, error: auth.error };

  const file = formData.get("file") as File | null;
  if (!file) {
    return { success: false, error: "No file provided" };
  }

  if (!PERMITTED_MIME_TYPES.has(file.type)) {
    return {
      success: false,
      error: `File type "${file.type}" is not permitted. Permitted types: PDF, Word, PNG, JPEG, WEBP.`,
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      success: false,
      error: `File size exceeds the 10MB limit. (Current: ${(file.size / 1024 / 1024).toFixed(1)}MB)`,
    };
  }

  const supabase = createClient();
  const fileExt = file.name.split(".").pop();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const filePath = `uploads/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("campus-assets")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    return { success: false, error: uploadError.message };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("campus-assets").getPublicUrl(filePath);

  return {
    success: true,
    data: {
      url: publicUrl,
      fileName: sanitizedName,
      fileSize: file.size,
    },
  };
}
