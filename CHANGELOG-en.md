# Changelog

🌐 English | [日本語](CHANGELOG.md)

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.5.6] - 2026-01-27

### Added

- **Preview link navigation**
  - In folder mode, clicking a link to another Markdown file in the preview now opens that file in the preview panel
  - Supports relative paths (`../README.md`, `./docs/api.md`, etc.)
  - Supported extensions: `.md`, `.tex`, `.latex`
  - External links (http://, https://) and anchor links (#section) work as before

## [0.5.5] - 2026-01-26

### Added

- **Realtime file tree updates in folder mode**
  - Sidebar automatically updates when files are added or deleted while server is running
  - Implemented folder watching using `chokidar`
  - Supported events: file add, file delete, folder add, folder delete
  - Debounce processing (300ms) prevents excessive rescanning

## [0.5.4] - 2026-01-26

### Fixed

- **Image display in folder mode**
  - Fixed images and static files not displaying in folder mode
  - Added `sirv` middleware for static file serving
  - Images in README (demo.gif, theme previews, etc.) now display correctly

## [0.5.3] - 2026-01-26

### Changed

- **Sidebar width changed to 300px**
  - Increased initial width from 280px to 300px
  - Filenames are now more visible

### Fixed

- **Sidebar selection state when closing panel**
  - Fixed issue where sidebar kept showing file as selected after closing tab with [×] button
  - Blue highlight now correctly clears for closed files

## [0.5.2] - 2026-01-26

### Added

- **Preview Panel Header**
  - Display filename in header when a file is selected
  - [×] button to close file and return to welcome screen
  - Long filenames truncated with ellipsis, full name on hover

- **Split View**
  - Right-click on file → "分割画面で開く" (Open in split view) for 2-panel display
  - Active panel indicated by blue underline (#007acc)
  - Resizable panel divider (minimum width 100px)
  - Same file can be opened in both panels

- **Context Menu**
  - 1 panel mode: "開く" (Open), "分割画面で開く" (Open in split view)
  - 2 panel mode: "パネル1で開く" (Open in Panel 1), "パネル2で開く" (Open in Panel 2)

- **State Persistence (localStorage)**
  - Save split view state, open files, panel widths, active panel
  - Restore state on page reload

### Changed

- **Removed Sidebar Toggle**
  - Toggle button and Ctrl+B shortcut removed
  - Sidebar is always visible

- **Preview Content Width**
  - Removed max-width restriction, content expands naturally with panel width
  - Added overflow-x: auto for code blocks and tables

### Improved

- **CSS Variables for Theme Support**
  - Panel header and context menu colors defined as CSS variables
  - Easier dark theme customization

## [0.5.1] - 2026-01-25

### Changed

- **Folder Mode UI Improvements**
  - Header changed to fixed text "エクスプローラー" (Explorer) in VSCode style
  - Root folder displayed as expandable/collapsible tree node
  - Header style adjusted to VSCode style (11px, uppercase, muted color)

### Fixed

- Fixed `{{folder_name}}` placeholder not being replaced in template

## [0.5.0] - 2026-01-25

### Added

- **Folder Mode**
  - Preview multiple files in a folder with `vimd dev .` or `vimd dev <folder>`
  - VSCode-style sidebar for file selection
  - Tree-style file display (expandable/collapsible folders)
  - Resizable sidebar (drag to resize)
  - Keyboard shortcut (Ctrl+B to toggle sidebar)
  - Auto-conversion and real-time updates on file selection
  - Supported extensions: `.md`, `.tex`, `.latex`
  - Auto-excluded: `node_modules`, `.git`, `dist`, `build`

### Changed

- **Extended dev command arguments**
  - Now accepts folder paths in addition to file paths
  - Automatically starts folder mode when a folder is specified

## [0.4.0] - 2026-01-25

### Added

- **LaTeX Document Support**
  - Preview support for `.tex` / `.latex` files
  - `vimd dev thesis.tex` for live preview
  - `vimd build thesis.tex` for HTML generation
  - Automatic parser mode switching based on file extension
  - Converts LaTeX to HTML using pandoc
  - pandoc is required for LaTeX files (no markdown-it fallback)

### Changed

- **Add fromFormat parameter to PandocParser**
  - Changed from fixed `--from=markdown` to `--from=${fromFormat}`
  - Export `SourceFormat` type (`'markdown' | 'latex'`)

### Fixed

- **Fix title extraction in converter.ts**
  - Changed from fixed `.md` to dynamic extension extraction using `path.extname()`

## [0.3.16] - 2026-01-25

### Changed

- **Unify content width to 720px across all themes**
  - Improved readability (approximately 45-50 characters per line)
  - Consistent appearance with pandoc output
  - Before: github/dark 980px, minimal 800px, technical 1000px, academic 720px
  - After: All themes 720px

## [0.3.15] - 2026-01-25

### Fixed

- **Fix backslashes disappearing in math blocks with markdown-it**
  - Protect math blocks (`$$...$$`) and inline math (`$...$`) from markdown-it processing
  - LaTeX syntax using `\\` (like matrices) now renders correctly

### Improved

- **Center block math equations**
  - Consistent layout with pandoc output

## [0.3.14] - 2026-01-25

### Fixed

- **Fix MathJax rendering not working**
  - Remove `markdown-it-texmath` plugin (conflicts with MathJax)
  - MathJax detects and renders `$...$` and `$$...$$` in the browser

## [0.3.13] - 2026-01-25

### Fixed

- **Fix math config not being passed to parser and template**
  - Pass `MathConfig` to `ParserFactory.create()`
  - Pass `mathEnabled` to converter in `dev` / `build` commands

## [0.3.12] - 2026-01-25

### Added

- **TeX Math Support (MathJax)**
  - Support for inline math (`$E = mc^2$`) and block math (`$$...$$`)
  - Enabled bussproofs (proof trees), ams, and physics extensions
  - markdown-it parser: Uses `markdown-it-texmath` plugin
  - pandoc parser: Uses `--mathjax` option
  - Configurable enable/disable via `math.enabled`
  - Engine selection available (`math.engine`: 'mathjax' or 'katex')

## [0.3.2] - 2025-12-14

### Fixed

- **Fix slow server shutdown issue**
  - Server now terminates immediately after pressing `Ctrl+C`
  - Use force termination (`terminate()`) for WebSocket clients
  - Add HTTP keep-alive connection force close (`closeAllConnections()`)

## [0.3.1] - 2025-12-10

### Fixed

- **Fix ERR_HTTP_HEADERS_SENT error when serving HTML**
  - Resolved conflict with sirv streaming delivery
  - Changed to direct file reading approach for HTML files

## [0.3.0] - 2025-12-10

### Changed

- **WebSocket Direct Communication for Live Reload**
  - Removed live-server dependency, implemented custom WebSocket server
  - Lightweight architecture with `ws` + `polka` + `sirv`
  - 83% reduction in bundle size (1.7MB → 284KB)
  - Server startup time: 1.31ms average
  - Broadcast latency: 0.01ms average

### Technical Changes

- Added WebSocketServer class (`src/core/websocket-server.ts`)
- Middleware for automatic reload script injection into HTML responses
- Removed LiveServer class
- Updated tests for WebSocketServer

## [0.2.4] - 2025-12-09

### Documentation Update

- **Add version information section to README**
  - Added stable version note to installation section
  - Added "Version Information" section after Quick Start
  - Explains policy when latest and stable versions differ

## [0.2.3] - 2025-12-08

### Added

- **`vimd reset` command**
  - Delete configuration file (`~/.vimd/config.js`) to restore default settings
  - `vimd reset`: Reset with confirmation prompt
  - `vimd reset --yes`: Reset without confirmation
  - Allows existing users to easily restore default settings after default port was changed to 38080 in v0.2.1

## [0.2.2] - 2025-12-07

### Documentation Update

- **Reflect default port 38080 in documentation**
  - README.md / README-en.md
  - docs/ja/troubleshooting.md / docs/en/troubleshooting-en.md
  - docs/ja/api.md / docs/en/api-en.md
  - docs/ja/architecture.md / docs/en/architecture-en.md
  - CLAUDE.md

- **Add vimd kill command usage**
  - Added to command list and options in README.md / README-en.md
  - Added as port conflict solution in troubleshooting

## [0.2.1] - 2025-12-07

### Added

- **`vimd kill` command**
  - Terminate running vimd dev sessions
  - `vimd kill`: Terminate all sessions
  - `vimd kill --port <port>`: Terminate session on specific port
  - Safe process termination with PID validation
  - Automatic cleanup of preview files

### Changed

- **Default port changed to 38080**
  - Changed from 8080 to avoid conflicts with other applications
  - Set `port: 8080` in `~/.vimd/config.js` to use the previous default

### Fixed

- **Accurate port detection on port conflicts**
  - Detect actual port used by live-server
  - Use correct port in session registry and log output
  - Open browser with correct URL

## [0.2.0] - 2025-12-06

### Added

- **Dual Parser System**
  - markdown-it parser: Fast, no pandoc required
  - pandoc parser: High quality, feature-rich
  - ParserFactory for unified parser management

- **New CLI Options**
  - `vimd dev --pandoc`: Use pandoc parser in dev command
  - `vimd build --fast`: Use markdown-it parser in build command (fast build)

- **New Configuration Options**
  - `devParser`: Default parser for dev command (default: `markdown-it`)
  - `buildParser`: Default parser for build command (default: `pandoc`)

- **markdown-it Features**
  - GitHub Flavored Markdown (GFM) support
  - Tables, strikethrough, task lists
  - Syntax highlighting via highlight.js

### Changed

- **pandoc is Now Optional**
  - dev command uses markdown-it by default (no pandoc required)
  - pandoc is only required for high-quality builds (optional)

- **Performance Improvements**
  - markdown-it converts Markdown faster than pandoc
  - Improved preview experience during development

### Technical Changes

- Added parser injection to Converter class (setParser/getParser)
- Added 45 parser-related unit tests
- Total 173 tests passing

## [0.1.12] - 2025-12-06

### Added

- **technical.css Theme Complete Redesign**
  - API Documentation Template-inspired styling
  - Fix: Changed `.markdown-body` selector to `body`
  - CSS variables for easy customization
  - Monospace headings for technical appearance
  - Blue-bordered code blocks
  - Note/warning style blockquotes with background
  - Dark header tables with zebra striping
  - TOC with "Table of Contents" header
  - Colorful syntax highlighting
  - Custom scrollbar styling
  - Print support
  - Responsive design

## [0.1.11] - 2025-12-06

### Added

- **minimal.css Theme Complete Redesign**
  - Clean styling based on Buttondown CSS
  - Subtle link styles (underline on hover)
  - Textbook-style tables (horizontal borders only)
  - Blockquote with left border and italic text
  - Table of Contents (TOC) styling
  - Monochrome syntax highlighting
  - Pandoc footnotes support
  - Print support (URL display)
  - Responsive design

## [0.1.10] - 2025-12-06

### Added

- **academic.css Theme Complete Redesign**
  - LaTeX.css-based academic paper styling
  - LaTeX-style first-line paragraph indentation with justified text
  - Automatic hyphenation support
  - "Contents" header for Table of Contents
  - Academic-style Pandoc footnotes
  - minted-style syntax highlighting
  - LaTeX booktabs-style three-line tables
  - Print support (URL display, page break control)

### Fixed

- **Test overwriting source file issue**
  - Fixed theme-manager.test.ts overwriting github.css

## [0.1.9] - 2025-12-06

### Added

- **github.css Theme Full Implementation**
  - Fully implemented default theme with GitHub Light colors
  - Based on sindresorhus/github-markdown-css styling
  - Complete element styling (headings, links, code, tables, blockquotes, etc.)
  - Table of Contents (TOC) styling support
  - Pandoc syntax highlighting support
  - Responsive design support

## [0.1.8] - 2025-12-06

### Fixed

- **Dark Theme Improvements**
  - Fixed links being invisible (black on dark background)
  - Fixed Table of Contents not displaying
  - Fixed code highlighting colors being too dark to see
  - Redesigned based on GitHub Dark theme (sindresorhus/github-markdown-css)
  - Added Pandoc syntax highlighting class support

## [0.1.7] - 2025-12-06

### Added

- **Session Management**
  - Automatic port conflict resolution (auto-terminates previous vimd sessions)
  - Auto-detects available port when another app occupies the port
  - Multi-session support (run multiple vimd instances on different ports)
  - Session tracking via `$TMPDIR/vimd/sessions.json`
  - Automatic cleanup of stale sessions from dead processes

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

- [0.3.0](https://github.com/notokeishou/vimd/releases/tag/v0.3.0) - WebSocket Direct Communication
- [0.2.0](https://github.com/notokeishou/vimd/releases/tag/v0.2.0) - Dual Parser System
- [0.1.12](https://github.com/notokeishou/vimd/releases/tag/v0.1.12) - Technical theme redesign
- [0.1.5](https://github.com/notokeishou/vimd/releases/tag/v0.1.5) - Improved temp file management
- [0.1.4](https://github.com/notokeishou/vimd/releases/tag/v0.1.4) - Live reload fix
- [0.1.3](https://github.com/notokeishou/vimd/releases/tag/v0.1.3) - live-server import fix
- [0.1.2](https://github.com/notokeishou/vimd/releases/tag/v0.1.2) - Version display fix
- [0.1.1](https://github.com/notokeishou/vimd/releases/tag/v0.1.1) - npm publishing fix
- [0.1.0](https://github.com/notokeishou/vimd/releases/tag/v0.1.0) - Initial release
