"use client";

import {
    useMemo,
    useRef,
    useState,
    useSyncExternalStore,
    type ChangeEvent,
    type FormEvent,
} from "react";
import {
    Activity,
    ArrowUp,
    Bot,
    Cloud,
    FileCheck,
    FileJson,
    FileText,
    Globe,
    Menu,
    MessageSquare,
    Paperclip,
    Plus,
    Radar,
    Server,
    ShieldAlert,
    ShieldCheck,
    UploadCloud,
    Users,
    X,
    AlertCircle,
    CheckCircle2,
    Trash2,
    Pencil,
    Database,
    ChevronDown,
    LayoutGrid,
    Building2,
    Banknote,
    Bell,
    FileBarChart,
    LayoutDashboard,
    Gauge,
    Wallet,
    SlidersHorizontal,
    FolderKanban,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const DATA_CATEGORIES = [
    { name: "Vulnerability Data", icon: ShieldAlert },
    { name: "Asset Inventory", icon: Server },
    { name: "SIEM Logs", icon: Activity },
    { name: "EDR Data", icon: ShieldCheck },
    { name: "IAM Data", icon: Users },
    { name: "CSPM Data", icon: Cloud },
    { name: "Threat Intelligence", icon: Radar },
    { name: "Compliance Reports", icon: FileCheck },
    { name: "CSV / JSON", icon: FileJson },
    { name: "API Integrations", icon: Globe },
] as const;

// Pages inside app/(platform). The "(platform)" route group is not part of the
// URL, so each folder name maps directly to /<folder>.
const PLATFORM_LINKS = [
    { name: "Risk Overview", href: "/risk-overview", icon: Gauge },
    { name: "Risk Dashboard", href: "/risk-dashboard", icon: LayoutDashboard },
    { name: "Asset Risk", href: "/asset-risk", icon: Server },
    { name: "Vulnerability Risk", href: "/vulnerability-risk", icon: ShieldAlert },
    { name: "Financial Risk", href: "/financial-risk", icon: Banknote },
    { name: "Security Investment", href: "/security-investment", icon: Wallet },
    { name: "What-if Analysis", href: "/what-if-analysis", icon: SlidersHorizontal },
    { name: "Reports", href: "/reports", icon: FileBarChart },
    { name: "Notifications", href: "/notifications", icon: Bell },
    { name: "Organizations", href: "/organizations", icon: Building2 },
    { name: "Workspaces", href: "/workspaces", icon: FolderKanban },
] as const;

type DataCategory = (typeof DATA_CATEGORIES)[number]["name"];

type SelectedFile = {
    id: string;
    file: File;
    category: DataCategory;
};

type PendingFile = {
    file: File;
    category: DataCategory;
};

type ChatMessage = {
    id: string;
    role: "user" | "assistant";
    content: string;
};

type Conversation = {
    id: string;
    title: string;
    createdAt: number;
    messages: ChatMessage[];
};

const STORAGE_KEY = "cyberspend-conversations-v1";

// Saved conversations live in a tiny external store backed by localStorage.
// useSyncExternalStore reads it on the client without setState-in-effect or
// SSR hydration mismatches, and it stays in sync across browser tabs.
const conversationListeners = new Set<() => void>();
let conversationsRaw: string | null | undefined;

function getConversationsSnapshot(): string | null {
    if (conversationsRaw === undefined) {
        try {
            conversationsRaw = localStorage.getItem(STORAGE_KEY);
        } catch {
            conversationsRaw = null;
        }
    }
    return conversationsRaw;
}

function getServerConversationsSnapshot(): string | null {
    return null;
}

function subscribeConversations(listener: () => void) {
    conversationListeners.add(listener);

    const onStorage = (event: StorageEvent) => {
        if (event.key === STORAGE_KEY) {
            conversationsRaw = event.newValue;
            listener();
        }
    };
    window.addEventListener("storage", onStorage);

    return () => {
        conversationListeners.delete(listener);
        window.removeEventListener("storage", onStorage);
    };
}

function parseConversations(raw: string | null): Conversation[] {
    if (!raw) return [];
    try {
        const parsed: unknown = JSON.parse(raw);
        return Array.isArray(parsed) ? (parsed as Conversation[]) : [];
    } catch {
        return [];
    }
}

function updateConversations(
    updater: (current: Conversation[]) => Conversation[],
) {
    const next = updater(parseConversations(getConversationsSnapshot()));
    const serialized = JSON.stringify(next);

    conversationsRaw = serialized;
    try {
        localStorage.setItem(STORAGE_KEY, serialized);
    } catch {
        // Storage full or blocked: history just won't persist after reload.
    }
    conversationListeners.forEach((listener) => listener());
}

// Dynamic naming: the conversation title comes from the first message.
function makeTitle(text: string) {
    const clean = text.replace(/\s+/g, " ").trim();
    if (!clean) return "New conversation";
    return clean.length > 44 ? `${clean.slice(0, 44).trimEnd()}…` : clean;
}

function groupLabel(timestamp: number) {
    const startOfDay = (d: Date) =>
        new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const dayMs = 24 * 60 * 60 * 1000;
    const diffDays = Math.round(
        (startOfDay(new Date()) - startOfDay(new Date(timestamp))) / dayMs,
    );

    if (diffDays <= 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays <= 7) return "Previous 7 days";
    return "Older";
}

const SUGGESTIONS = [
    {
        title: "Understand cyber risk",
        description: "Plan a cybersecurity risk assessment.",
        prompt:
            "Help me plan a cybersecurity risk assessment for my organization.",
    },
    {
        title: "Prioritize vulnerabilities",
        description: "Explore vulnerability prioritization.",
        prompt:
            "Help me understand how to prioritize vulnerabilities using severity and asset context.",
    },
    {
        title: "Financial risk",
        description: "Understand FAIR-based risk quantification.",
        prompt:
            "Explain how FAIR-based cyber risk quantification estimates potential financial losses.",
    },
    {
        title: "Threat intelligence",
        description: "Plan a threat research task.",
        prompt:
            "Help me plan cybersecurity threat research using reliable public sources.",
    },
];

export default function AgentsPage() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const pendingCategoryRef = useRef<DataCategory>("CSV / JSON");

    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [platformOpen, setPlatformOpen] = useState(false);
    const [dataPanelOpen, setDataPanelOpen] = useState(false);

    const [selectedCategory, setSelectedCategory] =
        useState<DataCategory>("CSV / JSON");

    const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
    const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);

    const [chatInput, setChatInput] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [isSending, setIsSending] = useState(false);

    const [activeId, setActiveId] = useState<string | null>(null);
    const [renamingId, setRenamingId] = useState<string | null>(null);

    const rawConversations = useSyncExternalStore(
        subscribeConversations,
        getConversationsSnapshot,
        getServerConversationsSnapshot,
    );
    const conversations = useMemo(
        () => parseConversations(rawConversations),
        [rawConversations],
    );

    const activeConversation =
        conversations.find((item) => item.id === activeId) ?? null;
    const messages = activeConversation?.messages ?? [];

    const groupedConversations = useMemo(() => {
        const groups: { label: string; items: Conversation[] }[] = [];

        for (const item of conversations) {
            const label = groupLabel(item.createdAt);
            let group = groups.find((g) => g.label === label);

            if (!group) {
                group = { label, items: [] };
                groups.push(group);
            }

            group.items.push(item);
        }

        return groups;
    }, [conversations]);

    function openFileManager(category?: DataCategory) {
        const nextCategory = category ?? selectedCategory;

        if (nextCategory === "API Integrations") {
            setSelectedCategory(nextCategory);
            setDataPanelOpen(true);
            setError("API Integrations ke liye backend connector endpoint aur provider credentials flow chahiye. Current backend routes mein integration endpoint nahi hai.");
            setNotice("");
            return;
        }

        setError("");
        setNotice("");
        pendingCategoryRef.current = nextCategory;
        setSelectedCategory(nextCategory);
        setDataPanelOpen(true);
        // Input is always mounted, and click is synchronous within the user action.
        fileInputRef.current?.click();
    }

    function validateFile(file: File): string | null {
        const isCSV = file.name.toLowerCase().endsWith(".csv");
        const isJSON = file.name.toLowerCase().endsWith(".json");

        if (!isCSV && !isJSON) {
            return `${file.name}: sirf CSV aur JSON files allowed hain.`;
        }

        if (file.size === 0) {
            return `${file.name}: file empty hai.`;
        }

        // Keep the browser-side limit reasonable; enforce the authoritative
        // size limit again on the backend when the upload endpoint exists.
        const maxSizeBytes = 100 * 1024 * 1024;

        if (file.size > maxSizeBytes) {
            return `${file.name}: maximum allowed size 100 MB hai.`;
        }

        // Every current upload category accepts CSV/JSON exports.
        // The category is metadata; the file content must be parsed server-side
        // before claiming that it really contains that type of cybersecurity data.
        return null;
    }

    function handleFileSelection(event: ChangeEvent<HTMLInputElement>) {
        const files = Array.from(event.target.files ?? []);

        // Allow selecting the same file again later.
        event.target.value = "";

        if (files.length === 0) return;

        const validFiles: File[] = [];
        const errors: string[] = [];

        for (const file of files) {
            const validationError = validateFile(file);

            if (validationError) {
                errors.push(validationError);
            } else {
                validFiles.push(file);
            }
        }

        setPendingFiles((current) => {
            const seen = new Set(
                current.map(({ file, category }) => `${file.name}:${file.size}:${file.lastModified}:${category}`),
            );
            const additions = validFiles
                .map((file) => ({ file, category: pendingCategoryRef.current }))
                .filter(({ file, category }) => {
                    const key = `${file.name}:${file.size}:${file.lastModified}:${category}`;
                    if (seen.has(key)) return false;
                    seen.add(key);
                    return true;
                });
            return [...current, ...additions];
        });
        setError(errors.join(" "));
        setNotice("");
    }

    function addFilesToList() {
        if (pendingFiles.length === 0) {
            setError("Pehle valid CSV ya JSON file select karo.");
            return;
        }

        const newItems: SelectedFile[] = pendingFiles.map(({ file, category }) => ({
            id: crypto.randomUUID(),
            file,
            category,
        }));

        setSelectedFiles((current) => {
            const existing = new Set(
                current.map((item) => `${item.file.name}:${item.file.size}:${item.file.lastModified}:${item.category}`),
            );
            const additions = newItems.filter((item) => {
                const key = `${item.file.name}:${item.file.size}:${item.file.lastModified}:${item.category}`;
                if (existing.has(key)) return false;
                existing.add(key);
                return true;
            });
            return [...current, ...additions];
        });
        setPendingFiles([]);
        setError("");
        setNotice(
            `${newItems.length} file(s) add ki gayi hain. Ye abhi browser mein selected hain; server par upload nahi hui hain.`,
        );
    }

    function removeSelectedFile(id: string) {
        setSelectedFiles((current) =>
            current.filter((item) => item.id !== id),
        );
    }

    function startNewChat() {
        setActiveId(null);
        setChatInput("");
        setError("");
        setNotice("");
        setPendingFiles([]);
        setDataPanelOpen(false);
        setRenamingId(null);
        setSidebarOpen(false);
        textareaRef.current?.focus();
    }

    function selectConversation(id: string) {
        setActiveId(id);
        setDataPanelOpen(false);
        setPendingFiles([]);
        setError("");
        setNotice("");
        setRenamingId(null);
        setSidebarOpen(false);
    }

    function deleteConversation(id: string) {
        updateConversations((current) => current.filter((item) => item.id !== id));
        if (activeId === id) setActiveId(null);
        if (renamingId === id) setRenamingId(null);
    }

    function beginRename(item: Conversation) {
        setRenamingId(item.id);
    }

    function commitRename(id: string, value: string) {
        const title = value.replace(/\s+/g, " ").trim();

        if (title) {
            updateConversations((current) =>
                current.map((item) => (item.id === id ? { ...item, title } : item)),
            );
        }

        setRenamingId(null);
    }

    function getAccessToken(): string | null {
        // Auth screens may store the backend's JSON accessToken under different keys.
        // Never read or expose refresh tokens here.
        const candidateKeys = [
            "accessToken",
            "access_token",
            "cyberspend-access-token",
            "cyberspend-auth",
            "auth",
            "auth-storage",
        ];

        for (const key of candidateKeys) {
            try {
                const raw = localStorage.getItem(key);
                if (!raw) continue;

                if (!raw.trim().startsWith("{")) {
                    if (key.toLowerCase().includes("token") && raw.trim()) {
                        return raw.trim();
                    }
                    continue;
                }

                const parsed: unknown = JSON.parse(raw);
                if (!parsed || typeof parsed !== "object") continue;

                const record = parsed as Record<string, unknown>;
                for (const value of [
                    record.accessToken,
                    record.access_token,
                    (record.user as Record<string, unknown> | undefined)?.accessToken,
                    (record.state as Record<string, unknown> | undefined)?.accessToken,
                    (record.state as Record<string, unknown> | undefined)?.access_token,
                ]) {
                    if (typeof value === "string" && value.trim()) return value;
                }
            } catch {
                // Ignore malformed or inaccessible storage entries.
            }
        }

        return null;
    }

    async function handleChatSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const content = chatInput.trim();
        if (!content || isSending) return;

        const conversationId = activeConversation?.id ?? crypto.randomUUID();
        const userMessage: ChatMessage = {
            id: crypto.randomUUID(),
            role: "user",
            content,
        };

        // Persist the user message immediately, then append the assistant response
        // when the API returns successfully.
        updateConversations((current) => {
            const existing = current.find((item) => item.id === conversationId);
            if (existing) {
                return current.map((item) =>
                    item.id === conversationId
                        ? { ...item, messages: [...item.messages, userMessage] }
                        : item,
                );
            }

            return [
                {
                    id: conversationId,
                    title: makeTitle(content),
                    createdAt: Date.now(),
                    messages: [userMessage],
                },
                ...current,
            ];
        });

        setActiveId(conversationId);
        setChatInput("");
        setDataPanelOpen(false);
        setError("");
        setNotice("");
        setIsSending(true);

        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");
            if (!baseUrl) {
                throw new Error(
                    "NEXT_PUBLIC_API_URL set nahi hai. Frontend deployment environment variables mein backend URL add karke redeploy karo.",
                );
            }

            const token = getAccessToken();
            const headers: HeadersInit = {
                "Content-Type": "application/json",
            };
            if (token) headers.Authorization = `Bearer ${token}`;

            const payload = {
                message: content,
                conversationId,
                useWeb: false,
            };

            // Try the common mounted prefix first. If the server responds 404,
            // retry the unprefixed router path; do not retry other errors.
            let response = await fetch(`${baseUrl}/api/assistant/chat`, {
                method: "POST",
                headers,
                body: JSON.stringify(payload),
            });

            if (response.status === 404) {
                response = await fetch(`${baseUrl}/assistant/chat`, {
                    method: "POST",
                    headers,
                    body: JSON.stringify(payload),
                });
            }

            const responseBody: unknown = await response.json().catch(() => null);
            const body =
                responseBody && typeof responseBody === "object"
                    ? (responseBody as Record<string, unknown>)
                    : null;
            const data =
                body?.data && typeof body.data === "object"
                    ? (body.data as Record<string, unknown>)
                    : null;

            if (!response.ok) {
                const serverMessage =
                    typeof body?.message === "string" ? body.message : "";
                if (response.status === 401 || response.status === 403) {
                    throw new Error(
                        serverMessage ||
                        "Authentication required. Sign in again; the frontend needs a valid access token for the assistant API.",
                    );
                }
                if (response.status === 404) {
                    throw new Error(
                        "Assistant endpoint nahi mila. Backend server.ts/app.ts mein assistant router ka mount prefix verify karo.",
                    );
                }
                throw new Error(
                    serverMessage || `Assistant request failed (${response.status}).`,
                );
            }

            const answer = typeof data?.answer === "string" ? data.answer : "";
            if (!answer) {
                throw new Error(
                    "Backend ne success response diya, lekin data.answer nahi mila. Assistant controller response shape verify karo.",
                );
            }

            const assistantMessage: ChatMessage = {
                id: crypto.randomUUID(),
                role: "assistant",
                content: answer,
            };

            updateConversations((current) =>
                current.map((item) =>
                    item.id === conversationId
                        ? { ...item, messages: [...item.messages, assistantMessage] }
                        : item,
                ),
            );
        } catch (caughtError) {
            setError(
                caughtError instanceof Error
                    ? caughtError.message
                    : "Assistant request fail ho gayi. Backend logs check karo.",
            );
        } finally {
            setIsSending(false);
            textareaRef.current?.focus();
        }
    }

    function formatSize(bytes: number) {
        if (bytes < 1024 * 1024) {
            return `${(bytes / 1024).toFixed(1)} KB`;
        }

        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }

    return (
        <div className="flex h-dvh min-h-0 overflow-hidden bg-white text-neutral-900">
            <style>{`
                @keyframes panelShiftIn {
                    from { opacity: 0; transform: translateX(48px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                @keyframes cardsShiftIn {
                    from { opacity: 0; transform: translateX(-48px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                .panel-shift-in { animation: panelShiftIn 260ms cubic-bezier(0.22, 1, 0.36, 1) both; }
                .cards-shift-in { animation: cardsShiftIn 260ms cubic-bezier(0.22, 1, 0.36, 1) both; }
                @media (prefers-reduced-motion: reduce) {
                    .panel-shift-in, .cards-shift-in { animation: none; }
                }
            `}</style>
            {sidebarOpen && (
                <button
                    type="button"
                    aria-label="Close sidebar"
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 z-30 bg-black/30 lg:hidden"
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-40 flex w-[270px] flex-col border-r border-neutral-200 bg-[#fafafa] transition-transform duration-200 lg:static lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                {/* Brand */}
                <div className="flex h-[68px] shrink-0 items-center gap-3 border-b border-neutral-200 px-5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-950 text-white">
                        <ShieldCheck size={19} />
                    </div>

                    <div>
                        <p className="text-sm font-semibold">CyberSpend AI</p>
                        <p className="text-xs text-neutral-500">Risk intelligence</p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setSidebarOpen(false)}
                        aria-label="Close navigation"
                        className="ml-auto rounded-lg p-2 hover:bg-neutral-200 lg:hidden"
                    >
                        <X size={17} />
                    </button>
                </div>

                {/* New conversation */}
                <div className="shrink-0 p-3">
                    <button
                        type="button"
                        onClick={startNewChat}
                        className="flex w-full items-center gap-2.5 rounded-xl bg-neutral-950 px-3.5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-neutral-800 active:scale-[0.98]"
                    >
                        <Plus size={17} />
                        New conversation
                    </button>
                </div>

                {/* Navigation */}
                <nav className="shrink-0 space-y-1 px-3">
                    <Link
                        href="/agents"
                        onClick={() => setSidebarOpen(false)}
                        className="flex items-center gap-3 rounded-xl bg-neutral-200/70 px-3 py-2.5 text-sm font-medium"
                    >
                        <Bot size={17} />
                        AI Agent
                    </Link>

                    {/* Platform dropdown: routes to every page in app/(platform) */}
                    <button
                        type="button"
                        onClick={() => setPlatformOpen((open) => !open)}
                        aria-expanded={platformOpen}
                        aria-controls="platform-menu"
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-neutral-600 transition hover:bg-neutral-200/60"
                    >
                        <LayoutGrid size={17} />
                        <span className="flex-1 font-semibold text-left">features</span>
                        <span className="rounded-full bg-neutral-200 px-2 py-0.5 text-[10px] font-semibold text-neutral-600">
                            {PLATFORM_LINKS.length}
                        </span>
                        <ChevronDown
                            size={16}
                            className={`shrink-0 text-neutral-400 transition-transform duration-200 ${platformOpen ? "rotate-180" : ""
                                }`}
                        />
                    </button>

                    <div
                        id="platform-menu"
                        aria-hidden={!platformOpen}
                        className={`grid transition-[grid-template-rows] duration-200 ease-out ${platformOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                            }`}
                    >
                        <div className="min-h-0 overflow-hidden">
                            <div className="ml-4 max-h-[38dvh] space-y-0.5 overflow-y-auto overscroll-contain border-l border-neutral-200 py-1 pl-2">
                                {PLATFORM_LINKS.map(({ name, href, icon: Icon }) => {
                                    const isActive =
                                        pathname === href || pathname.startsWith(`${href}/`);

                                    return (
                                        <Link
                                            key={href}
                                            href={href}
                                            tabIndex={platformOpen ? 0 : -1}
                                            onClick={() => setSidebarOpen(false)}
                                            aria-current={isActive ? "page" : undefined}
                                            className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] transition ${isActive
                                                ? "bg-neutral-200/80 font-medium text-neutral-950"
                                                : "text-neutral-600 hover:bg-neutral-200/60 hover:text-neutral-950"
                                                }`}
                                        >
                                            <Icon size={15} className="shrink-0" />
                                            <span className="truncate">{name}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Data workspace */}
                <div className="shrink-0 px-3 pt-5">
                    <p className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                        Data
                    </p>

                    <button
                        type="button"
                        onClick={() => {
                            setDataPanelOpen(true);
                            setSidebarOpen(false);
                        }}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-neutral-600 transition hover:bg-neutral-200/60"
                    >
                        <Database size={17} />
                        <span className="flex-1 text-left">Data sources</span>
                        {selectedFiles.length > 0 && (
                            <span className="rounded-full bg-neutral-950 px-2 py-0.5 text-[10px] font-semibold text-white">
                                {selectedFiles.length}
                            </span>
                        )}
                    </button>
                </div>

                {/* Conversations */}
                <div className="flex shrink-0 items-center justify-between px-5 pb-2 pt-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                        Conversations
                    </p>
                    {conversations.length > 0 && (
                        <span className="text-[11px] text-neutral-400">
                            {conversations.length}
                        </span>
                    )}
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-3">
                    {conversations.length === 0 ? (
                        <p className="px-3 py-2 text-xs leading-5 text-neutral-400">
                            No conversations yet. Send a message and it will appear here
                            with an auto-generated name.
                        </p>
                    ) : (
                        groupedConversations.map((group) => (
                            <div key={group.label} className="mb-3">
                                <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                                    {group.label}
                                </p>

                                <div className="space-y-0.5">
                                    {group.items.map((item) => {
                                        const isActive = item.id === activeId;
                                        const isRenaming = item.id === renamingId;

                                        return (
                                            <div
                                                key={item.id}
                                                className={`group flex items-center gap-1 rounded-xl pr-1.5 text-sm transition ${isActive
                                                    ? "bg-neutral-200/80 text-neutral-950"
                                                    : "text-neutral-600 hover:bg-neutral-200/50"
                                                    }`}
                                            >
                                                {isRenaming ? (
                                                    <div className="flex min-w-0 flex-1 items-center gap-2.5 px-3 py-2">
                                                        <MessageSquare size={15} className="shrink-0" />
                                                        <input
                                                            autoFocus
                                                            defaultValue={item.title}
                                                            maxLength={80}
                                                            onFocus={(event) => event.currentTarget.select()}
                                                            onBlur={(event) =>
                                                                commitRename(item.id, event.currentTarget.value)
                                                            }
                                                            onKeyDown={(event) => {
                                                                if (event.key === "Enter") {
                                                                    event.preventDefault();
                                                                    event.currentTarget.blur();
                                                                } else if (event.key === "Escape") {
                                                                    // Restore the old name, then blur: nothing changes.
                                                                    event.currentTarget.value = item.title;
                                                                    event.currentTarget.blur();
                                                                }
                                                            }}
                                                            aria-label="Rename conversation"
                                                            className="min-w-0 flex-1 rounded-md border border-neutral-400 bg-white px-1.5 py-0.5 text-sm outline-none"
                                                        />
                                                    </div>
                                                ) : (
                                                    <>
                                                        <button
                                                            type="button"
                                                            onClick={() => selectConversation(item.id)}
                                                            onDoubleClick={() => beginRename(item)}
                                                            title={item.title}
                                                            className="flex min-w-0 flex-1 items-center gap-2.5 px-3 py-2 text-left"
                                                        >
                                                            <MessageSquare size={15} className="shrink-0" />
                                                            <span
                                                                className={`truncate ${isActive ? "font-medium" : ""}`}
                                                            >
                                                                {item.title}
                                                            </span>
                                                        </button>

                                                        <div
                                                            className={`flex shrink-0 items-center gap-0.5 transition ${isActive
                                                                ? "opacity-100"
                                                                : "opacity-0 focus-within:opacity-100 group-hover:opacity-100"
                                                                }`}
                                                        >
                                                            <button
                                                                type="button"
                                                                onClick={() => beginRename(item)}
                                                                aria-label={`Rename ${item.title}`}
                                                                className="rounded-md p-1.5 text-neutral-500 hover:bg-neutral-300/60 hover:text-neutral-950"
                                                            >
                                                                <Pencil size={13} />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => deleteConversation(item.id)}
                                                                aria-label={`Delete ${item.title}`}
                                                                className="rounded-md p-1.5 text-neutral-500 hover:bg-neutral-300/60 hover:text-red-600"
                                                            >
                                                                <Trash2 size={13} />
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="shrink-0 border-t border-neutral-200 px-5 py-4">
                    <p className="text-xs font-medium text-neutral-600">
                        Cybersecurity data workspace
                    </p>
                    <p className="mt-0.5 text-[11px] text-neutral-400">
                        {conversations.length} chat{conversations.length === 1 ? "" : "s"} ·{" "}
                        {selectedFiles.length} file{selectedFiles.length === 1 ? "" : "s"}
                    </p>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
                <header className="flex h-[68px] shrink-0 items-center justify-between border-b border-neutral-200 px-4 sm:px-6">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(true)}
                            aria-label="Open sidebar"
                            className="rounded-lg p-2 hover:bg-neutral-100 lg:hidden"
                        >
                            <Menu size={19} />
                        </button>

                        <div>
                            <h1 className="text-sm font-semibold">CyberSpend Agent</h1>
                            <p className="mt-0.5 max-w-[44vw] truncate text-xs text-neutral-500 sm:max-w-md">
                                {activeConversation?.title ?? "Cybersecurity risk assistant"}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => openFileManager()}
                        className="flex items-center gap-2 rounded-xl bg-neutral-950 px-3.5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800"
                    >
                        <Plus size={16} />
                        Add Data
                    </button>
                </header>

                {/* Always-mounted input: file picker must be available before click */}
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".csv,.json,text/csv,application/json"
                    onChange={handleFileSelection}
                    className="hidden"
                />


                {/* Chat area */}

                <section className="flex min-h-0 flex-1 flex-col overflow-hidden">
                    {/* Scrollable chat messages */}
                    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                        {dataPanelOpen ? (
                            <div key="data-panel" className="panel-shift-in mx-auto w-full max-w-4xl px-4 py-6 sm:px-7">
                                <div className="mb-5 flex items-start justify-between gap-3">
                                    <div>
                                        <h2 className="text-lg font-semibold">Add cybersecurity data</h2>
                                        <p className="mt-1 text-sm text-neutral-500">
                                            Select a category, choose files, and add them to your
                                            selected list.
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setDataPanelOpen(false);
                                            setPendingFiles([]);
                                            setError("");
                                        }}
                                        aria-label="Close Add Data panel"
                                        className="rounded-lg p-2 hover:bg-neutral-200"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                                    {DATA_CATEGORIES.map(({ name, icon: Icon }) => (
                                        <button
                                            key={name}
                                            type="button"
                                            onClick={() => openFileManager(name)}
                                            className={`flex min-h-[88px] flex-col items-start justify-between rounded-xl border p-3 text-left transition ${selectedCategory === name
                                                ? "border-neutral-950 bg-white shadow-sm"
                                                : "border-neutral-200 bg-white hover:border-neutral-400"
                                                }`}
                                        >
                                            <Icon size={19} />
                                            <span className="text-xs font-medium leading-4">
                                                {name}
                                            </span>
                                        </button>
                                    ))}
                                </div>

                                <div className="mt-4 rounded-2xl border border-dashed border-neutral-300 bg-white p-5 sm:p-6">
                                    <div className="flex flex-col items-center text-center">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100">
                                            <UploadCloud size={24} />
                                        </div>

                                        <h3 className="mt-3 text-sm font-semibold">
                                            Choose files from your computer
                                        </h3>

                                        <p className="mt-1 text-xs text-neutral-500">
                                            Category: {selectedCategory}
                                        </p>

                                        <button
                                            type="button"
                                            onClick={() => openFileManager(selectedCategory)}
                                            className="mt-4 rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-medium transition hover:bg-neutral-50"
                                        >
                                            Browse files
                                        </button>

                                        <p className="mt-3 text-[11px] text-neutral-400">
                                            CSV / JSON only · Maximum 100 MB per file
                                        </p>
                                    </div>
                                </div>

                                {error && (
                                    <div
                                        role="alert"
                                        className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                                    >
                                        <AlertCircle size={17} className="mt-0.5 shrink-0" />
                                        <p>{error}</p>
                                    </div>
                                )}

                                {notice && (
                                    <div
                                        role="status"
                                        className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"
                                    >
                                        <CheckCircle2 size={17} className="mt-0.5 shrink-0" />
                                        <p>{notice}</p>
                                    </div>
                                )}

                                {pendingFiles.length > 0 && (
                                    <div className="mt-5 rounded-2xl border border-neutral-200 bg-white p-4">
                                        <div className="mb-3 flex items-center justify-between">
                                            <h3 className="text-sm font-semibold">
                                                Files ready to add ({pendingFiles.length})
                                            </h3>
                                            <button
                                                type="button"
                                                onClick={() => setPendingFiles([])}
                                                className="text-xs text-neutral-500 hover:text-neutral-950"
                                            >
                                                Clear
                                            </button>
                                        </div>

                                        <div className="space-y-2">
                                            {pendingFiles.map(({ file, category }, index) => (
                                                <div
                                                    key={`${file.name}-${file.lastModified}-${category}-${index}`}
                                                    className="flex items-center gap-3 rounded-xl bg-neutral-50 p-3"
                                                >
                                                    <FileText size={19} className="shrink-0" />

                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-sm font-medium">{file.name}</p>
                                                        <p className="text-xs text-neutral-500">
                                                            {category} · {formatSize(file.size)}
                                                        </p>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        aria-label={`Remove ${file.name}`}
                                                        onClick={() =>
                                                            setPendingFiles((current) =>
                                                                current.filter((_, i) => i !== index),
                                                            )
                                                        }
                                                        className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-200"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={addFilesToList}
                                            className="mt-4 w-full rounded-xl bg-neutral-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
                                        >
                                            Add selected files
                                        </button>
                                    </div>
                                )}

                                {selectedFiles.length > 0 && (
                                    <div className="mt-6">
                                        <div className="mb-3 flex items-center justify-between gap-3">
                                            <h3 className="text-sm font-semibold">
                                                Selected data ({selectedFiles.length})
                                            </h3>

                                            <button
                                                type="button"
                                                onClick={() => setSelectedFiles([])}
                                                className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-red-600"
                                            >
                                                <Trash2 size={14} />
                                                Remove all
                                            </button>
                                        </div>

                                        <div className="space-y-2">
                                            {selectedFiles.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-3"
                                                >
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100">
                                                        <FileText size={19} />
                                                    </div>

                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-sm font-medium">
                                                            {item.file.name}
                                                        </p>
                                                        <p className="mt-1 text-xs text-neutral-500">
                                                            {item.category} · {formatSize(item.file.size)}
                                                        </p>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => removeSelectedFile(item.id)}
                                                        aria-label={`Remove ${item.file.name}`}
                                                        className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 hover:text-red-600"
                                                    >
                                                        <X size={17} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : messages.length === 0 ? (
                            <div key="suggestions" className="cards-shift-in mx-auto flex min-h-full w-full max-w-3xl flex-col justify-center px-5 py-10 sm:px-8">
                             

                                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                                    Cyber risk intelligence
                                </p>

                                <h2 className="max-w-xl text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-4xl">
                                    Understand your cyber risk.
                                    <span className="block text-neutral-400">
                                        Start with a question.
                                    </span>
                                </h2>

                                <p className="mt-4 max-w-xl text-sm leading-6 text-neutral-500 sm:text-base">
                                    Explore vulnerabilities, prepare assessments, and understand
                                    how technical findings relate to potential financial risk.
                                </p>

                                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                                    {SUGGESTIONS.map((item) => (
                                        <button
                                            key={item.title}
                                            type="button"
                                            onClick={() => setChatInput(item.prompt)}
                                            className="rounded-2xl border border-neutral-200 bg-white p-4 text-left transition hover:border-neutral-400 hover:shadow-sm"
                                        >
                                            <p className="text-sm font-semibold">{item.title}</p>
                                            <p className="mt-1.5 text-xs leading-5 text-neutral-500">
                                                {item.description}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="mx-auto w-full max-w-3xl space-y-7 px-5 py-8 sm:px-8">
                                {messages.map((message) => (
                                    <div key={message.id} className="flex gap-3.5">
                                        <div
                                            className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${message.role === "assistant"
                                                ? "bg-neutral-950 text-white"
                                                : "bg-neutral-200"
                                                }`}
                                        >
                                            {message.role === "assistant" ? (
                                                <Bot size={16} />
                                            ) : (
                                                <span className="text-[10px] font-semibold">YOU</span>
                                            )}
                                        </div>

                                        <div className="min-w-0 flex-1 pt-1">
                                            <p className="mb-2 text-sm font-semibold">
                                                {message.role === "assistant"
                                                    ? "CyberSpend Agent"
                                                    : "You"}
                                            </p>

                                            <p className="whitespace-pre-wrap break-words text-sm leading-7 text-neutral-700">
                                                {message.content}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Fixed composer area: remains below chat and above the viewport edge */}
                    <div className="relative z-10 w-full shrink-0 border-t border-neutral-200 bg-white px-4 pb-3 pt-3 sm:px-8 sm:pb-5">
                        <div className="mx-auto max-w-3xl">
                            {error && !dataPanelOpen && (
                                <div
                                    role="alert"
                                    className="mb-2 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                                >
                                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                                    <p>{error}</p>
                                </div>
                            )}
                            {/* Added files above the text input */}
                            {selectedFiles.length > 0 && (
                                <div className="mb-2 max-h-[88px] overflow-y-auto overscroll-contain">
                                    <div className="flex flex-wrap gap-2">
                                        {selectedFiles.map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex max-w-[240px] min-w-0 items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-2.5 py-2"
                                            >
                                                <FileText
                                                    size={16}
                                                    className="shrink-0 text-neutral-500"
                                                />

                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-xs font-medium">
                                                        {item.file.name}
                                                    </p>
                                                    <p className="truncate text-[10px] text-neutral-500">
                                                        {item.category} · {formatSize(item.file.size)}
                                                    </p>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => removeSelectedFile(item.id)}
                                                    aria-label={`Remove ${item.file.name}`}
                                                    className="shrink-0 rounded-md p-1 text-neutral-400 hover:bg-neutral-200 hover:text-red-600"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Message input */}
                            <form
                                onSubmit={handleChatSubmit}
                                className="rounded-2xl border border-neutral-300 bg-white p-2 shadow-sm transition focus-within:border-neutral-500"
                            >
                                <textarea
                                    ref={textareaRef}
                                    value={chatInput}
                                    onChange={(event) => setChatInput(event.target.value)}
                                    onKeyDown={(event) => {
                                        if (
                                            event.key === "Enter" &&
                                            !event.shiftKey &&
                                            !event.nativeEvent.isComposing
                                        ) {
                                            event.preventDefault();
                                            event.currentTarget.form?.requestSubmit();
                                        }
                                    }}
                                    placeholder="Ask about cyber risk, vulnerabilities, or financial impact..."
                                    rows={2}
                                    className="max-h-32 min-h-[54px] w-full resize-y bg-transparent px-3 py-2.5 text-sm leading-6 outline-none placeholder:text-neutral-400"
                                />

                                <div className="flex items-center justify-between px-1 pb-1">
                                    <button
                                        type="button"
                                        onClick={() => openFileManager()}
                                        aria-label="Attach data"
                                        className="rounded-lg p-2 text-neutral-500 transition hover:bg-neutral-100"
                                    >
                                        <Paperclip size={17} />
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={!chatInput.trim()}
                                        aria-label="Send message"
                                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-950 text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400"
                                    >
                                        {isSending ? (
                                            <span
                                                aria-label="Waiting for assistant response"
                                                className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                                            />
                                        ) : (
                                            <ArrowUp size={18} />
                                        )}
                                    </button>
                                </div>
                            </form>

                            {isSending && (
                                <p role="status" className="mt-2 text-center text-xs text-neutral-500">
                                    CyberSpend Agent is preparing a response…
                                </p>
                            )}
                            <p className="mt-2 text-center text-[10px] leading-4 text-neutral-400">
                                Selected files remain in this browser and are not sent with chat messages yet.
                            </p>
                        </div>
                    </div>
                </section>

            </main>
        </div>
    );
}