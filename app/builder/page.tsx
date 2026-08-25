"use client";

import {
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type RefObject,
  type SetStateAction,
} from "react";

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

  const nameInputRef =
    useRef<HTMLInputElement>(null);

  const descriptionRef =
    useRef<HTMLTextAreaElement>(null);

  const phoneRef =
    useRef<HTMLInputElement>(null);

  const progress = getProgress(app);

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

      {/* ======================================================
          HEADER
      ======================================================= */}

      <header className="flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-5">

        <div className="flex items-center gap-8">

          <a
            href="/"
            className="text-lg font-bold tracking-tight"
          >
            <span>We</span>

            <span className="text-indigo-600">
              Make
            </span>

            <span>Apps</span>
          </a>

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

          <button
            type="button"
            className="rounded-lg bg-zinc-950 px-4 py-2 text-xs font-semibold text-white transition hover:bg-zinc-800"
          >
            Save App
          </button>

        </div>

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
              Optional. Give customers an idea of when you're available.
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
              Don't overcomplicate it
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

  function resetForm() {
    setAdding(false);
    setEditingId(null);
    setTitle("");
    setDescription("");
    setImageUrl("");
  }

  function saveItem() {
    if (!imageUrl.trim()) return;

    if (editingId) {
      setGallery((current) =>
        current.map((item) =>
          item.id === editingId
            ? {
                ...item,
                title: title.trim(),
                description: description.trim(),
                imageUrl: imageUrl.trim(),
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
          imageUrl: imageUrl.trim(),
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
                <img
                  src={item.imageUrl}
                  alt={item.title || "Gallery image"}
                  className="h-full w-full object-cover"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
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

            {imageUrl.trim() && (
              <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50">
                <div className="aspect-[16/9]">
                  <img
                    src={imageUrl}
                    alt="Gallery preview"
                    className="h-full w-full object-cover"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
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

function SimpleSection({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <div>

      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-lg text-indigo-600">
        {icon}
      </div>

      <div className="mt-5">

        <SectionHeading
          eyebrow=""
          title={title}
          description={description}
        />

      </div>

      <div className="mt-8 max-w-2xl rounded-2xl border border-dashed border-zinc-300 bg-white p-10 text-center">

        <p className="text-sm font-semibold text-zinc-800">
          This section is coming next.
        </p>

        <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-zinc-400">
          The structure is ready for this feature.
          We'll build the full editor here next.
        </p>

      </div>

    </div>
  );
}

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
  const businessName =
    app.business.name.trim() || "Your Business";

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
              Everything you've entered is now brought together into a real mobile app experience. Switch between iOS and Android to see how it feels on each device.
            </p>

            <div className="mt-7 space-y-3">
              {[
                "Business information",
                "Services and pricing",
                "Gallery and contact details",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-xs font-medium text-white/65">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-[9px] text-white">
                    ✓
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="flex min-h-0 items-center justify-center">
            <div className="origin-center scale-[0.86] sm:scale-[0.94] lg:scale-[1.02]">
              <AppDevice
                device={device}
                app={app}
                pages={pages}
                services={services}
                gallery={gallery}
                contactSettings={contactSettings}
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
              I'm here if you need guidance while
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
}: {
  device: Device;
  app: AppConfig;
  pages: AppPage[];
  services: AppService[];
  gallery: GalleryItem[];
  contactSettings: ContactSettings;
}) {
  const isIOS = device === "ios";

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

  const hasContact = Boolean(
    (contactSettings.showPhone && app.business.phone.trim()) ||
      (contactSettings.showWhatsapp && app.business.whatsapp.trim()) ||
      (contactSettings.showEmail && app.business.email.trim()) ||
      (contactSettings.showAddress && app.business.address.trim()),
  );

  const heroImage = enabledGallery[0]?.imageUrl;

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
            <div className="absolute inset-0 overflow-y-auto pb-[76px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {/* HERO */}
              <div className="px-5 pt-8">
                <div
                  className="relative h-[182px] overflow-hidden rounded-[28px] shadow-[0_18px_42px_rgba(0,0,0,0.18)]"
                  style={{
                    backgroundColor: app.primaryColor,
                  }}
                >
                  {heroImage ? (
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
              </div>

              {/* QUICK ACTIONS */}
              <div className="px-5 pt-4">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Call", icon: "☎", show: contactSettings.showPhone && !!app.business.phone.trim() },
                    { label: "WhatsApp", icon: "◉", show: contactSettings.showWhatsapp && !!app.business.whatsapp.trim() },
                    { label: "Contact", icon: "✉", show: hasContact },
                  ].map((action) => (
                    <div
                      key={action.label}
                      className={`rounded-2xl border border-zinc-100 bg-white p-2.5 shadow-[0_4px_14px_rgba(0,0,0,0.04)] ${
                        action.show ? "" : "opacity-50"
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
                    </div>
                  ))}
                </div>
              </div>

              {/* SERVICES */}
              <div className="px-5 pt-5">
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
                  {(enabledServices.length > 0
                    ? enabledServices
                    : [
                        {
                          id: "preview-1",
                          name: "Your services",
                          description: "Add services to personalise this preview.",
                          price: "",
                          enabled: true,
                        },
                      ]
                  ).map((service, index) => (
                    <div
                      key={service.id}
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
                          {service.description || "Professional service"}
                        </p>
                      </div>

                      {service.price && (
                        <span className="shrink-0 text-[8px] font-bold text-zinc-800">
                          {service.price}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* GALLERY */}
              {enabledGallery.length > 0 && (
                <div className="px-5 pt-5">
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
                      <div
                        key={item.id}
                        className="aspect-square overflow-hidden rounded-2xl bg-zinc-100 shadow-[0_4px_14px_rgba(0,0,0,0.06)]"
                      >
                        <img
                          src={item.imageUrl}
                          alt={item.title || "Gallery image"}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CONTACT */}
              {hasContact && (
                <div className="px-5 pt-5">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-[12px] font-extrabold text-zinc-950">Get in touch</p>
                      <p className="mt-0.5 text-[8px] font-medium text-zinc-500">We'd love to hear from you</p>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {contactSettings.showPhone && app.business.phone.trim() && (
                      <div className="rounded-2xl border border-zinc-100 bg-white p-2.5 shadow-[0_4px_14px_rgba(0,0,0,0.035)]">
                        <div
                          className="flex h-7 w-7 items-center justify-center rounded-xl text-[8px]"
                          style={{ backgroundColor: `${app.primaryColor}12`, color: app.primaryColor }}
                        >
                          ☎
                        </div>
                        <p className="mt-2 text-[8px] font-bold text-zinc-900">Call us</p>
                        <p className="mt-0.5 truncate text-[6px] text-zinc-400">{app.business.phone}</p>
                      </div>
                    )}

                    {contactSettings.showWhatsapp && app.business.whatsapp.trim() && (
                      <div className="rounded-2xl border border-zinc-100 bg-white p-2.5 shadow-[0_4px_14px_rgba(0,0,0,0.035)]">
                        <div
                          className="flex h-7 w-7 items-center justify-center rounded-xl text-[8px]"
                          style={{ backgroundColor: `${app.primaryColor}12`, color: app.primaryColor }}
                        >
                          ◉
                        </div>
                        <p className="mt-2 text-[8px] font-bold text-zinc-900">WhatsApp</p>
                        <p className="mt-0.5 truncate text-[6px] text-zinc-400">{app.business.whatsapp}</p>
                      </div>
                    )}

                    {contactSettings.showEmail && app.business.email.trim() && (
                      <div className="rounded-2xl border border-zinc-100 bg-white p-2.5 shadow-[0_4px_14px_rgba(0,0,0,0.035)]">
                        <div
                          className="flex h-7 w-7 items-center justify-center rounded-xl text-[8px]"
                          style={{ backgroundColor: `${app.primaryColor}12`, color: app.primaryColor }}
                        >
                          ✉
                        </div>
                        <p className="mt-2 text-[8px] font-bold text-zinc-900">Email</p>
                        <p className="mt-0.5 truncate text-[6px] text-zinc-400">{app.business.email}</p>
                      </div>
                    )}

                    {contactSettings.showAddress && app.business.address.trim() && (
                      <div className="rounded-2xl border border-zinc-100 bg-white p-2.5 shadow-[0_4px_14px_rgba(0,0,0,0.035)]">
                        <div
                          className="flex h-7 w-7 items-center justify-center rounded-xl text-[8px]"
                          style={{ backgroundColor: `${app.primaryColor}12`, color: app.primaryColor }}
                        >
                          ⌖
                        </div>
                        <p className="mt-2 text-[8px] font-bold text-zinc-900">Find us</p>
                        <p className="mt-0.5 line-clamp-2 text-[6px] text-zinc-400">{app.business.address}</p>
                      </div>
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

              {/* PRIMARY CTA */}
              <div className="px-5 pb-2 pt-5">
                <div
                  className="rounded-2xl px-4 py-3.5 text-center shadow-[0_10px_24px_rgba(0,0,0,0.10)]"
                  style={{ backgroundColor: app.primaryColor }}
                >
                  <p className="text-[9px] font-bold text-white">
                    Ready to work with us?
                  </p>
                  <p className="mt-1 text-[6px] text-white/70">
                    Get in touch with {businessName}
                  </p>
                </div>
              </div>
            </div>

            {/* APP NAV */}
            <div className="absolute bottom-0 left-0 right-0 z-30 border-t border-zinc-100/90 bg-white/95 px-4 pb-3 pt-2 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                {enabledPages.slice(0, 5).map((page, index) => (
                  <div
                    key={page.id}
                    className="min-w-0 text-center"
                    style={{
                      color: index === 0 ? app.primaryColor : "#a1a1aa",
                    }}
                  >
                    <div className="mx-auto flex h-7 w-7 items-center justify-center rounded-xl text-[10px]">
                      {page.icon}
                    </div>
                    <span className="block max-w-[46px] truncate text-[6px] font-semibold">
                      {page.name}
                    </span>
                  </div>
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

