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
  ChevronRight,
  Terminal,
  Lock,
  BarChart3,
  Layers,
} from "lucide-react";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 antialiased">

      {/* ── Nav ────────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/80 backdrop-blur-md">
        <nav className="mx-auto max-w-7xl flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
              <Sparkles className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="font-bold text-[17px] tracking-tight">DClaw Migrate</span>
          </div>

          <div className="hidden md:flex items-center gap-7 text-sm text-gray-600">
            <a href="#features" className="hover:text-amber-500 transition-colors">Features</a>
            <a href="#lifecycle" className="hover:text-amber-500 transition-colors">How it works</a>
            <a href="#ai" className="hover:text-amber-500 transition-colors">AI Copilot</a>
            <a href="#p1" className="hover:text-amber-500 transition-colors flex items-center gap-1">
              What&apos;s new
              <span className="text-[10px] font-semibold bg-amber-500 text-white rounded-full px-1.5 py-0.5 leading-none">v1.1</span>
            </a>
            <a href="#stack" className="hover:text-amber-500 transition-colors">Stack</a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors shadow-sm"
            >
              Open app <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </nav>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-24 pb-28 md:pt-36 md:pb-36">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-50/60 via-orange-50/20 to-white pointer-events-none" />
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[72rem] h-[44rem] bg-gradient-to-br from-amber-200/30 via-orange-200/20 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-0 w-64 h-64 bg-orange-300/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative mx-auto max-w-6xl px-6">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-100/80 px-4 py-1.5 text-sm font-medium text-amber-800 ring-1 ring-amber-200 mb-8">
              <Sparkles className="w-3.5 h-3.5" />
              AI-native cloud & database migration platform
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.04]">
              Migrate anything,
              <br />
              <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 bg-clip-text text-transparent">
                guided by AI.
              </span>
            </h1>

            <p className="mt-7 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Plan, execute, validate, and roll back database and cloud migrations with an AI
              copilot at every step. From discovery to cutover to post-migration optimization
              — one workspace for the full lifecycle.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/35 hover:scale-[1.02] transition-all"
              >
                Start migrating <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="https://github.com/dclawstack/dclaw-migrate"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-white border border-gray-200 px-7 py-3.5 text-base font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
              >
                <Github className="w-5 h-5" /> View on GitHub
              </a>
            </div>

            <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
              {[
                { v: "9", l: "App pages", sub: "full UI coverage" },
                { v: "13", l: "AI endpoints", sub: "copilot + automation" },
                { v: "60+", l: "API routes", sub: "all DB-backed" },
                { v: "4", l: "Migration tiers", sub: "P0–P2 complete" },
              ].map((s) => (
                <div key={s.l} className="text-center">
                  <div className="text-4xl md:text-5xl font-extrabold bg-gradient-to-br from-amber-500 to-orange-600 bg-clip-text text-transparent">
                    {s.v}
                  </div>
                  <div className="mt-1 text-sm font-semibold text-gray-700">{s.l}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{s.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust bar ──────────────────────────────────────────────────────── */}
      <div className="border-y border-gray-100 bg-gray-50 py-5">
        <div className="mx-auto max-w-5xl px-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm text-gray-400">
          <span className="font-medium text-gray-500">Inspired by battle-tested tools:</span>
          {["CloudEndure", "Azure Migrate", "AWS MGN", "Turbonomic", "pgloader"].map((t) => (
            <span key={t} className="font-medium text-gray-500 hover:text-amber-500 transition-colors">{t}</span>
          ))}
        </div>
      </div>

      {/* ── P0 Features ────────────────────────────────────────────────────── */}
      <section id="features" className="py-28 bg-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-16">
            <SectionLabel>Core capabilities</SectionLabel>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mt-3">
              Everything you need for a safe migration
            </h2>
            <p className="mt-5 text-lg text-gray-500 max-w-2xl mx-auto">
              Schema discovery to cutover rollback — end-to-end with AI at every step.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <FeatureCard icon={<Sparkles />} title="AI Migration Copilot" tag="P0"
              desc="Context-aware chat that knows your job, schema, and connection types. Suggests next actions and surfaces risks before you hit them." />
            <FeatureCard icon={<Database />} title="Schema Auto-Discovery" tag="P0"
              desc="Connect a source DB, enumerate tables and types, then auto-propose target mappings with conversion rules — no manual column mapping." />
            <FeatureCard icon={<Workflow />} title="Wave Planning" tag="P0"
              desc="Group migrations into ordered waves. AI suggests groupings based on dependency graphs and risk scores to minimize downtime." />
            <FeatureCard icon={<ShieldCheck />} title="Data Validation" tag="P0"
              desc="Row-count and checksum reconciliation after migration. Catch drift before it reaches production with automated integrity checks." />
            <FeatureCard icon={<Activity />} title="Execution Logs" tag="P0"
              desc="Every action — discovery, validation, cutover — is timestamped and severity-tagged. Full audit trail out of the box." />
            <FeatureCard icon={<Boxes />} title="Application Assets" tag="P0"
              desc="Track every service, DB, and API across your fleet. Choose from 6 migration strategies per asset with AI-generated effort estimates." />
          </div>
        </div>
      </section>

      {/* ── P1 "What's New" ────────────────────────────────────────────────── */}
      <section id="p1" className="py-28 bg-gradient-to-b from-amber-50/40 to-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-4 py-1.5 text-sm font-semibold text-white mb-4">
              <Zap className="w-3.5 h-3.5" /> New in v1.1
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mt-2">
              Advanced migration controls
            </h2>
            <p className="mt-5 text-lg text-gray-500 max-w-2xl mx-auto">
              The full P1 feature tier is now live — cutover orchestration, AI testing,
              cost optimization, and auto-generated runbooks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <P1Card
              icon={<GitMerge className="w-7 h-7" />}
              title="Cutover Management"
              href="/cutover"
              desc="Blue-green, rolling, or in-place cutover with a built-in state machine. Execute, validate, and roll back in one click. AI reviews your plan before you pull the trigger."
              bullets={["Execute / Complete / Rollback actions", "AI pre-flight plan review", "Cutover status timeline"]}
            />
            <P1Card
              icon={<TestTube2 className="w-7 h-7" />}
              title="AI Testing & Validation"
              href="/testing"
              desc="Generate 100+ validation test cases per migration job automatically. Run them in parallel against source and target. Get pass/fail/skipped scoreboard per run."
              bullets={["AI-generated test cases per job", "Run-all with live score card", "Regression detection built in"]}
            />
            <P1Card
              icon={<TrendingDown className="w-7 h-7" />}
              title="Post-Migration Optimization"
              href="/optimization"
              desc="AI analyzes your migrated workload and generates prioritized recommendations for cost reduction, performance tuning, and reliability improvements."
              bullets={["Right-sizing recommendations", "Estimated savings per rec", "Apply / Dismiss workflow"]}
            />
            <P1Card
              icon={<ScrollText className="w-7 h-7" />}
              title="Runbook Generation"
              href="/runbooks"
              desc="AI writes pre-migration, cutover, rollback, post-migration, and validation runbooks tailored to your specific job context and database types."
              bullets={["5 runbook types per job", "Full-text, human-readable SOPs", "Export-ready format"]}
            />
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <FeatureCard icon={<Cloud />} title="Multi-Cloud Strategy" tag="P2"
              desc="Compare AWS, GCP, and Azure for any workload. Get cost estimates and vendor lock-in risk analysis from AI." />
            <FeatureCard icon={<Container />} title="Containerization Plans" tag="P2"
              desc="Generate production Dockerfiles and Kubernetes manifests for legacy VMs, with health checks, resource limits, and K8s deployment YAMLs." />
          </div>
        </div>
      </section>

      {/* ── Lifecycle ──────────────────────────────────────────────────────── */}
      <section id="lifecycle" className="py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-16">
            <SectionLabel>How it works</SectionLabel>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mt-3">
              The full migration lifecycle
            </h2>
            <p className="mt-5 text-lg text-gray-500 max-w-xl mx-auto">
              From first connection to post-migration optimisation — every step is tracked, logged, and AI-assisted.
            </p>
          </div>

          <div className="relative">
            <div className="hidden lg:block absolute top-12 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { n: "01", t: "Connect", d: "Register source and target databases. Test connectivity, check permissions, and confirm reachability in one click.", icon: <Database className="w-6 h-6" />, href: "/connections" },
                { n: "02", t: "Discover", d: "AI introspects your schema, proposes table-by-table mappings with type conversions, and flags compatibility issues.", icon: <Sparkles className="w-6 h-6" />, href: "/jobs" },
                { n: "03", t: "Execute", d: "Group jobs into waves, pick your cutover strategy, then execute with state-machine guards and full rollback support.", icon: <Workflow className="w-6 h-6" />, href: "/waves" },
                { n: "04", t: "Optimise", d: "Row counts, checksums, AI-generated tests. Then right-size resources and generate runbooks for the ops team.", icon: <BarChart3 className="w-6 h-6" />, href: "/optimization" },
              ].map((step, i) => (
                <Link key={step.n} href={step.href}
                  className="group relative rounded-2xl bg-white border border-gray-200 p-6 hover:border-amber-300 hover:shadow-xl hover:-translate-y-1 transition-all">
                  <span className="absolute top-5 right-5 text-4xl font-extrabold text-gray-100 group-hover:text-amber-100 transition-colors select-none">
                    {step.n}
                  </span>
                  <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    {step.icon}
                  </div>
                  <h3 className="text-lg font-bold mb-2">{step.t}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{step.d}</p>
                  <div className="mt-4 flex items-center gap-1 text-xs font-medium text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    Go to {step.t} <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── AI Copilot ─────────────────────────────────────────────────────── */}
      <section id="ai" className="py-28 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-900 text-white relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[32rem] h-[32rem] bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <SectionLabel light>AI Copilot</SectionLabel>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mt-3 mb-6">
                Migration expertise,<br />on every screen.
              </h2>
              <p className="text-lg text-gray-300 leading-relaxed mb-8">
                The Copilot floats on every page. It knows the migration job you&apos;re viewing,
                the databases involved, and the tables you&apos;re mapping. Ask anything — from
                &quot;why did this validation fail?&quot; to &quot;write a rollback runbook for this job.&quot;
              </p>
              <ul className="space-y-4">
                {[
                  { icon: <Sparkles className="w-4 h-4" />, text: "Context-aware — sees your active job, schema, and status" },
                  { icon: <Terminal className="w-4 h-4" />, text: "Streams structured outputs: mappings, tests, runbooks" },
                  { icon: <Layers className="w-4 h-4" />, text: "OpenRouter primary (Kimi K2 default), any model configurable" },
                  { icon: <Lock className="w-4 h-4" />, text: "Falls back to local Ollama when cloud is unavailable" },
                ].map(({ icon, text }) => (
                  <li key={text} className="flex items-start gap-3">
                    <span className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center">
                      {icon}
                    </span>
                    <span className="text-gray-200">{text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Chat mockup */}
            <div className="relative">
              <div className="rounded-2xl bg-gray-800/70 border border-gray-700/80 backdrop-blur-sm shadow-2xl overflow-hidden">
                {/* header */}
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-white" />
                    <span className="text-white font-semibold text-sm">DClaw Migrate Copilot</span>
                  </div>
                  <span className="text-amber-100 text-xs bg-amber-600/40 rounded px-2 py-0.5">Context: MySQL → Postgres</span>
                </div>
                {/* messages */}
                <div className="p-4 space-y-3">
                  <ChatBubble role="user">What are the top risks migrating users from MySQL to Postgres?</ChatBubble>
                  <ChatBubble role="assistant">
                    Top 3 risks:{"\n"}
                    1. AUTO_INCREMENT → SERIAL semantics — sequences start at 1, check for gaps{"\n"}
                    2. UTF-8mb4 vs utf8 collation drift — review text columns with emoji data{"\n"}
                    3. Zero-date handling — MySQL allows &#39;0000-00-00&#39;, Postgres rejects it{"\n\n"}
                    Mitigation: pre-convert timestamps, dual-write during cutover window, run the checksum validator post-load.
                  </ChatBubble>
                  <ChatBubble role="user">Generate a pre-migration runbook.</ChatBubble>
                  <ChatBubble role="assistant" loading>Drafting your runbook…</ChatBubble>
                </div>
                {/* input */}
                <div className="border-t border-gray-700 px-4 py-3 flex gap-2 bg-gray-900/50">
                  <div className="flex-1 rounded-lg bg-gray-700/60 border border-gray-600/50 px-3 py-2 text-sm text-gray-400">
                    Ask about your migration…
                  </div>
                  <button className="px-3 py-2 rounded-lg bg-amber-500 text-white text-sm font-medium">Send</button>
                </div>
              </div>
              {/* floating badge */}
              <div className="absolute -bottom-4 -right-4 bg-white rounded-xl shadow-xl px-4 py-3 flex items-center gap-2.5 border border-gray-100">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-gray-800">42 tests passed</p>
                  <p className="text-[11px] text-gray-400">validation complete</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Comparison ─────────────────────────────────────────────────────── */}
      <section className="py-28 bg-gray-50">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center mb-14">
            <SectionLabel>Why DClaw Migrate</SectionLabel>
            <h2 className="text-4xl font-bold tracking-tight mt-3">Beats the spreadsheet approach</h2>
          </div>
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-4 font-semibold text-gray-500 w-1/3">Feature</th>
                  <th className="px-6 py-4 font-semibold text-gray-500 text-center">Manual / spreadsheets</th>
                  <th className="px-6 py-4 font-bold text-amber-600 text-center bg-amber-50/50">DClaw Migrate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  ["Schema mapping", "Weeks of manual work", "AI-generated in minutes"],
                  ["Test generation", "Hand-written, incomplete", "100+ cases per job, automated"],
                  ["Cutover playbook", "Wiki page, often stale", "Live runbook, AI-authored"],
                  ["Rollback plan", "Hope it works", "1-click, state-machine guarded"],
                  ["Cost optimisation", "Forgotten post-migration", "AI recommendations, ongoing"],
                  ["Audit trail", "Slack messages", "Every action logged & searchable"],
                ].map(([feat, manual, dclaw]) => (
                  <tr key={feat} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3.5 font-medium text-gray-700">{feat}</td>
                    <td className="px-6 py-3.5 text-center text-gray-400">{manual}</td>
                    <td className="px-6 py-3.5 text-center text-amber-600 font-medium bg-amber-50/30">{dclaw}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Tech Stack ─────────────────────────────────────────────────────── */}
      <section id="stack" className="py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-14">
            <SectionLabel>Built on solid foundations</SectionLabel>
            <h2 className="text-4xl font-bold tracking-tight mt-3">Modern stack, no shortcuts</h2>
            <p className="mt-4 text-gray-500 max-w-xl mx-auto">
              Every component chosen for production readiness and async-first performance.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              { name: "Next.js 14", desc: "App Router + Server Components" },
              { name: "FastAPI", desc: "Async Python 3.11, Pydantic v2" },
              { name: "PostgreSQL 16", desc: "asyncpg + SQLAlchemy 2.0" },
              { name: "Alembic", desc: "Versioned schema migrations" },
              { name: "OpenRouter", desc: "Multi-model LLM gateway" },
              { name: "Ollama", desc: "Local LLM fallback (llama3)" },
              { name: "Tailwind CSS", desc: "shadcn/ui components" },
              { name: "Vercel", desc: "Edge deployment, CI/CD" },
            ].map((tech) => (
              <div key={tech.name}
                className="rounded-xl border border-gray-200 bg-white p-5 hover:border-amber-300 hover:shadow-lg transition-all cursor-default">
                <p className="font-bold text-gray-900">{tech.name}</p>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">{tech.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────────── */}
      <section className="py-28 bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.12),transparent_60%)]" />
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <Zap className="w-12 h-12 mx-auto mb-6 text-white opacity-90" />
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
            Ready to migrate, faster.
          </h2>
          <p className="text-lg text-amber-50 mb-10 max-w-2xl mx-auto leading-relaxed">
            Skip the spreadsheets and tribal knowledge. An AI copilot guides every step from
            first connection to final cutover — then keeps optimising after you land.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-base font-semibold text-amber-600 shadow-lg hover:scale-105 hover:shadow-xl transition-all"
            >
              Launch dashboard <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="https://github.com/dclawstack/dclaw-migrate"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-white/40 px-7 py-3.5 text-base font-semibold text-white hover:bg-white/10 transition-colors"
            >
              <Github className="w-5 h-5" /> Star on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-200 bg-gray-50 py-14">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-gray-800">DClaw Migrate</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                AI-guided cloud & database migration. Part of the DClaw platform stack.
              </p>
            </div>

            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Core</p>
              <ul className="space-y-2.5 text-sm text-gray-600">
                <li><Link href="/dashboard" className="hover:text-amber-500 transition-colors">Dashboard</Link></li>
                <li><Link href="/connections" className="hover:text-amber-500 transition-colors">Connections</Link></li>
                <li><Link href="/jobs" className="hover:text-amber-500 transition-colors">Migration Jobs</Link></li>
                <li><Link href="/waves" className="hover:text-amber-500 transition-colors">Wave Planning</Link></li>
                <li><Link href="/assets" className="hover:text-amber-500 transition-colors">Assets</Link></li>
              </ul>
            </div>

            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Advanced</p>
              <ul className="space-y-2.5 text-sm text-gray-600">
                <li>
                  <Link href="/cutover" className="hover:text-amber-500 transition-colors flex items-center gap-1.5">
                    Cutover Management
                    <span className="text-[10px] bg-amber-100 text-amber-600 font-semibold rounded px-1">New</span>
                  </Link>
                </li>
                <li>
                  <Link href="/testing" className="hover:text-amber-500 transition-colors flex items-center gap-1.5">
                    Testing & Validation
                    <span className="text-[10px] bg-amber-100 text-amber-600 font-semibold rounded px-1">New</span>
                  </Link>
                </li>
                <li>
                  <Link href="/optimization" className="hover:text-amber-500 transition-colors flex items-center gap-1.5">
                    Optimization
                    <span className="text-[10px] bg-amber-100 text-amber-600 font-semibold rounded px-1">New</span>
                  </Link>
                </li>
                <li>
                  <Link href="/runbooks" className="hover:text-amber-500 transition-colors flex items-center gap-1.5">
                    Runbooks
                    <span className="text-[10px] bg-amber-100 text-amber-600 font-semibold rounded px-1">New</span>
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Project</p>
              <ul className="space-y-2.5 text-sm text-gray-600">
                <li>
                  <a href="https://github.com/dclawstack/dclaw-migrate" target="_blank" rel="noopener noreferrer"
                    className="hover:text-amber-500 transition-colors flex items-center gap-1.5">
                    <Github className="w-4 h-4" /> GitHub
                  </a>
                </li>
                <li><a href="https://dpanel.dclawstack.io" target="_blank" rel="noopener noreferrer" className="hover:text-amber-500 transition-colors">DPanel</a></li>
                <li><span className="text-gray-400">v1.1 — Tier 2</span></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
            <span>© {new Date().getFullYear()} DClaw Stack. Open-source infrastructure platform.</span>
            <span>Built with Next.js 14 · FastAPI · PostgreSQL 16</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ children, light }: { children: React.ReactNode; light?: boolean }) {
  return (
    <p className={`text-sm font-semibold uppercase tracking-widest ${light ? "text-amber-400" : "text-amber-500"}`}>
      {children}
    </p>
  );
}

function FeatureCard({
  icon, title, desc, tag,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  tag: "P0" | "P1" | "P2";
}) {
  const tagStyle = {
    P0: "bg-amber-100 text-amber-700",
    P1: "bg-orange-100 text-orange-700",
    P2: "bg-gray-100 text-gray-500",
  }[tag];

  return (
    <div className="group rounded-2xl bg-white border border-gray-200 p-6 hover:border-amber-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform [&>svg]:w-5 [&>svg]:h-5">
          {icon}
        </div>
        <span className={`text-xs font-semibold px-2 py-1 rounded-md ${tagStyle}`}>{tag}</span>
      </div>
      <h3 className="font-bold text-[17px] mb-2">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
    </div>
  );
}

function P1Card({
  icon, title, href, desc, bullets,
}: {
  icon: React.ReactNode;
  title: string;
  href: string;
  desc: string;
  bullets: string[];
}) {
  return (
    <Link href={href}
      className="group rounded-2xl bg-white border border-gray-200 p-7 hover:border-amber-300 hover:shadow-2xl hover:-translate-y-1 transition-all duration-200 flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20 group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <span className="text-xs font-semibold bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">P1 · New</span>
      </div>
      <h3 className="font-bold text-xl mb-3">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed mb-5 flex-1">{desc}</p>
      <ul className="space-y-2 mb-5">
        {bullets.map((b) => (
          <li key={b} className="flex items-center gap-2 text-sm text-gray-600">
            <CheckCircle2 className="w-4 h-4 text-amber-500 flex-shrink-0" />
            {b}
          </li>
        ))}
      </ul>
      <div className="flex items-center gap-1 text-sm font-semibold text-amber-500 group-hover:gap-2 transition-all">
        Open {title} <ChevronRight className="w-4 h-4" />
      </div>
    </Link>
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
        <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-gradient-to-br from-amber-500 to-orange-500 px-3.5 py-2.5 text-sm text-white shadow-sm whitespace-pre-wrap">
          {children}
        </div>
      </div>
    );
  }
  return (
    <div className="flex justify-start">
      <div className={`max-w-[88%] rounded-2xl rounded-bl-sm bg-gray-700/50 border border-gray-600/40 px-3.5 py-2.5 text-sm text-gray-100 whitespace-pre-wrap ${loading ? "animate-pulse" : ""}`}>
        {children}
      </div>
    </div>
  );
}
