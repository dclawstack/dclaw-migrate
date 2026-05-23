import Link from "next/link";
import {
  Sparkles,
  Database,
  Workflow,
  ShieldCheck,
  Boxes,
  Activity,
  Cloud,
  Container,
  ArrowRight,
  Zap,
  CheckCircle2,
  Github,
  ScrollText,
  TestTube2,
  GitMerge,
  TrendingDown,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* ─── Marketing Nav ──────────────────────────────────────────────── */}
      <header className="absolute inset-x-0 top-0 z-50">
        <nav className="mx-auto max-w-7xl flex items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">DClaw Migrate</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-600">
            <a href="#features" className="hover:text-amber-500 transition-colors">Features</a>
            <a href="#lifecycle" className="hover:text-amber-500 transition-colors">How it works</a>
            <a href="#ai" className="hover:text-amber-500 transition-colors">AI</a>
            <a href="#stack" className="hover:text-amber-500 transition-colors">Stack</a>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
          >
            Open app <ArrowRight className="w-4 h-4" />
          </Link>
        </nav>
      </header>

      {/* ─── Hero ───────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-32 pb-24 md:pt-44 md:pb-32">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-50 via-orange-50/30 to-white pointer-events-none" />
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[60rem] h-[40rem] bg-gradient-to-br from-amber-200/40 via-orange-300/20 to-transparent blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-6xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-100/80 px-4 py-1.5 text-sm text-amber-800 ring-1 ring-amber-200 mb-8">
            <Sparkles className="w-4 h-4" />
            AI-native migration platform
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05]">
            Migrate anything,
            <br />
            <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 bg-clip-text text-transparent">
              guided by AI.
            </span>
          </h1>

          <p className="mt-8 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Plan, execute, validate, and roll back database and cloud migrations with an AI
            copilot at every step. From discovery to cutover to optimization — all in one workspace.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 hover:scale-105 transition-all"
            >
              Get started <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="https://github.com/dclawstack/dclaw-migrate"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-white border border-gray-200 px-7 py-3.5 text-base font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Github className="w-5 h-5" /> View on GitHub
            </a>
          </div>

          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {[
              { v: "60+", l: "API endpoints" },
              { v: "11", l: "Domain entities" },
              { v: "12", l: "AI features" },
              { v: "0", l: "Lines of mock data" },
            ].map((s) => (
              <div key={s.l} className="text-center">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-br from-amber-500 to-orange-600 bg-clip-text text-transparent">
                  {s.v}
                </div>
                <div className="mt-1 text-sm text-gray-500">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Core Features ──────────────────────────────────────────────── */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-16">
            <p className="text-amber-500 font-semibold text-sm uppercase tracking-wider mb-3">
              Core capabilities
            </p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Everything you need for a safe migration
            </h2>
            <p className="mt-5 text-lg text-gray-600 max-w-2xl mx-auto">
              From schema discovery to cutover rollback — covered end-to-end with AI assistance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard icon={<Sparkles className="w-6 h-6" />} title="AI Migration Copilot"
              desc="Context-aware chat that knows your job, schema, and connection types. Suggests next actions and surfaces risks before you hit them." tag="P0" />
            <FeatureCard icon={<Database className="w-6 h-6" />} title="Schema Auto-Discovery"
              desc="Connect a source DB and we'll enumerate tables, columns, and types — then propose target mappings with conversion rules." tag="P0" />
            <FeatureCard icon={<Workflow className="w-6 h-6" />} title="Wave Planning"
              desc="Group migrations into ordered waves. AI suggests groupings based on dependencies and risk balance to minimize downtime." tag="P0" />
            <FeatureCard icon={<ShieldCheck className="w-6 h-6" />} title="Data Validation"
              desc="Row-count and checksum reconciliation after migration. Catch drift before it hits production." tag="P0" />
            <FeatureCard icon={<TestTube2 className="w-6 h-6" />} title="AI Test Generation"
              desc="Generate validation test cases per table automatically. Execute against source and target, get pass/fail per case." tag="P1" />
            <FeatureCard icon={<GitMerge className="w-6 h-6" />} title="Cutover Management"
              desc="Blue-green, rolling, or in-place cutover with a built-in state machine. One-click rollback if anything looks wrong." tag="P1" />
            <FeatureCard icon={<TrendingDown className="w-6 h-6" />} title="Post-Migration Optimization"
              desc="AI analyzes your migrated workload and recommends cost, performance, and reliability improvements." tag="P1" />
            <FeatureCard icon={<Boxes className="w-6 h-6" />} title="Application Assets"
              desc="Track every service, DB, and API across your fleet. Pick from 6 migration strategies per asset with effort estimates." tag="P1" />
            <FeatureCard icon={<ScrollText className="w-6 h-6" />} title="Runbook Generation"
              desc="AI writes pre-migration, cutover, rollback, and post-migration runbooks tailored to your specific job." tag="P2" />
            <FeatureCard icon={<Cloud className="w-6 h-6" />} title="Multi-Cloud Strategy"
              desc="Compare AWS, GCP, and Azure for any workload. Get cost estimates and lock-in risk analysis." tag="P2" />
            <FeatureCard icon={<Container className="w-6 h-6" />} title="Containerization Plans"
              desc="Generate production Dockerfiles and Kubernetes manifests for legacy VMs, with health checks and resource limits." tag="P2" />
            <FeatureCard icon={<Activity className="w-6 h-6" />} title="Execution Logs"
              desc="Every action — discovery, validation, cutover — is logged with timestamp and severity. Audit trail by default." tag="P0" />
          </div>
        </div>
      </section>

      {/* ─── Lifecycle ──────────────────────────────────────────────────── */}
      <section id="lifecycle" className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-16">
            <p className="text-amber-500 font-semibold text-sm uppercase tracking-wider mb-3">
              How it works
            </p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              The migration lifecycle, automated
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { n: "01", t: "Connect", d: "Register source and target databases. Test connectivity in one click.", icon: <Database className="w-6 h-6" /> },
              { n: "02", t: "Discover", d: "AI introspects your schema and proposes table-by-table mappings with type conversions.", icon: <Sparkles className="w-6 h-6" /> },
              { n: "03", t: "Migrate", d: "Group jobs into waves, plan cutover strategy, execute with state machine guards.", icon: <Workflow className="w-6 h-6" /> },
              { n: "04", t: "Validate", d: "Row counts, checksums, AI-generated tests. Auto-rollback if validation fails.", icon: <ShieldCheck className="w-6 h-6" /> },
            ].map((step, i) => (
              <div key={step.n} className="relative">
                <div className="rounded-2xl bg-white border border-gray-200 p-6 h-full hover:border-amber-300 hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl font-bold text-gray-200">{step.n}</span>
                    <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">{step.icon}</div>
                  </div>
                  <h3 className="text-lg font-bold mb-2">{step.t}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{step.d}</p>
                </div>
                {i < 3 && <ArrowRight className="hidden lg:block absolute top-1/2 -right-5 -translate-y-1/2 w-6 h-6 text-amber-300" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── AI Deep Dive ───────────────────────────────────────────────── */}
      <section id="ai" className="py-24 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-amber-400 font-semibold text-sm uppercase tracking-wider mb-3">AI Copilot</p>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                Migration expertise,<br />on every screen.
              </h2>
              <p className="text-lg text-gray-300 leading-relaxed mb-8">
                The Copilot floats on every page. It knows the migration job you&apos;re looking at,
                what databases are involved, and what tables you&apos;re mapping. Ask anything —
                from &quot;why did this validation fail?&quot; to &quot;generate a rollback runbook for this job.&quot;
              </p>
              <ul className="space-y-3">
                {[
                  "Context-aware — knows your active job and schema",
                  "Streams structured outputs (mappings, test cases, runbooks)",
                  "Powered by OpenRouter (Kimi K2, GPT-4, Claude — your pick)",
                  "Falls back to local Ollama when cloud is unavailable",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-200">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative">
              <div className="rounded-2xl bg-gray-800/80 border border-gray-700 backdrop-blur-sm shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-white" />
                    <span className="text-white font-semibold text-sm">DClaw Migrate Copilot</span>
                  </div>
                  <span className="text-amber-100 text-xs">Context: current job</span>
                </div>
                <div className="p-4 space-y-3 bg-gray-900/50">
                  <ChatBubble role="user">
                    What are the top risks of migrating users from MySQL to Postgres?
                  </ChatBubble>
                  <ChatBubble role="assistant">
                    Top risks: (1) AUTO_INCREMENT → SERIAL semantics, (2) UTF-8mb4 → utf8 collation
                    drift, (3) zero-date handling in legacy rows. Mitigation: pre-convert
                    timestamps, audit constraint names, dual-write during cutover.
                  </ChatBubble>
                  <ChatBubble role="user">Generate a rollback runbook.</ChatBubble>
                  <ChatBubble role="assistant" loading>Drafting your rollback procedure…</ChatBubble>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Tech Stack ─────────────────────────────────────────────────── */}
      <section id="stack" className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-16">
            <p className="text-amber-500 font-semibold text-sm uppercase tracking-wider mb-3">
              Built on solid foundations
            </p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Modern stack, no shortcuts</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              { name: "Next.js 14", desc: "App Router, RSC" },
              { name: "FastAPI", desc: "Async Python 3.11" },
              { name: "PostgreSQL 16", desc: "asyncpg + SQLAlchemy 2" },
              { name: "Pydantic v2", desc: "Schema validation" },
              { name: "Alembic", desc: "Schema migrations" },
              { name: "OpenRouter", desc: "Multi-model LLM gateway" },
              { name: "Tailwind CSS", desc: "Utility-first styling" },
              { name: "Vercel", desc: "Edge deployment" },
            ].map((tech) => (
              <div key={tech.name} className="rounded-xl border border-gray-200 bg-white p-5 hover:border-amber-300 hover:shadow-md transition-all">
                <p className="font-semibold text-gray-900">{tech.name}</p>
                <p className="text-xs text-gray-500 mt-1">{tech.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ───────────────────────────────────────────────────────── */}
      <section className="py-24 bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 text-white relative overflow-hidden">
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <Zap className="w-12 h-12 mx-auto mb-6 text-white" />
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Ready to migrate, faster.
          </h2>
          <p className="text-lg text-amber-50 mb-10 max-w-2xl mx-auto">
            Skip the spreadsheets and tribal knowledge. Let an AI copilot guide every step
            from first connection to final cutover.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-base font-semibold text-amber-600 shadow-lg hover:scale-105 transition-transform"
            >
              Launch dashboard <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="https://github.com/dclawstack/dclaw-migrate"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-white/30 px-7 py-3.5 text-base font-semibold text-white hover:bg-white/10 transition-colors"
            >
              <Github className="w-5 h-5" /> Star on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* ─── Footer ─────────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-200 bg-gray-50 py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-gray-700">DClaw Migrate</span>
              <span className="text-sm text-gray-400">— part of the DClaw stack</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <Link href="/dashboard" className="hover:text-amber-500 transition-colors">Dashboard</Link>
              <Link href="/connections" className="hover:text-amber-500 transition-colors">Connections</Link>
              <Link href="/jobs" className="hover:text-amber-500 transition-colors">Jobs</Link>
              <a href="https://github.com/dclawstack/dclaw-migrate" target="_blank" rel="noopener noreferrer"
                className="hover:text-amber-500 transition-colors flex items-center gap-1">
                <Github className="w-4 h-4" /> GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ── Components ───────────────────────────────────────────────────────────────

function FeatureCard({
  icon, title, desc, tag,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  tag: "P0" | "P1" | "P2";
}) {
  const tagColors = {
    P0: "bg-amber-100 text-amber-700",
    P1: "bg-orange-100 text-orange-700",
    P2: "bg-gray-100 text-gray-600",
  };
  return (
    <div className="group rounded-2xl bg-white border border-gray-200 p-6 hover:border-amber-300 hover:shadow-xl hover:-translate-y-1 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-md ${tagColors[tag]}`}>{tag}</span>
      </div>
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
    </div>
  );
}

function ChatBubble({
  role, children, loading,
}: {
  role: "user" | "assistant";
  children: React.ReactNode;
  loading?: boolean;
}) {
  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-gradient-to-br from-amber-500 to-orange-500 px-3 py-2 text-sm text-white shadow-sm">
          {children}
        </div>
      </div>
    );
  }
  return (
    <div className="flex justify-start">
      <div className={`max-w-[85%] rounded-2xl rounded-bl-sm bg-gray-700/60 border border-gray-600/50 px-3 py-2 text-sm text-gray-100 ${loading ? "animate-pulse" : ""}`}>
        {children}
      </div>
    </div>
  );
}
