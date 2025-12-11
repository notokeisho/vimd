# vimd

🌐 English | [日本語](README.md)

> Write and preview. Markdown made visible.

[![npm version](https://img.shields.io/npm/v/vimd.svg)](https://www.npmjs.com/package/vimd)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-≥18-green.svg)](https://nodejs.org/)

---

## Demo

![vimd demo](assets/demo.gif)

---

## Themes

<details open>
<summary><strong>GitHub</strong> (Default)</summary>

![GitHub Theme](assets/theme-github.png)

</details>

<details>
<summary><strong>Dark</strong></summary>

![Dark Theme](assets/theme-dark.png)

</details>

<details>
<summary><strong>Academic</strong></summary>

![Academic Theme](assets/theme-academic.png)

</details>

<details>
<summary><strong>Minimal</strong></summary>

![Minimal Theme](assets/theme-minimal.png)

</details>

<details>
<summary><strong>Technical</strong></summary>

![Technical Theme](assets/theme-technical.png)

</details>

---

## Quick Start

### Requirements

- **Node.js** >= 18.0.0
- **pandoc** >= 2.0 (optional, for high-quality builds only)

### Installation

```bash
npm install -g vimd@0.2.4
```

**Current stable version: v0.2.4**

From v0.2.0, **vimd works without pandoc**.
Install pandoc only when you need high-quality output.

```bash
# Install pandoc (optional)
brew install pandoc        # macOS
sudo apt install pandoc    # Ubuntu/Debian
choco install pandoc       # Windows
```

### Usage

```bash
# Start live preview (no pandoc required, fast)
vimd dev draft.md

# Build static HTML (uses pandoc, high quality)
vimd build draft.md

# Fast build (no pandoc required)
vimd build draft.md --fast

# Change theme
vimd theme

# Edit configuration
vimd config
```

---

## Version Information

**Stable version: v0.2.4**

v0.3.x is an experimental version with revamped internal architecture.
Use v0.2.4 for stable operation.

To install the stable version:
```bash
npm install -g vimd@0.2.4
```

To install the latest (experimental) version:
```bash
npm install -g vimd@latest
```

---

## Commands

| Command | Description |
|---------|-------------|
| `vimd dev <file>` | Start live preview server |
| `vimd build <file>` | Generate static HTML |
| `vimd theme` | Change theme interactively |
| `vimd config` | Edit configuration interactively |
| `vimd kill` | Terminate running sessions |
| `vimd reset` | Reset configuration to defaults |

### Options

```bash
# dev command
vimd dev draft.md --port 3000      # Specify port
vimd dev draft.md --theme dark     # Specify theme
vimd dev draft.md --no-open        # Don't open browser
vimd dev draft.md --pandoc         # Use pandoc parser

# build command
vimd build draft.md -o output.html # Specify output path
vimd build draft.md --fast         # Fast build with markdown-it
vimd build draft.md --theme dark   # Specify theme

# kill command
vimd kill                          # Terminate all sessions
vimd kill --port 38080             # Terminate session on specific port

# reset command
vimd reset                         # Reset configuration (with confirmation)
vimd reset --yes                   # Reset without confirmation
```

---

## Configuration

Global configuration is stored at `~/.vimd/config.js`.

```javascript
export default {
  theme: 'github',
  port: 38080,  // Default: 38080 (changed in v0.2.1)
  open: true,
  devParser: 'markdown-it',  // Parser for dev (default: markdown-it)
  buildParser: 'pandoc',     // Parser for build (default: pandoc)
};
```

### Parser Settings

| Parser | Features | Use Case |
|--------|----------|----------|
| `markdown-it` | Fast, no pandoc required | Development preview |
| `pandoc` | High quality, feature-rich | Final output generation |

See [docs/en/api-en.md](docs/en/api-en.md) for detailed configuration options.

---

## Why vimd?

| Feature | vimd | Other Tools |
|---------|------|-------------|
| Setup | `npm i -g vimd` | May require complex setup |
| Dependencies | None (pandoc is optional) | Often requires pandoc |
| Conversion Quality | markdown-it / pandoc selectable | Fixed |
| Themes | 5 built-in | Often requires configuration |
| Config File | Outside project (`~/.vimd/`) | Often inside project |
| Live Reload | Automatic | May require manual refresh |

---

## Documentation

- [Development Guide](docs/en/development-en.md) - Development environment setup
- [Architecture](docs/en/architecture-en.md) - Project structure
- [API Reference](docs/en/api-en.md) - Detailed options
- [Testing](docs/en/testing-en.md) - Test structure
- [Troubleshooting](docs/en/troubleshooting-en.md) - Common issues
- [v0.3.0 Release Notes](docs/en/releases/v0.3.0-en.md) - WebSocket Direct Communication
- [v0.2.0 Release Notes](docs/en/releases/v0.2.0-en.md) - Dual Parser System

---

## Links

- [CONTRIBUTING-en.md](CONTRIBUTING-en.md) - Contribution guide
- [CHANGELOG-en.md](CHANGELOG-en.md) - Changelog
- [GitHub](https://github.com/notokeishou/vimd)
- [npm](https://www.npmjs.com/package/vimd)

---

## License

MIT © notokeishou
