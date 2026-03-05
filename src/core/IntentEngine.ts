/**
 * IntentEngine - Natural Language Intent Classification
 *
 * Classifies user input into intent categories using pattern matching
 * and optional embedding-based similarity (via Pythagoras API).
 *
 * Supports multilingual input (en, fr, es, de).
 */

import type {
  IntentCategory,
  ClassifiedIntent,
  BridgeConfig,
  BridgeContext,
} from '../types.js';
import { INTENT_PATTERNS } from '../models/patterns.js';
import { normalizeText, tokenize, calculatePatternScore } from '../utils/text.js';

// ============================================================================
// INTENT ENGINE
// ============================================================================

export class IntentEngine {
  private config: BridgeConfig;
  private embeddingCache: Map<string, number[]> = new Map();

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
   * Classify the intent of a user input
   */
  async classify(
    input: string,
    context?: BridgeContext
  ): Promise<ClassifiedIntent> {
    const normalized = normalizeText(input);
    const tokens = tokenize(normalized);

    if (this.config.debug) {
      console.log('[IntentEngine] Input:', input);
      console.log('[IntentEngine] Tokens:', tokens);
    }

    // 1. Pattern-based classification (fast, no network)
    const patternResult = this.classifyByPatterns(normalized, tokens);

    // 2. If confidence is high enough, return immediately
    if (patternResult.confidence >= this.config.intentThreshold) {
      return {
        ...patternResult,
        raw: input,
      };
    }

    // 3. Optional: Use embedding similarity for ambiguous cases
    // Skip embeddings for 'unknown' category (gibberish has nothing to refine)
    if (
      this.config.useLocalEmbeddings &&
      patternResult.confidence < 0.4 &&
      patternResult.category !== 'unknown'
    ) {
      try {
        const embeddingResult = await this.classifyByEmbeddings(input);
        if (embeddingResult.confidence > patternResult.confidence) {
          return {
            ...embeddingResult,
            raw: input,
          };
        }
      } catch (error) {
        if (this.config.debug) {
          console.warn('[IntentEngine] Embedding classification failed:', error);
        }
      }
    }

    // 4. Context-aware boosting
    const boostedResult = this.applyContextBoost(patternResult, context);

    return {
      ...boostedResult,
      raw: input,
    };
  }

  /**
   * Pattern-based classification using keyword matching
   */
  private classifyByPatterns(
    normalized: string,
    tokens: string[]
  ): Omit<ClassifiedIntent, 'raw'> {
    const scores: Record<IntentCategory, number> = {
      navigation: 0,
      search: 0,
      playback: 0,
      configure: 0,
      challenge: 0,
      info: 0,
      unknown: 0,
    };

    // Score each category based on pattern matches
    for (const [category, patterns] of Object.entries(INTENT_PATTERNS)) {
      if (category === 'unknown') continue;

      const score = calculatePatternScore(normalized, tokens, patterns);
      scores[category as IntentCategory] = score;
    }

    // Find the best matching category
    let bestCategory: IntentCategory = 'unknown';
    let bestScore = 0;

    for (const [category, score] of Object.entries(scores)) {
      if (score > bestScore) {
        bestScore = score;
        bestCategory = category as IntentCategory;
      }
    }

    // Normalize confidence to 0-1 range
    const confidence = Math.min(bestScore / 3, 1); // Max 3 matches = 100%

    // If score is too low, force unknown (handles gibberish input)
    if (bestScore < 0.1) {
      return {
        category: 'unknown',
        confidence,
      };
    }

    // Extract sub-intent if applicable
    const subIntent = this.extractSubIntent(normalized, bestCategory);

    return {
      category: bestCategory,
      confidence,
      subIntent,
    };
  }

  /**
   * Embedding-based classification using Pythagoras API
   */
  private async classifyByEmbeddings(
    input: string
  ): Promise<Omit<ClassifiedIntent, 'raw'>> {
    // Define intent exemplars
    const intentExemplars: Record<IntentCategory, string[]> = {
      navigation: [
        'show me the globe',
        'go to France',
        'open weather mode',
        'navigate to music',
      ],
      search: [
        'find artists from Japan',
        'search for news about climate',
        'where is Germany',
      ],
      playback: [
        'play some jazz music',
        'pause the track',
        'next song please',
      ],
      configure: [
        'change to dark theme',
        'set language to French',
        'enable night mode',
      ],
      challenge: [
        'start a quiz',
        'begin challenge mode',
        'make it harder',
      ],
      info: [
        'what is this country',
        'tell me about the weather',
        'how many artists',
      ],
      unknown: [],
    };

    try {
      // Get embedding for input
      const inputEmbedding = await this.getEmbedding(input);

      let bestCategory: IntentCategory = 'unknown';
      let bestSimilarity = 0;

      // Compare with exemplars
      for (const [category, exemplars] of Object.entries(intentExemplars)) {
        if (category === 'unknown' || exemplars.length === 0) continue;

        for (const exemplar of exemplars) {
          const exemplarEmbedding = await this.getEmbedding(exemplar);
          const similarity = this.cosineSimilarity(inputEmbedding, exemplarEmbedding);

          if (similarity > bestSimilarity) {
            bestSimilarity = similarity;
            bestCategory = category as IntentCategory;
          }
        }
      }

      return {
        category: bestCategory,
        confidence: bestSimilarity,
      };
    } catch (error) {
      throw new Error(`Embedding classification failed: ${error}`);
    }
  }

  /**
   * Get embedding from cache or API
   */
  private async getEmbedding(text: string): Promise<number[]> {
    const cached = this.embeddingCache.get(text);
    if (cached) return cached;

    const response = await fetch(`${this.config.apiBaseUrl}/embeddings/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`Embedding API error: ${response.status}`);
    }

    const data = (await response.json()) as { embedding: number[] };
    const embedding = data.embedding;

    // Cache for future use
    this.embeddingCache.set(text, embedding);

    return embedding;
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    return denominator === 0 ? 0 : dotProduct / denominator;
  }

  /**
   * Extract sub-intent from input based on category
   */
  private extractSubIntent(
    normalized: string,
    category: IntentCategory
  ): string | undefined {
    switch (category) {
      case 'playback':
        if (normalized.includes('play') || normalized.includes('joue')) return 'play';
        if (normalized.includes('pause')) return 'pause';
        if (normalized.includes('next') || normalized.includes('suivant')) return 'next';
        if (normalized.includes('previous') || normalized.includes('précédent')) return 'previous';
        break;
      case 'configure':
        if (normalized.includes('theme') || normalized.includes('thème')) return 'theme';
        if (normalized.includes('language') || normalized.includes('langue')) return 'language';
        break;
      case 'challenge':
        if (normalized.includes('start') || normalized.includes('commence')) return 'start';
        if (normalized.includes('harder') || normalized.includes('plus dur')) return 'increase_difficulty';
        if (normalized.includes('easier') || normalized.includes('plus facile')) return 'decrease_difficulty';
        break;
    }
    return undefined;
  }

  /**
   * Apply context-aware boosting to intent classification
   */
  private applyContextBoost(
    result: Omit<ClassifiedIntent, 'raw'>,
    context?: BridgeContext
  ): Omit<ClassifiedIntent, 'raw'> {
    if (!context) return result;

    let boostedConfidence = result.confidence;

    // Boost playback intents when music mode is active
    if (context.currentMode === 'music' && result.category === 'playback') {
      boostedConfidence = Math.min(boostedConfidence + 0.15, 1);
    }

    // Boost challenge intents when in challenge mode
    if (context.currentMode === 'challenge' && result.category === 'challenge') {
      boostedConfidence = Math.min(boostedConfidence + 0.2, 1);
    }

    // Boost info intents when a country is selected
    if (context.selectedCountry && result.category === 'info') {
      boostedConfidence = Math.min(boostedConfidence + 0.1, 1);
    }

    return {
      ...result,
      confidence: boostedConfidence,
    };
  }

  /**
   * Clear embedding cache
   */
  clearCache(): void {
    this.embeddingCache.clear();
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<BridgeConfig>): void {
    this.config = { ...this.config, ...config };
  }
}
