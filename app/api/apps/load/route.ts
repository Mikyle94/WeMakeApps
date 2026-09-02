import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const accessToken = authHeader?.startsWith("Bearer ")
      ? authHeader.replace("Bearer ", "").trim()
      : null;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: "Supabase environment variables are missing." },
        { status: 500 },
      );
    }

    if (!accessToken) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 },
      );
    }

    if (!serviceRoleKey) {
      console.error("[API][APPS/LOAD] SUPABASE_SERVICE_ROLE_KEY is missing.");
      return NextResponse.json(
        { error: "Server database configuration is incomplete. Add SUPABASE_SERVICE_ROLE_KEY to .env.local." },
        { status: 500 },
      );
    }

    const appId = request.nextUrl.searchParams.get("appId");

    console.log("[API][APPS/LOAD] Request", {
      appId,
      hasAuthorization: Boolean(accessToken),
    });

    if (!appId) {
      return NextResponse.json(
        { error: "Missing appId." },
        { status: 400 },
      );
    }

    const supabase = createSupabaseClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      },
    );

    const { data: { user }, error: userError } =
      await authSupabase.auth.getUser();

    console.log("[API][APPS/LOAD] Auth", {
      userId: user?.id ?? null,
      hasUser: Boolean(user),
      error: userError?.message ?? null,
    });

    if (userError || !user) {
      return NextResponse.json(
        { error: "Your session is invalid. Please sign in again." },
        { status: 401 },
      );
    }

    // Authentication is verified with the bearer token above. Use the server-only service-role client for reads so RLS policies cannot hide an otherwise owned app.
    const supabase = createSupabaseClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      },
    );

    const { data: app, error: appError } = await supabase
      .from("apps")
      .select("id, business_id, name, status, theme, navigation, features, settings")
      .eq("id", appId)
      .maybeSingle();

    if (appError) {
      console.error("Load app error:", appError);
      return NextResponse.json(
        { error: "Could not load your saved app." },
        { status: 500 },
      );
    }

    if (!app) {
      console.warn("[API][APPS/LOAD] App not found or hidden by RLS", { appId, userId: user.id });
      return NextResponse.json(
        { error: "Saved app not found." },
        { status: 404 },
      );
    }

    console.log("[API][APPS/LOAD] App row", {
      appId: app.id,
      businessId: app.business_id,
      name: app.name,
    });

    const { data: business, error: businessError } = await supabase
      .from("businesses")
      .select("id, name, tagline, description, phone, whatsapp, email, address_line_1, address_line_2, city, province, postal_code, country, opening_hours")
      .eq("id", app.business_id)
      .eq("owner_id", user.id)
      .maybeSingle();

    if (businessError) {
      console.error("Load business error:", businessError);
      return NextResponse.json(
        { error: "Could not load your business information." },
        { status: 500 },
      );
    }

    if (!business) {
      console.warn("[API][APPS/LOAD] Ownership check failed", {
        appId,
        businessId: app.business_id,
        userId: user.id,
      });
      return NextResponse.json(
        { error: "You do not have access to this app." },
        { status: 403 },
      );
    }

    const [pagesResult, servicesResult, mediaResult] = await Promise.all([
      supabase
        .from("app_pages")
        .select("id, slug, title, type, sort_order, is_enabled, sections")
        .eq("app_id", appId)
        .order("sort_order", { ascending: true }),
      supabase
        .from("app_services")
        .select("id, name, description, price, currency, image_url, sort_order, is_enabled")
        .eq("app_id", appId)
        .order("sort_order", { ascending: true }),
      supabase
        .from("app_media")
        .select("id, type, file_path, file_name, alt_text, sort_order")
        .eq("app_id", appId)
        .order("sort_order", { ascending: true }),
    ]);

    if (pagesResult.error || servicesResult.error || mediaResult.error) {
      console.error("[API][APPS/LOAD] Child data error:", {
        pages: pagesResult.error,
        services: servicesResult.error,
        media: mediaResult.error,
      });

      return NextResponse.json(
        { error: "Could not load all of your saved app data." },
        { status: 500 },
      );
    }

    const responseBody = {
      app,
      business,
      pages: pagesResult.data ?? [],
      services: servicesResult.data ?? [],
      media: mediaResult.data ?? [],
    };

    console.log("[API][APPS/LOAD] Success", {
      appId,
      userId: user.id,
      businessName: business.name,
      pages: responseBody.pages.length,
      services: responseBody.services.length,
      media: responseBody.media.length,
    });

    return NextResponse.json(responseBody);
  } catch (error) {
    console.error("Unexpected load app error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not load your saved app.",
      },
      { status: 500 },
    );
  }
}
