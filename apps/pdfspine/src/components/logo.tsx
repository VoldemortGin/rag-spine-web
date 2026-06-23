/**
 * pdfspine brand mark — a left "binding" (the spine) in the theme accent, with
 * indexed rows fading off to the right (the stacked pages of a document).
 * Rows use `currentColor` so the mark inherits text color; the binding tracks the
 * Fumadocs primary accent so it stays correct in both light and dark themes.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" role="img" aria-label="pdfspine">
      <rect
        x="3"
        y="4"
        width="3.4"
        height="24"
        rx="1.7"
        style={{ fill: 'var(--color-fd-primary)' }}
      />
      <rect x="9.5" y="5.6" width="19.5" height="3.4" rx="1.7" fill="currentColor" />
      <rect x="9.5" y="11.9" width="14" height="3.4" rx="1.7" fill="currentColor" opacity="0.82" />
      <rect x="9.5" y="18.2" width="17" height="3.4" rx="1.7" fill="currentColor" opacity="0.64" />
      <rect x="9.5" y="24.5" width="11" height="3.4" rx="1.7" fill="currentColor" opacity="0.46" />
    </svg>
  );
}
