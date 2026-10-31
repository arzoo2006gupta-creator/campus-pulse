import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  CalendarPlus,
} from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/actions/profile";
import { getUserBookmarkedIds } from "@/lib/actions/bookmarks";
import { Header } from "@/components/navigation/header";
import { Badge, getCategoryBadgeVariant } from "@/components/ui/badge";
import { BookmarkButton } from "@/components/bookmark-button";
import { formatDate, formatDateTime, formatTime } from "@/lib/utils";
import { Event } from "@/lib/types/database";

interface PageProps {
  params: { id: string };
}

export const revalidate = 0;

export default async function EventDetailPage({ params }: PageProps) {
  const profile = await getCurrentProfile();
  const configured = isSupabaseConfigured();

  if (!configured) {
    notFound();
  }

  const supabase = createClient();
  const [eventRes, bookmarksData] = await Promise.all([
    supabase
      .from("events")
      .select("*")
      .eq("id", params.id)
      .eq("is_published", true)
      .maybeSingle(),
    getUserBookmarkedIds(),
  ]);

  const event = eventRes.data as Event | null;

  if (!event) {
    notFound();
  }

  const isBookmarked = bookmarksData.eventIds.has(event.id);

  return (
    <div className="min-h-full pb-16">
      <Header
        profile={profile}
        title="Event Details"
        description="Comprehensive information on campus activities, schedules, and venues."
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Back navigation */}
        <Link
          href="/events"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Events</span>
        </Link>

        {/* Event Card */}
        <article className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Optional Event Banner Image */}
          {event.image_url && (
            <div className="relative w-full h-64 sm:h-80 bg-slate-100">
              <img
                src={event.image_url}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-6 sm:p-8 space-y-6">
            {/* Header: Category & Bookmark */}
            <div className="flex items-center justify-between gap-4">
              <Badge variant={getCategoryBadgeVariant(event.category)}>
                {event.category}
              </Badge>

              <BookmarkButton
                itemId={event.id}
                itemType="event"
                initialIsBookmarked={isBookmarked}
              />
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-snug">
              {event.title}
            </h1>

            {/* Key Event Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Date & Time
                  </span>
                  <span className="text-xs sm:text-sm font-medium text-slate-800">
                    {formatDate(event.start_time)}
                  </span>
                  <p className="text-xs text-slate-500">
                    {formatTime(event.start_time)} – {formatTime(event.end_time)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Venue
                  </span>
                  <span className="text-xs sm:text-sm font-medium text-slate-800">
                    {event.venue}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 sm:col-span-2">
                <div className="p-2 rounded-lg bg-purple-100 text-purple-700">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Organizer
                  </span>
                  <span className="text-xs sm:text-sm font-medium text-slate-800">
                    {event.organizer}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                About this Event
              </h3>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-wrap">
                {event.description}
              </p>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
