import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { ChannelDiagram } from '@/components/landing/channels';
import { FamilyGrid } from '@/components/landing/family';
import { FeatureGrid } from '@/components/landing/features';
import { InstallPill } from '@/components/landing/install-pill';
import { AntiFabricationPanel } from '@/components/landing/terminal';
import { gitConfig } from '@/lib/shared';
import type { Metadata } from 'next';

// Canonicalize to the apex host so www / preview deployments don't fragment SEO.
export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

const githubUrl = `https://github.com/${gitConfig.user}/${gitConfig.repo}`;
const pypiUrl = 'https://pypi.org/project/rag-spine/';

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
          <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
            {/* Left — copy */}
            <div className="flex flex-col gap-7">
              <Logo className="h-11 w-11" />

              <span className="font-mono text-xs uppercase tracking-[0.2em] text-fd-muted-foreground">
                Apache-2.0 · Python 3.10+ · framework-free
              </span>

              <h1 className="text-balance text-4xl font-extrabold leading-[1.05] tracking-tight text-fd-foreground sm:text-5xl lg:text-6xl">
                The framework-free backbone for backend RAG.
              </h1>

              <p className="max-w-xl text-pretty text-base leading-relaxed text-fd-muted-foreground sm:text-lg">
                Deterministic dual-channel retrieval and agent orchestration, with anti-fabrication
                and source provenance built in — no Dify, no LangGraph, no DSL. Just composable
                Python.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link
                  href="/docs/getting-started/installation"
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

            {/* Right — signature panel */}
            <div className="flex flex-col gap-3">
              <AntiFabricationPanel />
              <p className="px-1 text-xs leading-relaxed text-fd-muted-foreground">
                When the data isn&apos;t there, the orchestrator deterministically refuses — never
                guesses.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Features */}
      {/* ------------------------------------------------------------------ */}
      <section className="mx-auto w-full max-w-6xl px-6 py-20 sm:py-24">
        <div className="mb-10 flex flex-col gap-3">
          <SectionLabel>Why RAGSpine</SectionLabel>
          <h2 className="max-w-2xl text-2xl font-bold tracking-tight text-fd-foreground sm:text-3xl">
            Infrastructure decisions, made for you — and enforced in code.
          </h2>
        </div>
        <FeatureGrid />
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Two channels, one router */}
      {/* ------------------------------------------------------------------ */}
      <section className="border-t border-fd-border bg-fd-card/20">
        <div className="mx-auto w-full max-w-6xl px-6 py-20 sm:py-24">
          <div className="mb-10 flex flex-col gap-3">
            <SectionLabel>Architecture</SectionLabel>
            <h2 className="max-w-2xl text-2xl font-bold tracking-tight text-fd-foreground sm:text-3xl">
              Two channels, one router.
            </h2>
            <p className="max-w-2xl text-sm leading-relaxed text-fd-muted-foreground">
              Exact numbers come from a deterministic structured channel; everything else flows
              through narrative RAG. A single agent router decides, then attaches provenance to the
              answer.
            </p>
          </div>
          <ChannelDiagram />
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Spine Family */}
      {/* ------------------------------------------------------------------ */}
      <section className="mx-auto w-full max-w-6xl px-6 py-20 sm:py-24">
        <div className="mb-10 flex flex-col gap-3">
          <SectionLabel>Spine Family</SectionLabel>
          <h2 className="max-w-2xl text-2xl font-bold tracking-tight text-fd-foreground sm:text-3xl">
            One backbone, four packages.
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-fd-muted-foreground">
            RAGSpine is one member of a small family of framework-free Python packages — each owns a
            single layer, none reaches across into another&apos;s domain. Pick the piece you need.
          </p>
        </div>
        <FamilyGrid />
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
              RAGSpine
            </span>
          </div>
          <p className="max-w-xs text-xs leading-relaxed text-fd-muted-foreground">
            The framework-free backbone for backend RAG.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm sm:grid-cols-3">
          <FooterLink href="/docs">Docs</FooterLink>
          <FooterLink href="/workflows">Workflows</FooterLink>
          <FooterLink href="/docs/getting-started">Getting Started</FooterLink>
          <FooterLink href="/docs/concepts">Concepts</FooterLink>
          <FooterLink href="/docs/architecture">Architecture</FooterLink>
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
