/**
 * EntityExtractor Tests
 *
 * Tests entity extraction for countries, modes, genres, themes, etc.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { EntityExtractor } from '../core/EntityExtractor.js';

describe('EntityExtractor', () => {
  let extractor: EntityExtractor;

  beforeEach(() => {
    extractor = new EntityExtractor({ debug: false });
  });

  describe('extract', () => {
    // Country extraction
    describe('countries', () => {
      it('should extract "Japan" as country JP', () => {
        const entities = extractor.extract('go to Japan');
        const country = entities.find((e) => e.type === 'country');
        expect(country).toBeDefined();
        expect(country?.normalizedValue).toBe('JP');
      });

      it('should extract "France" as country FR', () => {
        const entities = extractor.extract('show France');
        const country = entities.find((e) => e.type === 'country');
        expect(country).toBeDefined();
        expect(country?.normalizedValue).toBe('FR');
      });

      it('should extract French "Japon" as country JP', () => {
        const entities = extractor.extract('aller au Japon');
        const country = entities.find((e) => e.type === 'country');
        expect(country).toBeDefined();
        expect(country?.normalizedValue).toBe('JP');
      });

      it('should extract "United States" as country US', () => {
        const entities = extractor.extract('go to United States');
        const country = entities.find((e) => e.type === 'country');
        expect(country).toBeDefined();
        expect(country?.normalizedValue).toBe('US');
      });

      it('should extract "USA" as country US', () => {
        const entities = extractor.extract('show USA weather');
        const country = entities.find((e) => e.type === 'country');
        expect(country).toBeDefined();
        expect(country?.normalizedValue).toBe('US');
      });

      it('should extract German "Deutschland" as country DE', () => {
        const entities = extractor.extract('gehe zu Deutschland');
        const country = entities.find((e) => e.type === 'country');
        expect(country).toBeDefined();
        expect(country?.normalizedValue).toBe('DE');
      });
    });

    // Mode extraction
    describe('modes', () => {
      it('should extract "weather" as mode', () => {
        const entities = extractor.extract('show weather');
        const mode = entities.find((e) => e.type === 'mode');
        expect(mode).toBeDefined();
        expect(mode?.normalizedValue).toBe('weather');
      });

      it('should extract "music" as mode', () => {
        const entities = extractor.extract('open music');
        const mode = entities.find((e) => e.type === 'mode');
        expect(mode).toBeDefined();
        expect(mode?.normalizedValue).toBe('music');
      });

      it('should extract French "météo" as weather mode', () => {
        const entities = extractor.extract('affiche la météo');
        const mode = entities.find((e) => e.type === 'mode');
        expect(mode).toBeDefined();
        expect(mode?.normalizedValue).toBe('weather');
      });

      it('should extract "wiki" as mode', () => {
        const entities = extractor.extract('go to wiki');
        const mode = entities.find((e) => e.type === 'mode');
        expect(mode).toBeDefined();
        expect(mode?.normalizedValue).toBe('wiki');
      });

      it('should extract "challenge" as mode', () => {
        const entities = extractor.extract('start challenge');
        const mode = entities.find((e) => e.type === 'mode');
        expect(mode).toBeDefined();
        expect(mode?.normalizedValue).toBe('challenge');
      });
    });

    // Genre extraction
    describe('genres', () => {
      it('should extract "jazz" as genre', () => {
        const entities = extractor.extract('play jazz music');
        const genre = entities.find((e) => e.type === 'genre');
        expect(genre).toBeDefined();
        expect(genre?.normalizedValue).toBe('jazz');
      });

      it('should extract "rock" as genre', () => {
        const entities = extractor.extract('play rock');
        const genre = entities.find((e) => e.type === 'genre');
        expect(genre).toBeDefined();
        expect(genre?.normalizedValue).toBe('rock');
      });

      it('should extract "electronic" as genre', () => {
        const entities = extractor.extract('play electronic music');
        const genre = entities.find((e) => e.type === 'genre');
        expect(genre).toBeDefined();
        expect(genre?.normalizedValue).toBe('electronic');
      });

      it('should extract "techno" as electronic genre', () => {
        const entities = extractor.extract('play techno');
        const genre = entities.find((e) => e.type === 'genre');
        expect(genre).toBeDefined();
        expect(genre?.normalizedValue).toBe('electronic');
      });
    });

    // Theme extraction
    describe('themes', () => {
      it('should extract "dark" as theme', () => {
        const entities = extractor.extract('change to dark theme');
        const theme = entities.find((e) => e.type === 'theme');
        expect(theme).toBeDefined();
        expect(theme?.normalizedValue).toBe('dark');
      });

      it('should extract "green" as theme', () => {
        const entities = extractor.extract('set green mode');
        const theme = entities.find((e) => e.type === 'theme');
        expect(theme).toBeDefined();
        expect(theme?.normalizedValue).toBe('green');
      });

      it('should extract "white" as theme', () => {
        const entities = extractor.extract('enable white theme');
        const theme = entities.find((e) => e.type === 'theme');
        expect(theme).toBeDefined();
        expect(theme?.normalizedValue).toBe('white');
      });

      it('should extract "night" as dark theme', () => {
        const entities = extractor.extract('night mode');
        const theme = entities.find((e) => e.type === 'theme');
        expect(theme).toBeDefined();
        expect(theme?.normalizedValue).toBe('dark');
      });
    });

    // Multiple entities
    describe('multiple entities', () => {
      it('should extract both country and mode', () => {
        const entities = extractor.extract('show weather in Japan');
        expect(entities.length).toBeGreaterThanOrEqual(2);
        expect(entities.find((e) => e.type === 'country')).toBeDefined();
        expect(entities.find((e) => e.type === 'mode')).toBeDefined();
      });

      it('should extract country and genre', () => {
        const entities = extractor.extract('play jazz from France');
        expect(entities.length).toBeGreaterThanOrEqual(2);
        expect(entities.find((e) => e.type === 'country')).toBeDefined();
        expect(entities.find((e) => e.type === 'genre')).toBeDefined();
      });
    });

    // Edge cases
    describe('edge cases', () => {
      it('should handle empty input', () => {
        const entities = extractor.extract('');
        expect(entities).toEqual([]);
      });

      it('should handle input with no entities', () => {
        const entities = extractor.extract('hello world');
        expect(entities.length).toBe(0);
      });

      it('should handle mixed case', () => {
        const entities = extractor.extract('Go To JAPAN');
        const country = entities.find((e) => e.type === 'country');
        expect(country).toBeDefined();
        expect(country?.normalizedValue).toBe('JP');
      });

      it('should handle accented characters', () => {
        const entities = extractor.extract('météo à Paris');
        expect(entities.find((e) => e.type === 'mode')).toBeDefined();
      });
    });
  });

  describe('extractByType', () => {
    it('should return only countries', () => {
      const entities = extractor.extractByType('go to Japan and France', 'country');
      expect(entities.length).toBeGreaterThanOrEqual(1);
      expect(entities.every((e) => e.type === 'country')).toBe(true);
    });
  });

  describe('extractFirst', () => {
    it('should return first country entity', () => {
      const entity = extractor.extractFirst('go to Japan', 'country');
      expect(entity).toBeDefined();
      expect(entity?.type).toBe('country');
    });

    it('should return null if no match', () => {
      const entity = extractor.extractFirst('hello world', 'country');
      expect(entity).toBeNull();
    });
  });

  describe('hasEntity', () => {
    it('should return true if entity exists', () => {
      const has = extractor.hasEntity('go to Japan', 'country');
      expect(has).toBe(true);
    });

    it('should return false if entity does not exist', () => {
      const has = extractor.hasEntity('hello world', 'country');
      expect(has).toBe(false);
    });
  });
});
