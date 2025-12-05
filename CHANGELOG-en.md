# Changelog

🌐 English | [日本語](CHANGELOG.md)

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-12-06

### Added

- **CLI Commands**
  - `vimd dev <file>`: Live preview server with hot reload
  - `vimd build <file>`: Static HTML generation
  - `vimd theme`: Interactive theme selection
  - `vimd config`: Interactive configuration editor
  - `vimd config --list`: Display current configuration

- **Theme System**
  - GitHub: GitHub Markdown style (Recommended)
  - Minimal: Simple white background
  - Dark: VS Code inspired dark mode
  - Academic: Paper-style layout
  - Technical: API documentation style

- **Core Features**
  - Markdown to HTML conversion via pandoc
  - Real-time preview using live-server
  - File watching with chokidar (500ms debounce)
  - Global configuration system (`~/.vimd/config.js`)

- **Developer Features**
  - TypeScript + ESM support
  - 100 tests (99% passing)
  - 73.52% code coverage
  - Public API for library usage

### Technical Requirements

- Node.js >= 18.0.0 required
- pandoc >= 2.0 required (manual installation)
- ESM (ES Modules) format

---

## Release Links

- [0.1.0](https://github.com/notokeishou/vimd/releases/tag/v0.1.0) - Initial release
