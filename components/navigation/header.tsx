import React from "react";
import Link from "next/link";
import { Profile } from "@/lib/types/database";
import { Bell, ShieldCheck, User } from "lucide-react";

interface HeaderProps {
  profile: Profile | null;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export function Header({
  profile,
  title,
  description,
  action,
}: HeaderProps) {
  const today = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date());

  return (
    <div className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Title & Description */}
        <div>
          {title && (
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              {title}
            </h1>
          )}
          {description && (
            <p className="mt-0.5 text-xs sm:text-sm text-slate-500">{description}</p>
          )}
        </div>

        {/* Right side controls & info */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center text-xs font-medium text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <span>{today}</span>
          </div>

          {action}

          {profile ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              {profile.role === "admin" && (
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span>Admin Mode</span>
                </Link>
              )}
              <Link
                href="/profile"
                className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                title="Profile & Settings"
              >
                <User className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <Link
              href="/login"
              className="text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
