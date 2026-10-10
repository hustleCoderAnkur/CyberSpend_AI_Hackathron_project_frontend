
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    ArrowRight,
    Eye,
    EyeOff,
    ShieldCheck,
    LoaderCircle,
    LockKeyhole,
    Mail,
} from "lucide-react";

export default function SignInPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");


    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");

        if (!email.trim() || !password) {
            setError("Please enter your email and password.");
            return;
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL;

        if (!apiUrl) {
            setError("Authentication API is not configured.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${apiUrl}/api/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    email: email.trim(),
                    password,
                }),
            });

            const result = await response.json().catch(() => null);

            if (!response.ok || !result?.success) {
                throw new Error(
                    result?.message || "Unable to sign in. Please try again."
                );
            }

            const { user, accessToken, refreshToken } = result.data ?? {};

            if (!user?.id || !accessToken || !refreshToken) {
                throw new Error("Invalid authentication response from server.");
            }

            // Store tokens only after deciding on a secure token-storage strategy.
            // Prefer HttpOnly Secure cookies set by the backend.
            // Do not put authentication tokens in localStorage.
            sessionStorage.setItem("accessToken", accessToken);
            sessionStorage.setItem("refreshToken", refreshToken);

            router.replace("/agents");
            router.refresh();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Something went wrong. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }


    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-5 py-12 text-neutral-900 selection:bg-black selection:text-white">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,0,0,0.045),transparent_55%)]"
            />

            <Link
                href="/"
                className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white/80 px-3.5 py-2.5 text-sm font-medium text-neutral-600 transition hover:border-neutral-400 hover:text-black sm:left-8 sm:top-8"
            >
                <ArrowLeft size={16} />
                Back to home
            </Link>

            <section className="relative w-full max-w-md">
                <div className="rounded-3xl border border-neutral-200 bg-white p-7 shadow-[0_3px_0_#e5e5e5,0_14px_45px_rgba(0,0,0,0.055)] sm:p-10">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-3"
                    >
                        <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-neutral-200 bg-white shadow-sm">
                            <ShieldCheck size={25} strokeWidth={1.7} />
                        </span>

                        <span className="text-xl font-bold tracking-tight">
                            CyberSpend{" "}
                            <span className="font-medium text-neutral-500">AI</span>
                        </span>
                    </Link>

                    <div className="mt-9">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                            Welcome back
                        </p>

                        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                            Sign in to your account
                        </h1>

                        <p className="mt-3 text-sm leading-6 text-neutral-600">
                            Access your organization and continue working with your
                            cybersecurity risk data.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                        <div>
                            <label
                                htmlFor="email"
                                className="mb-2 block text-sm font-medium"
                            >
                                Work email
                            </label>

                            <div className="relative">
                                <Mail
                                    size={18}
                                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
                                />

                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    placeholder="you@company.com"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    required
                                    disabled={loading}
                                    className="h-12 w-full rounded-xl border border-neutral-200 bg-white pl-11 pr-4 text-sm outline-none transition placeholder:text-neutral-400 hover:border-neutral-300 focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10 disabled:opacity-60"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="mb-2 flex items-center justify-between gap-3">
                                <label
                                    htmlFor="password"
                                    className="text-sm font-medium"
                                >
                                    Password
                                </label>

                                <Link
                                    href="/forgot-password"
                                    className="text-xs font-medium text-neutral-500 transition hover:text-black"
                                >
                                    Forgot password?
                                </Link>
                            </div>

                            <div className="relative">
                                <LockKeyhole
                                    size={18}
                                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
                                />

                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    required
                                    disabled={loading}
                                    className="h-12 w-full rounded-xl border border-neutral-200 bg-white pl-11 pr-12 text-sm outline-none transition placeholder:text-neutral-400 hover:border-neutral-300 focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10 disabled:opacity-60"
                                />

                                <button
                                    type="button"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    onClick={() => setShowPassword((current) => !current)}
                                    className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-neutral-500 transition hover:bg-neutral-100 hover:text-black"
                                >
                                    {showPassword ? (
                                        <EyeOff size={17} />
                                    ) : (
                                        <Eye size={17} />
                                    )}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <p
                                role="alert"
                                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
                            >
                                {error}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-neutral-900 bg-neutral-900 px-5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-neutral-800 hover:shadow-md active:translate-y-0 active:shadow-sm disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {loading ? (
                                <>
                                    <LoaderCircle size={17} className="animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Sign in
                                    <ArrowRight
                                        size={17}
                                        className="transition-transform duration-200 group-hover:translate-x-1"
                                    />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="my-7 flex items-center gap-4">
                        <div className="h-px flex-1 bg-neutral-200" />
                        <span className="text-xs text-neutral-400">NEW TO CYBERSPEND?</span>
                        <div className="h-px flex-1 bg-neutral-200" />
                    </div>

                    <Link
                        href="/sign-up"
                        className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-neutral-200 bg-white px-5 text-sm font-semibold text-neutral-800 transition-all duration-200 hover:border-neutral-400 hover:bg-neutral-50 active:scale-[0.99]"
                    >
                        Create an account
                    </Link>
                </div>

                <p className="mt-6 text-center text-xs leading-6 text-neutral-500">
                    CyberSpend AI · Cyber risk intelligence for informed decisions
                </p>
            </section>
        </main>
    );
}
