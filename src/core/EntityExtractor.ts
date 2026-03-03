/**
 * EntityExtractor - Named Entity Recognition for AeryFlux
 *
 * Extracts structured entities from user input:
 * - Countries (ISO codes)
 * - Modes (news, music, weather, wiki, challenge)
 * - Genres (music genres)
 * - Themes (dark, green, white)
 * - Languages (en, fr, es, de)
 * - Directions (navigation commands)
 * - Quantities (numbers)
 */

import type {
  EntityType,
  ExtractedEntity,
  ModeId,
  ThemeId,
  LanguageId,
  BridgeConfig,
} from '../types.js';
import {
  MODE_PATTERNS,
  THEME_PATTERNS,
  LANGUAGE_PATTERNS,
  GENRE_PATTERNS,
  DIRECTION_PATTERNS,
  COUNTRY_MAPPINGS,
  PLAYBACK_COMMANDS,
} from '../models/patterns.js';
import {
  normalizeText,
  tokenize,
  findPatternPosition,
  extractNumbers,
  containsWord,
} from '../utils/text.js';

// ============================================================================
// ENTITY EXTRACTOR
// ============================================================================

export class EntityExtractor {
  private config: BridgeConfig;

  constructor(config: Partial<BridgeConfig> = {}) {
    this.config = {
      intentThreshold: 0.6,
      entityThreshold: 0.5,
      useLocalEmbeddings: true,
      apiBaseUrl: 'http://localhost:3000',
      debug: false,
      ...config,
    };
  }

  /**
   * Extract all entities from input text
   */
  extract(input: string): ExtractedEntity[] {
    const normalized = normalizeText(input);
    const entities: ExtractedEntity[] = [];

    // Extract each entity type
    entities.push(...this.extractCountries(input, normalized));
    entities.push(...this.extractModes(input, normalized));
    entities.push(...this.extractGenres(input, normalized));
    entities.push(...this.extractThemes(input, normalized));
    entities.push(...this.extractLanguages(input, normalized));
    entities.push(...this.extractDirections(input, normalized));
    entities.push(...this.extractQuantities(input, normalized));

    // Filter by confidence threshold
    const filtered = entities.filter(
      (e) => e.confidence >= this.config.entityThreshold
    );

    // Sort by position in text
    filtered.sort((a, b) => a.position.start - b.position.start);

    if (this.config.debug) {
      console.log('[EntityExtractor] Found entities:', filtered);
    }

    return filtered;
  }

  /**
   * Extract country entities
   */
  private extractCountries(
    original: string,
    normalized: string
  ): ExtractedEntity[] {
    const entities: ExtractedEntity[] = [];
    const tokens = tokenize(normalized);

    // Check single tokens
    for (const token of tokens) {
      const countryCode = COUNTRY_MAPPINGS[token];
      if (countryCode) {
        const position = findPatternPosition(normalized, token);
        if (position) {
          entities.push({
            type: 'country',
            value: token,
            normalizedValue: countryCode,
            confidence: 0.9,
            position,
          });
        }
      }
    }

    // Check multi-word country names
    const multiWordCountries = Object.keys(COUNTRY_MAPPINGS).filter((k) =>
      k.includes(' ')
    );
    for (const countryName of multiWordCountries) {
      const normalizedCountry = normalizeText(countryName);
      if (normalized.includes(normalizedCountry)) {
        const position = findPatternPosition(normalized, normalizedCountry);
        if (position) {
          entities.push({
            type: 'country',
            value: countryName,
            normalizedValue: COUNTRY_MAPPINGS[countryName],
            confidence: 0.95,
            position,
          });
        }
      }
    }

    // Deduplicate by country code
    const seen = new Set<string>();
    return entities.filter((e) => {
      if (seen.has(e.normalizedValue)) return false;
      seen.add(e.normalizedValue);
      return true;
    });
  }

  /**
   * Extract mode entities
   */
  private extractModes(
    original: string,
    normalized: string
  ): ExtractedEntity[] {
    const entities: ExtractedEntity[] = [];

    for (const [mode, patterns] of Object.entries(MODE_PATTERNS)) {
      for (const pattern of patterns) {
        const normalizedPattern = normalizeText(pattern);
        // Use word boundary matching to prevent false positives
        if (containsWord(normalized, normalizedPattern)) {
          const position = findPatternPosition(normalized, normalizedPattern);
          if (position) {
            entities.push({
              type: 'mode',
              value: pattern,
              normalizedValue: mode as ModeId,
              confidence: 0.85,
              position,
            });
            break; // Only one match per mode
          }
        }
      }
    }

    return entities;
  }

  /**
   * Extract music genre entities
   */
  private extractGenres(
    original: string,
    normalized: string
  ): ExtractedEntity[] {
    const entities: ExtractedEntity[] = [];

    for (const [genre, patterns] of Object.entries(GENRE_PATTERNS)) {
      for (const pattern of patterns) {
        const normalizedPattern = normalizeText(pattern);
        // Use word boundary matching to prevent false positives
        if (containsWord(normalized, normalizedPattern)) {
          const position = findPatternPosition(normalized, normalizedPattern);
          if (position) {
            entities.push({
              type: 'genre',
              value: pattern,
              normalizedValue: genre,
              confidence: 0.8,
              position,
            });
            break;
          }
        }
      }
    }

    return entities;
  }

  /**
   * Extract theme entities
   */
  private extractThemes(
    original: string,
    normalized: string
  ): ExtractedEntity[] {
    const entities: ExtractedEntity[] = [];

    for (const [theme, patterns] of Object.entries(THEME_PATTERNS)) {
      for (const pattern of patterns) {
        const normalizedPattern = normalizeText(pattern);
        // Use word boundary matching to prevent false positives like "hell" in "hello"
        if (containsWord(normalized, normalizedPattern)) {
          const position = findPatternPosition(normalized, normalizedPattern);
          if (position) {
            entities.push({
              type: 'theme',
              value: pattern,
              normalizedValue: theme as ThemeId,
              confidence: 0.85,
              position,
            });
            break;
          }
        }
      }
    }

    return entities;
  }

  /**
   * Extract language entities
   */
  private extractLanguages(
    original: string,
    normalized: string
  ): ExtractedEntity[] {
    const entities: ExtractedEntity[] = [];

    for (const [lang, patterns] of Object.entries(LANGUAGE_PATTERNS)) {
      for (const pattern of patterns) {
        const normalizedPattern = normalizeText(pattern);
        // Use word boundary matching to prevent false positives
        if (containsWord(normalized, normalizedPattern)) {
          const position = findPatternPosition(normalized, normalizedPattern);
          if (position) {
            entities.push({
              type: 'language',
              value: pattern,
              normalizedValue: lang as LanguageId,
              confidence: 0.9,
              position,
            });
            break;
          }
        }
      }
    }

    return entities;
  }

  /**
   * Extract direction/navigation entities
   */
  private extractDirections(
    original: string,
    normalized: string
  ): ExtractedEntity[] {
    const entities: ExtractedEntity[] = [];

    for (const [direction, patterns] of Object.entries(DIRECTION_PATTERNS)) {
      for (const pattern of patterns) {
        const normalizedPattern = normalizeText(pattern);
        // Use word boundary matching to prevent false positives
        if (containsWord(normalized, normalizedPattern)) {
          const position = findPatternPosition(normalized, normalizedPattern);
          if (position) {
            entities.push({
              type: 'direction',
              value: pattern,
              normalizedValue: direction,
              confidence: 0.8,
              position,
            });
            break;
          }
        }
      }
    }

    return entities;
  }

  /**
   * Extract quantity/number entities
   */
  private extractQuantities(
    original: string,
    normalized: string
  ): ExtractedEntity[] {
    const numbers = extractNumbers(original);
    const entities: ExtractedEntity[] = [];

    for (const num of numbers) {
      const numStr = String(num);
      const position = findPatternPosition(original.toLowerCase(), numStr);
      if (position) {
        entities.push({
          type: 'quantity',
          value: numStr,
          normalizedValue: numStr,
          confidence: 1.0,
          position,
        });
      }
    }

    return entities;
  }

  /**
   * Get all entities of a specific type
   */
  extractByType(input: string, type: EntityType): ExtractedEntity[] {
    return this.extract(input).filter((e) => e.type === type);
  }

  /**
   * Get the first entity of a specific type
   */
  extractFirst(input: string, type: EntityType): ExtractedEntity | null {
    const entities = this.extractByType(input, type);
    return entities.length > 0 ? entities[0] : null;
  }

  /**
   * Check if input contains a specific entity type
   */
  hasEntity(input: string, type: EntityType): boolean {
    return this.extractByType(input, type).length > 0;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<BridgeConfig>): void {
    this.config = { ...this.config, ...config };
  }
}
