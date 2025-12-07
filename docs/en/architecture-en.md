# Architecture

This document describes the architecture and structure of the vimd codebase.

## Directory Structure

```
vimd/
├── src/
│   ├── cli/              # CLI commands
│   │   ├── index.ts      # Entry point
│   │   ├── dev.ts        # vimd dev command
│   │   ├── build.ts      # vimd build command
│   │   ├── theme.ts      # vimd theme command
│   │   └── config.ts     # vimd config command
│   │
│   ├── config/           # Configuration management
│   │   ├── loader.ts     # Config file loading
│   │   ├── validator.ts  # Config validation
│   │   └── defaults.ts   # Default values
│   │
│   ├── core/             # Core functionality
│   │   ├── converter.ts  # Markdown to HTML conversion
│   │   ├── watcher.ts    # File watching
│   │   ├── server.ts     # Live preview server
│   │   └── pandoc-detector.ts  # pandoc detection
│   │
│   ├── themes/           # Theme system
│   │   ├── registry.ts   # Theme registry
│   │   ├── manager.ts    # Theme management
│   │   └── styles/       # CSS files
│   │       ├── github.css
│   │       ├── dark.css
│   │       ├── academic.css
│   │       ├── minimal.css
│   │       └── technical.css
│   │
│   └── utils/            # Utility functions
│       ├── logger.ts     # Logging
│       ├── os-detector.ts    # OS detection
│       ├── path-resolver.ts  # Path utilities
│       ├── process-manager.ts # Process management
│       └── session-manager.ts # Session handling
│
├── tests/
│   ├── unit/             # Unit tests
│   └── integration/      # Integration tests
│
├── templates/            # HTML templates
│   └── preview.html      # Preview template
│
├── docs/                 # Developer documentation
│
└── dist/                 # Built files (generated)
```

## Module Design

### CLI Layer (`src/cli/`)

Handles command-line interface using Commander.js.

```
User Input → CLI Parser → Command Handler → Core Functions
```

### Core Layer (`src/core/`)

Contains the main business logic.

| Module | Responsibility |
|--------|----------------|
| `converter.ts` | Markdown to HTML conversion via pandoc |
| `watcher.ts` | File system watching with chokidar |
| `server.ts` | Live preview server with live-server |
| `pandoc-detector.ts` | pandoc installation detection |

### Config Layer (`src/config/`)

Manages user configuration.

```
~/.vimd/config.js → ConfigLoader → Validation → Merged Config
```

### Theme Layer (`src/themes/`)

Manages CSS themes.

```
Theme Name → ThemeManager → CSS Content → HTML Injection
```

## Data Flow

### `vimd dev` Command

```
1. Parse CLI arguments
2. Load configuration
3. Detect pandoc
4. Start file watcher
5. Convert Markdown to HTML
6. Start live-server
7. Open browser
8. Watch for changes → Re-convert → Browser reload
```

### `vimd build` Command

```
1. Parse CLI arguments
2. Load configuration
3. Detect pandoc
4. Convert Markdown to HTML
5. Inject CSS
6. Write output file
```

## Key Design Decisions

### ESM (ES Modules)

vimd uses ESM format for modern JavaScript compatibility.

```json
// package.json
{
  "type": "module"
}
```

### Configuration as JavaScript

Configuration files use JavaScript (not JSON) for flexibility.

```javascript
// ~/.vimd/config.js
export default {
  theme: 'github',
  port: 38080,  // Default: 38080
};
```

### pandoc Dependency

vimd requires pandoc to be installed separately. This provides:
- High-quality Markdown conversion
- Support for advanced Markdown features
- Consistent output across platforms

### Session Management

Sessions are tracked in `$TMPDIR/vimd/sessions.json` to handle:
- Port conflicts
- Multiple instances
- Cleanup on exit
