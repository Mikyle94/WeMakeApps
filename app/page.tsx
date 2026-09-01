"use client";

import { useState } from "react";
import Link from "next/link";

const steps = [
  {
    number: "01",
    icon: "✎",
    title: "Start with your business",
    description:
      "Tell us who you are, what you do and how customers can reach you.",
  },
  {
    number: "02",
    icon: "◇",
    title: "Make it yours",
    description:
      "Add your content, images, services, colours and offers.",
  },
  {
    number: "03",
    icon: "◉",
    title: "See it instantly",
    description:
      "Your changes appear immediately in the live app preview.",
  },
  {
    number: "04",
    icon: "↗",
    title: "Launch when ready",
    description:
      "Happy with your app? Subscribe and we'll take it live.",
  },
];

const features = [
  {
    icon: "▣",
    title: "Business profile",
    description: "Your story, contact details, location and hours.",
  },
  {
    icon: "☷",
    title: "Services & products",
    description: "Show customers exactly what you offer.",
  },
  {
    icon: "▧",
    title: "Photo galleries",
    description: "Show your work, products or your location.",
  },
  {
    icon: "◇",
    title: "Offers & promotions",
    description: "Keep customers coming back with great offers.",
  },
  {
    icon: "♢",
    title: "Push notifications",
    description: "Reach your customers directly in their pocket.",
  },
  {
    icon: "⌁",
    title: "Analytics",
    description: "Understand how customers use your app.",
  },
];

const builderNavigation = [
  "Business",
  "Appearance",
  "Pages",
  "Services",
  "Gallery",
  "Contact",
];

function DevicePreview() {
  const [device, setDevice] = useState<"ios" | "android">("ios");

  const isIOS = device === "ios";

  return (
    <div className="flex min-w-0 flex-col items-center">
      {/* Device selector */}
      <div className="mb-5 inline-flex rounded-full border border-zinc-200 bg-white p-1 shadow-sm">
        <button
          type="button"
          onClick={() => setDevice("ios")}
          className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
            isIOS
              ? "bg-zinc-950 text-white"
              : "text-zinc-500 hover:text-zinc-900"
          }`}
        >
          iOS
        </button>

        <button
          type="button"
          onClick={() => setDevice("android")}
          className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
            !isIOS
              ? "bg-zinc-950 text-white"
              : "text-zinc-500 hover:text-zinc-900"
          }`}
        >
          Android
        </button>
      </div>

      {/* DEVICE */}
      <div
        className={`relative shrink-0 overflow-hidden border-[5px] border-zinc-900 bg-zinc-900 shadow-[0_20px_45px_rgba(0,0,0,0.25)] transition-all duration-300 ${
          isIOS
            ? "h-[370px] w-[185px] rounded-[2.6rem]"
            : "h-[375px] w-[188px] rounded-[2rem]"
        }`}
      >
        {/* iOS Dynamic Island */}
        {isIOS && (
          <div className="absolute left-1/2 top-2 z-30 h-5 w-[72px] -translate-x-1/2 rounded-full bg-zinc-950" />
        )}

        {/* Android camera */}
        {!isIOS && (
          <div className="absolute left-1/2 top-2 z-30 h-3 w-3 -translate-x-1/2 rounded-full bg-zinc-800 ring-1 ring-zinc-700" />
        )}

        {/* SCREEN */}
        <div
          className={`relative h-full overflow-hidden bg-white ${
            isIOS ? "rounded-[2.15rem]" : "rounded-[1.65rem]"
          }`}
        >
          {/* Status bar */}
          <div className="flex h-8 items-center justify-between px-4 pt-1 text-[7px] font-medium text-zinc-500">
            <span>9:41</span>

            <div className="flex items-center gap-1">
              <span className="text-[6px]">●●●</span>
              <span className="text-[7px]">▰</span>
            </div>
          </div>

          {/* App content */}
          <div className="h-[calc(100%-32px)] overflow-hidden">
            {/* App header */}
            <div className="px-4 pb-3 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[6px] font-medium uppercase tracking-widest text-indigo-600">
                    Welcome
                  </p>

                  <p className="mt-1 text-[11px] font-bold text-zinc-950">
                    ABC Plumbing
                  </p>
                </div>

                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-50 text-[6px] font-bold text-indigo-600">
                  ABC
                </div>
              </div>
            </div>

            {/* Hero */}
            <div className="px-4">
              <div className="relative h-[88px] overflow-hidden rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-800">
                <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10" />

                <div className="absolute bottom-3 left-3 right-3">
                  <p className="text-[6px] font-medium tracking-wide text-indigo-100">
                    PROFESSIONAL PLUMBING
                  </p>

                  <p className="mt-1 text-[12px] font-bold leading-tight text-white">
                    We&apos;re here when
                    <br />
                    you need us.
                  </p>
                </div>
              </div>
            </div>

            {/* Services */}
            <div className="px-4 pb-4 pt-4">
              <div className="flex items-center justify-between">
                <p className="text-[9px] font-bold text-zinc-950">
                  Our Services
                </p>

                <p className="text-[6px] font-medium text-indigo-600">
                  View all
                </p>
              </div>

              <div className="mt-2 space-y-2">
                {[
                  ["Emergency Plumbing", "Available 24/7"],
                  ["Geyser Installation", "Professional service"],
                  ["Leak Detection", "Fast response"],
                ].map(([service, description]) => (
                  <div
                    key={service}
                    className="flex items-center gap-2 rounded-lg border border-zinc-100 bg-white p-2"
                  >
                    <div className="h-7 w-7 shrink-0 rounded-md bg-indigo-50" />

                    <div className="min-w-0">
                      <p className="truncate text-[7px] font-semibold text-zinc-800">
                        {service}
                      </p>

                      <p className="mt-0.5 truncate text-[6px] text-zinc-400">
                        {description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="mt-3 rounded-lg bg-zinc-950 py-2.5 text-center text-[7px] font-semibold text-white">
                Contact ABC Plumbing
              </div>
            </div>
          </div>

          {/* Bottom navigation */}
          <div className="absolute bottom-0 left-0 right-0 border-t border-zinc-100 bg-white px-4 py-2.5">
            <div className="flex items-center justify-between">
              {["Home", "Services", "Gallery", "Contact"].map(
                (item, index) => (
                  <div
                    key={item}
                    className={`text-center text-[5.5px] ${
                      index === 0
                        ? "font-semibold text-indigo-600"
                        : "text-zinc-400"
                    }`}
                  >
                    <div className="mb-0.5 text-[8px]">
                      {["⌂", "☷", "▧", "♧"][index]}
                    </div>

                    {item}
                  </div>
                ),
              )}
            </div>
          </div>
        </div>

        {/* iOS home indicator */}
        {isIOS && (
          <div className="absolute bottom-1.5 left-1/2 z-30 h-1 w-16 -translate-x-1/2 rounded-full bg-zinc-700" />
        )}

        {/* Android navigation */}
        {!isIOS && (
          <div className="absolute bottom-0 left-0 right-0 z-30 flex h-5 items-center justify-center gap-6 bg-zinc-950 text-[7px] text-zinc-500">
            <span>◁</span>
            <span>○</span>
            <span>□</span>
          </div>
        )}
      </div>

      {/* Label */}
      <div className="mt-4 text-center">
        <p className="text-[10px] font-semibold text-zinc-700">
          {isIOS ? "iOS Preview" : "Android Preview"}
        </p>

        <p className="mt-1 text-[9px] text-zinc-400">
          Live app preview
        </p>
      </div>
    </div>
  );
}

function BuilderPreview() {
  return (
    <div className="relative">
      {/* Glow */}
      <div className="absolute -inset-10 -z-10 rounded-[4rem] bg-indigo-100/60 blur-3xl" />

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_30px_80px_rgba(24,24,27,0.14)]">
        {/* Builder header */}
        <div className="flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-5">
          <div className="flex items-center gap-2 text-sm font-bold tracking-tight">
            <span>We</span>
            <span className="text-indigo-600">Make</span>
            <span>Apps</span>
          </div>

          <div className="text-xs font-semibold text-zinc-700">
            My App <span className="ml-1 text-zinc-400">⌄</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-[11px] font-medium text-zinc-600 sm:flex"
            >
              <span>◉</span>
              Preview
            </button>

            <button
              type="button"
              className="rounded-lg bg-indigo-600 px-3 py-2 text-[11px] font-semibold text-white shadow-sm"
            >
              Save
            </button>
          </div>
        </div>

        {/* Builder body */}
        <div className="grid min-h-[500px] grid-cols-[145px_1fr_230px] sm:grid-cols-[165px_1fr_280px]">
          {/* Sidebar */}
          <aside className="border-r border-zinc-200 bg-zinc-50 p-4">
            <p className="mb-4 px-2 text-[9px] font-bold uppercase tracking-widest text-zinc-400">
              Build
            </p>

            <div className="space-y-1">
              {builderNavigation.map((item, index) => (
                <div
                  key={item}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-[10px] font-medium sm:text-[11px] ${
                    index === 0
                      ? "bg-white text-indigo-600 shadow-sm ring-1 ring-zinc-100"
                      : "text-zinc-600"
                  }`}
                >
                  <span className="w-4 text-center text-zinc-400">
                    {["♙", "◇", "□", "♧", "▧", "♧"][index]}
                  </span>

                  {item}
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-xl border border-indigo-100 bg-indigo-50 p-3">
              <p className="text-[8px] font-bold uppercase tracking-wider text-indigo-600">
                Build for free
              </p>

              <p className="mt-1 text-[8px] leading-4 text-indigo-600/70">
                No account required to start.
              </p>
            </div>
          </aside>

          {/* Editor */}
          <section className="min-w-0 bg-white p-6 sm:p-8">
            <div className="mb-7">
              <p className="text-[9px] font-bold uppercase tracking-widest text-indigo-600">
                Business
              </p>

              <h3 className="mt-2 text-sm font-bold text-zinc-950">
                Tell customers about your business
              </h3>

              <p className="mt-1 text-[10px] leading-5 text-zinc-400">
                This information will appear throughout your app.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-semibold text-zinc-600">
                  Business name
                </label>

                <div className="mt-2 rounded-lg border border-zinc-200 px-3 py-2.5 text-[11px] text-zinc-800">
                  ABC Plumbing
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-zinc-600">
                  Short description
                </label>

                <div className="mt-2 rounded-lg border border-zinc-200 px-3 py-3 text-[10px] leading-5 text-zinc-500">
                  Professional plumbing services whenever you need us.
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-zinc-600">
                  Primary colour
                </label>

                <div className="mt-2 flex items-center gap-3 rounded-lg border border-zinc-200 px-3 py-2.5">
                  <span className="h-5 w-5 rounded-md bg-indigo-600" />
                  <span className="text-[10px] text-zinc-700">
                    Indigo
                  </span>
                  <span className="ml-auto text-zinc-400">⌄</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-zinc-600">
                  Logo
                </label>

                <div className="mt-2 flex h-20 w-32 items-center justify-center rounded-lg border border-dashed border-zinc-300">
                  <div className="text-center">
                    <div className="text-sm text-zinc-400">↑</div>

                    <p className="mt-1 text-[8px] font-medium text-zinc-500">
                      Upload logo
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Device preview */}
          <section className="flex items-center justify-center border-l border-zinc-200 bg-zinc-50 p-5">
            <DevicePreview />
          </section>
        </div>
      </div>

      {/* Live preview badge */}
      <div className="absolute -bottom-5 left-6 hidden rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-xl sm:block">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-sm text-emerald-600">
            ✓
          </div>

          <div>
            <p className="text-[10px] font-bold text-zinc-900">
              Live preview
            </p>

            <p className="text-[9px] text-zinc-400">
              Updates as you build
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-zinc-950">
      {/* NAVIGATION */}
      <nav className="sticky top-0 z-50 border-b border-zinc-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold tracking-tight">
            <span>We</span>
            <span className="text-indigo-600">Make</span>
            <span>Apps</span>
          </Link>

          {/* Left-aligned menu */}
          <div className="ml-12 hidden flex-1 items-center gap-8 text-sm font-medium text-zinc-500 md:flex">
            <a
              href="#how-it-works"
              className="transition hover:text-zinc-950"
            >
              How it works
            </a>

            <a
              href="#features"
              className="transition hover:text-zinc-950"
            >
              Features
            </a>

            <a
              href="#pricing"
              className="transition hover:text-zinc-950"
            >
              Pricing
            </a>

            <a
              href="#custom"
              className="transition hover:text-zinc-950"
            >
              Custom Apps
            </a>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-4">
            <Link
              href="/signin"
              className="text-sm font-medium text-zinc-600 transition hover:text-zinc-950"
            >
              Sign in
            </Link>

            <Link
              href="/builder"
              className="rounded-full bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-zinc-800"
            >
              Start Building Free
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 pb-28 pt-20 lg:px-8 lg:pb-36 lg:pt-28">
          <div className="grid items-center gap-20 lg:grid-cols-[0.82fr_1.18fr]">
            {/* Hero copy */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-4 py-2 text-xs font-semibold text-indigo-700">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
                Build your business app for free
              </div>

              <h1 className="mt-7 max-w-xl text-5xl font-bold tracking-[-0.045em] sm:text-6xl">
                Build the app your{" "}
                <span className="text-indigo-600">
                  business deserves.
                </span>
              </h1>

              <p className="mt-7 max-w-lg text-lg leading-8 text-zinc-600">
                Design your mobile app yourself, add your content and see
                every change instantly.
              </p>

              <p className="mt-2 max-w-lg text-lg leading-8 text-zinc-600">
                No coding. No commitment. Launch when you&apos;re ready.
              </p>

              <div className="mt-9 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/builder"
                  className="rounded-full bg-zinc-950 px-7 py-4 text-center text-sm font-semibold text-white shadow-lg shadow-zinc-200 transition hover:-translate-y-0.5 hover:bg-zinc-800"
                >
                  Start Building Free →
                </Link>

                <a
                  href="#how-it-works"
                  className="rounded-full border border-zinc-200 px-7 py-4 text-center text-sm font-semibold text-zinc-700 transition hover:border-zinc-400"
                >
                  See How It Works
                </a>
              </div>

              <div className="mt-5 flex items-center gap-2 text-sm text-zinc-500">
                <span className="flex h-5 w-5 items-center justify-center rounded-full border border-zinc-200 text-[10px]">
                  ✓
                </span>

                No account required to start
              </div>
            </div>

            {/* Builder preview */}
            <BuilderPreview />
          </div>
        </div>
      </section>

      {/* BRAND STATEMENT */}
      <section className="border-y border-indigo-100 bg-indigo-50/50">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-6 py-12 md:grid-cols-[1fr_1px_1fr] lg:px-8">
          <div className="flex items-center gap-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white text-xl text-indigo-600 shadow-sm">
              ♢
            </div>

            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              You bring the business.
              <br />
              <span className="text-indigo-600">
                We make the app.
              </span>
            </h2>
          </div>

          <div className="hidden h-16 bg-indigo-200 md:block" />

          <p className="max-w-xl text-base leading-7 text-zinc-600">
            You know your customers, your services and your business better
            than anyone. We give you the tools to turn that into a
            professional mobile experience.
          </p>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[240px_1fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
                How it works
              </p>

              <h2 className="mt-4 text-3xl font-bold tracking-tight">
                From business idea to mobile app.
              </h2>
            </div>

            <div className="grid gap-8 md:grid-cols-4">
              {steps.map((step, index) => (
                <div key={step.number} className="relative">
                  {index < steps.length - 1 && (
                    <div className="absolute left-10 top-5 hidden w-full border-t border-dashed border-indigo-200 md:block" />
                  )}

                  <div className="relative">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                      {step.icon}
                    </div>

                    <p className="mt-5 text-xs font-bold text-indigo-600">
                      {step.number}
                    </p>

                    <h3 className="mt-2 text-base font-bold">
                      {step.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-zinc-500">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES + PRICING */}
      <section className="border-t border-zinc-100">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-24 lg:grid-cols-2 lg:px-8">
          {/* Features */}
          <div
            id="features"
            className="rounded-3xl border border-zinc-200 p-8 sm:p-10"
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
              Powerful features
            </p>

            <h2 className="mt-4 max-w-md text-3xl font-bold tracking-tight">
              Everything you need to grow with your app.
            </h2>

            <div className="mt-10 grid gap-x-8 gap-y-8 sm:grid-cols-2">
              {features.map((feature) => (
                <div key={feature.title}>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-sm text-indigo-600">
                    {feature.icon}
                  </div>

                  <h3 className="mt-4 text-sm font-bold">
                    {feature.title}
                  </h3>

                  <p className="mt-2 text-xs leading-5 text-zinc-500">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div
            id="pricing"
            className="rounded-3xl border border-zinc-200 bg-zinc-50 p-8 sm:p-10"
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
              Simple pricing
            </p>

            <h2 className="mt-4 text-3xl font-bold tracking-tight">
              Build for free.
              <br />
              Launch for R999/month.
            </h2>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {/* Free */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-6">
                <p className="text-sm font-bold">
                  Build for free
                </p>

                <p className="mt-3 text-4xl font-bold text-indigo-600">
                  R0
                </p>

                <ul className="mt-6 space-y-3 text-xs text-zinc-600">
                  <li>✓ Build your entire app</li>
                  <li>✓ Preview instantly</li>
                  <li>✓ Experiment and edit</li>
                  <li>✓ Save with a free account</li>
                </ul>
              </div>

              {/* Paid */}
              <div className="rounded-2xl border border-indigo-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-bold">
                  Launch your app
                </p>

                <div className="mt-3 flex items-end gap-2">
                  <p className="text-4xl font-bold text-indigo-600">
                    R999
                  </p>

                  <span className="pb-1 text-xs text-zinc-400">
                    /month
                  </span>
                </div>

                <ul className="mt-6 space-y-3 text-xs text-zinc-600">
                  <li>✓ Live mobile app</li>
                  <li>✓ Business dashboard</li>
                  <li>✓ Push notifications</li>
                  <li>✓ Analytics & insights</li>
                  <li>✓ Content updates</li>
                  <li>✓ Ongoing platform support</li>
                </ul>
              </div>
            </div>

            <Link
              href="/builder"
              className="mt-6 block rounded-full bg-zinc-950 px-6 py-4 text-center text-sm font-semibold text-white transition hover:bg-zinc-800"
            >
              Start Building Free
            </Link>

            <p className="mt-3 text-center text-xs text-zinc-400">
              No credit card. No commitment.
            </p>
          </div>
        </div>
      </section>

      {/* CUSTOM DEVELOPMENT */}
      <section
        id="custom"
        className="overflow-hidden bg-[#090d24] text-white"
      >
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-[1fr_1fr_280px] lg:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-400">
              Need something more?
            </p>

            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Your idea doesn&apos;t have to fit inside a template.
            </h2>

            <p className="mt-5 max-w-lg text-sm leading-7 text-zinc-400">
              Our builder covers the most common needs. If you need advanced
              functionality, integrations or a fully custom solution, our
              development team can help.
            </p>

            <Link
              href="/custom-app"
              className="mt-8 inline-flex rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"
            >
              Discuss a Custom App →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              "Custom booking systems",
              "Payments & subscriptions",
              "Customer portals",
              "API integrations",
              "CRM & ERP integrations",
              "Specialised workflows",
            ].map((item) => (
              <div
                key={item}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center text-xs font-medium text-zinc-300"
              >
                {item}
              </div>
            ))}
          </div>

          {/* Custom app visual */}
          <div className="hidden justify-center lg:flex">
            <div className="flex">
              <div className="h-52 w-28 rotate-6 rounded-[1.5rem] border-4 border-zinc-800 bg-zinc-900 p-2 shadow-2xl">
                <div className="h-full rounded-[1rem] bg-gradient-to-b from-indigo-600 to-indigo-900 p-3">
                  <div className="h-2 w-8 rounded-full bg-white/30" />

                  <p className="mt-8 text-[8px] font-bold text-white">
                    Bookings
                  </p>

                  <div className="mt-3 rounded-lg bg-white/10 p-2">
                    <p className="text-[6px] text-zinc-300">
                      Today&apos;s bookings
                    </p>

                    <p className="mt-1 text-sm font-bold text-white">
                      24
                    </p>
                  </div>
                </div>
              </div>

              <div className="-ml-5 mt-8 h-52 w-28 -rotate-6 rounded-[1.5rem] border-4 border-zinc-800 bg-zinc-900 p-2 shadow-2xl">
                <div className="h-full rounded-[1rem] bg-zinc-950 p-3">
                  <div className="h-2 w-8 rounded-full bg-zinc-800" />

                  <p className="mt-8 text-[8px] font-bold text-white">
                    Dashboard
                  </p>

                  <p className="mt-3 text-[7px] text-zinc-500">
                    Total revenue
                  </p>

                  <p className="mt-1 text-sm font-bold text-white">
                    R1,250
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-indigo-50">
        <div className="mx-auto max-w-4xl px-6 py-24 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
            Ready?
          </p>

          <h2 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            See what your business could look like as an app.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-zinc-600">
            Start designing immediately. Create an account later when you
            want to save your progress.
          </p>

          <Link
            href="/builder"
            className="mt-9 inline-flex rounded-full bg-zinc-950 px-8 py-4 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-zinc-800"
          >
            Start Building Free →
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-zinc-100 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-8 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <p>
            © {new Date().getFullYear()} WeMakeApps. All rights reserved.
          </p>

          <p>
            You bring the business.{" "}
            <span className="font-semibold text-indigo-600">
              We
            </span>{" "}
            make the app.
          </p>

          <div className="flex gap-5">
            <a href="#" className="hover:text-zinc-950">
              Privacy
            </a>

            <a href="#" className="hover:text-zinc-950">
              Terms
            </a>

            <a href="#" className="hover:text-zinc-950">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}