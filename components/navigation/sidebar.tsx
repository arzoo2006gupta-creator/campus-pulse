"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Megaphone,
  CalendarDays,
  GraduationCap,
  FolderDown,
  Users,
  BookmarkCheck,
  Settings,
  ShieldCheck,
  LogOut,
  LogIn,
  Building2,
} from "lucide-react";
import { Profile } from "@/lib/types/database";
import { cn } from "@/lib/utils";
import { signOutAction } from "@/lib/actions/auth";

interface SidebarProps {
  profile: Profile | null;
  onNavigate?: () => void;
}

export function Sidebar({ profile, onNavigate }: SidebarProps) {
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/announcements", label: "Announcements", icon: Megaphone },
    { href: "/events", label: "Events", icon: CalendarDays },
    { href: "/calendar", label: "Academic Calendar", icon: GraduationCap },
    { href: "/resources", label: "Resources", icon: FolderDown },
    { href: "/clubs", label: "Clubs & Societies", icon: Users },
    { href: "/bookmarks", label: "My Bookmarks", icon: BookmarkCheck },
    { href: "/profile", label: "Profile & Settings", icon: Settings },
  ];

  const isAdmin = profile?.role === "admin";

  const getInitials = (name?: string) => {
    if (!name) return "CP";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <aside className="flex flex-col h-full w-72 bg-slate-900 text-slate-200 border-r border-slate-800">
      {/* 1. TOP-LEFT: STUDENT PROFILE SECTION */}
      <div className="p-5 border-b border-slate-800/80 bg-slate-900/60">
        <div className="flex items-center gap-2 mb-4 text-xs font-semibold tracking-wider uppercase text-blue-400">
          <Building2 className="w-4 h-4" />
          <span>Campus Pulse</span>
        </div>

        {profile ? (
          <div className="flex items-center gap-3">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name}
                className="w-11 h-11 rounded-full object-cover border-2 border-blue-500/30 flex-shrink-0"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-sm flex-shrink-0">
                {getInitials(profile.full_name)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-semibold text-white truncate">
                  {profile.full_name || "Student"}
                </p>
                <span
                  className={cn(
                    "text-[10px] font-medium px-1.5 py-0.5 rounded uppercase tracking-wider",
                    profile.role === "admin"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                  )}
                >
                  {profile.role}
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate mt-0.5">
                {profile.department
                  ? `${profile.department} ${profile.year ? `• ${profile.year}` : ""}`
                  : "Campus Student"}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-800 text-slate-400 border border-slate-700 flex items-center justify-center font-semibold text-xs flex-shrink-0">
              CP
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white">Campus Guest</p>
              <Link
                href="/login"
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                onClick={onNavigate}
              >
                Sign in to your account &rarr;
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* 2. NAVIGATION LINKS */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <p className="px-3 pb-2 text-[11px] font-semibold tracking-wider uppercase text-slate-400">
          Navigation
        </p>

        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive =
            link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all group",
                isActive
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/80"
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 transition-transform group-hover:scale-105",
                  isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"
                )}
              />
              <span>{link.label}</span>
            </Link>
          );
        })}

        {/* ADMIN PORTAL LINK (Shown for admins) */}
        {isAdmin && (
          <div className="pt-4 mt-4 border-t border-slate-800">
            <p className="px-3 pb-2 text-[11px] font-semibold tracking-wider uppercase text-amber-400/90 flex items-center justify-between">
              <span>Admin Center</span>
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            </p>
            <Link
              href="/admin"
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all group",
                pathname.startsWith("/admin")
                  ? "bg-amber-600 text-white shadow-sm"
                  : "text-amber-200/90 hover:text-amber-100 hover:bg-amber-950/40 border border-amber-900/30"
              )}
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Admin Dashboard</span>
            </Link>
          </div>
        )}
      </nav>

      {/* 3. BOTTOM FOOTER / SIGN OUT */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/80">
        {profile ? (
          <form action={signOutAction}>
            <button
              type="submit"
              className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </form>
        ) : (
          <Link
            href="/login"
            onClick={onNavigate}
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-xs font-medium text-blue-400 hover:text-blue-300 hover:bg-slate-800 transition-colors"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In</span>
          </Link>
        )}
      </div>
    </aside>
  );
}
