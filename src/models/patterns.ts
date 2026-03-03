/**
 * Xenova Bridge - Intent Patterns & Entity Dictionaries
 *
 * Multilingual patterns for intent classification and entity extraction.
 * Supports: English (en), French (fr), Spanish (es), German (de)
 */

import type { IntentCategory, ModeId, ThemeId, LanguageId } from '../types.js';

// ============================================================================
// INTENT PATTERNS
// ============================================================================

/**
 * Keywords that indicate specific intent categories
 * Each array contains variations in multiple languages
 */
export const INTENT_PATTERNS: Record<IntentCategory, string[]> = {
  navigation: [
    // English
    'go to', 'show', 'open', 'display', 'navigate', 'take me to', 'switch to',
    // French
    'aller', 'montre', 'affiche', 'ouvre', 'navigue', 'emmène-moi', 'passe',
    // Spanish
    'ir a', 'muestra', 'abre', 'navegar', 'llévame', 'cambiar a',
    // German
    'gehe zu', 'zeige', 'öffne', 'navigiere', 'wechsle zu',
  ],
  search: [
    // English
    'find', 'search', 'look for', 'where is', 'locate', 'query',
    // French
    'trouve', 'cherche', 'recherche', 'où est', 'localise',
    // Spanish
    'busca', 'encuentra', 'dónde está', 'localiza',
    // German
    'finde', 'suche', 'wo ist', 'lokalisiere',
  ],
  playback: [
    // English
    'play', 'pause', 'stop', 'next', 'previous', 'skip', 'shuffle', 'repeat',
    'listen', 'volume',
    // French
    'joue', 'pause', 'arrête', 'suivant', 'précédent', 'passe', 'aléatoire',
    'écoute', 'volume',
    // Spanish
    'reproduce', 'pausa', 'detener', 'siguiente', 'anterior', 'saltar',
    'escucha', 'volumen',
    // German
    'spiele', 'pause', 'stopp', 'nächster', 'vorheriger', 'überspringen',
    'höre', 'lautstärke',
  ],
  configure: [
    // English
    'set', 'change', 'configure', 'enable', 'disable', 'turn on', 'turn off',
    'switch', 'mode', 'theme', 'language', 'dark', 'light',
    // French
    'configure', 'change', 'active', 'désactive', 'allume', 'éteins',
    'mode', 'thème', 'langue', 'sombre', 'clair',
    // Spanish
    'configura', 'cambia', 'activa', 'desactiva', 'enciende', 'apaga',
    'modo', 'tema', 'idioma', 'oscuro', 'claro',
    // German
    'konfiguriere', 'ändere', 'aktiviere', 'deaktiviere', 'einschalten',
    'modus', 'thema', 'sprache', 'dunkel', 'hell',
  ],
  challenge: [
    // English
    'challenge', 'quiz', 'game', 'play game', 'start', 'begin', 'harder',
    'easier', 'difficulty', 'score', 'leaderboard',
    // French
    'défi', 'quiz', 'jeu', 'jouer', 'commence', 'démarre', 'plus dur',
    'plus facile', 'difficulté', 'score', 'classement',
    // Spanish
    'desafío', 'quiz', 'juego', 'jugar', 'comienza', 'empieza', 'más difícil',
    'más fácil', 'dificultad', 'puntuación', 'clasificación',
    // German
    'herausforderung', 'quiz', 'spiel', 'spielen', 'starte', 'beginne',
    'schwieriger', 'einfacher', 'schwierigkeit', 'punktzahl', 'rangliste',
  ],
  info: [
    // English
    'what is', 'tell me', 'info', 'information', 'about', 'details',
    'explain', 'describe', 'who is', 'how many',
    // French
    'c\'est quoi', 'dis-moi', 'info', 'information', 'à propos', 'détails',
    'explique', 'décris', 'qui est', 'combien',
    // Spanish
    'qué es', 'dime', 'info', 'información', 'sobre', 'detalles',
    'explica', 'describe', 'quién es', 'cuántos',
    // German
    'was ist', 'sag mir', 'info', 'information', 'über', 'details',
    'erkläre', 'beschreibe', 'wer ist', 'wie viele',
  ],
  unknown: [],
};

// ============================================================================
// MODE PATTERNS
// ============================================================================

/**
 * Keywords that map to specific modes
 */
export const MODE_PATTERNS: Record<ModeId, string[]> = {
  news: [
    'news', 'actualités', 'noticias', 'nachrichten',
    'headlines', 'articles', 'titres', 'journal',
  ],
  music: [
    'music', 'musique', 'música', 'musik',
    'songs', 'tracks', 'artists', 'chansons', 'artistes',
  ],
  weather: [
    'weather', 'météo', 'tiempo', 'wetter',
    'temperature', 'forecast', 'prévisions', 'clima',
  ],
  wiki: [
    'wiki', 'wikipedia', 'encyclopedia', 'encyclopédie',
    'knowledge', 'learn', 'savoir', 'apprendre',
  ],
  challenge: [
    'challenge', 'défi', 'desafío', 'herausforderung',
    'quiz', 'game', 'jeu', 'juego', 'spiel',
  ],
};

// ============================================================================
// THEME PATTERNS
// ============================================================================

export const THEME_PATTERNS: Record<ThemeId, string[]> = {
  dark: [
    'dark', 'sombre', 'oscuro', 'dunkel',
    'night', 'nuit', 'noche', 'nacht',
    'black', 'noir', 'negro', 'schwarz',
  ],
  green: [
    'green', 'vert', 'verde', 'grün',
    'matrix', 'cyber', 'neon', 'hacker',
  ],
  white: [
    'white', 'blanc', 'blanco', 'weiß',
    'light', 'clair', 'claro', 'hell',
    'day', 'jour', 'día', 'tag',
  ],
};

// ============================================================================
// LANGUAGE PATTERNS
// ============================================================================

export const LANGUAGE_PATTERNS: Record<LanguageId, string[]> = {
  en: ['english', 'anglais', 'inglés', 'englisch', 'en'],
  fr: ['french', 'français', 'francés', 'französisch', 'fr'],
  es: ['spanish', 'espagnol', 'español', 'spanisch', 'es'],
  de: ['german', 'allemand', 'alemán', 'deutsch', 'de'],
};

// ============================================================================
// MUSIC GENRE PATTERNS
// ============================================================================

export const GENRE_PATTERNS: Record<string, string[]> = {
  rock: ['rock', 'rock', 'roca', 'rock'],
  jazz: ['jazz', 'jazz', 'jazz', 'jazz'],
  electronic: ['electronic', 'électronique', 'electrónica', 'elektronisch', 'techno', 'edm', 'house'],
  classical: ['classical', 'classique', 'clásica', 'klassisch', 'orchestra'],
  hiphop: ['hip-hop', 'hip hop', 'rap', 'hiphop'],
  pop: ['pop', 'pop', 'pop', 'pop'],
  metal: ['metal', 'métal', 'metal', 'metal', 'heavy'],
  ambient: ['ambient', 'ambiant', 'ambiental', 'ambient', 'chill', 'relaxing'],
  folk: ['folk', 'folk', 'folk', 'folk', 'acoustic', 'acoustique'],
  world: ['world music', 'música del mundo', 'weltmusik'],
};

// ============================================================================
// DIRECTION PATTERNS
// ============================================================================

export const DIRECTION_PATTERNS: Record<string, string[]> = {
  left: ['left', 'gauche', 'izquierda', 'links'],
  right: ['right', 'droite', 'derecha', 'rechts'],
  up: ['up', 'haut', 'arriba', 'oben', 'north', 'nord'],
  down: ['down', 'bas', 'abajo', 'unten', 'south', 'sud'],
  zoomIn: ['zoom in', 'closer', 'plus proche', 'acercar', 'näher'],
  zoomOut: ['zoom out', 'further', 'plus loin', 'alejar', 'weiter'],
};

// ============================================================================
// COUNTRY NAME MAPPINGS (Top 50 + variations)
// ============================================================================

/**
 * Maps country names/variations to ISO 3166-1 alpha-2 codes
 * Includes common variations and translations
 */
export const COUNTRY_MAPPINGS: Record<string, string> = {
  // A
  'afghanistan': 'AF', 'albania': 'AL', 'algeria': 'DZ', 'argentina': 'AR',
  'australie': 'AU', 'australia': 'AU', 'australien': 'AU',
  'austria': 'AT', 'autriche': 'AT', 'österreich': 'AT',
  // B
  'belgium': 'BE', 'belgique': 'BE', 'belgien': 'BE', 'bélgica': 'BE',
  'brazil': 'BR', 'brésil': 'BR', 'brasil': 'BR', 'brasilien': 'BR',
  'britain': 'GB', 'uk': 'GB', 'united kingdom': 'GB', 'royaume-uni': 'GB',
  'england': 'GB', 'angleterre': 'GB', 'inglaterra': 'GB',
  // C
  'canada': 'CA', 'kanada': 'CA',
  'china': 'CN', 'chine': 'CN',
  'colombia': 'CO', 'colombie': 'CO', 'kolumbien': 'CO',
  // D
  'denmark': 'DK', 'danemark': 'DK', 'dinamarca': 'DK', 'dänemark': 'DK',
  // E
  'egypt': 'EG', 'égypte': 'EG', 'egipto': 'EG', 'ägypten': 'EG',
  // F
  'france': 'FR', 'francia': 'FR', 'frankreich': 'FR',
  'finland': 'FI', 'finlande': 'FI', 'finlandia': 'FI', 'finnland': 'FI',
  // G
  'germany': 'DE', 'allemagne': 'DE', 'alemania': 'DE', 'deutschland': 'DE',
  'greece': 'GR', 'grèce': 'GR', 'grecia': 'GR', 'griechenland': 'GR',
  // I
  'india': 'IN', 'inde': 'IN', 'indien': 'IN',
  'indonesia': 'ID', 'indonésie': 'ID', 'indonesien': 'ID',
  'ireland': 'IE', 'irlande': 'IE', 'irlanda': 'IE', 'irland': 'IE',
  'italy': 'IT', 'italie': 'IT', 'italia': 'IT', 'italien': 'IT',
  'israel': 'IL', 'israël': 'IL',
  // J
  'japan': 'JP', 'japon': 'JP', 'japón': 'JP',
  // K
  'kenya': 'KE', 'kenia': 'KE',
  'korea': 'KR', 'corée': 'KR', 'corea': 'KR', 'south korea': 'KR',
  // M
  'mexico': 'MX', 'mexique': 'MX', 'méxico': 'MX', 'mexiko': 'MX',
  'morocco': 'MA', 'maroc': 'MA', 'marruecos': 'MA', 'marokko': 'MA',
  // N
  'netherlands': 'NL', 'pays-bas': 'NL', 'países bajos': 'NL', 'niederlande': 'NL',
  'holland': 'NL', 'hollande': 'NL', 'holanda': 'NL',
  'nigeria': 'NG', 'nigéria': 'NG',
  'norway': 'NO', 'norvège': 'NO', 'noruega': 'NO', 'norwegen': 'NO',
  'new zealand': 'NZ', 'nouvelle-zélande': 'NZ', 'nueva zelanda': 'NZ', 'neuseeland': 'NZ',
  // P
  'poland': 'PL', 'pologne': 'PL', 'polonia': 'PL', 'polen': 'PL',
  'portugal': 'PT',
  // R
  'russia': 'RU', 'russie': 'RU', 'rusia': 'RU', 'russland': 'RU',
  // S
  'south africa': 'ZA', 'afrique du sud': 'ZA', 'sudáfrica': 'ZA', 'südafrika': 'ZA',
  'spain': 'ES', 'espagne': 'ES', 'españa': 'ES', 'spanien': 'ES',
  'sweden': 'SE', 'suède': 'SE', 'suecia': 'SE', 'schweden': 'SE',
  'switzerland': 'CH', 'suisse': 'CH', 'suiza': 'CH', 'schweiz': 'CH',
  // T
  'thailand': 'TH', 'thaïlande': 'TH', 'tailandia': 'TH',
  'turkey': 'TR', 'turquie': 'TR', 'turquía': 'TR', 'türkei': 'TR',
  // U
  'usa': 'US', 'us': 'US', 'united states': 'US', 'états-unis': 'US',
  'america': 'US', 'amérique': 'US', 'estados unidos': 'US', 'amerika': 'US',
  'ukraine': 'UA', 'ucrania': 'UA',
  // V
  'vietnam': 'VN', 'viêt nam': 'VN',
};

// ============================================================================
// PLAYBACK COMMAND PATTERNS
// ============================================================================

export const PLAYBACK_COMMANDS: Record<string, string[]> = {
  play: ['play', 'joue', 'reproduce', 'spiele', 'start', 'lance'],
  pause: ['pause', 'pause', 'pausa', 'pause'],
  stop: ['stop', 'arrête', 'detener', 'stopp'],
  next: ['next', 'suivant', 'siguiente', 'nächster', 'skip'],
  previous: ['previous', 'précédent', 'anterior', 'vorheriger', 'back'],
  shuffle: ['shuffle', 'aléatoire', 'aleatorio', 'zufällig', 'mix'],
  repeat: ['repeat', 'répète', 'repetir', 'wiederholen', 'loop'],
};
