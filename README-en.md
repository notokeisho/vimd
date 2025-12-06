# vimd

🌐 English | [日本語](README.md)

> Write and preview. Markdown made visible.

[![npm version](https://img.shields.io/npm/v/vimd.svg)](https://www.npmjs.com/package/vimd)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-≥18-green.svg)](https://nodejs.org/)

---

## Demo

![vimd demo](assets/demo.gif)

<details>
<summary>Download MP4 version</summary>

[demo.mp4](assets/demo.mp4)

</details>

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
- **pandoc** >= 2.0

```bash
# Install pandoc
brew install pandoc        # macOS
sudo apt install pandoc    # Ubuntu/Debian
choco install pandoc       # Windows
```

### Installation

```bash
npm install -g vimd
```

### Usage

```bash
# Start live preview
vimd dev draft.md

# Build static HTML
vimd build draft.md

# Change theme
vimd theme

# Edit configuration
vimd config
```

---

## Commands

| Command | Description |
|---------|-------------|
| `vimd dev <file>` | Start live preview server |
| `vimd build <file>` | Generate static HTML |
| `vimd theme` | Change theme interactively |
| `vimd config` | Edit configuration interactively |

### Options

```bash
vimd dev draft.md --port 3000      # Specify port
vimd dev draft.md --theme dark     # Specify theme
vimd dev draft.md --no-open        # Don't open browser
vimd build draft.md -o output.html # Specify output path
```

---

## Configuration

Global configuration is stored at `~/.vimd/config.js`.

```javascript
export default {
  theme: 'github',
  port: 8080,
  open: true,
};
```

See [docs/api.md](docs/api.md) for detailed configuration options.

---

## Why vimd?

| Feature | vimd | Other Tools |
|---------|------|-------------|
| Setup | `npm i -g vimd` | May require complex setup |
| Conversion Quality | pandoc (high quality) | Varies |
| Themes | 5 built-in | Often requires configuration |
| Config File | Outside project (`~/.vimd/`) | Often inside project |
| Live Reload | Automatic | May require manual refresh |

---

## Documentation

- [Development Guide](docs/development.md) - Development environment setup
- [Architecture](docs/architecture.md) - Project structure
- [API Reference](docs/api.md) - Detailed options
- [Testing](docs/testing.md) - Test structure
- [Troubleshooting](docs/troubleshooting.md) - Common issues

---

## Links

- [CONTRIBUTING-en.md](CONTRIBUTING-en.md) - Contribution guide
- [CHANGELOG-en.md](CHANGELOG-en.md) - Changelog
- [GitHub](https://github.com/notokeishou/vimd)
- [npm](https://www.npmjs.com/package/vimd)

---

## License

MIT © notokeishou
