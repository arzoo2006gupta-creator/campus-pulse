import { z } from "zod";

// ================= AUTH SCHEMAS =================
export const signInSchema = z.object({
  email: z.string().email("Please enter a valid college email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signUpSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  department: z.string().min(2, "Please select or enter your department"),
  year: z.string().min(1, "Please select your academic year"),
});

export const resetPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const updatePasswordSchema = z.object({
  password: z.string().min(6, "New password must be at least 6 characters"),
});

// ================= PROFILE SCHEMA =================
// Note: Role is intentionally omitted here to prevent student role escalation!
export const updateProfileSchema = z.object({
  full_name: z.string().min(2, "Full name must be at least 2 characters").max(80),
  department: z.string().min(2, "Department is required").max(100),
  year: z.string().min(1, "Academic year is required").max(50),
  avatar_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  notification_preferences: z.object({
    email_announcements: z.boolean(),
    email_events: z.boolean(),
    email_reminders: z.boolean(),
  }),
});

// ================= ANNOUNCEMENT SCHEMA =================
export const announcementCategoryEnum = z.enum([
  "General",
  "Academic",
  "Campus Life",
  "Urgent",
  "Career",
  "Sports",
]);

export const announcementSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(180),
  content: z.string().min(10, "Content must be at least 10 characters"),
  category: announcementCategoryEnum,
  is_published: z.boolean().default(true),
  attachment_url: z.string().url("Attachment must be a valid URL").optional().or(z.literal("")),
  attachment_name: z.string().optional().or(z.literal("")),
});

// ================= EVENT SCHEMA =================
export const eventCategoryEnum = z.enum([
  "General",
  "Academic",
  "Workshop",
  "Cultural",
  "Sports",
  "Career",
]);

export const eventSchema = z
  .object({
    title: z.string().min(3, "Title must be at least 3 characters").max(180),
    description: z.string().min(10, "Description must be at least 10 characters"),
    category: eventCategoryEnum,
    start_time: z.string().min(1, "Start date and time are required"),
    end_time: z.string().min(1, "End date and time are required"),
    venue: z.string().min(2, "Venue is required").max(120),
    organizer: z.string().min(2, "Organizer is required").max(120),
    image_url: z.string().url("Image must be a valid URL").optional().or(z.literal("")),
    is_published: z.boolean().default(true),
  })
  .refine(
    (data) => {
      const start = new Date(data.start_time).getTime();
      const end = new Date(data.end_time).getTime();
      return isNaN(start) || isNaN(end) || end >= start;
    },
    {
      message: "End time must be after or equal to start time",
      path: ["end_time"],
    }
  );

// ================= ACADEMIC CALENDAR SCHEMA =================
export const calendarEventTypeEnum = z.enum([
  "Exam",
  "Holiday",
  "Deadline",
  "Activity",
  "Registration",
]);

export const academicCalendarSchema = z
  .object({
    title: z.string().min(3, "Title must be at least 3 characters").max(180),
    description: z.string().optional().or(z.literal("")),
    event_type: calendarEventTypeEnum,
    start_date: z.string().min(1, "Start date is required"),
    end_date: z.string().min(1, "End date is required"),
    is_published: z.boolean().default(true),
  })
  .refine(
    (data) => {
      const start = new Date(data.start_date).getTime();
      const end = new Date(data.end_date).getTime();
      return isNaN(start) || isNaN(end) || end >= start;
    },
    {
      message: "End date must be on or after start date",
      path: ["end_date"],
    }
  );

// ================= RESOURCE SCHEMA =================
export const resourceCategoryEnum = z.enum([
  "Academic",
  "Administrative",
  "Library",
  "Campus Support",
  "Career & Tech",
  "General",
]);

export const resourceSchema = z
  .object({
    title: z.string().min(2, "Title is required").max(180),
    description: z.string().optional().or(z.literal("")),
    category: resourceCategoryEnum,
    resource_type: z.enum(["link", "file"]),
    link_url: z.string().url("Please provide a valid web URL").optional().or(z.literal("")),
    file_url: z.string().url("Please provide a valid file URL").optional().or(z.literal("")),
    file_name: z.string().optional().or(z.literal("")),
    file_size_bytes: z.number().optional().nullable(),
    is_published: z.boolean().default(true),
  })
  .refine(
    (data) => {
      if (data.resource_type === "link") {
        return !!data.link_url && data.link_url.length > 0;
      }
      if (data.resource_type === "file") {
        return !!data.file_url && data.file_url.length > 0;
      }
      return true;
    },
    {
      message: "Please provide either a valid link URL or an uploaded file",
      path: ["link_url"],
    }
  );

// ================= CLUB SCHEMA =================
export const clubCategoryEnum = z.enum([
  "Tech & Innovation",
  "Arts & Culture",
  "Sports & Fitness",
  "Academic & Career",
  "Social & Community",
  "General",
]);

export const clubSchema = z.object({
  name: z.string().min(2, "Club name is required").max(120),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: clubCategoryEnum,
  contact_email: z.string().email("Must be a valid email").optional().or(z.literal("")),
  website_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  logo_url: z.string().url("Must be a valid image URL").optional().or(z.literal("")),
  meeting_info: z.string().optional().or(z.literal("")),
  is_published: z.boolean().default(true),
});
