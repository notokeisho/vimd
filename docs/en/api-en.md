# API Reference

vimd can be used as a Node.js library in addition to the CLI.

## Installation

```bash
npm install vimd
```

## Basic Usage

```javascript
import { MarkdownConverter, ConfigLoader, ThemeManager } from 'vimd';

// Load global configuration
const config = await ConfigLoader.loadGlobal();

// Create converter
const converter = new MarkdownConverter({
  theme: 'github',
  pandocOptions: config.pandoc,
});

// Convert Markdown to HTML
const html = await converter.convertWithTemplate('document.md');

// List available themes
const themes = ThemeManager.list();
console.log(themes);
// [{ name: 'github', displayName: 'GitHub' }, ...]
```

## Classes

### MarkdownConverter

Converts Markdown files to HTML using pandoc.

```typescript
class MarkdownConverter {
  constructor(options: ConverterOptions);
  convert(inputPath: string): Promise<string>;
  convertWithTemplate(inputPath: string): Promise<string>;
}

interface ConverterOptions {
  theme?: string;
  pandocOptions?: PandocOptions;
}

interface PandocOptions {
  standalone?: boolean;
  toc?: boolean;
  highlightStyle?: string;
}
```

### ConfigLoader

Loads and manages configuration.

```typescript
class ConfigLoader {
  static loadGlobal(): Promise<VimdConfig>;
  static getConfigPath(): string;
  static save(config: VimdConfig): Promise<void>;
}
```

### ThemeManager

Manages CSS themes.

```typescript
class ThemeManager {
  static list(): ThemeInfo[];
  static get(name: string): string;
  static exists(name: string): boolean;
}

interface ThemeInfo {
  name: string;
  displayName: string;
}
```

## Configuration Options

### VimdConfig

```typescript
interface VimdConfig {
  // Default theme name
  theme: string;

  // Development server port
  port: number;

  // Development server host
  host: string;

  // Auto-open browser
  open: boolean;

  // pandoc options
  pandoc: {
    standalone: boolean;
    toc: boolean;
    highlightStyle: string;
  };

  // File watcher options
  watch: {
    ignored: string[];
  };
}
```

### Default Values

```javascript
{
  theme: 'github',
  port: 38080,  // Changed from 8080 in v0.2.1
  host: 'localhost',
  open: true,
  pandoc: {
    standalone: true,
    toc: false,
    highlightStyle: 'github',
  },
  watch: {
    ignored: ['node_modules', '.git'],
  },
}
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VIMD_PORT` | Override default port | `VIMD_PORT=3000` |
| `VIMD_THEME` | Override default theme | `VIMD_THEME=dark` |
| `VIMD_HOST` | Override default host | `VIMD_HOST=0.0.0.0` |

## Error Handling

```javascript
import { MarkdownConverter, PandocNotFoundError } from 'vimd';

try {
  const converter = new MarkdownConverter();
  await converter.convert('document.md');
} catch (error) {
  if (error instanceof PandocNotFoundError) {
    console.error('pandoc is not installed');
  } else {
    throw error;
  }
}
```

## TypeScript Support

vimd includes TypeScript declarations. Import types directly:

```typescript
import type { VimdConfig, ThemeInfo, ConverterOptions } from 'vimd';
```
