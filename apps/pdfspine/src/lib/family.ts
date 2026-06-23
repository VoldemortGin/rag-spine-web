/**
 * The Spine family of sibling documentation sites.
 *
 * Shared verbatim across every app so the navbar "Family" switcher and the
 * main-site family section stay in sync. `key` matches the `familyKey` set in
 * each app's `shared.ts`, which is how a site recognizes itself in this list.
 */
export type FamilyKey = 'corespine' | 'ragspine' | 'spineagent' | 'pdfspine';

export interface FamilyMember {
  /** Stable identity, matched against the current site's `familyKey`. */
  key: FamilyKey;
  /** Package / site name as shown in the navbar and on cards. */
  name: string;
  /** One-line positioning, used on the family section cards. */
  tagline: string;
  /** Absolute, cross-site URL. The apex host points at the ragspine docs. */
  url: string;
}

export const FAMILY: readonly FamilyMember[] = [
  {
    key: 'corespine',
    name: 'corespine',
    tagline:
      'The thin shared core — domain-neutral primitives: seams, traces, LLM, rate limits, config, queue, conformance.',
    url: 'https://core.rag-spine.org',
  },
  {
    key: 'ragspine',
    name: 'ragspine',
    tagline: 'RAG for financial & operational metrics — anti-fabrication with source provenance.',
    url: 'https://rag-spine.org/docs',
  },
  {
    key: 'spineagent',
    name: 'spineagent',
    tagline: 'Agent orchestration — MCP / A2A / tool loops with multi-LLM adapters.',
    url: 'https://agent.rag-spine.org',
  },
  {
    key: 'pdfspine',
    name: 'pdfspine',
    tagline: 'A pure-Rust PyMuPDF reimplementation with PP-OCRv5 baked into the wheel.',
    url: 'https://pdf.rag-spine.org',
  },
];
