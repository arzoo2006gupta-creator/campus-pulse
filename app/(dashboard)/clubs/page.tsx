import React from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/actions/profile";
import { Header } from "@/components/navigation/header";
import { Club } from "@/lib/types/database";
import { ClubsView } from "./clubs-view";

export const revalidate = 0;

export default async function ClubsPage() {
  const profile = await getCurrentProfile();
  const configured = isSupabaseConfigured();

  let clubs: Club[] = [];

  if (configured) {
    const supabase = createClient();
    const { data } = await supabase
      .from("clubs")
      .select("*")
      .eq("is_published", true)
      .order("name", { ascending: true });

    if (data) {
      clubs = data as Club[];
    }
  }

  return (
    <div className="min-h-full pb-12">
      <Header
        profile={profile}
        title="Clubs & Student Societies"
        description="Get involved in campus life, student organizations, competitive design teams, and cultural groups."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <ClubsView initialClubs={clubs} isConfigured={configured} />
      </div>
    </div>
  );
}
