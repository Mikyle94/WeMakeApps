"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignInPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ---------------------------------------------------------
  // CHECK WHETHER THE USER IS ALREADY SIGNED IN
  // ---------------------------------------------------------

  useEffect(() => {
    let mounted = true;

    async function checkExistingSession() {
      try {
        const supabase = createClient();

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          const message = sessionError.message || "";
          const isExpectedMissingSession =
            message.includes("Auth session missing") ||
            sessionError.name === "AuthSessionMissingError";

          if (!isExpectedMissingSession) {
            console.error("Session check error:", sessionError);
          }
        }

        if (!mounted) {
          return;
        }

        // Already signed in -> go straight to dashboard
        if (session?.user) {
          router.replace("/dashboard");
          return;
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "";
        const isExpectedMissingSession =
          message.includes("Auth session missing") ||
          (err && typeof err === "object" && "name" in err && err.name === "AuthSessionMissingError");

        if (!isExpectedMissingSession) {
          console.error("Session check error:", err);
        }
      } finally {
        if (mounted) {
          setCheckingSession(false);
        }
      }
    }

    checkExistingSession();

    return () => {
      mounted = false;
    };
  }, [router]);

  // ---------------------------------------------------------
  // SIGN IN
  // ---------------------------------------------------------

  async function handleSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      const cleanEmail = email.trim();

      if (!cleanEmail) {
        throw new Error("Please enter your email address.");
      }

      if (!password) {
        throw new Error("Please enter your password.");
      }

      const {
        data,
        error: signInError,
      } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (signInError) {
        throw signInError;
      }

      // -----------------------------------------------------
      // Supabase should return a session after successful login.
      // If there is no session, something else needs attention.
      // -----------------------------------------------------

      if (!data.session || !data.user) {
        throw new Error(
          "Sign in was not completed. Please check your email address and password.",
        );
      }

      // -----------------------------------------------------
      // IMPORTANT:
      // Supabase has now stored the authenticated session in
      // the browser. Send the user to their dashboard.
      // -----------------------------------------------------

      router.replace("/dashboard");
      router.refresh();
    } catch (err) {
      console.error("Sign in error:", err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Could not sign you in. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  // ---------------------------------------------------------
  // WHILE CHECKING SESSION
  // ---------------------------------------------------------

  if (checkingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f7f5] px-6">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900" />

          <p className="text-sm text-zinc-500">
            Checking your session...
          </p>
        </div>
      </main>
    );
  }

  // ---------------------------------------------------------
  // PAGE
  // ---------------------------------------------------------

  return (
    <main className="min-h-screen bg-[#f7f7f5] px-6 py-12 text-zinc-950">
      <div className="mx-auto flex min-h-[80vh] max-w-md items-center justify-center">
        <div className="w-full rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">

          {/* -------------------------------------------------
              LOGO
          -------------------------------------------------- */}

          <Link
            href="/"
            className="inline-block text-lg font-bold tracking-tight"
          >
            We<span className="text-[#5146ff]">Make</span>Apps
          </Link>

          {/* -------------------------------------------------
              HEADING
          -------------------------------------------------- */}

          <div className="mt-10">
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome back
            </h1>

            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Sign in to continue building your apps.
            </p>
          </div>

          {/* -------------------------------------------------
              ERROR
          -------------------------------------------------- */}

          {error && (
            <div
              role="alert"
              className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4"
            >
              <p className="text-sm font-medium leading-6 text-red-700">
                {error}
              </p>
            </div>
          )}

          {/* -------------------------------------------------
              FORM
          -------------------------------------------------- */}

          <form
            onSubmit={handleSignIn}
            className="mt-8 space-y-5"
          >

            {/* EMAIL */}

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-zinc-900"
              >
                Email
              </label>

              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError(null);
                }}
                placeholder="you@example.com"
                required
                disabled={loading}
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 disabled:cursor-not-allowed disabled:bg-zinc-50"
              />
            </div>

            {/* PASSWORD */}

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-zinc-900"
                >
                  Password
                </label>
              </div>

              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError(null);
                }}
                placeholder="Your password"
                required
                disabled={loading}
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 disabled:cursor-not-allowed disabled:bg-zinc-50"
              />
            </div>

            {/* SIGN IN BUTTON */}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-xl bg-zinc-950 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          {/* -------------------------------------------------
              CREATE ACCOUNT
          -------------------------------------------------- */}

          <div className="mt-8 border-t border-zinc-100 pt-6 text-center">
            <p className="text-sm text-zinc-500">
              Don&apos;t have an account?
            </p>

            <Link
              href="/"
              className="mt-2 inline-block text-sm font-semibold text-[#5146ff] transition hover:text-[#4038d9]"
            >
              Start building for free →
            </Link>
          </div>

          {/* -------------------------------------------------
              BACK TO WEBSITE
          -------------------------------------------------- */}

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-xs font-medium text-zinc-400 transition hover:text-zinc-700"
            >
              ← Back to WeMakeApps
            </Link>
          </div>

        </div>
      </div>
    </main>
  );
}