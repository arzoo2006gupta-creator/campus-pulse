"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, AlertCircle, Shield, Bell } from "lucide-react";
import { Profile } from "@/lib/types/database";
import { updateProfileAction } from "@/lib/actions/profile";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";

const ACADEMIC_YEARS = [
  { label: "Freshman (1st Year)", value: "Freshman" },
  { label: "Sophomore (2nd Year)", value: "Sophomore" },
  { label: "Junior (3rd Year)", value: "Junior" },
  { label: "Senior (4th Year)", value: "Senior" },
  { label: "Graduate / Postgrad", value: "Graduate" },
];

const DEPARTMENTS = [
  { label: "Computer Science & Engineering", value: "Computer Science" },
  { label: "Electrical & Computer Engineering", value: "Electrical Engineering" },
  { label: "Mechanical Engineering", value: "Mechanical Engineering" },
  { label: "Business Administration", value: "Business Administration" },
  { label: "Biological Sciences", value: "Biological Sciences" },
  { label: "Mathematics & Statistics", value: "Mathematics" },
  { label: "Humanities & Social Sciences", value: "Humanities" },
  { label: "Undeclared", value: "Undeclared" },
];

interface ProfileFormProps {
  profile: Profile;
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [fullName, setFullName] = useState(profile.full_name || "");
  const [department, setDepartment] = useState(
    profile.department || "Computer Science"
  );
  const [year, setYear] = useState(profile.year || "Freshman");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || "");
  const [notifications, setNotifications] = useState(
    profile.notification_preferences || {
      email_announcements: true,
      email_events: true,
      email_reminders: false,
    }
  );

  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const payload = {
      full_name: fullName,
      department,
      year,
      avatar_url: avatarUrl,
      notification_preferences: notifications,
    };

    startTransition(async () => {
      const res = await updateProfileAction(payload);
      if (res.success) {
        setMessage({
          type: "success",
          text: "Profile and notification settings saved successfully!",
        });
        router.refresh();
      } else {
        setMessage({
          type: "error",
          text: res.error || "Failed to update profile.",
        });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Status Messages */}
      {message && (
        <div
          className={`p-4 rounded-xl text-sm flex items-center gap-3 border ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Card 1: Academic & Directory Details */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Academic & Directory Profile
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              These details identify you across campus announcements and directory queries.
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <Shield className="w-3.5 h-3.5 text-blue-600" />
            <span>Role: {profile.role}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Input
            label="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            placeholder="e.g. Alex Chen"
          />

          <Select
            label="Academic Department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            options={DEPARTMENTS}
          />

          <Select
            label="Academic Year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            options={ACADEMIC_YEARS}
          />

          <Input
            label="Avatar Image URL (Optional)"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://example.com/avatar.jpg"
            helperText="Direct image URL for your profile avatar"
          />
        </div>
      </div>

      {/* Card 2: Notification Preferences */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="pb-4 border-b border-slate-100 flex items-center gap-2">
          <Bell className="w-5 h-5 text-blue-600" />
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Notification Preferences
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Choose the updates you wish to receive from campus administration.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={notifications.email_announcements}
              onChange={(e) =>
                setNotifications({
                  ...notifications,
                  email_announcements: e.target.checked,
                })
              }
              className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <div>
              <span className="text-sm font-semibold text-slate-800 block">
                Official Announcements
              </span>
              <span className="text-xs text-slate-500">
                Receive notifications when university leadership or your department posts new notices.
              </span>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={notifications.email_events}
              onChange={(e) =>
                setNotifications({
                  ...notifications,
                  email_events: e.target.checked,
                })
              }
              className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <div>
              <span className="text-sm font-semibold text-slate-800 block">
                Campus Events & Workshops
              </span>
              <span className="text-xs text-slate-500">
                Receive weekly digests of upcoming campus fairs, talks, and cultural events.
              </span>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={notifications.email_reminders}
              onChange={(e) =>
                setNotifications({
                  ...notifications,
                  email_reminders: e.target.checked,
                })
              }
              className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <div>
              <span className="text-sm font-semibold text-slate-800 block">
                Academic Deadline Reminders
              </span>
              <span className="text-xs text-slate-500">
                Receive alerts 48 hours before key dates like registration or drop deadlines.
              </span>
            </div>
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="submit" isLoading={isPending} size="md">
          Save Settings
        </Button>
      </div>
    </form>
  );
}
