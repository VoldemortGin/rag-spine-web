const SECRET_PATTERNS: readonly RegExp[] = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/iu,
  /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/u,
  /\bAIza[0-9A-Za-z_-]{35}\b/u,
  /(?<![A-Za-z0-9])sk-(?:proj-|ant-api\d*-)?[A-Za-z0-9_-]{16,}/u,
  /\b(?:sk|rk)_(?:live|test)_[A-Za-z0-9]{16,}\b/u,
  /(?<![A-Za-z0-9_])whsec_[A-Za-z0-9]{16,}(?![A-Za-z0-9_])/u,
  /\bxox[baprs]-[A-Za-z0-9-]{16,}\b/u,
  /(?<![A-Za-z0-9_-])SG\.[A-Za-z0-9_-]{22,}\.[A-Za-z0-9_-]{43,}(?![A-Za-z0-9_-])/u,
  /(?<![A-Za-z0-9_])SK[0-9A-Fa-f]{32}(?![A-Za-z0-9_])/u,
  /\bglpat-[A-Za-z0-9_-]{16,}\b/u,
  /\bhf_[A-Za-z0-9]{20,}\b/u,
  /\b(?:ghp|github_pat)_[A-Za-z0-9_-]{16,}\b/u,
  /\bBearer\s+[A-Za-z0-9._~+/-]{12,}={0,2}/iu,
  /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{4,}\.[A-Za-z0-9_-]{4,}\b/u,
];

const SENSITIVE_KEYS = new Set([
  'api_key',
  'apikey',
  'access_token',
  'authorization',
  'auth_token',
  'aws_access_key_id',
  'aws_secret_access_key',
  'aws_security_token',
  'aws_session_token',
  'client_secret',
  'credential',
  'credentials',
  'password',
  'private_key',
  'refresh_token',
  'secret',
  'secret_key',
  'token',
  'webhook_secret',
]);

const PLACEHOLDER_LITERALS = new Set([
  '~',
  'null',
  'none',
  'unset',
  'redacted',
  'change_me',
  'change_me_before_use',
  ...[...SENSITIVE_KEYS].map((key) => `your_${key}`),
]);

const PLACEHOLDER_PATTERNS: readonly RegExp[] = [
  /^\$\{[a-z_][a-z0-9_]*\}$/u,
  /^\{\{\s*#?[a-z0-9_.-]+#?\s*\}\}$/u,
  /^<[a-z][a-z0-9_.-]*>$/u,
];

interface MappingEntry {
  indent: number;
  key: string;
  startsListItem: boolean;
  value: string;
}

function normalizeKey(value: string): string {
  return value
    .trim()
    .replace(/^(['"])(.*)\1$/u, '$2')
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, '_')
    .replace(/^_+|_+$/gu, '');
}

function normalizeScalar(value: string, stripFlowClosingDelimiter: boolean): string {
  let withoutFlowDelimiters = value.trim().replace(/,\s*$/u, '').trim();
  if (stripFlowClosingDelimiter) {
    withoutFlowDelimiters = withoutFlowDelimiters.replace(/\}\s*$/u, '').trim();
  }
  return withoutFlowDelimiters.replace(/^(['"])(.*)\1$/u, '$2').trim();
}

function isPlaceholder(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  return (
    normalized.length === 0 ||
    PLACEHOLDER_LITERALS.has(normalized) ||
    PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(normalized))
  );
}

function splitFlowSegments(value: string): readonly string[] {
  const characters = Array.from(value);
  const segments: string[] = [];
  let current = '';
  let previousCharacter = '';
  let placeholderClosingBraces = 0;
  let quote = '';

  for (const [index, character] of characters.entries()) {
    const nextCharacter = characters[index + 1] ?? '';
    if (quote.length > 0) {
      current += character;
      if (character === quote && previousCharacter !== '\\') {
        quote = '';
      }
    } else if (placeholderClosingBraces > 0) {
      current += character;
      if (character === '}') {
        placeholderClosingBraces -= 1;
      }
    } else if (character === '"' || character === "'") {
      quote = character;
      current += character;
    } else if (character === '{' && (previousCharacter === '$' || nextCharacter === '{')) {
      placeholderClosingBraces = previousCharacter === '$' ? 1 : 2;
      current += character;
    } else if (['{', '}', ','].includes(character)) {
      if (current.trim().length > 0) {
        segments.push(current.trim());
      }
      current = '';
    } else {
      current += character;
    }
    previousCharacter = character;
  }
  if (current.trim().length > 0) {
    segments.push(current.trim());
  }

  return segments;
}

function parseMappingEntry(
  content: string,
  indent: number,
  startsListItem = false,
  stripFlowClosingDelimiter = false,
): MappingEntry | null {
  const separator = content.indexOf(':');
  if (separator < 0) {
    return null;
  }
  return {
    indent,
    key: normalizeKey(content.slice(0, separator)),
    startsListItem,
    value: normalizeScalar(content.slice(separator + 1), stripFlowClosingDelimiter),
  };
}

function parseMappingEntries(yaml: string): readonly MappingEntry[] {
  const entries: MappingEntry[] = [];

  for (const line of yaml.split(/\r?\n/u)) {
    const baseIndent = /^\s*/u.exec(line)?.[0].length ?? 0;
    const startsListItem = /^\s*-\s+/u.test(line);
    const leadingWhitespace = baseIndent + (startsListItem ? 2 : 0);
    const rawContent = line.trim().replace(/^-\s+/u, '');
    const content = rawContent.replace(/^\{\s*/u, '');
    const entry = parseMappingEntry(
      content,
      leadingWhitespace,
      startsListItem,
      rawContent.startsWith('{'),
    );
    if (entry !== null) {
      entries.push(entry);
    }
    const flowSegments = splitFlowSegments(content);
    const hasFlowMapping = rawContent.startsWith('{') || /:\s*\{(?!\{)/u.test(rawContent);
    if (hasFlowMapping && flowSegments.length > 1) {
      for (const [index, segment] of flowSegments.entries()) {
        const flowEntry = parseMappingEntry(
          segment,
          leadingWhitespace,
          startsListItem && index === 0,
        );
        if (flowEntry !== null) {
          entries.push(flowEntry);
        }
      }
    }
  }

  return entries;
}

function hasPopulatedSiblingValue(
  entries: readonly MappingEntry[],
  labelIndex: number,
  step: -1 | 1,
): boolean {
  const label = entries[labelIndex];
  if (label === undefined) {
    return false;
  }
  if (step === -1 && label.startsListItem) {
    return false;
  }

  for (let index = labelIndex + step; index >= 0 && index < entries.length; index += step) {
    const candidate = entries[index];
    if (candidate === undefined || candidate.indent < label.indent) {
      break;
    }
    if (step === 1 && candidate.startsListItem) {
      break;
    }
    if (candidate.indent > label.indent) {
      continue;
    }
    if (['name', 'variable'].includes(candidate.key)) {
      break;
    }
    if (
      ['value', 'default', 'default_value'].includes(candidate.key) &&
      !isPlaceholder(candidate.value)
    ) {
      return true;
    }
    if (step === -1 && candidate.startsListItem) {
      break;
    }
  }

  return false;
}

function containsSensitiveValue(yaml: string): boolean {
  const entries = parseMappingEntries(yaml);

  for (const [index, entry] of entries.entries()) {
    const nextEntry = entries[index + 1];
    if (SENSITIVE_KEYS.has(entry.key) && !isPlaceholder(entry.value)) {
      return true;
    }
    if (
      SENSITIVE_KEYS.has(entry.key) &&
      entry.value.length === 0 &&
      nextEntry !== undefined &&
      nextEntry.indent > entry.indent
    ) {
      return true;
    }
  }

  for (const [index, entry] of entries.entries()) {
    if (
      !['name', 'variable'].includes(entry.key) ||
      !SENSITIVE_KEYS.has(normalizeKey(entry.value))
    ) {
      continue;
    }
    if (
      hasPopulatedSiblingValue(entries, index, -1) ||
      hasPopulatedSiblingValue(entries, index, 1)
    ) {
      return true;
    }
  }

  return false;
}

export function containsWorkflowSecret(yaml: string): boolean {
  return SECRET_PATTERNS.some((pattern) => pattern.test(yaml)) || containsSensitiveValue(yaml);
}
