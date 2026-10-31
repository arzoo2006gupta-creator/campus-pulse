import React from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/actions/profile";
import { Header } from "@/components/navigation/header";
import { AcademicCalendarItem } from "@/lib/types/database";
import { CalendarView } from "./calendar-view";

export const revalidate = 0;

export default async function AcademicCalendarPage() {
  const profile = await getCurrentProfile();
  const configured = isSupabaseConfigured();

  let items: AcademicCalendarItem[] = [];

  if (configured) {
    const supabase = createClient();
    const { data } = await supabase
      .from("academic_calendar")
      .select("*")
      .eq("is_published", true)
      .order("start_date", { ascending: true });

    if (data) {
      items = data as AcademicCalendarItem[];
    }
  }

  return (
    <div className="min-h-full pb-12">
      <Header
        profile={profile}
        title="Academic Calendar"
        description="Official schedule of examinations, registration windows, academic holidays, and term deadlines."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <CalendarView initialItems={items} isConfigured={configured} />
      </div>
    </div>
  );
}
