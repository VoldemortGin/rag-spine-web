import { Inter, JetBrains_Mono } from 'next/font/google';

// Clean grotesk sans for body + UI.
export const sans = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

// A real monospace — part of the personality (logo wordmark, eyebrows, code, labels).
export const mono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
});
