"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Clock,
  MapPin,
  Users,
  Image as ImageIcon,
} from "lucide-react";
import { Event } from "@/lib/types/database";
import { SearchFilterBar } from "@/components/search-filter-bar";
import { Badge, getCategoryBadgeVariant } from "@/components/ui/badge";
import { BookmarkButton } from "@/components/bookmark-button";
import { EmptyState } from "@/components/empty-state";
import { formatDate, formatTime } from "@/lib/utils";

const CATEGORIES = [
  "General",
  "Academic",
  "Workshop",
  "Cultural",
  "Sports",
  "Career",
];

interface EventsViewProps {
  initialEvents: Event[];
  bookmarkedIds: string[];
  isConfigured: boolean;
}

export function EventsView({
  initialEvents,
  bookmarkedIds,
  isConfigured,
}: EventsViewProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [timeView, setTimeView] = useState<"upcoming" | "past">("upcoming");

  const bookmarkedSet = useMemo(() => new Set(bookmarkedIds), [bookmarkedIds]);
  const now = new Date().getTime();

  const filteredEvents = useMemo(() => {
    return initialEvents.filter((evt) => {
      const eventEndTime = new Date(evt.end_time).getTime();
      const isUpcoming = eventEndTime >= now;

      // Filter by upcoming vs past
      if (timeView === "upcoming" && !isUpcoming) return false;
      if (timeView === "past" && isUpcoming) return false;

      // Filter by category
      if (selectedCategory !== "All" && evt.category !== selectedCategory)
        return false;

      // Filter by search
      if (search) {
        const query = search.toLowerCase();
        const matchesTitle = evt.title.toLowerCase().includes(query);
        const matchesDesc = evt.description.toLowerCase().includes(query);
        const matchesVenue = evt.venue.toLowerCase().includes(query);
        const matchesOrganizer = evt.organizer.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesVenue && !matchesOrganizer)
          return false;
      }

      return true;
    });
  }, [initialEvents, search, selectedCategory, timeView, now]);

  const extraFilter = (
    <div className="flex items-center rounded-lg bg-slate-100 p-0.5 border border-slate-200">
      <button
        onClick={() => setTimeView("upcoming")}
        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
          timeView === "upcoming"
            ? "bg-white text-blue-600 shadow-sm"
            : "text-slate-600 hover:text-slate-900"
        }`}
      >
        Upcoming
      </button>
      <button
        onClick={() => setTimeView("past")}
        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
          timeView === "past"
            ? "bg-white text-blue-600 shadow-sm"
            : "text-slate-600 hover:text-slate-900"
        }`}
      >
        Past Events
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Search and Category Filter with Upcoming/Past toggle */}
      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        categories={CATEGORIES}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        searchPlaceholder="Search events by title, organizer, or venue..."
        extraFilter={extraFilter}
      />

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title={
            initialEvents.length === 0
              ? "No events found"
              : `No ${timeView} events match your criteria`
          }
          description={
            initialEvents.length === 0
              ? isConfigured
                ? "No campus events have been scheduled yet."
                : "Database is not connected. Add Supabase environment variables to see live events."
              : `There are no ${timeView} events matching the selected filters.`
          }
          onAction={
            search || selectedCategory !== "All"
              ? () => {
                  setSearch("");
                  setSelectedCategory("All");
                }
              : undefined
          }
          actionLabel="Reset filters"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((evt) => (
            <article
              key={evt.id}
              className="flex flex-col justify-between bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md hover:border-slate-300 transition-all group"
            >
              {/* Optional Event Image Banner */}
              {evt.image_url ? (
                <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                  <img
                    src={evt.image_url}
                    alt={evt.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge variant={getCategoryBadgeVariant(evt.category)}>
                      {evt.category}
                    </Badge>
                  </div>
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-lg p-0.5 shadow-sm">
                    <BookmarkButton
                      itemId={evt.id}
                      itemType="event"
                      initialIsBookmarked={bookmarkedSet.has(evt.id)}
                      size="sm"
                    />
                  </div>
                </div>
              ) : (
                <div className="p-5 pb-0 flex items-center justify-between">
                  <Badge variant={getCategoryBadgeVariant(evt.category)}>
                    {evt.category}
                  </Badge>
                  <BookmarkButton
                    itemId={evt.id}
                    itemType="event"
                    initialIsBookmarked={bookmarkedSet.has(evt.id)}
                    size="sm"
                  />
                </div>
              )}

              {/* Event Content */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <Link href={`/events/${evt.id}`}>
                    <h3 className="text-base font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                      {evt.title}
                    </h3>
                  </Link>
                  <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {evt.description}
                  </p>
                </div>

                {/* Event Details */}
                <div className="mt-4 pt-3.5 border-t border-slate-100 space-y-2 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>
                      {formatDate(evt.start_time)} • {formatTime(evt.start_time)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{evt.venue}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">Organized by {evt.organizer}</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
