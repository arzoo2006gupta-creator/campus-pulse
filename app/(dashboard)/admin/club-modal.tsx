"use client";

import React, { useState, useEffect, useTransition } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select } from "@/components/ui/input";
import { Club } from "@/lib/types/database";
import { createClubAction, updateClubAction } from "@/lib/actions/admin";

interface ClubModalProps {
  isOpen: boolean;
  onClose: () => void;
  club?: Club | null;
  onSuccess: () => void;
}

const CATEGORIES = [
  { label: "Tech & Innovation", value: "Tech & Innovation" },
  { label: "Arts & Culture", value: "Arts & Culture" },
  { label: "Sports & Fitness", value: "Sports & Fitness" },
  { label: "Academic & Career", value: "Academic & Career" },
  { label: "Social & Community", value: "Social & Community" },
  { label: "General", value: "General" },
];

export function ClubModal({ isOpen, onClose, club, onSuccess }: ClubModalProps) {
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Tech & Innovation");
  const [contactEmail, setContactEmail] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [meetingInfo, setMeetingInfo] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (club) {
      setName(club.name);
      setDescription(club.description);
      setCategory(club.category);
      setContactEmail(club.contact_email || "");
      setWebsiteUrl(club.website_url || "");
      setLogoUrl(club.logo_url || "");
      setMeetingInfo(club.meeting_info || "");
      setIsPublished(club.is_published);
    } else {
      setName("");
      setDescription("");
      setCategory("Tech & Innovation");
      setContactEmail("");
      setWebsiteUrl("");
      setLogoUrl("");
      setMeetingInfo("");
      setIsPublished(true);
    }
    setError(null);
  }, [club, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const payload = {
      name,
      description,
      category,
      contact_email: contactEmail || undefined,
      website_url: websiteUrl || undefined,
      logo_url: logoUrl || undefined,
      meeting_info: meetingInfo || undefined,
      is_published: isPublished,
    };

    startTransition(async () => {
      const res = club
        ? await updateClubAction(club.id, payload)
        : await createClubAction(payload);

      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setError(res.error || "Failed to save club");
      }
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={club ? "Edit Club" : "Register New Club"}
      description="Add or update recognized student societies, competitive teams, and interest clubs."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800">
            {error}
          </div>
        )}

        <Input
          label="Club Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="e.g. Computer Science Society"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={CATEGORIES}
          />

          <div className="flex flex-col justify-end">
            <label className="flex items-center gap-2 cursor-pointer pb-2">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs font-semibold text-slate-700">
                Visible in student directory
              </span>
            </label>
          </div>
        </div>

        <Textarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          required
          placeholder="Mission, typical activities, member benefits..."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Contact Email"
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder="club@campus.edu"
          />

          <Input
            label="Meeting Info"
            value={meetingInfo}
            onChange={(e) => setMeetingInfo(e.target.value)}
            placeholder="e.g. Tuesdays 6PM in Room 204"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Official Website URL"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            placeholder="https://..."
          />

          <Input
            label="Logo / Banner URL"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="https://.../logo.png"
          />
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
          <Button variant="outline" size="sm" type="button" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button size="sm" type="submit" isLoading={isPending}>
            {club ? "Update Club" : "Register Club"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
