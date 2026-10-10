
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
    ShieldCheck,
    LoaderCircle,
    CheckCircle2,
    CircleAlert,
    ArrowRight,
} from "lucide-react";

type Status = "loading" | "success" | "error";

export default function CallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const started = useRef(false);

    const [status, setStatus] = useState<Status>("loading");
    const [message, setMessage] = useState("Verifying your authentication...");

    useEffect(() => {
        if (started.current) return;
        started.current = true;

        async function handleCallback() {
            const code = searchParams.get("code");
            const oauthError = searchParams.get("error");

            if (oauthError) {
                setStatus("error");
                setMessage(
                    searchParams.get("error_description") ||
                    "Authentication was cancelled or could not be completed."
                );
                return;
            }

            if (!code) {
                setStatus("error");
                setMessage("The authentication callback is missing its code.");
                return;
            }

            const apiUrl = process.env.NEXT_PUBLIC_API_URL;

            if (!apiUrl) {
                setStatus("error");
                setMessage("Authentication API is not configured.");
                return;
            }

            try {
                const response = await fetch(`${apiUrl}/api/auth/callback`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({ code }),
                });

                const data = await response.json().catch(() => ({}));

                if (!response.ok) {
                    throw new Error(
                        data.message || data.error || "Authentication failed."
                    );
                }

                setStatus("success");
                setMessage("Authentication successful. Redirecting...");

                router.replace("/workspace");
                router.refresh();
            } catch (error) {
                setStatus("error");
                setMessage(
                    error instanceof Error
                        ? error.message
                        : "Unable to complete authentication. Please try again."
                );
            }
        }

        void handleCallback();
    }, [router, searchParams]);

    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-5 py-12 text-neutral-900">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,0,0,0.045),transparent_55%)]"
            />

            <section className="relative w-full max-w-md rounded-3xl border border-neutral-200 bg-white p-8 text-center shadow-[0_3px_0_#e5e5e5,0_14px_45px_rgba(0,0,0,0.055)] sm:p-10">
                <Link href="/" className="inline-flex items-center gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-neutral-200 bg-white shadow-sm">
                        <ShieldCheck size={25} strokeWidth={1.7} />
                    </span>

                    <span className="text-xl font-bold tracking-tight">
                        CyberSpend{" "}
                        <span className="font-medium text-neutral-500">AI</span>
                    </span>
                </Link>

                <div className="mx-auto mt-10 flex h-16 w-16 items-center justify-center rounded-2xl border border-neutral-200 bg-neutral-50">
                    {status === "loading" && (
                        <LoaderCircle
                            size={29}
                            className="animate-spin text-neutral-900"
                        />
                    )}

                    {status === "success" && (
                        <CheckCircle2 size={29} className="text-neutral-900" />
                    )}

                    {status === "error" && (
                        <CircleAlert size={29} className="text-neutral-900" />
                    )}
                </div>

                <h1 className="mt-6 text-2xl font-semibold tracking-tight sm:text-3xl">
                    {status === "loading" && "Verifying your account"}
                    {status === "success" && "You're authenticated"}
                    {status === "error" && "Authentication failed"}
                </h1>

                <p
                    role={status === "error" ? "alert" : "status"}
                    aria-live="polite"
                    className="mt-3 text-sm leading-7 text-neutral-600"
                >
                    {message}
                </p>

                {status === "loading" && (
                    <div className="mt-7 h-1.5 overflow-hidden rounded-full bg-neutral-100">
                        <div className="h-full w-1/2 animate-pulse rounded-full bg-neutral-900" />
                    </div>
                )}

                {status === "error" && (
                    <div className="mt-7 flex flex-col gap-3">
                        <Link
                            href="/sign-in"
                            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-neutral-900 bg-neutral-900 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-800"
                        >
                            Return to sign in
                            <ArrowRight size={16} />
                        </Link>

                        <Link
                            href="/"
                            className="inline-flex h-12 items-center justify-center rounded-xl border border-neutral-200 bg-white px-5 text-sm font-semibold text-neutral-800 transition hover:bg-neutral-50"
                        >
                            Back to home
                        </Link>
                    </div>
                )}

                <p className="mt-8 text-xs text-neutral-400">
                    Secure authentication · CyberSpend AI
                </p>
            </section>
        </main>
    );
}
