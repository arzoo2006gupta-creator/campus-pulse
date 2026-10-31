import React from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/actions/profile";
import { getUserBookmarkedIds } from "@/lib/actions/bookmarks";
import { Header } from "@/components/navigation/header";
import { Announcement } from "@/lib/types/database";
import { AnnouncementsView } from "./announcements-view";

export const revalidate = 0;

export default async function AnnouncementsPage() {
  const profile = await getCurrentProfile();
  const configured = isSupabaseConfigured();

  let announcements: Announcement[] = [];
  let bookmarkedIds = new Set<string>();

  if (configured) {
    const supabase = createClient();
    const [announcementsRes, bookmarksData] = await Promise.all([
      supabase
        .from("announcements")
        .select("*, author:profiles(full_name, department, avatar_url)")
        .eq("is_published", true)
        .order("publish_date", { ascending: false }),
      getUserBookmarkedIds(),
    ]);

    if (announcementsRes.data) {
      announcements = announcementsRes.data as Announcement[];
    }
    bookmarkedIds = bookmarksData.announcementIds;
  }

  return (
    <div className="min-h-full pb-12">
      <Header
        profile={profile}
        title="Announcements"
        description="Official campus news, academic deadlines, departmental notices, and student updates."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <AnnouncementsView
          initialAnnouncements={announcements}
          bookmarkedIds={Array.from(bookmarkedIds)}
          isConfigured={configured}
        />
      </div>
    </div>
  );
}
