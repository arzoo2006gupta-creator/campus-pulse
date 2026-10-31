"use client";

import React, { useState, useMemo } from "react";
import {
  Users,
  Mail,
  Globe,
  MapPin,
  Clock,
  Sparkles,
} from "lucide-react";
import { Club } from "@/lib/types/database";
import { Badge, getCategoryBadgeVariant } from "@/components/ui/badge";
import { SearchFilterBar } from "@/components/search-filter-bar";
import { EmptyState } from "@/components/empty-state";

const CATEGORIES = [
  "Tech & Innovation",
  "Arts & Culture",
  "Sports & Fitness",
  "Academic & Career",
  "Social & Community",
  "General",
];

interface ClubsViewProps {
  initialClubs: Club[];
  isConfigured: boolean;
}

export function ClubsView({ initialClubs, isConfigured }: ClubsViewProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredClubs = useMemo(() => {
    return initialClubs.filter((club) => {
      if (selectedCategory !== "All" && club.category !== selectedCategory) {
        return false;
      }
      if (search) {
        const query = search.toLowerCase();
        const matchesName = club.name.toLowerCase().includes(query);
        const matchesDesc = club.description.toLowerCase().includes(query);
        const matchesMeeting = (club.meeting_info || "").toLowerCase().includes(query);
        if (!matchesName && !matchesDesc && !matchesMeeting) return false;
      }
      return true;
    });
  }, [initialClubs, search, selectedCategory]);

  return (
    <div className="space-y-6">
      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        categories={CATEGORIES}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        searchPlaceholder="Search student clubs and societies..."
      />

      {filteredClubs.length === 0 ? (
        <EmptyState
          icon={Users}
          title={
            initialClubs.length === 0
              ? "No registered student clubs"
              : "No clubs match your search"
          }
          description={
            initialClubs.length === 0
              ? isConfigured
                ? "No campus clubs or student societies have been listed yet."
                : "Database is not connected. Connect Supabase to browse student organizations."
              : "Try searching with broader terms or selecting all categories."
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClubs.map((club) => (
            <article
              key={club.id}
              className="flex flex-col justify-between bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md hover:border-slate-300 transition-all group"
            >
              {/* Optional Club Banner / Logo */}
              {club.logo_url && (
                <div className="relative h-40 w-full bg-slate-100 overflow-hidden border-b border-slate-100">
                  <img
                    src={club.logo_url}
                    alt={club.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge variant={getCategoryBadgeVariant(club.category)}>
                      {club.category}
                    </Badge>
                  </div>
                </div>
              )}

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  {!club.logo_url && (
                    <div className="mb-3">
                      <Badge variant={getCategoryBadgeVariant(club.category)}>
                        {club.category}
                      </Badge>
                    </div>
                  )}

                  <h3 className="text-base font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {club.name}
                  </h3>

                  <p className="mt-2 text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed">
                    {club.description}
                  </p>

                  {club.meeting_info && (
                    <div className="mt-3.5 flex items-start gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-600">
                      <Clock className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                      <span>{club.meeting_info}</span>
                    </div>
                  )}
                </div>

                {/* Footer Links (Email / Website) */}
                <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
                  {club.contact_email ? (
                    <a
                      href={`mailto:${club.contact_email}`}
                      className="inline-flex items-center gap-1.5 text-slate-600 hover:text-blue-600 font-medium transition-colors"
                      title={club.contact_email}
                    >
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>Email Club</span>
                    </a>
                  ) : (
                    <span />
                  )}

                  {club.website_url && (
                    <a
                      href={club.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>Official Site</span>
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
