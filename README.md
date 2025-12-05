# vimd

🌐 [English](README-en.md) | 日本語

> pandocを使ったリアルタイムMarkdownプレビューツール (view markdown)

[![npm version](https://badge.fury.io/js/vimd.svg)](https://www.npmjs.com/package/vimd)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**vimd** は、pandocを使用した高速でシンプルなMarkdownプレビューツールです。複数のテーマに対応したリアルタイムHTMLプレビューを提供します。

## 特徴

- **リアルタイムプレビュー**: ファイル保存時にブラウザが即座に更新 (live-server)
- **複数テーマ**: 5つの組み込みテーマ (GitHub, Minimal, Dark, Academic, Technical)
- **pandoc連携**: pandocによる高品質なMarkdown変換
- **グローバル設定**: プロジェクトディレクトリを汚さない `~/.vimd/config.js`
- **対話的セットアップ**: 初回起動時にテーマ選択をガイド
- **クロスプラットフォーム**: macOS, Linux, Windows で動作

## インストール

```bash
npm install -g vimd
```

インストール後、対話的なセットアップで初期設定を行います。

### 必要要件

- **Node.js** >= 18.0.0 (ESMサポートが必要)
- **pandoc** >= 2.0 (別途インストールが必要)

pandocのインストール方法:

```bash
# macOS
brew install pandoc

# Ubuntu/Debian
sudo apt install pandoc

# Windows
choco install pandoc
```

## クイックスタート

```bash
# ライブプレビューを開始
vimd dev README.md

# 静的HTMLを生成
vimd build README.md

# テーマを変更
vimd theme

# 設定を編集
vimd config
```

## コマンド

### `vimd dev <file>`

ホットリロード対応のライブプレビューサーバーを起動します。ブラウザを自動で開き、ファイルの変更を監視します。

```bash
vimd dev README.md
vimd dev docs/guide.md --port 3000
vimd dev spec.md --theme dark --no-open
```

**オプション:**

- `-p, --port <port>`: ポート番号 (デフォルト: 8080)
- `-t, --theme <theme>`: テーマ名 (グローバル設定を上書き)
- `--no-open`: ブラウザを自動で開かない

### `vimd build <file>`

静的HTMLファイルを生成します。スタイルが埋め込まれたスタンドアロンHTMLを出力します。

```bash
vimd build README.md
vimd build docs/guide.md -o dist/guide.html
vimd build spec.md --theme academic
```

**オプション:**

- `-o, --output <path>`: 出力ファイルパス (デフォルト: 同名で拡張子.html)
- `-t, --theme <theme>`: テーマ名 (グローバル設定を上書き)

### `vimd theme`

対話的にテーマを変更します。5つの組み込みテーマから選択できます。

```bash
vimd theme
```

### `vimd config`

対話的に設定を編集します。テーマ、ポート、その他の設定を変更できます。

```bash
# 対話的な設定エディタ
vimd config

# 現在の設定を表示
vimd config --list
```

## テーマ

vimdには5つの組み込みテーマがあります:

| テーマ        | 説明                              | 用途                 |
| ------------- | --------------------------------- | -------------------- |
| **GitHub**    | GitHub Markdownスタイル (推奨)    | 一般的なドキュメント |
| **Minimal**   | シンプルな白背景                  | 集中して書きたいとき |
| **Dark**      | VS Codeインスパイアのダークモード | 夜間の作業           |
| **Academic**  | 論文スタイルのレイアウト          | 学術論文、研究文書   |
| **Technical** | APIドキュメントスタイル           | 技術仕様書、API文書  |

## 設定

グローバル設定は `~/.vimd/config.js` に保存されます。

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

### 設定オプション

- `theme`: デフォルトテーマ名 (文字列)
- `port`: 開発サーバーのポート (数値、デフォルト: 8080)
- `host`: 開発サーバーのホスト (文字列、デフォルト: 'localhost')
- `open`: ブラウザを自動で開く (真偽値、デフォルト: true)
- `pandoc.standalone`: スタンドアロンHTMLを生成 (真偽値)
- `pandoc.toc`: 目次を生成 (真偽値)
- `pandoc.highlightStyle`: コードハイライトスタイル (文字列)
- `watch.ignored`: ファイル監視で無視するパターン (配列)

## API使用

vimdはNode.jsライブラリとしても使用できます:

```javascript
import { MarkdownConverter, ConfigLoader, ThemeManager } from 'vimd';

// 設定を読み込む
const config = await ConfigLoader.loadGlobal();

// コンバーターを作成
const converter = new MarkdownConverter({
  theme: 'github',
  pandocOptions: config.pandoc,
});

// MarkdownをHTMLに変換
const html = await converter.convertWithTemplate('README.md');

// 利用可能なテーマを一覧表示
const themes = ThemeManager.list();
console.log(themes); // [{ name: 'github', displayName: 'GitHub' }, ...]
```

## 開発

```bash
# リポジトリをクローン
git clone https://github.com/notokeishou/vimd.git
cd vimd

# 依存関係をインストール
npm install

# ビルド
npm run build

# テストを実行
npm test

# カバレッジ付きでテスト
npm run test:coverage

# 開発モード
npm run dev -- dev test.md
```

### プロジェクト構造

```
vimd/
├── src/
│   ├── cli/          # CLIコマンド
│   ├── config/       # 設定管理
│   ├── core/         # コア機能 (converter, watcher, server)
│   ├── themes/       # テーマシステム
│   └── utils/        # ユーティリティ関数
├── tests/
│   ├── unit/         # ユニットテスト
│   └── integration/  # 統合テスト
├── templates/        # HTMLテンプレート
└── dist/            # ビルド済みファイル
```

## トラブルシューティング

### pandocが見つからない

「pandoc not found」エラーが出る場合:

1. パッケージマネージャーでpandocをインストール
2. インストールを確認: `pandoc --version`
3. ターミナルを再起動

### ポートが使用中

ポート8080が既に使用中の場合:

```bash
vimd dev README.md --port 3000
```

または `~/.vimd/config.js` でデフォルトポートを変更してください。

### テーマが適用されない

以下を確認してください:

1. 利用可能なテーマを確認: `vimd theme`
2. 設定を確認: `vimd config --list`
3. ソースからの場合は再ビルド: `npm run build`

## ライセンス

MIT © notokeishou

## コントリビューション

コントリビューションを歓迎します! プルリクエストの提出方法については [CONTRIBUTING.md](CONTRIBUTING.md) をお読みください。

## 変更履歴

リリース履歴は [CHANGELOG.md](CHANGELOG.md) を参照してください。

## リンク

- [GitHubリポジトリ](https://github.com/notokeishou/vimd)
- [npmパッケージ](https://www.npmjs.com/package/vimd)
- [Issue Tracker](https://github.com/notokeishou/vimd/issues)

---
