import { readdir, stat } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const maxAssetBytes = 25 * 1024 * 1024;
const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const outputDirs = ['web', 'corespine', 'spineagent', 'pdfspine'].map((app) =>
  join(rootDir, 'apps', app, 'out'),
);

async function listFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await listFiles(path)));
    else if (entry.isFile()) files.push(path);
  }
  return files;
}

const violations = [];
for (const outputDir of outputDirs) {
  const files = await listFiles(outputDir);
  let largest = { path: '', size: 0 };
  for (const path of files) {
    const { size } = await stat(path);
    if (size > largest.size) largest = { path, size };
    if (size > maxAssetBytes) violations.push({ path, size });
  }
  console.log(
    `${relative(rootDir, outputDir)}: ${files.length} assets; largest ${relative(rootDir, largest.path)} (${largest.size} bytes).`,
  );
}

if (violations.length > 0) {
  const details = violations
    .map(({ path, size }) => `- ${relative(rootDir, path)}: ${size} bytes`)
    .join('\n');
  throw new Error(
    `Cloudflare Pages rejects assets larger than ${maxAssetBytes} bytes:\n${details}`,
  );
}
