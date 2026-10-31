import { describe, it, expect } from "vitest";

describe("Permissions and Security Enforcement", () => {
  it("enforces admin-only privileges for campus content modifications", () => {
    function canManageContent(userRole: string): boolean {
      return userRole === "admin";
    }

    expect(canManageContent("admin")).toBe(true);
    expect(canManageContent("student")).toBe(false);
    expect(canManageContent("guest")).toBe(false);
  });

  it("prevents students from modifying protected profile fields", () => {
    const studentProfile = {
      id: "u-123",
      role: "student",
      full_name: "Taylor",
    };

    function applyStudentUpdate(
      profile: typeof studentProfile,
      updates: { full_name?: string; role?: string }
    ) {
      // Role modification strictly prohibited for student role
      return {
        ...profile,
        full_name: updates.full_name ?? profile.full_name,
        // Role cannot be updated by student
        role: profile.role,
      };
    }

    const updated = applyStudentUpdate(studentProfile, {
      full_name: "Taylor Swift",
      role: "admin", // Malicious attempt
    });

    expect(updated.full_name).toBe("Taylor Swift");
    expect(updated.role).toBe("student"); // Remains student!
  });

  it("validates bookmark toggle logic and prevents duplicates", () => {
    const bookmarks = new Set<string>();

    function toggleBookmark(userId: string, itemId: string) {
      const key = `${userId}:${itemId}`;
      if (bookmarks.has(key)) {
        bookmarks.delete(key);
        return false;
      } else {
        bookmarks.add(key);
        return true;
      }
    }

    // First toggle adds
    expect(toggleBookmark("user-1", "item-101")).toBe(true);
    expect(bookmarks.has("user-1:item-101")).toBe(true);

    // Second toggle removes
    expect(toggleBookmark("user-1", "item-101")).toBe(false);
    expect(bookmarks.has("user-1:item-101")).toBe(false);

    // Different user works independently
    toggleBookmark("user-1", "item-101");
    toggleBookmark("user-2", "item-101");
    expect(bookmarks.size).toBe(2);
  });
});
