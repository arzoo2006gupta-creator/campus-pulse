"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { Building2, AlertCircle, CheckCircle2 } from "lucide-react";
import { resetPasswordAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ResetPasswordPage() {
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.append("email", email);

    startTransition(async () => {
      const res = await resetPasswordAction(formData);
      if (res.success) {
        setSuccess(true);
      } else {
        setError(res.error || "Failed to send reset link.");
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
          Reset your password
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">
          Enter your registered college email and we will send you a reset link.
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

          {success ? (
            <div className="text-center space-y-4 py-3">
              <div className="mx-auto w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Password Reset Link Dispatched
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                If an account exists with <span className="font-semibold">{email}</span>, you will receive an email with instructions to choose a new password.
              </p>
              <div className="pt-2">
                <Link href="/login">
                  <Button variant="outline" size="sm" className="w-full">
                    Return to Sign In
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="College Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@campus.edu"
                required
                autoComplete="email"
              />

              <Button
                type="submit"
                className="w-full mt-2"
                isLoading={isPending}
                size="md"
              >
                Send Reset Link
              </Button>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <Link
              href="/login"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              &larr; Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
