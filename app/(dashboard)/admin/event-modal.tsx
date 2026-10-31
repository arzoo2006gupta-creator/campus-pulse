"use client";

import React, { useState, useEffect, useTransition } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select } from "@/components/ui/input";
import { Event } from "@/lib/types/database";
import { createEventAction, updateEventAction } from "@/lib/actions/admin";

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event?: Event | null;
  onSuccess: () => void;
}

const CATEGORIES = [
  { label: "General", value: "General" },
  { label: "Academic", value: "Academic" },
  { label: "Workshop", value: "Workshop" },
  { label: "Cultural", value: "Cultural" },
  { label: "Sports", value: "Sports" },
  { label: "Career", value: "Career" },
];

export function EventModal({
  isOpen,
  onClose,
  event,
  onSuccess,
}: EventModalProps) {
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("General");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [venue, setVenue] = useState("");
  const [organizer, setOrganizer] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description);
      setCategory(event.category);
      setStartTime(
        event.start_time ? new Date(event.start_time).toISOString().slice(0, 16) : ""
      );
      setEndTime(
        event.end_time ? new Date(event.end_time).toISOString().slice(0, 16) : ""
      );
      setVenue(event.venue);
      setOrganizer(event.organizer);
      setImageUrl(event.image_url || "");
      setIsPublished(event.is_published);
    } else {
      const now = new Date();
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
      setTitle("");
      setDescription("");
      setCategory("General");
      setStartTime(now.toISOString().slice(0, 16));
      setEndTime(oneHourLater.toISOString().slice(0, 16));
      setVenue("");
      setOrganizer("");
      setImageUrl("");
      setIsPublished(true);
    }
    setError(null);
  }, [event, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const payload = {
      title,
      description,
      category,
      start_time: startTime,
      end_time: endTime,
      venue,
      organizer,
      image_url: imageUrl || undefined,
      is_published: isPublished,
    };

    startTransition(async () => {
      const res = event
        ? await updateEventAction(event.id, payload)
        : await createEventAction(payload);

      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setError(res.error || "Failed to save event");
      }
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={event ? "Edit Event" : "Create New Event"}
      description="Schedule campus workshops, guest lectures, fairs, and activities."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800">
            {error}
          </div>
        )}

        <Input
          label="Event Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="e.g. Annual Tech Career Fair"
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
                Visible to students
              </span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Start Date & Time"
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />

          <Input
            label="End Date & Time"
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Venue / Location"
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            required
            placeholder="e.g. Student Union Ballroom"
          />

          <Input
            label="Organizer"
            value={organizer}
            onChange={(e) => setOrganizer(e.target.value)}
            required
            placeholder="e.g. Career Development Center"
          />
        </div>

        <Input
          label="Banner Image URL (Optional)"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://.../event-cover.jpg"
        />

        <Textarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          required
          placeholder="Write detailed event information, schedule, dress code, RSVP details..."
        />

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
          <Button variant="outline" size="sm" type="button" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button size="sm" type="submit" isLoading={isPending}>
            {event ? "Update Event" : "Create Event"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
