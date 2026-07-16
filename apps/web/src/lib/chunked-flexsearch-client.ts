import type { SearchClient } from 'fumadocs-core/search/client';
import { flexsearchStaticClient } from 'fumadocs-core/search/client/flexsearch-static';

const manifestType = 'chunked-flexsearch' as const;
const manifestVersion = 1 as const;
const maxPartCount = 64;
const maxIndexBytes = 256 * 1024 * 1024;

interface ChunkedFlexsearchManifest {
  type: typeof manifestType;
  version: typeof manifestVersion;
  byteLength: number;
  partsBase: string;
  parts: {
    file: string;
    byteLength: number;
  }[];
}

interface ChunkedFlexsearchOptions {
  from: string;
  locale: string;
  tag?: string | string[];
}

interface ManifestCandidate {
  type?: unknown;
  version?: unknown;
  byteLength?: unknown;
  partsBase?: unknown;
  parts?: unknown;
}

interface PartCandidate {
  file?: unknown;
  byteLength?: unknown;
}

interface LoadedClient {
  client: SearchClient;
}

const clientCache = new Map<string, Promise<LoadedClient>>();

function isPositiveSafeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function parseManifest(value: unknown): ChunkedFlexsearchManifest | undefined {
  if (!isRecord(value)) return undefined;

  const candidate = value as ManifestCandidate;
  if (candidate.type !== manifestType) return undefined;
  if (candidate.version !== manifestVersion) {
    throw new Error(`Unsupported static search manifest version: ${String(candidate.version)}`);
  }
  if (!isPositiveSafeInteger(candidate.byteLength) || candidate.byteLength > maxIndexBytes) {
    throw new Error('Invalid static search manifest byte length.');
  }
  if (
    typeof candidate.partsBase !== 'string' ||
    !/^\/api\/search-parts\/[a-z0-9-]+$/.test(candidate.partsBase)
  ) {
    throw new Error('Invalid static search manifest parts base path.');
  }
  if (
    !Array.isArray(candidate.parts) ||
    candidate.parts.length === 0 ||
    candidate.parts.length > maxPartCount
  ) {
    throw new Error('Invalid static search manifest part count.');
  }

  let total = 0;
  const parts: ChunkedFlexsearchManifest['parts'] = [];
  for (const value of candidate.parts as unknown[]) {
    if (!isRecord(value)) throw new Error('Invalid static search manifest part.');
    const part = value as PartCandidate;
    if (
      typeof part.file !== 'string' ||
      !/^[a-f0-9]{16}-\d+$/.test(part.file) ||
      !isPositiveSafeInteger(part.byteLength)
    ) {
      throw new Error('Invalid static search manifest part.');
    }
    total += part.byteLength;
    parts.push({ file: part.file, byteLength: part.byteLength });
  }
  if (total !== candidate.byteLength) {
    throw new Error('Static search manifest part sizes do not match its total size.');
  }

  return {
    type: manifestType,
    version: manifestVersion,
    byteLength: candidate.byteLength,
    partsBase: candidate.partsBase,
    parts,
  };
}

async function createObjectUrlClient(
  chunks: BlobPart[],
  options: ChunkedFlexsearchOptions,
): Promise<LoadedClient> {
  const objectUrl = URL.createObjectURL(new Blob(chunks, { type: 'application/json' }));
  const client = flexsearchStaticClient({
    from: objectUrl,
    locale: options.locale,
    ...(options.tag === undefined ? {} : { tag: options.tag }),
  });

  try {
    // Import before revoking the transport Blob. The FlexSearch client keeps
    // the reconstructed database, not the Blob, after this resolves.
    await client.search('');
    return { client };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function loadClient(options: ChunkedFlexsearchOptions): Promise<LoadedClient> {
  const response = await fetch(options.from);
  if (!response.ok) {
    throw new Error(`Failed to fetch the static search manifest from ${options.from}.`);
  }

  const value: unknown = await response.json();
  const manifest = parseManifest(value);
  if (manifest === undefined) {
    // `next dev` serves the unsplit Fumadocs payload. Convert it to the same
    // Blob path so development and the post-build static export share a client.
    return createObjectUrlClient([JSON.stringify(value)], options);
  }

  const chunks = await Promise.all(
    manifest.parts.map(async (part) => {
      const partUrl = `${manifest.partsBase}/${part.file}`;
      const partResponse = await fetch(partUrl);
      if (!partResponse.ok) {
        throw new Error(`Failed to fetch static search index part ${partUrl}.`);
      }

      const bytes = await partResponse.arrayBuffer();
      if (bytes.byteLength !== part.byteLength) {
        throw new Error(`Static search index part has an unexpected size: ${partUrl}.`);
      }
      return bytes;
    }),
  );

  return createObjectUrlClient(chunks, options);
}

function cacheKey(options: ChunkedFlexsearchOptions): string {
  return JSON.stringify([options.from, options.locale, options.tag ?? null]);
}

function getOrLoadClient(options: ChunkedFlexsearchOptions, key: string): Promise<LoadedClient> {
  let loaded = clientCache.get(key);
  if (loaded === undefined) {
    loaded = loadClient(options);
    clientCache.set(key, loaded);
    void loaded.catch(() => {
      if (clientCache.get(key) === loaded) clientCache.delete(key);
    });
  }
  return loaded;
}

export function chunkedFlexsearchStaticClient(options: ChunkedFlexsearchOptions): SearchClient {
  const key = cacheKey(options);
  let loaded = typeof window === 'undefined' ? undefined : getOrLoadClient(options, key);

  return {
    deps: [options.from, options.locale, options.tag],
    async search(query) {
      if (typeof window === 'undefined') return [];
      loaded ??= getOrLoadClient(options, key);

      try {
        return await (await loaded).client.search(query);
      } catch (error) {
        if (clientCache.get(key) === loaded) clientCache.delete(key);
        loaded = undefined;
        throw error;
      }
    },
  };
}
