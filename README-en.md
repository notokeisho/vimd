# vimd

🌐 English | [日本語](README.md)

> Real-time Markdown preview tool with pandoc (view markdown)

[![npm version](https://badge.fury.io/js/vimd.svg)](https://www.npmjs.com/package/vimd)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**vimd** is a fast, simple Markdown preview tool that provides real-time HTML preview with multiple themes powered by pandoc.

## Features

- **Real-time Preview**: Instant browser update on file save with live-server
- **Multiple Themes**: 5 built-in themes (GitHub, Minimal, Dark, Academic, Technical)
- **Pandoc Powered**: High-quality Markdown conversion using pandoc
- **Global Configuration**: Clean project directories with `~/.vimd/config.js`
- **Interactive Setup**: First-run wizard guides theme selection
- **Cross-Platform**: Works on macOS, Linux, and Windows

## Installation

```bash
npm install -g vimd
```

After installation, an interactive setup will guide you through initial configuration.

### Requirements

- **Node.js** >= 18.0.0 (ESM support required)
- **pandoc** >= 2.0 (manual installation required)

To install pandoc:

```bash
# macOS
brew install pandoc

# Ubuntu/Debian
sudo apt install pandoc

# Windows
choco install pandoc
```

## Quick Start

```bash
# Start live preview
vimd dev README.md

# Build static HTML
vimd build README.md

# Change theme
vimd theme

# Edit configuration
vimd config
```

## Commands

### `vimd dev <file>`

Start live preview server with hot reload. Opens browser automatically and watches file changes.

```bash
vimd dev README.md
vimd dev docs/guide.md --port 3000
vimd dev spec.md --theme dark --no-open
```

**Options:**
- `-p, --port <port>`: Port number (default: 8080)
- `-t, --theme <theme>`: Theme name (overrides global config)
- `--no-open`: Do not open browser automatically

### `vimd build <file>`

Build static HTML file. Outputs standalone HTML with embedded styles.

```bash
vimd build README.md
vimd build docs/guide.md -o dist/guide.html
vimd build spec.md --theme academic
```

**Options:**
- `-o, --output <path>`: Output file path (default: same name with .html)
- `-t, --theme <theme>`: Theme name (overrides global config)

### `vimd theme`

Change theme interactively. Select from 5 built-in themes.

```bash
vimd theme
```

### `vimd config`

Edit configuration interactively. Modify theme, port, and other settings.

```bash
# Interactive configuration editor
vimd config

# List current configuration
vimd config --list
```

## Themes

vimd includes 5 built-in themes:

| Theme | Description | Best For |
|-------|-------------|----------|
| **GitHub** | GitHub Markdown style (Recommended) | General documentation |
| **Minimal** | Simple white background | Clean, distraction-free writing |
| **Dark** | VS Code inspired dark mode | Night coding sessions |
| **Academic** | Paper-style layout | Academic papers, research documents |
| **Technical** | API documentation style | Technical specifications, API docs |

## Configuration

Global configuration is stored at `~/.vimd/config.js`.

```javascript
export default {
  theme: 'github',
  port: 8080,
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
};
```

### Configuration Options

- `theme`: Default theme name (string)
- `port`: Dev server port (number, default: 8080)
- `host`: Dev server host (string, default: 'localhost')
- `open`: Auto-open browser (boolean, default: true)
- `pandoc.standalone`: Generate standalone HTML (boolean)
- `pandoc.toc`: Generate table of contents (boolean)
- `pandoc.highlightStyle`: Code highlighting style (string)
- `watch.ignored`: Patterns to ignore for file watching (array)

## API Usage

vimd can also be used as a Node.js library:

```javascript
import { MarkdownConverter, ConfigLoader, ThemeManager } from 'vimd';

// Load configuration
const config = await ConfigLoader.loadGlobal();

// Create converter
const converter = new MarkdownConverter({
  theme: 'github',
  pandocOptions: config.pandoc,
});

// Convert markdown to HTML
const html = await converter.convertWithTemplate('README.md');

// List available themes
const themes = ThemeManager.list();
console.log(themes); // [{ name: 'github', displayName: 'GitHub' }, ...]
```

## Development

```bash
# Clone repository
git clone https://github.com/notokeishou/vimd.git
cd vimd

# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Run with coverage
npm run test:coverage

# Development mode
npm run dev -- dev test.md
```

### Project Structure

```
vimd/
├── src/
│   ├── cli/          # CLI commands
│   ├── config/       # Configuration management
│   ├── core/         # Core functionality (converter, watcher, server)
│   ├── themes/       # Theme system
│   └── utils/        # Utility functions
├── tests/
│   ├── unit/         # Unit tests
│   └── integration/  # Integration tests
├── templates/        # HTML templates
└── dist/            # Built files
```

## Troubleshooting

### Pandoc not found

If you get "pandoc not found" error:

1. Install pandoc using your package manager
2. Verify installation: `pandoc --version`
3. Restart your terminal

### Port already in use

If port 8080 is already in use:

```bash
vimd dev README.md --port 3000
```

Or change the default port in `~/.vimd/config.js`.

### Theme not applied

Make sure to:

1. Check available themes: `vimd theme`
2. Verify config: `vimd config --list`
3. Try rebuilding: `npm run build` (if using from source)

## License

MIT © notokeishou

## Contributing

Contributions are welcome! Please read [CONTRIBUTING-en.md](CONTRIBUTING-en.md) for details on our code of conduct and the process for submitting pull requests.

## Changelog

See [CHANGELOG-en.md](CHANGELOG-en.md) for release history.

## Links

- [GitHub Repository](https://github.com/notokeishou/vimd)
- [npm Package](https://www.npmjs.com/package/vimd)
- [Issue Tracker](https://github.com/notokeishou/vimd/issues)

---

Made with ❤️ by notokeishou
