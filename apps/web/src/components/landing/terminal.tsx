/**
 * The signature "show, don't tell" panel: terminal-style output proving the
 * anti-fabrication behaviour. Two cases — a sourced answer, and an honest
 * refusal — using the exact strings from the project README.
 */

const FOUND =
  'ACME_CN FY2024 REVENUE 为 1320 USD_M（来源：ACME_FY2024_Review.pptx · slide=2,table=1,row=REVENUE,col=FY2024）';

const REFUSED =
  '查不到：REVENUE / ACME_CN / 2025 …未在事实表中找到。为避免误导，不提供任何推测数字。';

function Dot({ color }: { color: string }) {
  return (
    <span
      aria-hidden
      className="inline-block h-3 w-3 rounded-full"
      style={{ backgroundColor: color }}
    />
  );
}

export function AntiFabricationPanel() {
  return (
    <div className="overflow-hidden rounded-xl border border-fd-border bg-fd-card/60 shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset] backdrop-blur">
      {/* Title bar */}
      <div className="flex items-center gap-2 border-b border-fd-border px-4 py-3">
        <Dot color="#ff5f57" />
        <Dot color="#febc2e" />
        <Dot color="#28c840" />
        <span className="ml-3 font-mono text-xs text-fd-muted-foreground">
          orchestrator · structured channel
        </span>
      </div>

      <div className="space-y-6 p-5 font-mono text-[0.82rem] leading-relaxed sm:p-6 sm:text-sm">
        {/* Case 1 — found */}
        <div className="space-y-2">
          <div className="flex items-start gap-2 text-fd-muted-foreground">
            <span className="select-none text-fd-primary">$</span>
            <span>ask &quot;中国内地 FY2024 的 REVENUE 是多少&quot;</span>
          </div>
          <p className="flex items-start gap-2 break-words text-fd-foreground">
            <span aria-hidden className="select-none font-semibold text-fd-primary">
              ✓
            </span>
            <span>{FOUND}</span>
          </p>
        </div>

        <div className="h-px bg-fd-border" />

        {/* Case 2 — honest refusal */}
        <div className="space-y-2">
          <div className="flex items-start gap-2 text-fd-muted-foreground">
            <span className="select-none text-fd-primary">$</span>
            <span>ask &quot;2025 的 REVENUE 是多少&quot;</span>
          </div>
          <p className="flex items-start gap-2 break-words text-fd-muted-foreground">
            <span aria-hidden className="select-none text-fd-foreground/60">
              ✕
            </span>
            <span>{REFUSED}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
