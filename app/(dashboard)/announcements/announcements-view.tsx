"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Megaphone, FileText, Calendar, User } from "lucide-react";
import { Announcement } from "@/lib/types/database";
import { SearchFilterBar } from "@/components/search-filter-bar";
import { Badge, getCategoryBadgeVariant } from "@/components/ui/badge";
import { BookmarkButton } from "@/components/bookmark-button";
import { EmptyState } from "@/components/empty-state";
import { formatDate } from "@/lib/utils";

const CATEGORIES = [
  "General",
  "Academic",
  "Campus Life",
  "Urgent",
  "Career",
  "Sports",
];

interface AnnouncementsViewProps {
  initialAnnouncements: Announcement[];
  bookmarkedIds: string[];
  isConfigured: boolean;
}

export function AnnouncementsView({
  initialAnnouncements,
  bookmarkedIds,
  isConfigured,
}: AnnouncementsViewProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const bookmarkedSet = useMemo(() => new Set(bookmarkedIds), [bookmarkedIds]);

  const filteredAnnouncements = useMemo(() => {
    return initialAnnouncements.filter((item) => {
      const matchesCategory =
        selectedCategory === "All" || item.category === selectedCategory;
      const matchesSearch =
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.content.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [initialAnnouncements, search, selectedCategory]);

  return (
    <div className="space-y-6">
      {/* Search and Category Filter */}
      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        categories={CATEGORIES}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        searchPlaceholder="Search announcements by keywords..."
      />

      {/* Announcements List */}
      {filteredAnnouncements.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title={
            initialAnnouncements.length === 0
              ? "No announcements found"
              : "No matching announcements"
          }
          description={
            initialAnnouncements.length === 0
              ? isConfigured
                ? "No announcements have been published to the campus board yet."
                : "Database is not connected. Add Supabase environment variables to see live announcements."
              : "Try adjusting your search terms or selecting a different category."
          }
          onAction={
            search || selectedCategory !== "All"
              ? () => {
                  setSearch("");
                  setSelectedCategory("All");
                }
              : undefined
          }
          actionLabel="Clear filters"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAnnouncements.map((item) => (
            <article
              key={item.id}
              className="flex flex-col justify-between bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <Badge variant={getCategoryBadgeVariant(item.category)}>
                    {item.category}
                  </Badge>
                  <BookmarkButton
                    itemId={item.id}
                    itemType="announcement"
                    initialIsBookmarked={bookmarkedSet.has(item.id)}
                    size="sm"
                  />
                </div>

                <Link href={`/announcements/${item.id}`} className="block">
                  <h3 className="text-base font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed">
                    {item.content}
                  </p>
                </Link>
              </div>

              <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{formatDate(item.publish_date)}</span>
                </div>

                {item.attachment_url ? (
                  <span className="flex items-center gap-1 text-blue-600 font-medium">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Attachment</span>
                  </span>
                ) : item.author ? (
                  <div className="flex items-center gap-1 truncate max-w-[120px]">
                    <User className="w-3 h-3 text-slate-400" />
                    <span className="truncate">{item.author.full_name}</span>
                  </div>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
