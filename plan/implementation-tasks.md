# vimd - 実装タスク詳細

**作成日**: 2025-12-05
**最終更新**: 2025-12-06 (v2.0 - ESM対応版)
**ステータス**: 実装準備フェーズ
**前提**: requirements.md v1.3、project-structure.md v2.0 に基づく
**開発方針**: TDD (Test-Driven Development)

---

## 📋 目次

1. [タスク進行ルール](#タスク進行ルール)
2. [Phase 0: プロジェクト基盤構築](#phase-0-プロジェクト基盤構築)
3. [Phase 1: 型定義とユーティリティ](#phase-1-型定義とユーティリティ)
4. [Phase 2: 設定システム](#phase-2-設定システム)
5. [Phase 3: テーマシステム](#phase-3-テーマシステム)
6. [Phase 4: コア機能](#phase-4-コア機能)
7. [Phase 5: CLIコマンド](#phase-5-cliコマンド)
8. [Phase 6: 統合テストと最終調整](#phase-6-統合テストと最終調整)
9. [Phase 7: ドキュメントと公開準備](#phase-7-ドキュメントと公開準備)

---

## タスク進行ルール

### 基本原則

1. **TDD必須**: テストを先に書いてから実装
2. **1タスク1コミット**: 各タスク完了時にgit commit
3. **動作確認必須**: 各タスク後に `npm test` または動作確認
4. **依存関係順守**: 前のタスクが完了してから次へ
5. **エラー時は停止**: 問題が発生したら次に進まず解決

### タスクフォーマット

各タスクは以下の構造:

```
## Task X.Y: タスク名

**目的**: 何を達成するか
**依存**: 前提となるタスク
**成果物**: 作成されるファイル
**検証方法**: 正しく完了したか確認する方法
**所要時間**: 目安

### ステップ

1. 具体的な手順1
2. 具体的な手順2
...

### 確認コマンド

```bash
# 動作確認用コマンド
```
```

---

## Phase 0: プロジェクト基盤構築

**目標**: 開発環境を整える
**所要時間**: 30-60分

---

### Task 0.1: プロジェクト初期化

**目的**: npmプロジェクトとして初期化
**依存**: なし
**成果物**: `package.json`
**検証方法**: `package.json` が存在し、基本情報が正しい
**所要時間**: 5分

#### ステップ

1. プロジェクトルートに移動
```bash
cd /Users/notokeishou/github/markdown-preview
```

2. 既存の `package.json` があれば確認、なければ作成
```bash
# 既存ファイル確認
ls -la package.json

# なければ新規作成
npm init -y
```

3. `package.json` を以下の内容で上書き
```json
{
  "name": "vimd",
  "version": "0.1.0",
  "description": "Real-time Markdown preview tool with pandoc (view markdown)",
  "type": "module",
  "keywords": [
    "markdown",
    "preview",
    "live-server",
    "pandoc",
    "cli",
    "viewer"
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
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=8.0.0"
  }
}
```

#### 確認コマンド

```bash
cat package.json | grep "vimd"
# "name": "vimd" が表示されればOK
```

---

### Task 0.2: TypeScript設定ファイル作成

**目的**: TypeScriptコンパイラを設定
**依存**: Task 0.1
**成果物**: `tsconfig.json`
**検証方法**: ファイルが存在し、JSONとして有効
**所要時間**: 3分

#### ステップ

1. `tsconfig.json` を作成
```bash
cat > tsconfig.json << 'EOF'
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
EOF
```

#### 確認コマンド

```bash
cat tsconfig.json | grep "outDir"
# "outDir": "./dist" が表示されればOK
```

---

### Task 0.3: Git設定ファイル作成

**目的**: Gitで管理すべきでないファイルを除外
**依存**: Task 0.1
**成果物**: `.gitignore`
**検証方法**: ファイルが存在し、node_modules等が含まれる
**所要時間**: 3分

#### ステップ

1. `.gitignore` を作成
```bash
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
package-lock.json
yarn.lock
pnpm-lock.yaml

# Build outputs
dist/
*.tsbuildinfo

# Test coverage
coverage/
.nyc_output/

# Environment variables
.env
.env.local
.env.*.local

# Editor directories and files
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store

# Logs
logs/
*.log
npm-debug.log*

# Temporary files
tmp/
temp/
.tmp/

# OS files
Thumbs.db
EOF
```

2. `.npmignore` を作成 (npm公開時の除外)
```bash
cat > .npmignore << 'EOF'
# Source files (distのみ公開)
src/
tests/
plan/

# Development files
tsconfig.json
.eslintrc.json
.prettierrc
vitest.config.ts

# Git files
.git/
.gitignore

# CI/CD
.github/

# Documentation (README.mdは含める)
docs/
*.md
!README.md

# Development dependencies
node_modules/
EOF
```

#### 確認コマンド

```bash
cat .gitignore | grep "node_modules"
cat .npmignore | grep "src/"
# 両方とも該当行が表示されればOK
```

---

### Task 0.4: ESLintとPrettier設定

**目的**: コード品質とフォーマットを統一
**依存**: Task 0.1
**成果物**: `.eslintrc.json`, `.prettierrc`
**検証方法**: ファイルが存在し、JSONとして有効
**所要時間**: 5分

#### ステップ

1. `.eslintrc.json` を作成
```bash
cat > .eslintrc.json << 'EOF'
{
  "parser": "@typescript-eslint/parser",
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "plugins": ["@typescript-eslint"],
  "env": {
    "node": true,
    "es2020": true
  },
  "parserOptions": {
    "ecmaVersion": 2020,
    "sourceType": "module",
    "project": "./tsconfig.json"
  },
  "rules": {
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        "argsIgnorePattern": "^_"
      }
    ],
    "no-console": "off"
  }
}
EOF
```

2. `.prettierrc` を作成
```bash
cat > .prettierrc << 'EOF'
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf"
}
EOF
```

#### 確認コマンド

```bash
cat .eslintrc.json | grep "typescript"
cat .prettierrc | grep "singleQuote"
# 両方とも該当行が表示されればOK
```

---

### Task 0.5: Vitest設定

**目的**: テストフレームワークを設定
**依存**: Task 0.2
**成果物**: `vitest.config.ts`
**検証方法**: ファイルが存在し、TypeScriptとして有効
**所要時間**: 3分

#### ステップ

1. `vitest.config.ts` を作成
```bash
cat > vitest.config.ts << 'EOF'
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'dist/',
        'tests/',
        '**/*.test.ts',
        '**/*.config.ts',
      ],
    },
  },
});
EOF
```

#### 確認コマンド

```bash
cat vitest.config.ts | grep "defineConfig"
# defineConfig が表示されればOK
```

---

### Task 0.6: ディレクトリ構造作成

**目的**: 必要なディレクトリを全て作成
**依存**: Task 0.1
**成果物**: 空のディレクトリ構造
**検証方法**: `tree` コマンドまたは `find` で確認
**所要時間**: 5分

#### ステップ

1. ディレクトリを一括作成
```bash
mkdir -p src/cli/commands
mkdir -p src/core
mkdir -p src/config
mkdir -p src/themes/styles
mkdir -p src/utils
mkdir -p src/types
mkdir -p templates
mkdir -p scripts
mkdir -p tests/unit
mkdir -p tests/integration
mkdir -p tests/fixtures/config
mkdir -p docs
```

2. 各ディレクトリに `.gitkeep` を配置 (空ディレクトリをGit管理)
```bash
touch src/cli/commands/.gitkeep
touch src/core/.gitkeep
touch src/config/.gitkeep
touch src/themes/styles/.gitkeep
touch src/utils/.gitkeep
touch src/types/.gitkeep
touch templates/.gitkeep
touch scripts/.gitkeep
touch tests/unit/.gitkeep
touch tests/integration/.gitkeep
touch tests/fixtures/.gitkeep
touch tests/fixtures/config/.gitkeep
touch docs/.gitkeep
```

#### 確認コマンド

```bash
find src -type d | sort
# src/cli, src/cli/commands, src/core 等が表示されればOK

ls -la src/cli/commands/.gitkeep
# .gitkeep が存在すればOK
```

---

### Task 0.7: 開発依存パッケージインストール

**目的**: TypeScript、ESLint、Vitest等の開発ツールをインストール
**依存**: Task 0.1, 0.2, 0.4, 0.5
**成果物**: `node_modules/`, `package-lock.json`
**検証方法**: `npm list` でパッケージ確認
**所要時間**: 5-10分 (ネットワーク速度依存)

#### ステップ

1. 開発依存パッケージをインストール
```bash
npm install --save-dev \
  typescript@^5.3.0 \
  @types/node@^20.11.0 \
  @types/inquirer@^9.0.0 \
  vitest@^1.2.0 \
  @vitest/coverage-v8@^1.2.0 \
  eslint@^8.56.0 \
  @typescript-eslint/eslint-plugin@^6.19.0 \
  @typescript-eslint/parser@^6.19.0 \
  prettier@^3.2.0 \
  tsx@^4.7.0
```

2. インストール成功確認
```bash
npm list typescript
npm list vitest
npm list eslint
```

#### 確認コマンド

```bash
ls -la node_modules/typescript
ls -la node_modules/vitest
# 両方とも存在すればOK

npm run typecheck
# エラーが出なければOK (srcが空なので警告は出る可能性あり)
```

---

### Task 0.8: Git初期化とコミット

**目的**: バージョン管理を開始
**依存**: Task 0.1 - 0.7
**成果物**: `.git/` ディレクトリ、初回コミット
**検証方法**: `git log` でコミット確認
**所要時間**: 3分

#### ステップ

1. Git初期化 (まだの場合)
```bash
# 既存のGitリポジトリか確認
git status

# エラーが出る場合は初期化
git init
```

2. 全てをステージング
```bash
git add .
```

3. 初回コミット
```bash
git commit -m "Initial project setup

- Add package.json with project metadata
- Add TypeScript configuration (tsconfig.json)
- Add ESLint and Prettier configuration
- Add Vitest configuration
- Create directory structure
- Add .gitignore and .npmignore

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

#### 確認コマンド

```bash
git log --oneline
# "Initial project setup" が表示されればOK

git status
# "nothing to commit, working tree clean" が表示されればOK
```

---

## Phase 1: 型定義とユーティリティ

**目標**: 基盤となる型定義とユーティリティを実装
**所要時間**: 2-3時間

---

### Task 1.1: 型定義ファイル作成

**目的**: 全モジュールで使用する型を定義
**依存**: Task 0.8
**成果物**: `src/types/index.ts`, `src/types/vimd.d.ts`, `src/config/types.ts`
**検証方法**: `npm run typecheck` でエラーなし
**所要時間**: 20分

#### ステップ

1. `src/config/types.ts` を作成 (設定型定義)
```typescript
// src/config/types.ts

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

export interface ThemeInfo {
  name: string;
  displayName: string;
  description: string;
  cssPath: string;
}

export interface ServerConfig {
  port: number;
  host: string;
  open: boolean;
  root: string;
}

export interface ConverterConfig {
  theme: string;
  pandocOptions: PandocConfig;
  customCSS?: string;
  template?: string;
}

export function defineConfig(config: Partial<VimdConfig>): VimdConfig {
  return config as VimdConfig;
}
```

2. `src/types/vimd.d.ts` を作成 (vimd固有の型)
```typescript
// src/types/vimd.d.ts

declare module 'vimd' {
  export * from '../config/types';
}
```

3. `src/types/index.ts` を作成 (全型定義エクスポート)
```typescript
// src/types/index.ts

export * from '../config/types';
```

#### 確認コマンド

```bash
npm run typecheck
# エラーが出なければOK
```

---

### Task 1.2: ユーティリティ - Logger実装

**目的**: ログ出力機能を実装
**依存**: Task 1.1
**成果物**: `src/utils/logger.ts`, `tests/unit/logger.test.ts`
**検証方法**: テストが通る
**所要時間**: 30分

#### ステップ (TDD)

1. **テストを先に書く**: `tests/unit/logger.test.ts`
```typescript
// tests/unit/logger.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Logger } from '../../src/utils/logger';

describe('Logger', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should log info messages', () => {
    Logger.info('test message');
    expect(console.log).toHaveBeenCalled();
  });

  it('should log success messages', () => {
    Logger.success('success message');
    expect(console.log).toHaveBeenCalled();
  });

  it('should log warning messages', () => {
    Logger.warn('warning message');
    expect(console.log).toHaveBeenCalled();
  });

  it('should log error messages', () => {
    Logger.error('error message');
    expect(console.error).toHaveBeenCalled();
  });
});
```

2. **テスト実行** (失敗することを確認)
```bash
npm test tests/unit/logger.test.ts
# FAIL と表示されればOK (実装がないため)
```

3. **chalk依存パッケージをインストール**
```bash
npm install chalk@^5.3.0
```

4. **実装**: `src/utils/logger.ts`
```typescript
// src/utils/logger.ts
import chalk from 'chalk';

export class Logger {
  static info(message: string): void {
    console.log(chalk.blue('ℹ'), message);
  }

  static success(message: string): void {
    console.log(chalk.green('✓'), message);
  }

  static warn(message: string): void {
    console.log(chalk.yellow('⚠'), message);
  }

  static error(message: string): void {
    console.error(chalk.red('✗'), message);
  }
}
```

5. **テスト実行** (成功することを確認)
```bash
npm test tests/unit/logger.test.ts
# PASS と表示されればOK
```

6. **コミット**
```bash
git add src/utils/logger.ts tests/unit/logger.test.ts package.json package-lock.json
git commit -m "Add Logger utility with tests

- Implement Logger class with info, success, warn, error methods
- Add chalk dependency for colored output
- Add unit tests with vitest

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 1.3: ユーティリティ - OSDetector実装

**目的**: OS検出機能を実装
**依存**: Task 1.2
**成果物**: `src/utils/os-detector.ts`, `tests/unit/os-detector.test.ts`
**検証方法**: テストが通る
**所要時間**: 30分

#### ステップ (TDD)

1. **テストを先に書く**: `tests/unit/os-detector.test.ts`
```typescript
// tests/unit/os-detector.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OSDetector } from '../../src/utils/os-detector';

describe('OSDetector', () => {
  it('should detect macOS', () => {
    vi.spyOn(process, 'platform', 'get').mockReturnValue('darwin');
    expect(OSDetector.isMac()).toBe(true);
    expect(OSDetector.isLinux()).toBe(false);
    expect(OSDetector.isWindows()).toBe(false);
  });

  it('should detect Linux', () => {
    vi.spyOn(process, 'platform', 'get').mockReturnValue('linux');
    expect(OSDetector.isLinux()).toBe(true);
    expect(OSDetector.isMac()).toBe(false);
    expect(OSDetector.isWindows()).toBe(false);
  });

  it('should detect Windows', () => {
    vi.spyOn(process, 'platform', 'get').mockReturnValue('win32');
    expect(OSDetector.isWindows()).toBe(true);
    expect(OSDetector.isMac()).toBe(false);
    expect(OSDetector.isLinux()).toBe(false);
  });

  it('should return correct OS type for macOS', () => {
    vi.spyOn(process, 'platform', 'get').mockReturnValue('darwin');
    const result = OSDetector.detect();
    expect(result).toBe('macos');
  });

  it('should return correct OS type for Windows', () => {
    vi.spyOn(process, 'platform', 'get').mockReturnValue('win32');
    const result = OSDetector.detect();
    expect(result).toBe('windows');
  });

  it('should return correct OS type for Debian Linux', () => {
    vi.spyOn(process, 'platform', 'get').mockReturnValue('linux');
    const result = OSDetector.detect();
    // デフォルトはlinux-debianを返す想定
    expect(['linux-debian', 'linux-redhat']).toContain(result);
  });
});
```

2. **テスト実行** (失敗することを確認)
```bash
npm test tests/unit/os-detector.test.ts
```

3. **実装**: `src/utils/os-detector.ts`
```typescript
// src/utils/os-detector.ts
import { platform } from 'os';
import { existsSync } from 'fs';

export type OSType = 'macos' | 'linux-debian' | 'linux-redhat' | 'windows';

export class OSDetector {
  static isMac(): boolean {
    return process.platform === 'darwin';
  }

  static isLinux(): boolean {
    return process.platform === 'linux';
  }

  static isWindows(): boolean {
    return process.platform === 'win32';
  }

  static detect(): OSType {
    if (this.isMac()) {
      return 'macos';
    }

    if (this.isWindows()) {
      return 'windows';
    }

    if (this.isLinux()) {
      // Debian系かRedHat系か判定
      if (existsSync('/etc/debian_version')) {
        return 'linux-debian';
      }
      if (existsSync('/etc/redhat-release')) {
        return 'linux-redhat';
      }
      // デフォルトはDebian系として扱う
      return 'linux-debian';
    }

    throw new Error(`Unsupported platform: ${platform()}`);
  }
}
```

4. **テスト実行** (成功することを確認)
```bash
npm test tests/unit/os-detector.test.ts
```

5. **コミット**
```bash
git add src/utils/os-detector.ts tests/unit/os-detector.test.ts
git commit -m "Add OSDetector utility with tests

- Implement OS detection for macOS, Linux (Debian/RedHat), Windows
- Add unit tests with platform mocking

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 1.4: ユーティリティ - PathResolver実装

**目的**: パス解決機能を実装
**依存**: Task 1.3
**成果物**: `src/utils/path-resolver.ts`, `tests/unit/path-resolver.test.ts`
**検証方法**: テストが通る
**所要時間**: 30分

#### ステップ (TDD)

1. **テストを先に書く**: `tests/unit/path-resolver.test.ts`
```typescript
// tests/unit/path-resolver.test.ts
import { describe, it, expect, vi } from 'vitest';
import { PathResolver } from '../../src/utils/path-resolver';
import * as os from 'os';
import * as path from 'path';

describe('PathResolver', () => {
  it('should return home directory', () => {
    const homeDir = PathResolver.getHomeDir();
    expect(homeDir).toBe(os.homedir());
  });

  it('should return config directory path', () => {
    const configDir = PathResolver.getConfigDir();
    expect(configDir).toContain('.vimd');
    expect(path.isAbsolute(configDir)).toBe(true);
  });

  it('should return config file path', () => {
    const configPath = PathResolver.getConfigPath();
    expect(configPath).toContain('.vimd');
    expect(configPath).toContain('config.js');
    expect(path.isAbsolute(configPath)).toBe(true);
  });

  it('should resolve relative path to absolute', () => {
    const relativePath = './test.md';
    const resolved = PathResolver.resolve(relativePath);
    expect(path.isAbsolute(resolved)).toBe(true);
  });

  it('should keep absolute path unchanged', () => {
    const absolutePath = '/tmp/test.md';
    const resolved = PathResolver.resolve(absolutePath);
    expect(resolved).toBe(absolutePath);
  });

  it('should expand ~ to home directory', () => {
    const tildePathFile = '~/test.md';
    const resolved = PathResolver.resolve(tildePathFile);
    expect(resolved).toBe(path.join(os.homedir(), 'test.md'));
  });

  it('should expand ~/ to home directory', () => {
    const tildePath = '~/Documents/test.md';
    const resolved = PathResolver.resolve(tildePath);
    expect(resolved).toBe(path.join(os.homedir(), 'Documents', 'test.md'));
  });
});
```

2. **テスト実行** (失敗することを確認)
```bash
npm test tests/unit/path-resolver.test.ts
```

3. **実装**: `src/utils/path-resolver.ts`
```typescript
// src/utils/path-resolver.ts
import { homedir } from 'os';
import { join, resolve as pathResolve, isAbsolute } from 'path';

export class PathResolver {
  static getHomeDir(): string {
    return homedir();
  }

  static getConfigDir(): string {
    return join(this.getHomeDir(), '.vimd');
  }

  static getConfigPath(): string {
    return join(this.getConfigDir(), 'config.js');
  }

  static resolve(path: string): string {
    // ~ または ~/ で始まる場合はホームディレクトリに展開
    if (path.startsWith('~/') || path === '~') {
      return join(this.getHomeDir(), path.slice(2));
    }

    // 既に絶対パスの場合はそのまま返す
    if (isAbsolute(path)) {
      return path;
    }

    // 相対パスを絶対パスに変換
    return pathResolve(process.cwd(), path);
  }
}
```

4. **テスト実行** (成功することを確認)
```bash
npm test tests/unit/path-resolver.test.ts
```

5. **コミット**
```bash
git add src/utils/path-resolver.ts tests/unit/path-resolver.test.ts
git commit -m "Add PathResolver utility with tests

- Implement path resolution for config directory and files
- Support ~ expansion to home directory
- Add unit tests for all path resolution scenarios

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 1.5: ユーティリティ - ProcessManager実装

**目的**: プロセス管理機能を実装
**依存**: Task 1.4
**成果物**: `src/utils/process-manager.ts`, `tests/unit/process-manager.test.ts`
**検証方法**: テストが通る
**所要時間**: 30分

#### ステップ (TDD)

1. **テストを先に書く**: `tests/unit/process-manager.test.ts`
```typescript
// tests/unit/process-manager.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ProcessManager } from '../../src/utils/process-manager';

describe('ProcessManager', () => {
  beforeEach(() => {
    ProcessManager.reset(); // テスト間でクリーンアップ
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should register exit handler', () => {
    const handler = vi.fn();
    ProcessManager.onExit(handler);

    // SIGINTイベントを発火
    process.emit('SIGINT');

    expect(handler).toHaveBeenCalled();
  });

  it('should execute multiple exit handlers', () => {
    const handler1 = vi.fn();
    const handler2 = vi.fn();

    ProcessManager.onExit(handler1);
    ProcessManager.onExit(handler2);

    process.emit('SIGINT');

    expect(handler1).toHaveBeenCalled();
    expect(handler2).toHaveBeenCalled();
  });

  it('should cleanup registered handlers', async () => {
    const handler = vi.fn();
    ProcessManager.onExit(handler);

    await ProcessManager.cleanup();

    // cleanup後はハンドラが実行されない
    ProcessManager.reset();
    process.emit('SIGINT');

    expect(handler).toHaveBeenCalledTimes(0);
  });
});
```

2. **テスト実行** (失敗することを確認)
```bash
npm test tests/unit/process-manager.test.ts
```

3. **実装**: `src/utils/process-manager.ts`
```typescript
// src/utils/process-manager.ts

type ExitHandler = () => void | Promise<void>;

export class ProcessManager {
  private static handlers: ExitHandler[] = [];
  private static initialized = false;

  private static init() {
    if (this.initialized) return;

    process.on('SIGINT', async () => {
      await this.executeHandlers();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      await this.executeHandlers();
      process.exit(0);
    });

    this.initialized = true;
  }

  static onExit(handler: ExitHandler): void {
    this.init();
    this.handlers.push(handler);
  }

  private static async executeHandlers(): Promise<void> {
    for (const handler of this.handlers) {
      await handler();
    }
  }

  static async cleanup(): Promise<void> {
    this.handlers = [];
  }

  // テスト用: ハンドラをリセット
  static reset(): void {
    this.handlers = [];
    this.initialized = false;
  }
}
```

4. **テスト実行** (成功することを確認)
```bash
npm test tests/unit/process-manager.test.ts
```

5. **コミット**
```bash
git add src/utils/process-manager.ts tests/unit/process-manager.test.ts
git commit -m "Add ProcessManager utility with tests

- Implement process exit handler registration
- Support SIGINT and SIGTERM signals
- Add cleanup functionality
- Add unit tests with event mocking

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Phase 2: 設定システム

**目標**: 設定の読み込み、保存、バリデーション機能を実装
**所要時間**: 2-3時間

---

### Task 2.1: デフォルト設定定義

**目的**: デフォルト設定を定義
**依存**: Task 1.1
**成果物**: `src/config/defaults.ts`, `tests/unit/config-defaults.test.ts`
**検証方法**: テストが通る
**所要時間**: 20分

#### ステップ (TDD)

1. **テストを先に書く**: `tests/unit/config-defaults.test.ts`
```typescript
// tests/unit/config-defaults.test.ts
import { describe, it, expect } from 'vitest';
import { DEFAULT_CONFIG } from '../../src/config/defaults';

describe('DEFAULT_CONFIG', () => {
  it('should have default theme as github', () => {
    expect(DEFAULT_CONFIG.theme).toBe('github');
  });

  it('should have default port as 8080', () => {
    expect(DEFAULT_CONFIG.port).toBe(8080);
  });

  it('should have default host as localhost', () => {
    expect(DEFAULT_CONFIG.host).toBe('localhost');
  });

  it('should have default open as true', () => {
    expect(DEFAULT_CONFIG.open).toBe(true);
  });

  it('should have pandoc configuration', () => {
    expect(DEFAULT_CONFIG.pandoc).toBeDefined();
    expect(DEFAULT_CONFIG.pandoc.standalone).toBe(true);
    expect(DEFAULT_CONFIG.pandoc.toc).toBe(false);
    expect(DEFAULT_CONFIG.pandoc.highlightStyle).toBe('github');
  });

  it('should have watch configuration', () => {
    expect(DEFAULT_CONFIG.watch).toBeDefined();
    expect(DEFAULT_CONFIG.watch.ignored).toContain('node_modules/**');
    expect(DEFAULT_CONFIG.watch.debounce).toBe(500);
  });
});
```

2. **テスト実行** (失敗することを確認)
```bash
npm test tests/unit/config-defaults.test.ts
```

3. **実装**: `src/config/defaults.ts`
```typescript
// src/config/defaults.ts
import { VimdConfig } from './types';

export const DEFAULT_CONFIG: VimdConfig = {
  theme: 'github',
  port: 8080,
  host: 'localhost',
  open: true,
  pandoc: {
    standalone: true,
    toc: false,
    tocDepth: 3,
    highlightStyle: 'github',
  },
  watch: {
    ignored: ['node_modules/**', '.git/**', 'dist/**'],
    debounce: 500,
  },
  build: {
    inlineCSS: false,
    standalone: true,
  },
};
```

4. **テスト実行** (成功することを確認)
```bash
npm test tests/unit/config-defaults.test.ts
```

5. **コミット**
```bash
git add src/config/defaults.ts tests/unit/config-defaults.test.ts
git commit -m "Add default configuration with tests

- Define DEFAULT_CONFIG with all default values
- Add unit tests to verify default settings

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 2.2: 設定バリデーション実装

**目的**: 設定値のバリデーション機能を実装
**依存**: Task 2.1
**成果物**: `src/config/validator.ts`, `tests/unit/config-validator.test.ts`
**検証方法**: テストが通る
**所要時間**: 40分

#### ステップ (TDD)

1. **テストを先に書く**: `tests/unit/config-validator.test.ts`
```typescript
// tests/unit/config-validator.test.ts
import { describe, it, expect } from 'vitest';
import { ConfigValidator } from '../../src/config/validator';
import { DEFAULT_CONFIG } from '../../src/config/defaults';

describe('ConfigValidator', () => {
  describe('validatePort', () => {
    it('should accept valid port numbers', () => {
      expect(ConfigValidator.validatePort(8080)).toBe(true);
      expect(ConfigValidator.validatePort(3000)).toBe(true);
      expect(ConfigValidator.validatePort(65535)).toBe(true);
    });

    it('should reject port 0', () => {
      expect(ConfigValidator.validatePort(0)).toBe(false);
    });

    it('should reject negative ports', () => {
      expect(ConfigValidator.validatePort(-1)).toBe(false);
    });

    it('should reject ports above 65535', () => {
      expect(ConfigValidator.validatePort(65536)).toBe(false);
    });
  });

  describe('validateTheme', () => {
    it('should accept valid themes', () => {
      expect(ConfigValidator.validateTheme('github')).toBe(true);
      expect(ConfigValidator.validateTheme('minimal')).toBe(true);
      expect(ConfigValidator.validateTheme('dark')).toBe(true);
      expect(ConfigValidator.validateTheme('academic')).toBe(true);
      expect(ConfigValidator.validateTheme('technical')).toBe(true);
    });

    it('should reject invalid themes', () => {
      expect(ConfigValidator.validateTheme('invalid')).toBe(false);
      expect(ConfigValidator.validateTheme('')).toBe(false);
    });
  });

  describe('validate', () => {
    it('should validate correct config', () => {
      const result = ConfigValidator.validate(DEFAULT_CONFIG);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect invalid port', () => {
      const config = { ...DEFAULT_CONFIG, port: 70000 };
      const result = ConfigValidator.validate(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid port number: 70000');
    });

    it('should detect invalid theme', () => {
      const config = { ...DEFAULT_CONFIG, theme: 'invalid' as any };
      const result = ConfigValidator.validate(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid theme: invalid');
    });

    it('should detect multiple errors', () => {
      const config = {
        ...DEFAULT_CONFIG,
        port: -1,
        theme: 'invalid' as any,
      };
      const result = ConfigValidator.validate(config);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });
});
```

2. **テスト実行** (失敗することを確認)
```bash
npm test tests/unit/config-validator.test.ts
```

3. **実装**: `src/config/validator.ts`
```typescript
// src/config/validator.ts
import { VimdConfig } from './types';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

const VALID_THEMES = ['github', 'minimal', 'dark', 'academic', 'technical'];

export class ConfigValidator {
  static validatePort(port: number): boolean {
    return Number.isInteger(port) && port > 0 && port <= 65535;
  }

  static validateTheme(theme: string): boolean {
    return VALID_THEMES.includes(theme);
  }

  static validate(config: VimdConfig): ValidationResult {
    const errors: string[] = [];

    // Port validation
    if (!this.validatePort(config.port)) {
      errors.push(`Invalid port number: ${config.port}`);
    }

    // Theme validation
    if (!this.validateTheme(config.theme)) {
      errors.push(`Invalid theme: ${config.theme}`);
    }

    // Host validation
    if (!config.host || config.host.trim() === '') {
      errors.push('Host cannot be empty');
    }

    // Pandoc validation
    if (config.pandoc.tocDepth !== undefined) {
      if (config.pandoc.tocDepth < 1 || config.pandoc.tocDepth > 6) {
        errors.push(`Invalid tocDepth: ${config.pandoc.tocDepth} (must be 1-6)`);
      }
    }

    // Watch debounce validation
    if (config.watch.debounce < 0) {
      errors.push(`Invalid debounce: ${config.watch.debounce} (must be >= 0)`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
```

4. **テスト実行** (成功することを確認)
```bash
npm test tests/unit/config-validator.test.ts
```

5. **コミット**
```bash
git add src/config/validator.ts tests/unit/config-validator.test.ts
git commit -m "Add ConfigValidator with tests

- Implement port, theme, and config validation
- Return detailed validation errors
- Add comprehensive unit tests

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 2.3: 設定ローダー実装 (Part 1: 基本構造)

**目的**: 設定ファイルの読み込み・保存機能を実装
**依存**: Task 2.2, fs-extraパッケージ
**成果物**: `src/config/loader.ts`, `tests/unit/config-loader.test.ts`
**検証方法**: テストが通る
**所要時間**: 60分

#### ステップ (TDD)

1. **fs-extraパッケージをインストール**
```bash
npm install fs-extra@^11.2.0
npm install --save-dev @types/fs-extra
```

2. **テストを先に書く**: `tests/unit/config-loader.test.ts`
```typescript
// tests/unit/config-loader.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ConfigLoader } from '../../src/config/loader';
import { DEFAULT_CONFIG } from '../../src/config/defaults';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';

describe('ConfigLoader', () => {
  const testConfigDir = path.join(os.tmpdir(), 'vimd-test-config');
  const testConfigPath = path.join(testConfigDir, 'config.js');

  beforeEach(async () => {
    // テスト用ディレクトリをクリーンアップ
    await fs.remove(testConfigDir);
  });

  afterEach(async () => {
    await fs.remove(testConfigDir);
    vi.restoreAllMocks();
  });

  describe('merge', () => {
    it('should merge partial config with defaults', () => {
      const partial = { theme: 'dark' as const };
      const merged = ConfigLoader.merge(partial);

      expect(merged.theme).toBe('dark');
      expect(merged.port).toBe(DEFAULT_CONFIG.port);
      expect(merged.host).toBe(DEFAULT_CONFIG.host);
    });

    it('should override nested properties', () => {
      const partial = {
        pandoc: {
          toc: true,
        },
      };
      const merged = ConfigLoader.merge(partial);

      expect(merged.pandoc.toc).toBe(true);
      expect(merged.pandoc.standalone).toBe(DEFAULT_CONFIG.pandoc.standalone);
    });
  });

  describe('save', () => {
    it('should create config directory if not exists', async () => {
      const config = DEFAULT_CONFIG;

      await ConfigLoader.save(config, testConfigPath);

      const exists = await fs.pathExists(testConfigDir);
      expect(exists).toBe(true);
    });

    it('should write config file', async () => {
      const config = { ...DEFAULT_CONFIG, theme: 'dark' as const };

      await ConfigLoader.save(config, testConfigPath);

      const exists = await fs.pathExists(testConfigPath);
      expect(exists).toBe(true);

      const content = await fs.readFile(testConfigPath, 'utf-8');
      expect(content).toContain('defineConfig');
      expect(content).toContain('dark');
    });
  });

  describe('loadGlobal', () => {
    it('should return default config if file not exists', async () => {
      const config = await ConfigLoader.loadGlobal(testConfigPath);
      expect(config).toEqual(DEFAULT_CONFIG);
    });

    it('should load config from file if exists', async () => {
      const savedConfig = { ...DEFAULT_CONFIG, theme: 'minimal' as const };
      await ConfigLoader.save(savedConfig, testConfigPath);

      const loaded = await ConfigLoader.loadGlobal(testConfigPath);
      expect(loaded.theme).toBe('minimal');
    });
  });
});
```

3. **テスト実行** (失敗することを確認)
```bash
npm test tests/unit/config-loader.test.ts
```

4. **実装**: `src/config/loader.ts`
```typescript
// src/config/loader.ts
import { VimdConfig } from './types';
import { DEFAULT_CONFIG } from './defaults';
import { PathResolver } from '../utils/path-resolver';
import * as fs from 'fs-extra';
import * as path from 'path';

export class ConfigLoader {
  static merge(partial: Partial<VimdConfig>): VimdConfig {
    return {
      ...DEFAULT_CONFIG,
      ...partial,
      pandoc: {
        ...DEFAULT_CONFIG.pandoc,
        ...partial.pandoc,
      },
      watch: {
        ...DEFAULT_CONFIG.watch,
        ...partial.watch,
      },
      build: {
        ...DEFAULT_CONFIG.build,
        ...partial.build,
      },
    };
  }

  static async save(
    config: VimdConfig,
    configPath?: string
  ): Promise<void> {
    const targetPath = configPath || PathResolver.getConfigPath();
    const configDir = path.dirname(targetPath);

    // ディレクトリ作成
    await fs.ensureDir(configDir);

    // TypeScript設定ファイルとして出力
    const content = this.generateConfigFile(config);
    await fs.writeFile(targetPath, content, 'utf-8');
  }

  static async loadGlobal(configPath?: string): Promise<VimdConfig> {
    const targetPath = configPath || PathResolver.getConfigPath();

    // ファイルが存在しない場合はデフォルト設定を返す
    if (!(await fs.pathExists(targetPath))) {
      return DEFAULT_CONFIG;
    }

    try {
      // TypeScript設定ファイルを動的にインポート
      // 注: 実際の実装では、tsx等でTypeScriptファイルを実行する必要がある
      // 今回は簡易的にJSONとしてパース
      const content = await fs.readFile(targetPath, 'utf-8');
      const config = this.parseConfigFile(content);
      return this.merge(config);
    } catch (error) {
      console.error('Failed to load config file:', error);
      return DEFAULT_CONFIG;
    }
  }

  private static generateConfigFile(config: VimdConfig): string {
    return `import { defineConfig } from 'vimd';

export default defineConfig(${JSON.stringify(config, null, 2)});
`;
  }

  private static parseConfigFile(content: string): Partial<VimdConfig> {
    // 簡易的なパース (実際はtsx等でTypeScriptを実行)
    // JSON部分を抽出
    const match = content.match(/defineConfig\(([\s\S]*)\);/);
    if (match) {
      try {
        return JSON.parse(match[1]);
      } catch {
        return {};
      }
    }
    return {};
  }
}
```

5. **テスト実行** (成功することを確認)
```bash
npm test tests/unit/config-loader.test.ts
```

6. **コミット**
```bash
git add src/config/loader.ts tests/unit/config-loader.test.ts package.json package-lock.json
git commit -m "Add ConfigLoader with tests

- Implement config file read/write functionality
- Support TypeScript config file format
- Add config merging with defaults
- Add comprehensive unit tests with fs mocking

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Phase 3: テーマシステム

**目標**: テーマの登録、取得、CSS管理機能を実装
**所要時間**: 2-3時間

---

### Task 3.1: テーマレジストリ実装

**目的**: テーマ情報の登録と管理
**依存**: Task 1.1
**成果物**: `src/themes/registry.ts`, `tests/unit/theme-registry.test.ts`
**検証方法**: テストが通る
**所要時間**: 30分

#### ステップ (TDD)

1. **テストを先に書く**: `tests/unit/theme-registry.test.ts`
```typescript
// tests/unit/theme-registry.test.ts
import { describe, it, expect } from 'vitest';
import { THEMES, getThemeByName } from '../../src/themes/registry';

describe('Theme Registry', () => {
  it('should export 5 themes', () => {
    expect(THEMES).toHaveLength(5);
  });

  it('should have github theme', () => {
    const github = THEMES.find((t) => t.name === 'github');
    expect(github).toBeDefined();
    expect(github?.displayName).toContain('GitHub');
  });

  it('should have all required themes', () => {
    const names = THEMES.map((t) => t.name);
    expect(names).toContain('github');
    expect(names).toContain('minimal');
    expect(names).toContain('dark');
    expect(names).toContain('academic');
    expect(names).toContain('technical');
  });

  it('should return theme by name', () => {
    const theme = getThemeByName('github');
    expect(theme).toBeDefined();
    expect(theme?.name).toBe('github');
  });

  it('should return undefined for invalid theme', () => {
    const theme = getThemeByName('invalid');
    expect(theme).toBeUndefined();
  });

  it('should have cssPath for each theme', () => {
    THEMES.forEach((theme) => {
      expect(theme.cssPath).toBeDefined();
      expect(theme.cssPath).toContain('.css');
    });
  });
});
```

2. **テスト実行** (失敗することを確認)
```bash
npm test tests/unit/theme-registry.test.ts
```

3. **実装**: `src/themes/registry.ts`
```typescript
// src/themes/registry.ts
import { ThemeInfo } from '../config/types';
import * as path from 'path';

export const THEMES: ThemeInfo[] = [
  {
    name: 'github',
    displayName: 'GitHub (Recommended)',
    description: 'GitHub Markdown style with clean design',
    cssPath: path.join(__dirname, 'styles', 'github.css'),
  },
  {
    name: 'minimal',
    displayName: 'Minimal',
    description: 'Simple white background with minimal decoration',
    cssPath: path.join(__dirname, 'styles', 'minimal.css'),
  },
  {
    name: 'dark',
    displayName: 'Dark',
    description: 'VS Code inspired dark mode',
    cssPath: path.join(__dirname, 'styles', 'dark.css'),
  },
  {
    name: 'academic',
    displayName: 'Academic',
    description: 'Paper-style layout for academic writing',
    cssPath: path.join(__dirname, 'styles', 'academic.css'),
  },
  {
    name: 'technical',
    displayName: 'Technical',
    description: 'API documentation style with sidebar',
    cssPath: path.join(__dirname, 'styles', 'technical.css'),
  },
];

export function getThemeByName(name: string): ThemeInfo | undefined {
  return THEMES.find((theme) => theme.name === name);
}
```

4. **テスト実行** (成功することを確認)
```bash
npm test tests/unit/theme-registry.test.ts
```

5. **コミット**
```bash
git add src/themes/registry.ts tests/unit/theme-registry.test.ts
git commit -m "Add theme registry with tests

- Define 5 built-in themes (github, minimal, dark, academic, technical)
- Add theme lookup function
- Add unit tests for theme registry

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 3.2: テーママネージャー実装

**目的**: テーマCSS読み込みとカスタムCSS管理
**依存**: Task 3.1
**成果物**: `src/themes/index.ts`, `tests/unit/theme-manager.test.ts`
**検証方法**: テストが通る
**所要時間**: 40分

#### ステップ (TDD)

1. **テストを先に書く**: `tests/unit/theme-manager.test.ts`
```typescript
// tests/unit/theme-manager.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ThemeManager } from '../../src/themes';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';

describe('ThemeManager', () => {
  const testDir = path.join(os.tmpdir(), 'vimd-theme-test');
  const testCSSPath = path.join(testDir, 'custom.css');

  beforeEach(async () => {
    await fs.ensureDir(testDir);
  });

  afterEach(async () => {
    await fs.remove(testDir);
  });

  describe('list', () => {
    it('should return all available themes', () => {
      const themes = ThemeManager.list();
      expect(themes).toHaveLength(5);
    });

    it('should return themes with all required properties', () => {
      const themes = ThemeManager.list();
      themes.forEach((theme) => {
        expect(theme.name).toBeDefined();
        expect(theme.displayName).toBeDefined();
        expect(theme.description).toBeDefined();
        expect(theme.cssPath).toBeDefined();
      });
    });
  });

  describe('getCSS', () => {
    it('should return CSS content for valid theme', async () => {
      // まずCSSファイルを作成
      const cssDir = path.join(__dirname, '../../src/themes/styles');
      await fs.ensureDir(cssDir);
      await fs.writeFile(
        path.join(cssDir, 'github.css'),
        'body { color: black; }'
      );

      const css = await ThemeManager.getCSS('github');
      expect(css).toContain('body');
    });

    it('should throw error for invalid theme', async () => {
      await expect(ThemeManager.getCSS('invalid')).rejects.toThrow();
    });
  });

  describe('loadCustomCSS', () => {
    it('should load custom CSS from file', async () => {
      const customCSS = 'h1 { color: red; }';
      await fs.writeFile(testCSSPath, customCSS);

      const css = await ThemeManager.loadCustomCSS(testCSSPath);
      expect(css).toBe(customCSS);
    });

    it('should throw error if file not exists', async () => {
      await expect(
        ThemeManager.loadCustomCSS('/nonexistent/file.css')
      ).rejects.toThrow();
    });
  });
});
```

2. **テスト実行** (失敗することを確認)
```bash
npm test tests/unit/theme-manager.test.ts
```

3. **実装**: `src/themes/index.ts`
```typescript
// src/themes/index.ts
import { ThemeInfo } from '../config/types';
import { THEMES, getThemeByName } from './registry';
import * as fs from 'fs-extra';

export class ThemeManager {
  static list(): ThemeInfo[] {
    return THEMES;
  }

  static async getCSS(themeName: string): Promise<string> {
    const theme = getThemeByName(themeName);

    if (!theme) {
      throw new Error(`Theme not found: ${themeName}`);
    }

    try {
      const css = await fs.readFile(theme.cssPath, 'utf-8');
      return css;
    } catch (error) {
      throw new Error(
        `Failed to load theme CSS for '${themeName}': ${error}`
      );
    }
  }

  static async loadCustomCSS(cssPath: string): Promise<string> {
    try {
      const css = await fs.readFile(cssPath, 'utf-8');
      return css;
    } catch (error) {
      throw new Error(`Failed to load custom CSS from '${cssPath}': ${error}`);
    }
  }
}
```

4. **テスト実行** (成功することを確認)
```bash
npm test tests/unit/theme-manager.test.ts
```

5. **コミット**
```bash
git add src/themes/index.ts tests/unit/theme-manager.test.ts
git commit -m "Add ThemeManager with tests

- Implement theme CSS loading functionality
- Support custom CSS file loading
- Add unit tests with fs mocking

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 3.3: テーマCSS作成

**目的**: 5つのテーマCSSファイルを作成
**依存**: Task 3.2
**成果物**: `src/themes/styles/*.css`
**検証方法**: ファイルが存在し、有効なCSS
**所要時間**: 60分

#### ステップ

1. **github-markdown-cssパッケージをインストール**
```bash
npm install github-markdown-css@^5.5.0
```

2. **GitHubテーマCSS作成**: `src/themes/styles/github.css`
```bash
cat > src/themes/styles/github.css << 'EOF'
/* GitHub Theme - Based on github-markdown-css */
@import url('github-markdown-css/github-markdown.css');

.markdown-body {
  box-sizing: border-box;
  min-width: 200px;
  max-width: 980px;
  margin: 0 auto;
  padding: 45px;
}

@media (max-width: 767px) {
  .markdown-body {
    padding: 15px;
  }
}
EOF
```

3. **Minimalテーマ作成**: `src/themes/styles/minimal.css`
```bash
cat > src/themes/styles/minimal.css << 'EOF'
/* Minimal Theme - Simple and clean */
body {
  font-family: system-ui, -apple-system, sans-serif;
  line-height: 1.6;
  color: #000;
  background: #fff;
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

h1, h2, h3, h4, h5, h6 {
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  font-weight: 600;
}

code {
  background: #f5f5f5;
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: monospace;
}

pre {
  background: #f5f5f5;
  padding: 1em;
  border-radius: 5px;
  overflow-x: auto;
}

pre code {
  background: none;
  padding: 0;
}
EOF
```

4. **Darkテーマ作成**: `src/themes/styles/dark.css`
```bash
cat > src/themes/styles/dark.css << 'EOF'
/* Dark Theme - VS Code inspired */
body {
  font-family: 'Fira Code', Consolas, Monaco, monospace;
  line-height: 1.6;
  color: #d4d4d4;
  background: #1e1e1e;
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
}

h1, h2, h3, h4, h5, h6 {
  color: #569cd6;
  margin-top: 1.5em;
  margin-bottom: 0.5em;
}

a {
  color: #569cd6;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

code {
  background: #252526;
  color: #ce9178;
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: 'Fira Code', monospace;
}

pre {
  background: #252526;
  padding: 1em;
  border-radius: 5px;
  overflow-x: auto;
  border: 1px solid #333;
}

pre code {
  background: none;
  color: #d4d4d4;
  padding: 0;
}

blockquote {
  border-left: 4px solid #569cd6;
  padding-left: 1em;
  color: #b5b5b5;
  margin-left: 0;
}
EOF
```

5. **Academicテーマ作成**: `src/themes/styles/academic.css`
```bash
cat > src/themes/styles/academic.css << 'EOF'
/* Academic Theme - Paper-style layout */
body {
  font-family: Georgia, 'Times New Roman', serif;
  line-height: 1.8;
  color: #333;
  background: #fff;
  max-width: 700px;
  margin: 0 auto;
  padding: 3rem;
}

h1 {
  font-size: 2em;
  text-align: center;
  margin-bottom: 2em;
  border-bottom: none;
}

h2 {
  font-size: 1.5em;
  margin-top: 2em;
  margin-bottom: 0.5em;
}

p {
  text-align: justify;
  margin-bottom: 1em;
}

code {
  background: #f9f9f9;
  padding: 0.2em 0.4em;
  border: 1px solid #e0e0e0;
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
}

pre {
  background: #f9f9f9;
  padding: 1em;
  border: 1px solid #e0e0e0;
  overflow-x: auto;
}

blockquote {
  border-left: 3px solid #ccc;
  padding-left: 1em;
  font-style: italic;
  color: #666;
  margin: 1.5em 0;
}

.footnote {
  font-size: 0.9em;
  color: #666;
}
EOF
```

6. **Technicalテーマ作成**: `src/themes/styles/technical.css`
```bash
cat > src/themes/styles/technical.css << 'EOF'
/* Technical Theme - API documentation style */
body {
  font-family: 'SF Mono', 'Roboto Mono', monospace;
  line-height: 1.6;
  color: #2c3e50;
  background: #fafafa;
  margin: 0;
  padding: 0;
}

.markdown-body {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  font-size: 2.5em;
  color: #34495e;
  border-bottom: 3px solid #3498db;
  padding-bottom: 0.5em;
}

h2 {
  font-size: 1.8em;
  color: #34495e;
  margin-top: 2em;
  border-bottom: 2px solid #ecf0f1;
  padding-bottom: 0.3em;
}

h3 {
  font-size: 1.3em;
  color: #34495e;
}

code {
  background: #f4f4f4;
  color: #e74c3c;
  padding: 0.2em 0.5em;
  border-radius: 3px;
  font-family: 'SF Mono', monospace;
  font-size: 0.95em;
}

pre {
  background: #f4f4f4;
  padding: 1.5em;
  border-radius: 5px;
  overflow-x: auto;
  border-left: 4px solid #3498db;
}

pre code {
  background: none;
  color: #2c3e50;
  padding: 0;
}

a {
  color: #3498db;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

table {
  border-collapse: collapse;
  width: 100%;
  margin: 1em 0;
}

th, td {
  border: 1px solid #ddd;
  padding: 0.8em;
  text-align: left;
}

th {
  background: #34495e;
  color: #fff;
}
EOF
```

7. **CSS構文チェック**
```bash
# 各CSSファイルが存在することを確認
ls -la src/themes/styles/
# github.css, minimal.css, dark.css, academic.css, technical.css があればOK
```

8. **コミット**
```bash
git add src/themes/styles/ package.json package-lock.json
git commit -m "Add 5 theme CSS files

- Add GitHub theme (based on github-markdown-css)
- Add Minimal theme (simple and clean)
- Add Dark theme (VS Code inspired)
- Add Academic theme (paper-style)
- Add Technical theme (API documentation style)

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Phase 4: コア機能

**目標**: ファイル監視、Markdown変換、ライブサーバーを実装
**所要時間**: 4-5時間

---

### Task 4.1: 依存パッケージインストール (chokidar, live-server等)

**目的**: コア機能に必要なパッケージをインストール
**依存**: Task 0.7
**成果物**: 更新された `package.json`, `package-lock.json`
**検証方法**: `npm list` でパッケージ確認
**所要時間**: 5分

#### ステップ

1. **プロダクション依存パッケージをインストール**
```bash
npm install \
  chokidar@^3.6.0 \
  live-server@^1.2.2 \
  commander@^12.0.0 \
  inquirer@^9.2.0
```

2. **インストール確認**
```bash
npm list chokidar
npm list live-server
npm list commander
npm list inquirer
```

#### 確認コマンド

```bash
ls -la node_modules/chokidar
ls -la node_modules/live-server
# 両方とも存在すればOK
```

3. **コミット**
```bash
git add package.json package-lock.json
git commit -m "Add core dependencies

- Add chokidar for file watching
- Add live-server for live reloading
- Add commander for CLI
- Add inquirer for interactive prompts

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 4.2: ファイル監視機能実装 (Watcher)

**目的**: chokidarを使ったファイル監視機能
**依存**: Task 4.1
**成果物**: `src/core/watcher.ts`, `tests/unit/watcher.test.ts`
**検証方法**: テストが通る
**所要時間**: 60分

#### ステップ (TDD)

1. **テストを先に書く**: `tests/unit/watcher.test.ts`
```typescript
// tests/unit/watcher.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FileWatcher } from '../../src/core/watcher';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';

describe('FileWatcher', () => {
  const testDir = path.join(os.tmpdir(), 'vimd-watcher-test');
  const testFile = path.join(testDir, 'test.md');

  beforeEach(async () => {
    await fs.ensureDir(testDir);
    await fs.writeFile(testFile, '# Test');
  });

  afterEach(async () => {
    await fs.remove(testDir);
  });

  it('should create watcher instance', () => {
    const watcher = new FileWatcher(testFile, {
      ignored: ['node_modules/**'],
      debounce: 100,
    });

    expect(watcher).toBeDefined();
  });

  it('should call onChange callback when file changes', async () => {
    const callback = vi.fn();
    const watcher = new FileWatcher(testFile, {
      ignored: [],
      debounce: 100,
    });

    watcher.onChange(callback);
    watcher.start();

    // ファイルを変更
    await fs.writeFile(testFile, '# Changed');

    // デバウンス待機
    await new Promise((resolve) => setTimeout(resolve, 200));

    expect(callback).toHaveBeenCalled();

    await watcher.stop();
  });

  it('should debounce rapid changes', async () => {
    const callback = vi.fn();
    const watcher = new FileWatcher(testFile, {
      ignored: [],
      debounce: 500,
    });

    watcher.onChange(callback);
    watcher.start();

    // 連続で変更
    await fs.writeFile(testFile, '# Change 1');
    await fs.writeFile(testFile, '# Change 2');
    await fs.writeFile(testFile, '# Change 3');

    // デバウンス期間待機
    await new Promise((resolve) => setTimeout(resolve, 600));

    // デバウンスにより1回のみ呼ばれる
    expect(callback).toHaveBeenCalledTimes(1);

    await watcher.stop();
  });

  it('should stop watching when stop() is called', async () => {
    const callback = vi.fn();
    const watcher = new FileWatcher(testFile, {
      ignored: [],
      debounce: 100,
    });

    watcher.onChange(callback);
    watcher.start();
    await watcher.stop();

    // 停止後の変更は検知されない
    await fs.writeFile(testFile, '# After stop');
    await new Promise((resolve) => setTimeout(resolve, 200));

    expect(callback).not.toHaveBeenCalled();
  });
});
```

2. **テスト実行** (失敗することを確認)
```bash
npm test tests/unit/watcher.test.ts
```

3. **実装**: `src/core/watcher.ts`
```typescript
// src/core/watcher.ts
import chokidar, { FSWatcher } from 'chokidar';
import { WatchConfig } from '../config/types';

type ChangeCallback = (path: string) => void;

export class FileWatcher {
  private watcher: FSWatcher | null = null;
  private callbacks: ChangeCallback[] = [];
  private debounceTimer: NodeJS.Timeout | null = null;

  constructor(
    private filePath: string,
    private config: WatchConfig
  ) {}

  onChange(callback: ChangeCallback): void {
    this.callbacks.push(callback);
  }

  start(): void {
    this.watcher = chokidar.watch(this.filePath, {
      ignored: this.config.ignored,
      persistent: true,
      ignoreInitial: true,
    });

    this.watcher.on('change', (path: string) => {
      this.handleChange(path);
    });
  }

  async stop(): Promise<void> {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    if (this.watcher) {
      await this.watcher.close();
      this.watcher = null;
    }
  }

  private handleChange(path: string): void {
    // デバウンス処理
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.callbacks.forEach((callback) => callback(path));
      this.debounceTimer = null;
    }, this.config.debounce);
  }
}
```

4. **テスト実行** (成功することを確認)
```bash
npm test tests/unit/watcher.test.ts
```

5. **コミット**
```bash
git add src/core/watcher.ts tests/unit/watcher.test.ts
git commit -m "Add FileWatcher with tests

- Implement file watching with chokidar
- Add debounce functionality for rapid changes
- Support ignored patterns
- Add comprehensive unit tests

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

---

## Phase 4: コア機能 (続き)

**目標**: Markdown変換、ライブサーバー、pandoc自動インストール機能を実装
**所要時間**: 4-5時間

---

### Task 4.3: Pandoc検出器実装

**目的**: pandoc存在確認とインストールガイダンス表示（自動インストール廃止）
**依存**: Task 1.3 (OSDetector)
**成果物**: `src/core/pandoc-detector.ts`, `tests/unit/pandoc-detector.test.ts`
**検証方法**: テストが通る
**所要時間**: 30分
**セキュリティ**: sudo実行を削除し、ユーザーにガイダンスのみ表示

#### ステップ (TDD)

1. **テストを先に書く**: `tests/unit/pandoc-detector.test.ts`
```typescript
// tests/unit/pandoc-detector.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PandocDetector } from '../../src/core/pandoc-detector';
import { execSync } from 'child_process';

vi.mock('child_process');

describe('PandocDetector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('check', () => {
    it('should return true if pandoc is installed', () => {
      vi.mocked(execSync).mockReturnValue(Buffer.from('pandoc 2.19'));

      const result = PandocDetector.check();
      expect(result).toBe(true);
    });

    it('should return false if pandoc is not installed', () => {
      vi.mocked(execSync).mockImplementation(() => {
        throw new Error('command not found');
      });

      const result = PandocDetector.check();
      expect(result).toBe(false);
    });
  });

  describe('detectOS', () => {
    it('should return macos for darwin', () => {
      const originalPlatform = process.platform;
      Object.defineProperty(process, 'platform', { value: 'darwin' });

      const os = PandocDetector.detectOS();
      expect(os).toBe('macos');

      Object.defineProperty(process, 'platform', { value: originalPlatform });
    });

    it('should return windows for win32', () => {
      const originalPlatform = process.platform;
      Object.defineProperty(process, 'platform', { value: 'win32' });

      const os = PandocDetector.detectOS();
      expect(os).toBe('windows');

      Object.defineProperty(process, 'platform', { value: originalPlatform });
    });
  });

  describe('showInstallGuide', () => {
    it('should log install guide for macOS', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      PandocDetector.showInstallGuide('macos');

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('brew install pandoc'));
      consoleSpy.mockRestore();
    });

    it('should log install guide for Windows', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      PandocDetector.showInstallGuide('windows');

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('choco install pandoc'));
      consoleSpy.mockRestore();
    });
  });
});
```

2. **テスト実行** (失敗することを確認)
```bash
npm test tests/unit/pandoc-detector.test.ts
```

3. **実装**: `src/core/pandoc-detector.ts`
```typescript
// src/core/pandoc-detector.ts
import { execSync } from 'child_process';
import { OSType } from '../utils/os-detector';

export class PandocDetector {
  static check(): boolean {
    try {
      execSync('pandoc --version', { stdio: 'pipe' });
      return true;
    } catch {
      return false;
    }
  }

  static detectOS(): OSType {
    switch (process.platform) {
      case 'darwin':
        return 'macos';
      case 'win32':
        return 'windows';
      case 'linux':
        // Simplified: default to debian-based
        return 'linux-debian';
      default:
        return 'linux-debian';
    }
  }

  static showInstallGuide(os: OSType): void {
    console.error('⚠️  pandoc not found');
    console.error('');
    console.error('vimd requires pandoc to convert Markdown to HTML.');
    console.error('Please install pandoc manually:');
    console.error('');

    switch (os) {
      case 'macos':
        console.error('  macOS (Homebrew):');
        console.error('    brew install pandoc');
        console.error('');
        console.error('  macOS (Official installer):');
        console.error('    https://github.com/jgm/pandoc/releases');
        break;

      case 'linux-debian':
        console.error('  Debian/Ubuntu:');
        console.error('    sudo apt-get update');
        console.error('    sudo apt-get install pandoc');
        break;

      case 'linux-redhat':
        console.error('  RedHat/CentOS/Fedora:');
        console.error('    sudo yum install pandoc');
        break;

      case 'windows':
        console.error('  Windows (Chocolatey):');
        console.error('    choco install pandoc');
        console.error('');
        console.error('  Windows (Official installer):');
        console.error('    https://github.com/jgm/pandoc/releases');
        break;
    }

    console.error('');
    console.error('For more installation options:');
    console.error('  https://pandoc.org/installing.html');
    console.error('');

    process.exit(1);
  }

  static ensureInstalled(): void {
    if (this.check()) {
      return;
    }

    const os = this.detectOS();
    this.showInstallGuide(os);
  }
}
```

4. **テスト実行** (成功することを確認)
```bash
npm test tests/unit/pandoc-detector.test.ts
```

5. **コミット**
```bash
git add src/core/pandoc-detector.ts tests/unit/pandoc-detector.test.ts
git commit -m "Add PandocDetector with tests (no auto-install)

- Implement pandoc existence check
- Add OS detection
- Show install guidance (no sudo execution)
- Remove automatic installation for security
- Add unit tests

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 4.4: HTMLテンプレート作成

**目的**: Markdown→HTML変換時に使用するテンプレート
**依存**: Task 3.3 (テーマCSS)
**成果物**: `templates/default.html`, `templates/standalone.html`
**検証方法**: ファイルが存在し、有効なHTML
**所要時間**: 20分

#### ステップ

1. **デフォルトテンプレート作成**: `templates/default.html`
```bash
cat > templates/default.html << 'EOF'
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="generator" content="vimd">
  <title>{{title}}</title>
  <style>
{{theme_css}}
  </style>
{{#if custom_css}}
  <style>
{{custom_css}}
  </style>
{{/if}}
</head>
<body>
  <div class="markdown-body">
{{content}}
  </div>
</body>
</html>
EOF
```

2. **スタンドアロンテンプレート作成**: `templates/standalone.html`
```bash
cat > templates/standalone.html << 'EOF'
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="generator" content="vimd">
  <title>{{title}}</title>
  <style>
{{theme_css}}
  </style>
{{#if custom_css}}
  <style>
{{custom_css}}
  </style>
{{/if}}
</head>
<body>
  <div class="markdown-body">
{{content}}
  </div>

  <!-- vimd metadata -->
  <script type="application/json" id="vimd-meta">
  {
    "generated": "{{timestamp}}",
    "theme": "{{theme}}",
    "version": "{{version}}"
  }
  </script>
</body>
</html>
EOF
```

3. **テンプレート検証**
```bash
# ファイル存在確認
ls -la templates/default.html
ls -la templates/standalone.html

# HTML構文チェック (簡易)
grep -q "<!DOCTYPE html>" templates/default.html && echo "OK: default.html"
grep -q "<!DOCTYPE html>" templates/standalone.html && echo "OK: standalone.html"
```

4. **コミット**
```bash
git add templates/
git commit -m "Add HTML templates

- Add default.html for live preview
- Add standalone.html for static build
- Support theme CSS injection
- Support custom CSS injection

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 4.5: Markdown変換機能実装 (Converter)

**目的**: pandocを使ったMarkdown→HTML変換
**依存**: Task 4.3, 4.4
**成果物**: `src/core/converter.ts`, `tests/unit/converter.test.ts`
**検証方法**: テストが通る
**所要時間**: 90分

#### ステップ (TDD)

1. **テストフィクスチャ作成**: `tests/fixtures/sample.md`
```bash
mkdir -p tests/fixtures
cat > tests/fixtures/sample.md << 'EOF'
# Sample Markdown

This is a **test** document.

## Code Example

```javascript
console.log('Hello, vimd!');
```

- List item 1
- List item 2
EOF
```

2. **テストを先に書く**: `tests/unit/converter.test.ts`
```typescript
// tests/unit/converter.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MarkdownConverter } from '../../src/core/converter';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';

describe('MarkdownConverter', () => {
  const testDir = path.join(os.tmpdir(), 'vimd-converter-test');
  const testMdPath = path.join(testDir, 'test.md');
  const testHtmlPath = path.join(testDir, 'test.html');

  beforeEach(async () => {
    await fs.ensureDir(testDir);
    await fs.writeFile(testMdPath, '# Test\n\nHello **world**!');
  });

  afterEach(async () => {
    await fs.remove(testDir);
  });

  it('should create converter instance', () => {
    const converter = new MarkdownConverter({
      theme: 'github',
      pandocOptions: {
        standalone: true,
        toc: false,
        highlightStyle: 'github',
      },
    });

    expect(converter).toBeDefined();
  });

  it('should convert markdown to HTML', async () => {
    const converter = new MarkdownConverter({
      theme: 'github',
      pandocOptions: {
        standalone: false,
        toc: false,
        highlightStyle: 'github',
      },
    });

    const html = await converter.convert(testMdPath);

    expect(html).toContain('<h1');
    expect(html).toContain('Test');
    expect(html).toContain('<strong>world</strong>');
  });

  it('should write HTML to file', async () => {
    const converter = new MarkdownConverter({
      theme: 'github',
      pandocOptions: {
        standalone: false,
        toc: false,
        highlightStyle: 'github',
      },
    });

    const html = await converter.convert(testMdPath);
    await converter.writeHTML(html, testHtmlPath);

    const exists = await fs.pathExists(testHtmlPath);
    expect(exists).toBe(true);

    const content = await fs.readFile(testHtmlPath, 'utf-8');
    expect(content).toContain('<h1');
  });

  it('should include theme CSS in output', async () => {
    const converter = new MarkdownConverter({
      theme: 'github',
      pandocOptions: {
        standalone: false,
        toc: false,
        highlightStyle: 'github',
      },
    });

    const html = await converter.convertWithTemplate(testMdPath);

    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<style>');
  });

  it('should handle pandoc errors', async () => {
    const converter = new MarkdownConverter({
      theme: 'github',
      pandocOptions: {
        standalone: false,
        toc: false,
        highlightStyle: 'github',
      },
    });

    await expect(
      converter.convert('/nonexistent/file.md')
    ).rejects.toThrow();
  });
});
```

3. **テスト実行** (失敗することを確認)
```bash
npm test tests/unit/converter.test.ts
```

4. **実装**: `src/core/converter.ts`
```typescript
// src/core/converter.ts
import { execSync } from 'child_process';
import { ConverterConfig } from '../config/types';
import { ThemeManager } from '../themes';
import * as fs from 'fs-extra';
import * as path from 'path';

export class MarkdownConverter {
  constructor(private config: ConverterConfig) {}

  async convert(markdownPath: string): Promise<string> {
    const pandocArgs = this.buildPandocArgs();
    const command = `pandoc ${pandocArgs.join(' ')} "${markdownPath}"`;

    try {
      const html = execSync(command, {
        encoding: 'utf-8',
        maxBuffer: 10 * 1024 * 1024, // 10MB
      });

      return html;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to convert markdown: ${errorMessage}`);
    }
  }

  async convertWithTemplate(markdownPath: string): Promise<string> {
    const contentHtml = await this.convert(markdownPath);
    const themeCSS = await ThemeManager.getCSS(this.config.theme);

    let customCSS = '';
    if (this.config.customCSS) {
      customCSS = await ThemeManager.loadCustomCSS(this.config.customCSS);
    }

    const templatePath = this.config.template
      ? this.config.template
      : path.join(__dirname, '../../templates/default.html');

    const template = await fs.readFile(templatePath, 'utf-8');

    // 簡易的なテンプレート置換
    let html = template
      .replace('{{title}}', path.basename(markdownPath, '.md'))
      .replace('{{theme_css}}', themeCSS)
      .replace('{{content}}', contentHtml);

    if (customCSS) {
      html = html.replace('{{custom_css}}', customCSS);
    } else {
      html = html.replace(/\{\{#if custom_css\}\}[\s\S]*?\{\{\/if\}\}/g, '');
    }

    return html;
  }

  async writeHTML(html: string, outputPath: string): Promise<void> {
    await fs.ensureDir(path.dirname(outputPath));
    await fs.writeFile(outputPath, html, 'utf-8');
  }

  private buildPandocArgs(): string[] {
    const args: string[] = [];

    // 基本オプション
    args.push('--from=markdown');
    args.push('--to=html');

    if (this.config.pandocOptions.standalone) {
      args.push('--standalone');
    }

    if (this.config.pandocOptions.toc) {
      args.push('--toc');
      if (this.config.pandocOptions.tocDepth) {
        args.push(`--toc-depth=${this.config.pandocOptions.tocDepth}`);
      }
    }

    if (this.config.pandocOptions.highlightStyle) {
      args.push(`--highlight-style=${this.config.pandocOptions.highlightStyle}`);
    }

    // メタデータ
    if (this.config.pandocOptions.metadata) {
      Object.entries(this.config.pandocOptions.metadata).forEach(([key, value]) => {
        args.push(`--metadata=${key}:"${value}"`);
      });
    }

    return args;
  }
}
```

5. **テスト実行** (成功することを確認)
```bash
npm test tests/unit/converter.test.ts
```

6. **コミット**
```bash
git add src/core/converter.ts tests/unit/converter.test.ts tests/fixtures/
git commit -m "Add MarkdownConverter with tests

- Implement pandoc-based markdown conversion
- Support theme CSS injection
- Add template-based HTML generation
- Support custom CSS and metadata
- Add comprehensive unit tests

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 4.6: ライブサーバー機能実装 (Server)

**目的**: live-serverを使ったHTTPサーバーとホットリロード
**依存**: Task 4.1
**成果物**: `src/core/server.ts`, `tests/unit/server.test.ts`
**検証方法**: テストが通る
**所要時間**: 60分

#### ステップ (TDD)

1. **型定義追加**: `@types/live-server`がない場合は作成
```bash
# @types/live-serverがない場合
mkdir -p src/types
cat > src/types/live-server.d.ts << 'EOF'
declare module 'live-server' {
  export interface LiveServerParams {
    port?: number;
    host?: string;
    root?: string;
    open?: boolean;
    file?: string;
    wait?: number;
    logLevel?: number;
    middleware?: any[];
  }

  export function start(params: LiveServerParams): void;
  export function shutdown(): void;
}
EOF
```

2. **テストを先に書く**: `tests/unit/server.test.ts`
```typescript
// tests/unit/server.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LiveServer } from '../../src/core/server';

vi.mock('live-server');

describe('LiveServer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create server instance', () => {
    const server = new LiveServer({
      port: 8080,
      host: 'localhost',
      open: true,
      root: '.',
    });

    expect(server).toBeDefined();
  });

  it('should start server with correct config', async () => {
    const liveServer = await import('live-server');
    const startSpy = vi.spyOn(liveServer, 'start');

    const server = new LiveServer({
      port: 8080,
      host: 'localhost',
      open: true,
      root: '/tmp',
    });

    await server.start('/tmp/test.html');

    expect(startSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        port: 8080,
        host: 'localhost',
        open: true,
        root: '/tmp',
      })
    );
  });

  it('should stop server', async () => {
    const liveServer = await import('live-server');
    const shutdownSpy = vi.spyOn(liveServer, 'shutdown');

    const server = new LiveServer({
      port: 8080,
      host: 'localhost',
      open: true,
      root: '.',
    });

    await server.stop();

    expect(shutdownSpy).toHaveBeenCalled();
  });
});
```

3. **テスト実行** (失敗することを確認)
```bash
npm test tests/unit/server.test.ts
```

4. **実装**: `src/core/server.ts`
```typescript
// src/core/server.ts
import * as liveServer from 'live-server';
import { ServerConfig } from '../config/types';
import { Logger } from '../utils/logger';
import * as path from 'path';
import open from 'open';

export class LiveServer {
  private running = false;

  constructor(private config: ServerConfig) {}

  async start(htmlPath: string): Promise<void> {
    const root = path.dirname(htmlPath);
    const file = path.basename(htmlPath);

    const params: liveServer.LiveServerParams = {
      port: this.config.port,
      host: this.config.host,
      root: root,
      file: file,
      open: false, // 手動でopenする
      wait: 200,
      logLevel: 0, // silent
    };

    try {
      liveServer.start(params);
      this.running = true;

      const url = `http://${this.config.host}:${this.config.port}`;
      Logger.success(`Server started at ${url}`);

      if (this.config.open) {
        await this.openBrowser(url);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to start server: ${errorMessage}`);
    }
  }

  async stop(): Promise<void> {
    if (!this.running) {
      return;
    }

    liveServer.shutdown();
    this.running = false;
    Logger.info('Server stopped');
  }

  async openBrowser(url: string): Promise<void> {
    try {
      await open(url);
      Logger.info('Browser opened');
    } catch (error) {
      Logger.warn('Failed to open browser automatically');
    }
  }

  getURL(): string {
    return `http://${this.config.host}:${this.config.port}`;
  }
}
```

5. **open依存パッケージをインストール**
```bash
npm install open@^9.1.0
```

6. **テスト実行** (成功することを確認)
```bash
npm test tests/unit/server.test.ts
```

7. **コミット** (分割)
```bash
# 型定義をコミット
git add src/types/live-server.d.ts
git commit -m "Add live-server type definitions

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"

# サーバー実装をコミット
git add src/core/server.ts tests/unit/server.test.ts package.json package-lock.json
git commit -m "Add LiveServer with tests

- Implement HTTP server with live-server
- Support browser auto-open
- Add graceful shutdown
- Add unit tests with live-server mocking

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Phase 5: CLIコマンド

**目標**: CLI層を実装（dev, build, theme, config, setup）
**所要時間**: 5-6時間

---

### Task 5.1: CLI基盤 - Commanderセットアップ

**目的**: CLIエントリーポイント作成
**依存**: Task 4.1
**成果物**: `src/cli/index.ts`
**検証方法**: `npm run dev -- --version` で動作確認
**所要時間**: 20分

#### ステップ

1. **CLI エントリーポイント作成**: `src/cli/index.ts`
```typescript
// src/cli/index.ts
#!/usr/bin/env node

import { Command } from 'commander';
import { devCommand } from './commands/dev';
import { buildCommand } from './commands/build';
import { themeCommand } from './commands/theme';
import { configCommand } from './commands/config';

const program = new Command();

program
  .name('vimd')
  .description('Real-time Markdown preview tool (view markdown)')
  .version('0.1.0');

// vimd dev <file>
program
  .command('dev <file>')
  .description('Start live preview server')
  .option('-p, --port <port>', 'Port number', '8080')
  .option('-t, --theme <theme>', 'Theme name')
  .option('--no-open', 'Do not open browser automatically')
  .action(devCommand);

// vimd build <file>
program
  .command('build <file>')
  .description('Build static HTML file')
  .option('-o, --output <path>', 'Output file path')
  .option('-t, --theme <theme>', 'Theme name')
  .action(buildCommand);

// vimd theme
program
  .command('theme')
  .description('Change theme interactively')
  .action(themeCommand);

// vimd config
program
  .command('config')
  .description('Edit configuration interactively')
  .option('-l, --list', 'List current configuration')
  .action(configCommand);

program.parse(process.argv);
```

2. **動作確認**
```bash
npm run dev -- --version
# 0.1.0 が表示されればOK

npm run dev -- --help
# コマンド一覧が表示されればOK
```

3. **コミット**
```bash
git add src/cli/index.ts
git commit -m "Add CLI entry point with commander

- Set up commander program
- Define all commands (dev, build, theme, config)
- Add version and help

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 5.2: setupコマンド実装 (初回セットアップ)

**目的**: npm install時に実行される初回セットアップ
**依存**: Task 2.3, 3.1
**成果物**: `src/cli/setup.ts`, `scripts/postinstall.js`
**検証方法**: 手動実行で動作確認
**所要時間**: 60分

#### ステップ

1. **setupコマンド実装**: `src/cli/setup.ts`
```typescript
// src/cli/setup.ts
import inquirer from 'inquirer';
import { ConfigLoader } from '../config/loader';
import { DEFAULT_CONFIG } from '../config/defaults';
import { ThemeManager } from '../themes';
import { Logger } from '../utils/logger';
import { PathResolver } from '../utils/path-resolver';
import * as fs from 'fs-extra';

export async function setupCommand(): Promise<void> {
  console.log('\nWelcome to vimd!\n');

  const themes = ThemeManager.list();

  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'theme',
      message: 'Select a theme:',
      choices: themes.map((t) => ({
        name: `${t.displayName} - ${t.description}`,
        value: t.name,
      })),
      default: 'github',
    },
  ]);

  const config = {
    ...DEFAULT_CONFIG,
    theme: answers.theme,
  };

  try {
    const configPath = PathResolver.getConfigPath();
    const configDir = PathResolver.getConfigDir();

    // ディレクトリ作成
    Logger.info(`Creating configuration directory: ${configDir}`);
    await fs.ensureDir(configDir);

    // 設定保存
    Logger.info(`Saving configuration: ${configPath}`);
    await ConfigLoader.save(config, configPath);

    Logger.success('\nSetup complete!\n');
    console.log('Get started:');
    console.log('  vimd dev README.md  - Start preview');
    console.log('  vimd theme          - Change theme');
    console.log('  vimd config         - Advanced settings\n');
  } catch (error) {
    Logger.error('Setup failed');
    if (error instanceof Error) {
      Logger.error(error.message);
    }
    process.exit(1);
  }
}

// 直接実行された場合
if (require.main === module) {
  setupCommand().catch((error) => {
    console.error('Setup error:', error);
    process.exit(1);
  });
}
```

2. **postinstallスクリプト作成**: `scripts/postinstall.js`
```javascript
#!/usr/bin/env node

// npm install -g vimd 後に自動実行
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const setupScript = path.join(__dirname, '../dist/cli/setup.js');

// distが存在する場合のみ実行 (開発時は実行しない)
if (fs.existsSync(setupScript)) {
  try {
    execSync(`node ${setupScript}`, { stdio: 'inherit' });
  } catch (error) {
    console.error('Setup failed. You can run "vimd theme" to configure later.');
  }
} else {
  console.log('Skipping setup (development mode)');
}
```

3. **package.jsonのpostinstallスクリプト確認**
```bash
# すでに設定されているはず
grep "postinstall" package.json
# "postinstall": "node scripts/postinstall.js" が表示されればOK
```

4. **動作確認** (手動実行)
```bash
# TypeScriptを直接実行
npx tsx src/cli/setup.ts
# テーマ選択プロンプトが表示され、~/.vimd/config.js が作成されればOK
```

5. **コミット** (分割)
```bash
# setupコマンド
git add src/cli/setup.ts
git commit -m "Add setup command for initial configuration

- Implement interactive theme selection
- Create ~/.vimd/config.js
- Display welcome message and usage guide

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"

# postinstallスクリプト
git add scripts/postinstall.js
git commit -m "Add postinstall script

- Execute setup after npm install
- Skip in development mode
- Handle setup errors gracefully

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 5.3: devコマンド実装

**目的**: `vimd dev <file>` コマンド実装
**依存**: Task 4.2, 4.5, 4.6
**成果物**: `src/cli/commands/dev.ts`
**検証方法**: 実際にMarkdownファイルでテスト
**所要時間**: 90分

#### ステップ

1. **devコマンド実装**: `src/cli/commands/dev.ts`
```typescript
// src/cli/commands/dev.ts
import { ConfigLoader } from '../../config/loader';
import { FileWatcher } from '../../core/watcher';
import { MarkdownConverter } from '../../core/converter';
import { LiveServer } from '../../core/server';
import { PandocDetector } from '../../core/pandoc-detector';
import { OSDetector } from '../../utils/os-detector';
import { Logger } from '../../utils/logger';
import { ProcessManager } from '../../utils/process-manager';
import * as path from 'path';
import * as fs from 'fs-extra';

interface DevOptions {
  port?: string;
  theme?: string;
  open?: boolean;
}

export async function devCommand(
  filePath: string,
  options: DevOptions
): Promise<void> {
  try {
    Logger.info('Starting vimd dev...');

    // 1. 設定読み込み
    const config = await ConfigLoader.loadGlobal();

    // コマンドラインオプションで上書き
    if (options.port) {
      config.port = parseInt(options.port, 10);
    }
    if (options.theme) {
      config.theme = options.theme as any;
    }
    if (options.open !== undefined) {
      config.open = options.open;
    }

    Logger.info(`Theme: ${config.theme}`);
    Logger.info(`Port: ${config.port}`);

    // 2. Pandoc存在チェック & 自動インストール
    if (!PandocInstaller.check()) {
      Logger.warn('Pandoc not found. Installing automatically...');
      const os = OSDetector.detect();
      await PandocInstaller.install(os);
    }

    // 3. ファイル存在チェック
    const absolutePath = path.resolve(filePath);
    if (!(await fs.pathExists(absolutePath))) {
      Logger.error(`File not found: ${filePath}`);
      process.exit(1);
    }

    // 4. 出力先準備
    const outputDir = path.join(process.cwd(), '.vimd-tmp');
    await fs.ensureDir(outputDir);
    const htmlPath = path.join(
      outputDir,
      path.basename(filePath, path.extname(filePath)) + '.html'
    );

    // 5. Converter準備
    const converter = new MarkdownConverter({
      theme: config.theme,
      pandocOptions: config.pandoc,
      customCSS: config.css,
      template: config.template,
    });

    // 6. 初回変換
    Logger.info('Converting markdown...');
    const html = await converter.convertWithTemplate(absolutePath);
    await converter.writeHTML(html, htmlPath);
    Logger.success('Conversion complete');

    // 7. ライブサーバー起動
    const server = new LiveServer({
      port: config.port,
      host: config.host,
      open: config.open,
      root: outputDir,
    });

    await server.start(htmlPath);

    Logger.info(`Watching: ${filePath}`);
    Logger.info('Press Ctrl+C to stop');

    // 8. ファイル監視開始
    const watcher = new FileWatcher(absolutePath, config.watch);

    watcher.onChange(async (changedPath) => {
      Logger.info('File changed, reconverting...');
      try {
        const newHtml = await converter.convertWithTemplate(changedPath);
        await converter.writeHTML(newHtml, htmlPath);
        Logger.success('Reconversion complete');
      } catch (error) {
        Logger.error('Reconversion failed');
        if (error instanceof Error) {
          Logger.error(error.message);
        }
      }
    });

    watcher.start();

    // 9. クリーンアップ登録
    ProcessManager.onExit(async () => {
      Logger.info('Shutting down...');
      await watcher.stop();
      await server.stop();
      await fs.remove(outputDir);
      Logger.info('Cleanup complete');
    });
  } catch (error) {
    Logger.error('Failed to start dev server');
    if (error instanceof Error) {
      Logger.error(error.message);
    }
    process.exit(1);
  }
}
```

2. **テスト用Markdownファイル作成**
```bash
cat > test-sample.md << 'EOF'
# Test Document

This is a **test** document for vimd.

## Features

- Real-time preview
- Multiple themes
- Syntax highlighting

## Code Example

```javascript
function hello() {
  console.log('Hello, vimd!');
}
```
EOF
```

3. **動作確認** (手動テスト)
```bash
# ビルドしてから実行
npm run build
npm run dev test-sample.md

# 別ターミナルでファイル編集
echo "\n\n## New Section\n\nAdded content" >> test-sample.md

# ブラウザで自動更新を確認
# Ctrl+C で停止
```

4. **クリーンアップ**
```bash
rm test-sample.md
```

5. **コミット**
```bash
git add src/cli/commands/dev.ts
git commit -m "Add dev command implementation

- Implement vimd dev <file> command
- Support file watching and hot reload
- Auto-install pandoc if not found
- Support command-line options (port, theme, open)
- Add graceful shutdown with cleanup

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 5.4: buildコマンド実装

**目的**: `vimd build <file>` コマンド実装
**依存**: Task 4.5
**成果物**: `src/cli/commands/build.ts`
**検証方法**: 実際にHTMLファイルが生成される
**所要時間**: 40分

#### ステップ

1. **buildコマンド実装**: `src/cli/commands/build.ts`
```typescript
// src/cli/commands/build.ts
import { ConfigLoader } from '../../config/loader';
import { MarkdownConverter } from '../../core/converter';
import { PandocDetector } from '../../core/pandoc-detector';
import { OSDetector } from '../../utils/os-detector';
import { Logger } from '../../utils/logger';
import * as path from 'path';
import * as fs from 'fs-extra';

interface BuildOptions {
  output?: string;
  theme?: string;
}

export async function buildCommand(
  filePath: string,
  options: BuildOptions
): Promise<void> {
  try {
    Logger.info('Building HTML...');

    // 1. 設定読み込み
    const config = await ConfigLoader.loadGlobal();

    // コマンドラインオプションで上書き
    if (options.theme) {
      config.theme = options.theme as any;
    }

    Logger.info(`Theme: ${config.theme}`);

    // 2. Pandoc存在チェック & 自動インストール
    if (!PandocInstaller.check()) {
      Logger.warn('Pandoc not found. Installing automatically...');
      const os = OSDetector.detect();
      await PandocInstaller.install(os);
    }

    // 3. ファイル存在チェック
    const absolutePath = path.resolve(filePath);
    if (!(await fs.pathExists(absolutePath))) {
      Logger.error(`File not found: ${filePath}`);
      process.exit(1);
    }

    // 4. 出力先決定
    const outputPath = options.output
      ? path.resolve(options.output)
      : path.join(
          path.dirname(absolutePath),
          path.basename(filePath, path.extname(filePath)) + '.html'
        );

    Logger.info(`Output: ${outputPath}`);

    // 5. Converter準備
    const converter = new MarkdownConverter({
      theme: config.theme,
      pandocOptions: {
        ...config.pandoc,
        standalone: true, // buildは常にstandalone
      },
      customCSS: config.css,
      template: config.template || undefined,
    });

    // 6. 変換実行
    Logger.info('Converting...');
    const html = await converter.convertWithTemplate(absolutePath);
    await converter.writeHTML(html, outputPath);

    Logger.success(`Build complete: ${outputPath}`);
  } catch (error) {
    Logger.error('Build failed');
    if (error instanceof Error) {
      Logger.error(error.message);
    }
    process.exit(1);
  }
}
```

2. **動作確認** (手動テスト)
```bash
# テスト用Markdownファイル作成
cat > build-test.md << 'EOF'
# Build Test

This is a build test.
EOF

# ビルド実行
npm run build
npm run dev build build-test.md

# HTMLファイルが生成されたか確認
ls -la build-test.html
cat build-test.html | head -20

# カスタム出力先指定
npm run dev build build-test.md -- -o output/test.html
ls -la output/test.html

# クリーンアップ
rm build-test.md build-test.html
rm -rf output/
```

3. **コミット**
```bash
git add src/cli/commands/build.ts
git commit -m "Add build command implementation

- Implement vimd build <file> command
- Support custom output path
- Generate standalone HTML
- Auto-install pandoc if not found

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 5.5: themeコマンド実装

**目的**: `vimd theme` コマンド実装
**依存**: Task 2.3, 3.1
**成果物**: `src/cli/commands/theme.ts`
**検証方法**: 対話的にテーマ変更が動作
**所要時間**: 30分

#### ステップ

1. **themeコマンド実装**: `src/cli/commands/theme.ts`
```typescript
// src/cli/commands/theme.ts
import inquirer from 'inquirer';
import { ConfigLoader } from '../../config/loader';
import { ThemeManager } from '../../themes';
import { Logger } from '../../utils/logger';

export async function themeCommand(): Promise<void> {
  try {
    // 1. 現在の設定読み込み
    const config = await ConfigLoader.loadGlobal();
    const currentTheme = config.theme;

    // 2. テーマ一覧取得
    const themes = ThemeManager.list();

    // 3. 対話的選択
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'theme',
        message: 'Select a theme:',
        choices: themes.map((t) => ({
          name:
            t.name === currentTheme
              ? `${t.displayName} (current)`
              : t.displayName,
          value: t.name,
        })),
        default: currentTheme,
      },
    ]);

    // 変更がない場合
    if (answers.theme === currentTheme) {
      Logger.info('Theme unchanged');
      return;
    }

    // 4. 設定更新
    config.theme = answers.theme;
    await ConfigLoader.save(config);

    Logger.success(`Theme updated to '${answers.theme}'`);
    Logger.info('All projects will use this theme.');
  } catch (error) {
    Logger.error('Failed to change theme');
    if (error instanceof Error) {
      Logger.error(error.message);
    }
    process.exit(1);
  }
}
```

2. **動作確認** (手動テスト)
```bash
npm run build
npm run dev theme

# テーマ選択プロンプトが表示される
# 選択後、~/.vimd/config.js が更新されることを確認
cat ~/.vimd/config.js | grep theme
```

3. **コミット**
```bash
git add src/cli/commands/theme.ts
git commit -m "Add theme command implementation

- Implement vimd theme command
- Show current theme in selection
- Update global configuration
- Support interactive theme selection

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 5.6: configコマンド実装

**目的**: `vimd config` コマンド実装
**依存**: Task 2.3
**成果物**: `src/cli/commands/config.ts`
**検証方法**: 対話的に設定変更が動作
**所要時間**: 50分

#### ステップ

1. **configコマンド実装**: `src/cli/commands/config.ts`
```typescript
// src/cli/commands/config.ts
import inquirer from 'inquirer';
import { ConfigLoader } from '../../config/loader';
import { ThemeManager } from '../../themes';
import { Logger } from '../../utils/logger';
import { PathResolver } from '../../utils/path-resolver';

interface ConfigOptions {
  list?: boolean;
}

export async function configCommand(options: ConfigOptions): Promise<void> {
  try {
    // --list オプション: 現在の設定を表示
    if (options.list) {
      await showCurrentConfig();
      return;
    }

    // 対話的設定変更
    await interactiveConfig();
  } catch (error) {
    Logger.error('Failed to update configuration');
    if (error instanceof Error) {
      Logger.error(error.message);
    }
    process.exit(1);
  }
}

async function showCurrentConfig(): Promise<void> {
  const config = await ConfigLoader.loadGlobal();
  const configPath = PathResolver.getConfigPath();

  console.log('\nCurrent configuration:');
  console.log(`  Theme: ${config.theme}`);
  console.log(`  Port: ${config.port}`);
  console.log(`  Host: ${config.host}`);
  console.log(`  Open Browser: ${config.open}`);
  console.log(`  Config File: ${configPath}\n`);
}

async function interactiveConfig(): Promise<void> {
  const config = await ConfigLoader.loadGlobal();

  // 変更したい項目を選択
  const { item } = await inquirer.prompt([
    {
      type: 'list',
      name: 'item',
      message: 'What would you like to change?',
      choices: [
        { name: 'Theme', value: 'theme' },
        { name: 'Port number', value: 'port' },
        { name: 'Auto-open browser', value: 'open' },
        { name: 'Cancel', value: 'cancel' },
      ],
    },
  ]);

  if (item === 'cancel') {
    Logger.info('Configuration unchanged');
    return;
  }

  // 項目別の変更処理
  switch (item) {
    case 'theme':
      await changeTheme(config);
      break;
    case 'port':
      await changePort(config);
      break;
    case 'open':
      await changeOpen(config);
      break;
  }

  // 設定保存
  await ConfigLoader.save(config);
  Logger.success('Configuration updated');
}

async function changeTheme(config: any): Promise<void> {
  const themes = ThemeManager.list();

  const { theme } = await inquirer.prompt([
    {
      type: 'list',
      name: 'theme',
      message: 'Select a theme:',
      choices: themes.map((t) => ({
        name:
          t.name === config.theme
            ? `${t.displayName} (current)`
            : t.displayName,
        value: t.name,
      })),
      default: config.theme,
    },
  ]);

  config.theme = theme;
}

async function changePort(config: any): Promise<void> {
  const { port } = await inquirer.prompt([
    {
      type: 'input',
      name: 'port',
      message: 'Enter port number:',
      default: config.port.toString(),
      validate: (input: string) => {
        const num = parseInt(input, 10);
        if (isNaN(num) || num < 1 || num > 65535) {
          return 'Port must be between 1 and 65535';
        }
        return true;
      },
    },
  ]);

  config.port = parseInt(port, 10);
}

async function changeOpen(config: any): Promise<void> {
  const { open } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'open',
      message: 'Auto-open browser in preview?',
      default: config.open,
    },
  ]);

  config.open = open;
}
```

2. **動作確認** (手動テスト)
```bash
npm run build

# 設定一覧表示
npm run dev config -- --list

# 対話的変更
npm run dev config
# 各項目を選択して変更できることを確認
```

3. **コミット**
```bash
git add src/cli/commands/config.ts
git commit -m "Add config command implementation

- Implement vimd config command
- Support --list option to show current config
- Support interactive configuration change
- Validate user input (port range, etc.)

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 5.7: エクスポート用index作成

**目的**: ライブラリとして使用できるようエクスポート
**依存**: 全モジュール完成
**成果物**: `src/index.ts`
**検証方法**: ビルド成功、型定義が生成される
**所要時間**: 10分

#### ステップ

1. **エクスポート用index作成**: `src/index.ts`
```typescript
// src/index.ts

// 型定義エクスポート
export { VimdConfig, defineConfig, ThemeInfo } from './config/types';

// コア機能エクスポート
export { MarkdownConverter } from './core/converter';
export { FileWatcher } from './core/watcher';
export { LiveServer } from './core/server';
export { PandocDetector } from './core/pandoc-detector';

// テーマ管理エクスポート
export { ThemeManager } from './themes';

// 設定管理エクスポート
export { ConfigLoader } from './config/loader';
export { DEFAULT_CONFIG } from './config/defaults';
export { ConfigValidator } from './config/validator';

// ユーティリティエクスポート
export { Logger } from './utils/logger';
export { OSDetector } from './utils/os-detector';
export { PathResolver } from './utils/path-resolver';
```

2. **ビルドテスト**
```bash
npm run build

# dist/index.js と dist/index.d.ts が生成されることを確認
ls -la dist/index.js
ls -la dist/index.d.ts

# 型定義の内容確認
head -20 dist/index.d.ts
```

3. **コミット**
```bash
git add src/index.ts
git commit -m "Add library export index

- Export all public APIs
- Support usage as a library
- Generate type definitions

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Phase 6: 統合テストと最終調整

**目標**: E2Eテスト、統合テスト、バグ修正
**所要時間**: 2-3時間

---

### Task 6.1: 統合テスト - CLIコマンド

**目的**: 実際のCLIコマンドの統合テスト
**依存**: Phase 5完了
**成果物**: `tests/integration/cli.test.ts`
**検証方法**: テストが通る
**所要時間**: 60分

#### ステップ

1. **統合テスト作成**: `tests/integration/cli.test.ts`
```typescript
// tests/integration/cli.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { execSync } from 'child_process';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';

describe('CLI Integration Tests', () => {
  const testDir = path.join(os.tmpdir(), 'vimd-cli-test');
  const testMd = path.join(testDir, 'test.md');

  beforeEach(async () => {
    await fs.ensureDir(testDir);
    await fs.writeFile(testMd, '# Test\n\nHello **world**!');
  });

  afterEach(async () => {
    await fs.remove(testDir);
  });

  it('should show version', () => {
    const output = execSync('npm run dev -- --version', {
      encoding: 'utf-8',
    });

    expect(output).toContain('0.1.0');
  });

  it('should show help', () => {
    const output = execSync('npm run dev -- --help', {
      encoding: 'utf-8',
    });

    expect(output).toContain('vimd');
    expect(output).toContain('dev');
    expect(output).toContain('build');
  });

  it('should build HTML file', () => {
    const outputPath = path.join(testDir, 'output.html');

    execSync(`npm run dev build ${testMd} -- -o ${outputPath}`, {
      encoding: 'utf-8',
      cwd: process.cwd(),
    });

    expect(fs.existsSync(outputPath)).toBe(true);

    const html = fs.readFileSync(outputPath, 'utf-8');
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<h1');
    expect(html).toContain('Test');
  });
});
```

2. **テスト実行**
```bash
npm run build
npm test tests/integration/cli.test.ts
```

3. **コミット**
```bash
git add tests/integration/cli.test.ts
git commit -m "Add CLI integration tests

- Test version and help commands
- Test build command with real files
- Verify HTML output generation

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 6.2: E2Eテスト - 完全なワークフロー

**目的**: 完全なユーザーワークフローのテスト
**依存**: Task 6.1
**成果物**: `tests/integration/e2e.test.ts`
**検証方法**: テストが通る
**所要時間**: 60分

#### ステップ

1. **E2Eテスト作成**: `tests/integration/e2e.test.ts`
```typescript
// tests/integration/e2e.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { ConfigLoader } from '../../src/config/loader';
import { MarkdownConverter } from '../../src/core/converter';
import { FileWatcher } from '../../src/core/watcher';
import { PathResolver } from '../../src/utils/path-resolver';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';

describe('E2E: Complete Workflow', () => {
  const testDir = path.join(os.tmpdir(), 'vimd-e2e-test');
  const testConfigPath = path.join(testDir, 'config.js');
  const testMd = path.join(testDir, 'document.md');
  const testHtml = path.join(testDir, 'document.html');

  beforeAll(async () => {
    await fs.ensureDir(testDir);
  });

  afterAll(async () => {
    await fs.remove(testDir);
  });

  it('should complete full workflow', async () => {
    // 1. 設定ファイル作成
    const config = await ConfigLoader.loadGlobal();
    await ConfigLoader.save(config, testConfigPath);

    expect(await fs.pathExists(testConfigPath)).toBe(true);

    // 2. Markdownファイル作成
    await fs.writeFile(
      testMd,
      `# E2E Test Document

## Introduction

This is a **test** document.

## Code Example

\`\`\`javascript
console.log('Hello, vimd!');
\`\`\`
`
    );

    // 3. HTML変換
    const converter = new MarkdownConverter({
      theme: 'github',
      pandocOptions: config.pandoc,
    });

    const html = await converter.convertWithTemplate(testMd);
    await converter.writeHTML(html, testHtml);

    expect(await fs.pathExists(testHtml)).toBe(true);

    const htmlContent = await fs.readFile(testHtml, 'utf-8');
    expect(htmlContent).toContain('<!DOCTYPE html>');
    expect(htmlContent).toContain('<h1');
    expect(htmlContent).toContain('E2E Test Document');
    expect(htmlContent).toContain('<code>');

    // 4. ファイル監視テスト
    const watcher = new FileWatcher(testMd, {
      ignored: [],
      debounce: 100,
    });

    let changeDetected = false;
    watcher.onChange(() => {
      changeDetected = true;
    });

    watcher.start();

    // ファイル変更
    await fs.appendFile(testMd, '\n\n## New Section\n\nAdded content.');

    // 変更検知待機
    await new Promise((resolve) => setTimeout(resolve, 300));

    expect(changeDetected).toBe(true);

    await watcher.stop();
  });
});
```

2. **テスト実行**
```bash
npm run build
npm test tests/integration/e2e.test.ts
```

3. **コミット**
```bash
git add tests/integration/e2e.test.ts
git commit -m "Add E2E workflow tests

- Test complete user workflow
- Verify config → convert → watch cycle
- Test file change detection

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 6.3: 全テスト実行とカバレッジ確認

**目的**: 全テストを実行してカバレッジを確認
**依存**: Phase 0-5完了
**成果物**: テストレポート
**検証方法**: 80%以上のカバレッジ
**所要時間**: 30分

#### ステップ

1. **全テスト実行**
```bash
npm test
```

2. **カバレッジ確認**
```bash
npm run test:coverage
```

3. **カバレッジレポート確認**
```bash
# ターミナル出力でカバレッジ確認
# coverage/index.html をブラウザで開く
open coverage/index.html
```

4. **目標値確認**
- **Statement Coverage**: 80%以上
- **Branch Coverage**: 75%以上
- **Function Coverage**: 80%以上
- **Line Coverage**: 80%以上

5. **不足箇所の追加テスト作成** (必要に応じて)

6. **コミット**
```bash
git add .
git commit -m "Run full test suite with coverage

- All unit tests passing
- All integration tests passing
- Coverage target achieved (80%+)

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Phase 7: ドキュメントと公開準備

**目標**: README、ドキュメント、公開準備
**所要時間**: 2-3時間

---

### Task 7.1: README作成

**目的**: ユーザー向けREADMEを作成
**依存**: Phase 0-6完了
**成果物**: `README.md`
**検証方法**: 内容が適切で分かりやすい
**所要時間**: 60分

#### ステップ

1. **README作成**: `README.md`
```markdown
# vimd

> Real-time Markdown preview tool with pandoc (view markdown)

[![npm version](https://badge.fury.io/js/vimd.svg)](https://www.npmjs.com/package/vimd)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**vimd** is a fast, simple Markdown preview tool that provides real-time HTML preview with multiple themes.

## Features

- **Real-time Preview**: Instant browser update on file save
- **Multiple Themes**: 5 built-in themes (GitHub, Minimal, Dark, Academic, Technical)
- **Pandoc Powered**: High-quality Markdown conversion
- **Global Configuration**: No project-local config files
- **Auto-Setup**: Interactive setup on first install
- **Cross-Platform**: Works on macOS, Linux, and Windows

## Installation

```bash
npm install -g vimd
```

After installation, an interactive setup will guide you through theme selection.

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

Start live preview server with hot reload.

```bash
vimd dev README.md
vimd dev docs/guide.md --port 3000
vimd dev spec.md --theme dark --no-open
```

**Options:**
- `-p, --port <port>`: Port number (default: 8080)
- `-t, --theme <theme>`: Theme name
- `--no-open`: Do not open browser automatically

### `vimd build <file>`

Build static HTML file.

```bash
vimd build README.md
vimd build docs/guide.md -o dist/guide.html
vimd build spec.md --theme academic
```

**Options:**
- `-o, --output <path>`: Output file path
- `-t, --theme <theme>`: Theme name

### `vimd theme`

Change theme interactively.

```bash
vimd theme
```

### `vimd config`

Edit configuration interactively.

```bash
vimd config
vimd config --list
```

## Themes

vimd includes 5 built-in themes:

1. **GitHub** (Recommended) - GitHub Markdown style
2. **Minimal** - Simple white background
3. **Dark** - VS Code inspired dark mode
4. **Academic** - Paper-style layout for academic writing
5. **Technical** - API documentation style

## Configuration

Global configuration is stored at `~/.vimd/config.js`.

```typescript
import { defineConfig } from 'vimd';

export default defineConfig({
  theme: 'github',
  port: 8080,
  open: true,
  pandoc: {
    standalone: true,
    toc: false,
    highlightStyle: 'github',
  },
});
```

## Requirements

- Node.js >= 14.0.0
- pandoc (auto-installed if not found)

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
```

## License

MIT © notokeishou

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](docs/CONTRIBUTING.md) for details.
```

2. **コミット**
```bash
git add README.md
git commit -m "Add comprehensive README

- Add installation and quick start guide
- Document all commands and options
- List features and themes
- Add configuration examples

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 7.2: CONTRIBUTING.md作成

**目的**: コントリビューションガイドを作成
**依存**: Task 7.1
**成果物**: `docs/CONTRIBUTING.md`
**検証方法**: 内容が明確
**所要時間**: 30分

#### ステップ

1. **CONTRIBUTING.md作成**: `docs/CONTRIBUTING.md`
```markdown
# Contributing to vimd

Thank you for considering contributing to vimd!

## Development Setup

1. Fork the repository
2. Clone your fork
3. Install dependencies: `npm install`
4. Create a branch: `git checkout -b feature/your-feature`

## Development Workflow

### Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

### Code Quality

```bash
# Lint
npm run lint
npm run lint:fix

# Format
npm run format

# Type check
npm run typecheck
```

### Building

```bash
npm run build
```

## Testing Your Changes

```bash
# Run vimd locally
npm run dev dev test.md
npm run dev build test.md
```

## Commit Messages

Follow conventional commits format:

```
<type>: <description>

<body>

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## Pull Request Process

1. Update tests for your changes
2. Ensure all tests pass
3. Update documentation if needed
4. Create pull request with clear description

## Code Style

- Use TypeScript
- Follow existing code style
- Write tests for new features
- Keep functions small and focused

## Questions?

Open an issue for any questions!
```

2. **コミット**
```bash
git add docs/CONTRIBUTING.md
git commit -m "Add contributing guide

- Add development setup instructions
- Document testing and code quality workflow
- Add PR process guidelines

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 7.3: CHANGELOG.md作成

**目的**: 変更履歴ファイルを作成
**依存**: Phase 0-6完了
**成果物**: `CHANGELOG.md`
**検証方法**: バージョン履歴が記録されている
**所要時間**: 20分

#### ステップ

1. **CHANGELOG.md作成**: `CHANGELOG.md`
```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2025-12-05

### Added
- Initial release
- `vimd dev` command for live preview
- `vimd build` command for static HTML generation
- `vimd theme` command for theme selection
- `vimd config` command for configuration management
- 5 built-in themes (GitHub, Minimal, Dark, Academic, Technical)
- Global configuration system (~/.vimd/config.js)
- Auto-setup on first install
- Pandoc auto-installation
- Real-time file watching with hot reload
- Cross-platform support (macOS, Linux, Windows)

[Unreleased]: https://github.com/notokeishou/vimd/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/notokeishou/vimd/releases/tag/v0.1.0
```

2. **コミット**
```bash
git add CHANGELOG.md
git commit -m "Add CHANGELOG

- Document initial release (v0.1.0)
- Follow Keep a Changelog format

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 7.4: LICENSE作成

**目的**: MITライセンスファイルを作成
**依存**: なし
**成果物**: `LICENSE`
**検証方法**: 有効なMITライセンス
**所要時間**: 5分

#### ステップ

1. **LICENSE作成**: `LICENSE`
```text
MIT License

Copyright (c) 2025 notokeishou

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

2. **コミット**
```bash
git add LICENSE
git commit -m "Add MIT License

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 7.5: 最終チェックとビルド

**目的**: 公開前の最終チェック
**依存**: Phase 0-7完了
**成果物**: 公開可能な状態
**検証方法**: 全チェックリスト通過
**所要時間**: 30分

#### チェックリスト

```bash
# 1. 全テスト通過
npm test
# → すべてPASS

# 2. カバレッジ80%以上
npm run test:coverage
# → 80%以上

# 3. Lint通過
npm run lint
# → エラーなし

# 4. 型チェック通過
npm run typecheck
# → エラーなし

# 5. ビルド成功
npm run build
# → dist/ に成果物生成

# 6. package.json確認
cat package.json | grep version
# → "version": "0.1.0"

cat package.json | grep bin
# → "vimd": "./dist/cli/index.js"

# 7. ファイル構成確認
ls -la dist/
# → cli/, core/, config/, themes/, utils/, index.js, index.d.ts

# 8. 動作確認
cat > test-final.md << 'EOF'
# Final Test

This is the **final test** before publishing.
EOF

npm run dev build test-final.md
ls -la test-final.html
# → HTMLファイル生成成功

rm test-final.md test-final.html

# 9. package files確認
npm pack --dry-run
# → 含まれるファイル一覧を確認
# dist/, templates/, README.md, LICENSE のみ含まれること

# 10. Git状態確認
git status
# → working tree clean
```

#### 全チェック通過後

```bash
git add .
git commit -m "Final release preparation for v0.1.0

- All tests passing
- Coverage > 80%
- All documentation complete
- Ready for npm publish

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"

git tag v0.1.0
git push origin main --tags
```

---

## タスク実行時の注意事項

### ✅ 各タスク後に必ず実行

```bash
# 1. テスト実行
npm test

# 2. 型チェック
npm run typecheck

# 3. Lint
npm run lint

# 4. すべて成功したらコミット
git add .
git commit -m "メッセージ"
```

### ❌ 問題が発生した場合

1. **テスト失敗**: 実装を修正してテストを通す
2. **型エラー**: 型定義を確認・修正
3. **Lintエラー**: `npm run lint:fix` で自動修正
4. **ビルドエラー**: エラーメッセージを読んで原因を特定

### 📝 進捗管理

各タスクの状態を記録:

- ⏳ 未着手
- 🔄 実施中
- ✅ 完了
- ❌ 問題発生

---

## 次のフェーズについて

このファイルは Phase 3 まで詳細化されています。Phase 4以降（Markdown変換、ライブサーバー、CLIコマンド等）は、Phase 3完了後に追記します。

**Phase 4-7 のタスク概要**:
- Phase 4: Markdown変換、ライブサーバー、pandoc自動インストール (4-5時間)
- Phase 5: CLIコマンド実装 (dev, build, theme, config) (5-6時間)
- Phase 6: 統合テストと最終調整 (2-3時間)
- Phase 7: ドキュメントと公開準備 (2-3時間)

**合計所要時間**: 約25-35時間
