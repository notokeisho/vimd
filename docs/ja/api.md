# APIリファレンス

vimd は CLI に加えて、Node.js ライブラリとしても使用できます。

## インストール

```bash
npm install vimd
```

## 基本的な使い方

```javascript
import { MarkdownConverter, ConfigLoader, ThemeManager } from 'vimd';

// グローバル設定を読み込み
const config = await ConfigLoader.loadGlobal();

// コンバーターを作成
const converter = new MarkdownConverter({
  theme: 'github',
  pandocOptions: config.pandoc,
});

// Markdown を HTML に変換
const html = await converter.convertWithTemplate('document.md');

// 利用可能なテーマを一覧表示
const themes = ThemeManager.list();
console.log(themes);
// [{ name: 'github', displayName: 'GitHub' }, ...]
```

## クラス

### MarkdownConverter

pandoc を使用して Markdown ファイルを HTML に変換します。

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

設定の読み込みと管理を行います。

```typescript
class ConfigLoader {
  static loadGlobal(): Promise<VimdConfig>;
  static getConfigPath(): string;
  static save(config: VimdConfig): Promise<void>;
}
```

### ThemeManager

CSS テーマを管理します。

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

## 設定オプション

### VimdConfig

```typescript
interface VimdConfig {
  // デフォルトテーマ名
  theme: string;

  // 開発サーバーのポート
  port: number;

  // 開発サーバーのホスト
  host: string;

  // ブラウザを自動で開く
  open: boolean;

  // pandoc オプション
  pandoc: {
    standalone: boolean;
    toc: boolean;
    highlightStyle: string;
  };

  // ファイルウォッチャーオプション
  watch: {
    ignored: string[];
  };
}
```

### デフォルト値

```javascript
{
  theme: 'github',
  port: 38080,  // v0.2.1 で 8080 から変更
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

## 環境変数

| 変数 | 説明 | 例 |
|------|------|-----|
| `VIMD_PORT` | デフォルトポートを上書き | `VIMD_PORT=3000` |
| `VIMD_THEME` | デフォルトテーマを上書き | `VIMD_THEME=dark` |
| `VIMD_HOST` | デフォルトホストを上書き | `VIMD_HOST=0.0.0.0` |

## エラーハンドリング

```javascript
import { MarkdownConverter, PandocNotFoundError } from 'vimd';

try {
  const converter = new MarkdownConverter();
  await converter.convert('document.md');
} catch (error) {
  if (error instanceof PandocNotFoundError) {
    console.error('pandoc がインストールされていません');
  } else {
    throw error;
  }
}
```

## TypeScript サポート

vimd には TypeScript の型定義が含まれています。型を直接インポートできます。

```typescript
import type { VimdConfig, ThemeInfo, ConverterOptions } from 'vimd';
```
