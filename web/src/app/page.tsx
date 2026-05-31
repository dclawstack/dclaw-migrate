"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

/* ─── Data ──────────────────────────────────────────────────────────────── */

const features = [
  { n: "01", title: "AI Migration Copilot",       desc: "Context-aware chat that knows your job, schema, and connections. Surfaces risks before you hit them and suggests the next action at every step.", tag: "OpenRouter · Kimi K2",      trigger: "Floating on every page" },
  { n: "02", title: "Schema Auto-Discovery",       desc: "Connect a source DB — enumerate tables, columns, and types, then auto-propose target mappings with data-type conversion rules. Zero manual column mapping.", tag: "AI-assisted",               trigger: "Connection created" },
  { n: "03", title: "Wave Planning",               desc: "Group migration jobs into dependency-ordered waves. AI scores risk and suggests groupings that minimise downtime across your fleet.", tag: "AI wave-optimisation",      trigger: "Jobs created" },
  { n: "04", title: "Data Validation",             desc: "Row-count and checksum reconciliation after every load. Catch drift before it reaches production with automated integrity checks.", tag: "Deterministic",             trigger: "Post-migration" },
  { n: "05", title: "AI Test Generation",          desc: "Generate 100+ validation test cases per job automatically. Execute in parallel against source and target. Get pass/fail scoreboard per run.", tag: "AI-generated",             trigger: "Job ready" },
  { n: "06", title: "Cutover Management",          desc: "Blue-green, rolling, or in-place cutover with a built-in state machine. Execute, validate, and roll back in one click.", tag: "State machine",             trigger: "Cutover planned" },
  { n: "07", title: "Post-Migration Optimisation", desc: "AI analyses your migrated workload and generates prioritised recommendations: cost reduction, right-sizing, and reliability improvements.", tag: "AI recommendations",        trigger: "Migration complete" },
  { n: "08", title: "Application Assets",          desc: "Track every service, database, and API across your fleet. Six migration strategies per asset with AI-generated effort estimates.", tag: "Asset inventory",           trigger: "Continuous" },
  { n: "09", title: "Runbook Generation",          desc: "AI writes pre-migration, cutover, rollback, post-migration, and validation runbooks tailored to your specific job context and database types.", tag: "AI-authored",              trigger: "On demand" },
  { n: "10", title: "Multi-Cloud Strategy",        desc: "Compare AWS, GCP, and Azure for any workload. AI returns cost estimates and vendor lock-in risk analysis before you commit.", tag: "AI · 3 clouds",            trigger: "Asset selected" },
  { n: "11", title: "Containerisation Plans",      desc: "Generate production Dockerfiles and Kubernetes manifests for legacy VMs — health checks, resource limits, and deployment YAMLs included.", tag: "AI-generated",             trigger: "VM asset selected" },
  { n: "12", title: "Execution Logs",              desc: "Every action — discovery, validation, cutover — is timestamped and severity-tagged. Full, searchable audit trail from day one.", tag: "Audit trail",              trigger: "Always on" },
];

const stack = [
  "Next.js 14", "FastAPI", "PostgreSQL 16", "SQLAlchemy 2.0",
  "OpenRouter", "Ollama (local fallback)", "Pydantic v2", "Alembic",
  "Tailwind CSS", "shadcn/ui", "Docker", "Helm / Kubernetes",
  "pytest-asyncio", "CloudNativePG", "Logto JWT",
];

const footerLinks = {
  "Core": [
    { label: "Dashboard",   href: "/dashboard" },
    { label: "Connections", href: "/connections" },
    { label: "Jobs",        href: "/jobs" },
    { label: "Wave Planning", href: "/waves" },
    { label: "Assets",      href: "/assets" },
  ],
  "P1 Features": [
    { label: "Cutover",      href: "/cutover" },
    { label: "Testing",      href: "/testing" },
    { label: "Optimisation", href: "/optimization" },
    { label: "Runbooks",     href: "/runbooks" },
  ],
  "GitHub": [
    { label: "Repository",   href: "https://github.com/dclawstack/dclaw-migrate" },
    { label: "Backend",      href: "https://github.com/dclawstack/dclaw-migrate/tree/main/backend" },
    { label: "Frontend",     href: "https://github.com/dclawstack/dclaw-migrate/tree/main/web" },
    { label: "Helm Chart",   href: "https://github.com/dclawstack/dclaw-migrate/tree/main/helm" },
    { label: "Issues",       href: "https://github.com/dclawstack/dclaw-migrate/issues" },
  ],
  "Docs": [
    { label: "README",        href: "https://github.com/dclawstack/dclaw-migrate/blob/main/README.md" },
    { label: "Run locally",   href: "https://github.com/dclawstack/dclaw-migrate/blob/main/RUN.md" },
    { label: "PLAN v1.2",     href: "https://github.com/dclawstack/dclaw-migrate/blob/main/PLAN-v1.2.md" },
    { label: "REVISED-PRD",   href: "https://github.com/dclawstack/dclaw-migrate/blob/main/REVISED-PRD.md" },
    { label: "Changelog",     href: "https://github.com/dclawstack/dclaw-migrate/blob/main/PATCHES.md" },
  ],
};

/* ─── Hooks ─────────────────────────────────────────────────────────────── */

function useInView(ref: React.RefObject<Element | null>) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true); },
      { threshold: 0.08 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ref]);
  return inView;
}

/* ─── Sub-components ─────────────────────────────────────────────────────── */

function FadeUp({ children, delay = 0, className = "" }: {
  children: React.ReactNode; delay?: number; className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref);
  return (
    <div ref={ref} className={className} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(36px)",
      transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
    }}>
      {children}
    </div>
  );
}

function FeatureCard({ f, idx }: { f: typeof features[0]; idx: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref);
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(48px)",
        transition: `opacity 0.6s ease ${(idx % 3) * 110}ms, transform 0.6s ease ${(idx % 3) * 110}ms`,
      }}
      className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:shadow-lg"
    >
      <div className="absolute right-0 top-0 h-28 w-28 rounded-bl-full bg-accent opacity-50 transition-opacity group-hover:opacity-100" />
      <div className="relative">
        <div className="mb-4 flex items-start justify-between">
          <span className="rounded-full bg-accent px-2 py-1 font-mono text-xs font-bold text-primary">{f.n}</span>
          <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[10px] text-muted-foreground">{f.trigger}</span>
        </div>
        <h3 className="mb-2 text-base font-bold text-foreground">{f.title}</h3>
        <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
        <span className="rounded-full bg-primary px-2.5 py-1 font-mono text-[10px] text-primary-foreground">{f.tag}</span>
      </div>
    </div>
  );
}

/* ─── GitHub SVG ─────────────────────────────────────────────────────────── */
function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
    </svg>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default function LandingPage() {
  return (
    <>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-10px); }
        }
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .float-card { animation: float 5s ease-in-out infinite; }
        .marquee-track { animation: marquee 35s linear infinite; }
        .dot-grid {
          background-image: radial-gradient(circle, rgba(112,48,160,0.10) 1px, transparent 1px);
          background-size: 28px 28px;
        }
      `}</style>

      <div className="overflow-x-hidden bg-background text-foreground">

        {/* ── NAV ──────────────────────────────────────────────────────────── */}
        <header className="sticky top-0 inset-x-0 z-50 border-b border-border bg-white/80 backdrop-blur-md">
          <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <div className="font-heading flex items-center gap-1.5">
              <span className="text-lg font-extrabold text-primary">DClaw</span>
              <span className="text-lg font-semibold text-foreground">Migrate</span>
            </div>

            <div className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
              <a href="#features"  className="transition-colors hover:text-primary">Features</a>
              <a href="#lifecycle" className="transition-colors hover:text-primary">How it works</a>
              <a href="#ai"        className="transition-colors hover:text-primary">AI Copilot</a>
              <a href="#p1"        className="flex items-center gap-1.5 transition-colors hover:text-primary">
                What&apos;s new
                <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">v1.1</span>
              </a>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="https://github.com/dclawstack/dclaw-migrate"
                target="_blank" rel="noopener noreferrer"
                className="hidden items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm text-muted-foreground transition-all hover:border-primary hover:text-primary sm:inline-flex"
              >
                <GithubIcon className="h-4 w-4" /> GitHub
              </a>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90"
              >
                Open app →
              </Link>
            </div>
          </nav>
        </header>

        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <section className="relative flex min-h-[88vh] flex-col justify-center overflow-hidden bg-white dot-grid">
          <div className="pointer-events-none absolute left-[-4%] top-[-8%] h-[480px] w-[480px] rounded-full bg-accent opacity-60 blur-[100px]" />
          <div className="pointer-events-none absolute bottom-[-8%] right-[-4%] h-[400px] w-[400px] rounded-full bg-[hsl(var(--purple-subtle))] opacity-80 blur-[120px]" />

          <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-6 py-24 lg:grid-cols-2">

            {/* Left */}
            <div>
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-accent px-4 py-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
                <span className="text-xs font-medium text-primary">
                  v1.1 · 12 AI features · Open source
                </span>
              </div>

              <h1 className="mb-6 text-5xl font-black leading-[1.04] text-foreground md:text-7xl">
                Migrate
                <br />
                <span className="text-primary">anything.</span>
                <br />
                <span className="mt-2 block text-3xl font-semibold text-muted-foreground md:text-4xl">guided by AI.</span>
              </h1>

              <p className="mb-10 max-w-lg text-lg leading-relaxed text-muted-foreground">
                Plan, execute, validate, and roll back database and cloud migrations with an AI
                copilot at every step. From discovery to cutover to post-migration optimisation.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-bold text-primary-foreground shadow-sm transition-all hover:scale-105 hover:opacity-90"
                >
                  Start migrating →
                </Link>
                <a
                  href="https://github.com/dclawstack/dclaw-migrate"
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border-2 border-primary px-8 py-3.5 text-sm font-bold text-primary transition-all hover:bg-primary hover:text-primary-foreground"
                >
                  <GithubIcon className="h-4 w-4" /> ⭐ GitHub
                </a>
              </div>

              <div className="mt-12 flex flex-wrap gap-6 border-t border-border pt-8">
                {[
                  ["12",  "AI features"],
                  ["9",   "App pages"],
                  ["60+", "API routes"],
                  ["100%","Open source"],
                ].map(([val, label]) => (
                  <div key={label}>
                    <div className="font-heading text-2xl font-black text-primary">{val}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: floating migration mock */}
            <div className="float-card hidden lg:block">
              <div className="relative rounded-3xl border border-border bg-card p-6 shadow-xl">
                <div className="mb-5 flex items-center justify-between">
                  <span className="font-heading text-sm font-bold text-foreground">Migration Jobs · Live</span>
                  <div className="flex gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-destructive/40" />
                    <span className="h-3 w-3 rounded-full bg-warning/50" />
                    <span className="h-3 w-3 rounded-full bg-success/50" />
                  </div>
                </div>

                {/* Job rows */}
                {[
                  { name: "MySQL → Postgres",      status: "running",   pct: 72,  cls: "text-primary",          bar: "bg-primary" },
                  { name: "Oracle → Aurora",        status: "completed", pct: 100, cls: "text-success",          bar: "bg-success" },
                  { name: "MongoDB → Firestore",    status: "planned",   pct: 0,   cls: "text-muted-foreground", bar: "bg-muted-foreground" },
                ].map((j) => (
                  <div key={j.name} className="mb-3 rounded-xl border border-border bg-secondary p-3">
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="text-xs font-medium text-foreground">{j.name}</span>
                      <span className={`font-mono text-[10px] ${j.cls}`}>{j.status}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div className={`h-full rounded-full transition-all ${j.bar}`} style={{ width: `${j.pct}%` }} />
                    </div>
                  </div>
                ))}

                {/* Wave summary */}
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {[
                    { label: "Wave",   val: "2 / 5" },
                    { label: "Tables", val: "1,840" },
                    { label: "Rows",   val: "42.3 M" },
                  ].map((k) => (
                    <div key={k.label} className="rounded-xl border border-border bg-secondary p-2.5 text-center">
                      <div className="mb-1 text-[9px] text-muted-foreground">{k.label}</div>
                      <div className="font-heading text-sm font-bold text-foreground">{k.val}</div>
                    </div>
                  ))}
                </div>

                {/* AI insight */}
                <div className="mt-4 flex items-center gap-2 rounded-full border border-border bg-accent px-3 py-1.5">
                  <span className="text-[10px] font-semibold text-primary">✦ AI</span>
                  <span className="text-[10px] text-muted-foreground">
                    3 AUTO_INCREMENT columns need SERIAL conversion before cutover
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── MARQUEE ──────────────────────────────────────────────────────── */}
        <section className="overflow-hidden border-y border-border bg-secondary py-5">
          <div className="flex whitespace-nowrap">
            <div className="marquee-track flex gap-10 pr-10">
              {[...features, ...features].map((f, i) => (
                <span key={i} className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <span className="text-[hsl(var(--purple-light))]">→</span>
                  <span>{f.title}</span>
                  <span className="mx-2 text-[hsl(var(--purple-light))]">·</span>
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── AI FEATURES ──────────────────────────────────────────────────── */}
        <section id="features" className="relative overflow-hidden bg-white px-6 py-32">
          <div className="pointer-events-none absolute right-0 top-8 select-none font-heading text-[18rem] font-black leading-none text-accent">
            12
          </div>
          <div className="relative mx-auto max-w-7xl">
            <FadeUp className="mb-20 text-center">
              <span className="rounded-full bg-accent px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">
                Capabilities
              </span>
              <h2 className="mb-4 mt-6 text-5xl font-black text-foreground md:text-6xl">
                Every feature is<br />
                <span className="text-primary">AI-native.</span>
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                Not bolted on. AI is woven into every workflow — discovery, wave planning, validation,
                cutover, optimisation, and runbooks.
              </p>
            </FadeUp>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {features.map((f, i) => <FeatureCard key={f.n} f={f} idx={i} />)}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
        <section id="lifecycle" className="relative overflow-hidden bg-secondary px-6 py-32">
          <div className="relative mx-auto max-w-5xl text-center">
            <FadeUp>
              <span className="rounded-full bg-accent px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">
                How it works
              </span>
              <h2 className="mb-20 mt-6 text-5xl font-black text-foreground md:text-6xl">
                The full lifecycle,<br /><span className="text-primary">automated.</span>
              </h2>
            </FadeUp>

            <div className="relative grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
              <div className="absolute left-[14%] right-[14%] top-10 hidden h-px bg-primary/30 lg:block" />
              {[
                { step: "01", title: "Connect",  body: "Register source and target databases. Test connectivity and check permissions in one click.",                        href: "/connections" },
                { step: "02", title: "Discover", body: "AI introspects your schema, proposes type-mapped table migrations, and flags compatibility issues before you run.",  href: "/jobs" },
                { step: "03", title: "Execute",  body: "Group jobs into waves, choose a cutover strategy, then execute with state-machine guards and rollback support.",     href: "/waves" },
                { step: "04", title: "Optimise", body: "Checksums, AI test suites, right-sizing recommendations, and auto-generated runbooks for the ops team.",            href: "/optimization" },
              ].map((s, i) => (
                <FadeUp key={s.step} delay={i * 140}>
                  <Link href={s.href} className="group block rounded-2xl border border-border bg-white p-7 text-left transition-all hover:border-primary hover:shadow-lg">
                    <div className="mb-3 font-mono text-xs text-primary">{s.step}</div>
                    <h3 className="mb-3 text-lg font-bold text-foreground transition-colors group-hover:text-primary">
                      {s.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                    <div className="mt-4 font-mono text-xs text-primary opacity-0 transition-opacity group-hover:opacity-100">
                      Go to {s.title} →
                    </div>
                  </Link>
                </FadeUp>
              ))}
            </div>
          </div>
        </section>

        {/* ── P1 — WHAT'S NEW ──────────────────────────────────────────────── */}
        <section id="p1" className="bg-white px-6 py-32">
          <div className="mx-auto max-w-7xl">
            <FadeUp className="mb-20 text-center">
              <span className="rounded-full bg-primary px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground">
                New in v1.1
              </span>
              <h2 className="mb-4 mt-6 text-5xl font-black text-foreground md:text-6xl">
                Advanced migration<br />
                <span className="text-primary">controls.</span>
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                The full P1 tier is live — cutover orchestration, AI testing, cost optimisation, and auto-generated runbooks.
              </p>
            </FadeUp>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {[
                {
                  n: "P1.1", title: "Cutover Management", href: "/cutover",
                  desc: "Blue-green, rolling, or in-place cutover with a built-in state machine. Execute, validate, and roll back in one click. AI reviews your plan before you proceed.",
                  bullets: ["Execute / Complete / Rollback actions", "AI pre-flight plan analysis", "Full cutover status timeline"],
                },
                {
                  n: "P1.2", title: "Testing & Validation", href: "/testing",
                  desc: "Generate 100+ test cases per migration job automatically. Run in parallel against source and target. Pass/fail/skipped scoreboard per run — regression detection built in.",
                  bullets: ["AI-generated test cases", "Run-all with live scoreboard", "Regression detection"],
                },
                {
                  n: "P1.3", title: "Post-Migration Optimisation", href: "/optimization",
                  desc: "AI analyses your migrated workload and generates prioritised recommendations — cost reduction, right-sizing, and reliability improvements — with estimated savings per item.",
                  bullets: ["Right-sizing recommendations", "Estimated savings per item", "Apply / Dismiss workflow"],
                },
                {
                  n: "P1.4", title: "Runbook Generation", href: "/runbooks",
                  desc: "AI writes pre-migration, cutover, rollback, post-migration, and validation runbooks tailored to your specific job. Five runbook types, full-text SOPs, export-ready.",
                  bullets: ["Five runbook types per job", "AI-authored SOPs", "Expandable viewer"],
                },
              ].map((c, i) => (
                <FadeUp key={c.n} delay={(i % 2) * 120}>
                  <Link href={c.href} className="group block rounded-2xl border border-border bg-card p-8 transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:shadow-lg">
                    <div className="mb-5 flex items-center justify-between">
                      <span className="rounded-full bg-accent px-3 py-1 font-mono text-xs font-bold text-primary">{c.n}</span>
                      <span className="font-mono text-xs text-primary opacity-0 transition-opacity group-hover:opacity-100">Open →</span>
                    </div>
                    <h3 className="mb-3 text-xl font-black text-foreground">{c.title}</h3>
                    <p className="mb-5 text-sm leading-relaxed text-muted-foreground">{c.desc}</p>
                    <ul className="space-y-1.5">
                      {c.bullets.map((b) => (
                        <li key={b} className="flex items-center gap-2 text-sm text-foreground">
                          <span className="font-mono text-xs text-primary">→</span>
                          {b}
                        </li>
                      ))}
                    </ul>
                  </Link>
                </FadeUp>
              ))}
            </div>
          </div>
        </section>

        {/* ── AI COPILOT ───────────────────────────────────────────────────── */}
        <section id="ai" className="relative overflow-hidden bg-accent px-6 py-32">
          <div className="relative mx-auto max-w-6xl">
            <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
              <FadeUp>
                <span className="rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">
                  AI Copilot
                </span>
                <h2 className="mb-6 mt-5 text-4xl font-black text-foreground md:text-5xl">
                  Migration expertise,<br />on every screen.
                </h2>
                <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
                  The Copilot floats on every page. It knows the migration job you&apos;re viewing,
                  the databases involved, and the schema you&apos;re mapping. Ask anything — from
                  &quot;why did this validation fail?&quot; to &quot;write a rollback runbook for this job.&quot;
                </p>
                <ul className="space-y-4">
                  {[
                    "Context-aware — sees your active job, schema, and status",
                    "Streams structured outputs: mappings, test cases, runbooks",
                    "OpenRouter primary (Kimi K2 default), any model configurable",
                    "Falls back to local Ollama when cloud is unavailable",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="mt-0.5 font-mono text-sm text-primary">→</span>
                      <span className="text-sm text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </FadeUp>

              {/* Chat mockup */}
              <FadeUp delay={150}>
                <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-xl">
                  <div className="flex items-center justify-between bg-primary px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-primary-foreground">✦</span>
                      <span className="font-heading text-sm font-bold text-primary-foreground">DClaw Migrate Copilot</span>
                    </div>
                    <span className="rounded bg-white/20 px-2 py-0.5 font-mono text-xs text-primary-foreground">MySQL → Postgres</span>
                  </div>
                  <div className="space-y-3 bg-secondary p-4">
                    <ChatBubble role="user">What are the top 3 risks for this migration?</ChatBubble>
                    <ChatBubble role="assistant">{`1. AUTO_INCREMENT → SERIAL semantics — sequences start at 1, check for gaps\n2. UTF-8mb4 vs utf8 collation drift — review text columns with emoji data\n3. Zero-date handling — MySQL allows '0000-00-00', Postgres rejects it\n\nMitigation: pre-convert timestamps, dual-write during cutover window, run the checksum validator post-load.`}</ChatBubble>
                    <ChatBubble role="user">Generate a pre-migration runbook.</ChatBubble>
                    <ChatBubble role="assistant" loading>Drafting your runbook…</ChatBubble>
                  </div>
                  <div className="flex gap-2 border-t border-border bg-white px-4 py-3">
                    <div className="flex-1 rounded-full border border-border bg-secondary px-3 py-2 text-xs text-muted-foreground">
                      Ask about your migration…
                    </div>
                    <button className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground">Send</button>
                  </div>
                </div>
              </FadeUp>
            </div>
          </div>
        </section>

        {/* ── 9 SCREENS ────────────────────────────────────────────────────── */}
        <section className="bg-white px-6 py-32">
          <div className="mx-auto max-w-7xl">
            <FadeUp className="mb-20 text-center">
              <span className="rounded-full bg-accent px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">
                9 screens
              </span>
              <h2 className="mb-4 mt-6 text-5xl font-black text-foreground md:text-6xl">
                A complete <span className="text-primary">migration OS.</span>
              </h2>
              <p className="mx-auto max-w-xl text-lg text-muted-foreground">
                Every screen your team needs — discovery to cutover, testing to optimisation.
              </p>
            </FadeUp>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { href: "/dashboard",    title: "Dashboard",     desc: "KPI cards, recent jobs, wave progress — your full migration picture at a glance." },
                { href: "/connections",  title: "Connections",   desc: "Register source and target databases. Test connectivity and verify permissions in one click." },
                { href: "/jobs",         title: "Migration Jobs", desc: "Create, run, and monitor jobs. Full-load, CDC, or schema-only — DB-backed state machine." },
                { href: "/waves",        title: "Wave Planning", desc: "Group jobs into ordered waves. AI suggests dependency-safe groupings to minimise downtime." },
                { href: "/assets",       title: "Assets",        desc: "Inventory every service, DB, and API. Six migration strategies per asset with AI effort estimates." },
                { href: "/cutover",      title: "Cutover",       desc: "Blue-green cutover with execute, complete, and rollback actions. AI pre-flight review included." },
                { href: "/testing",      title: "Testing",       desc: "AI-generated test cases, run-all execution, live pass/fail scoreboard per migration job." },
                { href: "/optimization", title: "Optimisation",  desc: "Post-migration AI recommendations — cost, performance, and reliability. Apply or dismiss per item." },
                { href: "/runbooks",     title: "Runbooks",      desc: "AI-authored SOPs: pre-migration, cutover, rollback, post-migration, and validation runbooks." },
              ].map((s, i) => (
                <FadeUp key={s.href} delay={(i % 3) * 100}>
                  <Link href={s.href}
                    className="group block rounded-2xl border border-border bg-secondary p-6 transition-all duration-200 hover:border-primary hover:bg-accent hover:shadow-md">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="font-bold text-foreground transition-colors group-hover:text-primary">{s.title}</h3>
                      <span className="font-mono text-xs text-primary opacity-0 transition-opacity group-hover:opacity-100">→</span>
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
                  </Link>
                </FadeUp>
              ))}
            </div>
          </div>
        </section>

        {/* ── TECH STACK ───────────────────────────────────────────────────── */}
        <section id="stack" className="bg-secondary px-6 py-32">
          <div className="mx-auto max-w-5xl text-center">
            <FadeUp>
              <span className="rounded-full bg-accent px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">
                Tech stack
              </span>
              <h2 className="mb-4 mt-6 text-5xl font-black text-foreground">
                Modern. <span className="text-primary">Production-grade.</span>
              </h2>
              <p className="mb-12 text-lg text-muted-foreground">
                FastAPI + Next.js 14 + PostgreSQL 16 — async all the way down, repository pattern, Alembic migrations, Docker + Helm.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {stack.map((s) => (
                  <span key={s}
                    className="cursor-default rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:bg-accent">
                    {s}
                  </span>
                ))}
              </div>
            </FadeUp>
          </div>
        </section>

        {/* ── OPEN SOURCE CTA ──────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-primary px-6 py-32 text-primary-foreground">
          <FadeUp className="relative mx-auto max-w-3xl text-center">
            <h2 className="mb-6 text-5xl font-black text-primary-foreground md:text-6xl">
              100% open source.
            </h2>
            <p className="mb-10 text-lg leading-relaxed text-primary-foreground/80">
              Fork it, extend it, self-host it. Full FastAPI backend, Next.js frontend, Helm chart —
              every line is on GitHub. PRs welcome.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="https://github.com/dclawstack/dclaw-migrate"
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-bold text-primary transition-all hover:scale-105"
              >
                <GithubIcon className="h-5 w-5" /> View on GitHub
              </a>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-full border border-white/60 px-8 py-4 text-sm font-bold text-primary-foreground transition-all hover:bg-white/10"
              >
                Open app →
              </Link>
            </div>
          </FadeUp>
        </section>

        {/* ── FOOTER ───────────────────────────────────────────────────────── */}
        <footer className="border-t border-border bg-secondary px-6 pb-10 pt-20">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 flex flex-col justify-between gap-10 md:flex-row">
              <div className="max-w-xs">
                <div className="font-heading mb-4 flex items-center gap-1">
                  <span className="text-2xl font-black text-primary">DClaw</span>
                  <span className="text-2xl font-semibold text-foreground"> Migrate</span>
                </div>
                <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                  AI-guided cloud &amp; database migration. Plan, execute, validate, and roll back.
                  Part of the DClaw platform stack.
                </p>
                <a
                  href="https://github.com/dclawstack/dclaw-migrate"
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  <GithubIcon className="h-4 w-4" />
                </a>
              </div>

              <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                {Object.entries(footerLinks).map(([col, links]) => (
                  <div key={col}>
                    <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-foreground">{col}</h4>
                    <ul className="space-y-2.5">
                      {links.map((l) => (
                        <li key={l.label}>
                          {l.href.startsWith("http") ? (
                            <a href={l.href} target="_blank" rel="noopener noreferrer"
                              className="text-sm text-muted-foreground transition-colors hover:text-primary">
                              {l.label}
                            </a>
                          ) : (
                            <Link href={l.href}
                              className="text-sm text-muted-foreground transition-colors hover:text-primary">
                              {l.label}
                            </Link>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
              <p className="text-xs text-muted-foreground">
                © {new Date().getFullYear()} DClaw Migrate · Built on the DClaw Stack · MIT License
              </p>
              <div className="flex gap-6">
                {[
                  { label: "REVISED-PRD",  href: "https://github.com/dclawstack/dclaw-migrate/blob/main/REVISED-PRD.md" },
                  { label: "PLAN v1.2",    href: "https://github.com/dclawstack/dclaw-migrate/blob/main/PLAN-v1.2.md" },
                  { label: "Issues",       href: "https://github.com/dclawstack/dclaw-migrate/issues" },
                ].map((l) => (
                  <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer"
                    className="font-mono text-xs text-muted-foreground transition-colors hover:text-primary">
                    {l.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}

/* ─── ChatBubble ─────────────────────────────────────────────────────────── */
function ChatBubble({ role, children, loading }: {
  role: "user" | "assistant"; children: React.ReactNode; loading?: boolean;
}) {
  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] whitespace-pre-wrap rounded-2xl rounded-br-sm bg-primary px-3.5 py-2.5 text-sm text-primary-foreground shadow-sm">
          {children}
        </div>
      </div>
    );
  }
  return (
    <div className="flex justify-start">
      <div className={`max-w-[88%] whitespace-pre-wrap rounded-2xl rounded-bl-sm border border-border bg-white px-3.5 py-2.5 text-sm text-foreground ${loading ? "animate-pulse" : ""}`}>
        {children}
      </div>
    </div>
  );
}
