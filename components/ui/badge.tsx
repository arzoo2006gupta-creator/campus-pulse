import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "primary"
    | "academic"
    | "career"
    | "campus"
    | "urgent"
    | "sports"
    | "cultural"
    | "warning"
    | "success"
    | "muted";
}

export function Badge({
  className,
  variant = "default",
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    default: "bg-slate-100 text-slate-700 border-slate-200",
    primary: "bg-blue-50 text-blue-700 border-blue-200",
    academic: "bg-indigo-50 text-indigo-700 border-indigo-200",
    career: "bg-emerald-50 text-emerald-700 border-emerald-200",
    campus: "bg-purple-50 text-purple-700 border-purple-200",
    urgent: "bg-rose-50 text-rose-700 border-rose-200",
    sports: "bg-amber-50 text-amber-700 border-amber-200",
    cultural: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
    warning: "bg-amber-50 text-amber-800 border-amber-300",
    success: "bg-teal-50 text-teal-700 border-teal-200",
    muted: "bg-slate-100 text-slate-500 border-slate-200",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border transition-colors",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function getCategoryBadgeVariant(category: string): BadgeProps["variant"] {
  switch (category) {
    case "Academic":
      return "academic";
    case "Career":
    case "Career & Tech":
      return "career";
    case "Urgent":
    case "Exam":
    case "Deadline":
      return "urgent";
    case "Sports":
    case "Sports & Fitness":
      return "sports";
    case "Cultural":
    case "Arts & Culture":
      return "cultural";
    case "Campus Life":
    case "Social & Community":
      return "campus";
    case "Holiday":
      return "success";
    default:
      return "primary";
  }
}
