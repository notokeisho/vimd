# 開発ガイド

このガイドでは、vimd の開発環境のセットアップ方法について説明します。

## 前提条件

- **Node.js** >= 18.0.0 (ESM サポートが必要)
- **pandoc** >= 2.0
- **Git**

## セットアップ

```bash
# リポジトリをクローン
git clone https://github.com/notokeisho/vimd.git
cd vimd

# 依存関係をインストール
npm install

# プロジェクトをビルド
npm run build
```

## 開発コマンド

| コマンド | 説明 |
|---------|------|
| `npm run build` | TypeScript を JavaScript にビルド |
| `npm run dev` | 開発モードで実行 |
| `npm test` | テストを実行 |
| `npm run test:coverage` | カバレッジレポート付きでテスト実行 |
| `npm run typecheck` | tsc で型チェック |
| `npm run lint` | ESLint でリント |
| `npm run format` | Prettier でフォーマット |

## 開発ワークフロー

### 開発モードでの実行

```bash
# テストファイルで vimd を実行
npm run dev -- dev test.md

# 特定のオプションで実行
npm run dev -- dev test.md --port 3000 --theme dark
```

### ビルド

```bash
# 一度だけビルド
npm run build

# ウォッチモード (利用可能な場合)
npm run build -- --watch
```

### テスト

```bash
# すべてのテストを実行
npm test

# 特定のテストファイルを実行
npm test -- tests/unit/converter.test.ts

# カバレッジ付きで実行
npm run test:coverage
```

## コードスタイル

- **TypeScript** strict モード
- **ESM** (ES Modules) 形式
- **Prettier** でフォーマット
- **ESLint** でリント

### インポート順序

1. Node.js 組み込みモジュール
2. 外部依存
3. 内部モジュール (絶対パス)
4. 相対インポート

```typescript
// 例
import path from 'path';
import fs from 'fs-extra';
import { Command } from 'commander';
import { ConfigLoader } from '../config/loader.js';
import { logger } from './logger.js';
```

## 変更を加える

1. フィーチャーブランチを作成
2. 変更を加える
3. テストとリントを実行
4. プルリクエストを送信

```bash
git checkout -b feature/my-feature
# 変更を加える
npm test
npm run lint
git commit -m "feat: add my feature"
git push origin feature/my-feature
```

## デバッグ

### VS Code

`.vscode/launch.json` に以下の設定を追加します。

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug vimd",
      "program": "${workspaceFolder}/dist/cli/index.js",
      "args": ["dev", "test.md"],
      "outFiles": ["${workspaceFolder}/dist/**/*.js"]
    }
  ]
}
```

### コンソールログ

組み込みのロガーを使用します。

```typescript
import { logger } from '../utils/logger.js';

logger.info('情報メッセージ');
logger.warn('警告メッセージ');
logger.error('エラーメッセージ');
logger.debug('デバッグメッセージ');
```
