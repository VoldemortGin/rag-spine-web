import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { FeatureGrid } from '@/components/landing/features';
import { InstallPill } from '@/components/landing/install-pill';
import { gitConfig } from '@/lib/shared';
import type { Metadata } from 'next';

// Canonicalize to the apex host so www / preview deployments don't fragment SEO.
export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

const githubUrl = `https://github.com/${gitConfig.user}/${gitConfig.repo}`;
const pypiUrl = 'https://pypi.org/project/corespine/';

// lucide v1 dropped brand icons, so the GitHub mark is inlined.
function GithubMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2c-3.2.7-3.88-1.54-3.88-1.54-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.2 1.77 1.2 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.05 11.05 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.05.78 2.12v3.14c0 .31.21.68.8.56A11.52 11.52 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z" />
    </svg>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <span className="font-mono text-xs uppercase tracking-[0.2em] text-fd-primary">{children}</span>
  );
}

// The family meta-pattern, broken into its four moving parts.
const META_PATTERN: readonly { step: string; detail: string }[] = [
  { step: 'Protocol', detail: 'A structural interface only — the seam never imports an SDK.' },
  {
    step: 'Offline default',
    detail: 'A zero-network, zero-key, reproducible implementation ships in core.',
  },
  {
    step: 'make_* / Registry',
    detail: 'Choosing an implementation collapses to one spec string or factory call.',
  },
  {
    step: 'Parameterized conformance',
    detail: 'One invariant set runs across every implementation of the seam.',
  },
];

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col">
      {/* ------------------------------------------------------------------ */}
      {/* Hero */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative overflow-hidden border-b border-fd-border">
        <div aria-hidden className="rs-grid-bg absolute inset-0 opacity-60" />
        <div aria-hidden className="rs-hero-glow absolute inset-0" />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-fd-primary/40 to-transparent"
        />

        <div className="relative mx-auto w-full max-w-6xl px-6 py-20 sm:py-28">
          <div className="flex flex-col items-center gap-7 text-center">
            <Logo className="h-11 w-11" />

            <span className="font-mono text-xs uppercase tracking-[0.2em] text-fd-muted-foreground">
              Apache-2.0 · Python 3.10+ · zero runtime deps
            </span>

            <h1 className="text-balance text-4xl font-extrabold leading-[1.05] tracking-tight text-fd-foreground sm:text-5xl lg:text-6xl">
              The thin shared core of the Spine family.
            </h1>

            <p className="max-w-2xl text-pretty text-base leading-relaxed text-fd-muted-foreground sm:text-lg">
              corespine packs only the domain-neutral primitives — six seams plus a unified error
              shape — that belong to neither RAG nor agents. It is depended on by ragspine and
              spineagent but never the reverse; the core imports zero SDKs and runs fully offline.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              <Link
                href="/docs"
                className="group inline-flex items-center gap-2 rounded-full bg-fd-primary px-5 py-2.5 text-sm font-semibold text-fd-primary-foreground transition-transform hover:-translate-y-0.5"
              >
                Get started
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </Link>
              <a
                href={githubUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-fd-border px-5 py-2.5 text-sm font-medium text-fd-foreground transition-colors hover:border-fd-primary/40 hover:bg-fd-card/60"
              >
                <GithubMark className="h-4 w-4" />
                View on GitHub
              </a>
            </div>

            <div className="pt-1">
              <InstallPill />
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Features */}
      {/* ------------------------------------------------------------------ */}
      <section className="mx-auto w-full max-w-6xl px-6 py-20 sm:py-24">
        <div className="mb-10 flex flex-col gap-3">
          <SectionLabel>Why corespine</SectionLabel>
          <h2 className="max-w-2xl text-2xl font-bold tracking-tight text-fd-foreground sm:text-3xl">
            Small, obviously stable primitives — shared, not reinvented.
          </h2>
        </div>
        <FeatureGrid />
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Six seams, one meta-pattern */}
      {/* ------------------------------------------------------------------ */}
      <section className="border-t border-fd-border bg-fd-card/20">
        <div className="mx-auto w-full max-w-6xl px-6 py-20 sm:py-24">
          <div className="mb-10 flex flex-col gap-3">
            <SectionLabel>Architecture</SectionLabel>
            <h2 className="max-w-2xl text-2xl font-bold tracking-tight text-fd-foreground sm:text-3xl">
              Six seams, one meta-pattern.
            </h2>
            <p className="max-w-2xl text-sm leading-relaxed text-fd-muted-foreground">
              Every seam wears the same shape, and that shape is the key to the whole library:{' '}
              <span className="font-mono text-fd-foreground">
                Protocol + offline deterministic default + make_*/Registry factory + parameterized
                conformance
              </span>
              .
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {META_PATTERN.map((m, i) => (
              <div
                key={m.step}
                className="flex flex-col gap-2 rounded-xl border border-fd-border bg-fd-card/40 p-5"
              >
                <span className="font-mono text-xs text-fd-primary">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="font-mono text-sm font-semibold text-fd-foreground">{m.step}</h3>
                <p className="text-sm leading-relaxed text-fd-muted-foreground">{m.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Footer */}
      {/* ------------------------------------------------------------------ */}
      <Footer />
    </main>
  );
}

function Footer() {
  return (
    <footer className="border-t border-fd-border">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2.5">
            <Logo className="h-5 w-5" />
            <span className="font-mono text-sm font-medium tracking-tight text-fd-foreground">
              corespine
            </span>
          </div>
          <p className="max-w-xs text-xs leading-relaxed text-fd-muted-foreground">
            The thin shared core of the Spine family.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm sm:grid-cols-3">
          <FooterLink href="/docs">Docs</FooterLink>
          <FooterLink href="/docs/overview">Overview</FooterLink>
          <FooterLink href="/docs/api">API</FooterLink>
          <FooterLink href="/docs/recipes">Recipes</FooterLink>
          <FooterLink href={githubUrl} external>
            GitHub
          </FooterLink>
          <FooterLink href={pypiUrl} external>
            PyPI
          </FooterLink>
          <FooterLink href={githubUrl} external>
            License (Apache-2.0)
          </FooterLink>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({
  href,
  external = false,
  children,
}: {
  href: string;
  external?: boolean;
  children: string;
}) {
  const className = 'text-fd-muted-foreground transition-colors hover:text-fd-primary';
  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={className}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
