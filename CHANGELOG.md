# 変更履歴

🌐 [English](CHANGELOG-en.md) | 日本語

このプロジェクトの注目すべき変更はすべてこのファイルに記載されます。

フォーマットは [Keep a Changelog](https://keepachangelog.com/ja/1.0.0/) に基づいており、
このプロジェクトは [Semantic Versioning](https://semver.org/lang/ja/) に準拠しています。

## [0.1.0] - 2025-12-06

### 追加

- **CLIコマンド**
  - `vimd dev <file>`: ホットリロード対応のライブプレビューサーバー
  - `vimd build <file>`: 静的HTML生成
  - `vimd theme`: 対話的なテーマ変更
  - `vimd config`: 対話的な設定編集
  - `vimd config --list`: 現在の設定を表示

- **テーマシステム**
  - GitHub: GitHub Markdownスタイル (推奨)
  - Minimal: シンプルな白背景
  - Dark: VS Codeインスパイアのダークモード
  - Academic: 論文スタイルのレイアウト
  - Technical: APIドキュメントスタイル

- **コア機能**
  - pandocによるMarkdown→HTML変換
  - live-serverによるリアルタイムプレビュー
  - chokidarによるファイル監視 (500msデバウンス)
  - グローバル設定システム (`~/.vimd/config.js`)

- **開発者向け**
  - TypeScript + ESM対応
  - 100テスト (99% passing)
  - カバレッジ 73.52%
  - ライブラリとしてのAPI公開

### 技術仕様

- Node.js >= 18.0.0 必須
- pandoc >= 2.0 必須 (別途インストール)
- ESM (ES Modules) 形式

---

## リリースリンク

- [0.1.0](https://github.com/notokeishou/vimd/releases/tag/v0.1.0) - 初回リリース
