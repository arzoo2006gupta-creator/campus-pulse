"use client";

import React, { useState, useMemo } from "react";
import {
  GraduationCap,
  Calendar as CalendarIcon,
  Clock,
  Filter,
} from "lucide-react";
import { AcademicCalendarItem } from "@/lib/types/database";
import { Badge, getCategoryBadgeVariant } from "@/components/ui/badge";
import { SearchFilterBar } from "@/components/search-filter-bar";
import { EmptyState } from "@/components/empty-state";
import { formatDate } from "@/lib/utils";

const EVENT_TYPES = [
  "Exam",
  "Holiday",
  "Deadline",
  "Activity",
  "Registration",
];

interface CalendarViewProps {
  initialItems: AcademicCalendarItem[];
  isConfigured: boolean;
}

export function CalendarView({ initialItems, isConfigured }: CalendarViewProps) {
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("All");

  const todayStr = new Date().toISOString().split("T")[0];

  const filteredItems = useMemo(() => {
    return initialItems.filter((item) => {
      if (selectedType !== "All" && item.event_type !== selectedType) {
        return false;
      }
      if (search) {
        const query = search.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesDesc = (item.description || "").toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc) return false;
      }
      return true;
    });
  }, [initialItems, search, selectedType]);

  // Group items by Month/Year
  const groupedItems = useMemo(() => {
    const groups: { [key: string]: AcademicCalendarItem[] } = {};
    for (const item of filteredItems) {
      const date = new Date(item.start_date);
      const groupKey = new Intl.DateTimeFormat("en-US", {
        month: "long",
        year: "numeric",
      }).format(date);

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
    }
    return groups;
  }, [filteredItems]);

  const getItemStatus = (start: string, end: string) => {
    if (todayStr >= start && todayStr <= end) {
      return { label: "Ongoing", color: "bg-emerald-500" };
    }
    if (todayStr < start) {
      return { label: "Upcoming", color: "bg-blue-500" };
    }
    return { label: "Past", color: "bg-slate-300" };
  };

  return (
    <div className="space-y-6">
      {/* Search & Category Filter */}
      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        categories={EVENT_TYPES}
        selectedCategory={selectedType}
        onCategoryChange={setSelectedType}
        searchPlaceholder="Search academic dates, exams, deadlines..."
      />

      {/* Calendar List grouped by Month */}
      {filteredItems.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title={
            initialItems.length === 0
              ? "No calendar items recorded"
              : "No dates match your search"
          }
          description={
            initialItems.length === 0
              ? isConfigured
                ? "The academic calendar has not been populated yet."
                : "Database is not connected. Connect Supabase to view registered calendar dates."
              : "Try choosing another category or clearing your search term."
          }
          onAction={
            search || selectedType !== "All"
              ? () => {
                  setSearch("");
                  setSelectedType("All");
                }
              : undefined
          }
          actionLabel="Clear filter"
        />
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedItems).map(([monthYear, items]) => (
            <section key={monthYear} className="space-y-3">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                  {monthYear}
                </h3>
                <span className="text-xs text-slate-400 font-medium">
                  ({items.length} {items.length === 1 ? "entry" : "entries"})
                </span>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 shadow-sm overflow-hidden">
                {items.map((item) => {
                  const status = getItemStatus(item.start_date, item.end_date);
                  return (
                    <div
                      key={item.id}
                      className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        {/* Date badge */}
                        <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-center flex-shrink-0">
                          <span className="text-[10px] font-bold uppercase text-blue-600">
                            {new Intl.DateTimeFormat("en-US", {
                              month: "short",
                            }).format(new Date(item.start_date))}
                          </span>
                          <span className="text-lg font-extrabold text-slate-900 leading-none">
                            {new Date(item.start_date).getUTCDate()}
                          </span>
                        </div>

                        {/* Title and details */}
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-base font-semibold text-slate-900">
                              {item.title}
                            </h4>
                            <Badge variant={getCategoryBadgeVariant(item.event_type)}>
                              {item.event_type}
                            </Badge>
                          </div>
                          {item.description && (
                            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right date & status pill */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1 flex-shrink-0">
                        <div className="text-xs font-semibold text-slate-700">
                          <span>{formatDate(item.start_date)}</span>
                          {item.start_date !== item.end_date && (
                            <span> – {formatDate(item.end_date)}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                          <span
                            className={`w-2 h-2 rounded-full ${status.color}`}
                          />
                          <span>{status.label}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
