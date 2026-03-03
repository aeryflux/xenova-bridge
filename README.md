# @aeryflux/xenova-bridge

Natural language interface bridge between users and AeryFlux components.

## Overview

Xenova Bridge provides intent classification, entity extraction, and action dispatching for natural language commands in AeryFlux applications. It acts as the "passerelle" (bridge) between user input and the functional components (globe, modes, music, challenges).

## Features

- **Intent Classification**: Classifies user input into categories (navigation, search, playback, configure, challenge, info)
- **Entity Extraction**: Extracts structured entities (countries, modes, genres, themes, languages)
- **Action Dispatching**: Translates intents and entities into executable component actions
- **Multilingual Support**: English, French, Spanish, German
- **Context-Aware**: Boosts classification confidence based on current app state
- **Zero External API**: Runs entirely locally using pattern matching and embeddings

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      User Input                                 │
│            "show weather in Japan" / "joue du jazz"            │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    IntentEngine                                 │
│  - Pattern matching (multilingual)                              │
│  - Embedding similarity (optional)                              │
│  - Context boosting                                             │
│  → Output: ClassifiedIntent { category, confidence, subIntent } │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                   EntityExtractor                               │
│  - Country detection (ISO codes)                                │
│  - Mode detection (news, music, weather, wiki, challenge)       │
│  - Genre detection (rock, jazz, electronic...)                  │
│  - Theme detection (dark, green, white)                         │
│  → Output: ExtractedEntity[]                                    │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                   ActionDispatcher                              │
│  - Maps intent + entities to actions                            │
│  - Generates globe:rotate, mode:switch, music:play, etc.        │
│  - Priority-based ordering                                      │
│  → Output: BridgeAction[]                                       │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                   CommandResult                                 │
│  { success, intent, entities, actions, feedback, suggestions } │
└─────────────────────────────────────────────────────────────────┘
```

## Installation

```bash
# From monorepo root
npm install
```

The package is available as `@aeryflux/xenova-bridge` in the monorepo workspace.

## Usage

### Basic Usage

```typescript
import { XenovaBridge, processCommand } from '@aeryflux/xenova-bridge';

// Using the singleton (recommended)
const result = await processCommand('show weather in Japan', {
  currentMode: 'news',
  currentTheme: 'dark',
  language: 'en',
});

console.log(result.intent.category);  // 'navigation'
console.log(result.entities);          // [{ type: 'country', normalizedValue: 'JP' }, ...]
console.log(result.actions);           // [{ type: 'mode:switch', payload: { mode: 'weather' } }, ...]
```

### Custom Instance

```typescript
import { XenovaBridge } from '@aeryflux/xenova-bridge';

const bridge = new XenovaBridge({
  debug: true,
  intentThreshold: 0.7,
  entityThreshold: 0.6,
  apiBaseUrl: 'http://localhost:3000',
});

const result = await bridge.process('play jazz music from France', context);
```

### Intent Classification Only

```typescript
import { IntentEngine } from '@aeryflux/xenova-bridge';

const engine = new IntentEngine();
const intent = await engine.classify('go to Japan');

console.log(intent.category);    // 'navigation'
console.log(intent.confidence);  // 0.85
```

### Entity Extraction Only

```typescript
import { EntityExtractor } from '@aeryflux/xenova-bridge';

const extractor = new EntityExtractor();
const entities = extractor.extract('play rock music in Germany');

// Returns: [
//   { type: 'genre', value: 'rock', normalizedValue: 'rock' },
//   { type: 'country', value: 'Germany', normalizedValue: 'DE' }
// ]
```

## API Reference

### Types

#### `IntentCategory`
```typescript
type IntentCategory =
  | 'navigation'  // "go to", "show", "open"
  | 'search'      // "find", "search", "where is"
  | 'playback'    // "play", "pause", "next"
  | 'configure'   // "set theme", "change language"
  | 'challenge'   // "start quiz", "harder"
  | 'info'        // "what is", "tell me about"
  | 'unknown';
```

#### `EntityType`
```typescript
type EntityType =
  | 'country'     // ISO 3166-1 alpha-2 code
  | 'mode'        // ModeId (news, music, weather, wiki, challenge)
  | 'genre'       // Music genre
  | 'theme'       // ThemeId (dark, green, white)
  | 'language'    // LanguageId (en, fr, es, de)
  | 'direction'   // Navigation (left, right, zoom in/out)
  | 'quantity';   // Numbers
```

#### `ActionType`
```typescript
type ActionType =
  // Globe
  | 'globe:rotate'
  | 'globe:zoom'
  | 'globe:select-country'
  | 'globe:reset'
  // Mode
  | 'mode:switch'
  | 'mode:refresh'
  // Drawer
  | 'drawer:open-left'
  | 'drawer:open-right'
  | 'drawer:close'
  // Music
  | 'music:play'
  | 'music:pause'
  | 'music:next'
  | 'music:filter-genre'
  // Config
  | 'config:set-theme'
  | 'config:set-language'
  // Challenge
  | 'challenge:start'
  // Search
  | 'search:execute';
```

### Classes

#### `XenovaBridge`
Main orchestrator class.

| Method | Description |
|--------|-------------|
| `process(input, context)` | Full pipeline: classify → extract → dispatch |
| `quickCheck(input)` | Intent classification only |
| `extractEntities(input)` | Entity extraction only |
| `updateConfig(config)` | Update configuration |
| `clearCaches()` | Clear embedding cache |

#### `IntentEngine`
Intent classification.

| Method | Description |
|--------|-------------|
| `classify(input, context?)` | Classify intent with optional context |
| `clearCache()` | Clear embedding cache |
| `updateConfig(config)` | Update configuration |

#### `EntityExtractor`
Entity extraction.

| Method | Description |
|--------|-------------|
| `extract(input)` | Extract all entities |
| `extractByType(input, type)` | Extract entities of specific type |
| `extractFirst(input, type)` | Get first entity of type |
| `hasEntity(input, type)` | Check if entity type exists |

## Multilingual Examples

| Language | Command | Intent | Entities |
|----------|---------|--------|----------|
| EN | "show weather in Japan" | navigation | mode:weather, country:JP |
| FR | "montre la météo au Japon" | navigation | mode:weather, country:JP |
| ES | "muestra el tiempo en Japón" | navigation | mode:weather, country:JP |
| DE | "zeige Wetter in Japan" | navigation | mode:weather, country:JP |
| EN | "play jazz music" | playback | genre:jazz |
| FR | "joue du rock" | playback | genre:rock |
| EN | "dark mode" | configure | theme:dark |
| FR | "mode sombre" | configure | theme:dark |

## Integration with Pythagoras API

The package is exposed via Pythagoras API endpoints:

```bash
# Process full command
POST /intent/process
{
  "input": "show weather in Japan",
  "context": { "currentMode": "news", "currentTheme": "dark", "language": "en" }
}

# Classify intent only
POST /intent/classify
{
  "input": "go to France"
}

# Extract entities only
POST /intent/entities
{
  "input": "play jazz music in Germany"
}

# Get suggestions
GET /intent/suggestions?mode=music&language=fr
```

## Integration with Atlas

Use the `useXenovaCommand` hook in Atlas:

```typescript
import { useXenovaCommand } from '@/hooks/useXenovaCommand';

function CommandBar() {
  const { processCommand, isProcessing, lastResult } = useXenovaCommand();

  const handleSubmit = async (input: string) => {
    const result = await processCommand(input);
    if (result.success) {
      console.log('Actions executed:', result.actions);
    }
  };

  return (
    <TextInput
      placeholder="Type a command..."
      onSubmitEditing={(e) => handleSubmit(e.nativeEvent.text)}
      editable={!isProcessing}
    />
  );
}
```

## Testing

```bash
# Run tests
npm test -w @aeryflux/xenova-bridge

# With coverage
npm test -w @aeryflux/xenova-bridge -- --coverage
```

## Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `intentThreshold` | number | 0.6 | Minimum confidence for intent classification |
| `entityThreshold` | number | 0.5 | Minimum confidence for entity extraction |
| `useLocalEmbeddings` | boolean | true | Use Pythagoras embeddings API for ambiguous cases |
| `apiBaseUrl` | string | 'http://localhost:3000' | Pythagoras API URL |
| `debug` | boolean | false | Enable debug logging |

## Extending

### Adding Custom Patterns

```typescript
import { INTENT_PATTERNS, MODE_PATTERNS } from '@aeryflux/xenova-bridge';

// Add custom intent keywords
INTENT_PATTERNS.navigation.push('aller vers', 'navigate to');

// Add custom mode patterns
MODE_PATTERNS.music.push('playlist', 'audio');
```

### Adding Custom Countries

```typescript
import { COUNTRY_MAPPINGS } from '@aeryflux/xenova-bridge';

// Add country variations
COUNTRY_MAPPINGS['nippon'] = 'JP';
COUNTRY_MAPPINGS['helvetia'] = 'CH';
```

## License

MIT - AeryFlux
