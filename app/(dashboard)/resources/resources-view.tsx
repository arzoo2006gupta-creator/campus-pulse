"use client";

import React, { useState, useMemo } from "react";
import {
  FolderDown,
  ExternalLink,
  FileText,
  Download,
  BookOpen,
} from "lucide-react";
import { Resource } from "@/lib/types/database";
import { Badge, getCategoryBadgeVariant } from "@/components/ui/badge";
import { SearchFilterBar } from "@/components/search-filter-bar";
import { EmptyState } from "@/components/empty-state";

const CATEGORIES = [
  "Academic",
  "Administrative",
  "Library",
  "Campus Support",
  "Career & Tech",
  "General",
];

interface ResourcesViewProps {
  initialResources: Resource[];
  isConfigured: boolean;
}

export function ResourcesView({
  initialResources,
  isConfigured,
}: ResourcesViewProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredResources = useMemo(() => {
    return initialResources.filter((res) => {
      if (selectedCategory !== "All" && res.category !== selectedCategory) {
        return false;
      }
      if (search) {
        const query = search.toLowerCase();
        const matchesTitle = res.title.toLowerCase().includes(query);
        const matchesDesc = (res.description || "").toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc) return false;
      }
      return true;
    });
  }, [initialResources, search, selectedCategory]);

  const formatFileSize = (bytes?: number | null) => {
    if (!bytes) return "";
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        categories={CATEGORIES}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        searchPlaceholder="Search campus guides, portals, handbooks..."
      />

      {filteredResources.length === 0 ? (
        <EmptyState
          icon={FolderDown}
          title={
            initialResources.length === 0
              ? "No campus resources available"
              : "No resources match your search"
          }
          description={
            initialResources.length === 0
              ? isConfigured
                ? "Campus administration has not uploaded any resources yet."
                : "Database is not connected. Connect Supabase to browse student resources."
              : "Try searching with broader terms or picking another category."
          }
          onAction={
            search || selectedCategory !== "All"
              ? () => {
                  setSearch("");
                  setSelectedCategory("All");
                }
              : undefined
          }
          actionLabel="Clear filter"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredResources.map((res) => {
            const isFile = res.resource_type === "file";
            const targetUrl = isFile ? res.file_url || "#" : res.link_url || "#";

            return (
              <div
                key={res.id}
                className="flex flex-col justify-between bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <Badge variant={getCategoryBadgeVariant(res.category)}>
                      {res.category}
                    </Badge>
                    <span className="text-[11px] font-medium text-slate-400">
                      {isFile ? "File Document" : "Web Portal"}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {res.title}
                  </h3>

                  {res.description && (
                    <p className="mt-2 text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed">
                      {res.description}
                    </p>
                  )}
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xs text-slate-400">
                    {isFile && res.file_size_bytes
                      ? formatFileSize(res.file_size_bytes)
                      : ""}
                  </div>

                  <a
                    href={targetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={isFile ? res.file_name || true : undefined}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition-colors"
                  >
                    {isFile ? (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </>
                    ) : (
                      <>
                        <span>Open Link</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </>
                    )}
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
