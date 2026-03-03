/**
 * IntentEngine Tests
 *
 * Tests intent classification across multiple languages and contexts.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { IntentEngine } from '../core/IntentEngine.js';
import type { BridgeContext } from '../types.js';

describe('IntentEngine', () => {
  let engine: IntentEngine;

  beforeEach(() => {
    engine = new IntentEngine({ debug: false });
  });

  describe('classify', () => {
    // Navigation intents
    describe('navigation', () => {
      it('should classify "go to Japan" as navigation', async () => {
        const result = await engine.classify('go to Japan');
        expect(result.category).toBe('navigation');
        expect(result.confidence).toBeGreaterThan(0.5);
      });

      it('should classify "show weather" as navigation', async () => {
        const result = await engine.classify('show weather');
        expect(result.category).toBe('navigation');
      });

      it('should classify French "montre la météo" as navigation', async () => {
        const result = await engine.classify('montre la météo');
        expect(result.category).toBe('navigation');
      });

      it('should classify Spanish "ir a Japón" as navigation', async () => {
        const result = await engine.classify('ir a Japón');
        expect(result.category).toBe('navigation');
      });

      it('should classify German "gehe zu Japan" as navigation', async () => {
        const result = await engine.classify('gehe zu Japan');
        expect(result.category).toBe('navigation');
      });
    });

    // Playback intents
    describe('playback', () => {
      it('should classify "play jazz music" as playback', async () => {
        const result = await engine.classify('play jazz music');
        expect(result.category).toBe('playback');
        expect(result.subIntent).toBe('play');
      });

      it('should classify "pause" as playback', async () => {
        const result = await engine.classify('pause');
        expect(result.category).toBe('playback');
        expect(result.subIntent).toBe('pause');
      });

      it('should classify "next song" as playback', async () => {
        const result = await engine.classify('next song');
        expect(result.category).toBe('playback');
        expect(result.subIntent).toBe('next');
      });

      it('should classify French "joue du rock" as playback', async () => {
        const result = await engine.classify('joue du rock');
        expect(result.category).toBe('playback');
      });
    });

    // Search intents
    describe('search', () => {
      it('should classify "find artists from France" as search', async () => {
        const result = await engine.classify('find artists from France');
        expect(result.category).toBe('search');
      });

      it('should classify "where is Germany" as search', async () => {
        const result = await engine.classify('where is Germany');
        expect(result.category).toBe('search');
      });

      it('should classify French "cherche musique jazz" as search', async () => {
        const result = await engine.classify('cherche musique jazz');
        expect(result.category).toBe('search');
      });
    });

    // Configure intents
    describe('configure', () => {
      it('should classify "change to dark theme" as configure', async () => {
        const result = await engine.classify('change to dark theme');
        expect(result.category).toBe('configure');
        expect(result.subIntent).toBe('theme');
      });

      it('should classify "set language to French" as configure', async () => {
        const result = await engine.classify('set language to French');
        expect(result.category).toBe('configure');
        expect(result.subIntent).toBe('language');
      });
    });

    // Challenge intents
    describe('challenge', () => {
      it('should classify "start a quiz" as challenge', async () => {
        const result = await engine.classify('start a quiz');
        expect(result.category).toBe('challenge');
        expect(result.subIntent).toBe('start');
      });

      it('should classify "make it harder" as challenge', async () => {
        const result = await engine.classify('make it harder');
        expect(result.category).toBe('challenge');
        expect(result.subIntent).toBe('increase_difficulty');
      });
    });

    // Info intents
    describe('info', () => {
      it('should classify "what is this country" as info', async () => {
        const result = await engine.classify('what is this country');
        expect(result.category).toBe('info');
      });

      it('should classify "tell me about France" as info', async () => {
        const result = await engine.classify('tell me about France');
        expect(result.category).toBe('info');
      });
    });

    // Unknown intents
    describe('unknown', () => {
      it('should classify gibberish as unknown with low confidence', async () => {
        const result = await engine.classify('asdfghjkl');
        expect(result.category).toBe('unknown');
        expect(result.confidence).toBeLessThan(0.3);
      });
    });

    // Context boosting
    describe('context boosting', () => {
      it('should boost playback confidence when in music mode', async () => {
        const context: BridgeContext = {
          currentMode: 'music',
          currentTheme: 'dark',
          language: 'en',
        };

        const withContext = await engine.classify('next', context);
        const withoutContext = await engine.classify('next');

        expect(withContext.confidence).toBeGreaterThanOrEqual(withoutContext.confidence);
      });

      it('should boost challenge confidence when in challenge mode', async () => {
        const context: BridgeContext = {
          currentMode: 'challenge',
          currentTheme: 'dark',
          language: 'en',
        };

        const result = await engine.classify('harder', context);
        expect(result.confidence).toBeGreaterThan(0.3);
      });
    });
  });

  describe('cache management', () => {
    it('should clear cache without errors', () => {
      expect(() => engine.clearCache()).not.toThrow();
    });
  });

  describe('config update', () => {
    it('should update config without errors', () => {
      expect(() => engine.updateConfig({ debug: true })).not.toThrow();
    });
  });
});
