import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/lib/database.types";

type SavePayload = {
  /**
   * Existing saved app being edited.
   *
   * IMPORTANT:
   * This must NOT be supplied when saving a brand-new anonymous
   * builder session after the user signs in.
   */
  appId?: string | null;

  /**
   * Explicitly tells the API that this is a brand-new app.
   *
   * This takes priority over appId.
   */
  createNew?: boolean;

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
  if (!value?.trim()) {
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
  try {
    /*
     * ------------------------------------------------------------
     * 1. AUTHENTICATION
     * ------------------------------------------------------------
     */

    const authHeader = request.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      console.error("[API][APPS/SAVE] Missing Authorization header");

      return NextResponse.json(
        {
          error: "Authentication required.",
        },
        {
          status: 401,
        },
      );
    }

    const accessToken = authHeader
      .replace("Bearer ", "")
      .trim();

    if (!accessToken) {
      console.error("[API][APPS/SAVE] Empty access token");

      return NextResponse.json(
        {
          error: "Authentication token is missing.",
        },
        {
          status: 401,
        },
      );
    }

    /*
     * ------------------------------------------------------------
     * 2. ENVIRONMENT VARIABLES
     * ------------------------------------------------------------
     */

    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    const supabaseAnonKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    const serviceRoleKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl) {
      console.error(
        "[API][APPS/SAVE] NEXT_PUBLIC_SUPABASE_URL is missing.",
      );

      return NextResponse.json(
        {
          error:
            "NEXT_PUBLIC_SUPABASE_URL is missing from the server environment.",
        },
        {
          status: 500,
        },
      );
    }

    if (!supabaseAnonKey) {
      console.error(
        "[API][APPS/SAVE] NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is missing.",
      );

      return NextResponse.json(
        {
          error:
            "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is missing from the server environment.",
        },
        {
          status: 500,
        },
      );
    }

    if (!serviceRoleKey) {
      console.error(
        "[API][APPS/SAVE] SUPABASE_SERVICE_ROLE_KEY is missing.",
      );

      return NextResponse.json(
        {
          error:
            "Server database configuration is incomplete. Add SUPABASE_SERVICE_ROLE_KEY to .env.local and restart the Next.js server.",
        },
        {
          status: 500,
        },
      );
    }

    /*
     * ------------------------------------------------------------
     * 3. READ REQUEST BODY
     * ------------------------------------------------------------
     */

    let payload: SavePayload;

    try {
      payload =
        (await request.json()) as SavePayload;
    } catch {
      console.error(
        "[API][APPS/SAVE] Invalid JSON body.",
      );

      return NextResponse.json(
        {
          error: "Invalid request body.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * ------------------------------------------------------------
     * 4. BASIC VALIDATION
     * ------------------------------------------------------------
     */

    if (!payload.business?.name?.trim()) {
      return NextResponse.json(
        {
          error: "Business name is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!payload.business?.description?.trim()) {
      return NextResponse.json(
        {
          error: "Business description is required.",
        },
        {
          status: 400,
        },
      );
    }

    const hasContact =
      payload.business.phone?.trim() ||
      payload.business.whatsapp?.trim() ||
      payload.business.email?.trim() ||
      payload.business.address?.trim();

    if (!hasContact) {
      return NextResponse.json(
        {
          error:
            "At least one contact method is required.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * ------------------------------------------------------------
     * 5. VERIFY USER TOKEN
     * ------------------------------------------------------------
     */

    const authSupabase =
      createSupabaseClient<Database>(
        supabaseUrl,
        supabaseAnonKey,
        {
          global: {
            headers: {
              Authorization:
                `Bearer ${accessToken}`,
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
    } = await authSupabase.auth.getUser();

    console.log(
      "[API][APPS/SAVE] Auth",
      {
        userId: user?.id ?? null,
        email: user?.email ?? null,
        hasUser: Boolean(user),
        error:
          userError?.message ?? null,
        requestedAppId:
          payload.appId ?? null,
        createNew:
          payload.createNew ?? false,
        businessName:
          payload.business?.name ?? null,
      },
    );

    if (userError || !user) {
      return NextResponse.json(
        {
          error:
            "Your session is invalid. Please sign in again.",
        },
        {
          status: 401,
        },
      );
    }

    /*
     * ------------------------------------------------------------
     * 6. SERVER DATABASE CLIENT
     * ------------------------------------------------------------
     *
     * Service-role key is used ONLY here on the server.
     *
     * NEVER expose SUPABASE_SERVICE_ROLE_KEY to the browser.
     *
     * ------------------------------------------------------------
     */

    const supabase =
      createSupabaseClient<Database>(
        supabaseUrl,
        serviceRoleKey,
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
          },
        },
      );

    /*
     * ------------------------------------------------------------
     * 7. ENSURE PROFILE EXISTS
     * ------------------------------------------------------------
     */

    const {
      error: profileError,
    } = await supabase
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
      console.error(
        "[API][APPS/SAVE] Profile save error:",
        profileError,
      );

      return NextResponse.json(
        {
          error:
            `Could not create your profile: ${profileError.message}`,
        },
        {
          status: 500,
        },
      );
    }

    /*
     * ------------------------------------------------------------
     * 8. PREPARE DATA
     * ------------------------------------------------------------
     */

    console.log(
      "[API][APPS/SAVE] Payload",
      {
        appId:
          payload.appId ?? null,
        createNew:
          payload.createNew ?? false,
        pages:
          payload.pages?.length ?? 0,
        services:
          payload.services?.length ?? 0,
        gallery:
          payload.gallery?.length ?? 0,
      },
    );

    const savedAt =
      new Date().toISOString();

    const appStatus =
      appStatusFromPayload(payload);

    const appTheme: Json = {
      primaryColor:
        payload.app.primaryColor,
    };

    const appNavigation: Json =
      (payload.pages ?? []).map(
        (page, index) => ({
          id: page.id,
          title: page.name,
          slug: page.id,
          icon: page.icon,
          sortOrder: index,
          enabled: page.enabled,
        }),
      );

    const appFeatures: Json = {
      hasServices:
        (payload.services ?? []).some(
          (service) => service.enabled,
        ),

      hasGallery:
        (payload.gallery ?? []).some(
          (item) => item.enabled,
        ),
    };

    const appSettings: Json = {
      contact:
        payload.contactSettings,
    };

    let businessId: string;
    let appId: string;

    /*
     * ============================================================
     * 9. CREATE vs UPDATE
     * ============================================================
     *
     * createNew=true ALWAYS means:
     *
     *   CREATE a completely new business
     *   CREATE a completely new app
     *
     * This is important for:
     *
     * Landing page
     *      ↓
     * Start Building For Free
     *      ↓
     * Build anonymously
     *      ↓
     * Save App
     *      ↓
     * Existing user signs in
     *      ↓
     * CREATE NEW APP in their account
     *
     * We must NOT accidentally update one of their
     * existing saved apps.
     *
     * ============================================================
     */

    const shouldCreateNew =
      payload.createNew === true;

    /*
     * ------------------------------------------------------------
     * UPDATE EXISTING APP
     * ------------------------------------------------------------
     */

    if (!shouldCreateNew && payload.appId) {
      console.log(
        "[API][APPS/SAVE] Mode: UPDATE EXISTING APP",
        {
          appId: payload.appId,
          userId: user.id,
        },
      );

      /*
       * Find existing app.
       */

      const {
        data: existingApp,
        error: existingAppError,
      } = await supabase
        .from("apps")
        .select(
          "id, business_id",
        )
        .eq(
          "id",
          payload.appId,
        )
        .maybeSingle();

      if (existingAppError) {
        console.error(
          "[API][APPS/SAVE] Existing app lookup error:",
          existingAppError,
        );

        return NextResponse.json(
          {
            error:
              "Could not load your saved app.",
          },
          {
            status: 500,
          },
        );
      }

      if (!existingApp) {
        console.error(
          "[API][APPS/SAVE] Existing app not found",
          {
            appId:
              payload.appId,
          },
        );

        return NextResponse.json(
          {
            error:
              "Saved app not found.",
          },
          {
            status: 404,
          },
        );
      }

      /*
       * Verify ownership through business.
       */

      const {
        data: ownedBusiness,
        error: ownedBusinessError,
      } = await supabase
        .from("businesses")
        .select("id")
        .eq(
          "id",
          existingApp.business_id,
        )
        .eq(
          "owner_id",
          user.id,
        )
        .maybeSingle();

      if (
        ownedBusinessError ||
        !ownedBusiness
      ) {
        console.error(
          "[API][APPS/SAVE] Ownership check failed",
          {
            appId:
              payload.appId,
            businessId:
              existingApp.business_id,
            userId:
              user.id,
            error:
              ownedBusinessError?.message ??
              null,
          },
        );

        return NextResponse.json(
          {
            error:
              "You do not have access to this app.",
          },
          {
            status: 403,
          },
        );
      }

      businessId =
        ownedBusiness.id;

      appId =
        existingApp.id;

      /*
       * Update business.
       */

      const {
        data: updatedBusiness,
        error: updateBusinessError,
      } = await supabase
        .from("businesses")
        .update({
          name:
            payload.business.name,

          description:
            payload.business.description ||
            null,

          phone:
            payload.business.phone ||
            null,

          whatsapp:
            payload.business.whatsapp ||
            null,

          email:
            payload.business.email ||
            null,

          address_line_1:
            payload.business.address ||
            null,

          opening_hours:
            payload.contactSettings.showHours &&
            payload.contactSettings.hours
              ? ({
                  display:
                    payload.contactSettings.hours,
                } as Json)
              : ({} as Json),

          updated_at:
            savedAt,
        })
        .eq(
          "id",
          businessId,
        )
        .select(
          "id, updated_at",
        )
        .single();

      console.log(
        "[API][APPS/SAVE] Business update result",
        {
          businessId,
          updated:
            Boolean(updatedBusiness),
          updatedAt:
            updatedBusiness?.updated_at ??
            null,
          error:
            updateBusinessError?.message ??
            null,
        },
      );

      if (
        updateBusinessError ||
        !updatedBusiness
      ) {
        return NextResponse.json(
          {
            error:
              updateBusinessError?.message ||
              "Could not update business information.",
          },
          {
            status: 500,
          },
        );
      }

      /*
       * Update app.
       */

      const {
        data: updatedApp,
        error: updateAppError,
      } = await supabase
        .from("apps")
        .update({
          name:
            payload.app.name,

          status:
            appStatus,

          theme:
            appTheme,

          navigation:
            appNavigation,

          features:
            appFeatures,

          settings:
            appSettings,

          updated_at:
            savedAt,
        })
        .eq(
          "id",
          appId,
        )
        .select(
          "id, updated_at",
        )
        .single();

      console.log(
        "[API][APPS/SAVE] App update result",
        {
          appId,
          updated:
            Boolean(updatedApp),
          updatedAt:
            updatedApp?.updated_at ??
            null,
          error:
            updateAppError?.message ??
            null,
        },
      );

      if (
        updateAppError ||
        !updatedApp
      ) {
        return NextResponse.json(
          {
            error:
              updateAppError?.message ||
              "Could not update app settings. No database row was updated.",
          },
          {
            status: 500,
          },
        );
      }
    }

    /*
     * ------------------------------------------------------------
     * CREATE NEW APP
     * ------------------------------------------------------------
     */

    else {
      console.log(
        "[API][APPS/SAVE] Mode: CREATE NEW APP",
        {
          userId: user.id,
          suppliedAppId:
            payload.appId ?? null,
          createNew:
            payload.createNew ?? false,
        },
      );

      /*
       * Create NEW business.
       *
       * This means a new app gets its own business record.
       */

      const {
        data: newBusiness,
        error: newBusinessError,
      } = await supabase
        .from("businesses")
        .insert({
          owner_id:
            user.id,

          name:
            payload.business.name,

          description:
            payload.business.description ||
            null,

          phone:
            payload.business.phone ||
            null,

          whatsapp:
            payload.business.whatsapp ||
            null,

          email:
            payload.business.email ||
            null,

          address_line_1:
            payload.business.address ||
            null,

          opening_hours:
            payload.contactSettings.showHours &&
            payload.contactSettings.hours
              ? ({
                  display:
                    payload.contactSettings.hours,
                } as Json)
              : ({} as Json),
        })
        .select("id")
        .single();

      if (
        newBusinessError ||
        !newBusiness
      ) {
        console.error(
          "[API][APPS/SAVE] Business create error:",
          newBusinessError,
        );

        return NextResponse.json(
          {
            error:
              newBusinessError?.message ||
              "Could not create business record.",
          },
          {
            status: 500,
          },
        );
      }

      businessId =
        newBusiness.id;

      console.log(
        "[API][APPS/SAVE] New business created",
        {
          businessId,
          userId:
            user.id,
        },
      );

      /*
       * Create NEW app.
       */

      const {
        data: newApp,
        error: newAppError,
      } = await supabase
        .from("apps")
        .insert({
          business_id:
            businessId,

          name:
            payload.app.name,

          status:
            appStatus,

          theme:
            appTheme,

          navigation:
            appNavigation,

          features:
            appFeatures,

          settings:
            appSettings,

          updated_at:
            savedAt,
        })
        .select("id")
        .single();

      if (
        newAppError ||
        !newApp
      ) {
        console.error(
          "[API][APPS/SAVE] App create error:",
          newAppError,
        );

        /*
         * If app creation fails after business
         * creation, clean up the newly-created
         * business so we don't leave an orphan.
         */

        await supabase
          .from("businesses")
          .delete()
          .eq(
            "id",
            businessId,
          );

        return NextResponse.json(
          {
            error:
              newAppError?.message ||
              "Could not create app record.",
          },
          {
            status: 500,
          },
        );
      }

      appId =
        newApp.id;

      console.log(
        "[API][APPS/SAVE] New app created",
        {
          appId,
          businessId,
          userId:
            user.id,
        },
      );
    }

    /*
     * ------------------------------------------------------------
     * 10. REPLACE PAGES
     * ------------------------------------------------------------
     */

    const {
      error: deletePagesError,
    } = await supabase
      .from("app_pages")
      .delete()
      .eq(
        "app_id",
        appId,
      );

    if (deletePagesError) {
      console.error(
        "[API][APPS/SAVE] Delete pages error:",
        deletePagesError,
      );

      return NextResponse.json(
        {
          error:
            "Could not update app pages.",
        },
        {
          status: 500,
        },
      );
    }

    const pagesToInsert =
      (payload.pages ?? []).map(
        (page, index) => ({
          app_id:
            appId,

          slug:
            page.id,

          title:
            page.name,

          type:
            page.system
              ? "system"
              : "custom",

          sort_order:
            index,

          is_enabled:
            page.enabled,

          sections: {
            description:
              page.description,

            icon:
              page.icon,

            system:
              !!page.system,
          } as Json,
        }),
      );

    if (
      pagesToInsert.length > 0
    ) {
      const {
        error: insertPagesError,
      } = await supabase
        .from("app_pages")
        .insert(
          pagesToInsert,
        );

      if (insertPagesError) {
        console.error(
          "[API][APPS/SAVE] Insert pages error:",
          insertPagesError,
        );

        return NextResponse.json(
          {
            error:
              "Could not save app pages.",
          },
          {
            status: 500,
          },
        );
      }
    }

    /*
     * ------------------------------------------------------------
     * 11. REPLACE SERVICES
     * ------------------------------------------------------------
     */

    const {
      error: deleteServicesError,
    } = await supabase
      .from("app_services")
      .delete()
      .eq(
        "app_id",
        appId,
      );

    if (deleteServicesError) {
      console.error(
        "[API][APPS/SAVE] Delete services error:",
        deleteServicesError,
      );

      return NextResponse.json(
        {
          error:
            "Could not update app services.",
        },
        {
          status: 500,
        },
      );
    }

    const servicesToInsert =
      (payload.services ?? []).map(
        (service, index) => ({
          app_id:
            appId,

          name:
            service.name,

          description:
            service.description ||
            null,

          price:
            parsePrice(
              service.price,
            ),

          currency:
            "ZAR",

          image_url:
            null,

          sort_order:
            index,

          is_enabled:
            service.enabled,
        }),
      );

    if (
      servicesToInsert.length > 0
    ) {
      const {
        error:
          insertServicesError,
      } = await supabase
        .from("app_services")
        .insert(
          servicesToInsert,
        );

      if (
        insertServicesError
      ) {
        console.error(
          "[API][APPS/SAVE] Insert services error:",
          insertServicesError,
        );

        return NextResponse.json(
          {
            error:
              "Could not save app services.",
          },
          {
            status: 500,
          },
        );
      }
    }

    /*
     * ------------------------------------------------------------
     * 12. REPLACE GALLERY
     * ------------------------------------------------------------
     */

    const {
      error: deleteMediaError,
    } = await supabase
      .from("app_media")
      .delete()
      .eq(
        "app_id",
        appId,
      );

    if (deleteMediaError) {
      console.error(
        "[API][APPS/SAVE] Delete media error:",
        deleteMediaError,
      );

      return NextResponse.json(
        {
          error:
            "Could not update app media.",
        },
        {
          status: 500,
        },
      );
    }

    const mediaToInsert =
      (payload.gallery ?? [])
        .filter(
          (item) =>
            item.imageUrl
              .trim()
              .length > 0,
        )
        .map(
          (item, index) => ({
            app_id:
              appId,

            type:
              "gallery",

            file_path:
              item.imageUrl,

            file_name:
              item.title ||
              null,

            alt_text:
              item.description ||
              item.title ||
              null,

            sort_order:
              index,
          }),
        );

    if (
      mediaToInsert.length > 0
    ) {
      const {
        error:
          insertMediaError,
      } = await supabase
        .from("app_media")
        .insert(
          mediaToInsert,
        );

      if (
        insertMediaError
      ) {
        console.error(
          "[API][APPS/SAVE] Insert media error:",
          insertMediaError,
        );

        return NextResponse.json(
          {
            error:
              "Could not save app gallery.",
          },
          {
            status: 500,
          },
        );
      }
    }

    /*
     * ------------------------------------------------------------
     * 13. SUCCESS
     * ------------------------------------------------------------
     */

    const responseBody = {
      appId,

      businessId,

      status:
        appStatus,

      updatedAt:
        savedAt,

      message:
        "Your app has been saved.",
    };

    console.log(
      "[API][APPS/SAVE] SUCCESS",
      {
        ...responseBody,

        userId:
          user.id,

        email:
          user.email ?? null,

        createNew:
          payload.createNew ??
          false,
      },
    );

    return NextResponse.json(
      responseBody,
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "[API][APPS/SAVE] Unexpected error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not save your app.",
      },
      {
        status: 500,
      },
    );
  }
}