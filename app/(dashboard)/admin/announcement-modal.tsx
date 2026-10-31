"use client";

import React, { useState, useEffect, useTransition } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select } from "@/components/ui/input";
import { Announcement } from "@/lib/types/database";
import {
  createAnnouncementAction,
  updateAnnouncementAction,
} from "@/lib/actions/admin";

interface AnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  announcement?: Announcement | null;
  onSuccess: () => void;
}

const CATEGORIES = [
  { label: "General", value: "General" },
  { label: "Academic", value: "Academic" },
  { label: "Campus Life", value: "Campus Life" },
  { label: "Urgent", value: "Urgent" },
  { label: "Career", value: "Career" },
  { label: "Sports", value: "Sports" },
];

export function AnnouncementModal({
  isOpen,
  onClose,
  announcement,
  onSuccess,
}: AnnouncementModalProps) {
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("General");
  const [isPublished, setIsPublished] = useState(true);
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [attachmentName, setAttachmentName] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (announcement) {
      setTitle(announcement.title);
      setContent(announcement.content);
      setCategory(announcement.category);
      setIsPublished(announcement.is_published);
      setAttachmentUrl(announcement.attachment_url || "");
      setAttachmentName(announcement.attachment_name || "");
    } else {
      setTitle("");
      setContent("");
      setCategory("General");
      setIsPublished(true);
      setAttachmentUrl("");
      setAttachmentName("");
    }
    setError(null);
  }, [announcement, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const payload = {
      title,
      content,
      category,
      is_published: isPublished,
      attachment_url: attachmentUrl || undefined,
      attachment_name: attachmentName || undefined,
    };

    startTransition(async () => {
      const res = announcement
        ? await updateAnnouncementAction(announcement.id, payload)
        : await createAnnouncementAction(payload);

      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setError(res.error || "Failed to save announcement");
      }
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={announcement ? "Edit Announcement" : "Create New Announcement"}
      description="Publish official campus information to the student body."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800">
            {error}
          </div>
        )}

        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="e.g. Fall Semester Registration Guidelines"
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
                Publish immediately
              </span>
            </label>
          </div>
        </div>

        <Textarea
          label="Announcement Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={5}
          required
          placeholder="Write full announcement details..."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Attachment URL (Optional)"
            value={attachmentUrl}
            onChange={(e) => setAttachmentUrl(e.target.value)}
            placeholder="https://.../document.pdf"
          />

          <Input
            label="Attachment Name (Optional)"
            value={attachmentName}
            onChange={(e) => setAttachmentName(e.target.value)}
            placeholder="e.g. Course Schedule PDF"
          />
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
          <Button variant="outline" size="sm" type="button" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button size="sm" type="submit" isLoading={isPending}>
            {announcement ? "Update Announcement" : "Create Announcement"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
