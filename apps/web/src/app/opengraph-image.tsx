import { ImageResponse } from 'next/og';

// Prerenders to a static file under `output: 'export'` (no params).
export const dynamic = 'force-static';

export const alt = 'RAGSpine — the framework-free backbone for backend RAG.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const BG = '#0a0a0b';
const FG = '#ededed';
const MUTED = '#8b8f96';
const TEAL = '#2dd4bf';
const HAIRLINE = 'rgba(255,255,255,0.08)';

// Indexed "fact rows" of the spine mark, fading right.
const ROWS = [
  { w: 320, o: 1 },
  { w: 232, o: 0.82 },
  { w: 280, o: 0.64 },
  { w: 184, o: 0.46 },
];

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: BG,
        backgroundImage: `radial-gradient(60% 70% at 18% 0%, rgba(45,212,191,0.12) 0%, transparent 60%), linear-gradient(${HAIRLINE} 1px, transparent 1px), linear-gradient(90deg, ${HAIRLINE} 1px, transparent 1px)`,
        backgroundSize: '100% 100%, 64px 64px, 64px 64px',
        padding: 80,
        color: FG,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          fontSize: 22,
          letterSpacing: 2,
          textTransform: 'uppercase',
          color: MUTED,
        }}
      >
        <span style={{ color: TEAL }}>●</span>
        Apache-2.0 · Python 3.11+ · framework-free
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
        {/* Spine mark */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24 }}>
          <div
            style={{
              width: 18,
              height: 188,
              borderRadius: 9,
              background: TEAL,
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {ROWS.map((r) => (
              <div
                key={r.w}
                style={{
                  width: r.w,
                  height: 18,
                  borderRadius: 9,
                  background: FG,
                  opacity: r.o,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div
          style={{
            fontSize: 80,
            fontWeight: 800,
            letterSpacing: -2,
            lineHeight: 1,
          }}
        >
          RAGSpine
        </div>
        <div style={{ fontSize: 34, color: MUTED, maxWidth: 900 }}>
          The framework-free backbone for backend RAG.
        </div>
      </div>
    </div>,
    size,
  );
}
