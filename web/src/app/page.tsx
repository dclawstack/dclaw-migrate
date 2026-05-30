"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

/* ─── Design tokens (OC system) ─────────────────────────────────────────── */
const PURPLE      = "#7030A0";
const PURPLE_LITE = "#c084fc";
const INK         = "#0d0618";
const INK_DEEP    = "#080410";
const INK_2       = "#1a0a2e";
const PAPER       = "#ffffff";
const PAPER_COOL  = "#faf6ff";
const PAPER_RULE  = "#ece6f5";

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
    { label: "Frontend",     href: "https://github.com/dclawstack/dclaw-migrate/tree/main/frontend" },
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
      className="group relative bg-white border border-[#ece6f5] rounded-2xl p-6 hover:shadow-xl hover:shadow-purple-100 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-[#f3e8ff] to-transparent rounded-bl-full opacity-50 group-hover:opacity-100 transition-opacity" />
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <span className="font-mono text-xs font-bold text-[#9d6dc7] bg-[#f3e8ff] px-2 py-1 rounded-full">{f.n}</span>
          <span className="text-[10px] border border-[#ece6f5] text-[PURPLE] px-2 py-0.5 rounded-full font-mono text-[#7030A0]">{f.trigger}</span>
        </div>
        <h3 className="text-base font-bold text-[#1a0a2e] mb-2" style={{ fontFamily: "'Raleway', sans-serif" }}>
          {f.title}
        </h3>
        <p className="text-sm text-[#555] leading-relaxed mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
          {f.desc}
        </p>
        <span className="text-[10px] bg-[#1a0a2e] text-white px-2.5 py-1 rounded-full font-mono">{f.tag}</span>
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
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-10px); }
        }
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .shimmer-text {
          background: linear-gradient(90deg, #c084fc, #7030A0, #e879f9, #7030A0, #c084fc);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }
        .float-card { animation: float 5s ease-in-out infinite; }
        .marquee-track { animation: marquee 35s linear infinite; }
        .dot-grid {
          background-image: radial-gradient(circle, rgba(160,100,220,0.22) 1px, transparent 1px);
          background-size: 28px 28px;
        }
      `}</style>

      <div className="bg-white text-[#1a0a2e] overflow-x-hidden">

        {/* ── NAV ──────────────────────────────────────────────────────────── */}
        <header className="fixed top-0 inset-x-0 z-50 border-b border-white/10 bg-[#0d0618]/80 backdrop-blur-md">
          <nav className="mx-auto max-w-7xl flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-2" style={{ fontFamily: "'Raleway', sans-serif" }}>
              <span className="font-black text-white text-lg">DClaw</span>
              <span className="font-semibold text-[#c084fc]">Migrate</span>
            </div>

            <div className="hidden md:flex items-center gap-7 text-sm text-white/60" style={{ fontFamily: "'Poppins', sans-serif" }}>
              <a href="#features"  className="hover:text-white transition-colors">Features</a>
              <a href="#lifecycle" className="hover:text-white transition-colors">How it works</a>
              <a href="#ai"        className="hover:text-white transition-colors">AI Copilot</a>
              <a href="#p1"        className="hover:text-white transition-colors flex items-center gap-1.5">
                What&apos;s new
                <span className="text-[10px] font-bold bg-[#7030A0] text-white rounded-full px-1.5 py-0.5">v1.1</span>
              </a>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="https://github.com/dclawstack/dclaw-migrate"
                target="_blank" rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 text-sm transition-all border border-white/10"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                <GithubIcon className="w-4 h-4" /> GitHub
              </a>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-white font-semibold text-sm transition-all hover:opacity-90"
                style={{ background: PURPLE, fontFamily: "'Poppins', sans-serif" }}
              >
                Open app →
              </Link>
            </div>
          </nav>
        </header>

        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <section className="relative min-h-screen bg-[#0d0618] dot-grid flex flex-col justify-center overflow-hidden pt-20">
          <div className="absolute top-[-8%] left-[-4%] w-[480px] h-[480px] bg-[#7030A0] opacity-20 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-8%] right-[-4%] w-[400px] h-[400px] bg-[#c084fc] opacity-12 rounded-full blur-[120px]" />

          <div className="relative mx-auto max-w-7xl px-6 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left */}
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c084fc] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#c084fc]" />
                </span>
                <span className="text-xs text-white/70 font-medium" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  v1.1 · 12 AI features · Open source
                </span>
              </div>

              <h1 className="text-5xl md:text-7xl font-black leading-[1.04] mb-6" style={{ fontFamily: "'Raleway', sans-serif" }}>
                <span className="text-white">Migrate</span>
                <br />
                <span className="shimmer-text">anything.</span>
                <br />
                <span className="text-white/60 text-3xl md:text-4xl font-semibold block mt-2">guided by AI.</span>
              </h1>

              <p className="text-white/60 text-lg leading-relaxed mb-10 max-w-lg" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Plan, execute, validate, and roll back database and cloud migrations with an AI
                copilot at every step. From discovery to cutover to post-migration optimisation.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-white font-bold text-sm transition-all hover:scale-105 hover:shadow-lg hover:shadow-purple-900"
                  style={{ background: PURPLE, fontFamily: "'Poppins', sans-serif" }}
                >
                  Start migrating →
                </Link>
                <a
                  href="https://github.com/dclawstack/dclaw-migrate"
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-white font-bold text-sm border border-white/20 hover:bg-white/10 transition-all"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  <GithubIcon className="w-4 h-4" /> ⭐ GitHub
                </a>
              </div>

              <div className="flex flex-wrap gap-6 mt-12 pt-8 border-t border-white/10">
                {[
                  ["12",  "AI features"],
                  ["9",   "App pages"],
                  ["60+", "API routes"],
                  ["100%","Open source"],
                ].map(([val, label]) => (
                  <div key={label}>
                    <div className="text-2xl font-black text-white" style={{ fontFamily: "'Raleway', sans-serif" }}>{val}</div>
                    <div className="text-xs text-white/40 mt-0.5" style={{ fontFamily: "'Poppins', sans-serif" }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: floating migration mock */}
            <div className="float-card hidden lg:block">
              <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-5">
                  <span className="text-white font-bold text-sm" style={{ fontFamily: "'Raleway', sans-serif" }}>Migration Jobs · Live</span>
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-400/60" />
                    <span className="w-3 h-3 rounded-full bg-yellow-400/60" />
                    <span className="w-3 h-3 rounded-full bg-green-400/60" />
                  </div>
                </div>

                {/* Job rows */}
                {[
                  { name: "MySQL → Postgres",      status: "running",   pct: 72, color: "#c084fc" },
                  { name: "Oracle → Aurora",        status: "completed", pct: 100, color: "#18A957" },
                  { name: "MongoDB → Firestore",    status: "planned",   pct: 0,   color: "#8A8A8A" },
                ].map((j) => (
                  <div key={j.name} className="mb-3 bg-white/5 rounded-xl p-3 border border-white/10">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-white/80 text-xs font-medium" style={{ fontFamily: "'Poppins', sans-serif" }}>{j.name}</span>
                      <span className="text-[10px] font-mono" style={{ color: j.color }}>{j.status}</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${j.pct}%`, background: j.color }} />
                    </div>
                  </div>
                ))}

                {/* Wave summary */}
                <div className="grid grid-cols-3 gap-2 mt-4">
                  {[
                    { label: "Wave", val: "2 / 5" },
                    { label: "Tables",  val: "1,840" },
                    { label: "Rows",    val: "42.3 M" },
                  ].map((k) => (
                    <div key={k.label} className="bg-white/5 rounded-xl p-2.5 border border-white/10 text-center">
                      <div className="text-white/40 text-[9px] mb-1">{k.label}</div>
                      <div className="text-white font-bold text-sm" style={{ fontFamily: "'Raleway', sans-serif" }}>{k.val}</div>
                    </div>
                  ))}
                </div>

                {/* AI insight */}
                <div className="mt-4 flex items-center gap-2 bg-[#7030A0]/30 border border-[#7030A0]/40 rounded-full px-3 py-1.5">
                  <span className="text-[10px] text-[#c084fc]">✦ AI</span>
                  <span className="text-[10px] text-white/70" style={{ fontFamily: "'Poppins', sans-serif" }}>
                    3 AUTO_INCREMENT columns need SERIAL conversion before cutover
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* wave shape */}
          <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
            <svg viewBox="0 0 1440 56" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 56L1440 56L1440 28C1200 56 960 0 720 18C480 36 240 8 0 28L0 56Z" fill="white"/>
            </svg>
          </div>
        </section>

        {/* ── MARQUEE ──────────────────────────────────────────────────────── */}
        <section className="py-5 border-y border-[#f0e8fa] bg-[#faf6ff] overflow-hidden">
          <div className="flex whitespace-nowrap">
            <div className="marquee-track flex gap-10 pr-10">
              {[...features, ...features].map((f, i) => (
                <span key={i} className="flex items-center gap-2 text-sm font-semibold text-[#7030A0]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  <span className="text-[#c084fc]">→</span>
                  <span>{f.title}</span>
                  <span className="text-[#c084fc] mx-2">·</span>
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── AI FEATURES ──────────────────────────────────────────────────── */}
        <section id="features" className="py-32 px-6 bg-white relative overflow-hidden">
          <div
            className="absolute top-8 right-0 text-[18rem] font-black text-[#f3e8ff] select-none leading-none pointer-events-none"
            style={{ fontFamily: "'Raleway', sans-serif" }}
          >
            12
          </div>
          <div className="relative mx-auto max-w-7xl">
            <FadeUp className="text-center mb-20">
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#7030A0] bg-[#f3e8ff] px-4 py-2 rounded-full" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Capabilities
              </span>
              <h2 className="text-5xl md:text-6xl font-black mt-6 mb-4" style={{ fontFamily: "'Raleway', sans-serif" }}>
                Every feature is<br />
                <span className="shimmer-text">AI-native.</span>
              </h2>
              <p className="text-[#555] text-lg max-w-2xl mx-auto" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Not bolted on. AI is woven into every workflow — discovery, wave planning, validation,
                cutover, optimisation, and runbooks.
              </p>
            </FadeUp>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map((f, i) => <FeatureCard key={f.n} f={f} idx={i} />)}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
        <section id="lifecycle" className="py-32 px-6 bg-[#0d0618] relative overflow-hidden">
          <div className="absolute inset-0 dot-grid opacity-40" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#7030A0] opacity-15 blur-[100px] rounded-full" />

          <div className="relative mx-auto max-w-5xl text-center">
            <FadeUp>
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#c084fc] bg-white/10 px-4 py-2 rounded-full" style={{ fontFamily: "'Poppins', sans-serif" }}>
                How it works
              </span>
              <h2 className="text-5xl md:text-6xl font-black mt-6 mb-20 text-white" style={{ fontFamily: "'Raleway', sans-serif" }}>
                The full lifecycle,<br /><span className="shimmer-text">automated.</span>
              </h2>
            </FadeUp>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 relative">
              <div className="hidden lg:block absolute top-10 left-[14%] right-[14%] h-px bg-gradient-to-r from-[#7030A0] via-[#c084fc] to-[#7030A0]" />
              {[
                { step: "01", title: "Connect",  body: "Register source and target databases. Test connectivity and check permissions in one click.",                        href: "/connections" },
                { step: "02", title: "Discover", body: "AI introspects your schema, proposes type-mapped table migrations, and flags compatibility issues before you run.",  href: "/jobs" },
                { step: "03", title: "Execute",  body: "Group jobs into waves, choose a cutover strategy, then execute with state-machine guards and rollback support.",     href: "/waves" },
                { step: "04", title: "Optimise", body: "Checksums, AI test suites, right-sizing recommendations, and auto-generated runbooks for the ops team.",            href: "/optimization" },
              ].map((s, i) => (
                <FadeUp key={s.step} delay={i * 140}>
                  <Link href={s.href} className="group block bg-white/5 border border-white/10 rounded-2xl p-7 hover:bg-white/8 hover:border-[#7030A0]/60 transition-all text-left">
                    <div className="text-[#c084fc] text-xs font-mono mb-3">{s.step}</div>
                    <h3 className="text-white font-bold text-lg mb-3 group-hover:text-[#c084fc] transition-colors" style={{ fontFamily: "'Raleway', sans-serif" }}>
                      {s.title}
                    </h3>
                    <p className="text-white/50 text-sm leading-relaxed" style={{ fontFamily: "'Poppins', sans-serif" }}>{s.body}</p>
                    <div className="mt-4 text-[#7030A0] text-xs font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                      Go to {s.title} →
                    </div>
                  </Link>
                </FadeUp>
              ))}
            </div>
          </div>
        </section>

        {/* ── P1 — WHAT'S NEW ──────────────────────────────────────────────── */}
        <section id="p1" className="py-32 px-6 bg-white">
          <div className="mx-auto max-w-7xl">
            <FadeUp className="text-center mb-20">
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-white bg-[#7030A0] px-4 py-2 rounded-full" style={{ fontFamily: "'Poppins', sans-serif" }}>
                New in v1.1
              </span>
              <h2 className="text-5xl md:text-6xl font-black mt-6 mb-4" style={{ fontFamily: "'Raleway', sans-serif" }}>
                Advanced migration<br />
                <span className="shimmer-text">controls.</span>
              </h2>
              <p className="text-[#555] text-lg max-w-2xl mx-auto" style={{ fontFamily: "'Poppins', sans-serif" }}>
                The full P1 tier is live — cutover orchestration, AI testing, cost optimisation, and auto-generated runbooks.
              </p>
            </FadeUp>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <Link href={c.href} className="group block bg-white border border-[#ece6f5] rounded-2xl p-8 hover:border-[#7030A0] hover:shadow-xl hover:shadow-purple-100 hover:-translate-y-1 transition-all duration-300">
                    <div className="flex items-center justify-between mb-5">
                      <span className="text-xs font-mono font-bold text-[#7030A0] bg-[#f3e8ff] px-3 py-1 rounded-full">{c.n}</span>
                      <span className="text-xs text-[#c084fc] font-mono opacity-0 group-hover:opacity-100 transition-opacity">Open →</span>
                    </div>
                    <h3 className="text-xl font-black text-[#1a0a2e] mb-3" style={{ fontFamily: "'Raleway', sans-serif" }}>{c.title}</h3>
                    <p className="text-sm text-[#555] leading-relaxed mb-5" style={{ fontFamily: "'Poppins', sans-serif" }}>{c.desc}</p>
                    <ul className="space-y-1.5">
                      {c.bullets.map((b) => (
                        <li key={b} className="flex items-center gap-2 text-sm text-[#333]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                          <span className="text-[#7030A0] font-mono text-xs">→</span>
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
        <section id="ai" className="py-32 px-6 bg-[#1a0a2e] relative overflow-hidden">
          <div className="absolute inset-0 dot-grid opacity-30" />
          <div className="absolute top-0 left-1/4 w-[32rem] h-[32rem] bg-[#7030A0] opacity-15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#c084fc] opacity-8 rounded-full blur-3xl pointer-events-none" />

          <div className="relative mx-auto max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <FadeUp>
                <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#c084fc] bg-white/10 px-4 py-2 rounded-full" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  AI Copilot
                </span>
                <h2 className="text-4xl md:text-5xl font-black mt-5 mb-6 text-white" style={{ fontFamily: "'Raleway', sans-serif" }}>
                  Migration expertise,<br />on every screen.
                </h2>
                <p className="text-white/60 text-lg leading-relaxed mb-8" style={{ fontFamily: "'Poppins', sans-serif" }}>
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
                    <li key={item} className="flex items-start gap-3" style={{ fontFamily: "'Poppins', sans-serif" }}>
                      <span className="text-[#c084fc] font-mono text-sm mt-0.5">→</span>
                      <span className="text-white/70 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </FadeUp>

              {/* Chat mockup */}
              <FadeUp delay={150}>
                <div className="rounded-2xl bg-white/5 border border-white/10 shadow-2xl overflow-hidden">
                  <div className="px-4 py-3 flex items-center justify-between" style={{ background: PURPLE }}>
                    <div className="flex items-center gap-2">
                      <span className="text-white text-xs font-mono">✦</span>
                      <span className="text-white font-bold text-sm" style={{ fontFamily: "'Raleway', sans-serif" }}>DClaw Migrate Copilot</span>
                    </div>
                    <span className="text-white/70 text-xs bg-white/10 rounded px-2 py-0.5 font-mono">MySQL → Postgres</span>
                  </div>
                  <div className="p-4 space-y-3 bg-[#0d0618]/60">
                    <ChatBubble role="user">What are the top 3 risks for this migration?</ChatBubble>
                    <ChatBubble role="assistant">{`1. AUTO_INCREMENT → SERIAL semantics — sequences start at 1, check for gaps\n2. UTF-8mb4 vs utf8 collation drift — review text columns with emoji data\n3. Zero-date handling — MySQL allows '0000-00-00', Postgres rejects it\n\nMitigation: pre-convert timestamps, dual-write during cutover window, run the checksum validator post-load.`}</ChatBubble>
                    <ChatBubble role="user">Generate a pre-migration runbook.</ChatBubble>
                    <ChatBubble role="assistant" loading>Drafting your runbook…</ChatBubble>
                  </div>
                  <div className="border-t border-white/10 px-4 py-3 flex gap-2 bg-[#0d0618]/80">
                    <div className="flex-1 rounded-full bg-white/10 border border-white/10 px-3 py-2 text-xs text-white/30" style={{ fontFamily: "'Poppins', sans-serif" }}>
                      Ask about your migration…
                    </div>
                    <button className="px-4 py-2 rounded-full text-white text-xs font-semibold" style={{ background: PURPLE, fontFamily: "'Poppins', sans-serif" }}>Send</button>
                  </div>
                </div>
              </FadeUp>
            </div>
          </div>
        </section>

        {/* ── 9 SCREENS ────────────────────────────────────────────────────── */}
        <section className="py-32 px-6 bg-white">
          <div className="mx-auto max-w-7xl">
            <FadeUp className="text-center mb-20">
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#7030A0] bg-[#f3e8ff] px-4 py-2 rounded-full" style={{ fontFamily: "'Poppins', sans-serif" }}>
                9 screens
              </span>
              <h2 className="text-5xl md:text-6xl font-black mt-6 mb-4" style={{ fontFamily: "'Raleway', sans-serif" }}>
                A complete <span className="shimmer-text">migration OS.</span>
              </h2>
              <p className="text-[#555] text-lg max-w-xl mx-auto" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Every screen your team needs — discovery to cutover, testing to optimisation.
              </p>
            </FadeUp>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
                    className="group block bg-[#faf6ff] border border-[#ece6f5] rounded-2xl p-6 hover:bg-[#f3e8ff] hover:border-[#c084fc] hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-[#1a0a2e] group-hover:text-[#7030A0] transition-colors" style={{ fontFamily: "'Raleway', sans-serif" }}>{s.title}</h3>
                      <span className="text-[#c084fc] font-mono text-xs opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                    </div>
                    <p className="text-sm text-[#555] leading-relaxed" style={{ fontFamily: "'Poppins', sans-serif" }}>{s.desc}</p>
                  </Link>
                </FadeUp>
              ))}
            </div>
          </div>
        </section>

        {/* ── TECH STACK ───────────────────────────────────────────────────── */}
        <section id="stack" className="py-32 px-6 bg-[#faf6ff]">
          <div className="mx-auto max-w-5xl text-center">
            <FadeUp>
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#7030A0] bg-[#f3e8ff] px-4 py-2 rounded-full" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Tech stack
              </span>
              <h2 className="text-5xl font-black mt-6 mb-4" style={{ fontFamily: "'Raleway', sans-serif" }}>
                Modern. <span className="shimmer-text">Production-grade.</span>
              </h2>
              <p className="text-[#555] text-lg mb-12" style={{ fontFamily: "'Poppins', sans-serif" }}>
                FastAPI + Next.js 14 + PostgreSQL 16 — async all the way down, repository pattern, Alembic migrations, Docker + Helm.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {stack.map((s) => (
                  <span key={s}
                    className="px-4 py-2 bg-white border border-[#ece6f5] text-[#1a0a2e] rounded-full text-sm font-semibold hover:bg-[#f3e8ff] hover:border-[#c084fc] transition-colors cursor-default"
                    style={{ fontFamily: "'Poppins', sans-serif" }}>
                    {s}
                  </span>
                ))}
              </div>
            </FadeUp>
          </div>
        </section>

        {/* ── OPEN SOURCE CTA ──────────────────────────────────────────────── */}
        <section className="py-32 px-6 bg-[#0d0618] relative overflow-hidden">
          <div className="absolute inset-0 dot-grid opacity-40" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[280px] bg-[#7030A0] opacity-20 blur-[120px] rounded-full" />
          <FadeUp className="relative mx-auto max-w-3xl text-center">
            <h2 className="text-5xl md:text-6xl font-black text-white mb-6" style={{ fontFamily: "'Raleway', sans-serif" }}>
              100% <span className="shimmer-text">open source.</span>
            </h2>
            <p className="text-white/60 text-lg mb-10 leading-relaxed" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Fork it, extend it, self-host it. Full FastAPI backend, Next.js frontend, Helm chart —
              every line is on GitHub. PRs welcome.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a
                href="https://github.com/dclawstack/dclaw-migrate"
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-white font-bold text-sm transition-all hover:scale-105 hover:shadow-lg hover:shadow-purple-900"
                style={{ background: PURPLE, fontFamily: "'Poppins', sans-serif" }}
              >
                <GithubIcon className="w-5 h-5" /> View on GitHub
              </a>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-white font-bold text-sm border border-white/20 hover:bg-white/10 transition-all"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                Open app →
              </Link>
            </div>
          </FadeUp>
        </section>

        {/* ── FOOTER ───────────────────────────────────────────────────────── */}
        <footer className="bg-[#080410] border-t border-white/10 px-6 pt-20 pb-10">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col md:flex-row justify-between gap-10 mb-16">
              <div className="max-w-xs">
                <div className="flex items-center gap-1 mb-4" style={{ fontFamily: "'Raleway', sans-serif" }}>
                  <span className="text-2xl font-black text-[#7030A0]">DClaw</span>
                  <span className="text-2xl font-semibold text-white"> Migrate</span>
                </div>
                <p className="text-white/40 text-sm leading-relaxed mb-6" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  AI-guided cloud &amp; database migration. Plan, execute, validate, and roll back.
                  Part of the DClaw platform stack.
                </p>
                <a
                  href="https://github.com/dclawstack/dclaw-migrate"
                  target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/8 border border-white/15 inline-flex items-center justify-center text-white/60 hover:text-white hover:bg-white/15 transition-colors"
                >
                  <GithubIcon className="w-4 h-4" />
                </a>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {Object.entries(footerLinks).map(([col, links]) => (
                  <div key={col}>
                    <h4 className="text-white text-xs font-bold tracking-widest uppercase mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>{col}</h4>
                    <ul className="space-y-2.5">
                      {links.map((l) => (
                        <li key={l.label}>
                          {l.href.startsWith("http") ? (
                            <a href={l.href} target="_blank" rel="noopener noreferrer"
                              className="text-white/40 hover:text-white/80 text-sm transition-colors" style={{ fontFamily: "'Poppins', sans-serif" }}>
                              {l.label}
                            </a>
                          ) : (
                            <Link href={l.href}
                              className="text-white/40 hover:text-white/80 text-sm transition-colors" style={{ fontFamily: "'Poppins', sans-serif" }}>
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

            <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-white/30 text-xs" style={{ fontFamily: "'Poppins', sans-serif" }}>
                © {new Date().getFullYear()} DClaw Migrate · Built on the DClaw Stack · MIT License
              </p>
              <div className="flex gap-6">
                {[
                  { label: "REVISED-PRD",  href: "https://github.com/dclawstack/dclaw-migrate/blob/main/REVISED-PRD.md" },
                  { label: "PLAN v1.2",    href: "https://github.com/dclawstack/dclaw-migrate/blob/main/PLAN-v1.2.md" },
                  { label: "Issues",       href: "https://github.com/dclawstack/dclaw-migrate/issues" },
                ].map((l) => (
                  <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer"
                    className="text-white/30 hover:text-white/60 text-xs transition-colors font-mono" style={{ fontFamily: "'Poppins', sans-serif" }}>
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
        <div className="max-w-[80%] rounded-2xl rounded-br-sm px-3.5 py-2.5 text-sm text-white shadow-sm whitespace-pre-wrap"
          style={{ background: PURPLE, fontFamily: "'Poppins', sans-serif" }}>
          {children}
        </div>
      </div>
    );
  }
  return (
    <div className="flex justify-start">
      <div className={`max-w-[88%] rounded-2xl rounded-bl-sm bg-white/8 border border-white/10 px-3.5 py-2.5 text-sm text-white/80 whitespace-pre-wrap ${loading ? "animate-pulse" : ""}`}
        style={{ fontFamily: "'Poppins', sans-serif" }}>
        {children}
      </div>
    </div>
  );
}
