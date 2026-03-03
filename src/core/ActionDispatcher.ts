/**
 * ActionDispatcher - Translate Intents to Component Actions
 *
 * Takes classified intents and extracted entities, then generates
 * a sequence of actions that can be dispatched to AeryFlux components.
 */

import type {
  ClassifiedIntent,
  ExtractedEntity,
  BridgeAction,
  ActionType,
  BridgeContext,
  ModeId,
  ThemeId,
  LanguageId,
  GlobeRotatePayload,
  GlobeSelectCountryPayload,
  ModeSwitchPayload,
  MusicFilterPayload,
  ConfigSetThemePayload,
  ConfigSetLanguagePayload,
  SearchExecutePayload,
} from '../types.js';

// ============================================================================
// COUNTRY COORDINATES (Top countries for globe rotation)
// ============================================================================

const COUNTRY_COORDINATES: Record<string, { lat: number; lon: number }> = {
  US: { lat: 39.8, lon: -98.5 },
  FR: { lat: 46.6, lon: 2.2 },
  DE: { lat: 51.2, lon: 10.5 },
  GB: { lat: 54.0, lon: -2.0 },
  JP: { lat: 36.2, lon: 138.3 },
  CN: { lat: 35.9, lon: 104.2 },
  BR: { lat: -14.2, lon: -51.9 },
  AU: { lat: -25.3, lon: 133.8 },
  IN: { lat: 20.6, lon: 79.0 },
  RU: { lat: 61.5, lon: 105.3 },
  CA: { lat: 56.1, lon: -106.3 },
  MX: { lat: 23.6, lon: -102.5 },
  IT: { lat: 41.9, lon: 12.6 },
  ES: { lat: 40.5, lon: -3.7 },
  KR: { lat: 35.9, lon: 127.8 },
  ZA: { lat: -30.6, lon: 22.9 },
  AR: { lat: -38.4, lon: -63.6 },
  EG: { lat: 26.8, lon: 30.8 },
  NG: { lat: 9.1, lon: 8.7 },
  SE: { lat: 60.1, lon: 18.6 },
  NO: { lat: 60.5, lon: 8.5 },
  NL: { lat: 52.1, lon: 5.3 },
  BE: { lat: 50.5, lon: 4.5 },
  CH: { lat: 46.8, lon: 8.2 },
  AT: { lat: 47.5, lon: 14.6 },
  PL: { lat: 51.9, lon: 19.1 },
  TR: { lat: 39.0, lon: 35.2 },
  GR: { lat: 39.1, lon: 21.8 },
  PT: { lat: 39.4, lon: -8.2 },
  IE: { lat: 53.1, lon: -8.2 },
  NZ: { lat: -40.9, lon: 174.9 },
  TH: { lat: 15.9, lon: 100.9 },
  VN: { lat: 14.1, lon: 108.3 },
  ID: { lat: -0.8, lon: 113.9 },
  PH: { lat: 12.9, lon: 121.8 },
  MY: { lat: 4.2, lon: 101.9 },
  SG: { lat: 1.4, lon: 103.8 },
  KE: { lat: -0.0, lon: 37.9 },
  MA: { lat: 31.8, lon: -7.1 },
  IL: { lat: 31.0, lon: 34.9 },
  AE: { lat: 23.4, lon: 53.8 },
  SA: { lat: 23.9, lon: 45.1 },
  CL: { lat: -35.7, lon: -71.5 },
  CO: { lat: 4.6, lon: -74.3 },
  PE: { lat: -9.2, lon: -75.0 },
  UA: { lat: 48.4, lon: 31.2 },
  FI: { lat: 61.9, lon: 25.7 },
  DK: { lat: 56.3, lon: 9.5 },
};

// ============================================================================
// ACTION DISPATCHER
// ============================================================================

export class ActionDispatcher {
  /**
   * Generate actions from classified intent and extracted entities
   */
  dispatch(
    intent: ClassifiedIntent,
    entities: ExtractedEntity[],
    context: BridgeContext
  ): BridgeAction[] {
    const actions: BridgeAction[] = [];

    switch (intent.category) {
      case 'navigation':
        actions.push(...this.handleNavigation(entities, context));
        break;

      case 'search':
        actions.push(...this.handleSearch(intent, entities, context));
        break;

      case 'playback':
        actions.push(...this.handlePlayback(intent, entities, context));
        break;

      case 'configure':
        actions.push(...this.handleConfigure(intent, entities, context));
        break;

      case 'challenge':
        actions.push(...this.handleChallenge(intent, entities, context));
        break;

      case 'info':
        actions.push(...this.handleInfo(entities, context));
        break;
    }

    return actions;
  }

  /**
   * Handle navigation intents
   */
  private handleNavigation(
    entities: ExtractedEntity[],
    context: BridgeContext
  ): BridgeAction[] {
    const actions: BridgeAction[] = [];
    const now = Date.now();

    // Check for mode switch
    const modeEntity = entities.find((e) => e.type === 'mode');
    if (modeEntity) {
      actions.push(this.createAction('mode:switch', {
        mode: modeEntity.normalizedValue as ModeId,
        transition: 'morph',
      } as ModeSwitchPayload, 'high', now));
    }

    // Check for country navigation
    const countryEntity = entities.find((e) => e.type === 'country');
    if (countryEntity) {
      const countryCode = countryEntity.normalizedValue;
      const coords = COUNTRY_COORDINATES[countryCode];

      if (coords) {
        actions.push(this.createAction('globe:rotate', {
          lat: coords.lat,
          lon: coords.lon,
          duration: 1500,
        } as GlobeRotatePayload, 'normal', now));
      }

      actions.push(this.createAction('globe:select-country', {
        countryCode,
        highlight: true,
      } as GlobeSelectCountryPayload, 'normal', now + 100));
    }

    // Check for direction commands
    const directionEntity = entities.find((e) => e.type === 'direction');
    if (directionEntity) {
      const direction = directionEntity.normalizedValue;

      if (direction === 'zoomIn') {
        actions.push(this.createAction('globe:zoom', { level: 1.5, duration: 500 }, 'normal', now));
      } else if (direction === 'zoomOut') {
        actions.push(this.createAction('globe:zoom', { level: 0.7, duration: 500 }, 'normal', now));
      } else if (direction === 'left') {
        actions.push(this.createAction('drawer:open-left', {}, 'normal', now));
      } else if (direction === 'right') {
        actions.push(this.createAction('drawer:open-right', {}, 'normal', now));
      }
    }

    return actions;
  }

  /**
   * Handle search intents
   */
  private handleSearch(
    intent: ClassifiedIntent,
    entities: ExtractedEntity[],
    context: BridgeContext
  ): BridgeAction[] {
    const now = Date.now();

    // Build search query from entities and raw input
    const filters: Record<string, string> = {};

    const countryEntity = entities.find((e) => e.type === 'country');
    if (countryEntity) {
      filters.country = countryEntity.normalizedValue;
    }

    const genreEntity = entities.find((e) => e.type === 'genre');
    if (genreEntity) {
      filters.genre = genreEntity.normalizedValue;
    }

    // Extract the search query (what's left after removing entities)
    let query = intent.raw;
    for (const entity of entities) {
      query = query.replace(new RegExp(entity.value, 'gi'), '').trim();
    }

    // Remove common search prefixes
    query = query
      .replace(/^(find|search|look for|cherche|trouve|busca|finde)\s*/i, '')
      .trim();

    return [
      this.createAction('search:execute', {
        query: query || intent.raw,
        scope: context.currentMode || 'all',
        filters,
      } as SearchExecutePayload, 'high', now),
    ];
  }

  /**
   * Handle playback intents
   */
  private handlePlayback(
    intent: ClassifiedIntent,
    entities: ExtractedEntity[],
    context: BridgeContext
  ): BridgeAction[] {
    const actions: BridgeAction[] = [];
    const now = Date.now();

    // Switch to music mode if not already there
    if (context.currentMode !== 'music') {
      actions.push(this.createAction('mode:switch', {
        mode: 'music',
        transition: 'fade',
      } as ModeSwitchPayload, 'high', now));
    }

    // Handle playback command based on sub-intent
    switch (intent.subIntent) {
      case 'play':
        // Check for filters
        const genreEntity = entities.find((e) => e.type === 'genre');
        const countryEntity = entities.find((e) => e.type === 'country');

        if (genreEntity || countryEntity) {
          actions.push(this.createAction('music:filter-genre', {
            genre: genreEntity?.normalizedValue,
            country: countryEntity?.normalizedValue,
          } as MusicFilterPayload, 'normal', now + 100));
        }

        actions.push(this.createAction('music:play', {}, 'high', now + 200));
        break;

      case 'pause':
        actions.push(this.createAction('music:pause', {}, 'high', now));
        break;

      case 'next':
        actions.push(this.createAction('music:next', {}, 'high', now));
        break;

      case 'previous':
        actions.push(this.createAction('music:previous', {}, 'high', now));
        break;

      default:
        // Generic play if no specific sub-intent
        actions.push(this.createAction('music:play', {}, 'normal', now));
    }

    return actions;
  }

  /**
   * Handle configuration intents
   */
  private handleConfigure(
    intent: ClassifiedIntent,
    entities: ExtractedEntity[],
    context: BridgeContext
  ): BridgeAction[] {
    const actions: BridgeAction[] = [];
    const now = Date.now();

    // Theme change
    const themeEntity = entities.find((e) => e.type === 'theme');
    if (themeEntity) {
      actions.push(this.createAction('config:set-theme', {
        theme: themeEntity.normalizedValue as ThemeId,
      } as ConfigSetThemePayload, 'high', now));
    }

    // Language change
    const langEntity = entities.find((e) => e.type === 'language');
    if (langEntity) {
      actions.push(this.createAction('config:set-language', {
        language: langEntity.normalizedValue as LanguageId,
      } as ConfigSetLanguagePayload, 'high', now));
    }

    return actions;
  }

  /**
   * Handle challenge intents
   */
  private handleChallenge(
    intent: ClassifiedIntent,
    entities: ExtractedEntity[],
    context: BridgeContext
  ): BridgeAction[] {
    const actions: BridgeAction[] = [];
    const now = Date.now();

    // Switch to challenge mode if not already there
    if (context.currentMode !== 'challenge') {
      actions.push(this.createAction('mode:switch', {
        mode: 'challenge',
        transition: 'morph',
      } as ModeSwitchPayload, 'high', now));
    }

    // Handle specific challenge commands
    switch (intent.subIntent) {
      case 'start':
        actions.push(this.createAction('challenge:start', {}, 'high', now + 100));
        break;

      case 'increase_difficulty':
        actions.push(this.createAction('challenge:answer', { difficulty: '+1' }, 'normal', now));
        break;

      case 'decrease_difficulty':
        actions.push(this.createAction('challenge:answer', { difficulty: '-1' }, 'normal', now));
        break;

      default:
        // Default: start a new challenge
        actions.push(this.createAction('challenge:start', {}, 'normal', now + 100));
    }

    return actions;
  }

  /**
   * Handle info intents
   */
  private handleInfo(
    entities: ExtractedEntity[],
    context: BridgeContext
  ): BridgeAction[] {
    const actions: BridgeAction[] = [];
    const now = Date.now();

    // If asking about a country, navigate to it
    const countryEntity = entities.find((e) => e.type === 'country');
    if (countryEntity) {
      const countryCode = countryEntity.normalizedValue;
      const coords = COUNTRY_COORDINATES[countryCode];

      if (coords) {
        actions.push(this.createAction('globe:rotate', {
          lat: coords.lat,
          lon: coords.lon,
          duration: 1200,
        } as GlobeRotatePayload, 'normal', now));
      }

      actions.push(this.createAction('globe:select-country', {
        countryCode,
        highlight: true,
      } as GlobeSelectCountryPayload, 'normal', now + 100));

      // If in wiki mode, trigger info display
      if (context.currentMode === 'wiki') {
        actions.push(this.createAction('search:execute', {
          query: countryEntity.value,
          scope: 'wiki',
        } as SearchExecutePayload, 'normal', now + 200));
      }
    }

    return actions;
  }

  /**
   * Create a typed action
   */
  private createAction<T>(
    type: ActionType,
    payload: T,
    priority: 'high' | 'normal' | 'low',
    timestamp: number
  ): BridgeAction<T> {
    return {
      type,
      payload,
      priority,
      timestamp,
    };
  }

  /**
   * Sort actions by priority and timestamp
   */
  sortActions(actions: BridgeAction[]): BridgeAction[] {
    const priorityOrder = { high: 0, normal: 1, low: 2 };

    return [...actions].sort((a, b) => {
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return a.timestamp - b.timestamp;
    });
  }
}
