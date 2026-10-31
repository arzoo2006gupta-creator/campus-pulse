"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BookmarkCheck,
  Megaphone,
  CalendarDays,
  Clock,
  MapPin,
  Calendar,
  LogIn,
} from "lucide-react";
import { Announcement, Event, Profile } from "@/lib/types/database";
import { Badge, getCategoryBadgeVariant } from "@/components/ui/badge";
import { BookmarkButton } from "@/components/bookmark-button";
import { EmptyState } from "@/components/empty-state";
import { formatDate, formatTime } from "@/lib/utils";

interface BookmarksViewProps {
  profile: Profile | null;
  isConfigured: boolean;
  initialAnnouncements: Announcement[];
  initialEvents: Event[];
}

export function BookmarksView({
  profile,
  isConfigured,
  initialAnnouncements,
  initialEvents,
}: BookmarksViewProps) {
  const [activeTab, setActiveTab] = useState<"all" | "announcements" | "events">(
    "all"
  );

  if (!profile) {
    return (
      <EmptyState
        icon={LogIn}
        title="Sign in to view your bookmarks"
        description="Bookmarks are synchronized to your student profile across all devices. Please sign in or register to save items."
        actionHref="/login"
        actionLabel="Sign In"
      />
    );
  }

  const hasAnnouncements = initialAnnouncements.length > 0;
  const hasEvents = initialEvents.length > 0;
  const hasAny = hasAnnouncements || hasEvents;

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === "all"
              ? "bg-blue-600 text-white"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          All ({initialAnnouncements.length + initialEvents.length})
        </button>
        <button
          onClick={() => setActiveTab("announcements")}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === "announcements"
              ? "bg-blue-600 text-white"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          Announcements ({initialAnnouncements.length})
        </button>
        <button
          onClick={() => setActiveTab("events")}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === "events"
              ? "bg-blue-600 text-white"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          Events ({initialEvents.length})
        </button>
      </div>

      {!hasAny ? (
        <EmptyState
          icon={BookmarkCheck}
          title="No bookmarks yet"
          description="Browse campus announcements or events and click the bookmark icon to save them here for quick access."
          actionHref="/announcements"
          actionLabel="Browse Announcements"
        />
      ) : (
        <div className="space-y-8">
          {/* ANNOUNCEMENTS SECTION */}
          {(activeTab === "all" || activeTab === "announcements") &&
            hasAnnouncements && (
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                    Saved Announcements ({initialAnnouncements.length})
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {initialAnnouncements.map((item) => (
                    <article
                      key={item.id}
                      className="flex flex-col justify-between bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <Badge variant={getCategoryBadgeVariant(item.category)}>
                            {item.category}
                          </Badge>
                          <BookmarkButton
                            itemId={item.id}
                            itemType="announcement"
                            initialIsBookmarked={true}
                            size="sm"
                          />
                        </div>

                        <Link href={`/announcements/${item.id}`}>
                          <h4 className="text-base font-semibold text-slate-900 hover:text-blue-600 transition-colors line-clamp-2">
                            {item.title}
                          </h4>
                          <p className="mt-2 text-xs text-slate-600 line-clamp-3">
                            {item.content}
                          </p>
                        </Link>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-400 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatDate(item.publish_date)}</span>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}

          {/* EVENTS SECTION */}
          {(activeTab === "all" || activeTab === "events") && hasEvents && (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                  Saved Events ({initialEvents.length})
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {initialEvents.map((evt) => (
                  <article
                    key={evt.id}
                    className="flex flex-col justify-between bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <Badge variant={getCategoryBadgeVariant(evt.category)}>
                          {evt.category}
                        </Badge>
                        <BookmarkButton
                          itemId={evt.id}
                          itemType="event"
                          initialIsBookmarked={true}
                          size="sm"
                        />
                      </div>

                      <Link href={`/events/${evt.id}`}>
                        <h4 className="text-base font-semibold text-slate-900 hover:text-blue-600 transition-colors line-clamp-2">
                          {evt.title}
                        </h4>
                        <p className="mt-2 text-xs text-slate-600 line-clamp-2">
                          {evt.description}
                        </p>
                      </Link>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-1 text-xs text-slate-500">
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
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
