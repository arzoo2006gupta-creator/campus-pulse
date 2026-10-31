import React from "react";
import Link from "next/link";
import {
  Megaphone,
  CalendarDays,
  GraduationCap,
  FolderDown,
  ArrowRight,
  MapPin,
  Clock,
  ExternalLink,
  FileText,
  AlertCircle,
  Database,
} from "lucide-react";
import { getCurrentProfile } from "@/lib/actions/profile";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { getUserBookmarkedIds } from "@/lib/actions/bookmarks";
import { Header } from "@/components/navigation/header";
import { Badge, getCategoryBadgeVariant } from "@/components/ui/badge";
import { BookmarkButton } from "@/components/bookmark-button";
import { EmptyState } from "@/components/empty-state";
import { formatDate, formatTime } from "@/lib/utils";
import {
  Announcement,
  Event,
  AcademicCalendarItem,
  Resource,
} from "@/lib/types/database";

export const revalidate = 0; // Fresh dashboard data on request

export default async function DashboardPage() {
  const profile = await getCurrentProfile();
  const configured = isSupabaseConfigured();

  let announcements: Announcement[] = [];
  let events: Event[] = [];
  let calendarItems: AcademicCalendarItem[] = [];
  let resources: Resource[] = [];
  let announcementBookmarks = new Set<string>();
  let eventBookmarks = new Set<string>();
  let dbError: string | null = null;

  if (configured) {
    const supabase = createClient();

    try {
      const [
        announcementsRes,
        eventsRes,
        calendarRes,
        resourcesRes,
        bookmarksData,
      ] = await Promise.all([
        supabase
          .from("announcements")
          .select("*")
          .eq("is_published", true)
          .order("publish_date", { ascending: false })
          .limit(4),
        supabase
          .from("events")
          .select("*")
          .eq("is_published", true)
          .order("start_time", { ascending: true })
          .limit(3),
        supabase
          .from("academic_calendar")
          .select("*")
          .eq("is_published", true)
          .gte("end_date", new Date().toISOString().split("T")[0])
          .order("start_date", { ascending: true })
          .limit(4),
        supabase
          .from("resources")
          .select("*")
          .eq("is_published", true)
          .limit(4),
        getUserBookmarkedIds(),
      ]);

      if (announcementsRes.data) announcements = announcementsRes.data as Announcement[];
      if (eventsRes.data) events = eventsRes.data as Event[];
      if (calendarRes.data) calendarItems = calendarRes.data as AcademicCalendarItem[];
      if (resourcesRes.data) resources = resourcesRes.data as Resource[];

      announcementBookmarks = bookmarksData.announcementIds;
      eventBookmarks = bookmarksData.eventIds;
    } catch (err: unknown) {
      dbError = err instanceof Error ? err.message : "Database connection issue";
    }
  }

  const studentName = profile?.full_name?.split(" ")[0] || (profile ? "Student" : "Guest");

  return (
    <div className="min-h-full pb-12">
      <Header
        profile={profile}
        title={`Welcome back, ${studentName}!`}
        description={
          profile?.department
            ? `${profile.department} ${profile.year ? `• ${profile.year}` : ""} — Here is what is happening across campus today.`
            : "Your central hub for campus announcements, events, academic schedules, and resources."
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8">
        {/* Setup Notification Banner if Supabase is not configured */}
        {!configured && (
          <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4 sm:p-5 text-blue-900 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Database className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-semibold">Supabase Credentials Not Detected</h4>
                <p className="text-xs text-blue-700 mt-0.5">
                  Connect your Supabase project in <code className="bg-blue-100 px-1.5 py-0.5 rounded text-blue-800">.env.local</code> to enable real-time authentication, database reads, bookmarks, and storage.
                </p>
              </div>
            </div>
            <Link
              href="/login"
              className="text-xs font-semibold px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              Setup Guide
            </Link>
          </div>
        )}

        {dbError && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>Database error: {dbError}</span>
          </div>
        )}

        {/* TOP ROW: RECENT ANNOUNCEMENTS (2 COLUMNS) & UPCOMING EVENTS (1 COLUMN) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* SECTION 1: RECENT ANNOUNCEMENTS */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                  <Megaphone className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-slate-900">Recent Announcements</h2>
              </div>
              <Link
                href="/announcements"
                className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 group"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            {announcements.length === 0 ? (
              <EmptyState
                icon={Megaphone}
                title="No announcements yet"
                description="Campus administration has not published any announcements at this time."
                actionHref="/announcements"
                actionLabel="Check announcements"
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {announcements.map((item) => (
                  <article
                    key={item.id}
                    className="flex flex-col justify-between bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md hover:border-slate-300 transition-all group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <Badge variant={getCategoryBadgeVariant(item.category)}>
                          {item.category}
                        </Badge>
                        <BookmarkButton
                          itemId={item.id}
                          itemType="announcement"
                          initialIsBookmarked={announcementBookmarks.has(item.id)}
                          size="sm"
                        />
                      </div>
                      <Link href={`/announcements/${item.id}`} className="block">
                        <h3 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                          {item.title}
                        </h3>
                        <p className="mt-1.5 text-xs text-slate-600 line-clamp-3 leading-relaxed">
                          {item.content}
                        </p>
                      </Link>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span>{formatDate(item.publish_date)}</span>
                      {item.attachment_url && (
                        <span className="flex items-center gap-1 text-blue-600 font-medium">
                          <FileText className="w-3 h-3" />
                          <span>Attachment</span>
                        </span>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 2: UPCOMING EVENTS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                  <CalendarDays className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-slate-900">Upcoming Events</h2>
              </div>
              <Link
                href="/events"
                className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 group"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            {events.length === 0 ? (
              <EmptyState
                icon={CalendarDays}
                title="No upcoming events"
                description="There are currently no upcoming campus events scheduled."
                actionHref="/events"
                actionLabel="Explore events"
              />
            ) : (
              <div className="space-y-3">
                {events.map((evt) => (
                  <div
                    key={evt.id}
                    className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md hover:border-slate-300 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <Badge variant={getCategoryBadgeVariant(evt.category)}>
                          {evt.category}
                        </Badge>
                        <Link href={`/events/${evt.id}`}>
                          <h3 className="text-sm font-semibold text-slate-900 mt-1 hover:text-blue-600 transition-colors">
                            {evt.title}
                          </h3>
                        </Link>
                      </div>
                      <BookmarkButton
                        itemId={evt.id}
                        itemType="event"
                        initialIsBookmarked={eventBookmarks.has(evt.id)}
                        size="sm"
                      />
                    </div>

                    <div className="mt-3 space-y-1 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {formatDate(evt.start_time)} • {formatTime(evt.start_time)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">{evt.venue}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM ROW: ACADEMIC CALENDAR & QUICK RESOURCES */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* SECTION 3: UPCOMING ACADEMIC DATES (2 COLUMNS) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-slate-900">Upcoming Academic Dates</h2>
              </div>
              <Link
                href="/calendar"
                className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 group"
              >
                <span>Full calendar</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            {calendarItems.length === 0 ? (
              <EmptyState
                icon={GraduationCap}
                title="No academic dates"
                description="No upcoming deadlines or examination dates currently registered."
                actionHref="/calendar"
                actionLabel="Open Calendar"
              />
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 shadow-sm overflow-hidden">
                {calendarItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-center flex-shrink-0">
                        <span className="text-[10px] font-bold uppercase text-blue-600">
                          {new Intl.DateTimeFormat("en-US", { month: "short" }).format(
                            new Date(item.start_date)
                          )}
                        </span>
                        <span className="text-sm font-bold text-slate-800 leading-none">
                          {new Date(item.start_date).getUTCDate()}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-slate-900">{item.title}</h4>
                          <Badge variant={getCategoryBadgeVariant(item.event_type)}>
                            {item.event_type}
                          </Badge>
                        </div>
                        {item.description && (
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-xs font-medium text-slate-600 sm:text-right flex-shrink-0">
                      <span>{formatDate(item.start_date)}</span>
                      {item.start_date !== item.end_date && (
                        <span> – {formatDate(item.end_date)}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 4: QUICK RESOURCES */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                  <FolderDown className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-slate-900">Quick Resources</h2>
              </div>
              <Link
                href="/resources"
                className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 group"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            {resources.length === 0 ? (
              <EmptyState
                icon={FolderDown}
                title="No resources found"
                description="Campus links and documents will appear here once added."
                actionHref="/resources"
                actionLabel="Explore library"
              />
            ) : (
              <div className="space-y-2.5">
                {resources.map((res) => {
                  const targetUrl = res.link_url || res.file_url || "#";
                  return (
                    <a
                      key={res.id}
                      href={targetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-sm transition-all group"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-slate-900 group-hover:text-blue-600 truncate">
                            {res.title}
                          </p>
                          <span className="text-[11px] text-slate-500">
                            {res.category} • {res.resource_type === "file" ? "File Download" : "External Portal"}
                          </span>
                        </div>
                        <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-600 flex-shrink-0" />
                      </div>
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
