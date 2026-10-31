import React from "react";
import Link from "next/link";
import { getCurrentProfile } from "@/lib/actions/profile";
import { getUserSavedItems } from "@/lib/actions/bookmarks";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { Header } from "@/components/navigation/header";
import { BookmarksView } from "./bookmarks-view";

export const revalidate = 0;

export default async function BookmarksPage() {
  const profile = await getCurrentProfile();
  const configured = isSupabaseConfigured();

  let announcements: any[] = [];
  let events: any[] = [];

  if (configured && profile) {
    const saved = await getUserSavedItems();
    announcements = saved.announcements;
    events = saved.events;
  }

  return (
    <div className="min-h-full pb-12">
      <Header
        profile={profile}
        title="My Saved Bookmarks"
        description="Your personal collection of saved campus announcements and upcoming events."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <BookmarksView
          profile={profile}
          isConfigured={configured}
          initialAnnouncements={announcements}
          initialEvents={events}
        />
      </div>
    </div>
  );
}
