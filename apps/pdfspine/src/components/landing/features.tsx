/**
 * The "Why pdfspine" feature grid. Copy is drawn accurately from the project
 * README's "What works today" table + index.md — no invented product claims.
 */
import {
  FilePenLine,
  FileText,
  Image,
  Lock,
  type LucideIcon,
  Replace,
  ScanText,
  ShieldCheck,
  Boxes,
} from 'lucide-react';

interface Feature {
  icon: LucideIcon;
  title: string;
  body: string;
}

const FEATURES: readonly Feature[] = [
  {
    icon: ShieldCheck,
    title: 'Apache-2.0, license-clean',
    body: 'Permissive throughout; cargo-deny gates the shipped graph to exclude GPL / AGPL / LGPL / MPL / SSPL. CI-enforced, not a promise.',
  },
  {
    icon: Boxes,
    title: 'Pure Rust, no C blob',
    body: 'Self-contained wheels with no system zlib / C linkage and no bundled prebuilt engine — the differentiator vs pdfium wrappers.',
  },
  {
    icon: Replace,
    title: 'import fitz compatible',
    body: 'An opt-in shim lets much existing PyMuPDF code run unmodified — collision-safe alongside a real PyMuPDF in the same environment.',
  },
  {
    icon: Lock,
    title: 'Memory-safe by construction',
    body: '#![forbid(unsafe_code)] in every first-party crate except the single audited PyO3 FFI chokepoint.',
  },
  {
    icon: FileText,
    title: 'Text & tables',
    body: 'get_text in text / words / blocks / dict / rawdict / json / html / xhtml / xml; find_tables with merged-cell detection → markdown / html.',
  },
  {
    icon: FilePenLine,
    title: 'Edit & save',
    body: 'Full and byte-exact incremental save, garbage collection, page ops, insert_pdf merge / split, metadata / TOC, and encryption write.',
  },
  {
    icon: Image,
    title: 'Render',
    body: 'get_pixmap rasterizes vector + text + image + shadings via tiny-skia — near-parity SSIM with fitz and ~1.74× faster.',
  },
  {
    icon: ScanText,
    title: 'OCR',
    body: 'A pluggable engine: a Tesseract adapter and a pure-Rust PaddleOCR engine (PP-OCRv4, embedded models) that beats fitz on CJK scans.',
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
