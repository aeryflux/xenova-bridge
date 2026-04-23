/**
 * @aeryflux/xenova-bridge
 *
 * Natural language interface bridge between users and AeryFlux components.
 * Provides intent classification, entity extraction, and action dispatching.
 *
 * @example
 * ```typescript
 * import { XenovaBridge, processCommand } from '@aeryflux/xenova-bridge';
 *
 * // Using the singleton
 * const result = await processCommand('show weather in Japan', {
 *   currentMode: 'news',
 *   currentTheme: 'dark',
 *   language: 'en',
 * });
 *
 * // Using a custom instance
 * const bridge = new XenovaBridge({ debug: true });
 * const result = await bridge.process('play jazz music', context);
 * ```
 */

// Types
export type {
  // Core types
  ModeId,
  ThemeId,
  LanguageId,
  // Intent types
  IntentCategory,
  ClassifiedIntent,
  // Entity types
  EntityType,
  ExtractedEntity,
  // Action types
  ActionType,
  BridgeAction,
  // Payload types
  GlobeRotatePayload,
  GlobeZoomPayload,
  GlobeSelectCountryPayload,
  ModeSwitchPayload,
  MusicFilterPayload,
  ConfigSetThemePayload,
  ConfigSetLanguagePayload,
  SearchExecutePayload,
  // Result types
  CommandResult,
  BridgeContext,
  BridgeConfig,
} from './types.js';

// Constants
export { DEFAULT_CONFIG } from './types.js';

// Core classes
export {
  XenovaBridge,
  getBridge,
  processCommand,
} from './core/XenovaBridge.js';

export { IntentEngine } from './core/IntentEngine.js';
export { EntityExtractor } from './core/EntityExtractor.js';
export { ActionDispatcher } from './core/ActionDispatcher.js';

// Patterns (for extension/customization)
export {
  INTENT_PATTERNS,
  MODE_PATTERNS,
  THEME_PATTERNS,
  LANGUAGE_PATTERNS,
  GENRE_PATTERNS,
  DIRECTION_PATTERNS,
  COUNTRY_MAPPINGS,
  COUNTRY_MAPPINGS_EXTENDED,
  TEMPORAL_PATTERNS,
  PLAYBACK_COMMANDS,
} from './models/patterns.js';

// Utilities
export {
  normalizeText,
  tokenize,
  calculatePatternScore,
  findBestMatch,
  calculateSimilarity,
  detectLanguage,
} from './utils/text.js';

// ─── detectMode ──────────────────────────────────────────────────────────────
// Lightweight synchronous helper: returns the best ModeId for a given input
// using MODE_PATTERNS scoring, with 'wiki' as universal fallback.
// Use this to route UI actions (news feed, music player, weather map…) without
// spinning up IntentEngine (which is heavier, async, verb-action oriented).
//
// Priority: news > weather > music > challenge > wiki (explicit) > wiki (fallback)
// The wiki fallback enables any free-form keyword ("guerre de cent ans", "覇気",
// "natural language processing") to resolve to a Wikipedia search.
//
// Example:
//   detectMode('football')         → 'news'
//   detectMode('play jazz')        → 'music'
//   detectMode('météo')            → 'weather'
//   detectMode('guerre de cent ans') → 'wiki'  (fallback)
//   detectMode('覇気')               → 'wiki'  (fallback)
//   detectMode('')                 → null
// ─────────────────────────────────────────────────────────────────────────────
import { MODE_PATTERNS } from './models/patterns.js';
import { normalizeText as _nt, tokenize as _tok, calculatePatternScore as _cps } from './utils/text.js';
import type { ModeId } from './types.js';

// Modes scored by patterns — wiki is handled separately as explicit + fallback
const SCORED_MODES: ModeId[] = ['news', 'weather', 'music', 'challenge'];

export function detectMode(input: string, threshold = 1): ModeId | null {
  if (!input.trim()) return null;
  const normalized = _nt(input);
  const tokens = _tok(normalized);
  let bestMode: ModeId | null = null;
  let bestScore = 0;
  for (const mode of SCORED_MODES) {
    const patterns = MODE_PATTERNS[mode];
    if (!patterns) continue;
    const score = _cps(normalized, tokens, patterns);
    if (score > bestScore) {
      bestScore = score;
      bestMode = mode;
    }
  }
  // Explicit mode match above threshold
  if (bestScore >= threshold) return bestMode;
  // Explicit wiki pattern match (e.g. "wikipedia france", "what is quantum physics")
  const wikiScore = _cps(normalized, tokens, MODE_PATTERNS.wiki ?? []);
  if (wikiScore >= threshold) return 'wiki';
  // Universal fallback: any non-trivial input → wiki search
  if (input.trim().length >= 2) return 'wiki';
  return null;
}
