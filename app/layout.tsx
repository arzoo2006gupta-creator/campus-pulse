import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Campus Pulse | Student Dashboard & Campus Life",
  description:
    "Student-focused campus dashboard for announcements, events, academic calendar, resources, and clubs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-slate-50">
      <body className="h-full antialiased font-sans">{children}</body>
    </html>
  );
}
