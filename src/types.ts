/**
 * Xenova Bridge - Core Types
 *
 * Defines the contract between natural language input and AeryFlux component actions.
 * These types are shared across Pythagoras (backend), Atlas (mobile), and Holocron (admin).
 */

// ============================================================================
// MODE & COMPONENT TYPES (mirror GlobeControlsContext)
// ============================================================================

export type ModeId = 'news' | 'music' | 'weather' | 'wiki' | 'challenge';
export type ThemeId = 'dark' | 'green' | 'white';
export type LanguageId = 'en' | 'fr' | 'es' | 'de';

// ============================================================================
// INTENT CLASSIFICATION
// ============================================================================

/**
 * Primary intent categories for user commands
 */
export type IntentCategory =
  | 'navigation'  // "go to Japan", "show weather"
  | 'search'      // "find rock artists", "search news about..."
  | 'playback'    // "play jazz", "pause", "next track"
  | 'configure'   // "dark mode", "change language to French"
  | 'challenge'   // "start quiz", "harder difficulty"
  | 'info'        // "what is this country?", "tell me about..."
  | 'unknown';    // fallback

/**
 * Classified intent with confidence score
 */
export interface ClassifiedIntent {
  category: IntentCategory;
  confidence: number;
  subIntent?: string;
  raw: string;
}

// ============================================================================
// ENTITY EXTRACTION
// ============================================================================

/**
 * Entity types that can be extracted from user input
 */
export type EntityType =
  | 'country'     // ISO 3166-1 alpha-2 code
  | 'mode'        // ModeId
  | 'genre'       // Music genre
  | 'artist'      // Artist name
  | 'theme'       // ThemeId
  | 'language'    // LanguageId
  | 'temporal'    // "today", "this week", "2024"
  | 'quantity'    // Numbers, amounts
  | 'direction';  // "left", "right", "up", "down", "zoom in"

/**
 * Extracted entity with metadata
 */
export interface ExtractedEntity {
  type: EntityType;
  value: string;
  normalizedValue: string;
  confidence: number;
  position: { start: number; end: number };
}

// ============================================================================
// ACTIONS
// ============================================================================

/**
 * Action types that can be dispatched to AeryFlux components
 */
export type ActionType =
  // Globe actions
  | 'globe:rotate'
  | 'globe:zoom'
  | 'globe:select-country'
  | 'globe:reset'
  // Mode actions
  | 'mode:switch'
  | 'mode:refresh'
  // Drawer actions
  | 'drawer:open-left'
  | 'drawer:open-right'
  | 'drawer:close'
  | 'drawer:reorder'
  // Music actions
  | 'music:play'
  | 'music:pause'
  | 'music:next'
  | 'music:previous'
  | 'music:filter-genre'
  | 'music:filter-country'
  // Theme/Config actions
  | 'config:set-theme'
  | 'config:set-language'
  // Challenge actions
  | 'challenge:start'
  | 'challenge:answer'
  | 'challenge:skip'
  // Search actions
  | 'search:execute'
  | 'search:clear';

/**
 * Dispatchable action with typed payload
 */
export interface BridgeAction<T = unknown> {
  type: ActionType;
  payload: T;
  priority: 'high' | 'normal' | 'low';
  timestamp: number;
}

// ============================================================================
// ACTION PAYLOADS
// ============================================================================

export interface GlobeRotatePayload {
  lat: number;
  lon: number;
  duration?: number;
}

export interface GlobeZoomPayload {
  level: number;
  duration?: number;
}

export interface GlobeSelectCountryPayload {
  countryCode: string;
  highlight?: boolean;
}

export interface ModeSwitchPayload {
  mode: ModeId;
  transition?: 'fade' | 'slide' | 'morph';
}

export interface MusicFilterPayload {
  genre?: string;
  country?: string;
  artist?: string;
}

export interface ConfigSetThemePayload {
  theme: ThemeId;
}

export interface ConfigSetLanguagePayload {
  language: LanguageId;
}

export interface SearchExecutePayload {
  query: string;
  scope?: ModeId | 'all';
  filters?: Record<string, string>;
}

// ============================================================================
// COMMAND RESULT
// ============================================================================

/**
 * Result of processing a user command
 */
export interface CommandResult {
  success: boolean;
  intent: ClassifiedIntent;
  entities: ExtractedEntity[];
  actions: BridgeAction[];
  feedback?: string;
  suggestions?: string[];
}

// ============================================================================
// CONTEXT
// ============================================================================

/**
 * Current application state passed to the bridge for context-aware processing
 */
export interface BridgeContext {
  currentMode: ModeId | null;
  selectedCountry?: string;
  currentTheme: ThemeId;
  language: LanguageId;
  isPlaying?: boolean;
  drawerState?: 'closed' | 'left' | 'right';
}

// ============================================================================
// CONFIG
// ============================================================================

/**
 * Bridge configuration options
 */
export interface BridgeConfig {
  /** Minimum confidence threshold for intent classification */
  intentThreshold: number;
  /** Minimum confidence threshold for entity extraction */
  entityThreshold: number;
  /** Whether to use local embeddings (Pythagoras) or API */
  useLocalEmbeddings: boolean;
  /** API base URL for Pythagoras */
  apiBaseUrl: string;
  /** Enable debug logging */
  debug: boolean;
}

export const DEFAULT_CONFIG: BridgeConfig = {
  intentThreshold: 0.6,
  entityThreshold: 0.5,
  useLocalEmbeddings: true,
  apiBaseUrl: 'http://localhost:3000',
  debug: false,
};
