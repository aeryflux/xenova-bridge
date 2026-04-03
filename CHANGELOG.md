# Changelog

All notable changes to `@aeryflux/xenova-bridge` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-03-31

### Added

- Multilingual intent classification patterns for English, French, Spanish, and German
- Entity extraction for countries, modes, genres, themes, languages, and directions
- Country mappings with ISO 3166-1 alpha-2 normalization across all supported languages
- Action dispatching pipeline (intent + entities to executable actions)
- Context-aware confidence boosting based on current app state
- Optional local embedding support via `@xenova/transformers` peer dependency
- Full TypeScript type definitions for all public APIs
- Integration examples for Pythagoras API and Atlas (React Native)
- Vitest test suite covering intent classification and entity extraction

### Architecture

- `IntentEngine` -- pattern-based intent classification with embedding fallback
- `EntityExtractor` -- rule-based entity extraction with multilingual support
- `ActionDispatcher` -- maps classified intents and entities to component actions
- `XenovaBridge` -- orchestrator combining all three stages into a single pipeline

## [0.1.0] - 2026-03-15

### Added

- Initial release with basic intent classification
- English-only pattern matching
- Core package structure with tsup build

[0.2.0]: https://github.com/aeryflux/xenova-bridge/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/aeryflux/xenova-bridge/releases/tag/v0.1.0
