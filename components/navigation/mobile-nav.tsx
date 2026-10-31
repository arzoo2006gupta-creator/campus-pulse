"use client";

import React, { useState } from "react";
import { Menu, X, Building2 } from "lucide-react";
import { Sidebar } from "./sidebar";
import { Profile } from "@/lib/types/database";

interface MobileNavProps {
  profile: Profile | null;
}

export function MobileNav({ profile }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Top Mobile Bar */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsOpen(true)}
            className="p-2 -ml-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 font-semibold text-sm tracking-wide text-blue-400">
            <Building2 className="w-4 h-4" />
            <span>Campus Pulse</span>
          </div>
        </div>

        {profile && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-300 hidden sm:inline-block">
              {profile.full_name}
            </span>
            <div className="w-7 h-7 rounded-full bg-blue-600/30 text-blue-400 border border-blue-500/40 flex items-center justify-center font-bold text-xs">
              {profile.full_name?.charAt(0).toUpperCase() || "S"}
            </div>
          </div>
        )}
      </header>

      {/* Slide-out Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Content */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-slate-900 shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            <div className="absolute top-2 right-2 z-20">
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                aria-label="Close navigation"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <Sidebar profile={profile} onNavigate={() => setIsOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
