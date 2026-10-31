import React from "react";
import { redirect } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/actions/profile";
import { Header } from "@/components/navigation/header";
import { AdminView } from "./admin-view";
import {
  Announcement,
  Event,
  AcademicCalendarItem,
  Resource,
  Club,
} from "@/lib/types/database";

export const revalidate = 0;

export default async function AdminPage() {
  const profile = await getCurrentProfile();
  const configured = isSupabaseConfigured();

  if (!profile || profile.role !== "admin") {
    redirect("/?error=unauthorized_admin");
  }

  let announcements: Announcement[] = [];
  let events: Event[] = [];
  let calendarItems: AcademicCalendarItem[] = [];
  let resources: Resource[] = [];
  let clubs: Club[] = [];

  if (configured) {
    const supabase = createClient();
    const [
      announcementsRes,
      eventsRes,
      calendarRes,
      resourcesRes,
      clubsRes,
    ] = await Promise.all([
      supabase
        .from("announcements")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("events")
        .select("*")
        .order("start_time", { ascending: true }),
      supabase
        .from("academic_calendar")
        .select("*")
        .order("start_date", { ascending: true }),
      supabase
        .from("resources")
        .select("*")
        .order("title", { ascending: true }),
      supabase
        .from("clubs")
        .select("*")
        .order("name", { ascending: true }),
    ]);

    if (announcementsRes.data) announcements = announcementsRes.data as Announcement[];
    if (eventsRes.data) events = eventsRes.data as Event[];
    if (calendarRes.data) calendarItems = calendarRes.data as AcademicCalendarItem[];
    if (resourcesRes.data) resources = resourcesRes.data as Resource[];
    if (clubsRes.data) clubs = clubsRes.data as Club[];
  }

  return (
    <div className="min-h-full pb-16">
      <Header
        profile={profile}
        title="Campus Administration Portal"
        description="Create, publish, edit, archive, and manage all campus content across announcements, events, schedules, resources, and clubs."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <AdminView
          initialAnnouncements={announcements}
          initialEvents={events}
          initialCalendar={calendarItems}
          initialResources={resources}
          initialClubs={clubs}
          isConfigured={configured}
        />
      </div>
    </div>
  );
}
