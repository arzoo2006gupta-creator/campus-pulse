"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Megaphone,
  CalendarDays,
  GraduationCap,
  FolderDown,
  Users,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import {
  Announcement,
  Event,
  AcademicCalendarItem,
  Resource,
  Club,
} from "@/lib/types/database";
import { Button } from "@/components/ui/button";
import { Badge, getCategoryBadgeVariant } from "@/components/ui/badge";
import { DeleteConfirmModal } from "@/components/delete-confirm-modal";
import { AnnouncementModal } from "./announcement-modal";
import { EventModal } from "./event-modal";
import { CalendarModal } from "./calendar-modal";
import { ResourceModal } from "./resource-modal";
import { ClubModal } from "./club-modal";
import {
  deleteAnnouncementAction,
  deleteEventAction,
  deleteCalendarItemAction,
  deleteResourceAction,
  deleteClubAction,
} from "@/lib/actions/admin";
import { formatDate } from "@/lib/utils";

interface AdminViewProps {
  initialAnnouncements: Announcement[];
  initialEvents: Event[];
  initialCalendar: AcademicCalendarItem[];
  initialResources: Resource[];
  initialClubs: Club[];
  isConfigured: boolean;
}

type TabType =
  | "announcements"
  | "events"
  | "calendar"
  | "resources"
  | "clubs";

export function AdminView({
  initialAnnouncements,
  initialEvents,
  initialCalendar,
  initialResources,
  initialClubs,
  isConfigured,
}: AdminViewProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("announcements");

  // Modals state
  const [announcementModalOpen, setAnnouncementModalOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const [calendarModalOpen, setCalendarModalOpen] = useState(false);
  const [selectedCalendar, setSelectedCalendar] = useState<AcademicCalendarItem | null>(null);

  const [resourceModalOpen, setResourceModalOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

  const [clubModalOpen, setClubModalOpen] = useState(false);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);

  // Deletion state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    id: string;
    title: string;
    type: string;
    action: () => Promise<void>;
  } | null>(null);

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleRefresh = () => {
    router.refresh();
    setFeedback({
      type: "success",
      message: "Database updated successfully.",
    });
    setTimeout(() => setFeedback(null), 4000);
  };

  const confirmDelete = (
    id: string,
    title: string,
    type: string,
    action: () => Promise<any>
  ) => {
    setItemToDelete({
      id,
      title,
      type,
      action: async () => {
        const res = await action();
        if (res.success) {
          handleRefresh();
        } else {
          setFeedback({
            type: "error",
            message: res.error || `Failed to delete ${type}.`,
          });
        }
      },
    });
    setDeleteModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Feedback banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs sm:text-sm flex items-center gap-2.5 border ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div
          onClick={() => setActiveTab("announcements")}
          className={`p-4 rounded-xl border bg-white shadow-sm cursor-pointer transition-all ${
            activeTab === "announcements"
              ? "ring-2 ring-blue-500 border-transparent"
              : "hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between text-blue-600 mb-2">
            <Megaphone className="w-4 h-4" />
            <span className="text-xl font-bold text-slate-900">
              {initialAnnouncements.length}
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-600">Announcements</p>
        </div>

        <div
          onClick={() => setActiveTab("events")}
          className={`p-4 rounded-xl border bg-white shadow-sm cursor-pointer transition-all ${
            activeTab === "events"
              ? "ring-2 ring-blue-500 border-transparent"
              : "hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <CalendarDays className="w-4 h-4" />
            <span className="text-xl font-bold text-slate-900">
              {initialEvents.length}
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-600">Events</p>
        </div>

        <div
          onClick={() => setActiveTab("calendar")}
          className={`p-4 rounded-xl border bg-white shadow-sm cursor-pointer transition-all ${
            activeTab === "calendar"
              ? "ring-2 ring-blue-500 border-transparent"
              : "hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between text-indigo-600 mb-2">
            <GraduationCap className="w-4 h-4" />
            <span className="text-xl font-bold text-slate-900">
              {initialCalendar.length}
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-600">Academic Dates</p>
        </div>

        <div
          onClick={() => setActiveTab("resources")}
          className={`p-4 rounded-xl border bg-white shadow-sm cursor-pointer transition-all ${
            activeTab === "resources"
              ? "ring-2 ring-blue-500 border-transparent"
              : "hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <FolderDown className="w-4 h-4" />
            <span className="text-xl font-bold text-slate-900">
              {initialResources.length}
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-600">Resources</p>
        </div>

        <div
          onClick={() => setActiveTab("clubs")}
          className={`p-4 rounded-xl border bg-white shadow-sm cursor-pointer transition-all ${
            activeTab === "clubs"
              ? "ring-2 ring-blue-500 border-transparent"
              : "hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between text-purple-600 mb-2">
            <Users className="w-4 h-4" />
            <span className="text-xl font-bold text-slate-900">
              {initialClubs.length}
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-600">Clubs</p>
        </div>
      </div>

      {/* Main Management Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Controls Bar */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Sub Navigation */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("announcements")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === "announcements"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Announcements
            </button>
            <button
              onClick={() => setActiveTab("events")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === "events"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Events
            </button>
            <button
              onClick={() => setActiveTab("calendar")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === "calendar"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Calendar
            </button>
            <button
              onClick={() => setActiveTab("resources")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === "resources"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Resources
            </button>
            <button
              onClick={() => setActiveTab("clubs")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === "clubs"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Clubs
            </button>
          </div>

          {/* Action Button */}
          <div>
            {activeTab === "announcements" && (
              <Button
                size="sm"
                onClick={() => {
                  setSelectedAnnouncement(null);
                  setAnnouncementModalOpen(true);
                }}
              >
                <Plus className="w-4 h-4" />
                <span>New Announcement</span>
              </Button>
            )}
            {activeTab === "events" && (
              <Button
                size="sm"
                onClick={() => {
                  setSelectedEvent(null);
                  setEventModalOpen(true);
                }}
              >
                <Plus className="w-4 h-4" />
                <span>New Event</span>
              </Button>
            )}
            {activeTab === "calendar" && (
              <Button
                size="sm"
                onClick={() => {
                  setSelectedCalendar(null);
                  setCalendarModalOpen(true);
                }}
              >
                <Plus className="w-4 h-4" />
                <span>Add Academic Date</span>
              </Button>
            )}
            {activeTab === "resources" && (
              <Button
                size="sm"
                onClick={() => {
                  setSelectedResource(null);
                  setResourceModalOpen(true);
                }}
              >
                <Plus className="w-4 h-4" />
                <span>Add Resource</span>
              </Button>
            )}
            {activeTab === "clubs" && (
              <Button
                size="sm"
                onClick={() => {
                  setSelectedClub(null);
                  setClubModalOpen(true);
                }}
              >
                <Plus className="w-4 h-4" />
                <span>Register Club</span>
              </Button>
            )}
          </div>
        </div>

        {/* 1. ANNOUNCEMENTS TAB TABLE */}
        {activeTab === "announcements" && (
          <div className="overflow-x-auto">
            {initialAnnouncements.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No announcements created yet. Click &quot;New Announcement&quot; above to add one.
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Title</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {initialAnnouncements.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900 max-w-xs truncate">
                        {item.title}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={getCategoryBadgeVariant(item.category)}>
                          {item.category}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${
                            item.is_published
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {item.is_published ? (
                            <>
                              <Eye className="w-3 h-3" /> Published
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3" /> Draft
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {formatDate(item.publish_date)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedAnnouncement(item);
                              setAnnouncementModalOpen(true);
                            }}
                            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 hover:text-blue-600"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              confirmDelete(
                                item.id,
                                item.title,
                                "announcement",
                                () => deleteAnnouncementAction(item.id)
                              )
                            }
                            className="p-1.5 rounded-md hover:bg-rose-50 text-slate-400 hover:text-rose-600"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* 2. EVENTS TAB TABLE */}
        {activeTab === "events" && (
          <div className="overflow-x-auto">
            {initialEvents.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No events scheduled yet. Click &quot;New Event&quot; above to create one.
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Event</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">Venue</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {initialEvents.map((evt) => (
                    <tr key={evt.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900 max-w-xs truncate">
                        {evt.title}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={getCategoryBadgeVariant(evt.category)}>
                          {evt.category}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {formatDate(evt.start_time)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-[140px] truncate">
                        {evt.venue}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedEvent(evt);
                              setEventModalOpen(true);
                            }}
                            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 hover:text-blue-600"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              confirmDelete(evt.id, evt.title, "event", () =>
                                deleteEventAction(evt.id)
                              )
                            }
                            className="p-1.5 rounded-md hover:bg-rose-50 text-slate-400 hover:text-rose-600"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* 3. CALENDAR TAB TABLE */}
        {activeTab === "calendar" && (
          <div className="overflow-x-auto">
            {initialCalendar.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No calendar entries yet. Click &quot;Add Academic Date&quot; to register exams or holidays.
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Title</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Date Range</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {initialCalendar.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900 max-w-xs truncate">
                        {item.title}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={getCategoryBadgeVariant(item.event_type)}>
                          {item.event_type}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {formatDate(item.start_date)}
                        {item.start_date !== item.end_date && ` – ${formatDate(item.end_date)}`}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedCalendar(item);
                              setCalendarModalOpen(true);
                            }}
                            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 hover:text-blue-600"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              confirmDelete(item.id, item.title, "calendar date", () =>
                                deleteCalendarItemAction(item.id)
                              )
                            }
                            className="p-1.5 rounded-md hover:bg-rose-50 text-slate-400 hover:text-rose-600"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* 4. RESOURCES TAB TABLE */}
        {activeTab === "resources" && (
          <div className="overflow-x-auto">
            {initialResources.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No resources recorded yet. Click &quot;Add Resource&quot; to register portals or guides.
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Title</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Link / File</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {initialResources.map((res) => (
                    <tr key={res.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900 max-w-xs truncate">
                        {res.title}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={getCategoryBadgeVariant(res.category)}>
                          {res.category}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 uppercase text-[10px] font-bold">
                        {res.resource_type}
                      </td>
                      <td className="py-3.5 px-4 max-w-[150px] truncate text-blue-600">
                        <a
                          href={res.link_url || res.file_url || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline flex items-center gap-1"
                        >
                          <span className="truncate">{res.link_url || res.file_name || "Open"}</span>
                          <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        </a>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedResource(res);
                              setResourceModalOpen(true);
                            }}
                            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 hover:text-blue-600"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              confirmDelete(res.id, res.title, "resource", () =>
                                deleteResourceAction(res.id)
                              )
                            }
                            className="p-1.5 rounded-md hover:bg-rose-50 text-slate-400 hover:text-rose-600"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* 5. CLUBS TAB TABLE */}
        {activeTab === "clubs" && (
          <div className="overflow-x-auto">
            {initialClubs.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No student clubs registered yet. Click &quot;Register Club&quot; above to list one.
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Club Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {initialClubs.map((club) => (
                    <tr key={club.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900 max-w-xs truncate">
                        {club.name}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={getCategoryBadgeVariant(club.category)}>
                          {club.category}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 truncate max-w-[140px]">
                        {club.contact_email || "—"}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedClub(club);
                              setClubModalOpen(true);
                            }}
                            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 hover:text-blue-600"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              confirmDelete(club.id, club.name, "club", () =>
                                deleteClubAction(club.id)
                              )
                            }
                            className="p-1.5 rounded-md hover:bg-rose-50 text-slate-400 hover:text-rose-600"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* MODALS */}
      <AnnouncementModal
        isOpen={announcementModalOpen}
        onClose={() => setAnnouncementModalOpen(false)}
        announcement={selectedAnnouncement}
        onSuccess={handleRefresh}
      />

      <EventModal
        isOpen={eventModalOpen}
        onClose={() => setEventModalOpen(false)}
        event={selectedEvent}
        onSuccess={handleRefresh}
      />

      <CalendarModal
        isOpen={calendarModalOpen}
        onClose={() => setCalendarModalOpen(false)}
        item={selectedCalendar}
        onSuccess={handleRefresh}
      />

      <ResourceModal
        isOpen={resourceModalOpen}
        onClose={() => setResourceModalOpen(false)}
        resource={selectedResource}
        onSuccess={handleRefresh}
      />

      <ClubModal
        isOpen={clubModalOpen}
        onClose={() => setClubModalOpen(false)}
        club={selectedClub}
        onSuccess={handleRefresh}
      />

      {itemToDelete && (
        <DeleteConfirmModal
          isOpen={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setItemToDelete(null);
          }}
          onConfirm={itemToDelete.action}
          title={`Delete ${itemToDelete.type}`}
          itemTitle={itemToDelete.title}
          itemType={itemToDelete.type}
        />
      )}
    </div>
  );
}
