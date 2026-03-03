/**
 * Xenova Brain - Standalone NLP Service
 *
 * Provides REST API for intent classification and entity extraction.
 * Can run independently in Docker or as part of the monorepo.
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import {
  XenovaBridge,
  type BridgeContext,
  type CommandResult,
  type ClassifiedIntent,
  type ExtractedEntity,
} from './index.js';

// ============================================================================
// CONFIGURATION
// ============================================================================

const PORT = parseInt(process.env.PORT || '3010', 10);
const DEBUG = process.env.DEBUG === 'true';

const app = express();
const bridge = new XenovaBridge({ debug: DEBUG });

// ============================================================================
// MIDDLEWARE
// ============================================================================

app.use(cors());
app.use(express.json({ limit: '10kb' }));

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
  });
  next();
});

// ============================================================================
// VALIDATION
// ============================================================================

const DEFAULT_CONTEXT: BridgeContext = {
  currentMode: null,
  currentTheme: 'dark',
  language: 'en',
};

function validateInput(input: unknown): { valid: boolean; value?: string; error?: string } {
  if (typeof input !== 'string') {
    return { valid: false, error: 'Input must be a string' };
  }

  const trimmed = input.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: 'Input cannot be empty' };
  }

  if (trimmed.length > 500) {
    return { valid: false, error: 'Input exceeds 500 character limit' };
  }

  return { valid: true, value: trimmed };
}

function validateContext(ctx: unknown): BridgeContext {
  if (!ctx || typeof ctx !== 'object') {
    return DEFAULT_CONTEXT;
  }

  const obj = ctx as Record<string, unknown>;
  const validModes = ['news', 'music', 'weather', 'wiki', 'challenge'];
  const validThemes = ['dark', 'green', 'white'];
  const validLanguages = ['en', 'fr', 'es', 'de'];

  return {
    currentMode: validModes.includes(obj.currentMode as string)
      ? (obj.currentMode as BridgeContext['currentMode'])
      : null,
    selectedCountry: typeof obj.selectedCountry === 'string'
      ? obj.selectedCountry.slice(0, 2).toUpperCase()
      : undefined,
    currentTheme: validThemes.includes(obj.currentTheme as string)
      ? (obj.currentTheme as BridgeContext['currentTheme'])
      : 'dark',
    language: validLanguages.includes(obj.language as string)
      ? (obj.language as BridgeContext['language'])
      : 'en',
    isPlaying: typeof obj.isPlaying === 'boolean' ? obj.isPlaying : undefined,
  };
}

// ============================================================================
// ROUTES
// ============================================================================

/**
 * GET /health
 * Health check endpoint
 */
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'xenova-brain',
    version: '0.1.0',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

/**
 * GET /
 * Service info
 */
app.get('/', (_req: Request, res: Response) => {
  res.json({
    service: 'Xenova Brain',
    description: 'Natural Language Processing service for AeryFlux',
    version: '0.1.0',
    endpoints: {
      'GET /health': 'Health check',
      'POST /process': 'Full command processing pipeline',
      'POST /classify': 'Intent classification only',
      'POST /entities': 'Entity extraction only',
      'GET /suggestions': 'Get contextual suggestions',
    },
  });
});

/**
 * POST /process
 * Full command processing pipeline
 */
app.post('/process', async (req: Request, res: Response) => {
  const validation = validateInput(req.body.input);

  if (!validation.valid) {
    res.status(400).json({ success: false, error: validation.error });
    return;
  }

  const context = validateContext(req.body.context);

  try {
    const result = await bridge.process(validation.value!, context);
    res.json(result);
  } catch (error) {
    console.error('[Xenova Brain] Process error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal processing error',
    });
  }
});

/**
 * POST /classify
 * Intent classification only
 */
app.post('/classify', async (req: Request, res: Response) => {
  const validation = validateInput(req.body.input);

  if (!validation.valid) {
    res.status(400).json({ success: false, error: validation.error });
    return;
  }

  try {
    const intent = await bridge.quickCheck(validation.value!);
    res.json({ success: true, intent });
  } catch (error) {
    console.error('[Xenova Brain] Classify error:', error);
    res.status(500).json({
      success: false,
      error: 'Classification error',
    });
  }
});

/**
 * POST /entities
 * Entity extraction only
 */
app.post('/entities', (req: Request, res: Response) => {
  const validation = validateInput(req.body.input);

  if (!validation.valid) {
    res.status(400).json({ success: false, error: validation.error });
    return;
  }

  try {
    const entities = bridge.extractEntities(validation.value!);
    res.json({
      success: true,
      entities,
      count: entities.length,
    });
  } catch (error) {
    console.error('[Xenova Brain] Entities error:', error);
    res.status(500).json({
      success: false,
      error: 'Extraction error',
    });
  }
});

/**
 * GET /suggestions
 * Get contextual suggestions
 */
app.get('/suggestions', (req: Request, res: Response) => {
  const mode = req.query.mode as string | undefined;
  const language = (req.query.language as string) || 'en';

  const suggestions = getSuggestions(mode, language);
  res.json({ success: true, suggestions });
});

// ============================================================================
// SUGGESTIONS
// ============================================================================

function getSuggestions(mode: string | undefined, language: string): string[] {
  const suggestions: Record<string, Record<string, string[]>> = {
    en: {
      default: ['Show weather in Paris', 'Play jazz music', 'Go to Japan'],
      news: ['Search tech news', 'Show headlines'],
      music: ['Play rock music', 'Next track'],
      weather: ['Show Paris weather', 'Switch to music'],
      wiki: ['Tell me about France', 'Search history'],
      challenge: ['Start new quiz', 'Make it harder'],
    },
    fr: {
      default: ['Montre la météo à Paris', 'Joue du jazz', 'Aller au Japon'],
      news: ['Cherche actualités tech', 'Affiche les titres'],
      music: ['Joue du rock', 'Suivant'],
      weather: ['Météo Paris', 'Mode musique'],
      wiki: ['Parle-moi de la France', 'Recherche histoire'],
      challenge: ['Nouveau quiz', 'Plus difficile'],
    },
    es: {
      default: ['Muestra el tiempo en París', 'Reproduce jazz', 'Ir a Japón'],
      music: ['Reproduce rock', 'Siguiente'],
    },
    de: {
      default: ['Zeige Wetter in Paris', 'Spiele Jazz', 'Gehe nach Japan'],
      music: ['Spiele Rock', 'Nächster'],
    },
  };

  const langSuggestions = suggestions[language] || suggestions.en;
  return langSuggestions[mode || 'default'] || langSuggestions.default;
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Xenova Brain] Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
});

// ============================================================================
// STARTUP
// ============================================================================

async function warmup() {
  console.log('[Xenova Brain] Warming up model...');
  try {
    await bridge.process('warmup test', DEFAULT_CONTEXT);
    console.log('[Xenova Brain] Model ready');
  } catch (error) {
    console.warn('[Xenova Brain] Warmup failed (will retry on first request):', error);
  }
}

warmup().then(() => {
  app.listen(PORT, () => {
    console.log(`[Xenova Brain] Running on http://localhost:${PORT}`);
    console.log('[Xenova Brain] Endpoints:');
    console.log('  GET  /health      - Health check');
    console.log('  POST /process     - Full pipeline');
    console.log('  POST /classify    - Intent only');
    console.log('  POST /entities    - Entities only');
    console.log('  GET  /suggestions - Suggestions');
  });
});

export default app;
