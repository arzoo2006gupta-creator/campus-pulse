import React from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/actions/profile";
import { Header } from "@/components/navigation/header";
import { Resource } from "@/lib/types/database";
import { ResourcesView } from "./resources-view";

export const revalidate = 0;

export default async function ResourcesPage() {
  const profile = await getCurrentProfile();
  const configured = isSupabaseConfigured();

  let resources: Resource[] = [];

  if (configured) {
    const supabase = createClient();
    const { data } = await supabase
      .from("resources")
      .select("*")
      .eq("is_published", true)
      .order("title", { ascending: true });

    if (data) {
      resources = data as Resource[];
    }
  }

  return (
    <div className="min-h-full pb-12">
      <Header
        profile={profile}
        title="Student Resources & Portals"
        description="Essential campus documents, academic handbooks, financial aid links, and digital student services."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <ResourcesView
          initialResources={resources}
          isConfigured={configured}
        />
      </div>
    </div>
  );
}
