import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  User,
  Paperclip,
  Download,
  Building,
} from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/actions/profile";
import { getUserBookmarkedIds } from "@/lib/actions/bookmarks";
import { Header } from "@/components/navigation/header";
import { Badge, getCategoryBadgeVariant } from "@/components/ui/badge";
import { BookmarkButton } from "@/components/bookmark-button";
import { formatDate } from "@/lib/utils";
import { Announcement } from "@/lib/types/database";

interface PageProps {
  params: { id: string };
}

export const revalidate = 0;

export default async function AnnouncementDetailPage({ params }: PageProps) {
  const profile = await getCurrentProfile();
  const configured = isSupabaseConfigured();

  if (!configured) {
    notFound();
  }

  const supabase = createClient();
  const [announcementRes, bookmarksData] = await Promise.all([
    supabase
      .from("announcements")
      .select("*, author:profiles(full_name, department, avatar_url)")
      .eq("id", params.id)
      .eq("is_published", true)
      .maybeSingle(),
    getUserBookmarkedIds(),
  ]);

  const announcement = announcementRes.data as Announcement | null;

  if (!announcement) {
    notFound();
  }

  const isBookmarked = bookmarksData.announcementIds.has(announcement.id);

  return (
    <div className="min-h-full pb-16">
      <Header
        profile={profile}
        title="Announcement Details"
        description="Official publication from campus administration."
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Back Link */}
        <Link
          href="/announcements"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Announcements</span>
        </Link>

        {/* Announcement Container */}
        <article className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          {/* Header row: Category & Bookmark */}
          <div className="flex items-center justify-between gap-4">
            <Badge variant={getCategoryBadgeVariant(announcement.category)}>
              {announcement.category}
            </Badge>

            <BookmarkButton
              itemId={announcement.id}
              itemType="announcement"
              initialIsBookmarked={isBookmarked}
            />
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-snug">
            {announcement.title}
          </h1>

          {/* Metadata: Author & Date */}
          <div className="flex flex-wrap items-center gap-4 py-3 border-y border-slate-100 text-xs sm:text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Published on {formatDate(announcement.publish_date)}</span>
            </div>

            {announcement.author && (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400" />
                <span>
                  By {announcement.author.full_name}
                  {announcement.author.department ? ` (${announcement.author.department})` : ""}
                </span>
              </div>
            )}
          </div>

          {/* Announcement Content */}
          <div className="prose prose-slate max-w-none text-slate-700 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
            {announcement.content}
          </div>

          {/* Optional Attachment */}
          {announcement.attachment_url && (
            <div className="mt-8 pt-6 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Official Attachment
              </h3>
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-blue-100 text-blue-700">
                    <Paperclip className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {announcement.attachment_name || "Download Document"}
                    </p>
                    <p className="text-xs text-slate-500">Official Campus Document</p>
                  </div>
                </div>

                <a
                  href={announcement.attachment_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </a>
              </div>
            </div>
          )}
        </article>
      </div>
    </div>
  );
}
