/**
 * The "Why RAGSpine" feature grid. Copy is taken verbatim from the project
 * README — no invented product claims.
 */
import {
  Boxes,
  FileSpreadsheet,
  Layers,
  type LucideIcon,
  Network,
  Search,
  ShieldCheck,
  Unplug,
  Zap,
} from 'lucide-react';

interface Feature {
  icon: LucideIcon;
  title: string;
  body: string;
}

const FEATURES: readonly Feature[] = [
  {
    icon: Unplug,
    title: 'No framework lock-in',
    body: 'Pure Python; bring your own everything. Drop into any backend.',
  },
  {
    icon: Layers,
    title: 'Dual-channel',
    body: 'Deterministic numbers + narrative RAG, unified by an agent router.',
  },
  {
    icon: ShieldCheck,
    title: 'Anti-fabrication + provenance',
    body: 'Enforced invariants, not prompt suggestions.',
  },
  {
    icon: FileSpreadsheet,
    title: 'Office-document extraction',
    body: 'xlsx / pptx / pdf → structured facts, style- & color-aware.',
  },
  {
    icon: Search,
    title: 'Hybrid retrieval',
    body: 'CJK-aware BM25 + injectable vector + RRF fusion + optional LLM rerank.',
  },
  {
    icon: Zap,
    title: 'FAQ short-circuit',
    body: 'SME-vetted answers bypass the LLM, behind conservative exclusion guards.',
  },
  {
    icon: Boxes,
    title: 'Built-in evaluation',
    body: 'Four-gate metrics + baseline regression gating.',
  },
  {
    icon: Network,
    title: 'Privacy-aware observability',
    body: 'Traces carry codes / counts / timings only.',
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
