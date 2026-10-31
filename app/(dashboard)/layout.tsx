import React from "react";
import { Sidebar } from "@/components/navigation/sidebar";
import { MobileNav } from "@/components/navigation/mobile-nav";
import { getCurrentProfile } from "@/lib/actions/profile";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Desktop Left Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <Sidebar profile={profile} />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Mobile Navigation Drawer & Header */}
        <MobileNav profile={profile} />

        {/* Scrollable Main Stage */}
        <main className="flex-1 overflow-y-auto focus:outline-none">
          {children}
        </main>
      </div>
    </div>
  );
}
