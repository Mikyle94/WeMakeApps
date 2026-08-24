"use client";

import { useMemo, useRef, useState } from "react";

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

type AppConfig = {
  business: Business;
  primaryColor: string;
};

type AssistantMessage = {
  type: "assistant" | "user";
  text: string;
};

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

  const [device, setDevice] =
    useState<Device>("ios");

  const [step, setStep] =
    useState<Step>("business");

  const [activeSection, setActiveSection] =
    useState("business");

  const [assistantOpen, setAssistantOpen] =
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

  function focusField(
    ref:
      | React.RefObject<HTMLInputElement | null>
      | React.RefObject<HTMLTextAreaElement | null>,
  ) {
    window.setTimeout(() => {
      ref.current?.focus();

      ref.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 100);
  }

  const assistantContext = useMemo(
    () => ({
      businessName:
        app.business.name ||
        "your business",
      step,
    }),
    [app.business.name, step],
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
            className="hidden rounded-lg border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-600 transition hover:bg-zinc-50 sm:block"
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
                  activeSection === item.id;

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
                      selectSection(item.id)
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

              {navigationItems.map((item) => (

                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    selectSection(item.id)
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

              ))}

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
                business={
                  app.business
                }
                updateBusiness={
                  updateBusiness
                }
                phoneRef={
                  phoneRef
                }
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

              <SimpleSection
                title="Choose your pages."
                description="Decide what your customers can access from your app."
                icon="□"
              />

            )}

            {/* ==================================================
                SERVICES
            =================================================== */}

            {step === "services" && (

              <SimpleSection
                title="Add your services."
                description="Show customers exactly what your business offers."
                icon="☷"
              />

            )}

            {/* ==================================================
                GALLERY
            =================================================== */}

            {step === "gallery" && (

              <SimpleSection
                title="Add your photos."
                description="Showcase your work, products, team or premises."
                icon="▧"
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
  nameInputRef: React.RefObject<HTMLInputElement | null>;
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
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
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
}: {
  business: Business;
  updateBusiness: (
    field: keyof Business,
    value: string,
  ) => void;
  phoneRef: React.RefObject<HTMLInputElement | null>;
}) {
  return (
    <div>

      <SectionHeading
        eyebrow="Contact"
        title="Make it easy to reach you."
        description="Add the contact methods your customers actually use."
      />

      <div className="mt-8 grid max-w-2xl gap-x-8 gap-y-7 sm:grid-cols-2">

        <ModernField
          label="Phone"
          description="Your main business number."
        >
          <input
            ref={phoneRef}
            value={business.phone}
            onChange={(event) =>
              updateBusiness(
                "phone",
                event.target.value,
              )
            }
            placeholder="+27 82 123 4567"
            type="tel"
            className="builder-input"
          />
        </ModernField>

        <ModernField
          label="WhatsApp"
          description="Number customers can message."
        >
          <input
            value={business.whatsapp}
            onChange={(event) =>
              updateBusiness(
                "whatsapp",
                event.target.value,
              )
            }
            placeholder="+27 82 123 4567"
            type="tel"
            className="builder-input"
          />
        </ModernField>

        <ModernField
          label="Email"
          description="Your business email."
        >
          <input
            value={business.email}
            onChange={(event) =>
              updateBusiness(
                "email",
                event.target.value,
              )
            }
            placeholder="hello@business.co.za"
            type="email"
            className="builder-input"
          />
        </ModernField>

        <ModernField
          label="Address"
          description="Where customers can find you."
        >
          <input
            value={business.address}
            onChange={(event) =>
              updateBusiness(
                "address",
                event.target.value,
              )
            }
            placeholder="123 Main Street"
            className="builder-input"
          />
        </ModernField>

      </div>

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

          {colours.map((colour) => (

            <button
              key={colour}
              type="button"
              onClick={() =>
                onChange(colour)
              }
              className={`h-10 w-10 rounded-full transition ${
                color === colour
                  ? "scale-110 ring-2 ring-zinc-950 ring-offset-2"
                  : "hover:scale-105"
              }`}
              style={{
                backgroundColor: colour,
              }}
              aria-label={`Choose ${colour}`}
            />

          ))}

        </div>

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

      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-600">
        {eyebrow}
      </p>

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
  children: React.ReactNode;
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

      <SectionHeading
        eyebrow=""
        title={title}
        description={description}
      />

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
   ASSISTANT
============================================================ */

function AssistantWidget({
  open,
  setOpen,
  context,
}: {
  open: boolean;
  setOpen: (value: boolean) => void;
  context: {
    businessName: string;
    step: Step;
  };
}) {
  const [messages, setMessages] =
    useState<AssistantMessage[]>([]);

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
      lower.includes("description") ||
      lower.includes("describe")
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
      lower.includes("professional")
    ) {
      answer =
        "A strong business app usually works best with one primary brand colour, lots of clean space and high-contrast text. Avoid using too many colours.";
    }

    else if (
      lower.includes("photo") ||
      lower.includes("gallery")
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

    setMessages((current) => [
      ...current,
      {
        type: "user",
        text: question,
      },
      {
        type: "assistant",
        text: answer,
      },
    ]);

    setInput("");
  }

  function submitInput() {
    if (!input.trim()) {
      return;
    }

    answerQuestion(input.trim());
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
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

        {messages.length === 0 ? (

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
              (message, index) => (

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
          ].map((suggestion) => (

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

          ))}

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
            onClick={submitInput}
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
}: {
  device: Device;
  app: AppConfig;
}) {
  const isIOS = device === "ios";

  const businessName =
    app.business.name.trim() ||
    "Your Business";

  const description =
    app.business.description.trim() ||
    "Tell your customers what your business does and why they should choose you.";

  const initials =
    businessName
      .split(" ")
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase();

  return (
    <div className="flex flex-col items-center">

      <div
        className={`relative shrink-0 overflow-hidden border-[5px] border-zinc-900 bg-zinc-900 shadow-[0_25px_60px_rgba(0,0,0,0.25)] ${
          isIOS
            ? "h-[500px] w-[250px] rounded-[3rem]"
            : "h-[510px] w-[255px] rounded-[2.3rem]"
        }`}
      >

        {/* TOP HARDWARE */}

        {isIOS && (
          <div className="absolute left-1/2 top-2 z-30 h-6 w-20 -translate-x-1/2 rounded-full bg-zinc-950" />
        )}

        {!isIOS && (
          <div className="absolute left-1/2 top-2 z-30 h-3.5 w-3.5 -translate-x-1/2 rounded-full bg-zinc-800 ring-1 ring-zinc-700" />
        )}

        {/* SCREEN */}

        <div
          className={`relative h-full overflow-hidden bg-white ${
            isIOS
              ? "rounded-[2.5rem]"
              : "rounded-[1.95rem]"
          }`}
        >

          {/* STATUS */}

          <div className="flex h-9 items-center justify-between px-5 pt-1 text-[8px] font-medium text-zinc-500">

            <span>9:41</span>

            <div className="flex gap-1">
              <span>●●●</span>
              <span>▰</span>
            </div>

          </div>

          {/* APP HEADER */}

          <div className="px-5 pb-4 pt-3">

            <div className="flex items-center justify-between">

              <div className="min-w-0">

                <p
                  className="text-[7px] font-medium uppercase tracking-widest"
                  style={{
                    color:
                      app.primaryColor,
                  }}
                >
                  Welcome
                </p>

                <p className="mt-1 truncate text-[14px] font-bold text-zinc-950">
                  {businessName}
                </p>

              </div>

              <div
                className="ml-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[7px] font-bold"
                style={{
                  backgroundColor: `${app.primaryColor}15`,
                  color:
                    app.primaryColor,
                }}
              >
                {initials}
              </div>

            </div>

          </div>

          {/* HERO */}

          <div className="px-5">

            <div
              className="relative h-[105px] overflow-hidden rounded-2xl"
              style={{
                backgroundColor:
                  app.primaryColor,
              }}
            >

              <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/10" />

              <div className="absolute bottom-4 left-4 right-4">

                <p className="text-[7px] font-medium tracking-wide text-white/70">
                  YOUR BUSINESS
                </p>

                <p className="mt-1 text-[14px] font-bold leading-tight text-white">
                  {businessName}
                </p>

                <p className="mt-1 line-clamp-2 text-[7px] leading-3 text-white/70">
                  {description}
                </p>

              </div>

            </div>

          </div>

          {/* SERVICES */}

          <div className="px-5 pb-16 pt-5">

            <div className="flex items-center justify-between">

              <p className="text-[10px] font-bold">
                Our Services
              </p>

              <p
                className="text-[7px] font-medium"
                style={{
                  color:
                    app.primaryColor,
                }}
              >
                View all
              </p>

            </div>

            <div className="mt-3 space-y-2">

              {[
                "Our services",
                "What we offer",
                "Get in touch",
              ].map(
                (service, index) => (

                  <div
                    key={service}
                    className="flex items-center gap-3 rounded-xl border border-zinc-100 p-2.5"
                  >

                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[8px]"
                      style={{
                        backgroundColor: `${app.primaryColor}15`,
                        color:
                          app.primaryColor,
                      }}
                    >
                      0{index + 1}
                    </div>

                    <div>

                      <p className="text-[7px] font-semibold text-zinc-800">
                        {service}
                      </p>

                      <p className="mt-1 text-[6px] text-zinc-400">
                        Your business information
                      </p>

                    </div>

                  </div>

                ),
              )}

            </div>

            <div
              className="mt-4 rounded-xl py-3 text-center text-[7px] font-semibold text-white"
              style={{
                backgroundColor:
                  app.primaryColor,
              }}
            >
              Contact {businessName}
            </div>

          </div>

          {/* NAVIGATION */}

          <div className="absolute bottom-0 left-0 right-0 border-t border-zinc-100 bg-white px-5 py-3">

            <div className="flex items-center justify-between">

              {[
                "Home",
                "Services",
                "Gallery",
                "Contact",
              ].map(
                (item, index) => (

                  <div
                    key={item}
                    className={`text-center text-[6px] ${
                      index === 0
                        ? "font-semibold"
                        : "text-zinc-400"
                    }`}
                    style={
                      index === 0
                        ? {
                            color:
                              app.primaryColor,
                          }
                        : undefined
                    }
                  >

                    <div className="mb-1 text-[9px]">
                      {
                        [
                          "⌂",
                          "☷",
                          "▧",
                          "⌁",
                        ][index]
                      }
                    </div>

                    {item}

                  </div>

                ),
              )}

            </div>

          </div>

        </div>

        {/* IOS HOME BAR */}

        {isIOS && (
          <div className="absolute bottom-1.5 left-1/2 z-30 h-1 w-20 -translate-x-1/2 rounded-full bg-zinc-700" />
        )}

        {/* ANDROID NAV */}

        {!isIOS && (
          <div className="absolute bottom-0 left-0 right-0 z-30 flex h-6 items-center justify-center gap-7 bg-zinc-950 text-[8px] text-zinc-500">
            <span>◁</span>
            <span>○</span>
            <span>□</span>
          </div>
        )}

      </div>

      <p className="mt-4 text-[10px] font-semibold text-zinc-600">
        {isIOS
          ? "iOS Preview"
          : "Android Preview"}
      </p>

    </div>
  );
}