# 変更履歴

🌐 [English](CHANGELOG-en.md) | 日本語

このプロジェクトの注目すべき変更はすべてこのファイルに記載されます。

フォーマットは [Keep a Changelog](https://keepachangelog.com/ja/1.0.0/) に基づいており、
このプロジェクトは [Semantic Versioning](https://semver.org/lang/ja/) に準拠しています。

## [0.1.10] - 2025-12-06

### 追加

- **academic.css テーマの完全刷新**
  - LaTeX.css ベースの学術論文スタイル
  - LaTeX風の段落インデント + 両端揃え
  - 自動ハイフネーション対応
  - "Contents" ヘッダー付き目次スタイル
  - Pandoc脚注の学術スタイル
  - minted風シンタックスハイライト
  - LaTeX booktabs風の三線テーブル
  - 印刷対応（URL表示、改ページ制御）

### 修正

- **テストがソースファイルを上書きする問題を修正**
  - theme-manager.test.ts が github.css を上書きしていた問題を修正

## [0.1.9] - 2025-12-06

### 追加

- **github.css テーマの完全実装**
  - デフォルトテーマを GitHub Light カラーで完全実装
  - sindresorhus/github-markdown-css ベースのスタイル
  - 全要素のスタイリング (見出し、リンク、コード、テーブル、blockquote など)
  - 目次 (TOC) スタイル対応
  - Pandoc シンタックスハイライト対応
  - レスポンシブデザイン対応

## [0.1.8] - 2025-12-06

### 修正

- **ダークテーマの改善**
  - リンクが黒色で見えない問題を修正
  - 目次 (Table of Contents) が表示されない問題を修正
  - コードハイライトの色が暗すぎて見えない問題を修正
  - GitHub Dark テーマ (sindresorhus/github-markdown-css) ベースに刷新
  - Pandoc構文ハイライトクラスのサポートを追加

## [0.1.7] - 2025-12-06

### 追加

- **セッション管理機能**
  - ポート競合時の自動解決 (前回のvimdセッションを自動終了)
  - 別アプリがポートを使用中の場合、利用可能なポートを自動検出
  - マルチセッション対応 (異なるポートで複数のvimdを同時実行可能)
  - セッション情報を `$TMPDIR/vimd/sessions.json` で管理
  - 停止したプロセスの古いセッションを自動クリーンアップ

## [0.1.6] - 2025-12-06

### 修正

- **画像表示の修正**
  - 相対パスで参照された画像がプレビューで正しく表示されるように修正
  - プレビューHTMLをソースディレクトリに `vimd-preview-{basename}.html` として生成
  - 終了時にプレビューHTMLを自動削除

### 改善

- **プレビュー更新速度の改善**
  - debounce時間を500msから100msに短縮
  - live-serverのwait時間を100msから50msに短縮
  - 合計遅延: 600ms → 150ms (75%改善)

## [0.1.5] - 2025-12-06

### 変更

- **一時ファイル管理の改善**
  - プレビュー用HTMLファイルをシステム一時ディレクトリ (`$TMPDIR/vimd/`) に保存するように変更
  - ユーザーのプロジェクトディレクトリを汚さないようになった
  - セッションベースの管理 (24時間経過した古いセッションは自動クリーンアップ)

## [0.1.4] - 2025-12-06

### 修正

- **ライブリロードの修正**
  - live-serverがドットで始まるディレクトリを無視する問題を修正
  - ファイル変更検知後のブラウザ自動リロードが正常に動作するようになった

## [0.1.3] - 2025-12-06

### 修正

- **live-serverインポートの修正**
  - ESM/CommonJSの互換性問題を修正
  - `liveServer.start is not a function` エラーを解消

## [0.1.2] - 2025-12-06

### 修正

- **バージョン表示の修正**
  - `vimd --version` が正しいバージョンを表示するように修正
  - package.jsonから動的に読み込むように変更

## [0.1.1] - 2025-12-06

### 修正

- **npm公開の修正**
  - 不要なpostinstallスクリプトを削除

### 変更

- **ドキュメントの改善**
  - READMEの例で使用するファイル名を `README.md` から `draft.md` に変更

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

- [0.1.5](https://github.com/notokeishou/vimd/releases/tag/v0.1.5) - 一時ファイル管理改善
- [0.1.4](https://github.com/notokeishou/vimd/releases/tag/v0.1.4) - ライブリロード修正
- [0.1.3](https://github.com/notokeishou/vimd/releases/tag/v0.1.3) - live-serverインポート修正
- [0.1.2](https://github.com/notokeishou/vimd/releases/tag/v0.1.2) - バージョン表示修正
- [0.1.1](https://github.com/notokeishou/vimd/releases/tag/v0.1.1) - npm公開修正
- [0.1.0](https://github.com/notokeishou/vimd/releases/tag/v0.1.0) - 初回リリース
