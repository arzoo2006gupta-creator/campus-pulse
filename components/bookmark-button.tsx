"use client";

import React, { useState, useTransition } from "react";
import { Bookmark } from "lucide-react";
import {
  toggleAnnouncementBookmarkAction,
  toggleEventBookmarkAction,
} from "@/lib/actions/bookmarks";
import { cn } from "@/lib/utils";

interface BookmarkButtonProps {
  itemId: string;
  itemType: "announcement" | "event";
  initialIsBookmarked?: boolean;
  className?: string;
  size?: "sm" | "md";
}

export function BookmarkButton({
  itemId,
  itemType,
  initialIsBookmarked = false,
  className,
  size = "md",
}: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);
  const [isPending, startTransition] = useTransition();

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Optimistic toggle
    const nextState = !isBookmarked;
    setIsBookmarked(nextState);

    startTransition(async () => {
      try {
        const res =
          itemType === "announcement"
            ? await toggleAnnouncementBookmarkAction(itemId)
            : await toggleEventBookmarkAction(itemId);

        if (!res.success) {
          // Revert optimistic state on failure
          setIsBookmarked(!nextState);
          alert(res.error || "Failed to update bookmark.");
        } else if (typeof res.bookmarked === "boolean") {
          setIsBookmarked(res.bookmarked);
        }
      } catch {
        setIsBookmarked(!nextState);
      }
    });
  };

  const sizeClasses = size === "sm" ? "p-1.5" : "p-2";
  const iconSizes = size === "sm" ? "w-4 h-4" : "w-5 h-5";

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      aria-label={isBookmarked ? "Remove bookmark" : "Save bookmark"}
      title={isBookmarked ? "Bookmarked (Click to remove)" : "Bookmark this item"}
      className={cn(
        "rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500",
        sizeClasses,
        isBookmarked
          ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
          : "text-slate-400 hover:bg-slate-100 hover:text-slate-600",
        className
      )}
    >
      <Bookmark
        className={cn(
          iconSizes,
          "transition-transform active:scale-90",
          isBookmarked ? "fill-blue-600 text-blue-600" : ""
        )}
      />
    </button>
  );
}
