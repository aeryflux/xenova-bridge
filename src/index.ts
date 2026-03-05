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
