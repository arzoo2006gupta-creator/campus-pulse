import { describe, it, expect } from "vitest";
import {
  signInSchema,
  signUpSchema,
  updateProfileSchema,
  announcementSchema,
  eventSchema,
  academicCalendarSchema,
  resourceSchema,
  clubSchema,
} from "@/lib/validations/schemas";

describe("Input Validation & Security Schemas", () => {
  describe("Authentication Schemas", () => {
    it("validates valid sign in credentials", () => {
      const result = signInSchema.safeParse({
        email: "alex@campus.edu",
        password: "secretpassword123",
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid email formats", () => {
      const result = signInSchema.safeParse({
        email: "not-an-email",
        password: "secretpassword123",
      });
      expect(result.success).toBe(false);
    });

    it("rejects passwords under 6 characters", () => {
      const result = signInSchema.safeParse({
        email: "alex@campus.edu",
        password: "123",
      });
      expect(result.success).toBe(false);
    });

    it("validates student registration payload", () => {
      const result = signUpSchema.safeParse({
        email: "jordan@campus.edu",
        password: "mypassword123",
        fullName: "Jordan Lee",
        department: "Computer Science",
        year: "Freshman",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("Profile Schema & Role Escalation Prevention", () => {
    it("accepts valid student profile updates", () => {
      const payload = {
        full_name: "Morgan Smith",
        department: "Mechanical Engineering",
        year: "Senior",
        avatar_url: "https://campus.edu/avatars/morgan.jpg",
        notification_preferences: {
          email_announcements: true,
          email_events: false,
          email_reminders: true,
        },
      };
      const result = updateProfileSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it("strips or ignores any role property attempting role escalation", () => {
      const maliciousPayload = {
        full_name: "Morgan Smith",
        department: "Mechanical Engineering",
        year: "Senior",
        avatar_url: "",
        notification_preferences: {
          email_announcements: true,
          email_events: false,
          email_reminders: false,
        },
        role: "admin", // Malicious attempt to escalate role
      };
      const result = updateProfileSchema.safeParse(maliciousPayload);
      expect(result.success).toBe(true);
      if (result.success) {
        // The parsed object must not carry role!
        expect((result.data as any).role).toBeUndefined();
      }
    });
  });

  describe("Announcement Schema", () => {
    it("accepts valid announcement", () => {
      const result = announcementSchema.safeParse({
        title: "Campus Library Extended Hours",
        content: "The main library will be open 24/7 during final exam week.",
        category: "Campus Life",
        is_published: true,
      });
      expect(result.success).toBe(true);
    });

    it("rejects announcements with titles under 3 characters", () => {
      const result = announcementSchema.safeParse({
        title: "Hi",
        content: "Content that is sufficiently long for the test.",
        category: "Campus Life",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("Event Schema & Temporal Logic", () => {
    it("accepts an event with end time after start time", () => {
      const result = eventSchema.safeParse({
        title: "Robotics Exhibition 2026",
        description: "Annual robotics display and live battle bot demonstrations.",
        category: "Workshop",
        start_time: "2026-11-15T10:00:00.000Z",
        end_time: "2026-11-15T16:00:00.000Z",
        venue: "Engineering Atrium",
        organizer: "Robotics Club",
        is_published: true,
      });
      expect(result.success).toBe(true);
    });

    it("rejects an event where end time is before start time", () => {
      const result = eventSchema.safeParse({
        title: "Invalid Event Time",
        description: "This event has backwards timestamps.",
        category: "Workshop",
        start_time: "2026-11-15T16:00:00.000Z",
        end_time: "2026-11-15T10:00:00.000Z", // Earlier than start time!
        venue: "Room 101",
        organizer: "CS Dept",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain(
          "End time must be after or equal to start time"
        );
      }
    });
  });

  describe("Academic Calendar Schema", () => {
    it("accepts valid calendar entry with end date >= start date", () => {
      const result = academicCalendarSchema.safeParse({
        title: "Spring Term Final Exams",
        description: "Official examination schedule",
        event_type: "Exam",
        start_date: "2026-12-10",
        end_date: "2026-12-18",
        is_published: true,
      });
      expect(result.success).toBe(true);
    });

    it("rejects calendar entry where end date precedes start date", () => {
      const result = academicCalendarSchema.safeParse({
        title: "Spring Break",
        event_type: "Holiday",
        start_date: "2026-04-10",
        end_date: "2026-04-05", // Precedes start date!
        is_published: true,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("Resource Schema", () => {
    it("accepts web link resource with valid URL", () => {
      const result = resourceSchema.safeParse({
        title: "Student Health Portal",
        description: "Book appointments online",
        category: "Campus Support",
        resource_type: "link",
        link_url: "https://health.campus.edu",
        is_published: true,
      });
      expect(result.success).toBe(true);
    });

    it("rejects link resource without URL", () => {
      const result = resourceSchema.safeParse({
        title: "Student Health Portal",
        category: "Campus Support",
        resource_type: "link",
        link_url: "",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("Club Schema", () => {
    it("accepts valid club listing", () => {
      const result = clubSchema.safeParse({
        name: "Debate & Forensics Union",
        description: "Competitive collegiate debate and public speaking team.",
        category: "Academic & Career",
        contact_email: "debate@campus.edu",
        website_url: "https://debate.campus.edu",
        meeting_info: "Wednesdays 6:00 PM in Hall 102",
        is_published: true,
      });
      expect(result.success).toBe(true);
    });
  });
});
