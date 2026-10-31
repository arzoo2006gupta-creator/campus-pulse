"use client";

import React, { useState, useEffect, useTransition } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select } from "@/components/ui/input";
import { AcademicCalendarItem } from "@/lib/types/database";
import {
  createCalendarItemAction,
  updateCalendarItemAction,
} from "@/lib/actions/admin";

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  item?: AcademicCalendarItem | null;
  onSuccess: () => void;
}

const EVENT_TYPES = [
  { label: "Exam", value: "Exam" },
  { label: "Holiday", value: "Holiday" },
  { label: "Deadline", value: "Deadline" },
  { label: "Activity", value: "Activity" },
  { label: "Registration", value: "Registration" },
];

export function CalendarModal({
  isOpen,
  onClose,
  item,
  onSuccess,
}: CalendarModalProps) {
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventType, setEventType] = useState("Activity");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setDescription(item.description || "");
      setEventType(item.event_type);
      setStartDate(item.start_date);
      setEndDate(item.end_date);
      setIsPublished(item.is_published);
    } else {
      const today = new Date().toISOString().split("T")[0];
      setTitle("");
      setDescription("");
      setEventType("Activity");
      setStartDate(today);
      setEndDate(today);
      setIsPublished(true);
    }
    setError(null);
  }, [item, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const payload = {
      title,
      description: description || undefined,
      event_type: eventType,
      start_date: startDate,
      end_date: endDate,
      is_published: isPublished,
    };

    startTransition(async () => {
      const res = item
        ? await updateCalendarItemAction(item.id, payload)
        : await createCalendarItemAction(payload);

      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setError(res.error || "Failed to save calendar entry");
      }
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={item ? "Edit Academic Date" : "Add Academic Date"}
      description="Add or edit examination windows, holidays, and academic deadlines."
      maxWidth="md"
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
          placeholder="e.g. Fall Midterm Examination Period"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Date Type"
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
            options={EVENT_TYPES}
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
                Visible to students
              </span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />

          <Input
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </div>

        <Textarea
          label="Description (Optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Additional guidelines, affected departments, or instructions..."
        />

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
          <Button variant="outline" size="sm" type="button" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button size="sm" type="submit" isLoading={isPending}>
            {item ? "Update Date" : "Add Date"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
