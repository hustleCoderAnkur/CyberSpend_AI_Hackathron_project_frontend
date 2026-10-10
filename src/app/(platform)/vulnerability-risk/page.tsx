"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";

export default function Page() {
    // Same file works in every folder: the title comes from the URL,
    // e.g. /asset-risk -> "Asset Risk".
    const pathname = usePathname() ?? "";
    const slug = pathname.split("/").filter(Boolean).pop() ?? "";
    const title =
        slug
            .split("-")
            .filter(Boolean)
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ") || "This page";

    return (
        <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-white px-6 py-16 text-neutral-900">
            {/* Soft dotted background */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                    backgroundImage:
                        "radial-gradient(circle, #d4d4d4 1px, transparent 1px)",
                    backgroundSize: "24px 24px",
                    maskImage:
                        "radial-gradient(ellipse 60% 55% at 50% 45%, black 20%, transparent 75%)",
                    WebkitMaskImage:
                        "radial-gradient(ellipse 60% 55% at 50% 45%, black 20%, transparent 75%)",
                }}
            />

            <div className="relative w-full max-w-xl">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-neutral-200 bg-white shadow-sm">
                    <Sparkles size={25} strokeWidth={1.6} />
                </div>

                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                    CyberSpend AI
                </p>

                <h1 className="text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">
                    {title}
                    <span className="block text-neutral-400">is coming soon.</span>
                </h1>

                <p className="mt-4 max-w-md text-sm leading-6 text-neutral-500 sm:text-base">
                    We are building this section. It is planned and not available yet.
                </p>

                <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs font-medium text-neutral-600">
                    <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neutral-400 opacity-60 motion-reduce:animate-none" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-neutral-950" />
                    </span>
                    Planned
                </div>

                <div className="mt-8">
                    <Link
                        href="/agents"
                        className="inline-flex items-center gap-2 rounded-xl bg-neutral-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800"
                    >
                        <ArrowLeft size={16} />
                        Back to AI Agent
                    </Link>
                </div>
            </div>
        </main>
    );
}