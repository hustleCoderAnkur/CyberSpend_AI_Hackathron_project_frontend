 "use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    ArrowDown,
    ArrowRight,
    ArrowUpRight,
    LoaderCircle,
    ChevronRight,
    Database,
    ShieldCheck,
    TrendingUp,
} from "lucide-react";

const capabilities = [
    {
        number: "01",
        title: "Cyber Risk Quantification",
        description:
            "Understand cybersecurity exposure in financial terms through a structured risk assessment workflow.",
        icon: ShieldCheck,
    },
    {
        number: "02",
        title: "Security Data Intelligence",
        description:
            "Bring supported asset inventories, vulnerability records, incidents, and security datasets into one workflow.",
        icon: Database,
    },
    {
        number: "03",
        title: "Security Investment Decisions",
        description:
            "Explore risk-reduction options and compare investment scenarios when the underlying analysis is available.",
        icon: TrendingUp,
    },
];

const workflow = [
    {
        step: "01",
        title: "Connect your data",
        description:
            "Import supported security datasets or configure available data sources.",
    },
    {
        step: "02",
        title: "Assess your exposure",
        description:
            "Process your organization's security information through the available assessment workflow.",
    },
    {
        step: "03",
        title: "Understand the impact",
        description:
            "Review available financial risk results and recommendations to support security decisions.",
    },
];

const splineUrl =
    "https://my.spline.design/nexbotrobotcharacterconcept-fmJHqygb7xveUmsUvbyVRUqb/";

export default function MarketingPage() {
    const heroLines = [
        "Turn cyber risk into business clarity",
        "See security through a financial lens",
        "Make risk easier to explain",
        "Quantify risk. Optimize security spend",
        "Connect cyber threats to financial impact",
        "Make smarter security investments",
    ];
    const [heroLineIndex, setHeroLineIndex] = useState(0);
    const [activeCapability, setActiveCapability] = useState<string | null>(null);


    useEffect(() => {
        const interval = window.setInterval(() => {
            setHeroLineIndex((current) => (current + 1) % heroLines.length);
        }, 3200);
        return () => window.clearInterval(interval);
    }, []);

    return (
        <main className="min-h-screen bg-white text-[#202124] selection:bg-black selection:text-white">
            <style jsx global>{`
                @keyframes heroFade {
                    from { opacity: 0; transform: translateY(7px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
            {/* Navigation */}
            <header className="sticky top-0 z-50 border-b border-black/[0.06] bg-white/55 backdrop-blur-xl supports-[backdrop-filter]:bg-white/35 transition-all duration-500 ease-out">
                <nav className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-5 py-3.5 sm:px-8 lg:px-14">
                    <Link href="/" className="flex shrink-0 items-center gap-3">
                   

                        <span className="text-lg font-bold tracking-tight sm:text-xl">
                            CyberSpend <span className="font-medium text-neutral-500">AI</span>
                        </span>
                    </Link>

                    <div className="hidden items-center gap-8 text-sm font-bold text-neutral-600 md:flex">
                        <a href="#capabilities" className="transition hover:text-black">
                            Capabilities
                        </a>
                        <a href="#workflow" className="transition hover:text-black">
                            How it works
                        </a>
                        <a href="#about" className="transition hover:text-black">
                            About
                        </a>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href="/sign-in"
                            className="hidden rounded-xl px-4 py-3 text-sm font-semibold transition hover:bg-neutral-100 sm:inline-flex"
                        >
                            Sign in
                        </Link>

                        <Link
                            href="/sign-up"
                            className="inline-flex items-center gap-2 rounded-xl border border-neutral-950 bg-neutral-900 px-4 py-3 text-sm font-semibold text-white shadow-[0_4px_0_#000,0_6px_12px_rgba(0,0,0,0.12)] transition hover:-translate-y-0.5 hover:bg-neutral-800 active:translate-y-0.5 active:shadow-none sm:px-5"
                        >
                            Get started
                            <ArrowUpRight size={17} />
                        </Link>
                    </div>
                </nav>
            </header>

            {/* Minimal Spline hero */}
            <section className="relative isolate min-h-[calc(100svh-68px)] overflow-hidden bg-[#e4e4e4]">
                <iframe
                    src={splineUrl}
                    title="Interactive CyberSpend AI robot"
                    allow="fullscreen"
                    loading="eager"
                    className="absolute inset-0 z-0 h-full w-full border-0 bg-transparent"
                />

                {/* Compact copy stays on the left so the robot remains the focus. */}
                <div className="pointer-events-none relative z-10 mx-auto flex min-h-[calc(100svh-68px)] w-full max-w-[1600px] items-center px-5 py-20 sm:px-8 lg:px-14">
                    <div className="pointer-events-auto w-full max-w-[410px] sm:max-w-[440px]">
                        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/65 px-3.5 py-2 text-[10px] font-semibold tracking-[0.13em] text-neutral-800 sm:text-[11px]">
                            <ShieldCheck size={14} />
                            CYBER RISK, IN BUSINESS TERMS
                        </div>

                        <h1 className="text-4xl font-semibold leading-[1.02] tracking-[-0.055em] text-neutral-950 sm:text-5xl lg:text-[3.65rem]">
                            Know about your risks
                            <span className="block text-neutral-600">& Control your spend</span>
                        </h1>


                        <div className="mt-5 min-h-[56px] max-w-sm" aria-live="polite">

                            <p
                                key={heroLineIndex}
                                className="animate-[heroFade_500ms_ease-out] text-2xl font-semibold italic leading-7 tracking-tight text-neutral-700 sm:text-lg"
                            >
                                {heroLines[heroLineIndex]}
                            </p>

                        </div>


                        <div className="mt-6 flex flex-wrap items-center gap-3">
                            <Link
                                href="/sign-up"
                                className="group inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-neutral-900 px-5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-neutral-400 hover:bg-neutral-800 hover:shadow-md active:translate-y-0 active:shadow-sm"
                            >
                                Get started
                                <ArrowRight
                                    size={16}
                                    className="transition-transform duration-200 group-hover:translate-x-1"
                                />
                            </Link>

                            <a
                                href="#capabilities"
                                className="group inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-neutral-900 px-5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-neutral-400 hover:bg-neutral-800 hover:shadow-md active:translate-y-0 active:shadow-sm"
                            >
                                Explore product
                                <ArrowDown
                                    size={15}
                                    className="transition-transform duration-200 group-hover:translate-y-0.5"
                                />
                            </a>
                        </div>


                    </div>
                </div>
            </section>

            {/* Capabilities */}
            <section
                id="capabilities"
                className="scroll-mt-20 border-t border-neutral-200 bg-[#fafafa] px-5 py-24 sm:px-8 lg:px-14 lg:py-32"
            >
                <div className="mx-auto max-w-[1400px]">
                    <div className="max-w-3xl">
                        <p className="text-sm font-bold uppercase tracking-[0.18em] text-neutral-500">
                            Platform capabilities
                        </p>

                        <h2 className="mt-5 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl lg:text-6xl">
                            Clarity for complex cyber risks
                        </h2>

                        <p className="mt-6 max-w-2xl text-lg leading-8 text-neutral-600 sm:text-xl">
                            A structured approach to security data, risk assessment, and
                            understanding potential financial consequences
                        </p>
                    </div>


                    <div className="mt-14 grid gap-6 md:grid-cols-3">
                        {capabilities.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeCapability === item.number;

                            return (
                                <button
                                    key={item.number}
                                    type="button"
                                    onClick={() =>
                                        setActiveCapability((current) =>
                                            current === item.number ? null : item.number
                                        )
                                    }
                                    aria-pressed={isActive}
                                    className={`group relative isolate w-full overflow-hidden rounded-2xl p-[1.5px] text-left transition-all duration-1000 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-4 ${isActive
                                            ? "shadow-[0_8px_28px_rgba(0,0,0,0.12)]"
                                            : "shadow-[0_3px_0_#e5e5e5,0_8px_24px_rgba(0,0,0,0.035)] hover:shadow-[0_10px_28px_rgba(0,0,0,0.09)]"
                                        }`}
                                >
                                    {/* Animated black border */}
                                    <span
                                        aria-hidden="true"
                                        className={`absolute inset-0 -z-10 rounded-2xl transition-opacity duration-1000 ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-70"
                                            }`}
                                    >
                                        <span className="absolute inset-[-100%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_240deg,#000_310deg,#777_340deg,transparent_360deg)]" />
                                    </span>

                                    {/* Card content */}
                                    <span className="relative block h-full rounded-[calc(1rem-1px)] bg-white p-7 sm:p-8">
                                        <span className="flex items-center justify-between">
                                            <span className="flex h-14 w-14 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50">
                                                <Icon size={25} strokeWidth={1.7} />
                                            </span>

                                            <span className="font-mono text-sm text-neutral-400">
                                                {item.number}
                                            </span>
                                        </span>

                                        <span className="mt-9 block text-xl font-semibold tracking-tight sm:text-2xl">
                                            {item.title}
                                        </span>

                                        <span className="mt-4 block text-base leading-8 text-neutral-600">
                                            {item.description}
                                        </span>

                                        <span className="mt-7 flex items-center justify-between gap-3 text-sm font-semibold text-neutral-800">
                                            <span className="flex items-center gap-2">
                                                {isActive ? (
                                                    <>
                                                        <LoaderCircle
                                                            size={16}
                                                            className="animate-spin"
                                                        />
                                                        Loading...
                                                    </>
                                                ) : (
                                                    <>
                                                        Product capability
                                                        <ChevronRight
                                                            size={16}
                                                            className="transition-transform group-hover:translate-x-1"
                                                        />
                                                    </>
                                                )}
                                            </span>

                                            {isActive && (
                                                <span className="h-2 w-2 animate-pulse rounded-full bg-black" />
                                            )}
                                        </span>
                                    </span>
                                </button>
                            );
                        })}
                    </div>


                    <p className="mt-10 max-w-4xl text-xl leading-7 text-neutral-500">
                        Feature descriptions explain the product direction. Actual
                        availability depends on the implemented backend workflows and
                        risk-engine capabilities.
                    </p>
                </div>
            </section>

            {/* Workflow */}
            <section
                id="workflow"
                className="scroll-mt-20 bg-white px-5 py-24 sm:px-8 lg:px-14 lg:py-32"
            >
                <div className="mx-auto max-w-[1400px]">
                    <div className="max-w-3xl">
                        <p className="text-sm font-bold uppercase tracking-[0.18em] text-neutral-500">
                            How it works
                        </p>

                        <h2 className="mt-5 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl lg:text-6xl">
                            From security data to informed decisions.
                        </h2>

                        <p className="mt-6 text-lg leading-8 text-neutral-600 sm:text-xl">
                            Work with your organization&apos;s data and review the results that
                            the platform can actually produce.
                        </p>
                    </div>


                    <div className="mt-14 grid gap-6 md:grid-cols-3">
                        {workflow.map((item) => (
                            <article
                                key={item.step}
                                className="group relative isolate overflow-hidden rounded-2xl p-[1.5px] shadow-[0_3px_0_#e5e5e5,0_8px_20px_rgba(0,0,0,0.025)] transition-all duration-500 ease-in-out hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.09)]"
                            >
                                {/* Animated border */}
                                <span
                                    aria-hidden="true"
                                    className="absolute inset-0 -z-10 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                                >
                                    <span className="absolute inset-[-100%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_240deg,#000_310deg,#777_340deg,transparent_360deg)]" />
                                </span>

                                {/* Card content */}
                                <div className="relative h-full rounded-[calc(1rem-1px)] bg-white p-7 sm:p-8">
                                    <span className="inline-flex h-12 min-w-12 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 px-3 font-mono text-base font-semibold shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)] transition-all duration-500 group-hover:border-black group-hover:bg-neutral-100 group-hover:shadow-sm">
                                        {item.step}
                                    </span>

                                    <h3 className="mt-7 text-xl font-semibold transition-colors duration-500 group-hover:text-black sm:text-2xl">
                                        {item.title}
                                    </h3>

                                    <p className="mt-4 text-base leading-8 text-neutral-600 transition-colors duration-500 group-hover:text-neutral-800">
                                        {item.description}
                                    </p>
                                </div>
                            </article>
                        ))}
                    </div>

                </div>
            </section>

            {/* CTA */}
            <section
                id="about"
                className="scroll-mt-20 bg-[#fafafa] px-5 py-20 sm:px-8 lg:px-14 lg:py-28"
            >
                <div className="mx-auto flex max-w-[1400px] flex-col justify-between gap-8 rounded-3xl border border-neutral-200 bg-white p-8 shadow-[0_4px_0_#e5e5e5,0_14px_40px_rgba(0,0,0,0.05)] sm:p-12 lg:flex-row lg:items-center lg:p-16">
                    <div className="max-w-3xl">
                        <p className="text-sm font-bold uppercase tracking-[0.18em] text-neutral-500">
                            Get started
                        </p>

                        <h2 className="mt-5 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl lg:text-5xl">
                            Put your cybersecurity data into context.
                        </h2>

                        <p className="mt-5 text-lg leading-8 text-neutral-600">
                            Enter the platform to work with your organization&apos;s available
                            workspaces, security data, and assessments.
                        </p>
                    </div>

                    <Link
                        href="/sign-up"
                        className="inline-flex shrink-0 items-center justify-center gap-3 self-start rounded-xl border border-black bg-neutral-900 px-7 py-4 text-base font-semibold text-white shadow-[0_5px_0_#000,0_8px_16px_rgba(0,0,0,0.1)] transition hover:-translate-y-0.5 hover:bg-neutral-800 active:translate-y-1 active:shadow-none lg:self-center"
                    >
                        Create an account
                        <ArrowRight size={19} />
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-neutral-200 bg-white px-5 py-8 sm:px-8 lg:px-14">
                <div className="mx-auto flex max-w-[1400px] flex-col gap-4 text-sm text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
                    <Link href="/" className="text-base font-bold text-neutral-900">
                        CyberSpend AI
                    </Link>

                    <p>
                        Risk intelligence for informed cybersecurity investment decisions.
                    </p>


                    <p>© 2026 CyberSpend AI</p>

                </div>
            </footer>
        </main>
    );
}