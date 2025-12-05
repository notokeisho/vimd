# vimd - プロジェクト構成設計

**作成日**: 2025-12-05
**最終更新**: 2025-12-06 (v2.0 - ESM対応版)
**ステータス**: 設計フェーズ
**前提**: requirements.md v1.3 に基づく

---

## 📋 目次

1. [ディレクトリ構造](#ディレクトリ構造)
2. [ファイル責任](#ファイル責任)
3. [package.json設計](#packagejson設計)
4. [TypeScript設定](#typescript設定)
5. [エントリーポイント](#エントリーポイント)
6. [モジュール設計](#モジュール設計)
7. [テーマシステム実装](#テーマシステム実装)
8. [ビルドとデプロイ](#ビルドとデプロイ)

---

## ディレクトリ構造

### 全体像

```
vimd/
├── src/                        # ソースコード
│   ├── cli/                    # CLIエントリーポイントとコマンド
│   │   ├── index.ts           # メインCLIエントリー
│   │   ├── commands/          # 各コマンド実装
│   │   │   ├── dev.ts         # vimd dev コマンド
│   │   │   ├── build.ts       # vimd build コマンド
│   │   │   ├── theme.ts       # vimd theme コマンド
│   │   │   └── config.ts      # vimd config コマンド
│   │   └── setup.ts           # 初回セットアップ (初回実行時)
│   │
│   ├── core/                   # コア機能
│   │   ├── events.ts          # イベントシステム (EventEmitter)
│   │   ├── watcher.ts         # ファイル監視 (chokidar)
│   │   ├── converter.ts       # Markdown→HTML変換 (pandoc)
│   │   ├── server.ts          # ライブサーバー (live-server)
│   │   └── pandoc-detector.ts # pandoc検出（自動インストール廃止）
│   │
│   ├── config/                 # 設定管理
│   │   ├── loader.ts          # 設定ファイル読み込み
│   │   ├── defaults.ts        # デフォルト設定
│   │   ├── types.ts           # 設定型定義
│   │   └── validator.ts       # 設定バリデーション
│   │
│   ├── themes/                 # テーマシステム
│   │   ├── index.ts           # テーママネージャー
│   │   ├── registry.ts        # テーマ登録
│   │   └── styles/            # CSSファイル
│   │       ├── github.css
│   │       ├── minimal.css
│   │       ├── dark.css
│   │       ├── academic.css
│   │       └── technical.css
│   │
│   ├── utils/                  # ユーティリティ
│   │   ├── logger.ts          # ロギング (chalk使用)
│   │   ├── os-detector.ts     # OS検出
│   │   ├── path-resolver.ts   # パス解決
│   │   └── process-manager.ts # プロセス管理
│   │
│   └── types/                  # グローバル型定義
│       ├── index.ts           # 全型定義のエクスポート
│       └── vimd.d.ts          # vimd固有の型定義
│
├── templates/                  # HTMLテンプレート
│   ├── default.html           # デフォルトテンプレート
│   └── standalone.html        # スタンドアロンHTML用
│
├── scripts/                    # ビルド・メンテナンススクリプト
│   ├── postinstall.js         # npm install後のpandoc検出のみ
│   ├── set-executable.js      # Unix系での実行権限付与（chmod代替）
│   └── test-setup.js          # テスト環境セットアップ
│
├── tests/                      # テストコード
│   ├── unit/                  # ユニットテスト
│   │   ├── config.test.ts
│   │   ├── converter.test.ts
│   │   └── watcher.test.ts
│   ├── integration/           # 統合テスト
│   │   ├── cli.test.ts
│   │   └── e2e.test.ts
│   └── fixtures/              # テスト用フィクスチャ
│       ├── sample.md
│       └── config/
│
├── dist/                       # ビルド成果物 (gitignore)
│   ├── cli/
│   ├── core/
│   └── ...
│
├── docs/                       # ドキュメント
│   ├── README.md              # ユーザー向けREADME（日本語）
│   ├── README-en.md           # ユーザー向けREADME（英語）
│   ├── CONTRIBUTING.md        # コントリビューションガイド（日本語）
│   ├── CONTRIBUTING-en.md     # コントリビューションガイド（英語）
│   ├── API.md                 # API仕様
│   └── CHANGELOG.md           # 変更履歴
│
├── .github/                    # GitHub設定
│   └── workflows/
│       ├── test.yml           # CI/CDテスト
│       └── publish.yml        # npm公開
│
├── package.json
├── tsconfig.json
├── .gitignore
├── .npmignore
├── .eslintrc.json
├── .prettierrc
└── LICENSE
```

---

## ファイル責任

### CLI層 (src/cli/)

#### `src/cli/index.ts`
**責任**: CLIのメインエントリーポイント

```typescript
// メインCLI実行
// commanderでコマンド登録
// vimd --version, --help 対応
```

**依存**:
- commander
- 各コマンドモジュール (commands/*)

---

#### `src/cli/commands/dev.ts`
**責任**: `vimd dev <file>` コマンド実装

```typescript
// 1. 設定読み込み
// 2. pandoc存在チェック (なければ自動インストール)
// 3. ファイル監視開始 (watcher)
// 4. 初回HTML変換 (converter)
// 5. ライブサーバー起動 (server)
// 6. ブラウザ自動オープン
// 7. Ctrl+C でクリーンアップ
```

**依存**:
- core/watcher
- core/converter
- core/server
- config/loader

---

#### `src/cli/commands/build.ts`
**責任**: `vimd build <file>` コマンド実装

```typescript
// 1. 設定読み込み
// 2. Markdown→HTML変換
// 3. ファイル出力
// 4. 完了メッセージ
```

**依存**:
- core/converter
- config/loader

---

#### `src/cli/commands/theme.ts`
**責任**: `vimd theme` コマンド実装

```typescript
// 1. 利用可能なテーマ一覧取得
// 2. 対話式プロンプト (inquirer)
// 3. 選択されたテーマを ~/.vimd/config.js に保存
// 4. 完了メッセージ
```

**依存**:
- inquirer
- themes/registry
- config/loader

---

#### `src/cli/commands/config.ts`
**責任**: `vimd config` コマンド実装

```typescript
// 1. 現在の設定を表示
// 2. 対話式で設定変更
// 3. ~/.vimd/config.js に保存
```

**依存**:
- inquirer
- config/loader

---

#### `src/cli/setup.ts`
**責任**: 初回セットアップ (初回実行時に実行)

```typescript
// 1. "Welcome to vimd!" メッセージ
// 2. テーマ選択プロンプト (inquirer)
// 3. ~/.vimd/ ディレクトリ作成
// 4. ~/.vimd/config.js 生成（JSDDocで型ヒント付与）
// 5. "Setup complete!" メッセージ
```

**依存**:
- inquirer
- fs-extra
- themes/registry

---

### コア層 (src/core/)

#### `src/core/watcher.ts`
**責任**: ファイル監視とホットリロード

```typescript
export class FileWatcher {
  constructor(filePath: string, config: WatchConfig)

  // ファイル変更時のコールバック登録
  onChange(callback: (path: string) => void): void

  // 監視開始
  start(): void

  // 監視停止
  stop(): void
}
```

**使用ライブラリ**: chokidar
**機能**:
- ファイル変更検知
- デバウンス処理 (500ms)
- 複数ファイル監視対応

---

#### `src/core/converter.ts`
**責任**: Markdown→HTML変換

```typescript
export class MarkdownConverter {
  constructor(config: ConverterConfig)

  // Markdown→HTML変換
  async convert(markdownPath: string): Promise<string>

  // HTML文字列からファイル生成
  async writeHTML(html: string, outputPath: string): Promise<void>
}
```

**使用ライブラリ**: pandoc (child_process経由)
**機能**:
- pandocコマンド実行
- テーマCSS適用
- エラーハンドリング

---

#### `src/core/server.ts`
**責任**: ライブサーバー起動とブラウザオープン

```typescript
export class LiveServer {
  constructor(config: ServerConfig)

  // サーバー起動
  async start(htmlPath: string): Promise<void>

  // サーバー停止
  async stop(): Promise<void>

  // ブラウザオープン
  openBrowser(url: string): void
}
```

**使用ライブラリ**: live-server
**機能**:
- HTTPサーバー起動
- WebSocketでホットリロード
- ブラウザ自動オープン

---

#### `src/core/pandoc-detector.ts`
**責任**: pandoc検出とインストールガイダンス

```typescript
export class PandocDetector {
  // pandoc存在チェック
  static async check(): Promise<boolean>

  // OS検出
  static detectOS(): 'macos' | 'linux-debian' | 'linux-redhat' | 'windows'

  // OS別インストールガイダンス表示
  static showInstallGuide(os: string): void
}
```

**機能**:
- pandocコマンド存在確認（which/where経由）
- OS検出 (process.platform)
- OS別インストール手順表示（自動インストールは廃止）
- エラー時のわかりやすいガイダンス

---

#### `src/core/events.ts`
**責任**: イベントシステム（将来のプラグイン機構用）

```typescript
import { EventEmitter } from 'events';

export class VimdEventEmitter extends EventEmitter {
  // ファイル変更イベント
  emitFileChange(filePath: string): void

  // 変換完了イベント
  emitConversionComplete(htmlPath: string): void

  // エラーイベント
  emitError(error: Error): void
}

export const vimdEvents = new VimdEventEmitter();
```

**使用ライブラリ**: Node.js標準 EventEmitter
**機能**:
- 基本的なイベント駆動アーキテクチャ
- Phase 1で基礎実装、Phase 2でプラグイン機構拡張予定
- ファイル変更、変換完了、エラーなどのイベント発火
- 将来的なプラグインシステムの土台

---

### 設定管理層 (src/config/)

#### `src/config/loader.ts`
**責任**: 設定ファイルの読み込みとマージ

```typescript
export class ConfigLoader {
  // グローバル設定読み込み (~/.vimd/config.js)
  static async loadGlobal(): Promise<VimdConfig>

  // デフォルト設定とマージ
  static merge(config: Partial<VimdConfig>): VimdConfig

  // 設定保存
  static async save(config: VimdConfig): Promise<void>
}
```

**使用ライブラリ**: cosmiconfig (ESM対応)
**機能**:
- JavaScript設定ファイル読み込み（JSDDocで型安全性確保）
- デフォルト設定マージ
- バリデーション

---

#### `src/config/defaults.ts`
**責任**: デフォルト設定定義

```typescript
export const DEFAULT_CONFIG: VimdConfig = {
  theme: 'github',
  port: 8080,
  host: 'localhost',
  open: true,
  pandoc: {
    standalone: true,
    toc: false,
    highlightStyle: 'github'
  },
  watch: {
    ignored: ['node_modules/**', '.git/**'],
    debounce: 500
  }
}
```

---

#### `src/config/types.ts`
**責任**: 設定型定義

```typescript
export interface VimdConfig {
  theme: 'github' | 'minimal' | 'dark' | 'academic' | 'technical';
  port: number;
  host: string;
  open: boolean;
  css?: string;
  template?: string;
  pandoc: PandocConfig;
  watch: WatchConfig;
  build?: BuildConfig;
}

export interface PandocConfig {
  standalone: boolean;
  toc: boolean;
  tocDepth?: number;
  highlightStyle: string;
  metadata?: Record<string, string>;
}

export interface WatchConfig {
  ignored: string[];
  debounce: number;
}

export interface BuildConfig {
  output?: string;
  inlineCSS: boolean;
  standalone: boolean;
}

export function defineConfig(config: Partial<VimdConfig>): VimdConfig;
```

---

#### `src/config/validator.ts`
**責任**: 設定バリデーション

```typescript
export class ConfigValidator {
  static validate(config: VimdConfig): ValidationResult

  // ポート番号チェック (1-65535)
  static validatePort(port: number): boolean

  // テーマ存在チェック
  static validateTheme(theme: string): boolean
}
```

---

### テーマ層 (src/themes/)

#### `src/themes/index.ts`
**責任**: テーママネージャー

```typescript
export class ThemeManager {
  // テーマCSS取得
  static getCSS(themeName: string): string

  // 利用可能なテーマ一覧
  static list(): ThemeInfo[]

  // カスタムCSS読み込み
  static loadCustomCSS(path: string): Promise<string>
}
```

---

#### `src/themes/registry.ts`
**責任**: テーマ登録と管理

```typescript
export interface ThemeInfo {
  name: string;
  displayName: string;
  description: string;
  cssPath: string;
}

export const THEMES: ThemeInfo[] = [
  {
    name: 'github',
    displayName: 'GitHub (Recommended)',
    description: 'GitHub Markdown style',
    cssPath: './styles/github.css'
  },
  {
    name: 'minimal',
    displayName: 'Minimal',
    description: 'Simple white background',
    cssPath: './styles/minimal.css'
  },
  // ... 他のテーマ
]
```

---

### ユーティリティ層 (src/utils/)

#### `src/utils/logger.ts`
**責任**: ログ出力

```typescript
export class Logger {
  static info(message: string): void
  static success(message: string): void
  static warn(message: string): void
  static error(message: string): void
}
```

**使用ライブラリ**: chalk

---

#### `src/utils/os-detector.ts`
**責任**: OS検出

```typescript
export class OSDetector {
  static detect(): 'macos' | 'linux-debian' | 'linux-redhat' | 'windows'
  static isMac(): boolean
  static isLinux(): boolean
  static isWindows(): boolean
}
```

---

#### `src/utils/path-resolver.ts`
**責任**: パス解決

```typescript
export class PathResolver {
  // ホームディレクトリ取得
  static getHomeDir(): string

  // ~/.vimd/ パス取得
  static getConfigDir(): string

  // ~/.vimd/config.js パス取得
  static getConfigPath(): string

  // 相対パス→絶対パス変換
  static resolve(path: string): string
}
```

---

#### `src/utils/process-manager.ts`
**責任**: プロセス管理

```typescript
export class ProcessManager {
  // SIGINT (Ctrl+C) ハンドラー登録
  static onExit(callback: () => void): void

  // クリーンアップ
  static cleanup(): Promise<void>
}
```

---

## package.json設計

```json
{
  "name": "vimd",
  "version": "1.0.0",
  "description": "Real-time Markdown preview tool with pandoc",
  "type": "module",
  "keywords": [
    "markdown",
    "preview",
    "live-server",
    "pandoc",
    "cli"
  ],
  "author": "notokeishou",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/notokeishou/vimd.git"
  },
  "homepage": "https://github.com/notokeishou/vimd#readme",
  "bugs": {
    "url": "https://github.com/notokeishou/vimd/issues"
  },
  "bin": {
    "vimd": "./dist/cli/index.js"
  },
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "files": [
    "dist",
    "templates",
    "README.md",
    "LICENSE"
  ],
  "scripts": {
    "dev": "tsx src/cli/index.ts",
    "build": "tsc && node scripts/set-executable.js",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix",
    "format": "prettier --write \"src/**/*.ts\"",
    "typecheck": "tsc --noEmit",
    "postinstall": "node scripts/postinstall.js",
    "prepublishOnly": "npm run build && npm test"
  },
  "dependencies": {
    "chokidar": "^3.6.0",
    "live-server": "^1.2.2",
    "commander": "^12.0.0",
    "inquirer": "^9.2.0",
    "chalk": "^5.3.0",
    "cosmiconfig": "^9.0.0",
    "fs-extra": "^11.2.0",
    "github-markdown-css": "^5.5.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "@types/node": "^20.11.0",
    "@types/inquirer": "^9.0.0",
    "vitest": "^1.2.0",
    "@vitest/coverage-v8": "^1.2.0",
    "eslint": "^8.56.0",
    "@typescript-eslint/eslint-plugin": "^6.19.0",
    "@typescript-eslint/parser": "^6.19.0",
    "prettier": "^3.2.0",
    "tsx": "^4.7.0"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=8.0.0"
  }
}
```

---

## TypeScript設定

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ES2020",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": false,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "types": ["node"]
  },
  "include": [
    "src/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "tests"
  ]
}
```

### tsconfig.build.json (ビルド用)

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "sourceMap": false,
    "declarationMap": false
  },
  "exclude": [
    "node_modules",
    "dist",
    "tests",
    "**/*.test.ts"
  ]
}
```

---

## エントリーポイント

### CLI エントリーポイント: `src/cli/index.ts`

```typescript
#!/usr/bin/env node

import { Command } from 'commander';
import { devCommand } from './commands/dev';
import { buildCommand } from './commands/build';
import { themeCommand } from './commands/theme';
import { configCommand } from './commands/config';

const program = new Command();

program
  .name('vimd')
  .description('Real-time Markdown preview tool')
  .version('1.0.0');

// vimd dev <file>
program
  .command('dev <file>')
  .description('Start live preview')
  .option('-p, --port <port>', 'Port number', '8080')
  .option('-t, --theme <theme>', 'Theme name')
  .option('--no-open', 'Do not open browser')
  .action(devCommand);

// vimd build <file>
program
  .command('build <file>')
  .description('Build HTML file')
  .option('-o, --output <path>', 'Output path')
  .option('-t, --theme <theme>', 'Theme name')
  .action(buildCommand);

// vimd theme
program
  .command('theme')
  .description('Change theme (interactive)')
  .action(themeCommand);

// vimd config
program
  .command('config')
  .description('Edit configuration (interactive)')
  .option('-l, --list', 'List current configuration')
  .action(configCommand);

program.parse(process.argv);
```

---

### ライブラリエントリーポイント: `src/index.ts`

```typescript
// 型定義エクスポート (他のプロジェクトで使用可能)
export { VimdConfig, defineConfig } from './config/types';
export { ThemeManager } from './themes';
export { MarkdownConverter } from './core/converter';
export { FileWatcher } from './core/watcher';
export { LiveServer } from './core/server';
```

---

## モジュール設計

### 依存関係グラフ

```
cli/index.ts
  ├─> commands/dev.ts
  │     ├─> core/watcher.ts
  │     ├─> core/converter.ts
  │     ├─> core/server.ts
  │     ├─> core/pandoc-installer.ts
  │     └─> config/loader.ts
  │
  ├─> commands/build.ts
  │     ├─> core/converter.ts
  │     └─> config/loader.ts
  │
  ├─> commands/theme.ts
  │     ├─> themes/registry.ts
  │     ├─> config/loader.ts
  │     └─> inquirer
  │
  └─> commands/config.ts
        ├─> config/loader.ts
        └─> inquirer

config/loader.ts
  ├─> config/defaults.ts
  ├─> config/types.ts
  ├─> config/validator.ts
  └─> cosmiconfig

core/converter.ts
  ├─> themes/index.ts
  └─> child_process (pandoc実行)

core/watcher.ts
  └─> chokidar

core/server.ts
  └─> live-server

themes/index.ts
  └─> themes/registry.ts

utils/* (全モジュールから使用可能)
```

---

## テーマシステム実装

### CSS配置

```
src/themes/styles/
├── github.css         # github-markdown-css ベース
├── minimal.css        # シンプル白背景
├── dark.css           # VS Code風ダークモード
├── academic.css       # 論文風レイアウト
└── technical.css      # API仕様書向け
```

### テンプレート

```html
<!-- templates/default.html -->
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{title}}</title>
  <style>
    {{theme_css}}
  </style>
  {{custom_css}}
</head>
<body>
  <div class="markdown-body">
    {{content}}
  </div>
</body>
</html>
```

---

## ビルドとデプロイ

### ビルドフロー

```bash
# 開発時
npm run dev            # tsx で直接実行

# ビルド
npm run build          # tsc でコンパイル → dist/

# テスト
npm test              # vitest実行

# 公開前チェック
npm run prepublishOnly # build + test

# npm公開
npm publish
```

### CI/CD (.github/workflows/test.yml)

```yaml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
        node-version: [14.x, 16.x, 18.x, 20.x]

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
      - run: npm ci
      - run: npm run build
      - run: npm test
```

---

## 初回セットアップフロー

### scripts/postinstall.js

```javascript
#!/usr/bin/env node

// npm install -g vimd 実行後に自動実行
// pandoc検出のみ実行（対話式なし、CI/CD互換）

import { execSync } from 'child_process';

try {
  // pandoc存在チェック
  execSync('pandoc --version', { stdio: 'ignore' });
  console.log('✅ pandoc found');
} catch (error) {
  console.warn('⚠️  pandoc not found. vimd will guide you on first run.');
  console.warn('   Installation: https://pandoc.org/installing.html');
}
```

---

### scripts/set-executable.js

```javascript
#!/usr/bin/env node

// ビルド後に実行権限付与（chmod代替、クロスプラットフォーム）

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cliPath = path.join(__dirname, '../dist/cli/index.js');

// Windows以外でのみ実行権限付与
if (process.platform !== 'win32') {
  try {
    fs.chmodSync(cliPath, 0o755);
    console.log('✅ Executable permission set for', cliPath);
  } catch (error) {
    console.warn('⚠️  Failed to set executable permission:', error.message);
  }
} else {
  console.log('ℹ️  Windows detected, skipping chmod');
}
```

**機能**:
- Node.js標準 fs.chmodSync 使用（shell依存なし）
- Windows環境では自動スキップ（不要なため）
- ビルドスクリプトから `npm run build` 経由で実行
- エラー時でも警告のみ（ビルド失敗させない）

---

## まとめ

この設計により以下を実現する:

1. **モジュール分離**: CLI、コア、設定、テーマが独立
2. **テスタビリティ**: 各モジュールが独立してテスト可能
3. **拡張性**: テーマ追加、コマンド追加が容易
4. **型安全性**: TypeScriptによる完全な型定義
5. **保守性**: 責任が明確、ファイルサイズが適切

次のステップ: 詳細設計 → 実装開始 🚀
