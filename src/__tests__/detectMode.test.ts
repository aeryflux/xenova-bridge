import { describe, it, expect } from 'vitest';
import { detectMode } from '../../src/index.js';

describe('detectMode', () => {
  // ── News / Sports ────────────────────────────────────────────────────────
  it('returns news for "football"', () => expect(detectMode('football')).toBe('news'));
  it('returns news for "rugby"', () => expect(detectMode('rugby')).toBe('news'));
  it('returns news for "F1"', () => expect(detectMode('F1')).toBe('news'));
  it('returns news for "actualités"', () => expect(detectMode('actualités')).toBe('news'));
  it('returns news for "latest news"', () => expect(detectMode('latest news')).toBe('news'));

  // ── Weather ──────────────────────────────────────────────────────────────
  it('returns weather for "météo"', () => expect(detectMode('météo')).toBe('weather'));
  it('returns weather for "weather"', () => expect(detectMode('weather')).toBe('weather'));
  it('returns weather for "Wetter"', () => expect(detectMode('Wetter')).toBe('weather'));

  // ── Music ────────────────────────────────────────────────────────────────
  it('returns music for "music"', () => expect(detectMode('music')).toBe('music'));
  it('returns music for "musique"', () => expect(detectMode('musique')).toBe('music'));

  // ── Wiki fallback (universal) ────────────────────────────────────────────
  it('returns wiki for "guerre de cent ans"', () =>
    expect(detectMode('guerre de cent ans')).toBe('wiki'));
  it('returns wiki for "natural language processing"', () =>
    expect(detectMode('natural language processing')).toBe('wiki'));
  it('returns wiki for kanji 覇気', () =>
    expect(detectMode('覇気')).toBe('wiki'));
  it('returns wiki for an unknown word', () =>
    expect(detectMode('xyzzy')).toBe('wiki'));
  it('returns wiki for a country name (no other mode matches)', () =>
    expect(detectMode('Japan')).toBe('wiki'));

  // ── Explicit wiki keywords ────────────────────────────────────────────────
  it('returns wiki for "wikipedia france"', () =>
    expect(detectMode('wikipedia france')).toBe('wiki'));

  // ── Null for empty / trivial ─────────────────────────────────────────────
  it('returns null for empty string', () => expect(detectMode('')).toBeNull());
  it('returns null for whitespace only', () => expect(detectMode('   ')).toBeNull());
  it('returns null for single char', () => expect(detectMode('a')).toBeNull());
});
