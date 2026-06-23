/**
 * The "Why corespine" feature grid — one card per seam. Copy is drawn verbatim
 * from the project docs (overview.md / api.md) — no invented product claims.
 */
import {
  Bot,
  CheckCheck,
  type LucideIcon,
  ListChecks,
  Plug,
  ShieldCheck,
  SlidersHorizontal,
  TriangleAlert,
  Unplug,
} from 'lucide-react';

interface Feature {
  icon: LucideIcon;
  title: string;
  body: string;
}

const FEATURES: readonly Feature[] = [
  {
    icon: Plug,
    title: 'Registry',
    body: 'name → factory resolution, plus entry-point discovery so packages extend a seam without touching core.',
  },
  {
    icon: Unplug,
    title: 'lazy_extra_import',
    body: 'Real backends live behind optional extras — a missing one becomes a friendly "pip install pkg[extra]".',
  },
  {
    icon: ShieldCheck,
    title: 'InProcessPrivacyTraceSink',
    body: 'A trace sink that records codes / counts / timings only and rejects any payload carrying a body.',
  },
  {
    icon: Bot,
    title: 'MockProvider',
    body: 'An offline, deterministic LLM in the OpenAI chat-completions shape — zero network, zero key, reproducible.',
  },
  {
    icon: SlidersHorizontal,
    title: 'load_from_env',
    body: 'Reads PREFIX_* environment variables into a frozen dataclass by field type.',
  },
  {
    icon: ListChecks,
    title: 'FakeQueue',
    body: 'A synchronous inline TaskQueue that runs jobs in place — failures captured into status, never raised.',
  },
  {
    icon: CheckCheck,
    title: 'ConformanceSuite × InvariantPack',
    body: 'Runs implementation × invariant as a cartesian product — a mechanism, with no business invariants baked in.',
  },
  {
    icon: TriangleAlert,
    title: 'CorespineError / error_to_dict',
    body: 'A unified error shape with a stable, greppable code — any exception flattened to a serializable dict.',
  },
];

function FeatureCard({ icon: Icon, title, body }: Feature) {
  return (
    <div className="group relative flex flex-col gap-3 rounded-xl border border-fd-border bg-fd-card/40 p-6 transition-colors hover:border-fd-primary/40 hover:bg-fd-card/70">
      <span
        aria-hidden
        className="absolute inset-x-6 top-0 h-px scale-x-0 bg-gradient-to-r from-transparent via-fd-primary to-transparent opacity-0 transition-all duration-300 group-hover:scale-x-100 group-hover:opacity-100"
      />
      <Icon className="h-5 w-5 text-fd-primary" strokeWidth={1.75} aria-hidden />
      <h3 className="text-base font-semibold text-fd-foreground">{title}</h3>
      <p className="text-sm leading-relaxed text-fd-muted-foreground">{body}</p>
    </div>
  );
}

export function FeatureGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {FEATURES.map((f) => (
        <FeatureCard key={f.title} {...f} />
      ))}
    </div>
  );
}
