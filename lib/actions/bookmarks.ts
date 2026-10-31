"use server";

import { revalidatePath } from "next/cache";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { Announcement, Event } from "@/lib/types/database";

export interface BookmarkActionResult {
  success: boolean;
  bookmarked?: boolean;
  error?: string;
}

export async function toggleAnnouncementBookmarkAction(
  announcementId: string
): Promise<BookmarkActionResult> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error: "Database is not connected. Configure Supabase to persist bookmarks.",
    };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: "Please sign in to bookmark announcements.",
    };
  }

  // Check if bookmark exists
  const { data: existing } = await supabase
    .from("announcement_bookmarks")
    .select("id")
    .eq("user_id", user.id)
    .eq("announcement_id", announcementId)
    .maybeSingle();

  if (existing) {
    // Delete bookmark
    const { error } = await supabase
      .from("announcement_bookmarks")
      .delete()
      .eq("id", existing.id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/announcements");
    revalidatePath(`/announcements/${announcementId}`);
    revalidatePath("/bookmarks");
    revalidatePath("/");
    return { success: true, bookmarked: false };
  } else {
    // Insert bookmark
    const { error } = await supabase.from("announcement_bookmarks").insert({
      user_id: user.id,
      announcement_id: announcementId,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/announcements");
    revalidatePath(`/announcements/${announcementId}`);
    revalidatePath("/bookmarks");
    revalidatePath("/");
    return { success: true, bookmarked: true };
  }
}

export async function toggleEventBookmarkAction(
  eventId: string
): Promise<BookmarkActionResult> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error: "Database is not connected. Configure Supabase to persist bookmarks.",
    };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: "Please sign in to bookmark events.",
    };
  }

  // Check if bookmark exists
  const { data: existing } = await supabase
    .from("event_bookmarks")
    .select("id")
    .eq("user_id", user.id)
    .eq("event_id", eventId)
    .maybeSingle();

  if (existing) {
    // Delete bookmark
    const { error } = await supabase
      .from("event_bookmarks")
      .delete()
      .eq("id", existing.id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/events");
    revalidatePath(`/events/${eventId}`);
    revalidatePath("/bookmarks");
    revalidatePath("/");
    return { success: true, bookmarked: false };
  } else {
    // Insert bookmark
    const { error } = await supabase.from("event_bookmarks").insert({
      user_id: user.id,
      event_id: eventId,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/events");
    revalidatePath(`/events/${eventId}`);
    revalidatePath("/bookmarks");
    revalidatePath("/");
    return { success: true, bookmarked: true };
  }
}

export async function getUserBookmarkedIds(): Promise<{
  announcementIds: Set<string>;
  eventIds: Set<string>;
}> {
  if (!isSupabaseConfigured()) {
    return { announcementIds: new Set(), eventIds: new Set() };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { announcementIds: new Set(), eventIds: new Set() };
  }

  const [announcementsRes, eventsRes] = await Promise.all([
    supabase
      .from("announcement_bookmarks")
      .select("announcement_id")
      .eq("user_id", user.id),
    supabase
      .from("event_bookmarks")
      .select("event_id")
      .eq("user_id", user.id),
  ]);

  const announcementIds = new Set(
    (announcementsRes.data || []).map((b) => b.announcement_id)
  );
  const eventIds = new Set(
    (eventsRes.data || []).map((b) => b.event_id)
  );

  return { announcementIds, eventIds };
}

export async function getUserSavedItems(): Promise<{
  announcements: Announcement[];
  events: Event[];
}> {
  if (!isSupabaseConfigured()) {
    return { announcements: [], events: [] };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { announcements: [], events: [] };
  }

  const [announcementsRes, eventsRes] = await Promise.all([
    supabase
      .from("announcement_bookmarks")
      .select("announcements (*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("event_bookmarks")
      .select("events (*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const announcements: Announcement[] = [];
  if (announcementsRes.data) {
    for (const item of announcementsRes.data) {
      if (item.announcements) {
        announcements.push({
          ...(item.announcements as unknown as Announcement),
          is_bookmarked: true,
        });
      }
    }
  }

  const events: Event[] = [];
  if (eventsRes.data) {
    for (const item of eventsRes.data) {
      if (item.events) {
        events.push({
          ...(item.events as unknown as Event),
          is_bookmarked: true,
        });
      }
    }
  }

  return { announcements, events };
}
