# DClaw Migrate — Design System Reference

> Design system: One Convergence Vol. 01 · Purple `#7030A0`
> Last updated: 2026-06-01 · **v1.4**

---

## Brand Colors (OC Purple)

| Token | Hex | Usage |
|---|---|---|
| `--p500` / `--oc-purple` | `#7030A0` | Primary brand, buttons, accents |
| `--p700` / `--oc-purple-dark` | `#4A1F6C` | Wordmark, dark text, hover states |
| `--p300` / `--oc-purple-light` | `#B180F8` | Accent on dark backgrounds |
| `--p100` / `--oc-purple-100` | `#E7D8F4` | Borders on purple tinted cells |
| `--p50` / `--oc-purple-50` | `#F5EEFB` | Tag backgrounds, feature icons |
| `--p25` / `--oc-purple-25` | `#FAF6FD` | Section backgrounds, card fills |

## Semantic Colors

| Token | Hex | Usage |
|---|---|---|
| `--ok` / `--success` | `#10B981` | Validation passed, completed status |
| `--err` / `--error` | `#EF4444` | Validation failed, error status |
| `--info` | `#3B82F6` | Planned status, informational |
| `--purple` (accent) | `#8B5CF6` | Rolled-back status |
| `--ink` | `#141414` | Primary text |
| `--ink3` / `--ink-3` | `#5A5A5A` | Secondary text |
| `--ink4` / `--ink-4` | `#8A8A8A` | Muted text, labels |
| `--rule` | `#E5E5E5` | Borders, dividers |
| `--paper` | `#FFFFFF` | Background |

---

## Status Badge Palette (Job / Cutover states)

| Status | Background | Text | Border |
|---|---|---|---|
| `draft` | `#F6F5F7` | `#5A5A5A` | `#E5E5E5` |
| `running` | `#F5EEFB` | `#4A1F6C` | `#E7D8F4` |
| `completed` | `#ECFDF5` | `#065F46` | `#A7F3D0` |
| `failed` | `#FEF2F2` | `#991B1B` | `#FECACA` |
| `planned` | `#EFF6FF` | `#1E40AF` | `#BFDBFE` |
| `rolled_back` | `#F5F3FF` | `#5B21B6` | `#DDD6FE` |

---

## Typography

| Role | Font | Weight | Size | Letter-spacing |
|---|---|---|---|---|
| Display / H1 | Manrope | 800 | 80px (infograph) / 52–64px (deck) | -0.04em to -0.05em |
| Heading H2 | Manrope | 700 | 36–40px | -0.03em |
| Body | Inter | 400 | 14–15px | normal |
| Label / Eyebrow | JetBrains Mono | 400–600 | 9–11px | 0.10–0.15em (uppercase) |
| Code snippet | JetBrains Mono | 400 | 12px | normal |

**Tailwind classes (landing page):**
- H2: `text-5xl font-black md:text-6xl`
- Eyebrow pill: `rounded-full bg-accent px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-primary`
- Mono label: `font-mono text-xs text-primary`
- Body description: `text-lg text-muted-foreground`

---

## Component Tokens

### Cards (landing page)
```
rounded-2xl border border-border bg-card p-6
hover: border-primary shadow-lg -translate-y-1
```

### Feature icon (infographic)
```
width: 36px; height: 36px;
background: var(--p50); border: 1px solid var(--p100);
border-radius: 2px;
```

### Tag / Badge
```css
/* landing page */
rounded-full bg-primary px-2.5 py-1 font-mono text-[10px] text-primary-foreground
rounded-full bg-accent px-2 py-1 font-mono text-xs font-bold text-primary

/* infographic / deck */
background: var(--p50); color: var(--p700); border: 1px solid var(--p100);
padding: 3–4px 9–10px; border-radius: 2px;
```

### Progress bar (infographic)
```css
height: 6px; background: var(--rule);
.fill: background: var(--p500);
```

### Accent left bar (infographic)
```css
border-left: 3px solid var(--p500); padding-left: 14–16px;
```

---

## Slide Deck Dimensions

| Artifact | Dimensions | Format |
|---|---|---|
| Infographic | 1200px wide × variable height | `@page { size: 1200px 5600px }` |
| Slide deck | 1280px × 720px per slide | `@page { size: 1280px 720px }` |
| Slide break | `page-break-after: always; break-after: page` | PDF-safe |

---

## Section Background Pattern (Landing Page)

Alternating pattern used across all sections:

| Section | Background |
|---|---|
| Hero | `bg-white dot-grid` (radial dot pattern) |
| Marquee | `bg-secondary` |
| AI Features | `bg-white` |
| How It Works | `bg-secondary` |
| What's New (P1) | `bg-white` |
| AI Copilot | `bg-accent` |
| 9 Screens | `bg-white` |
| Tech Stack | `bg-secondary` |
| Open Source CTA | `bg-primary` |
| **Roadmap** | **`bg-white`** |
| Footer | `bg-secondary` |

Dot grid pattern:
```css
background-image: radial-gradient(circle, rgba(112,48,160,0.10) 1px, transparent 1px);
background-size: 28px 28px;
```

---

## Landing Page Animation System

```tsx
// FadeUp — scroll-triggered reveal
opacity: visible ? 1 : 0
transform: visible ? "translateY(0)" : "translateY(36px)"
transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`

// Float (hero card)
@keyframes float { 0%,100% { translateY(0) } 50% { translateY(-10px) } }
animation: float 5s ease-in-out infinite

// Marquee (tech strip)
@keyframes marquee { 0% { translateX(0) } 100% { translateX(-50%) } }
animation: marquee 35s linear infinite
```

---

## Infographic Sections (dclaw-migrate-infograph.html)

| Section | Background | Key content |
|---|---|---|
| 1 — Hero | `var(--ink)` dark | Title, 4 stats (64 endpoints / 12 models / 8 AI / 6 phases), tech tags |
| 2 — Platform overview | warm `#FAF8F4` | 4 feature cards with purple accent bars |
| 3 — AI capabilities | white | 4-col grid: 4 core (purple border) + 4 advanced (cool bg) |
| 4 — Migration lifecycle | `var(--ink)` dark | 6-phase horizontal strip + state machine |
| 5 — Tech stack | cool `#F6F5F7` | 4-col component cards + API surface tag cloud |
| 6 — Data model | white | 12-table reference table |
| 7 — Design system | warm | Color swatches, status badges, type scale |
| 8 — Footer | `var(--ink)` dark | Logo, 4 stats, port, copyright |

---

## Deck Slides (dclaw-migrate-deck.html — 14 slides)

| Slide | Title | Theme |
|---|---|---|
| 01 | Cover | Dark / ink |
| 02 | Agenda | Paper |
| 03 | Problem | Paper (cell-ink accent) |
| 04 | Solution | `--oc-purple-dark` background |
| 05 | Architecture | Paper |
| 06 | Migration Lifecycle | Paper (6-col grid) |
| 07 | State Machine + Schema Discovery | Cool |
| 08 | AI Features — core 5 | Paper |
| 09 | AI Features — advanced 4 | Dark / ink |
| 10 | Wave Planning | Paper |
| 11 | Cutover Management | Dark / ink |
| 12 | Deployment | Paper |
| 13 | Roadmap | Paper (v1.0 delivered + next) |
| 14 | Close | Dark / ink |

---

## Related Notes

- [[Migrate-Architecture]] — stack, ports, models, API surface, anti-patterns
- [[Migrate-v1.4-Roadmap]] — feature status, Sprint 0, next items
- [[Migrate-TestForge-2026-05-31]] — TestForge security/reliability audit
