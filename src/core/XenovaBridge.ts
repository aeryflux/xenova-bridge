/**
 * XenovaBridge - Main Entry Point
 *
 * Orchestrates the full pipeline:
 * 1. Receive user input
 * 2. Classify intent (IntentEngine)
 * 3. Extract entities (EntityExtractor)
 * 4. Generate actions (ActionDispatcher)
 * 5. Return structured CommandResult
 */

import type {
  CommandResult,
  BridgeContext,
  BridgeConfig,
  BridgeAction,
  ClassifiedIntent,
  ExtractedEntity,
  DEFAULT_CONFIG,
} from '../types.js';
import { IntentEngine } from './IntentEngine.js';
import { EntityExtractor } from './EntityExtractor.js';
import { ActionDispatcher } from './ActionDispatcher.js';

// ============================================================================
// XENOVA BRIDGE
// ============================================================================

export class XenovaBridge {
  private intentEngine: IntentEngine;
  private entityExtractor: EntityExtractor;
  private actionDispatcher: ActionDispatcher;
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

    this.intentEngine = new IntentEngine(this.config);
    this.entityExtractor = new EntityExtractor(this.config);
    this.actionDispatcher = new ActionDispatcher();
  }

  /**
   * Process a user command and return structured result
   */
  async process(
    input: string,
    context: BridgeContext
  ): Promise<CommandResult> {
    const startTime = Date.now();

    if (this.config.debug) {
      console.log('[XenovaBridge] Processing:', input);
      console.log('[XenovaBridge] Context:', context);
    }

    // 1. Classify intent
    const intent = await this.intentEngine.classify(input, context);

    // 2. Extract entities
    const entities = this.entityExtractor.extract(input);

    // 3. Generate actions
    const actions = this.actionDispatcher.dispatch(intent, entities, context);

    // 4. Sort actions by priority
    const sortedActions = this.actionDispatcher.sortActions(actions);

    // 5. Generate feedback and suggestions
    const feedback = this.generateFeedback(intent, entities, sortedActions);
    const suggestions = this.generateSuggestions(intent, context);

    const result: CommandResult = {
      success: intent.category !== 'unknown' && sortedActions.length > 0,
      intent,
      entities,
      actions: sortedActions,
      feedback,
      suggestions,
    };

    if (this.config.debug) {
      const elapsed = Date.now() - startTime;
      console.log(`[XenovaBridge] Processed in ${elapsed}ms:`, result);
    }

    return result;
  }

  /**
   * Generate user feedback message
   */
  private generateFeedback(
    intent: ClassifiedIntent,
    entities: ExtractedEntity[],
    actions: BridgeAction[]
  ): string {
    if (intent.category === 'unknown') {
      return "I didn't understand that command. Try something like 'show weather in Japan' or 'play jazz music'.";
    }

    if (actions.length === 0) {
      return "I understood your intent but couldn't determine what action to take.";
    }

    // Generate context-aware feedback
    const actionTypes = actions.map((a) => a.type);

    if (actionTypes.includes('mode:switch')) {
      const modeAction = actions.find((a) => a.type === 'mode:switch');
      const mode = (modeAction?.payload as { mode: string })?.mode;
      return `Switching to ${mode} mode.`;
    }

    if (actionTypes.includes('globe:rotate')) {
      const countryEntity = entities.find((e) => e.type === 'country');
      if (countryEntity) {
        return `Navigating to ${countryEntity.value}.`;
      }
    }

    if (actionTypes.includes('music:play')) {
      const genreEntity = entities.find((e) => e.type === 'genre');
      if (genreEntity) {
        return `Playing ${genreEntity.value} music.`;
      }
      return 'Playing music.';
    }

    if (actionTypes.includes('config:set-theme')) {
      const themeEntity = entities.find((e) => e.type === 'theme');
      return `Changing to ${themeEntity?.value || 'new'} theme.`;
    }

    if (actionTypes.includes('search:execute')) {
      return 'Searching...';
    }

    return 'Command received.';
  }

  /**
   * Generate follow-up suggestions
   */
  private generateSuggestions(
    intent: ClassifiedIntent,
    context: BridgeContext
  ): string[] {
    const suggestions: string[] = [];

    switch (intent.category) {
      case 'navigation':
        if (context.currentMode !== 'music') {
          suggestions.push('Play some music');
        }
        suggestions.push('Show weather');
        break;

      case 'playback':
        suggestions.push('Next track');
        suggestions.push('Play rock music');
        suggestions.push('Filter by country');
        break;

      case 'configure':
        suggestions.push('Try dark theme');
        suggestions.push('Change language');
        break;

      case 'search':
        suggestions.push('Search in another mode');
        suggestions.push('Filter by country');
        break;

      case 'unknown':
        suggestions.push('Show weather in Paris');
        suggestions.push('Play jazz music');
        suggestions.push('Go to Japan');
        suggestions.push('Start challenge');
        break;
    }

    return suggestions.slice(0, 3);
  }

  /**
   * Quick intent check without full processing
   */
  async quickCheck(input: string): Promise<ClassifiedIntent> {
    return this.intentEngine.classify(input);
  }

  /**
   * Extract entities without intent classification
   */
  extractEntities(input: string): ExtractedEntity[] {
    return this.entityExtractor.extract(input);
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<BridgeConfig>): void {
    this.config = { ...this.config, ...config };
    this.intentEngine.updateConfig(config);
    this.entityExtractor.updateConfig(config);
  }

  /**
   * Clear caches
   */
  clearCaches(): void {
    this.intentEngine.clearCache();
  }

  /**
   * Get current configuration
   */
  getConfig(): BridgeConfig {
    return { ...this.config };
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let defaultBridge: XenovaBridge | null = null;

/**
 * Get or create the default XenovaBridge instance
 */
export function getBridge(config?: Partial<BridgeConfig>): XenovaBridge {
  if (!defaultBridge) {
    defaultBridge = new XenovaBridge(config);
  } else if (config) {
    defaultBridge.updateConfig(config);
  }
  return defaultBridge;
}

/**
 * Process a command using the default bridge
 */
export async function processCommand(
  input: string,
  context: BridgeContext,
  config?: Partial<BridgeConfig>
): Promise<CommandResult> {
  const bridge = getBridge(config);
  return bridge.process(input, context);
}
