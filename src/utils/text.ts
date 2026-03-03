/**
 * Text Utilities for Xenova Bridge
 *
 * Provides text normalization, tokenization, and pattern matching functions.
 */

// ============================================================================
// NORMALIZATION
// ============================================================================

/**
 * Normalize text for consistent matching
 * - Lowercase
 * - Remove accents (normalize to ASCII)
 * - Trim whitespace
 * - Collapse multiple spaces
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/['']/g, "'") // Normalize apostrophes
    .replace(/[""]/g, '"') // Normalize quotes
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Tokenize text into words
 * Handles common punctuation and special characters
 */
export function tokenize(text: string): string[] {
  return text
    .split(/[\s,;:!?.()\[\]{}]+/)
    .filter((token) => token.length > 0);
}

// ============================================================================
// PATTERN MATCHING
// ============================================================================

/**
 * Calculate a score based on pattern matches in text
 * Returns a score where higher = more matches
 */
export function calculatePatternScore(
  normalized: string,
  tokens: string[],
  patterns: string[]
): number {
  let score = 0;
  const tokensSet = new Set(tokens);

  for (const pattern of patterns) {
    const normalizedPattern = normalizeText(pattern);

    // Exact phrase match (highest weight)
    if (normalized.includes(normalizedPattern)) {
      score += 2;
      continue;
    }

    // Token-level match
    const patternTokens = tokenize(normalizedPattern);
    const matchedTokens = patternTokens.filter((t) => tokensSet.has(t));

    if (matchedTokens.length === patternTokens.length && patternTokens.length > 0) {
      // All pattern tokens found
      score += 1.5;
    } else if (matchedTokens.length > 0) {
      // Partial match
      score += 0.5 * (matchedTokens.length / patternTokens.length);
    }
  }

  return score;
}

/**
 * Find the best matching pattern from a list
 * Returns the pattern and its similarity score
 */
export function findBestMatch(
  input: string,
  patterns: string[]
): { pattern: string; score: number } | null {
  const normalized = normalizeText(input);
  let bestPattern = '';
  let bestScore = 0;

  for (const pattern of patterns) {
    const normalizedPattern = normalizeText(pattern);
    const score = calculateSimilarity(normalized, normalizedPattern);

    if (score > bestScore) {
      bestScore = score;
      bestPattern = pattern;
    }
  }

  if (bestScore === 0) return null;

  return { pattern: bestPattern, score: bestScore };
}

/**
 * Calculate similarity between two strings (Jaccard + containment)
 */
export function calculateSimilarity(a: string, b: string): number {
  // Containment check
  if (a.includes(b) || b.includes(a)) {
    const shorter = a.length < b.length ? a : b;
    const longer = a.length >= b.length ? a : b;
    return shorter.length / longer.length;
  }

  // Jaccard similarity on tokens
  const tokensA = new Set(tokenize(a));
  const tokensB = new Set(tokenize(b));

  const intersection = new Set([...tokensA].filter((t) => tokensB.has(t)));
  const union = new Set([...tokensA, ...tokensB]);

  if (union.size === 0) return 0;
  return intersection.size / union.size;
}

// ============================================================================
// EXTRACTION HELPERS
// ============================================================================

/**
 * Extract quoted strings from text
 */
export function extractQuoted(text: string): string[] {
  const matches: string[] = [];
  const regex = /["'"']([^"'"']+)["'"']/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    matches.push(match[1]);
  }

  return matches;
}

/**
 * Extract numbers from text
 */
export function extractNumbers(text: string): number[] {
  const matches = text.match(/\b\d+(?:\.\d+)?\b/g);
  return matches ? matches.map(Number) : [];
}

/**
 * Check if text contains any of the given words
 */
export function containsAny(text: string, words: string[]): boolean {
  const normalized = normalizeText(text);
  return words.some((word) => normalized.includes(normalizeText(word)));
}

/**
 * Check if text contains a pattern as a complete word (not substring)
 * Uses word boundaries to prevent false positives like "hell" in "hello"
 */
export function containsWord(text: string, word: string): boolean {
  const normalized = normalizeText(text);
  const normalizedWord = normalizeText(word);

  // For multi-word patterns, check direct inclusion
  if (normalizedWord.includes(' ')) {
    return normalized.includes(normalizedWord);
  }

  // For single words, use word boundary regex
  const regex = new RegExp(`\\b${escapeRegex(normalizedWord)}\\b`, 'i');
  return regex.test(normalized);
}

/**
 * Escape special regex characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Find position of a pattern in text
 */
export function findPatternPosition(
  text: string,
  pattern: string
): { start: number; end: number } | null {
  const normalized = normalizeText(text);
  const normalizedPattern = normalizeText(pattern);
  const index = normalized.indexOf(normalizedPattern);

  if (index === -1) return null;

  return {
    start: index,
    end: index + normalizedPattern.length,
  };
}

// ============================================================================
// LANGUAGE DETECTION
// ============================================================================

const LANGUAGE_INDICATORS: Record<string, string[]> = {
  en: ['the', 'is', 'are', 'to', 'and', 'of', 'in', 'for', 'on', 'with'],
  fr: ['le', 'la', 'les', 'de', 'du', 'des', 'et', 'en', 'pour', 'dans', 'est', 'sont'],
  es: ['el', 'la', 'los', 'las', 'de', 'del', 'y', 'en', 'para', 'es', 'son'],
  de: ['der', 'die', 'das', 'den', 'dem', 'und', 'in', 'für', 'auf', 'ist', 'sind'],
};

/**
 * Detect the probable language of text
 */
export function detectLanguage(text: string): 'en' | 'fr' | 'es' | 'de' {
  const tokens = tokenize(normalizeText(text));
  const scores: Record<string, number> = { en: 0, fr: 0, es: 0, de: 0 };

  for (const token of tokens) {
    for (const [lang, indicators] of Object.entries(LANGUAGE_INDICATORS)) {
      if (indicators.includes(token)) {
        scores[lang]++;
      }
    }
  }

  let bestLang: 'en' | 'fr' | 'es' | 'de' = 'en';
  let bestScore = 0;

  for (const [lang, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score;
      bestLang = lang as 'en' | 'fr' | 'es' | 'de';
    }
  }

  return bestLang;
}
