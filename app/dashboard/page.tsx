"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Business = {
  name: string;
  tagline: string | null;
};

type AppRow = {
  id: string;
  name: string;
  status: "draft" | "ready" | "live" | "suspended";
  updated_at: string;
  businesses: Business | Business[] | null;
};

export default function DashboardPage() {
  const router = useRouter();

  const [apps, setApps] = useState<AppRow[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  const [error, setError] = useState<string | null>(null);

  /*
   * -----------------------------------------------------------
   * LOAD DASHBOARD
   * -----------------------------------------------------------
   */

  const loadApps = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      /*
       * ---------------------------------------------------------
       * 1. GET CURRENT AUTHENTICATED USER
       * ---------------------------------------------------------
       */

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
          console.error("Authentication error:", sessionError);
        }
      }

      /*
       * ---------------------------------------------------------
       * 2. USER MUST BE LOGGED IN
       *
       * If somebody manually types:
       *
       * http://localhost:3000/dashboard
       *
       * while logged out, send them to the public landing page.
       * ---------------------------------------------------------
       */

      const user = session?.user;

      if (!user) {
        router.replace("/");
        return;
      }

      /*
       * ---------------------------------------------------------
       * 3. SHOW CURRENT USER EMAIL
       * ---------------------------------------------------------
       */

      setUserEmail(user.email ?? null);

      /*
       * ---------------------------------------------------------
       * 4. LOAD THIS USER'S APPS
       *
       * We deliberately DO NOT pass user.id here.
       *
       * Supabase RLS determines which records this authenticated
       * user is allowed to see.
       * ---------------------------------------------------------
       */

      const {
        data,
        error: appsError,
      } = await supabase
        .from("apps")
        .select(
          `
            id,
            name,
            status,
            updated_at,
            businesses (
              name,
              tagline
            )
          `,
        )
        .order("updated_at", {
          ascending: false,
        });

      if (appsError) {
        console.error("Dashboard apps error:", appsError);

        throw new Error(
          appsError.message ||
            "Could not load your saved apps.",
        );
      }

      /*
       * ---------------------------------------------------------
       * 5. SAVE RESULTS
       * ---------------------------------------------------------
       */

      setApps((data ?? []) as AppRow[]);
    } catch (err) {
      console.error("Dashboard load error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Could not load your apps.",
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  /*
   * -----------------------------------------------------------
   * LOAD DASHBOARD WHEN PAGE OPENS
   * -----------------------------------------------------------
   */

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadApps();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadApps]);

  /*
   * -----------------------------------------------------------
   * CONTINUE BUILDING
   * -----------------------------------------------------------
   */

  async function continueBuilding(
  appId: string,
) {
  try {
    const supabase = createClient();

    const {
      data: { session },
      error,
    } =
      await supabase.auth.getSession();

    console.log(
      "[DASHBOARD] Continue building",
      {
        appId,
        hasSession:
          Boolean(session),
        userId:
          session?.user?.id,
      },
    );

    if (error || !session?.access_token) {
      console.error(
        "[DASHBOARD] No valid session",
        error,
      );

      router.replace("/signin");
      return;
    }

    router.push(
      `/builder?appId=${encodeURIComponent(
        appId,
      )}`,
    );
  } catch (error) {
    console.error(
      "[DASHBOARD] Continue building error:",
      error,
    );

    router.replace("/signin");
  }
}

  /*
   * -----------------------------------------------------------
   * CREATE NEW APP
   * -----------------------------------------------------------
   */

  function createNewApp() {
    router.push("/builder");
  }

  /*
   * -----------------------------------------------------------
   * SIGN OUT
   * -----------------------------------------------------------
   *
   * IMPORTANT:
   *
   * Sign out completely destroys the Supabase browser session.
   *
   * Then we return the user to:
   *
   * /
   *
   * which is the public WeMakeApps landing page.
   * -----------------------------------------------------------
   */

  async function signOut() {
    if (signingOut) {
      return;
    }

    setSigningOut(true);
    setError(null);

    try {
      const supabase = createClient();

      const {
        error: signOutError,
      } = await supabase.auth.signOut();

      if (signOutError) {
        throw signOutError;
      }

      /*
       * ---------------------------------------------------------
       * AUTH SESSION IS NOW DESTROYED.
       *
       * Send user to the public landing page.
       * ---------------------------------------------------------
       */

      router.replace("/");
      router.refresh();
    } catch (err) {
      console.error("Sign out error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Could not sign you out.",
      );

      setSigningOut(false);
    }
  }

  /*
   * -----------------------------------------------------------
   * FORMAT DATE
   * -----------------------------------------------------------
   */

  function formatDate(date: string) {
    try {
      return new Intl.DateTimeFormat("en-ZA", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(new Date(date));
    } catch {
      return "Unknown date";
    }
  }

  /*
   * -----------------------------------------------------------
   * STATUS LABEL
   * -----------------------------------------------------------
   */

  function statusLabel(status: AppRow["status"]) {
    switch (status) {
      case "live":
        return "Live";

      case "ready":
        return "Ready";

      case "suspended":
        return "Suspended";

      case "draft":
      default:
        return "Draft";
    }
  }

  /*
   * -----------------------------------------------------------
   * STATUS CLASS
   * -----------------------------------------------------------
   */

  function statusClass(status: AppRow["status"]) {
    switch (status) {
      case "live":
        return "bg-emerald-100 text-emerald-700";

      case "ready":
        return "bg-zinc-200 text-zinc-700";

      case "suspended":
        return "bg-red-100 text-red-700";

      case "draft":
      default:
        return "bg-amber-100 text-amber-700";
    }
  }

  /*
   * -----------------------------------------------------------
   * LOADING SCREEN
   * -----------------------------------------------------------
   */

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f7f5] text-zinc-950">
        <header className="border-b border-zinc-200/70 bg-white">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="text-lg font-bold tracking-tight"
            >
              WeMakeApps
            </button>
          </div>
        </header>

        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="rounded-3xl border border-zinc-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto mb-5 h-9 w-9 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-950" />

            <h1 className="text-lg font-semibold">
              Loading your workspace...
            </h1>

            <p className="mt-2 text-sm text-zinc-500">
              Checking your account and loading your apps.
            </p>
          </div>
        </section>
      </main>
    );
  }

  /*
   * -----------------------------------------------------------
   * MAIN DASHBOARD
   * -----------------------------------------------------------
   */

  return (
    <main className="min-h-screen bg-[#f7f7f5] text-zinc-950">

      {/* =======================================================
          HEADER
      ======================================================= */}

      <header className="border-b border-zinc-200/70 bg-white">
        <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-4 px-6 py-3">

          {/* Logo */}

          <button
            type="button"
            onClick={() => router.push("/")}
            className="text-lg font-bold tracking-tight"
          >
            WeMakeApps
          </button>

          {/* Right side */}

          <div className="flex items-center gap-3">

            {userEmail && (
              <span className="hidden max-w-[260px] truncate text-sm text-zinc-500 lg:block">
                {userEmail}
              </span>
            )}

            {/* Create app */}

            <button
              type="button"
              onClick={createNewApp}
              className="rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800"
            >
              + Create an app
            </button>

            {/* Sign out */}

            <button
              type="button"
              onClick={signOut}
              disabled={signingOut}
              className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 hover:text-zinc-950 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {signingOut
                ? "Signing out..."
                : "Sign out"}
            </button>
          </div>
        </div>
      </header>

      {/* =======================================================
          CONTENT
      ======================================================= */}

      <section className="mx-auto max-w-6xl px-6 py-12">

        {/* Page heading */}

        <div className="mb-10">

          <p className="mb-2 text-sm font-medium text-zinc-500">
            Your workspace
          </p>

          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">

            <div>

              <h1 className="text-4xl font-bold tracking-tight">
                My Apps
              </h1>

              <p className="mt-3 max-w-xl text-zinc-500">
                Pick up where you left off, preview your apps,
                or start something new.
              </p>

            </div>

            {userEmail && (
              <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm shadow-sm">

                <span className="text-zinc-400">
                  Signed in as{" "}
                </span>

                <span className="font-medium text-zinc-800">
                  {userEmail}
                </span>

              </div>
            )}

          </div>
        </div>

        {/* =====================================================
            ERROR
        ====================================================== */}

        {error && (
          <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-5">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <h2 className="font-semibold text-red-700">
                  We couldn&apos;t load your apps
                </h2>

                <p className="mt-1 text-sm text-red-600">
                  {error}
                </p>

              </div>

              <button
                type="button"
                onClick={loadApps}
                className="rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white"
              >
                Try again
              </button>

            </div>
          </div>
        )}

        {/* =====================================================
            NO APPS
        ====================================================== */}

        {!error && apps.length === 0 && (
          <div className="rounded-[2rem] border border-dashed border-zinc-300 bg-white p-14 text-center shadow-sm">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 text-2xl">
              ✦
            </div>

            <h2 className="mt-6 text-xl font-bold">
              Your first app starts here
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
              Create your business profile, add your services,
              customise your app and see it come to life.
            </p>

            <button
              type="button"
              onClick={createNewApp}
              className="mt-7 rounded-xl bg-zinc-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
            >
              Create your first app
            </button>

          </div>
        )}

        {/* =====================================================
            APP GRID
        ====================================================== */}

        {!error && apps.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

            {apps.map((app) => {

              /*
               * Supabase relationship can arrive as either:
               *
               * businesses: {...}
               *
               * or
               *
               * businesses: [{...}]
               */

              const business = Array.isArray(
                app.businesses,
              )
                ? app.businesses[0]
                : app.businesses;

              const displayName =
                business?.name || app.name;

              const tagline =
                business?.tagline ||
                "Your mobile app is waiting to be built.";

              return (
                <article
                  key={app.id}
                  className="group overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                >

                  {/* APP COVER */}

                  <div className="relative h-40 overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-600">

                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_35%)]" />

                    <div className="absolute bottom-5 left-5 right-5">

                      <div className="mb-3">

                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusClass(
                            app.status,
                          )}`}
                        >
                          {statusLabel(app.status)}
                        </span>

                      </div>

                      <h2 className="truncate text-xl font-bold text-white">
                        {displayName}
                      </h2>

                    </div>
                  </div>

                  {/* APP DETAILS */}

                  <div className="p-5">

                    <p className="min-h-10 text-sm leading-5 text-zinc-500">
                      {tagline}
                    </p>

                    {/* Bottom row */}

                    <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-4">

                      <span className="text-xs text-zinc-400">
                        Updated{" "}
                        {formatDate(app.updated_at)}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          continueBuilding(app.id)
                        }
                        className="text-sm font-semibold text-zinc-950 transition group-hover:translate-x-0.5"
                      >
                        Continue building →
                      </button>

                    </div>
                  </div>

                </article>
              );
            })}

          </div>
        )}

      </section>
    </main>
  );
}