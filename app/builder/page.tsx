"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type RefObject,
  type SetStateAction,
} from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient as createBrowserSupabaseClient } from "@/lib/supabase/client";

type Device = "ios" | "android";

type Step =
  | "business"
  | "description"
  | "contact"
  | "appearance"
  | "pages"
  | "services"
  | "gallery";

type Business = {
  name: string;
  description: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
};

type AppPage = {
  id: string;
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
  system?: boolean;
};

type AppService = {
  id: string;
  name: string;
  description: string;
  price: string;
  enabled: boolean;
};

type SavedPageData = {
  id?: string;
  slug?: string;
  title?: string;
  type?: string;
  is_enabled?: boolean;
  sections?: Record<string, unknown> | null;
};

type SavedServiceData = {
  id?: string;
  name?: string;
  description?: string;
  price?: string | number | null;
  is_enabled?: boolean;
};

type SavedMediaData = {
  id?: string;
  file_name?: string;
  alt_text?: string;
  file_path?: string;
  type?: string;
};

type GalleryItem = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  enabled: boolean;
};

type ContactMethod = "phone" | "whatsapp" | "email" | "address";

type ContactSettings = {
  showPhone: boolean;
  showWhatsapp: boolean;
  showEmail: boolean;
  showAddress: boolean;
  showHours: boolean;
  hours: string;
};

type AppConfig = {
  business: Business;
  primaryColor: string;
};

/* ============================================================
   INITIAL DATA
============================================================ */

const initialApp: AppConfig = {
  business: {
    name: "",
    description: "",
    phone: "",
    whatsapp: "",
    email: "",
    address: "",
  },

  primaryColor: "#4F46E5",
};

const defaultPages: AppPage[] = [
  {
    id: "home",
    name: "Home",
    description: "Your app's main landing page.",
    icon: "⌂",
    enabled: true,
    system: true,
  },

  {
    id: "services",
    name: "Services",
    description: "Show customers what your business offers.",
    icon: "☷",
    enabled: true,
  },

  {
    id: "about",
    name: "About",
    description: "Tell customers about your business.",
    icon: "i",
    enabled: false,
  },

  {
    id: "gallery",
    name: "Gallery",
    description: "Showcase your work, products or premises.",
    icon: "▧",
    enabled: false,
  },

  {
    id: "contact",
    name: "Contact",
    description: "Give customers an easy way to reach you.",
    icon: "⌁",
    enabled: true,
  },
];

const defaultServices: AppService[] = [
  {
    id: "service-1",
    name: "Our services",
    description: "Tell customers what your business offers.",
    price: "",
    enabled: true,
  },
];

const defaultGallery: GalleryItem[] = [];

const initialContactSettings: ContactSettings = {
  showPhone: true,
  showWhatsapp: true,
  showEmail: true,
  showAddress: true,
  showHours: false,
  hours: "Mon – Fri 08:00 – 17:00",
};

const navigationItems = [
  {
    id: "business",
    label: "Business",
    icon: "✦",
  },

  {
    id: "appearance",
    label: "Appearance",
    icon: "◈",
  },

  {
    id: "pages",
    label: "Pages",
    icon: "□",
  },

  {
    id: "services",
    label: "Services",
    icon: "☷",
  },

  {
    id: "gallery",
    label: "Gallery",
    icon: "▧",
  },

  {
    id: "contact",
    label: "Contact",
    icon: "⌁",
  },
];

const previewMoments = [
  {
    title: "Tap-ready home screen",
    detail: "Quick actions, animated cards and sticky navigation feel like a real app.",
  },
  {
    title: "Switch device instantly",
    detail: "Jump between iOS and Android framing to compare visual polish.",
  },
  {
    title: "Explore real interactions",
    detail: "Tap services, gallery and contact blocks to see contextual responses.",
  },
];

const guidedPreviewStops = [
  {
    label: "Home",
    target: "home",
    detail: "Hero and quick actions",
  },
  {
    label: "Services",
    target: "services",
    detail: "Expandable service cards",
  },
  {
    label: "Gallery",
    target: "gallery",
    detail: "Tap to spotlight images",
  },
  {
    label: "Contact",
    target: "contact",
    detail: "Direct action tiles",
  },
  {
    label: "About",
    target: "about",
    detail: "Business story section",
  },
] as const;

const industryPreviewPresets = [
  {
    id: "live",
    label: "Live data",
    businessName: "",
    description: "",
    primaryColor: "",
    phone: "",
    whatsapp: "",
    email: "",
    address: "",
    cta: "I want this app for my business",
    services: [] as AppService[],
    gallery: [] as GalleryItem[],
  },
  {
    id: "plumber",
    label: "Plumber",
    businessName: "FlowFix Plumbing",
    description: "24/7 emergency plumbing, leak detection and geyser repairs across your area.",
    primaryColor: "#0EA5E9",
    phone: "+27 82 410 7790",
    whatsapp: "+27 82 410 7790",
    email: "hello@flowfix.co.za",
    address: "18 Cedar Road, Fourways",
    cta: "Get my plumbing app",
    services: [
      {
        id: "preset-plumber-1",
        name: "Emergency callout",
        description: "Rapid response for leaks and burst pipes.",
        price: "R450",
        enabled: true,
      },
      {
        id: "preset-plumber-2",
        name: "Geyser repair",
        description: "Repair and replacement with warranty.",
        price: "R950",
        enabled: true,
      },
      {
        id: "preset-plumber-3",
        name: "Leak detection",
        description: "Non-invasive checks for hidden water loss.",
        price: "R700",
        enabled: true,
      },
    ],
    gallery: [
      {
        id: "preset-plumber-g1",
        title: "Bathroom upgrade",
        description: "Completed project",
        imageUrl: "https://picsum.photos/seed/wma-plumber-1/600/600",
        enabled: true,
      },
      {
        id: "preset-plumber-g2",
        title: "Kitchen install",
        description: "Completed project",
        imageUrl: "https://picsum.photos/seed/wma-plumber-2/600/600",
        enabled: true,
      },
    ],
  },
  {
    id: "salon",
    label: "Salon",
    businessName: "Luxe Hair Studio",
    description: "Premium cuts, colour and styling with easy bookings and instant WhatsApp support.",
    primaryColor: "#EC4899",
    phone: "+27 82 111 0032",
    whatsapp: "+27 82 111 0032",
    email: "book@luxehair.co.za",
    address: "44 Main Street, Sandton",
    cta: "Get my salon app",
    services: [
      {
        id: "preset-salon-1",
        name: "Cut and blow wave",
        description: "Tailored style with signature finish.",
        price: "R380",
        enabled: true,
      },
      {
        id: "preset-salon-2",
        name: "Colour and treatment",
        description: "Colour refresh and deep repair treatment.",
        price: "R850",
        enabled: true,
      },
      {
        id: "preset-salon-3",
        name: "Bridal styling",
        description: "Consultation plus full event styling.",
        price: "R1200",
        enabled: true,
      },
    ],
    gallery: [
      {
        id: "preset-salon-g1",
        title: "Blonde transformation",
        description: "Featured work",
        imageUrl: "https://picsum.photos/seed/wma-salon-1/600/600",
        enabled: true,
      },
      {
        id: "preset-salon-g2",
        title: "Bridal style",
        description: "Featured work",
        imageUrl: "https://picsum.photos/seed/wma-salon-2/600/600",
        enabled: true,
      },
    ],
  },
  {
    id: "restaurant",
    label: "Restaurant",
    businessName: "Urban Grill House",
    description: "Daily specials, table booking, menu highlights and direct ordering from your phone.",
    primaryColor: "#F97316",
    phone: "+27 11 411 8800",
    whatsapp: "+27 82 909 1188",
    email: "hello@urbangrill.co.za",
    address: "9 Rivonia Boulevard, Johannesburg",
    cta: "Get my restaurant app",
    services: [
      {
        id: "preset-restaurant-1",
        name: "Table booking",
        description: "Reserve your table in seconds.",
        price: "Instant",
        enabled: true,
      },
      {
        id: "preset-restaurant-2",
        name: "Weekly specials",
        description: "Fresh updates and chef picks.",
        price: "Updated daily",
        enabled: true,
      },
      {
        id: "preset-restaurant-3",
        name: "Delivery orders",
        description: "Order directly from the app.",
        price: "Open now",
        enabled: true,
      },
    ],
    gallery: [
      {
        id: "preset-restaurant-g1",
        title: "Signature steak",
        description: "Menu highlight",
        imageUrl: "https://picsum.photos/seed/wma-restaurant-1/600/600",
        enabled: true,
      },
      {
        id: "preset-restaurant-g2",
        title: "Dining space",
        description: "Restaurant interior",
        imageUrl: "https://picsum.photos/seed/wma-restaurant-2/600/600",
        enabled: true,
      },
    ],
  },
];

/* ============================================================
   PROGRESS
============================================================ */

function getProgress(app: AppConfig) {
  const fields = [
    app.business.name,
    app.business.description,
    app.business.phone ||
      app.business.whatsapp ||
      app.business.email ||
      app.business.address,
  ];

  const completed = fields.filter(
    (field) => field.trim().length > 0,
  ).length;

  return Math.round((completed / fields.length) * 100);
}

function isBusinessComplete(app: AppConfig) {
  return Boolean(
    app.business.name.trim() &&
      app.business.description.trim(),
  );
}

function isContactComplete(app: AppConfig) {
  return Boolean(
    app.business.phone.trim() ||
      app.business.whatsapp.trim() ||
      app.business.email.trim() ||
      app.business.address.trim(),
  );
}

/* ============================================================
   MAIN BUILDER
============================================================ */

export default function BuilderPage() {

  const searchParams = useSearchParams();

  const loadedAppIdRef = useRef<string | null>(null);

  const [isLoadingSavedApp, setIsLoadingSavedApp] =
    useState(false);

  const [loadAppError, setLoadAppError] =
    useState<string | null>(null);

  const [app, setApp] =
    useState<AppConfig>(initialApp);

  const [pages, setPages] =
    useState<AppPage[]>(defaultPages);

  const [services, setServices] =
    useState<AppService[]>(defaultServices);

  const [gallery, setGallery] =
    useState<GalleryItem[]>(defaultGallery);

  const [contactSettings, setContactSettings] =
    useState<ContactSettings>(initialContactSettings);

  const [device, setDevice] =
    useState<Device>("ios");

  const [step, setStep] =
    useState<Step>("business");

  const [activeSection, setActiveSection] =
    useState("business");

  const [assistantOpen, setAssistantOpen] =
    useState(false);

  const [previewOpen, setPreviewOpen] =
    useState(false);

  const [currentUserEmail, setCurrentUserEmail] =
    useState<string | null>(null);

  const [isSigningOut, setIsSigningOut] =
    useState(false);

  /*
   * IMPORTANT: the URL is the source of truth for which app is being edited.
   *
   * /builder                  = NEW APP
   * /builder?new=1            = NEW APP
   * /builder?appId=<uuid>     = EDIT EXISTING APP
   *
   * Do NOT fall back to localStorage here. Doing that makes a brand-new
   * builder session accidentally reuse the last app and overwrite it.
   */
  const [savedAppId, setSavedAppId] =
    useState<string | null>(() => {
      if (typeof window === "undefined") {
        return null;
      }

      const url = new URL(window.location.href);
      return url.searchParams.get("appId");
    });

  const [isSaving, setIsSaving] =
    useState(false);

  const [saveError, setSaveError] =
    useState<string | null>(null);

  const [saveSuccess, setSaveSuccess] =
    useState<string | null>(null);

  const [authOpen, setAuthOpen] =
    useState(false);

  const [authMode, setAuthMode] =
    useState<"signup" | "signin" | "check_email">("signup");

  const [authEmail, setAuthEmail] =
    useState("");

  const [authPassword, setAuthPassword] =
    useState("");

  const [authConfirmPassword, setAuthConfirmPassword] =
    useState("");

  const [authLoading, setAuthLoading] =
    useState(false);

  const [authError, setAuthError] =
    useState<string | null>(null);

  const [pendingSaveAfterAuth, setPendingSaveAfterAuth] =
    useState(false);

  const nameInputRef =
    useRef<HTMLInputElement>(null);

  const descriptionRef =
    useRef<HTMLTextAreaElement>(null);

  const phoneRef =
    useRef<HTMLInputElement>(null);

  const progress = getProgress(app);

  useEffect(() => {
    let mounted = true;

    async function loadCurrentUser() {
      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase.auth.getUser();

        if (error) {
          throw error;
        }

        if (mounted) {
          setCurrentUserEmail(data.user?.email ?? null);
        }
      } catch (error) {
        console.error("[BUILDER][SESSION] Could not read session", error);
        if (mounted) {
          setCurrentUserEmail(null);
        }
      }
    }

    void loadCurrentUser();

    return () => {
      mounted = false;
    };
  }, []);

  async function handleBuilderSignOut() {
    if (isSigningOut) {
      return;
    }

    setIsSigningOut(true);

    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      setCurrentUserEmail(null);
      window.location.replace("/");
    } catch (error) {
      console.error("[BUILDER][SIGNOUT] Failed", error);
      setIsSigningOut(false);
    }
  }

  useEffect(() => {
    if (!saveSuccess) {
      return;
    }

    const timer = window.setTimeout(() => {
      setSaveSuccess(null);
    }, 3200);

    return () => window.clearTimeout(timer);
  }, [saveSuccess]);

  function rememberSavedAppId(
    appId: string,
  ) {
    setSavedAppId(appId);

    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(
      "wemakeapps:lastAppId",
      appId,
    );

    const url = new URL(window.location.href);
    url.searchParams.set("appId", appId);
    window.history.replaceState(
      null,
      "",
      `${url.pathname}${url.search}`,
    );
  }

  function buildSavePayload() {
    return {
      appId: savedAppId,

      app: {
        name:
          app.business.name.trim() ||
          "My App",
        primaryColor:
          app.primaryColor,
      },

      business: {
        name: app.business.name.trim(),
        description:
          app.business.description.trim(),
        phone: app.business.phone.trim(),
        whatsapp:
          app.business.whatsapp.trim(),
        email: app.business.email.trim(),
        address:
          app.business.address.trim(),
      },

      contactSettings,

      pages,
      services,
      gallery,
    };
  }

  function getSupabaseClient() {
    try {
      return createBrowserSupabaseClient();
    } catch {
      throw new Error(
        "Save and sign in are unavailable until Supabase is configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
      );
    }
  }

  async function persistApp(
    accessToken: string,
  ) {
    const payload = buildSavePayload();

    console.log("[BUILDER][SAVE] Request", {
      appId: payload.appId,
      businessName: payload.business.name,
      hasDescription: Boolean(payload.business.description),
      contact: {
        phone: Boolean(payload.business.phone),
        whatsapp: Boolean(payload.business.whatsapp),
        email: Boolean(payload.business.email),
        address: Boolean(payload.business.address),
      },
      pages: payload.pages.length,
      services: payload.services.length,
      gallery: payload.gallery.length,
    });

    const response = await fetch(
      "/api/apps/save",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      },
    );

    const body = await response
      .json()
      .catch(() => null);

    console.log("[BUILDER][SAVE] Response", {
      appId: payload.appId,
      status: response.status,
      ok: response.ok,
      body,
    });

    if (!response.ok) {
      throw new Error(
        body?.error ||
          "Could not save your app right now.",
      );
    }

    return body as {
      appId: string;
      message: string;
    };
  }

  function isAuthSessionMissingError(
    error?: { message?: string; name?: string } | null,
  ) {
    return Boolean(
      error &&
        (error.name === "AuthSessionMissingError" ||
          error.message?.toLowerCase().includes("auth session missing")),
    );
  }

  async function saveAppFlow(accessToken?: string) {
    if (isSaving) {
      return;
    }

    setSaveError(null);
    setSaveSuccess(null);

    if (!isBusinessComplete(app)) {
      setSaveError(
        "Add a business name and description before saving.",
      );
      selectSection("business");
      return;
    }

    if (!isContactComplete(app)) {
      setSaveError(
        "Add at least one contact method before saving.",
      );
      selectSection("contact");
      return;
    }

    let token = accessToken;

    if (!token) {
      let supabase;

      try {
        supabase = getSupabaseClient();
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Save is currently unavailable.";

        setSaveError(message);
        return;
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        if (isAuthSessionMissingError(userError)) {
          setPendingSaveAfterAuth(true);
          setAuthMode("signup");
          setAuthOpen(true);
          setAuthError(null);
          return;
        }

        setSaveError(
          `Supabase authentication error: ${userError.message}`,
        );
        return;
      }

      if (!user) {
        setPendingSaveAfterAuth(true);
        setAuthMode("signup");
        setAuthOpen(true);
        setAuthError(null);
        return;
      }

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        setSaveError(
          `Could not verify your session: ${sessionError.message}`,
        );
        return;
      }

      token = session?.access_token;

      if (!token) {
        setPendingSaveAfterAuth(true);
        setAuthMode("signin");
        setAuthOpen(true);
        setSaveError(
          "Please sign in again to save your app.",
        );
        return;
      }
    }

    setIsSaving(true);

    try {
      const result = await persistApp(token);

      rememberSavedAppId(result.appId);
      setSaveSuccess("Your app has been saved.");
      setPendingSaveAfterAuth(false);
      setAuthOpen(false);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not save your app right now.";

      setSaveError(message);
    } finally {
      setIsSaving(false);
    }
  }

  async function submitAuth() {
    if (authLoading) {
      return;
    }

    setAuthError(null);

    const email = authEmail.trim();
    const password = authPassword;

    if (!email) {
      setAuthError("Enter your email address.");
      return;
    }

    if (!password.trim()) {
      setAuthError("Enter your password.");
      return;
    }

    if (authMode === "signup") {
      if (password.length < 6) {
        setAuthError(
          "Use at least 6 characters for your password.",
        );
        return;
      }

      if (password !== authConfirmPassword) {
        setAuthError("Your passwords do not match.");
        return;
      }
    }

    let supabase;

    try {
      supabase = getSupabaseClient();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Authentication is currently unavailable.";

      setAuthError(message);
      return;
    }

    setAuthLoading(true);

    try {
      if (authMode === "signup") {
        const { data, error } =
          await supabase.auth.signUp({
            email,
            password,
          });

        if (error) {
          throw error;
        }

        // Supabase can return an existing user with no session when
        // email confirmation is enabled. Detect that case and send
        // the user to the normal sign-in flow instead of pretending
        // a new account was created.
        if (
          data.user &&
          data.user.identities &&
          data.user.identities.length === 0
        ) {
          setAuthMode("signin");
          setAuthPassword("");
          setAuthConfirmPassword("");
          setAuthError(
            "An account with this email already exists. Sign in to continue saving your app.",
          );
          return;
        }

        if (data.session?.access_token) {
          setAuthPassword("");
          setAuthConfirmPassword("");
          setAuthOpen(false);

          if (pendingSaveAfterAuth) {
            await saveAppFlow(data.session.access_token);
          }

          return;
        }

        // No session means Supabase requires email confirmation.
        setAuthPassword("");
        setAuthConfirmPassword("");
        setAuthMode("check_email");
        setAuthError(null);
        return;
      }

      const { data, error } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (error) {
        throw error;
      }

      const session = data.session;

      if (!session?.access_token) {
        throw new Error(
          "Sign in succeeded, but no active session was returned. Please try again.",
        );
      }

      setAuthPassword("");
      setAuthConfirmPassword("");
      setAuthOpen(false);

      if (pendingSaveAfterAuth) {
        await saveAppFlow(session.access_token);
      }
    } catch (error) {
      const rawMessage =
        error instanceof Error
          ? error.message
          : "Authentication failed. Please try again.";

      const message =
        rawMessage.toLowerCase().includes("invalid login credentials")
          ? "Incorrect email or password."
          : rawMessage;

      setAuthError(message);
    } finally {
      setAuthLoading(false);
    }
  }

 const loadSavedApp = useCallback(async function loadSavedApp(appId: string) {
  if (loadedAppIdRef.current === appId) {
    return;
  }

  loadedAppIdRef.current = appId;
  setIsLoadingSavedApp(true);
  setLoadAppError(null);
  setSaveError(null);

  try {
    const supabase = getSupabaseClient();

    // Get the currently signed-in user's session.
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      throw new Error(
        `Could not verify your session: ${sessionError.message}`,
      );
    }

    if (!session?.access_token) {
      throw new Error(
        "Your session has expired. Please sign in again.",
      );
    }

    // Send the Supabase access token to our server API.
    const loadUrl = `/api/apps/load?appId=${encodeURIComponent(appId)}`;

    console.log("[BUILDER][LOAD] Request", {
      appId,
      userId: session.user?.id ?? null,
      hasSession: Boolean(session.access_token),
      url: loadUrl,
    });

    const response = await fetch(loadUrl, {
      method: "GET",
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    const result = await response.json().catch(() => null);

    console.log("[BUILDER][LOAD] Response", {
      appId,
      status: response.status,
      ok: response.ok,
      result,
    });

    if (!response.ok) {
      throw new Error(
        result?.error ||
          "Could not load your saved app.",
      );
    }

    const savedApp = result?.app;
    const business = result?.business;

    const savedPages = Array.isArray(result?.pages)
      ? (result.pages as SavedPageData[])
      : [];

    const savedServices = Array.isArray(result?.services)
      ? (result.services as SavedServiceData[])
      : [];

    const savedMedia = Array.isArray(result?.media)
      ? (result.media as SavedMediaData[])
      : [];

    if (!savedApp || !business) {
      throw new Error(
        "The saved app data is incomplete.",
      );
    }

    const theme =
      savedApp.theme &&
      typeof savedApp.theme === "object"
        ? savedApp.theme
        : {};

    const settings =
      savedApp.settings &&
      typeof savedApp.settings === "object"
        ? savedApp.settings
        : {};

    const savedContact =
      settings.contact &&
      typeof settings.contact === "object"
        ? settings.contact
        : {};

    const openingHours =
      business.opening_hours &&
      typeof business.opening_hours === "object"
        ? business.opening_hours
        : {};

    const savedHours =
      typeof openingHours.display === "string"
        ? openingHours.display
        : typeof savedContact.hours === "string"
          ? savedContact.hours
          : initialContactSettings.hours;

    setApp((current) => ({
      ...current,

      business: {
        ...current.business,
        name: business.name ?? "",
        description: business.description ?? "",
        phone: business.phone ?? "",
        whatsapp: business.whatsapp ?? "",
        email: business.email ?? "",
        address: business.address_line_1 ?? "",
      },

      primaryColor:
        typeof theme.primaryColor === "string"
          ? theme.primaryColor
          : current.primaryColor,
    }));

    setContactSettings({
      showPhone:
        typeof savedContact.showPhone === "boolean"
          ? savedContact.showPhone
          : Boolean(business.phone),

      showWhatsapp:
        typeof savedContact.showWhatsapp === "boolean"
          ? savedContact.showWhatsapp
          : Boolean(business.whatsapp),

      showEmail:
        typeof savedContact.showEmail === "boolean"
          ? savedContact.showEmail
          : Boolean(business.email),

      showAddress:
        typeof savedContact.showAddress === "boolean"
          ? savedContact.showAddress
          : Boolean(business.address_line_1),

      showHours:
        typeof savedContact.showHours === "boolean"
          ? savedContact.showHours
          : Boolean(openingHours.display),

      hours: savedHours,
    });

    setPages(
      savedPages.map((page: SavedPageData, index: number) => {
        const sections =
          page.sections &&
          typeof page.sections === "object"
            ? (page.sections as Record<string, unknown>)
            : {};

        return {
          id: page.slug || page.id || `page-${index}`,
          name: page.title || "Page",
          description:
            typeof sections.description === "string"
              ? sections.description
              : "",
          icon:
            typeof sections.icon === "string"
              ? sections.icon
              : "□",
          enabled:
            typeof page.is_enabled === "boolean"
              ? page.is_enabled
              : true,
          system:
            typeof sections.system === "boolean"
              ? sections.system
              : page.type === "system",
        };
      }),
    );

    setServices(
      savedServices.map((service: SavedServiceData, index: number) => ({
        id:
          service.id ||
          `service-${index}`,
        name:
          service.name || "",
        description:
          service.description || "",
        price:
          service.price === null ||
          service.price === undefined
            ? ""
            : String(service.price),
        enabled:
          typeof service.is_enabled === "boolean"
            ? service.is_enabled
            : true,
      })),
    );

    setGallery(
      savedMedia
        .filter(
          (media: SavedMediaData) =>
            media.type === "gallery" ||
            media.type === "service" ||
            media.type === "other",
        )
        .map((media: SavedMediaData, index: number) => ({
          id:
            media.id ||
            `gallery-${index}`,
          title:
            media.file_name || "",
          description:
            media.alt_text || "",
          imageUrl:
            media.file_path || "",
          enabled: true,
        })),
    );

    // Remember the loaded app ID.
    setSavedAppId(savedApp.id);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        "wemakeapps:lastAppId",
        savedApp.id,
      );
    }

    setLoadAppError(null);

    console.log("[BUILDER][LOAD] Applied saved app to builder", {
      appId: savedApp.id,
      businessName: business.name,
      pages: savedPages.length,
      services: savedServices.length,
      media: savedMedia.length,
    });
  } catch (error) {
    console.error(
      "Load saved app error:",
      error,
    );

    setLoadAppError(
      error instanceof Error
        ? error.message
        : "Could not load your saved app.",
    );

    // Allow Try Again to work.
    loadedAppIdRef.current = null;
  } finally {
    setIsLoadingSavedApp(false);
  }
}, []);

  useEffect(() => {
    const appId = searchParams.get("appId");
    const isNewApp = searchParams.get("new") === "1";

    /*
     * A new-app navigation must always start with clean builder state.
     * This is especially important when Next.js reuses the builder page
     * component during client-side navigation.
     */
    if (isNewApp || !appId) {
      loadedAppIdRef.current = null;
      setSavedAppId(null);
      setLoadAppError(null);

      if (typeof window !== "undefined") {
        window.localStorage.removeItem("wemakeapps:lastAppId");
      }

      return;
    }

    const timer = window.setTimeout(() => {
      void loadSavedApp(appId);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadSavedApp, searchParams]);

  function updateBusiness(
    field: keyof Business,
    value: string,
  ) {
    setApp((current) => ({
      ...current,

      business: {
        ...current.business,

        [field]: value,
      },
    }));
  }

  function selectSection(id: string) {
    setActiveSection(id);

    if (id === "business") {
      setStep("business");
      return;
    }

    if (id === "contact") {
      setStep("contact");
      return;
    }

    setStep(id as Step);
  }

  const assistantContext = useMemo(
    () => ({
      businessName:
        app.business.name ||
        "your business",

      step,
    }),
    [
      app.business.name,
      step,
    ],
  );

  return (
    <main className="min-h-screen bg-zinc-100 text-zinc-950">

      {isLoadingSavedApp && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/75 p-6 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-zinc-200 bg-white p-7 text-center shadow-2xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-950">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            </div>
            <h2 className="mt-5 text-base font-bold text-zinc-950">
              Loading your app
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Restoring your saved business, pages, services and gallery.
            </p>
          </div>
        </div>
      )}

      {loadAppError && !isLoadingSavedApp && (
        <div className="fixed left-1/2 top-5 z-[110] w-[calc(100%-32px)] max-w-md -translate-x-1/2 rounded-2xl border border-red-200 bg-white px-5 py-4 shadow-xl">
          <p className="text-sm font-semibold text-red-700">
            Could not load your saved app
          </p>
          <p className="mt-1 text-xs leading-5 text-zinc-500">
            {loadAppError}
          </p>
          <button
            type="button"
            onClick={() => {
              const appId = searchParams.get("appId");
              if (appId) {
                loadedAppIdRef.current = null;
                void loadSavedApp(appId);
              }
            }}
            className="mt-3 rounded-lg bg-zinc-950 px-3 py-2 text-xs font-semibold text-white"
          >
            Try again
          </button>
        </div>
      )}

      {/* ======================================================
          HEADER
      ======================================================= */}

      <header className="relative flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-5">

        <div className="flex items-center gap-8">

          <Link
            href="/"
            className="text-lg font-bold tracking-tight"
          >
            <span>We</span>

            <span className="text-indigo-600">
              Make
            </span>

            <span>Apps</span>
          </Link>

          <div className="hidden h-6 w-px bg-zinc-200 sm:block" />

          <div className="hidden sm:block">

            <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-zinc-400">
              App builder
            </p>

            <p className="mt-0.5 text-xs font-semibold text-zinc-800">
              {app.business.name ||
                "Your new app"}
            </p>

          </div>

        </div>

        <div className="flex items-center gap-2">

          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="hidden rounded-lg border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 sm:block"
          >
            Preview
          </button>

          {currentUserEmail && (
            <>
              <button
                type="button"
                onClick={() => window.location.assign("/dashboard")}
                className="hidden rounded-lg border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 sm:block"
              >
                Dashboard
              </button>

              <button
                type="button"
                onClick={() => {
                  void handleBuilderSignOut();
                }}
                disabled={isSigningOut}
                className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-950 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSigningOut ? "Signing out..." : "Sign out"}
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => {
              void saveAppFlow();
            }}
            disabled={isSaving}
            className="rounded-lg bg-zinc-950 px-4 py-2 text-xs font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? "Saving..." : "Save App"}
          </button>

        </div>

        {(saveError || saveSuccess) && (
          <div className="absolute right-5 top-[68px] z-20 max-w-xs rounded-xl border border-zinc-200 bg-white px-3 py-2 text-[11px] shadow-sm">
            <p
              className={
                saveError
                  ? "font-medium text-red-600"
                  : "font-medium text-emerald-600"
              }
            >
              {saveError || saveSuccess}
            </p>
          </div>
        )}

      </header>

      {/* ======================================================
          MAIN
      ======================================================= */}

      <div className="grid min-h-[calc(100vh-64px)] lg:grid-cols-[220px_minmax(0,1fr)_390px]">

        {/* ====================================================
            LEFT SIDEBAR
        ===================================================== */}

        <aside className="hidden border-r border-zinc-200 bg-white lg:block">

          <div className="p-5">

            <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">
              Build your app
            </p>

            <div className="space-y-1">

              {navigationItems.map((item) => {

                const active =
                  activeSection ===
                  item.id;

                const complete =
                  item.id === "business"
                    ? isBusinessComplete(app)
                    : item.id === "contact"
                      ? isContactComplete(app)
                      : false;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      selectSection(
                        item.id,
                      )
                    }
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
                      active
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950"
                    }`}
                  >

                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs ${
                        active
                          ? "bg-white text-indigo-600 shadow-sm"
                          : complete
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-zinc-100 text-zinc-400"
                      }`}
                    >
                      {complete
                        ? "✓"
                        : item.icon}
                    </span>

                    <span className="flex-1 text-xs font-semibold">
                      {item.label}
                    </span>

                    {complete && (
                      <span className="text-[9px] font-medium text-emerald-500">
                        Done
                      </span>
                    )}

                  </button>
                );
              })}

            </div>

            {/* PROGRESS */}

            <div className="mt-8 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">

              <div className="flex items-center justify-between">

                <span className="text-[10px] font-semibold text-zinc-600">
                  Your progress
                </span>

                <span className="text-[10px] font-bold text-indigo-600">
                  {progress}%
                </span>

              </div>

              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-200">

                <div
                  className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                  style={{
                    width: `${Math.max(
                      progress,
                      3,
                    )}%`,
                  }}
                />

              </div>

              <p className="mt-3 text-[10px] leading-4 text-zinc-400">
                {progress === 0
                  ? "Start wherever you like."
                  : "Your changes update the preview automatically."}
              </p>

            </div>

            {/* HELP */}

            <button
              type="button"
              onClick={() =>
                setAssistantOpen(true)
              }
              className="mt-4 flex w-full items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-4 text-left transition hover:border-indigo-200 hover:bg-indigo-50"
            >

              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-sm text-indigo-600">
                ✨
              </span>

              <span>

                <span className="block text-[10px] font-bold text-zinc-800">
                  Need some help?
                </span>

                <span className="mt-1 block text-[9px] text-zinc-400">
                  Ask the assistant
                </span>

              </span>

            </button>

          </div>

        </aside>

        {/* ====================================================
            EDITOR
        ===================================================== */}

        <section className="min-w-0 overflow-y-auto bg-zinc-50">

          {/* MOBILE NAV */}

          <div className="sticky top-0 z-30 overflow-x-auto border-b border-zinc-200 bg-white px-4 lg:hidden">

            <div className="flex min-w-max gap-1 py-2">

              {navigationItems.map(
                (item) => (

                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      selectSection(
                        item.id,
                      )
                    }
                    className={`rounded-lg px-3 py-2 text-[11px] font-semibold ${
                      activeSection ===
                      item.id
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-zinc-500"
                    }`}
                  >
                    {item.label}
                  </button>

                ),
              )}

            </div>

          </div>

          <div className="mx-auto w-full max-w-3xl px-5 py-8 sm:px-8 lg:px-10">

            {/* ==================================================
                BUSINESS
            =================================================== */}

            {step === "business" && (

              <BusinessEditor
                business={
                  app.business
                }
                updateBusiness={
                  updateBusiness
                }
                nameInputRef={
                  nameInputRef
                }
              />

            )}

            {/* ==================================================
                DESCRIPTION
            =================================================== */}

            {step ===
              "description" && (

              <DescriptionEditor
                value={
                  app.business
                    .description
                }
                onChange={(value) =>
                  updateBusiness(
                    "description",
                    value,
                  )
                }
                inputRef={
                  descriptionRef
                }
              />

            )}

            {/* ==================================================
                CONTACT
            =================================================== */}

            {step === "contact" && (

              <ContactEditor
                business={app.business}
                updateBusiness={updateBusiness}
                phoneRef={phoneRef}
                settings={contactSettings}
                setSettings={setContactSettings}
              />

            )}

            {/* ==================================================
                APPEARANCE
            =================================================== */}

            {step ===
              "appearance" && (

              <AppearanceEditor
                color={
                  app.primaryColor
                }
                onChange={(color) =>
                  setApp(
                    (current) => ({
                      ...current,

                      primaryColor:
                        color,
                    }),
                  )
                }
              />

            )}

            {/* ==================================================
                PAGES
            =================================================== */}

            {step === "pages" && (

              <PagesEditor
                pages={pages}
                setPages={setPages}
              />

            )}

            {/* ==================================================
                SERVICES
            =================================================== */}

            {step === "services" && (

              <ServicesEditor
                services={services}
                setServices={setServices}
              />

            )}

            {/* ==================================================
                GALLERY
            =================================================== */}

            {step === "gallery" && (

              <GalleryEditor
                gallery={gallery}
                setGallery={setGallery}
              />

            )}

          </div>

        </section>

        {/* ====================================================
            PHONE PREVIEW
        ===================================================== */}

        <aside className="hidden border-l border-zinc-200 bg-white lg:block">

          <div className="sticky top-0 flex min-h-[calc(100vh-64px)] flex-col">

            <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">

              <div>

                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400">
                  Live preview
                </p>

                <p className="mt-1 text-xs font-semibold text-zinc-800">
                  {device === "ios"
                    ? "iOS App"
                    : "Android App"}
                </p>

              </div>

              <div className="flex rounded-lg border border-zinc-200 bg-zinc-50 p-1">

                <button
                  type="button"
                  onClick={() =>
                    setDevice("ios")
                  }
                  className={`rounded-md px-3 py-1.5 text-[10px] font-semibold transition ${
                    device === "ios"
                      ? "bg-white text-zinc-950 shadow-sm"
                      : "text-zinc-400"
                  }`}
                >
                  iOS
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setDevice("android")
                  }
                  className={`rounded-md px-3 py-1.5 text-[10px] font-semibold transition ${
                    device === "android"
                      ? "bg-white text-zinc-950 shadow-sm"
                      : "text-zinc-400"
                  }`}
                >
                  Android
                </button>

              </div>

            </div>

            <div className="flex flex-1 items-center justify-center overflow-hidden bg-zinc-100 p-6">

              <AppDevice
                device={device}
                app={app}
                pages={pages}
                services={services}
                gallery={gallery}
                contactSettings={contactSettings}
              />

            </div>

            <div className="border-t border-zinc-200 px-5 py-3">

              <div className="flex items-center justify-center gap-2">

                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                <span className="text-[10px] text-zinc-400">
                  Live — updates as you build
                </span>

              </div>

            </div>

          </div>

        </aside>

      </div>

      {previewOpen && (
        <PreviewExperience
          app={app}
          pages={pages}
          services={services}
          gallery={gallery}
          contactSettings={contactSettings}
          device={device}
          setDevice={setDevice}
          onClose={() => setPreviewOpen(false)}
        />
      )}

      <AuthPromptModal
        open={authOpen}
        mode={authMode}
        setMode={setAuthMode}
        email={authEmail}
        setEmail={setAuthEmail}
        password={authPassword}
        setPassword={setAuthPassword}
        confirmPassword={authConfirmPassword}
        setConfirmPassword={setAuthConfirmPassword}
        loading={authLoading}
        error={authError}
        onClearError={() => setAuthError(null)}
        onSubmit={() => {
          void submitAuth();
        }}
        onClose={() => {
          setAuthOpen(false);
          setAuthError(null);
          setAuthPassword("");
          setAuthConfirmPassword("");
        }}
      />

      {/* ======================================================
          ASSISTANT
      ======================================================= */}

      <AssistantWidget
        open={assistantOpen}
        setOpen={setAssistantOpen}
        context={assistantContext}
      />

    </main>
  );
}

function AuthPromptModal({
  open,
  mode,
  setMode,
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  loading,
  error,
  onClearError,
  onSubmit,
  onClose,
}: {
  open: boolean;
  mode: "signup" | "signin" | "check_email";
  setMode: (
    value: "signup" | "signin" | "check_email",
  ) => void;
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
  loading: boolean;
  error: string | null;
  onClearError: () => void;
  onSubmit: () => void;
  onClose: () => void;
}) {
  const emailInputRef =
    useRef<HTMLInputElement>(null);
  const passwordInputRef =
    useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (mode === "signup") {
      emailInputRef.current?.focus();
      return;
    }

    if (mode === "signin") {
      emailInputRef.current?.focus();
    }
  }, [open, mode]);

  if (!open) {
    return null;
  }

  const isSignUp = mode === "signup";
  const isCheckEmail = mode === "check_email";

  if (isCheckEmail) {
    return (
      <div className="fixed inset-0 z-[120] flex items-center justify-center bg-zinc-950/45 px-4">
        <div className="w-full max-w-md overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-[0_28px_80px_rgba(0,0,0,0.25)]">
          <div className="flex items-start justify-between border-b border-zinc-100 px-6 py-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-indigo-600">
                WeMakeApps
              </p>

              <h3 className="mt-2 text-2xl font-bold tracking-tight text-zinc-950">
                Check your email
              </h3>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="ml-4 flex h-8 w-8 items-center justify-center rounded-lg text-lg text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
              aria-label="Close auth dialog"
            >
              ×
            </button>
          </div>

          <div className="space-y-5 px-6 py-5">
            <div className="space-y-2">
              <p className="text-sm leading-6 text-zinc-600">
                We&apos;ve created your account.
              </p>

              <p className="text-sm leading-6 text-zinc-600">
                If email confirmation is enabled, we sent a confirmation link to:
              </p>

              <p className="break-all rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-semibold text-zinc-900">
                {email}
              </p>
            </div>

            <p className="text-sm leading-6 text-zinc-500">
              Check your inbox and spam folder, then return here to finish saving your app.
            </p>

            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setPassword("");
                onClearError();
              }}
              disabled={loading}
              className="h-11 w-full rounded-xl bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-55"
            >
              {loading ? "Please wait..." : "I've confirmed my email — Sign in"}
            </button>

            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setEmail("");
                setPassword("");
                setConfirmPassword("");
                onClearError();
              }}
              className="w-full text-center text-sm font-semibold text-zinc-700 underline-offset-2 hover:underline"
            >
              Use a different email
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-zinc-950/45 px-4">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-[0_28px_80px_rgba(0,0,0,0.25)]">
        <div className="flex items-start justify-between border-b border-zinc-100 px-6 py-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-indigo-600">
              WeMakeApps
            </p>

            <h3 className="mt-2 text-2xl font-bold tracking-tight text-zinc-950">
              {loading && mode === "signin"
                ? "Saving your app..."
                : "Save your app"}
            </h3>

            <p className="mt-2 text-sm leading-6 text-zinc-500">
              {isSignUp
                ? "Create a free account to save your progress and come back anytime."
                : "Sign in to continue saving your progress."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="ml-4 flex h-8 w-8 items-center justify-center rounded-lg text-lg text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
            aria-label="Close auth dialog"
          >
            ×
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-800">
              Email
            </label>
            <input
              ref={emailInputRef}
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="you@business.com"
              className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-800">
              Password
            </label>
            <input
              ref={passwordInputRef}
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder={isSignUp ? "At least 6 characters" : "Enter your password"}
              className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400"
            />
          </div>

          {isSignUp && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-800">
                Confirm password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                placeholder="Repeat your password"
                className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400"
              />
            </div>
          )}

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={onSubmit}
            disabled={loading}
            className="h-11 w-full rounded-xl bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-55"
          >
            {loading
              ? "Please wait..."
              : isSignUp
                ? "Create account"
                : "Sign in"}
          </button>

          <div className="text-center text-xs text-zinc-500">
            {isSignUp ? (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("signin");
                    setPassword("");
                    setConfirmPassword("");
                    onClearError();
                  }}
                  className="font-semibold text-zinc-900 underline-offset-2 hover:underline"
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                Need an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setPassword("");
                    setConfirmPassword("");
                    onClearError();
                  }}
                  className="font-semibold text-zinc-900 underline-offset-2 hover:underline"
                >
                  Create one
                </button>
              </>
            )}
          </div>

          <p className="text-center text-[11px] text-zinc-400">
            No credit card required.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   BUSINESS EDITOR
============================================================ */

function BusinessEditor({
  business,
  updateBusiness,
  nameInputRef,
}: {
  business: Business;

  updateBusiness: (
    field: keyof Business,
    value: string,
  ) => void;

  nameInputRef:
    RefObject<HTMLInputElement | null>;
}) {
  return (
    <div>

      <SectionHeading
        eyebrow="Business"
        title="Tell us about your business."
        description="Start with the basics. You can change these details at any time."
      />

      <div className="mt-8 max-w-xl space-y-7">

        <ModernField
          label="Business name"
          description="The name customers know you by."
          required
        >

          <input
            ref={nameInputRef}
            value={business.name}
            onChange={(event) =>
              updateBusiness(
                "name",
                event.target.value,
              )
            }
            placeholder="e.g. ABC Plumbing"
            className="builder-input"
          />

        </ModernField>

        <ModernField
          label="Business description"
          description="A short introduction customers can understand quickly."
        >

          <textarea
            value={
              business.description
            }
            onChange={(event) =>
              updateBusiness(
                "description",
                event.target.value,
              )
            }
            placeholder="e.g. Professional plumbing services available 24/7."
            rows={5}
            className="builder-input resize-none"
          />

        </ModernField>

        <InfoCard
          title="You can change everything later"
          text="Don't worry about getting the wording perfect. Your app content can be edited whenever you want."
        />

      </div>

    </div>
  );
}

/* ============================================================
   DESCRIPTION EDITOR
============================================================ */

function DescriptionEditor({
  value,
  onChange,
  inputRef,
}: {
  value: string;
  onChange: (value: string) => void;

  inputRef:
    RefObject<HTMLTextAreaElement | null>;
}) {
  return (
    <div>

      <SectionHeading
        eyebrow="Business"
        title="Tell customers what you do."
        description="A clear description helps customers understand your business at a glance."
      />

      <div className="mt-8 max-w-xl">

        <ModernField
          label="Business description"
          description="This can appear on your app's home screen."
          required
        >

          <textarea
            ref={inputRef}
            value={value}
            onChange={(event) =>
              onChange(
                event.target.value,
              )
            }
            placeholder="e.g. Professional plumbing services available 24/7."
            rows={6}
            className="builder-input resize-none"
          />

        </ModernField>

        <InfoCard
          title="Keep it customer-friendly"
          text="Imagine explaining your business to somebody who has never heard of it before."
          className="mt-5"
        />

      </div>

    </div>
  );
}

/* ============================================================
   CONTACT EDITOR
============================================================ */

function ContactEditor({
  business,
  updateBusiness,
  phoneRef,
  settings,
  setSettings,
}: {
  business: Business;
  updateBusiness: (
    field: keyof Business,
    value: string,
  ) => void;
  phoneRef: RefObject<HTMLInputElement | null>;
  settings: ContactSettings;
  setSettings: Dispatch<SetStateAction<ContactSettings>>;
}) {
  const methods: {
    key: ContactMethod;
    label: string;
    description: string;
    value: string;
    icon: string;
    field: keyof Business;
  }[] = [
    {
      key: "phone",
      label: "Phone",
      description: "Let customers call your business.",
      value: business.phone,
      icon: "☎",
      field: "phone",
    },
    {
      key: "whatsapp",
      label: "WhatsApp",
      description: "Let customers start a WhatsApp conversation.",
      value: business.whatsapp,
      icon: "◉",
      field: "whatsapp",
    },
    {
      key: "email",
      label: "Email",
      description: "Give customers a direct email option.",
      value: business.email,
      icon: "✉",
      field: "email",
    },
    {
      key: "address",
      label: "Address",
      description: "Show customers where they can find you.",
      value: business.address,
      icon: "⌖",
      field: "address",
    },
  ];

  function isVisible(key: ContactMethod) {
    return settings[
      `show${key.charAt(0).toUpperCase()}${key.slice(1)}` as
        | "showPhone"
        | "showWhatsapp"
        | "showEmail"
        | "showAddress"
    ];
  }

  function toggleMethod(key: ContactMethod) {
    const settingKey = `show${key.charAt(0).toUpperCase()}${key.slice(1)}` as
      | "showPhone"
      | "showWhatsapp"
      | "showEmail"
      | "showAddress";

    setSettings((current) => ({
      ...current,
      [settingKey]: !current[settingKey],
    }));
  }

  const activeMethods = methods.filter(
    (method) => method.value.trim() && isVisible(method.key),
  ).length;

  return (
    <div>
      <SectionHeading
        eyebrow="Contact"
        title="Make it easy to reach you."
        description="Choose how customers can contact your business. Only the options you turn on will appear in the finished app."
      />

      <div className="mt-7 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-sm font-bold text-indigo-600">
          {activeMethods}
        </div>
        <div>
          <p className="text-xs font-semibold text-zinc-800">
            {activeMethods} active contact{" "}
            {activeMethods === 1 ? "option" : "options"}
          </p>
          <p className="mt-0.5 text-[10px] text-zinc-400">
            Your contact buttons update the phone preview automatically.
          </p>
        </div>
      </div>

      <div className="mt-8 max-w-2xl space-y-3">
        {methods.map((method) => {
          const settingVisible = isVisible(method.key);

          return (
            <div
              key={method.key}
              className={`rounded-2xl border bg-white p-5 transition ${
                settingVisible
                  ? "border-zinc-200"
                  : "border-zinc-200 opacity-60"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-sm text-indigo-600">
                  {method.icon}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-zinc-900">
                    {method.label}
                  </p>
                  <p className="mt-1 text-[10px] text-zinc-400">
                    {method.description}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => toggleMethod(method.key)}
                  className={`relative h-6 w-10 shrink-0 rounded-full transition ${
                    settingVisible
                      ? "bg-indigo-600"
                      : "bg-zinc-200"
                  }`}
                  aria-label={`${settingVisible ? "Hide" : "Show"} ${method.label}`}
                >
                  <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
                      settingVisible ? "left-5" : "left-1"
                    }`}
                  />
                </button>
              </div>

              <div className="mt-4 border-t border-zinc-100 pt-4">
                <ModernField
                  label={`${method.label} details`}
                  description={
                    method.key === "address"
                      ? "The address customers should see."
                      : method.description
                  }
                  required={method.key === "phone"}
                >
                  <input
                    ref={method.key === "phone" ? phoneRef : undefined}
                    value={method.value}
                    onChange={(event) =>
                      updateBusiness(
                        method.field,
                        event.target.value,
                      )
                    }
                    placeholder={
                      method.key === "phone" || method.key === "whatsapp"
                        ? "+27 82 123 4567"
                        : method.key === "email"
                          ? "hello@business.co.za"
                          : "123 Main Street, Johannesburg"
                    }
                    type={
                      method.key === "email"
                        ? "email"
                        : method.key === "phone" || method.key === "whatsapp"
                          ? "tel"
                          : "text"
                    }
                    className="builder-input"
                  />
                </ModernField>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 max-w-2xl rounded-2xl border border-zinc-200 bg-white p-6">
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="text-sm font-bold text-zinc-900">
              Business hours
            </p>
            <p className="mt-1 text-xs leading-5 text-zinc-400">
              Optional. Give customers an idea of when you&apos;re available.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setSettings((current) => ({
                ...current,
                showHours: !current.showHours,
              }))
            }
            className={`relative mt-0.5 h-6 w-10 shrink-0 rounded-full transition ${
              settings.showHours ? "bg-indigo-600" : "bg-zinc-200"
            }`}
            aria-label={`${settings.showHours ? "Hide" : "Show"} business hours`}
          >
            <span
              className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
                settings.showHours ? "left-5" : "left-1"
              }`}
            />
          </button>
        </div>

        {settings.showHours && (
          <div className="mt-5">
            <ModernField
              label="Hours"
              description="Keep this short for the app."
            >
              <input
                value={settings.hours}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    hours: event.target.value,
                  }))
                }
                placeholder="Mon – Fri 08:00 – 17:00"
                className="builder-input"
              />
            </ModernField>
          </div>
        )}
      </div>

      <InfoCard
        className="mt-6 max-w-2xl"
        title="Keep contact simple"
        text="Customers should be able to find the right way to reach you in seconds. You don't need to enable every option."
      />
    </div>
  );
}

/* ============================================================
   APPEARANCE
============================================================ */

function AppearanceEditor({
  color,
  onChange,
}: {
  color: string;
  onChange: (color: string) => void;
}) {
  const colours = [
    "#4F46E5",
    "#2563EB",
    "#0891B2",
    "#059669",
    "#CA8A04",
    "#EA580C",
    "#DC2626",
    "#9333EA",
  ];

  return (
    <div>

      <SectionHeading
        eyebrow="Appearance"
        title="Make it look like your brand."
        description="Choose your primary colour and see the result immediately."
      />

      <div className="mt-8 max-w-xl rounded-2xl border border-zinc-200 bg-white p-6">

        <p className="text-sm font-semibold text-zinc-900">
          Primary colour
        </p>

        <p className="mt-1 text-xs text-zinc-400">
          Used for buttons, highlights and branding.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">

          {colours.map(
            (colour) => (

              <button
                key={colour}
                type="button"
                onClick={() =>
                  onChange(
                    colour,
                  )
                }
                className={`h-10 w-10 rounded-full transition ${
                  color === colour
                    ? "scale-110 ring-2 ring-zinc-950 ring-offset-2"
                    : "hover:scale-105"
                }`}
                style={{
                  backgroundColor:
                    colour,
                }}
                aria-label={`Choose ${colour}`}
              />

            ),
          )}

        </div>

      </div>

    </div>
  );
}

/* ============================================================
   PAGES EDITOR
============================================================ */

function PagesEditor({
  pages,
  setPages,
}: {
  pages: AppPage[];

  setPages: Dispatch<
    SetStateAction<AppPage[]>
  >;
}) {
  const enabledPages =
    pages.filter(
      (page) => page.enabled,
    );

  function togglePage(id: string) {
    setPages((current) =>
      current.map((page) => {

        if (page.id !== id) {
          return page;
        }

        /*
         * Home is a required system page.
         * We don't allow it to be removed.
         */

        if (page.system) {
          return page;
        }

        return {
          ...page,
          enabled: !page.enabled,
        };
      }),
    );
  }

  return (
    <div>

      {/* HEADER */}

      <div className="max-w-2xl">

        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-600">
          Pages
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-950">
          Build the structure of your app.
        </h1>

        <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-500">
          Choose the pages your customers need.
          You can add, remove and change them later.
        </p>

      </div>

      {/* PAGE COUNT */}

      <div className="mt-7 flex items-center gap-3">

        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-sm font-bold text-indigo-600">
          {enabledPages.length}
        </div>

        <div>

          <p className="text-xs font-semibold text-zinc-800">
            {enabledPages.length === 1
              ? "Page selected"
              : "Pages selected"}
          </p>

          <p className="mt-0.5 text-[10px] text-zinc-400">
            Your navigation will update automatically.
          </p>

        </div>

      </div>

      {/* RECOMMENDED */}

      <div className="mt-8">

        <div className="mb-3">

          <p className="text-xs font-bold text-zinc-900">
            Recommended for your app
          </p>

          <p className="mt-1 text-[11px] text-zinc-400">
            Start with the essentials. You can expand
            your app later.
          </p>

        </div>

        <div className="max-w-2xl overflow-hidden rounded-2xl border border-zinc-200 bg-white">

          {pages.map(
            (page, index) => (

              <PageOption
                key={page.id}
                page={page}
                first={
                  index === 0
                }
                last={
                  index ===
                  pages.length - 1
                }
                onToggle={() =>
                  togglePage(
                    page.id,
                  )
                }
              />

            ),
          )}

        </div>

      </div>

      {/* CUSTOM PAGE */}

      <button
        type="button"
        className="mt-4 flex w-full max-w-2xl items-center gap-4 rounded-2xl border border-dashed border-zinc-300 bg-white p-5 text-left transition hover:border-indigo-300 hover:bg-indigo-50"
      >

        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-lg text-zinc-500">
          +
        </span>

        <span>

          <span className="block text-xs font-bold text-zinc-800">
            Add a custom page
          </span>

          <span className="mt-1 block text-[10px] text-zinc-400">
            Create a page specifically for your business.
          </span>

        </span>

        <span className="ml-auto text-zinc-300">
          →
        </span>

      </button>

      {/* TIP */}

      <div className="mt-6 max-w-2xl rounded-2xl border border-zinc-200 bg-zinc-50 p-5">

        <div className="flex gap-3">

          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-sm shadow-sm">
            ✨
          </div>

          <div>

            <p className="text-xs font-semibold text-zinc-800">
              Don&apos;t overcomplicate it
            </p>

            <p className="mt-1 text-xs leading-5 text-zinc-400">
              Most businesses only need a handful of
              useful pages. Focus on what your customers
              actually need.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

/* ============================================================
   PAGE OPTION
============================================================ */

function PageOption({
  page,
  last,
  onToggle,
}: {
  page: AppPage;
  first: boolean;
  last: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={`flex items-center gap-4 p-5 transition ${
        !last
          ? "border-b border-zinc-100"
          : ""
      } ${
        page.enabled
          ? "bg-white"
          : "bg-zinc-50/50"
      }`}
    >

      {/* ICON */}

      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm transition ${
          page.enabled
            ? "bg-indigo-50 text-indigo-600"
            : "bg-zinc-100 text-zinc-400"
        }`}
      >
        {page.icon}
      </div>

      {/* INFORMATION */}

      <div className="min-w-0 flex-1">

        <div className="flex items-center gap-2">

          <p className="text-sm font-semibold text-zinc-900">
            {page.name}
          </p>

          {page.system && (
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[8px] font-semibold text-zinc-400">
              Required
            </span>
          )}

        </div>

        <p className="mt-1 text-[11px] leading-5 text-zinc-400">
          {page.description}
        </p>

      </div>

      {/* STATUS */}

      {page.enabled ? (

        <button
          type="button"
          onClick={onToggle}
          disabled={page.system}
          className={`shrink-0 rounded-lg px-3 py-2 text-[10px] font-bold ${
            page.system
              ? "cursor-default bg-emerald-50 text-emerald-600"
              : "bg-indigo-50 text-indigo-600 transition hover:bg-indigo-100"
          }`}
        >
          {page.system
            ? "Included"
            : "Added"}
        </button>

      ) : (

        <button
          type="button"
          onClick={onToggle}
          className="shrink-0 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-[10px] font-bold text-zinc-500 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
        >
          + Add
        </button>

      )}

    </div>
  );
}

/* ============================================================
   SERVICES EDITOR
============================================================ */

function ServicesEditor({
  services,
  setServices,
}: {
  services: AppService[];
  setServices: Dispatch<SetStateAction<AppService[]>>;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");

  function resetForm() {
    setEditingId(null);
    setAdding(false);
    setName("");
    setDescription("");
    setPrice("");
  }

  function saveService() {
    if (!name.trim()) return;

    if (editingId) {
      setServices((current) =>
        current.map((service) =>
          service.id === editingId
            ? {
                ...service,
                name: name.trim(),
                description: description.trim(),
                price: price.trim(),
              }
            : service,
        ),
      );
    } else {
      setServices((current) => [
        ...current,
        {
          id: `service-${Date.now()}`,
          name: name.trim(),
          description: description.trim(),
          price: price.trim(),
          enabled: true,
        },
      ]);
    }

    resetForm();
  }

  function editService(service: AppService) {
    setEditingId(service.id);
    setName(service.name);
    setDescription(service.description);
    setPrice(service.price);
    setAdding(true);
  }

  function deleteService(id: string) {
    setServices((current) =>
      current.filter((service) => service.id !== id),
    );
    if (editingId === id) resetForm();
  }

  function toggleService(id: string) {
    setServices((current) =>
      current.map((service) =>
        service.id === id
          ? { ...service, enabled: !service.enabled }
          : service,
      ),
    );
  }

  return (
    <div>
      <SectionHeading
        eyebrow="Services"
        title="Tell customers what you offer."
        description="Add the services, products or packages you want customers to see."
      />

      <div className="mt-7 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-sm font-bold text-indigo-600">
          {services.filter((service) => service.enabled).length}
        </div>
        <div>
          <p className="text-xs font-semibold text-zinc-800">
            {services.filter((service) => service.enabled).length} active{" "}
            {services.filter((service) => service.enabled).length === 1
              ? "service"
              : "services"}
          </p>
          <p className="mt-0.5 text-[10px] text-zinc-400">
            Changes appear in your preview automatically.
          </p>
        </div>
      </div>

      <div className="mt-8 max-w-2xl">
        {services.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-lg text-indigo-600">
              ☷
            </div>
            <p className="mt-4 text-sm font-bold text-zinc-900">
              No services yet
            </p>
            <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-zinc-400">
              Add the services or products you want customers to see.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {services.map((service) => (
              <div
                key={service.id}
                className={`rounded-2xl border bg-white p-5 transition ${
                  service.enabled
                    ? "border-zinc-200"
                    : "border-zinc-200 opacity-60"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-sm font-bold text-indigo-600">
                    ☷
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-zinc-900">
                        {service.name}
                      </h3>
                      {!service.enabled && (
                        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[8px] font-semibold text-zinc-400">
                          Hidden
                        </span>
                      )}
                    </div>

                    {service.description && (
                      <p className="mt-1.5 text-xs leading-5 text-zinc-400">
                        {service.description}
                      </p>
                    )}

                    {service.price && (
                      <p className="mt-3 text-xs font-bold text-zinc-800">
                        {service.price}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => toggleService(service.id)}
                      className="rounded-lg px-2.5 py-2 text-[9px] font-semibold text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
                    >
                      {service.enabled ? "Hide" : "Show"}
                    </button>
                    <button
                      type="button"
                      onClick={() => editService(service)}
                      className="rounded-lg px-2.5 py-2 text-[9px] font-semibold text-zinc-400 transition hover:bg-indigo-50 hover:text-indigo-600"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteService(service.id)}
                      className="rounded-lg px-2.5 py-2 text-[9px] font-semibold text-zinc-400 transition hover:bg-red-50 hover:text-red-500"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {!adding && (
        <button
          type="button"
          onClick={() => {
            resetForm();
            setAdding(true);
          }}
          className="mt-4 flex w-full max-w-2xl items-center gap-4 rounded-2xl border border-dashed border-zinc-300 bg-white p-5 text-left transition hover:border-indigo-300 hover:bg-indigo-50"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-lg text-zinc-500">
            +
          </span>
          <span>
            <span className="block text-xs font-bold text-zinc-800">
              Add a service
            </span>
            <span className="mt-1 block text-[10px] text-zinc-400">
              Add another service, product or package.
            </span>
          </span>
          <span className="ml-auto text-zinc-300">→</span>
        </button>
      )}

      {adding && (
        <div className="mt-5 max-w-2xl rounded-2xl border border-zinc-200 bg-white p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-bold text-zinc-900">
                {editingId ? "Edit service" : "Add a service"}
              </p>
              <p className="mt-1 text-xs text-zinc-400">
                Keep it simple and easy to scan.
              </p>
            </div>

            <button
              type="button"
              onClick={resetForm}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-lg text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
            >
              ×
            </button>
          </div>

          <div className="mt-6 space-y-6">
            <ModernField
              label="Service name"
              description="What should customers call this service?"
              required
            >
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Geyser Installation"
                className="builder-input"
              />
            </ModernField>

            <ModernField
              label="Description"
              description="Briefly explain what the service includes."
            >
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="e.g. Professional geyser installation and replacement."
                rows={4}
                className="builder-input resize-none"
              />
            </ModernField>

            <ModernField
              label="Price"
              description="Optional. Leave blank if customers should enquire."
            >
              <input
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                placeholder="e.g. From R1,500"
                className="builder-input"
              />
            </ModernField>
          </div>

          <div className="mt-7 flex items-center justify-end gap-2 border-t border-zinc-100 pt-5">
            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl px-4 py-2.5 text-xs font-semibold text-zinc-500 transition hover:bg-zinc-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={saveService}
              disabled={!name.trim()}
              className="rounded-xl bg-zinc-950 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {editingId ? "Save changes" : "Add service"}
            </button>
          </div>
        </div>
      )}

      <InfoCard
        className="mt-6"
        title="You don't have to show prices"
        text="Leave the price blank if customers normally request a quote."
      />
    </div>
  );
}

/* ============================================================
   GALLERY EDITOR
============================================================ */

function GalleryEditor({
  gallery,
  setGallery,
}: {
  gallery: GalleryItem[];
  setGallery: Dispatch<SetStateAction<GalleryItem[]>>;
}) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [failedPreviewUrl, setFailedPreviewUrl] = useState<string | null>(null);

  function isHttpUrl(value: string) {
    try {
      const parsed = new URL(value);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  }

  function normalizeImageUrl(rawUrl: string) {
    const trimmedUrl = rawUrl.trim();

    if (!trimmedUrl) {
      return "";
    }

    try {
      const parsedUrl = new URL(trimmedUrl);

      if (
        parsedUrl.hostname === "google.com" ||
        parsedUrl.hostname === "www.google.com"
      ) {
        const imageUrlFromSearch = parsedUrl.searchParams.get("imgurl");

        if (
          imageUrlFromSearch &&
          isHttpUrl(imageUrlFromSearch)
        ) {
          return imageUrlFromSearch;
        }
      }

      if (
        parsedUrl.hostname === "unsplash.com" ||
        parsedUrl.hostname === "www.unsplash.com"
      ) {
        const photoMatch = parsedUrl.pathname.match(
          /^\/photos\/(?:[^/]+-)?([A-Za-z0-9_-]+)\/?$/,
        );

        if (photoMatch?.[1]) {
          return `https://unsplash.com/photos/${photoMatch[1]}/download?force=true&w=1200`;
        }
      }
    } catch {
      return trimmedUrl;
    }

    return trimmedUrl;
  }

  function resetForm() {
    setAdding(false);
    setEditingId(null);
    setTitle("");
    setDescription("");
    setImageUrl("");
    setFailedPreviewUrl(null);
  }

  function saveItem() {
    const resolvedImageUrl = normalizeImageUrl(imageUrl);

    if (!resolvedImageUrl) return;

    if (editingId) {
      setGallery((current) =>
        current.map((item) =>
          item.id === editingId
            ? {
                ...item,
                title: title.trim(),
                description: description.trim(),
                imageUrl: resolvedImageUrl,
              }
            : item,
        ),
      );
    } else {
      setGallery((current) => [
        ...current,
        {
          id: `gallery-${Date.now()}`,
          title: title.trim(),
          description: description.trim(),
          imageUrl: resolvedImageUrl,
          enabled: true,
        },
      ]);
    }

    resetForm();
  }

  function editItem(item: GalleryItem) {
    setEditingId(item.id);
    setTitle(item.title);
    setDescription(item.description);
    setImageUrl(item.imageUrl);
    setAdding(true);
  }

  function deleteItem(id: string) {
    setGallery((current) =>
      current.filter((item) => item.id !== id),
    );
    if (editingId === id) resetForm();
  }

  function toggleItem(id: string) {
    setGallery((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, enabled: !item.enabled }
          : item,
      ),
    );
  }

  const previewImageUrl =
    normalizeImageUrl(imageUrl);

  const previewLoadFailed =
    Boolean(previewImageUrl) &&
    failedPreviewUrl === previewImageUrl;

  return (
    <div>
      <SectionHeading
        eyebrow="Gallery"
        title="Show people what you do."
        description="Add photos of your work, products, team or premises. Real images make an app feel trustworthy."
      />

      <div className="mt-7 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-sm font-bold text-indigo-600">
          {gallery.filter((item) => item.enabled).length}
        </div>
        <div>
          <p className="text-xs font-semibold text-zinc-800">
            {gallery.filter((item) => item.enabled).length} active{" "}
            {gallery.filter((item) => item.enabled).length === 1
              ? "photo"
              : "photos"}
          </p>
          <p className="mt-0.5 text-[10px] text-zinc-400">
            Your gallery will appear in the live preview.
          </p>
        </div>
      </div>

      {gallery.length > 0 && (
        <div className="mt-8 grid max-w-2xl gap-4 sm:grid-cols-2">
          {gallery.map((item) => (
            <div
              key={item.id}
              className={`overflow-hidden rounded-2xl border bg-white ${
                item.enabled ? "border-zinc-200" : "border-zinc-200 opacity-60"
              }`}
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  key={item.imageUrl}
                  src={item.imageUrl}
                  alt={item.title || "Gallery image"}
                  className="h-full w-full object-cover"
                />

                {!item.enabled && (
                  <div className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[8px] font-bold text-zinc-500">
                    Hidden
                  </div>
                )}
              </div>

              <div className="p-4">
                <p className="truncate text-xs font-bold text-zinc-900">
                  {item.title || "Untitled photo"}
                </p>

                {item.description && (
                  <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-zinc-400">
                    {item.description}
                  </p>
                )}

                <div className="mt-4 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => toggleItem(item.id)}
                    className="rounded-lg px-2.5 py-2 text-[9px] font-semibold text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
                  >
                    {item.enabled ? "Hide" : "Show"}
                  </button>
                  <button
                    type="button"
                    onClick={() => editItem(item)}
                    className="rounded-lg px-2.5 py-2 text-[9px] font-semibold text-zinc-400 transition hover:bg-indigo-50 hover:text-indigo-600"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteItem(item.id)}
                    className="rounded-lg px-2.5 py-2 text-[9px] font-semibold text-zinc-400 transition hover:bg-red-50 hover:text-red-500"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!adding && (
        <button
          type="button"
          onClick={() => {
            resetForm();
            setAdding(true);
          }}
          className={`${gallery.length ? "mt-4" : "mt-8"} flex w-full max-w-2xl items-center gap-4 rounded-2xl border border-dashed border-zinc-300 bg-white p-5 text-left transition hover:border-indigo-300 hover:bg-indigo-50`}
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-lg text-zinc-500">
            +
          </span>
          <span>
            <span className="block text-xs font-bold text-zinc-800">
              Add a photo
            </span>
            <span className="mt-1 block text-[10px] text-zinc-400">
              Start with a photo URL for now. File uploads come next.
            </span>
          </span>
          <span className="ml-auto text-zinc-300">→</span>
        </button>
      )}

      {adding && (
        <div className="mt-5 max-w-2xl rounded-2xl border border-zinc-200 bg-white p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-bold text-zinc-900">
                {editingId ? "Edit photo" : "Add a photo"}
              </p>
              <p className="mt-1 text-xs text-zinc-400">
                Give the image a little context if it needs it.
              </p>
            </div>

            <button
              type="button"
              onClick={resetForm}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-lg text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
            >
              ×
            </button>
          </div>

          <div className="mt-6 space-y-6">
            <ModernField
              label="Image URL"
              description="Paste a publicly accessible image URL."
              required
            >
              <input
                value={imageUrl}
                onChange={(event) => setImageUrl(event.target.value)}
                placeholder="https://example.com/my-photo.jpg"
                type="url"
                className="builder-input"
              />
            </ModernField>

            {previewImageUrl && (
              <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50">
                <div className="aspect-[16/9]">
                  {previewLoadFailed ? (
                    <div className="flex h-full items-center justify-center px-4 text-center text-xs text-zinc-500">
                      Could not load this image URL.
                    </div>
                  ) : (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        key={previewImageUrl}
                        src={previewImageUrl}
                        alt="Gallery preview"
                        className="h-full w-full object-cover"
                        onError={() => {
                          setFailedPreviewUrl(previewImageUrl);
                        }}
                      />
                    </>
                  )}
                </div>
              </div>
            )}

            <ModernField
              label="Title"
              description="Optional. A short title works best."
            >
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Recent bathroom renovation"
                className="builder-input"
              />
            </ModernField>

            <ModernField
              label="Description"
              description="Optional. Add a little more context about the photo."
            >
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="e.g. Complete bathroom renovation completed in Johannesburg."
                rows={3}
                className="builder-input resize-none"
              />
            </ModernField>
          </div>

          <div className="mt-7 flex items-center justify-end gap-2 border-t border-zinc-100 pt-5">
            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl px-4 py-2.5 text-xs font-semibold text-zinc-500 transition hover:bg-zinc-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={saveItem}
              disabled={!imageUrl.trim()}
              className="rounded-xl bg-zinc-950 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {editingId ? "Save changes" : "Add photo"}
            </button>
          </div>
        </div>
      )}

      <InfoCard
        className="mt-6"
        title="Use real photos"
        text="Good photos of your work, products or premises will make the finished app feel much more credible."
      />
    </div>
  );
}

/* ============================================================
   SIMPLE SECTION
============================================================ */

/* ============================================================
   SECTION HEADING
============================================================ */

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-xl">

      {eyebrow && (
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-600">
          {eyebrow}
        </p>
      )}

      <h1 className="mt-2 text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl">
        {title}
      </h1>

      <p className="mt-3 text-sm leading-6 text-zinc-500">
        {description}
      </p>

    </div>
  );
}

/* ============================================================
   MODERN FIELD
============================================================ */

function ModernField({
  label,
  description,
  required = false,
  children,
}: {
  label: string;
  description: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="w-full">

      <div className="mb-2.5">

        <label className="text-sm font-semibold text-zinc-900">

          {label}

          {required && (
            <span className="ml-1 text-indigo-600">
              *
            </span>
          )}

        </label>

        <p className="mt-1 text-xs text-zinc-400">
          {description}
        </p>

      </div>

      <div className="field-shell">
        {children}
      </div>

    </div>
  );
}

/* ============================================================
   INFO CARD
============================================================ */

function InfoCard({
  title,
  text,
  className = "",
}: {
  title: string;
  text: string;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-zinc-200 bg-white p-5 ${className}`}
    >

      <div className="flex gap-3">

        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-sm text-indigo-600">
          ✨
        </div>

        <div>

          <p className="text-xs font-semibold text-zinc-800">
            {title}
          </p>

          <p className="mt-1 text-xs leading-5 text-zinc-400">
            {text}
          </p>

        </div>

      </div>

    </div>
  );
}

/* ============================================================
   FULL-SCREEN PREVIEW
============================================================ */

function PreviewExperience({
  app,
  pages,
  services,
  gallery,
  contactSettings,
  device,
  setDevice,
  onClose,
}: {
  app: AppConfig;
  pages: AppPage[];
  services: AppService[];
  gallery: GalleryItem[];
  contactSettings: ContactSettings;
  device: Device;
  setDevice: (device: Device) => void;
  onClose: () => void;
}) {
  const [selectedPresetId, setSelectedPresetId] =
    useState<string>("live");

  const selectedPreset =
    industryPreviewPresets.find(
      (preset) => preset.id === selectedPresetId,
    ) || industryPreviewPresets[0];

  const usingPreset =
    selectedPreset.id !== "live";

  const previewApp = useMemo(() => {
    if (!usingPreset) {
      return app;
    }

    return {
      ...app,

      primaryColor:
        selectedPreset.primaryColor,

      business: {
        ...app.business,
        name: selectedPreset.businessName,
        description:
          selectedPreset.description,
        phone: selectedPreset.phone,
        whatsapp:
          selectedPreset.whatsapp,
        email: selectedPreset.email,
        address:
          selectedPreset.address,
      },
    };
  }, [
    app,
    selectedPreset,
    usingPreset,
  ]);

  const previewServices =
    usingPreset &&
    selectedPreset.services.length > 0
      ? selectedPreset.services
      : services;

  const previewGallery =
    usingPreset &&
    selectedPreset.gallery.length > 0
      ? selectedPreset.gallery
      : gallery;

  const previewContactSettings =
    useMemo(
      () => ({
        ...contactSettings,
        showPhone: true,
        showWhatsapp: true,
        showEmail: true,
        showAddress: true,
      }),
      [contactSettings],
    );

  const businessName =
    previewApp.business.name.trim() ||
    "Your Business";

  const enabledGalleryCount =
    previewGallery.filter(
      (item) => item.enabled,
    ).length;

  const hasContactPreview = Boolean(
    (previewContactSettings.showPhone && previewApp.business.phone.trim()) ||
      (previewContactSettings.showWhatsapp && previewApp.business.whatsapp.trim()) ||
      (previewContactSettings.showEmail && previewApp.business.email.trim()) ||
      (previewContactSettings.showAddress && previewApp.business.address.trim()),
  );

  const guidedStops = useMemo(
    () =>
      guidedPreviewStops.filter((stop) => {
        if (stop.target === "gallery") {
          return enabledGalleryCount > 0;
        }

        if (stop.target === "contact") {
          return hasContactPreview;
        }

        return true;
      }),
    [
      enabledGalleryCount,
      hasContactPreview,
    ],
  );

  const [demoMomentIndex, setDemoMomentIndex] =
    useState(0);

  const [guidedIndex, setGuidedIndex] =
    useState(0);

  const [guidedAutoplay, setGuidedAutoplay] =
    useState(true);

  const [leadOpen, setLeadOpen] =
    useState(false);

  const [leadName, setLeadName] =
    useState("");

  const [leadContact, setLeadContact] =
    useState("");

  const [leadSent, setLeadSent] =
    useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setDemoMomentIndex((current) =>
        (current + 1) % previewMoments.length,
      );
    }, 2600);

    return () => window.clearInterval(timer);
  }, []);

  const currentMoment =
    previewMoments[demoMomentIndex];

  const guidedIndexResolved =
    guidedStops.length > 0
      ? guidedIndex % guidedStops.length
      : 0;

  const currentGuidedStop =
    guidedStops[guidedIndexResolved] ||
    guidedStops[0] ||
    guidedPreviewStops[0];

  useEffect(() => {
    if (!guidedAutoplay || guidedStops.length < 2) {
      return;
    }

    const timer = window.setInterval(() => {
      setGuidedIndex((current) =>
        (current + 1) % guidedStops.length,
      );
    }, 2200);

    return () => window.clearInterval(timer);
  }, [
    guidedAutoplay,
    guidedStops,
  ]);

  function toggleGuidedAutoplay() {
    setGuidedAutoplay((value) => {
      const nextValue = !value;

      if (nextValue && guidedStops.length > 1) {
        setGuidedIndex((current) =>
          (current + 1) % guidedStops.length,
        );
      }

      return nextValue;
    });
  }

  function submitLead() {
    if (!leadName.trim() || !leadContact.trim()) {
      return;
    }

    setLeadSent(true);
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-zinc-950 text-white">
      {/* TOOLBAR */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 bg-zinc-950/95 px-5 backdrop-blur-xl sm:px-8">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            <span className="text-base leading-none">←</span>
            Back to builder
          </button>

          <div className="hidden h-6 w-px bg-white/10 sm:block" />

          <div className="hidden sm:block">
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/40">
              Live preview
            </p>
            <p className="mt-0.5 text-xs font-semibold text-white">
              {businessName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-xl border border-white/10 bg-white/5 p-1">
            <button
              type="button"
              onClick={() => setDevice("ios")}
              className={`rounded-lg px-4 py-2 text-[10px] font-bold transition ${
                device === "ios"
                  ? "bg-white text-zinc-950 shadow-sm"
                  : "text-white/45 hover:text-white"
              }`}
            >
              iOS
            </button>
            <button
              type="button"
              onClick={() => setDevice("android")}
              className={`rounded-lg px-4 py-2 text-[10px] font-bold transition ${
                device === "android"
                  ? "bg-white text-zinc-950 shadow-sm"
                  : "text-white/45 hover:text-white"
              }`}
            >
              Android
            </button>
          </div>
        </div>
      </div>

      {/* PREVIEW STAGE */}
      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_50%_38%,rgba(79,70,229,0.18),transparent_38%),linear-gradient(135deg,#18181b_0%,#09090b_55%,#111827_100%)] px-4 py-8 sm:px-8">
        <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:42px_42px]" />

        <div className="relative flex h-full min-h-0 w-full max-w-6xl items-center justify-center gap-12">
          <div className="hidden max-w-xs xl:block">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/60">
                Interactive preview
              </span>
            </div>

            <h2 className="text-4xl font-extrabold tracking-[-0.04em] text-white">
              This is your app.
            </h2>

            <p className="mt-4 text-sm leading-6 text-white/50">
              Everything you have entered is now brought together into a real mobile app experience. Switch between iOS and Android to see how it feels on each device.
            </p>

            <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/55">
                Industry presets
              </p>

              <div className="mt-2 flex flex-wrap gap-2">
                {industryPreviewPresets.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() =>
                      setSelectedPresetId(
                        preset.id,
                      )
                    }
                    className={`rounded-full px-2.5 py-1 text-[10px] font-semibold transition ${
                      selectedPresetId === preset.id
                        ? "bg-white text-zinc-950"
                        : "bg-white/10 text-white/75 hover:bg-white/20 hover:text-white"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/55">
                  App look and feel reel
                </p>
                <button
                  type="button"
                  onClick={toggleGuidedAutoplay}
                  disabled={guidedStops.length < 2}
                  className={`rounded-full px-2 py-0.5 text-[9px] font-semibold transition ${
                    guidedAutoplay
                      ? "bg-emerald-400/20 text-emerald-300"
                      : "bg-white/20 text-white/80"
                  }`}
                >
                  {guidedStops.length < 2
                    ? "Walkthrough unavailable"
                    : guidedAutoplay
                      ? "Pause walkthrough"
                      : "Play walkthrough"}
                </button>
              </div>

              <p className="mt-3 text-sm font-semibold text-white">
                {currentMoment.title}
              </p>

              <p className="mt-1 text-xs leading-5 text-white/65">
                {currentMoment.detail}
              </p>

              <div className="mt-4 grid grid-cols-3 gap-2">
                {previewMoments.map((moment, index) => (
                  <button
                    key={moment.title}
                    type="button"
                    onClick={() =>
                      setDemoMomentIndex(index)
                    }
                    className={`h-1.5 rounded-full transition ${
                      index === demoMomentIndex
                        ? "bg-white"
                        : "bg-white/20 hover:bg-white/45"
                    }`}
                    aria-label={`Show preview moment ${index + 1}`}
                  />
                ))}
              </div>

              <div className="mt-4 rounded-xl border border-white/10 bg-black/10 p-3">
                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/55">
                  Customer journey mode
                </p>

                <p className="mt-2 text-[11px] font-semibold text-white">
                  {currentGuidedStop.label}: {currentGuidedStop.detail}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {guidedStops.map(
                    (
                      stop,
                      index,
                    ) => (
                      <button
                        key={stop.target}
                        type="button"
                        onClick={() => {
                          setGuidedAutoplay(false);
                          setGuidedIndex(index);
                        }}
                        className={`rounded-full px-2.5 py-1 text-[10px] font-semibold transition ${
                          guidedIndexResolved === index
                            ? "bg-white text-zinc-950"
                            : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                        }`}
                      >
                        {stop.label}
                      </button>
                    ),
                  )}
                </div>
              </div>
            </div>

            <div className="mt-7 space-y-3">
              {[
                "Business information",
                "Services and pricing",
                "Gallery and contact details",
                "Tap cards and menu tabs to interact",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-xs font-medium text-white/65">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-[9px] text-white">
                    ✓
                  </span>
                  {item}
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-emerald-300/25 bg-emerald-300/10 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-100">
                Ready to launch?
              </p>

              <p className="mt-2 text-xs leading-5 text-emerald-50/90">
                This preview is built to convert. Capture interest while they are excited.
              </p>

              <button
                type="button"
                onClick={() => {
                  setLeadOpen(
                    (value) => !value,
                  );
                  setLeadSent(false);
                }}
                className="mt-3 w-full rounded-xl bg-white px-3 py-2 text-xs font-bold text-zinc-950 transition hover:bg-emerald-100"
              >
                {selectedPreset.cta}
              </button>

              {leadOpen && (
                <div className="mt-3 space-y-2 rounded-xl border border-white/20 bg-black/20 p-3">
                  {leadSent ? (
                    <p className="text-xs font-semibold text-emerald-200">
                      Thanks. We will contact you shortly.
                    </p>
                  ) : (
                    <>
                      <input
                        type="text"
                        value={leadName}
                        onChange={(event) =>
                          setLeadName(
                            event.target.value,
                          )
                        }
                        placeholder="Your name"
                        className="h-9 w-full rounded-lg border border-white/15 bg-white/10 px-3 text-xs text-white placeholder:text-white/40"
                      />

                      <input
                        type="text"
                        value={leadContact}
                        onChange={(event) =>
                          setLeadContact(
                            event.target.value,
                          )
                        }
                        placeholder="Phone or email"
                        className="h-9 w-full rounded-lg border border-white/15 bg-white/10 px-3 text-xs text-white placeholder:text-white/40"
                      />

                      <button
                        type="button"
                        onClick={submitLead}
                        className="w-full rounded-lg bg-emerald-300 px-3 py-2 text-xs font-bold text-zinc-950 transition hover:bg-emerald-200"
                      >
                        Request my app demo
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex min-h-0 items-center justify-center">
            <div className="origin-center scale-[0.86] sm:scale-[0.94] lg:scale-[1.02]">
              <AppDevice
                device={device}
                app={previewApp}
                pages={pages}
                services={previewServices}
                gallery={previewGallery}
                contactSettings={previewContactSettings}
                guidedTarget={
                  currentGuidedStop.target
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="flex h-12 shrink-0 items-center justify-center border-t border-white/10 bg-zinc-950/95 px-5">
        <div className="flex items-center gap-2 text-[9px] font-medium text-white/35">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Live preview — changes are reflected instantly
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   ASSISTANT
============================================================ */

function AssistantWidget({
  open,
  setOpen,
  context,
}: {
  open: boolean;

  setOpen: (
    value: boolean,
  ) => void;

  context: {
    businessName: string;
    step: Step;
  };
}) {
  const [messages, setMessages] =
    useState<
      {
        type:
          | "assistant"
          | "user";

        text: string;
      }[]
    >([]);

  const [input, setInput] =
    useState("");

  const suggestions: Record<
    Step,
    string[]
  > = {
    business: [
      "What information should I add?",
      "Help me describe my business",
      "What makes a good business app?",
    ],

    description: [
      "Help me write my description",
      "What should customers know?",
      "What should I add next?",
    ],

    contact: [
      "Which contact details should I use?",
      "Should I add WhatsApp?",
      "What should I add next?",
    ],

    appearance: [
      "Help me choose my colours",
      "What makes an app look professional?",
      "What should I customise?",
    ],

    pages: [
      "Which pages should my app have?",
      "What pages do businesses usually need?",
      "What should I add next?",
    ],

    services: [
      "How should I display my services?",
      "What information should a service have?",
      "What should I add next?",
    ],

    gallery: [
      "What photos should I use?",
      "How many photos should I add?",
      "What makes a good gallery?",
    ],
  };

  function answerQuestion(
    question: string,
  ) {
    const lower =
      question.toLowerCase();

    let answer =
      "I'd recommend keeping things simple and customer-focused. You can always add more detail later.";

    if (
      lower.includes(
        "description",
      ) ||
      lower.includes(
        "describe",
      )
    ) {
      answer =
        `For ${context.businessName}, keep the description short and useful. Explain what you do, who you help and what makes your business useful. For example: "Professional plumbing services for homes and businesses, available 24/7."`;
    }

    else if (
      lower.includes("page")
    ) {
      answer =
        "For most businesses, I'd start with Home, Services, About, Gallery and Contact. You don't need dozens of pages — customers should be able to find what they need quickly.";
    }

    else if (
      lower.includes("contact") ||
      lower.includes("whatsapp")
    ) {
      answer =
        "I'd recommend adding your phone number and WhatsApp if customers commonly contact you that way. Email and address are useful too, depending on the business.";
    }

    else if (
      lower.includes("colour") ||
      lower.includes("color") ||
      lower.includes(
        "professional",
      )
    ) {
      answer =
        "A strong business app usually works best with one primary brand colour, lots of clean space and high-contrast text. Avoid using too many colours.";
    }

    else if (
      lower.includes("photo") ||
      lower.includes(
        "gallery",
      )
    ) {
      answer =
        "Use real photos wherever possible. Show your work, products, premises or team. A smaller number of good-quality photos is better than a large collection of weak ones.";
    }

    else if (
      lower.includes("service")
    ) {
      answer =
        "Each service should ideally have a clear name, short description and optionally a price, duration or image. Keep the information easy to scan.";
    }

    setMessages(
      (current) => [
        ...current,

        {
          type: "user",
          text: question,
        },

        {
          type: "assistant",
          text: answer,
        },
      ],
    );

    setInput("");
  }

  function submitInput() {
    if (!input.trim()) {
      return;
    }

    answerQuestion(
      input.trim(),
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() =>
          setOpen(true)
        }
        className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-full border border-zinc-200 bg-white px-4 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_35px_rgba(0,0,0,0.16)]"
      >

        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-sm text-white">
          ✨
        </span>

        <span className="text-xs font-semibold text-zinc-800">
          Need a hand?
        </span>

      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-32px)] overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.18)]">

      {/* HEADER */}

      <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">

        <div className="flex items-center gap-3">

          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-sm text-white">
            ✨
          </div>

          <div>

            <p className="text-xs font-bold text-zinc-900">
              WeMakeApps Assistant
            </p>

            <p className="mt-0.5 text-[10px] text-zinc-400">
              Here when you need me
            </p>

          </div>

        </div>

        <button
          type="button"
          onClick={() =>
            setOpen(false)
          }
          className="flex h-8 w-8 items-center justify-center rounded-lg text-lg text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
          aria-label="Close assistant"
        >
          ×
        </button>

      </div>

      {/* MESSAGES */}

      <div className="max-h-[340px] overflow-y-auto p-5">

        {messages.length ===
        0 ? (
          <>

            <p className="text-sm leading-6 text-zinc-600">
              I&apos;m here if you need guidance while
              building your app. You can also ignore
              me completely and build it yourself.
            </p>

            <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">
              Suggestions
            </p>

          </>
        ) : (
          <div className="space-y-4">

            {messages.map(
              (
                message,
                index,
              ) => (

                <div
                  key={index}
                  className={
                    message.type ===
                    "user"
                      ? "flex justify-end"
                      : "flex justify-start"
                  }
                >

                  <div
                    className={`max-w-[90%] rounded-2xl px-4 py-3 text-xs leading-5 ${
                      message.type ===
                      "user"
                        ? "bg-zinc-950 text-white"
                        : "bg-indigo-50 text-indigo-950"
                    }`}
                  >
                    {message.text}
                  </div>

                </div>

              ),
            )}

          </div>
        )}

        {/* SUGGESTIONS */}

        <div className="mt-4 space-y-2">

          {suggestions[
            context.step
          ].map(
            (suggestion) => (

              <button
                key={suggestion}
                type="button"
                onClick={() =>
                  answerQuestion(
                    suggestion,
                  )
                }
                className="group flex w-full items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3 text-left transition hover:border-indigo-200 hover:bg-indigo-50"
              >

                <span className="text-xs font-medium text-zinc-700 group-hover:text-indigo-700">
                  {suggestion}
                </span>

                <span className="text-zinc-300 group-hover:text-indigo-500">
                  →
                </span>

              </button>

            ),
          )}

        </div>

      </div>

      {/* INPUT */}

      <div className="border-t border-zinc-100 p-4">

        <div className="flex items-center rounded-xl border border-zinc-200 bg-zinc-50 p-1 focus-within:border-zinc-300">

          <input
            type="text"
            value={input}
            onChange={(event) =>
              setInput(
                event.target.value,
              )
            }
            onKeyDown={(event) => {
              if (
                event.key ===
                "Enter"
              ) {
                submitInput();
              }
            }}
            placeholder="Ask me anything..."
            className="assistant-input"
          />

          <button
            type="button"
            onClick={
              submitInput
            }
            className="mr-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-950 text-sm text-white transition hover:bg-zinc-800"
          >
            ↑
          </button>

        </div>

      </div>

    </div>
  );
}

/* ============================================================
   PHONE DEVICE
============================================================ */

function AppDevice({
  device,
  app,
  pages,
  services,
  gallery,
  contactSettings,
  guidedTarget,
}: {
  device: Device;
  app: AppConfig;
  pages: AppPage[];
  services: AppService[];
  gallery: GalleryItem[];
  contactSettings: ContactSettings;
  guidedTarget?:
    | "home"
    | "services"
    | "gallery"
    | "contact"
    | "about";
}) {
  const isIOS = device === "ios";

  const scrollAreaRef =
    useRef<HTMLDivElement>(null);
  const homeRef =
    useRef<HTMLDivElement>(null);
  const servicesRef =
    useRef<HTMLDivElement>(null);
  const galleryRef =
    useRef<HTMLDivElement>(null);
  const contactRef =
    useRef<HTMLDivElement>(null);
  const aboutRef =
    useRef<HTMLDivElement>(null);

  const businessName =
    app.business.name.trim() || "Your Business";

  const description =
    app.business.description.trim() ||
    "A simple, professional app for your customers.";

  const enabledPages = pages.filter((page) => page.enabled);
  const enabledServices = services
    .filter((service) => service.enabled)
    .slice(0, 3);
  const enabledGallery = gallery
    .filter((item) => item.enabled)
    .slice(0, 3);

  const [activePage, setActivePage] =
    useState<string>(
      enabledPages[0]?.id || "home",
    );

  const [expandedServiceId, setExpandedServiceId] =
    useState<string | null>(null);

  const [selectedGalleryId, setSelectedGalleryId] =
    useState<string>(
      enabledGallery[0]?.id || "",
    );

  const [previewMessage, setPreviewMessage] =
    useState<string | null>(null);

  useEffect(() => {
    if (!previewMessage) {
      return;
    }

    const timer = window.setTimeout(() => {
      setPreviewMessage(null);
    }, 1400);

    return () => window.clearTimeout(timer);
  }, [previewMessage]);

  const hasContact = Boolean(
    (contactSettings.showPhone && app.business.phone.trim()) ||
      (contactSettings.showWhatsapp && app.business.whatsapp.trim()) ||
      (contactSettings.showEmail && app.business.email.trim()) ||
      (contactSettings.showAddress && app.business.address.trim()),
  );

  const serviceItems =
    enabledServices.length > 0
      ? enabledServices
      : [
          {
            id: "preview-1",
            name: "Your services",
            description:
              "Add services to personalise this preview.",
            price: "",
            enabled: true,
          },
        ];

  const expandedServiceIdResolved =
    guidedTarget === "services"
      ? serviceItems[0]?.id || null
      : expandedServiceId;

  const selectedGalleryIdResolved =
    guidedTarget === "gallery"
      ? enabledGallery[0]?.id || selectedGalleryId
      : selectedGalleryId;

  const selectedGalleryItem =
    enabledGallery.find(
      (item) => item.id === selectedGalleryIdResolved,
    ) || enabledGallery[0];

  const activePageResolved =
    guidedTarget &&
    enabledPages.some(
      (page) => page.id === guidedTarget,
    )
      ? guidedTarget
      :
    enabledPages.some(
      (page) => page.id === activePage,
    )
      ? activePage
      : enabledPages[0]?.id || "home";

  const heroImage =
    selectedGalleryItem?.imageUrl;

  function jumpToPage(pageId: string) {
    setActivePage(pageId);

    const sectionMap: Record<
      string,
      RefObject<HTMLDivElement | null>
    > = {
      home: homeRef,
      services: servicesRef,
      gallery: galleryRef,
      contact: contactRef,
      about: aboutRef,
    };

    const targetRef = sectionMap[pageId];

    if (!targetRef?.current) {
      return;
    }

    targetRef.current.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function showFeedback(message: string) {
    setPreviewMessage(message);
  }

  useEffect(() => {
    if (!guidedTarget) {
      return;
    }

    const sectionMap: Record<
      "home" | "services" | "gallery" | "contact" | "about",
      RefObject<HTMLDivElement | null>
    > = {
      home: homeRef,
      services: servicesRef,
      gallery: galleryRef,
      contact: contactRef,
      about: aboutRef,
    };

    const targetRef = sectionMap[guidedTarget];

    if (!targetRef.current) {
      return;
    }

    targetRef.current.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [guidedTarget]);

  function cycleHeroMedia() {
    if (enabledGallery.length <= 1) {
      showFeedback("Add more gallery images to rotate hero media.");
      return;
    }

    const currentIndex = enabledGallery.findIndex(
      (item) => item.id === selectedGalleryIdResolved,
    );

    const nextItem =
      enabledGallery[
        (currentIndex + 1) % enabledGallery.length
      ];

    setSelectedGalleryId(nextItem.id);
    showFeedback("Hero media changed");
  }

  return (
    <div className="flex flex-col items-center">
      {/* DEVICE SHADOW / STAGE */}
      <div className="relative flex items-center justify-center">
        <div className="absolute bottom-[-18px] left-1/2 h-10 w-[82%] -translate-x-1/2 rounded-[50%] bg-zinc-950/20 blur-2xl" />

        {/* SIDE BUTTONS */}
        <div
          className={`absolute z-10 w-[4px] rounded-r-full bg-zinc-700 shadow-inner ${
            isIOS ? "-right-[4px] top-[138px] h-[66px]" : "-right-[4px] top-[170px] h-[86px]"
          }`}
        />
        <div
          className={`absolute z-10 -left-[4px] w-[4px] rounded-l-full bg-zinc-700 shadow-inner ${
            isIOS ? "top-[130px] h-[30px]" : "top-[150px] h-[58px]"
          }`}
        />
        {isIOS && (
          <>
            <div className="absolute -left-[4px] top-[174px] z-10 h-[48px] w-[4px] rounded-l-full bg-zinc-700" />
            <div className="absolute -left-[4px] top-[232px] z-10 h-[24px] w-[4px] rounded-l-full bg-zinc-700" />
          </>
        )}

        {/* PREMIUM DEVICE FRAME */}
        <div
          className={`relative shrink-0 p-[7px] shadow-[0_32px_80px_rgba(0,0,0,0.28),0_8px_24px_rgba(0,0,0,0.12)] ${
            isIOS
              ? "h-[620px] w-[308px] rounded-[3.45rem]"
              : "h-[626px] w-[312px] rounded-[2.8rem]"
          }`}
          style={{
            background: isIOS
              ? "linear-gradient(145deg,#444 0%,#161616 18%,#050505 55%,#2b2b2b 100%)"
              : "linear-gradient(145deg,#333 0%,#111 35%,#050505 100%)",
          }}
        >
          {/* FRAME HIGHLIGHT */}
          <div className="pointer-events-none absolute inset-[1px] rounded-[3.25rem] border border-white/15" />

          {/* SCREEN */}
          <div
            className={`relative h-full overflow-hidden bg-white ${
              isIOS ? "rounded-[2.95rem]" : "rounded-[2.35rem]"
            }`}
          >
            {/* SCREEN GLASS REFLECTION */}
            <div className="pointer-events-none absolute inset-0 z-40 bg-[linear-gradient(115deg,rgba(255,255,255,0.12),transparent_24%,transparent_72%,rgba(255,255,255,0.05))]" />

            {/* CAMERA / DYNAMIC ISLAND */}
            {isIOS ? (
              <div className="absolute left-1/2 top-[10px] z-50 h-[27px] w-[92px] -translate-x-1/2 rounded-full bg-black shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]" />
            ) : (
              <div className="absolute left-1/2 top-[12px] z-50 h-[11px] w-[11px] -translate-x-1/2 rounded-full bg-black ring-2 ring-zinc-800/80" />
            )}

            {/* APP SCROLL AREA */}
            <div
              ref={scrollAreaRef}
              className="absolute inset-0 overflow-y-auto pb-[76px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {/* HERO */}
              <div
                ref={homeRef}
                className="px-5 pt-8"
              >
                <div
                  role="button"
                  tabIndex={0}
                  onClick={cycleHeroMedia}
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" ||
                      event.key === " "
                    ) {
                      event.preventDefault();
                      cycleHeroMedia();
                    }
                  }}
                  className={`relative h-[182px] overflow-hidden rounded-[28px] shadow-[0_18px_42px_rgba(0,0,0,0.18)] transition active:scale-[0.99] ${
                    guidedTarget === "home"
                      ? "ring-2 ring-indigo-300/80"
                      : ""
                  }`}
                  style={{
                    backgroundColor: app.primaryColor,
                  }}
                  aria-label="Tap to rotate hero image"
                >
                  {heroImage ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={heroImage}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : null}

                  <div
                    className="absolute inset-0"
                    style={{
                      background: heroImage
                        ? "linear-gradient(90deg,rgba(0,0,0,0.78) 0%,rgba(0,0,0,0.35) 52%,rgba(0,0,0,0.05) 100%)"
                        : "linear-gradient(135deg,rgba(255,255,255,0.08),rgba(0,0,0,0.16))",
                    }}
                  />

                  <div className="absolute -right-12 -top-14 h-40 w-40 rounded-full border border-white/10 bg-white/10" />
                  <div className="absolute -bottom-16 right-4 h-32 w-32 rounded-full bg-white/10" />

                  <div className="absolute inset-x-5 bottom-5">
                    <p className="max-w-[235px] text-[25px] font-extrabold leading-[0.98] tracking-[-0.03em] text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.18)]">
                      {businessName}
                    </p>
                    <p className="mt-3 max-w-[235px] text-[10px] font-semibold leading-[1.45] tracking-[0.02em] text-white/95 drop-shadow-[0_1px_6px_rgba(0,0,0,0.25)]">
                      {description}
                    </p>
                    <div className="mt-3 h-[3px] w-12 rounded-full bg-white/90" />
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between rounded-2xl border border-zinc-100 bg-white px-3 py-2 shadow-[0_4px_14px_rgba(0,0,0,0.04)]">
                  <p className="text-[7px] font-semibold uppercase tracking-[0.08em] text-zinc-500">
                    Tap buttons and swipe up to explore
                  </p>
                  <span className="text-[10px] text-zinc-400 animate-bounce">
                    ↓
                  </span>
                </div>
              </div>

              {/* QUICK ACTIONS */}
              <div className="px-5 pt-4">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Call", icon: "☎", show: contactSettings.showPhone && !!app.business.phone.trim() },
                    { label: "WhatsApp", icon: "◉", show: contactSettings.showWhatsapp && !!app.business.whatsapp.trim() },
                    { label: "Contact", icon: "✉", show: hasContact },
                  ].map((action) => (
                    <button
                      key={action.label}
                      type="button"
                      onClick={() => {
                        if (!action.show) {
                          showFeedback(
                            `Add ${action.label.toLowerCase()} details in the builder.`,
                          );
                          return;
                        }

                        showFeedback(
                          `Opening ${action.label}...`,
                        );
                      }}
                      className={`rounded-2xl border border-zinc-100 bg-white p-2.5 shadow-[0_4px_14px_rgba(0,0,0,0.04)] ${
                        action.show
                          ? "active:scale-[0.97]"
                          : "opacity-50"
                      }`}
                    >
                      <div
                        className="flex h-7 w-7 items-center justify-center rounded-xl text-[9px]"
                        style={{
                          backgroundColor: `${app.primaryColor}12`,
                          color: app.primaryColor,
                        }}
                      >
                        {action.icon}
                      </div>
                      <p className="mt-2 text-[8px] font-bold text-zinc-900">
                        {action.label}
                      </p>
                      <p className="mt-0.5 text-[7px] font-medium text-zinc-500">
                        {action.show ? "Available" : "Add details"}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* SERVICES */}
              <div
                ref={servicesRef}
                className={`px-5 pt-5 transition ${
                  guidedTarget === "services"
                    ? "scale-[1.01]"
                    : ""
                }`}
              >
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[12px] font-extrabold text-zinc-950">
                      Our Services
                    </p>
                    <p className="mt-0.5 text-[8px] font-medium text-zinc-500">
                      What we can do for you
                    </p>
                  </div>
                  <span
                    className="text-[8px] font-bold"
                    style={{ color: app.primaryColor }}
                  >
                    View all
                  </span>
                </div>

                <div className="mt-3 space-y-2">
                  {serviceItems.map((service, index) => (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => {
                        setExpandedServiceId(
                          expandedServiceId === service.id
                            ? null
                            : service.id,
                        );
                        showFeedback(
                          `${service.name} details ${
                            expandedServiceId === service.id
                              ? "collapsed"
                              : "expanded"
                          }`,
                        );
                      }}
                      className="flex items-center gap-3 rounded-2xl border border-zinc-100 bg-white p-2.5 shadow-[0_4px_14px_rgba(0,0,0,0.035)]"
                    >
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[8px] font-bold"
                        style={{
                          backgroundColor: `${app.primaryColor}12`,
                          color: app.primaryColor,
                        }}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[9px] font-bold text-zinc-900">
                          {service.name}
                        </p>
                        <p className="mt-1 line-clamp-1 text-[7px] font-medium text-zinc-500">
                          {expandedServiceIdResolved === service.id
                            ? service.description || "Professional service"
                            : "Tap for more"}
                        </p>
                      </div>

                      {service.price && (
                        <span className="shrink-0 text-[8px] font-bold text-zinc-800">
                          {service.price}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* GALLERY */}
              {enabledGallery.length > 0 && (
                <div
                  ref={galleryRef}
                  className={`px-5 pt-5 transition ${
                    guidedTarget === "gallery"
                      ? "scale-[1.01]"
                      : ""
                  }`}
                >
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-[12px] font-extrabold text-zinc-950">Gallery</p>
                      <p className="mt-0.5 text-[8px] font-medium text-zinc-500">A look at our work</p>
                    </div>
                    <span
                      className="text-[8px] font-bold"
                      style={{ color: app.primaryColor }}
                    >
                      See more
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {enabledGallery.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setSelectedGalleryId(item.id);
                          showFeedback(
                            `${item.title || "Gallery item"} selected`,
                          );
                        }}
                        className={`aspect-square overflow-hidden rounded-2xl bg-zinc-100 shadow-[0_4px_14px_rgba(0,0,0,0.06)] ${
                          selectedGalleryIdResolved === item.id
                            ? "ring-2 ring-zinc-900/30"
                            : ""
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.imageUrl}
                          alt={item.title || "Gallery image"}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* CONTACT */}
              {hasContact && (
                <div
                  ref={contactRef}
                  className={`px-5 pt-5 transition ${
                    guidedTarget === "contact"
                      ? "scale-[1.01]"
                      : ""
                  }`}
                >
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-[12px] font-extrabold text-zinc-950">Get in touch</p>
                      <p className="mt-0.5 text-[8px] font-medium text-zinc-500">We would love to hear from you</p>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {contactSettings.showPhone && app.business.phone.trim() && (
                      <button
                        type="button"
                        onClick={() =>
                          showFeedback("Starting a call...")
                        }
                        className="rounded-2xl border border-zinc-100 bg-white p-2.5 text-left shadow-[0_4px_14px_rgba(0,0,0,0.035)]"
                      >
                        <div
                          className="flex h-7 w-7 items-center justify-center rounded-xl text-[8px]"
                          style={{ backgroundColor: `${app.primaryColor}12`, color: app.primaryColor }}
                        >
                          ☎
                        </div>
                        <p className="mt-2 text-[8px] font-bold text-zinc-900">Call us</p>
                        <p className="mt-0.5 truncate text-[6px] text-zinc-400">{app.business.phone}</p>
                      </button>
                    )}

                    {contactSettings.showWhatsapp && app.business.whatsapp.trim() && (
                      <button
                        type="button"
                        onClick={() =>
                          showFeedback("Opening WhatsApp...")
                        }
                        className="rounded-2xl border border-zinc-100 bg-white p-2.5 text-left shadow-[0_4px_14px_rgba(0,0,0,0.035)]"
                      >
                        <div
                          className="flex h-7 w-7 items-center justify-center rounded-xl text-[8px]"
                          style={{ backgroundColor: `${app.primaryColor}12`, color: app.primaryColor }}
                        >
                          ◉
                        </div>
                        <p className="mt-2 text-[8px] font-bold text-zinc-900">WhatsApp</p>
                        <p className="mt-0.5 truncate text-[6px] text-zinc-400">{app.business.whatsapp}</p>
                      </button>
                    )}

                    {contactSettings.showEmail && app.business.email.trim() && (
                      <button
                        type="button"
                        onClick={() =>
                          showFeedback("Opening email...")
                        }
                        className="rounded-2xl border border-zinc-100 bg-white p-2.5 text-left shadow-[0_4px_14px_rgba(0,0,0,0.035)]"
                      >
                        <div
                          className="flex h-7 w-7 items-center justify-center rounded-xl text-[8px]"
                          style={{ backgroundColor: `${app.primaryColor}12`, color: app.primaryColor }}
                        >
                          ✉
                        </div>
                        <p className="mt-2 text-[8px] font-bold text-zinc-900">Email</p>
                        <p className="mt-0.5 truncate text-[6px] text-zinc-400">{app.business.email}</p>
                      </button>
                    )}

                    {contactSettings.showAddress && app.business.address.trim() && (
                      <button
                        type="button"
                        onClick={() =>
                          showFeedback("Opening map...")
                        }
                        className="rounded-2xl border border-zinc-100 bg-white p-2.5 text-left shadow-[0_4px_14px_rgba(0,0,0,0.035)]"
                      >
                        <div
                          className="flex h-7 w-7 items-center justify-center rounded-xl text-[8px]"
                          style={{ backgroundColor: `${app.primaryColor}12`, color: app.primaryColor }}
                        >
                          ⌖
                        </div>
                        <p className="mt-2 text-[8px] font-bold text-zinc-900">Find us</p>
                        <p className="mt-0.5 line-clamp-2 text-[6px] text-zinc-400">{app.business.address}</p>
                      </button>
                    )}
                  </div>

                  {contactSettings.showHours && contactSettings.hours.trim() && (
                    <div className="mt-2 flex items-center justify-between rounded-2xl bg-zinc-50 px-3 py-2.5">
                      <span className="text-[7px] font-bold text-zinc-700">Opening hours</span>
                      <span className="max-w-[150px] truncate text-right text-[6px] text-zinc-400">
                        {contactSettings.hours}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div
                ref={aboutRef}
                className={`px-5 pt-5 transition ${
                  guidedTarget === "about"
                    ? "scale-[1.01]"
                    : ""
                }`}
              >
                <div className="rounded-3xl border border-zinc-100 bg-zinc-50/80 p-4">
                  <p className="text-[11px] font-extrabold text-zinc-900">
                    About {businessName}
                  </p>
                  <p className="mt-2 text-[8px] leading-4 text-zinc-500">
                    {description}
                  </p>
                </div>
              </div>

              {/* PRIMARY CTA */}
              <div className="px-5 pb-2 pt-5">
                <button
                  type="button"
                  onClick={() =>
                    showFeedback("Lead form opened")
                  }
                  className="rounded-2xl px-4 py-3.5 text-center shadow-[0_10px_24px_rgba(0,0,0,0.10)]"
                  style={{ backgroundColor: app.primaryColor }}
                >
                  <p className="text-[9px] font-bold text-white">
                    Ready to work with us?
                  </p>
                  <p className="mt-1 text-[6px] text-white/70">
                    Get in touch with {businessName}
                  </p>
                </button>
              </div>
            </div>

            <div className="pointer-events-none absolute bottom-[58px] left-0 right-0 h-10 bg-gradient-to-t from-white to-transparent" />

            {previewMessage && (
              <div className="pointer-events-none absolute bottom-[86px] left-1/2 z-40 -translate-x-1/2 rounded-full bg-zinc-950 px-3 py-1.5 text-[8px] font-semibold text-white shadow-lg">
                {previewMessage}
              </div>
            )}

            {/* APP NAV */}
            <div className="absolute bottom-0 left-0 right-0 z-30 border-t border-zinc-100/90 bg-white/95 px-4 pb-3 pt-2 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                {enabledPages.slice(0, 5).map((page) => (
                  <button
                    key={page.id}
                    type="button"
                    onClick={() =>
                      jumpToPage(page.id)
                    }
                    className="min-w-0 text-center"
                    style={{
                      color:
                        page.id === activePageResolved
                          ? app.primaryColor
                          : "#a1a1aa",
                    }}
                  >
                    <div className="mx-auto flex h-7 w-7 items-center justify-center rounded-xl text-[10px]">
                      {page.icon}
                    </div>
                    <span className="block max-w-[46px] truncate text-[6px] font-semibold">
                      {page.name}
                    </span>
                  </button>
                ))}
              </div>

              {isIOS && (
                <div className="mx-auto mt-2 h-1 w-20 rounded-full bg-zinc-900" />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 shadow-sm">
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: app.primaryColor }}
        />
        <p className="text-[9px] font-semibold text-zinc-600">
          {isIOS ? "iOS App Preview" : "Android App Preview"}
        </p>
      </div>
    </div>
  );
}

