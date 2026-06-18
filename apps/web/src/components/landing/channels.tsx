/**
 * "Two channels, one router" — a compact, accurate diagram of the dual-channel
 * architecture: a structured numeric channel and a narrative RAG channel,
 * both unified by the agent router.
 */
import { Bot, Hash, Text } from 'lucide-react';

function Channel({
  icon: Icon,
  label,
  detail,
}: {
  icon: typeof Hash;
  label: string;
  detail: string;
}) {
  return (
    <div className="flex flex-1 flex-col gap-2 rounded-lg border border-fd-border bg-fd-card/40 p-5">
      <div className="flex items-center gap-2.5">
        <Icon className="h-4 w-4 text-fd-primary" strokeWidth={1.75} aria-hidden />
        <span className="font-mono text-xs uppercase tracking-wider text-fd-muted-foreground">
          {label}
        </span>
      </div>
      <p className="text-sm text-fd-foreground">{detail}</p>
    </div>
  );
}

export function ChannelDiagram() {
  return (
    <div className="rounded-xl border border-fd-border bg-fd-card/30 p-5 sm:p-8">
      <div className="flex flex-col items-stretch gap-4 lg:flex-row lg:items-center">
        <div className="flex flex-1 flex-col gap-4">
          <Channel
            icon={Hash}
            label="structured numeric"
            detail="Exact facts from a deterministic fact table — never inferred."
          />
          <Channel
            icon={Text}
            label="narrative RAG"
            detail="Hybrid retrieval over prose, fused and optionally reranked."
          />
        </div>

        {/* Connector */}
        <div aria-hidden className="hidden items-center justify-center lg:flex">
          <svg width="72" height="120" viewBox="0 0 72 120" fill="none">
            <path
              d="M0 30 C 40 30, 32 60, 72 60"
              stroke="var(--color-fd-border)"
              strokeWidth="1.5"
            />
            <path
              d="M0 90 C 40 90, 32 60, 72 60"
              stroke="var(--color-fd-border)"
              strokeWidth="1.5"
            />
            <circle cx="68" cy="60" r="3" fill="var(--color-fd-primary)" />
          </svg>
        </div>

        <div className="flex items-center justify-center rounded-lg border border-fd-primary/30 bg-fd-primary/[0.06] p-6 lg:w-56">
          <div className="flex flex-col items-center gap-2 text-center">
            <Bot className="h-6 w-6 text-fd-primary" strokeWidth={1.75} aria-hidden />
            <span className="font-mono text-sm font-medium text-fd-foreground">agent router</span>
            <span className="text-xs text-fd-muted-foreground">one answer, with provenance</span>
          </div>
        </div>
      </div>
    </div>
  );
}
