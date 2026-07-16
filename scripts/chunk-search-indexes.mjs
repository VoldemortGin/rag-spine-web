import { createHash } from 'node:crypto';
import { readdir, readFile, rm, stat, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const chunkBytes = 8 * 1024 * 1024;
const maxIndexBytes = 256 * 1024 * 1024;
const maxPartCount = 64;
const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const searchDir = join(rootDir, 'apps', 'web', 'out', 'api', 'search');
const searchPartsDir = join(rootDir, 'apps', 'web', 'out', 'api', 'search-parts');

async function chunkSearchIndex(path, locale) {
  if (!/^[a-z0-9-]+$/.test(locale)) {
    throw new Error(`Invalid static search locale: ${locale}`);
  }

  const payload = await readFile(path);
  const parsed = JSON.parse(payload.toString('utf8'));
  if (parsed?.type === 'chunked-flexsearch') return;
  if (parsed?.type !== 'i18n' && parsed?.type !== 'default') {
    throw new Error(`Unexpected static search payload in ${path}.`);
  }
  if (payload.byteLength > maxIndexBytes) {
    throw new Error(`Static search payload exceeds the browser limit: ${path}.`);
  }

  const digest = createHash('sha256').update(payload).digest('hex').slice(0, 16);
  const partsDir = join(searchPartsDir, locale);
  await rm(partsDir, { recursive: true, force: true });
  await mkdir(partsDir, { recursive: true });

  const parts = [];
  for (let offset = 0, index = 0; offset < payload.byteLength; offset += chunkBytes, index++) {
    const chunk = payload.subarray(offset, Math.min(offset + chunkBytes, payload.byteLength));
    const file = `${digest}-${index}`;
    await writeFile(join(partsDir, file), chunk);
    parts.push({ file, byteLength: chunk.byteLength });
  }
  if (parts.length === 0 || parts.length > maxPartCount) {
    throw new Error(`Static search payload has an invalid part count: ${path}.`);
  }

  const manifest = {
    type: 'chunked-flexsearch',
    version: 1,
    byteLength: payload.byteLength,
    partsBase: `/api/search-parts/${locale}`,
    parts,
  };
  await writeFile(path, `${JSON.stringify(manifest)}\n`, 'utf8');
  console.log(
    `Chunked ${locale} search index: ${payload.byteLength} bytes across ${parts.length} parts.`,
  );
}

const entries = await readdir(searchDir, { withFileTypes: true });
for (const entry of entries) {
  if (!entry.isFile()) continue;
  const path = join(searchDir, entry.name);
  const info = await stat(path);
  if (info.size === 0) throw new Error(`Static search payload is empty: ${path}`);
  await chunkSearchIndex(path, entry.name);
}
