import { ImageResponse } from 'next/og';

// Prerenders to a static file under `output: 'export'` (no params).
export const dynamic = 'force-static';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

const BG = '#0a0a0b';
const TEAL = '#2dd4bf';

// Index rows matching icon.svg, fading down.
const ROWS = [
  { w: 96, c: '#ededed' },
  { w: 70, c: '#c2c2c2' },
  { w: 84, c: '#8f8f8f' },
];

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 18,
        background: BG,
        padding: 40,
      }}
    >
      <div style={{ width: 18, height: 100, borderRadius: 9, background: TEAL }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {ROWS.map((r) => (
          <div
            key={r.w}
            style={{
              width: r.w,
              height: 16,
              borderRadius: 8,
              background: r.c,
            }}
          />
        ))}
      </div>
    </div>,
    size,
  );
}
