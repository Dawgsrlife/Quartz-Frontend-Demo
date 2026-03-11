"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { QuartzLogo } from "@/components/layout/QuartzLogo";
import {
    Lock, Mail, ArrowRight, ShieldCheck, Activity,
    User, Eye, EyeOff, CheckCircle2, Cpu, TrendingUp, Zap,
} from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useAuthStore } from "@/lib/authStore";

/* ─── Password strength ─────────────────────────────────────────────── */
function pwStrength(pw: string): 0 | 1 | 2 | 3 | 4 {
    if (!pw) return 0;
    let score = 0;
    if (pw.length >= 8)                              score++;
    if (pw.length >= 12)                             score++;
    if (/[A-Z]/.test(pw) && /[0-9]/.test(pw))       score++;
    if (/[^A-Za-z0-9]/.test(pw))                    score++;
    return score as 0 | 1 | 2 | 3 | 4;
}

const STRENGTH_LABEL = ["", "Weak", "Fair", "Good", "Strong"] as const;
const STRENGTH_COLOR = [
    "", "bg-rose-500", "bg-amber-400", "bg-yellow-300", "bg-emerald-500",
] as const;

/* ─── Brand stats displayed on left panel ───────────────────────────── */
const BRAND_STATS: { label: string; value: string; Icon: React.ElementType }[] = [
    { label: "Uptime",            value: "99.97%", Icon: Activity   },
    { label: "Active Strategies", value: "6",      Icon: Zap        },
    { label: "Avg Latency",       value: "< 2 ms", Icon: Cpu        },
    { label: "Market Data",       value: "Live",   Icon: TrendingUp },
];

/* ─── Reusable field wrapper ─────────────────────────────────────────── */
interface FieldProps {
    label: string;
    hint?: React.ReactNode;
    children: React.ReactNode;
}
function Field({ label, hint, children }: FieldProps) {
    return (
        <div className="auth-field">
            <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">
                    {label}
                </label>
                {hint}
            </div>
            {children}
        </div>
    );
}

/* ─── Page ───────────────────────────────────────────────────────────── */
export default function LoginPage() {
    const router                                  = useRouter();
    const { login, signup, isLoading, token }     = useAuthStore();

    const [mode,        setMode       ] = useState<"login" | "signup">("login");
    const [email,       setEmail      ] = useState("");
    const [password,    setPassword   ] = useState("");
    const [confirmPw,   setConfirmPw  ] = useState("");
    const [name,        setName       ] = useState("");
    const [showPw,      setShowPw     ] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [rememberMe,  setRememberMe ] = useState(false);
    const [error,       setError      ] = useState<string | null>(null);
    const [isSwitching, setIsSwitching] = useState(false);

    const containerRef      = useRef<HTMLDivElement>(null);
    const leftRef           = useRef<HTMLDivElement>(null);
    const rightRef          = useRef<HTMLDivElement>(null);
    const isFirstModeRender = useRef(true);

    // ── Already logged in → skip to dashboard ───────────────────
    useEffect(() => { if (token) router.replace("/dashboard"); }, [token, router]);

    // ── Refs for GSAP targets (avoid document-wide class queries) ──
    const formRef    = useRef<HTMLFormElement>(null);
    const headingRef = useRef<HTMLDivElement>(null);
    const footerRef  = useRef<HTMLDivElement>(null);
    const submitRef  = useRef<HTMLButtonElement>(null);
    const toggleRef  = useRef<HTMLDivElement>(null);

    // ── Card entry animation ─────────────────────────────────────
    useGSAP(() => {
        // Pre-set all animated elements invisible so there's no flash before GSAP
        gsap.set(leftRef.current, { opacity: 0, x: -30 });
        gsap.set(rightRef.current, { opacity: 0, x: 30 });
        gsap.set(".brand-stat", { opacity: 0, y: 10 });
        gsap.set([headingRef.current, toggleRef.current, formRef.current,
                  submitRef.current, footerRef.current], { opacity: 0, y: 12 });

        const tl = gsap.timeline({ defaults: { ease: "expo.out" } });

        // Panels slide in from sides — no filter (avoids stacking-context trap)
        tl.to(leftRef.current,  { x: 0, opacity: 1, duration: 0.9, clearProps: "all" })
          .to(rightRef.current, { x: 0, opacity: 1, duration: 0.9, clearProps: "all" }, "<")

          // Brand stats trickle in
          .to(".brand-stat", {
              y: 0, opacity: 1, stagger: 0.08, duration: 0.6,
              ease: "power3.out", clearProps: "all",
          }, "-=0.65")

          // Heading + toggle appear immediately
          .to([headingRef.current, toggleRef.current], {
              y: 0, opacity: 1, stagger: 0.05, duration: 0.5,
              ease: "power3.out", clearProps: "all",
          }, "-=0.55")

          // Form fields stagger in
          .to(formRef.current, {
              y: 0, opacity: 1, duration: 0.45,
              ease: "power3.out", clearProps: "all",
          }, "-=0.35")

          // Submit button appears with proper emphasis — NOT buried in stagger chain
          .to(submitRef.current, {
              y: 0, opacity: 1, duration: 0.4,
              ease: "power3.out", clearProps: "all",
          }, "-=0.3")

          // Footer last
          .to(footerRef.current, {
              y: 0, opacity: 1, duration: 0.4,
              ease: "power3.out", clearProps: "all",
          }, "-=0.2");

    }, { scope: containerRef });

    // ── Re-animate form content after mode switch ────────────────
    useEffect(() => {
        if (isFirstModeRender.current) { isFirstModeRender.current = false; return; }
        // Bring all form elements back in after mode change
        gsap.fromTo(
            [headingRef.current, toggleRef.current, formRef.current,
             submitRef.current, footerRef.current],
            { y: 10, opacity: 0 },
            { y: 0, opacity: 1, stagger: 0.04, duration: 0.38,
              ease: "power3.out", clearProps: "all" }
        );
    }, [mode]);

    // ── Animated mode switch ─────────────────────────────────────
    const switchMode = (next: "login" | "signup") => {
        if (next === mode || isSwitching) return;
        setIsSwitching(true);
        setError(null);
        // Animate ALL form content (including submit + toggle) out together
        gsap.to(
            [headingRef.current, toggleRef.current, formRef.current,
             submitRef.current, footerRef.current],
            {
                y: -8, opacity: 0, stagger: 0.025, duration: 0.2, ease: "power2.in",
                onComplete: () => {
                    setMode(next);
                    setPassword(""); setConfirmPw(""); setName("");
                    setShowPw(false); setShowConfirm(false);
                    setIsSwitching(false);
                },
            }
        );
    };

    // ── Form submit ──────────────────────────────────────────────
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (mode === "signup") {
            if (password.length < 8)    { setError("Password must be at least 8 characters."); return; }
            if (password !== confirmPw) { setError("Passwords do not match."); return; }
        }
        try {
            if (mode === "signup") await signup(email, password, name || undefined);
            else                   await login(email, password);
            router.push("/dashboard");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Authentication failed. Check credentials.");
        }
    };

    // ── Derived state ────────────────────────────────────────────
    const strength    = pwStrength(password);
    const emailValid  = email.length > 4 && email.includes("@");
    const pwMatch     = confirmPw.length > 0 && confirmPw === password;

    const inputCls = (extra = "") =>
        `w-full bg-[var(--bg-primary)]/60 border border-[var(--border-subtle)] ` +
        `rounded-xl py-3.5 pl-11 pr-4 text-sm text-[var(--text-primary)] ` +
        `placeholder:text-[var(--text-muted)]/30 focus:outline-none ` +
        `focus:border-[var(--accent)]/60 focus:bg-[var(--bg-primary)] ` +
        `transition-all duration-200 ${extra}`;

    /* ── Render ─────────────────────────────────────────────────── */
    return (
        <div
            ref={containerRef}
            className="h-screen flex items-center justify-center bg-[var(--bg-primary)] relative overflow-hidden font-sans"
        >
            {/* Dot-grid */}
            <div
                className="absolute inset-0 z-0 pointer-events-none"
                style={{
                    backgroundImage: "radial-gradient(circle, var(--text-primary) 1px, transparent 1px)",
                    backgroundSize:  "28px 28px",
                    opacity: 0.022,
                }}
            />

            {/* Atmosphere glow — top-left */}
            <div
                className="absolute top-[-25%] left-[-8%] w-[55%] h-[55%] rounded-full blur-[200px] pointer-events-none opacity-[0.18]"
                style={{ background: "var(--accent)" }}
            />
            {/* Atmosphere glow — bottom-right */}
            <div
                className="absolute bottom-[-25%] right-[-8%] w-[45%] h-[45%] rounded-full blur-[200px] pointer-events-none opacity-[0.10]"
                style={{ background: "var(--accent)" }}
            />

            {/* ════ Card ══════════════════════════════════════════════ */}
            <div className="relative z-10 w-full max-w-[940px] mx-6 flex rounded-3xl overflow-hidden border border-[var(--border-subtle)] shadow-[0_48px_100px_-24px_rgba(0,0,0,0.55)]">

                {/* ══ LEFT — Brand Panel ══════════════════════════════ */}
                <div
                    ref={leftRef}
                    className="hidden lg:flex flex-col justify-between w-[360px] shrink-0 relative overflow-hidden p-10"
                    style={{
                        background: [
                            "linear-gradient(",
                            "165deg,",
                            "color-mix(in srgb, var(--accent) 9%, var(--bg-secondary)) 0%,",
                            "var(--bg-secondary) 60%",
                            ")",
                        ].join(" "),
                        borderRight: "1px solid var(--border-subtle)",
                    }}
                >
                    {/* Top accent rule */}
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-50" />

                    {/* Brand identity */}
                    <div>
                        <QuartzLogo size={36} />
                        <h1 className="mt-5 font-black tracking-tight text-[var(--text-primary)] leading-[1.1] font-display"
                            style={{ fontSize: "clamp(22px, 2.2vw, 28px)" }}>
                            Quartz<br />Terminal
                        </h1>
                        <p className="mt-2.5 text-[10px] font-black uppercase tracking-[0.35em] text-[var(--text-muted)]">
                            Institutional Access
                        </p>
                    </div>

                    {/* System stats */}
                    <div className="space-y-3">
                        <p className="brand-stat text-[9px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] opacity-50 mb-1">
                            System Status
                        </p>
                        {BRAND_STATS.map(({ label, value, Icon }) => (
                            <div key={label} className="brand-stat flex items-center justify-between">
                                <div className="flex items-center gap-2.5 text-[var(--text-muted)] text-[12px]">
                                    <Icon size={13} className="text-[var(--accent)] shrink-0" />
                                    {label}
                                </div>
                                <span className="text-[11px] font-mono font-black text-[var(--text-primary)]">
                                    {value}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="space-y-2.5">
                        <div className="brand-stat flex items-center gap-2 text-[11px] text-emerald-500/80">
                            <ShieldCheck size={13} />
                            <span className="font-bold">AES-256 Encrypted Session</span>
                        </div>
                        <p className="brand-stat text-[9px] font-mono text-[var(--text-muted)] opacity-30">
                            © 2026 Quartz Digital Asset Management
                        </p>
                    </div>
                </div>

                {/* ══ RIGHT — Form Panel ══════════════════════════════ */}
                <div
                    ref={rightRef}
                    className="flex-1 flex flex-col justify-center p-10 md:p-14 overflow-y-auto max-h-screen"
                    style={{ background: "var(--bg-secondary)" }}
                >
                    {/* Mobile logo */}
                    <div className="lg:hidden mb-8"><QuartzLogo /></div>

                    {/* Heading */}
                    <div ref={headingRef} className="mb-8">
                        <h2 className="text-[26px] font-black tracking-tight text-[var(--text-primary)] leading-tight">
                            {mode === "login" ? "Welcome back." : "Create account."}
                        </h2>
                        <p className="mt-1.5 text-[12px] text-[var(--text-muted)]">
                            {mode === "login"
                                ? "Sign in to access your trading environment."
                                : "Set up your Quartz operator profile."}
                        </p>
                    </div>

                    {/* Mode tabs */}
                    <div ref={toggleRef} className="flex mb-7 bg-[var(--bg-primary)]/60 rounded-xl p-1.5 border border-[var(--border-subtle)]">
                        {(["login", "signup"] as const).map((m) => (
                            <button
                                key={m}
                                type="button"
                                onClick={() => switchMode(m)}
                                className={`flex-1 py-2.5 text-[9px] font-black uppercase tracking-[0.25em] rounded-lg transition-all duration-300 ${
                                    mode === m
                                        ? "bg-[var(--accent)] text-white shadow-md"
                                        : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                                }`}
                            >
                                {m === "login" ? "Sign In" : "Sign Up"}
                            </button>
                        ))}
                    </div>

                    {/* Error banner */}
                    {error && (
                        <div className="auth-field mb-5 px-4 py-3 rounded-xl border border-rose-500/20 flex items-start gap-2.5"
                             style={{ background: "color-mix(in srgb, #f43f5e 6%, transparent)" }}>
                            <span className="text-rose-400 shrink-0 mt-0.5 text-sm">⚠</span>
                            <p className="text-[11px] text-rose-400 font-mono leading-snug">{error}</p>
                        </div>
                    )}

                    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">

                        {/* Display name — signup only */}
                        {mode === "signup" && (
                            <Field label="Display Name">
                                <div className="relative">
                                    <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]/45 pointer-events-none" />
                                    <input
                                        type="text"
                                        placeholder="Full name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className={inputCls()}
                                        autoComplete="name"
                                    />
                                </div>
                            </Field>
                        )}

                        {/* Email */}
                        <Field label="Email">
                            <div className="relative">
                                <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]/45 pointer-events-none" />
                                <input
                                    type="email"
                                    placeholder="operator@quartz.io"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={inputCls("pr-10")}
                                    required
                                    autoComplete="email"
                                />
                                {emailValid && (
                                    <CheckCircle2 size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-500 pointer-events-none" />
                                )}
                            </div>
                        </Field>

                        {/* Password */}
                        <Field
                            label="Password"
                            hint={
                                mode === "login"
                                    ? <button type="button" className="text-[10px] font-black uppercase tracking-wider text-[var(--accent)] hover:opacity-70 transition-opacity">Forgot?</button>
                                    : undefined
                            }
                        >
                            <div className="relative">
                                <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]/45 pointer-events-none" />
                                <input
                                    type={showPw ? "text" : "password"}
                                    placeholder="••••••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={inputCls("pr-11")}
                                    required
                                    minLength={8}
                                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPw((v) => !v)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]/40 hover:text-[var(--text-muted)] transition-colors"
                                    tabIndex={-1}
                                >
                                    {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                            </div>

                            {/* Strength bar — signup only */}
                            {mode === "signup" && password.length > 0 && (
                                <div className="mt-2 flex items-center gap-2">
                                    <div className="flex gap-1 flex-1">
                                        {([1, 2, 3, 4] as const).map((i) => (
                                            <div
                                                key={i}
                                                className={`h-[3px] flex-1 rounded-full transition-all duration-300 ${
                                                    strength >= i ? STRENGTH_COLOR[strength] : "bg-[var(--border-subtle)]"
                                                }`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] w-12 text-right">
                                        {STRENGTH_LABEL[strength]}
                                    </span>
                                </div>
                            )}
                        </Field>

                        {/* Confirm password — signup only */}
                        {mode === "signup" && (
                            <Field label="Confirm Password">
                                <div className="relative">
                                    <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]/45 pointer-events-none" />
                                    <input
                                        type={showConfirm ? "text" : "password"}
                                        placeholder="••••••••••••"
                                        value={confirmPw}
                                        onChange={(e) => setConfirmPw(e.target.value)}
                                        className={inputCls(
                                            confirmPw.length > 0
                                                ? pwMatch
                                                    ? "pr-11 !border-emerald-500/40 focus:!border-emerald-500/70"
                                                    : "pr-11 !border-rose-500/40 focus:!border-rose-500/70"
                                                : "pr-11"
                                        )}
                                        required
                                        autoComplete="new-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm((v) => !v)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]/40 hover:text-[var(--text-muted)] transition-colors"
                                        tabIndex={-1}
                                    >
                                        {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                                    </button>
                                    {pwMatch && (
                                        <CheckCircle2 size={14} className="absolute right-9 top-1/2 -translate-y-1/2 text-emerald-500 pointer-events-none" />
                                    )}
                                </div>
                            </Field>
                        )}

                        {/* Remember me — login only */}
                        {mode === "login" && (
                            <div className="auth-field flex items-center gap-3 pt-1">
                                <button
                                    type="button"
                                    onClick={() => setRememberMe((v) => !v)}
                                    className={`w-[18px] h-[18px] rounded-[5px] border flex items-center justify-center shrink-0 transition-all duration-200 ${
                                        rememberMe
                                            ? "bg-[var(--accent)] border-[var(--accent)]"
                                            : "bg-transparent border-[var(--border-subtle)] hover:border-[var(--accent)]/50"
                                    }`}
                                    aria-label="Remember this device"
                                >
                                    {rememberMe && (
                                        <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                                            <path d="M1 3.5L3.2 5.7L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    )}
                                </button>
                                <span className="text-[11px] text-[var(--text-muted)] select-none cursor-pointer"
                                      onClick={() => setRememberMe((v) => !v)}>
                                    Remember this device
                                </span>
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            ref={submitRef}
                            type="submit"
                            disabled={isLoading}
                            className="w-full mt-2 py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.3em] text-white transition-all duration-200 hover:opacity-90 active:scale-[0.985] flex items-center justify-center gap-3 group relative overflow-hidden disabled:opacity-60"
                            style={{ background: "var(--accent)" }}
                        >
                            {/* Button shimmer sweep */}
                            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span className="relative z-10">
                                        {mode === "login" ? "Establish Connection" : "Create Account"}
                                    </span>
                                    <ArrowRight size={14} className="relative z-10 group-hover:translate-x-1 transition-transform duration-200" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer divider + mode switch */}
                    <div ref={footerRef} className="mt-8">
                        <div className="flex items-center gap-3 text-[var(--text-muted)] mb-5">
                            <div className="flex-1 h-px bg-[var(--border-subtle)]" />
                            <Activity size={10} className="text-[var(--accent)] shrink-0" />
                            <div className="flex-1 h-px bg-[var(--border-subtle)]" />
                        </div>
                        <p className="text-center text-[10px] text-[var(--text-muted)] uppercase tracking-[0.25em] font-bold">
                            {mode === "login" ? "No account?" : "Already registered?"}{" "}
                            <button
                                type="button"
                                onClick={() => switchMode(mode === "login" ? "signup" : "login")}
                                className="text-[var(--accent)] hover:opacity-70 font-black transition-opacity"
                            >
                                {mode === "login" ? "Sign up" : "Sign in"}
                            </button>
                        </p>
                    </div>
                </div>

            </div>{/* end card */}
        </div>
    );
}
