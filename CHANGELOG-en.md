# Changelog

🌐 English | [日本語](CHANGELOG.md)

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.6] - 2025-12-06

### Fixed

- **Image Display Fix**
  - Fixed images with relative paths not displaying in preview
  - Preview HTML is now generated in source directory as `vimd-preview-{basename}.html`
  - Preview HTML is automatically deleted on exit

### Improved

- **Preview Reload Performance**
  - Reduced debounce time from 500ms to 100ms
  - Reduced live-server wait time from 100ms to 50ms
  - Total latency: 600ms → 150ms (75% improvement)

## [0.1.5] - 2025-12-06

### Changed

- **Improved Temporary File Management**
  - Preview HTML files are now stored in system temp directory (`$TMPDIR/vimd/`)
  - No longer pollutes user's project directory
  - Session-based management (old sessions over 24 hours are automatically cleaned up)

## [0.1.4] - 2025-12-06

### Fixed

- **Live Reload Fix**
  - Fixed issue where live-server ignored directories starting with a dot
  - Browser auto-reload after file changes now works correctly

## [0.1.3] - 2025-12-06

### Fixed

- **live-server Import Fix**
  - Fixed ESM/CommonJS compatibility issue
  - Resolved `liveServer.start is not a function` error

## [0.1.2] - 2025-12-06

### Fixed

- **Version Display Fix**
  - Fixed `vimd --version` to display correct version
  - Now dynamically reads from package.json

## [0.1.1] - 2025-12-06

### Fixed

- **npm Publishing Fix**
  - Removed unnecessary postinstall script

### Changed

- **Documentation Improvement**
  - Changed example filename in README from `README.md` to `draft.md`

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

- [0.1.5](https://github.com/notokeishou/vimd/releases/tag/v0.1.5) - Improved temp file management
- [0.1.4](https://github.com/notokeishou/vimd/releases/tag/v0.1.4) - Live reload fix
- [0.1.3](https://github.com/notokeishou/vimd/releases/tag/v0.1.3) - live-server import fix
- [0.1.2](https://github.com/notokeishou/vimd/releases/tag/v0.1.2) - Version display fix
- [0.1.1](https://github.com/notokeishou/vimd/releases/tag/v0.1.1) - npm publishing fix
- [0.1.0](https://github.com/notokeishou/vimd/releases/tag/v0.1.0) - Initial release
