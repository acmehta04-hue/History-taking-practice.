import type { CaseFile, ChecklistItem, Distractor, ReasonItem } from '../content/types';

/**
 * Keyword/regex matching. Deliberately simple and offline: every item lists
 * patterns, and a question "covers" an item if any pattern matches.
 * Phase 2 swaps in an LLM classifier behind the same function signatures
 * (see docs/ROADMAP.md) — keep this as the offline fallback.
 */

const ACCENTS: Record<string, string> = {
  à: 'a',
  á: 'a',
  â: 'a',
  ä: 'a',
  ç: 'c',
  è: 'e',
  é: 'e',
  ê: 'e',
  ë: 'e',
  ì: 'i',
  í: 'i',
  ï: 'i',
  ñ: 'n',
  ò: 'o',
  ó: 'o',
  ö: 'o',
  ù: 'u',
  ú: 'u',
  ü: 'u',
};

export function normalise(text: string): string {
  return text
    .toLowerCase()
    .replace(/[àáâäçèéêëìíïñòóöùúü]/g, (ch) => ACCENTS[ch])
    .replace(/[’‘`]/g, "'")
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const cache = new Map<string, RegExp>();
function re(source: string): RegExp {
  let r = cache.get(source);
  if (!r) {
    r = new RegExp(source, 'i');
    cache.set(source, r);
  }
  return r;
}

export function matchesAny(normalisedText: string, patterns: string[] | undefined): boolean {
  if (!patterns || !normalisedText) return false;
  return patterns.some((p) => re(p).test(normalisedText));
}

/** Which checklist items does this question cover? */
export function matchQuestion(question: string, items: ChecklistItem[]): ChecklistItem[] {
  const text = normalise(question);
  if (!text) return [];
  return items.filter((i) => matchesAny(text, i.match));
}

const FALLBACKS = [
  'Sorry, I’m not sure what you mean — could you ask that another way?',
  'Hmm, I don’t quite follow. What would you like to know?',
  'Sorry, could you rephrase that?',
];

/** What the simulated patient says in reply */
export function patientReply(matched: ChecklistItem[], c: CaseFile, attempt = 0): string {
  if (matched.length === 0) return FALLBACKS[attempt % FALLBACKS.length];
  const parts: string[] = [];
  for (const i of matched) {
    const a = c.answers[i.id] ?? i.defaultAnswer ?? 'No, I don’t think so.';
    if (!parts.includes(a)) parts.push(a);
  }
  return parts.join(' ');
}

/* ------------------------------------------------------------------ */
/* Reasoning entries: "FBC — anaemia from blood loss"                   */
/* ------------------------------------------------------------------ */

const SEPARATOR =
  /\s[-–—:]\s?|[:–—(]|\s-|\b(to|for|because|as|since|due to|in case|exclude|excludes|check|checks|look for|looking for|assess|assesses|rule out|so|if|given)\b/gi;

/** Split "Test — reason" into its two halves. No separator means no reason given. */
export function splitEntry(raw: string): { head: string; reason: string } {
  SEPARATOR.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = SEPARATOR.exec(raw))) {
    // ignore a leading verb such as "Check TFTs — …"
    if (m.index > 1) return { head: raw.slice(0, m.index).trim(), reason: raw.slice(m.index).trim() };
    if (m[0].length === 0) SEPARATOR.lastIndex++;
  }
  return { head: raw.trim(), reason: '' };
}

const NEGATION = /\b(not|avoid|don t|dont|never|no|without|contraindicat\w*)\b/;

export interface EntryMatch {
  items: ReasonItem[];
  /** item id -> whether the stated reason matched */
  reasonHits: Record<string, boolean>;
  distractor?: Distractor;
}

export function matchEntry(raw: string, items: ReasonItem[], distractors: Distractor[] = []): EntryMatch {
  const whole = normalise(raw);
  const { head, reason } = splitEntry(raw);
  const headN = normalise(head);
  const reasonN = normalise(reason);

  // A distractor wins unless the student is explicitly ruling it out ("avoid adenosine — asthma")
  if (!NEGATION.test(whole)) {
    const d = distractors.find((x) => matchesAny(whole, x.match));
    if (d) return { items: [], reasonHits: {}, distractor: d };
  }

  let hit = items.filter((i) => matchesAny(headN, i.match));
  let reasonText = reasonN;
  if (hit.length === 0) {
    hit = items.filter((i) => matchesAny(whole, i.match));
    reasonText = whole;
  }

  const reasonHits: Record<string, boolean> = {};
  for (const i of hit) reasonHits[i.id] = !!i.reasonMatch && matchesAny(reasonText, i.reasonMatch);
  return { items: hit, reasonHits };
}
