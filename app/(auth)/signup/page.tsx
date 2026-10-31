"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, AlertCircle, CheckCircle2 } from "lucide-react";
import { signUpAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";

const ACADEMIC_YEARS = [
  { label: "Freshman (1st Year)", value: "Freshman" },
  { label: "Sophomore (2nd Year)", value: "Sophomore" },
  { label: "Junior (3rd Year)", value: "Junior" },
  { label: "Senior (4th Year)", value: "Senior" },
  { label: "Graduate / Postgrad", value: "Graduate" },
];

const DEPARTMENTS = [
  { label: "Computer Science & Engineering", value: "Computer Science" },
  { label: "Electrical & Computer Engineering", value: "Electrical Engineering" },
  { label: "Mechanical Engineering", value: "Mechanical Engineering" },
  { label: "Business Administration", value: "Business Administration" },
  { label: "Biological Sciences", value: "Biological Sciences" },
  { label: "Mathematics & Statistics", value: "Mathematics" },
  { label: "Humanities & Social Sciences", value: "Humanities" },
  { label: "Undeclared", value: "Undeclared" },
];

export default function SignUpPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [department, setDepartment] = useState("Computer Science");
  const [year, setYear] = useState("Freshman");

  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessInfo(null);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    formData.append("fullName", fullName);
    formData.append("department", department);
    formData.append("year", year);

    startTransition(async () => {
      const res = await signUpAction(formData);
      if (res.success) {
        if (res.data?.needsEmailConfirmation) {
          setSuccessInfo(
            "Account created! Please check your email inbox to verify your account before signing in."
          );
        } else {
          router.push("/");
          router.refresh();
        }
      } else {
        setError(res.error || "Failed to create account. Please try again.");
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-2xl font-bold tracking-tight text-blue-600 mb-2"
        >
          <Building2 className="w-7 h-7" />
          <span>Campus Pulse</span>
        </Link>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Create student account
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">
          Join your campus community to access personalized announcements and bookmarks.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 sm:rounded-2xl sm:px-10">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successInfo ? (
            <div className="space-y-4 text-center py-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Verification Email Sent
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {successInfo}
              </p>
              <div className="pt-2">
                <Link href="/login">
                  <Button variant="outline" size="sm" className="w-full">
                    Proceed to Sign In
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Full Name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Alex Chen"
                required
              />

              <Input
                label="College Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@campus.edu"
                required
                autoComplete="email"
              />

              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                autoComplete="new-password"
                helperText="Minimum 6 characters"
              />

              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  options={DEPARTMENTS}
                />

                <Select
                  label="Academic Year"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  options={ACADEMIC_YEARS}
                />
              </div>

              <Button
                type="submit"
                className="w-full mt-2"
                isLoading={isPending}
                size="md"
              >
                Create Account
              </Button>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-blue-600 hover:text-blue-700"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
