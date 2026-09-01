import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/lib/database.types";

type SavePayload = {
  appId?: string | null;
  app: {
    name: string;
    primaryColor: string;
  };
  business: {
    name: string;
    description: string;
    phone: string;
    whatsapp: string;
    email: string;
    address: string;
  };
  contactSettings: {
    showPhone: boolean;
    showWhatsapp: boolean;
    showEmail: boolean;
    showAddress: boolean;
    showHours: boolean;
    hours: string;
  };
  pages: {
    id: string;
    name: string;
    description: string;
    icon: string;
    enabled: boolean;
    system?: boolean;
  }[];
  services: {
    id: string;
    name: string;
    description: string;
    price: string;
    enabled: boolean;
  }[];
  gallery: {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    enabled: boolean;
  }[];
};

function parsePrice(value: string) {
  if (!value.trim()) {
    return null;
  }

  const normalized = value.replace(/[^0-9.-]/g, "");

  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);

  if (!Number.isFinite(parsed)) {
    return null;
  }

  return parsed;
}

function appStatusFromPayload(payload: SavePayload) {
  const hasBusinessCore =
    payload.business.name.trim().length > 0 &&
    payload.business.description.trim().length > 0;

  const hasContact =
    payload.business.phone.trim().length > 0 ||
    payload.business.whatsapp.trim().length > 0 ||
    payload.business.email.trim().length > 0 ||
    payload.business.address.trim().length > 0;

  return hasBusinessCore && hasContact ? "ready" : "draft";
}

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 },
    );
  }

  const accessToken = authHeader.replace("Bearer ", "").trim();

  if (!accessToken) {
    return NextResponse.json(
      { error: "Authentication token is missing." },
      { status: 401 },
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      { error: "Supabase environment variables are missing." },
      { status: 500 },
    );
  }

  let payload: SavePayload;

  try {
    payload = (await request.json()) as SavePayload;
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  if (!payload.business?.name?.trim()) {
    return NextResponse.json(
      { error: "Business name is required." },
      { status: 400 },
    );
  }

  if (!payload.business?.description?.trim()) {
    return NextResponse.json(
      { error: "Business description is required." },
      { status: 400 },
    );
  }

  const hasContact =
    payload.business.phone.trim() ||
    payload.business.whatsapp.trim() ||
    payload.business.email.trim() ||
    payload.business.address.trim();

  if (!hasContact) {
    return NextResponse.json(
      { error: "At least one contact method is required." },
      { status: 400 },
    );
  }

  const supabase = createSupabaseClient<Database>(
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

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  console.log("[API][APPS/SAVE] Auth", {
    userId: user?.id ?? null,
    hasUser: Boolean(user),
    error: userError?.message ?? null,
    requestedAppId: payload.appId ?? null,
    businessName: payload.business?.name ?? null,
  });

  if (userError || !user) {
    return NextResponse.json(
      { error: "Your session is invalid. Please sign in again." },
      { status: 401 },
    );
  }

  const { error: profileError } = await supabase
  .from("profiles")
  .upsert(
    {
      id: user.id,
    },
    {
      onConflict: "id",
    },
  );

if (profileError) {
  console.error("Profile save error:", profileError);

  return NextResponse.json(
    {
      error: `Could not create your profile: ${profileError.message}`,
    },
    { status: 500 },
  );
}

  console.log("[API][APPS/SAVE] Payload", {
    appId: payload.appId ?? null,
    pages: payload.pages.length,
    services: payload.services.length,
    gallery: payload.gallery.length,
  });

  const appStatus = appStatusFromPayload(payload);

  const appTheme: Json = {
    primaryColor: payload.app.primaryColor,
  };

  const appNavigation: Json = payload.pages.map((page, index) => ({
    id: page.id,
    title: page.name,
    slug: page.id,
    icon: page.icon,
    sortOrder: index,
    enabled: page.enabled,
  }));

  const appFeatures: Json = {
    hasServices: payload.services.some((service) => service.enabled),
    hasGallery: payload.gallery.some((item) => item.enabled),
  };

  const appSettings: Json = {
    contact: payload.contactSettings,
  };

  let businessId: string;
  let appId: string;

  if (payload.appId) {
    const { data: existingApp, error: existingAppError } = await supabase
      .from("apps")
      .select("id, business_id")
      .eq("id", payload.appId)
      .maybeSingle();

    if (existingAppError) {
      return NextResponse.json(
        { error: "Could not load your saved app." },
        { status: 500 },
      );
    }

    if (!existingApp) {
      return NextResponse.json(
        { error: "Saved app not found." },
        { status: 404 },
      );
    }

    const { data: ownedBusiness, error: ownedBusinessError } = await supabase
      .from("businesses")
      .select("id")
      .eq("id", existingApp.business_id)
      .eq("owner_id", user.id)
      .maybeSingle();

    if (ownedBusinessError || !ownedBusiness) {
      return NextResponse.json(
        { error: "You do not have access to this app." },
        { status: 403 },
      );
    }

    businessId = ownedBusiness.id;
    appId = existingApp.id;

    const { error: updateBusinessError } = await supabase
      .from("businesses")
      .update({
        name: payload.business.name,
        description: payload.business.description || null,
        phone: payload.business.phone || null,
        whatsapp: payload.business.whatsapp || null,
        email: payload.business.email || null,
        address_line_1: payload.business.address || null,
        opening_hours:
          payload.contactSettings.showHours && payload.contactSettings.hours
            ? ({ display: payload.contactSettings.hours } as Json)
            : ({} as Json),
      })
      .eq("id", businessId);

    if (updateBusinessError) {
      return NextResponse.json(
        { error: "Could not update business information." },
        { status: 500 },
      );
    }

    const { error: updateAppError } = await supabase
      .from("apps")
      .update({
        name: payload.app.name,
        status: appStatus,
        theme: appTheme,
        navigation: appNavigation,
        features: appFeatures,
        settings: appSettings,
      })
      .eq("id", appId);

    if (updateAppError) {
      return NextResponse.json(
        { error: "Could not update app settings." },
        { status: 500 },
      );
    }
  } else {
    const { data: newBusiness, error: newBusinessError } = await supabase
      .from("businesses")
      .insert({
        owner_id: user.id,
        name: payload.business.name,
        description: payload.business.description || null,
        phone: payload.business.phone || null,
        whatsapp: payload.business.whatsapp || null,
        email: payload.business.email || null,
        address_line_1: payload.business.address || null,
        opening_hours:
          payload.contactSettings.showHours && payload.contactSettings.hours
            ? ({ display: payload.contactSettings.hours } as Json)
            : ({} as Json),
      })
      .select("id")
      .single();

if (newBusinessError || !newBusiness) {
  console.error("Business save error:", newBusinessError);

  return NextResponse.json(
    {
      error:
        newBusinessError?.message ||
        "Could not create business record.",
    },
    { status: 500 },
  );
}

    businessId = newBusiness.id;

    const { data: newApp, error: newAppError } = await supabase
      .from("apps")
      .insert({
        business_id: businessId,
        name: payload.app.name,
        status: appStatus,
        theme: appTheme,
        navigation: appNavigation,
        features: appFeatures,
        settings: appSettings,
      })
      .select("id")
      .single();

    if (newAppError || !newApp) {
      return NextResponse.json(
        { error: "Could not create app record." },
        { status: 500 },
      );
    }

    appId = newApp.id;
  }

  const { error: deletePagesError } = await supabase
    .from("app_pages")
    .delete()
    .eq("app_id", appId);

  if (deletePagesError) {
    return NextResponse.json(
      { error: "Could not update app pages." },
      { status: 500 },
    );
  }

  const pagesToInsert = payload.pages.map((page, index) => ({
    app_id: appId,
    slug: page.id,
    title: page.name,
    type: page.system ? "system" : "custom",
    sort_order: index,
    is_enabled: page.enabled,
    sections: {
      description: page.description,
      icon: page.icon,
      system: !!page.system,
    } as Json,
  }));

  if (pagesToInsert.length > 0) {
    const { error: insertPagesError } = await supabase
      .from("app_pages")
      .insert(pagesToInsert);

    if (insertPagesError) {
      return NextResponse.json(
        { error: "Could not save app pages." },
        { status: 500 },
      );
    }
  }

  const { error: deleteServicesError } = await supabase
    .from("app_services")
    .delete()
    .eq("app_id", appId);

  if (deleteServicesError) {
    return NextResponse.json(
      { error: "Could not update app services." },
      { status: 500 },
    );
  }

  const servicesToInsert = payload.services.map((service, index) => ({
    app_id: appId,
    name: service.name,
    description: service.description || null,
    price: parsePrice(service.price),
    currency: "ZAR",
    image_url: null,
    sort_order: index,
    is_enabled: service.enabled,
  }));

  if (servicesToInsert.length > 0) {
    const { error: insertServicesError } = await supabase
      .from("app_services")
      .insert(servicesToInsert);

    if (insertServicesError) {
      return NextResponse.json(
        { error: "Could not save app services." },
        { status: 500 },
      );
    }
  }

  const { error: deleteMediaError } = await supabase
    .from("app_media")
    .delete()
    .eq("app_id", appId);

  if (deleteMediaError) {
    return NextResponse.json(
      { error: "Could not update app media." },
      { status: 500 },
    );
  }

  const mediaToInsert = payload.gallery
    .filter((item) => item.imageUrl.trim().length > 0)
    .map((item, index) => ({
      app_id: appId,
      type: "gallery",
      file_path: item.imageUrl,
      file_name: item.title || null,
      alt_text: item.description || item.title || null,
      sort_order: index,
    }));

  if (mediaToInsert.length > 0) {
    const { error: insertMediaError } = await supabase
      .from("app_media")
      .insert(mediaToInsert);

    if (insertMediaError) {
      return NextResponse.json(
        { error: "Could not save app gallery." },
        { status: 500 },
      );
    }
  }

  const responseBody = {
    appId,
    businessId,
    status: appStatus,
    message: "Your app has been saved.",
  };

  console.log("[API][APPS/SAVE] Success", {
    ...responseBody,
    userId: user.id,
  });

  return NextResponse.json(responseBody);
}
