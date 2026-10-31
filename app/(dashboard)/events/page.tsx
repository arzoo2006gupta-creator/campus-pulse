import React from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/actions/profile";
import { getUserBookmarkedIds } from "@/lib/actions/bookmarks";
import { Header } from "@/components/navigation/header";
import { Event } from "@/lib/types/database";
import { EventsView } from "./events-view";

export const revalidate = 0;

export default async function EventsPage() {
  const profile = await getCurrentProfile();
  const configured = isSupabaseConfigured();

  let events: Event[] = [];
  let bookmarkedIds = new Set<string>();

  if (configured) {
    const supabase = createClient();
    const [eventsRes, bookmarksData] = await Promise.all([
      supabase
        .from("events")
        .select("*")
        .eq("is_published", true)
        .order("start_time", { ascending: true }),
      getUserBookmarkedIds(),
    ]);

    if (eventsRes.data) {
      events = eventsRes.data as Event[];
    }
    bookmarkedIds = bookmarksData.eventIds;
  }

  return (
    <div className="min-h-full pb-12">
      <Header
        profile={profile}
        title="Events & Campus Activities"
        description="Discover workshops, guest lectures, career fairs, sports tournaments, and student life activities."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <EventsView
          initialEvents={events}
          bookmarkedIds={Array.from(bookmarkedIds)}
          isConfigured={configured}
        />
      </div>
    </div>
  );
}
