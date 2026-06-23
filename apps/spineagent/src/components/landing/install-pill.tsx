'use client';
import { Check, Copy } from 'lucide-react';
import { useCallback, useState } from 'react';

const COMMAND = 'pip install spineagent';

export function InstallPill() {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(() => {
    void navigator.clipboard.writeText(COMMAND).then(() => {
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 1600);
    });
  }, []);

  return (
    <button
      type="button"
      onClick={copy}
      aria-label="Copy install command"
      className="group inline-flex items-center gap-3 rounded-full border border-fd-border bg-fd-card/60 py-2 pl-4 pr-3 font-mono text-sm text-fd-foreground transition-colors hover:border-fd-primary/40"
    >
      <span className="select-none text-fd-primary">$</span>
      <span>{COMMAND}</span>
      <span className="flex h-6 w-6 items-center justify-center rounded-full text-fd-muted-foreground transition-colors group-hover:text-fd-primary">
        {copied ? (
          <Check className="h-3.5 w-3.5" aria-hidden />
        ) : (
          <Copy className="h-3.5 w-3.5" aria-hidden />
        )}
      </span>
    </button>
  );
}
