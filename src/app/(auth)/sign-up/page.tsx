
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
    UserRound,
    Building2,
    Check,
} from "lucide-react";

export default function SignUpPage() {
    const router = useRouter();

    const [name, setName] = useState("");
    const [organization, setOrganization] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");

        if (password.length < 8) {
            setError("Password must contain at least 8 characters.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (!acceptedTerms) {
            setError("Please accept the terms before continuing.");
            return;
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL;

        if (!apiUrl) {
            setError("Authentication API is not configured.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${apiUrl}/api/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    name: name.trim(),
                    email: email.trim(),
                    password,
                }),
            });

            const result = await response.json().catch(() => null);

            if (!response.ok || !result?.success) {
                throw new Error(
                    result?.message || "Unable to create your account."
                );
            }

            const { user, accessToken, refreshToken } = result.data ?? {};

            if (!user?.id || !accessToken || !refreshToken) {
                throw new Error("Invalid registration response from server.");
            }

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


    const inputClass =
        "h-12 w-full rounded-xl border border-neutral-200 bg-white pl-11 pr-4 text-sm outline-none transition placeholder:text-neutral-400 hover:border-neutral-300 focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10 disabled:opacity-60";

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
                    <Link href="/" className="inline-flex items-center gap-3">
                        <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-neutral-200 bg-white shadow-sm">
                            <ShieldCheck size={25} strokeWidth={1.7} />
                        </span>

                        <span className="text-xl font-bold tracking-tight">
                            CyberSpend{" "}
                            <span className="font-medium text-neutral-500">AI</span>
                        </span>
                    </Link>

                    <div className="mt-8">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                            Get started
                        </p>

                        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                            Create your account
                        </h1>

                        <p className="mt-3 text-sm leading-6 text-neutral-600">
                            Set up your account to start working with CyberSpend AI.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="mt-7 space-y-4">
                        <div>
                            <label
                                htmlFor="name"
                                className="mb-2 block text-sm font-medium"
                            >
                                Full name
                            </label>

                            <div className="relative">
                                <UserRound
                                    size={18}
                                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
                                />

                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    autoComplete="name"
                                    placeholder="Your full name"
                                    value={name}
                                    onChange={(event) => setName(event.target.value)}
                                    required
                                    disabled={loading}
                                    className={inputClass}
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="organization"
                                className="mb-2 block text-sm font-medium"
                            >
                                Organization
                            </label>

                            <div className="relative">
                                <Building2
                                    size={18}
                                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
                                />

                                <input
                                    id="organization"
                                    name="organization"
                                    type="text"
                                    autoComplete="organization"
                                    placeholder="Company or organization"
                                    value={organization}
                                    onChange={(event) => setOrganization(event.target.value)}
                                    required
                                    disabled={loading}
                                    className={inputClass}
                                />
                            </div>
                        </div>

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
                                    placeholder="enter your Email"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    required
                                    disabled={loading}
                                    className={inputClass}
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="mb-2 block text-sm font-medium"
                            >
                                Password
                            </label>

                            <div className="relative">
                                <LockKeyhole
                                    size={18}
                                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
                                />

                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    placeholder="At least 8 characters"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    minLength={8}
                                    required
                                    disabled={loading}
                                    className={`${inputClass} pr-12`}
                                />

                                <button
                                    type="button"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    onClick={() => setShowPassword((current) => !current)}
                                    className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-neutral-500 transition hover:bg-neutral-100 hover:text-black"
                                >
                                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="confirmPassword"
                                className="mb-2 block text-sm font-medium"
                            >
                                Confirm password
                            </label>

                            <div className="relative">
                                <LockKeyhole
                                    size={18}
                                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
                                />

                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    placeholder="Re-enter your password"
                                    value={confirmPassword}
                                    onChange={(event) => setConfirmPassword(event.target.value)}
                                    required
                                    disabled={loading}
                                    className={`${inputClass} pr-12`}
                                />

                                <button
                                    type="button"
                                    aria-label={
                                        showConfirmPassword ? "Hide password" : "Show password"
                                    }
                                    onClick={() =>
                                        setShowConfirmPassword((current) => !current)
                                    }
                                    className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-neutral-500 transition hover:bg-neutral-100 hover:text-black"
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff size={17} />
                                    ) : (
                                        <Eye size={17} />
                                    )}
                                </button>
                            </div>
                        </div>

                        <label className="flex cursor-pointer items-start gap-3 pt-1 text-sm leading-6 text-neutral-600">
                            <input
                                type="checkbox"
                                checked={acceptedTerms}
                                onChange={(event) => setAcceptedTerms(event.target.checked)}
                                disabled={loading}
                                className="mt-1 h-4 w-4 shrink-0 accent-black"
                            />

                            <span>
                                I agree to the{" "}
                                <Link
                                    href="/terms"
                                    className="font-medium text-neutral-900 underline underline-offset-4 hover:text-neutral-500"
                                >
                                    Terms of Service
                                </Link>{" "}
                                and{" "}
                                <Link
                                    href="/privacy"
                                    className="font-medium text-neutral-900 underline underline-offset-4 hover:text-neutral-500"
                                >
                                    Privacy Policy
                                </Link>
                                .
                            </span>
                        </label>

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
                                    Creating account...
                                </>
                            ) : (
                                <>
                                    Create account
                                    <ArrowRight
                                        size={17}
                                        className="transition-transform duration-200 group-hover:translate-x-1"
                                    />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="my-6 flex items-center gap-4">
                        <div className="h-px flex-1 bg-neutral-200" />
                        <span className="text-xs text-neutral-400">ALREADY REGISTERED?</span>
                        <div className="h-px flex-1 bg-neutral-200" />
                    </div>

                    <Link
                        href="/sign-in"
                        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-5 text-sm font-semibold text-neutral-800 transition-all duration-200 hover:border-neutral-400 hover:bg-neutral-50 active:scale-[0.99]"
                    >
                        Sign in instead
                    </Link>
                </div>

                <p className="mt-6 flex items-center justify-center gap-2 text-center text-xs leading-6 text-neutral-500">
                    <Check size={14} />
                    Built for informed cybersecurity decisions
                </p>
            </section>
        </main>
    );
}
