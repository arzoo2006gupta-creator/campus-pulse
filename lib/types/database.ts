export type UserRole = "student" | "admin";

export type AnnouncementCategory =
  | "General"
  | "Academic"
  | "Campus Life"
  | "Urgent"
  | "Career"
  | "Sports";

export type EventCategory =
  | "General"
  | "Academic"
  | "Workshop"
  | "Cultural"
  | "Sports"
  | "Career";

export type CalendarEventType =
  | "Exam"
  | "Holiday"
  | "Deadline"
  | "Activity"
  | "Registration";

export type ResourceCategory =
  | "Academic"
  | "Administrative"
  | "Library"
  | "Campus Support"
  | "Career & Tech"
  | "General";

export type ClubCategory =
  | "Tech & Innovation"
  | "Arts & Culture"
  | "Sports & Fitness"
  | "Academic & Career"
  | "Social & Community"
  | "General";

export interface NotificationPreferences {
  email_announcements: boolean;
  email_events: boolean;
  email_reminders: boolean;
}

export interface Profile {
  id: string;
  full_name: string;
  department: string;
  year: string;
  avatar_url: string | null;
  role: UserRole;
  notification_preferences: NotificationPreferences;
  created_at: string;
  updated_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: AnnouncementCategory;
  author_id: string | null;
  is_published: boolean;
  publish_date: string;
  attachment_url: string | null;
  attachment_name: string | null;
  created_at: string;
  updated_at: string;
  author?: Profile | null;
  is_bookmarked?: boolean;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  start_time: string;
  end_time: string;
  venue: string;
  organizer: string;
  image_url: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  is_bookmarked?: boolean;
}

export interface AcademicCalendarItem {
  id: string;
  title: string;
  description: string | null;
  event_type: CalendarEventType;
  start_date: string;
  end_date: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Resource {
  id: string;
  title: string;
  description: string | null;
  category: ResourceCategory;
  resource_type: "link" | "file";
  link_url: string | null;
  file_url: string | null;
  file_name: string | null;
  file_size_bytes: number | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Club {
  id: string;
  name: string;
  description: string;
  category: ClubCategory;
  contact_email: string | null;
  website_url: string | null;
  logo_url: string | null;
  meeting_info: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface AnnouncementBookmark {
  id: string;
  user_id: string;
  announcement_id: string;
  created_at: string;
  announcement?: Announcement;
}

export interface EventBookmark {
  id: string;
  user_id: string;
  event_id: string;
  created_at: string;
  event?: Event;
}
