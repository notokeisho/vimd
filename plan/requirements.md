# vimd - 要件定義書

**プロジェクト名**: vimd
**バージョン**: 1.0.0 (予定)
**作成日**: 2025-12-05
**最終更新**: 2025-12-06 (v1.3 - 技術的問題修正版)
**ステータス**: 要件定義フェーズ
**ライセンス**: MIT (OSS)

---

## 📋 目次

1. [プロジェクト概要](#プロジェクト概要)
2. [ターゲットユーザー](#ターゲットユーザー)
3. [プラットフォーム戦略](#プラットフォーム戦略)
4. [技術スタック](#技術スタック)
5. [機能要件](#機能要件)
6. [テーマシステム](#テーマシステム)
7. [ユーザーストーリー](#ユーザーストーリー)
8. [非機能要件](#非機能要件)
9. [依存関係](#依存関係)
10. [設定システム](#設定システム)
11. [開発フェーズ](#開発フェーズ)

---

## プロジェクト概要

### 目的

Markdown編集時のリアルタイムHTMLプレビュー環境を1コマンドで提供する。

### 背景

現在の問題点:
- Markdownエディタごとにプレビュー機能が異なる
- 環境構築が複雑（pandoc, fswatch, live-server等の個別インストール）
- プロジェクトごとに設定が必要
- クロスプラットフォーム対応が困難

### 解決策

`vimd`は以下を実現する:
- ✅ 1コマンドインストール (`npm install -g vimd`)
- ✅ 初回実行時の対話式セットアップ（postinstallではなく、初回コマンド実行時）
- ✅ グローバル設定でリポジトリを汚さない
- ✅ 1コマンド起動 (`vimd dev spec.md`)
- ✅ クロスプラットフォーム対応 (Mac/Linux/Windows)
- ✅ テーマによる見た目カスタマイズ
- ✅ ESMモジュール採用で将来性確保

### プロジェクト成果物

- npm package (`vimd`)
- GitHub リポジトリ (OSS公開)
- ドキュメント (README, ガイド)
- 将来的にHomebrew Formula (Phase 2)

---

## ターゲットユーザー

### プライマリユーザー

**開発者**:
- 技術ドキュメント作成者
- README作成者
- API仕様書執筆者
- 設計書作成者

**ドキュメント執筆者**:
- テクニカルライター
- ブログ執筆者
- 教材作成者
- 仕様書作成者

### ユーザーペルソナ

**ペルソナ1: 開発者タロウ**
- 年齢: 28歳
- 職業: Webエンジニア
- 課題: API仕様書をMarkdownで書きたいが、プレビュー環境が面倒
- 期待: `vimd dev api-spec.md` だけで環境構築完了

**ペルソナ2: ライターハナコ**
- 年齢: 32歳
- 職業: テクニカルライター
- 課題: Markdownで執筆しながら見た目を確認したい
- 期待: 編集しながらリアルタイムでプレビュー確認

---

## プラットフォーム戦略

### Phase 1: npm package (優先) ✅

**対応OS**:
- macOS (Intel/Apple Silicon)
- Linux (Ubuntu, CentOS等)
- Windows (10/11)

**配布方法**:
- npm registry (npmjs.com)
- `npm install -g vimd`

**メリット**:
- ✅ クロスプラットフォーム
- ✅ Node.jsエコシステム統合
- ✅ バージョン管理が容易
- ✅ 依存関係自動管理

---

### Phase 2: Homebrew Formula (後追い) 🔜

**対応OS**:
- macOS専用

**配布方法**:
- Homebrew Tap または Core
- `brew install vimd`

**実装方法**:
```ruby
class Mdlive < Formula
  desc "Real-time Markdown preview tool"
  homepage "https://github.com/username/vimd"

  depends_on "node"

  def install
    system "npm", "install", "-g", "vimd"
  end
end
```

**メリット**:
- ✅ macOS開発者に馴染み深い
- ✅ システム統合が簡単
- ✅ npm wrapper として機能

**注意**:
- brewはnpmパッケージに依存
- npm package完成後に実装

---

## 技術スタック

### 確定事項 ✅

| 技術領域 | 採用技術 | 理由 |
|---------|---------|------|
| 言語 | **TypeScript** | 型安全性、開発体験、メンテナンス性 |
| モジュール形式 | **ESM (ES Modules)** | 将来性、modern JavaScript、依存パッケージとの互換性 |
| 設定ファイル形式 | **JavaScript (.vimd.config.js)** | シンプル、実行時複雑性回避、JSDocで型補完可能 |
| Markdownパーサー | **pandoc** | 高機能、拡張性、手動インストール前提 |
| シンタックスハイライト | **pandoc内蔵** | pandocのシンタックスハイライト機能 |
| ファイル監視 | **chokidar** | クロスプラットフォーム、fswatch不要 |
| ライブサーバー | **live-server** | プログラマティックAPI提供、シンプル |
| CLI構築 | **commander** | Node.js標準的なCLIフレームワーク |
| 対話式プロンプト | **inquirer** | ユーザーフレンドリーなプロンプト |
| ターミナル装飾 | **chalk** | 色付け、視覚的フィードバック |
| イベントシステム | **EventEmitter (Node.js標準)** | プラグイン拡張性、フック機構 |

---

### 技術的決定の根拠

#### なぜ pandoc を選ぶのか？

**pandoc採用の理由**:

| 項目 | 評価 | 詳細 |
|------|------|------|
| 機能 | ⭐⭐⭐⭐⭐ | Markdown → HTMLの変換品質が最高 |
| 拡張性 | ⭐⭐⭐⭐⭐ | フィルター、テンプレート、多様なオプション |
| シンタックスハイライト | ⭐⭐⭐⭐⭐ | 内蔵で高品質 |
| インストール障壁 | ✅ **検出＋案内** | 存在チェックして手動インストール案内 |
| クロスプラットフォーム | ✅ 完全対応 | Mac/Linux/Windows全対応 |
| 速度 | ⭐⭐⭐⭐⭐ | 非常に高速 |

**pandoc検出戦略**:

vimdはpandocの存在をチェックし、未インストールの場合は明確な案内を表示する:

**セキュリティ上の理由で自動インストールは行わない**:
- ❌ sudo実行は危険（セキュリティリスク）
- ❌ CI/CD環境で失敗する
- ❌ 企業環境でブロックされる
- ✅ 検出のみ実施、手動インストールを案内

**実装方法**:
```typescript
// 初回起動時にpandoc存在チェック
async function checkPandoc() {
  if (!isPandocInstalled()) {
    const os = detectOS();
    console.error('⚠️  pandoc not found');
    console.error('');
    console.error('vimd requires pandoc to convert Markdown to HTML.');
    console.error('Please install pandoc manually:');
    console.error('');

    if (os === 'macos') {
      console.error('  macOS:   brew install pandoc');
    } else if (os === 'linux-debian') {
      console.error('  Ubuntu:  sudo apt-get install pandoc');
    } else if (os === 'linux-redhat') {
      console.error('  CentOS:  sudo yum install pandoc');
    } else if (os === 'windows') {
      console.error('  Windows: choco install pandoc');
      console.error('  Or download from: https://pandoc.org/installing.html');
    }

    console.error('');
    console.error('After installation, run vimd again.');
    process.exit(1);
  }
}
```

**ユーザー体験**:
```bash
# pandoc未インストール時
$ vimd dev README.md

⚠️  pandoc not found

vimd requires pandoc to convert Markdown to HTML.
Please install pandoc manually:

  macOS:   brew install pandoc

After installation, run vimd again.

# インストール後
$ brew install pandoc
$ vimd dev README.md

🚀 vimd起動中...
📄 対象ファイル: README.md
🎨 テーマ: github
🌐 プレビューURL: http://localhost:8080
✅ 準備完了!
```

**メリット**:
- ✅ セキュリティリスクなし
- ✅ CI/CD環境で動作
- ✅ 企業環境でも安全
- ✅ ユーザーが自分でインストール方法を選べる

**結論**: pandocは最高品質のMarkdown変換を提供し、手動インストールでもユーザー体験は十分良好なのだ! ✅

---

#### なぜ chokidar を選ぶのか？

**fswatch vs chokidar 比較**:

| 項目 | fswatch | chokidar |
|------|---------|----------|
| インストール | brew (Mac専用) | npm (全OS) |
| クロスプラットフォーム | ❌ Mac専用 | ✅ 完全対応 |
| Node.js統合 | シェル経由 | ネイティブ |
| 採用実績 | CLI向け | VSCode, Webpack等 |
| パフォーマンス | 高速 | 高速 |

**結論**: chokidarはNode.jsエコシステムの標準なのだ! ✅

---

## 機能要件

### MVP機能 (Phase 1必須)

#### コア機能

**1. Markdownファイルの監視**
- ファイル変更を検知
- 自動的にHTML変換をトリガー
- デバウンス処理 (連続保存対策)

**2. 自動HTML変換**
- pandocによるMarkdown→HTML変換
- pandoc内蔵シンタックスハイライト
- テーマCSSの適用
- 画像などの相対パス解決

**3. ブラウザ自動リロード**
- live-serverによる配信
- ファイル変更時の自動リロード
- WebSocketによるリアルタイム通信

**4. 1コマンド起動・停止**
- `vimd dev <file>` で起動
- Ctrl+C で停止
- プロセス管理とクリーンアップ

---

### CLI基本コマンド

#### 初回実行時のセットアップ

**目的**: グローバル設定の初期化

**動作タイミング**: `npm install -g vimd`後の**初回コマンド実行時**（postinstallではない）

**理由**:
- ✅ CI/CD環境で動作する（インタラクティブプロンプトなし）
- ✅ `npm install`が常に非対話的で完了
- ✅ 設定ファイルが存在する場合はスキップ

**動作**:
1. `~/.vimd/config.js` の存在をチェック
2. 存在しない場合のみ対話式セットアップを起動
3. テーマを選択
4. `~/.vimd/config.js` を自動生成
5. デフォルト値を自動設定 (port: 8080, open: true)

**例**:
```bash
# インストール（postinstallは何もしない）
$ npm install -g vimd

# 初回実行時に自動的にセットアップ
$ vimd dev README.md

Welcome to vimd! First-time setup...

Select a theme:
  > GitHub (Recommended)
    Minimal
    Dark
    Academic
    Technical

Creating configuration directory: ~/.vimd/
Configuration saved: ~/.vimd/config.js

Setup complete!

🚀 vimd起動中...
📄 対象ファイル: README.md
```

**2回目以降**:
```bash
# 設定ファイルが存在するのでセットアップスキップ
$ vimd dev spec.md

🚀 vimd起動中...
📄 対象ファイル: spec.md
🎨 テーマ: github
```

**生成される設定ファイル** (`~/.vimd/config.js`):
```javascript
// @ts-check

/**
 * @type {import('vimd').VimdConfig}
 */
export default {
  theme: 'github',      // User selected
  port: 8080,           // Default
  open: true,           // Default
  pandoc: {
    standalone: true,
    toc: false,
    highlightStyle: 'github'
  }
};
```

**JSDocによる型補完**:
エディタで`config.js`を開くと、TypeScript型定義に基づいた自動補完が効く。

---

#### `vimd dev <file>`

**目的**: プレビュー環境起動

**動作**:
1. 指定されたMarkdownファイルを読み込み
2. HTMLに変換
3. live-server起動
4. ファイル監視開始
5. ブラウザ自動で開く

**例**:
```bash
vimd dev README.md

# 出力
🚀 vimd起動中...
📄 対象ファイル: README.md
🎨 テーマ: github
🌐 プレビューURL: http://localhost:8080
✅ 準備完了! ファイルを編集すると自動的に更新されます
⏹️ 停止方法: Ctrl+C
```

**オプション**:
```bash
vimd dev spec.md --port 8081        # ポート指定
vimd dev spec.md --theme dark       # テーマ一時変更
vimd dev spec.md --no-open          # ブラウザ自動オープンなし
vimd dev spec.md --watch "*.md"     # 複数ファイル監視
```

---

#### `vimd build <file>`

**目的**: HTMLファイル生成のみ

**動作**:
1. Markdownを読み込み
2. HTMLに変換
3. ファイルに出力
4. サーバー起動なし

**例**:
```bash
vimd build README.md

# 出力
🔄 変換中: README.md → README.html
✅ 完了: README.html
```

**オプション**:
```bash
vimd build spec.md --output dist/spec.html  # 出力先指定
vimd build spec.md --theme academic         # テーマ指定
```

---

#### `vimd theme`

**目的**: テーマ変更 (対話式)

**動作**:
1. 現在利用可能なテーマを一覧表示
2. 対話式で選択
3. `~/.vimd/config.js` を更新

**例**:
```bash
vimd theme

Select a theme:
  GitHub (current)
  > Minimal
  Dark
  Academic
  Technical

Theme updated to 'Minimal'
All projects will use this theme.
```

---

#### `vimd config`

**目的**: 詳細設定変更 (対話式)

**動作**:
1. 設定項目を対話式で選択
2. 各項目を変更
3. `~/.vimd/config.js` を更新

**例**:
```bash
vimd config

What would you like to change?
  > Theme
    Port number
    Auto-open browser

# Themeを選択した場合
Select a theme:
  > GitHub
    Minimal
    Dark

# Port numberを選択した場合
Enter port number: (8080) 8081

# Auto-open browserを選択した場合
Auto-open browser in preview? (Y/n) n

Configuration updated.

# 設定確認
vimd config --list

Current configuration:
  Theme: github
  Port: 8080
  Open Browser: true
  Config: ~/.vimd/config.js
```

---

## テーマシステム

### 初期提供テーマ (5種類)

#### 1. GitHub (デフォルト推奨)

**特徴**:
- GitHub Markdown風スタイル
- `github-markdown-css` 使用
- シンタックスハイライト (GitHub風)
- レスポンシブ対応

**フォント**:
- `-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial`

**色**:
- 背景: `#ffffff`
- テキスト: `#24292f`
- コードブロック背景: `#f6f8fa`
- リンク: `#0969da`

**使用ケース**:
- READMEプレビュー
- GitHubで公開するドキュメント
- オープンソースプロジェクト

---

#### 2. Minimal

**特徴**:
- シンプルな白背景
- 装飾最小限
- 印刷時にきれい
- 読みやすさ重視

**フォント**:
- `system-ui, -apple-system, sans-serif`

**色**:
- 背景: `#ffffff`
- テキスト: `#000000`
- コードブロック背景: `#f5f5f5`

**使用ケース**:
- 印刷用ドキュメント
- シンプルな記事
- 集中して読む文書

---

#### 3. Dark

**特徴**:
- ダークモード
- VS Code風
- 目に優しい
- コードブロック強調

**フォント**:
- `"Fira Code", Consolas, Monaco, monospace`

**色**:
- 背景: `#1e1e1e`
- テキスト: `#d4d4d4`
- コードブロック背景: `#252526`
- リンク: `#569cd6`

**使用ケース**:
- 夜間作業
- 長時間の編集
- コード中心のドキュメント

---

#### 4. Academic

**特徴**:
- 論文風レイアウト
- セリフフォント
- 広い余白
- 脚注・参考文献サポート

**フォント**:
- `Georgia, "Times New Roman", serif`

**色**:
- 背景: `#ffffff`
- テキスト: `#333333`
- コードブロック背景: `#f9f9f9`

**使用ケース**:
- 論文
- 研究ノート
- フォーマルなドキュメント

---

#### 5. Technical

**特徴**:
- API仕様書向け
- サイドバーナビゲーション (目次)
- コードブロック大きめ
- セクション区切り明確

**フォント**:
- `"SF Mono", "Roboto Mono", monospace`

**色**:
- 背景: `#fafafa`
- テキスト: `#2c3e50`
- コードブロック背景: `#f4f4f4`
- サイドバー背景: `#34495e`

**使用ケース**:
- API仕様書
- 技術リファレンス
- チュートリアル

---

### テーマ切り替え

**永続的な変更**:
```bash
vimd config --theme dark
```

**一時的な変更**:
```bash
vimd dev spec.md --theme academic
```

**設定ファイルで指定**:
```javascript
// .vimd.config.js
module.exports = {
  theme: 'github'
}
```

---

### カスタムテーマ

**カスタムCSS追加**:
```javascript
// .vimd.config.js
module.exports = {
  theme: 'github',
  css: './custom.css'  // ベーステーマに追加
}
```

**完全なカスタムテーマ**:
```javascript
// .vimd.config.js
module.exports = {
  theme: 'custom',
  template: './custom-template.html',
  css: './custom-theme.css'
}
```

---

## ユーザーストーリー

### Story 1: 初めてのインストール

**As a** 開発者
**I want to** vimdを簡単にインストールしたい
**So that** すぐにMarkdownプレビューを使い始められる

**ステップ**:
```bash
# 1. インストール (自動セットアップ付き)
npm install -g vimd

# インストール完了後、自動的にセットアップ開始
Welcome to vimd!

Select a theme:
  > GitHub (Recommended)
    Minimal
    Dark

Configuration saved: ~/.vimd/config.js
Setup complete!

# 2. プレビュー起動
cd my-project
vimd dev README.md
```

**期待結果**:
- ✅ インストール時に自動セットアップ
- ✅ テーマを1回選択するだけ
- ✅ すぐにプレビュー開始
- ✅ ブラウザが自動で開く

**所要時間**: 1分以内

---

### Story 2: 日常的な使用

**As a** ドキュメント執筆者
**I want to** Markdownを編集しながらリアルタイムプレビューしたい
**So that** 見た目を確認しながら効率的に執筆できる

**ステップ**:
```bash
# プレビュー起動
vimd dev spec.md

# VSCodeやエディタでspec.mdを編集
# 保存するたびに自動的にHTMLが更新される
# ブラウザが自動的にリロードされる

# 停止
Ctrl + C
```

**期待結果**:
- ✅ ファイル保存→変換→リロード (1秒以内)
- ✅ 編集フローが中断されない
- ✅ 複数回保存でも問題なし (デバウンス処理)

---

### Story 3: テーマの切り替え

**As a** ユーザー
**I want to** 用途に応じてテーマを変更したい
**So that** 最適な見た目でプレビューできる

**ステップ**:
```bash
# テーマを変更 (対話式)
vimd theme

Select a theme:
  GitHub (current)
  > Dark
  Minimal
  Academic
  Technical

Theme updated to 'Dark'
All projects will use this theme.

# 次回以降、全プロジェクトでDarkテーマが適用される
cd ~/any-project
vimd dev README.md  # → Darkテーマで表示
```

**期待結果**:
- ✅ 対話式でテーマ選択
- ✅ 名前を覚える必要なし
- ✅ 全プロジェクトに即座に反映
- ✅ 一度変更すればずっと同じテーマ

---

### Story 4: カスタムCSS適用

**As a** パワーユーザー
**I want to** 独自のCSSを適用したい
**So that** 企業のブランドガイドに準拠できる

**ステップ**:
```bash
# カスタムCSSファイルを作成
cat > ~/custom-style.css << EOF
:root {
  --primary-color: #ff6b6b;
  --font-family: "Corporate Font", sans-serif;
}
h1 { color: var(--primary-color); }
EOF

# グローバル設定を編集
vim ~/.vimd/config.js

# 以下を追加
export default defineConfig({
  theme: 'github',
  css: '~/custom-style.css'  // カスタムCSS追加
})

# プレビュー起動 (どのプロジェクトでもカスタムCSSが適用される)
vimd dev spec.md
```

**期待結果**:
- ✅ カスタムCSSが適用される
- ✅ ベーステーマとの併用可能
- ✅ 全プロジェクトで同じカスタムスタイル

---

### Story 5: 複数ファイルのプレビュー

**As a** 開発者
**I want to** 複数のMarkdownを同時にプレビューしたい
**So that** 関連ドキュメントを比較できる

**ステップ**:
```bash
# ターミナル1
vimd dev README.md --port 8080

# ターミナル2
vimd dev CHANGELOG.md --port 8081

# ブラウザで両方開く
# localhost:8080 - README
# localhost:8081 - CHANGELOG
```

**期待結果**:
- ✅ 異なるポートで複数起動可能
- ✅ 各ファイル独立して監視
- ✅ ポート衝突時は自動的に別ポート提案

---

### Story 6: HTML出力のみ

**As a** ユーザー
**I want to** サーバーなしでHTMLだけ生成したい
**So that** 静的ファイルとして配布できる

**ステップ**:
```bash
# HTML生成
vimd build README.md
> 🔄 変換中: README.md → README.html
> ✅ 完了: README.html

# 出力先指定
vimd build README.md --output dist/index.html
> ✅ 完了: dist/index.html

# 複数ファイル
vimd build *.md
> ✅ 完了: README.html, CHANGELOG.html, CONTRIBUTING.html
```

**期待結果**:
- ✅ HTMLファイルが生成される
- ✅ CSSがインライン化される (または外部ファイル)
- ✅ 画像などのアセットも正しくリンク

---

## 非機能要件

### パフォーマンス

**レスポンス時間**:
- ファイル保存→プレビュー反映: **1秒以内**
- 初回起動時間: **3秒以内**
- HTML変換時間: **0.5秒以内** (10KB Markdownファイル)

**リソース使用量**:
- メモリ使用量: **100MB以下**
- CPU使用率: **アイドル時5%以下**
- ディスク使用量: **50MB以下** (インストール後)

**スケーラビリティ**:
- 対応ファイルサイズ: **最大10MB** (Markdownファイル)
- 同時監視ファイル数: **最大10ファイル**
- 画像サイズ: **制限なし** (ブラウザ依存)

---

### ユーザビリティ

**学習コスト**:
- 基本操作の習得時間: **5分以内**
- 初回インストール〜起動: **2分以内**
- コマンド数: **最小限** (init, dev, build, config, theme)

**エラーメッセージ**:
- 分かりやすいエラー表示
- 解決方法の提案
- 関連ドキュメントへのリンク

**ヘルプシステム**:
- `vimd --help`: 全コマンド一覧
- `vimd dev --help`: 各コマンドの詳細ヘルプ
- 充実したREADME

---

### 保守性

**コード品質**:
- テストカバレッジ: **80%以上**
- TypeScriptの型カバレッジ: **95%以上**
- Lintエラー: **ゼロ**

**ドキュメント**:
- README: インストール、基本使用方法
- CONTRIBUTING.md: コントリビューションガイド
- API.md: 内部API仕様
- CHANGELOG.md: バージョン履歴

**バージョン管理**:
- Semantic Versioning (semver) 準拠
- CHANGELOG自動生成
- 破壊的変更は Major version up

---

### セキュリティ

**依存関係**:
- 定期的な依存パッケージ更新
- セキュリティ脆弱性スキャン (npm audit)
- 最小限の依存関係

**ファイルアクセス**:
- 指定されたファイルのみ読み込み
- 任意のコード実行なし
- サンドボックス化 (可能な範囲で)

**ネットワーク**:
- localhostのみリッスン
- 外部通信なし (CDN等の例外あり)

---

### 互換性

**Node.jsバージョン**:
- 最小要件: **Node.js >= 18.0.0** (ESM support required)
- 推奨: **Node.js >= 20.0.0** (LTS)
- テスト対象: 18.x, 20.x

**OS対応**:
- macOS: **10.15 (Catalina) 以降**
- Linux: **Ubuntu 20.04 以降、CentOS 8 以降**
- Windows: **Windows 10 以降**

**ブラウザ対応**:
- Chrome: 最新版
- Firefox: 最新版
- Safari: 最新版
- Edge: 最新版

---

## 依存関係

### 必須環境

**ランタイム**:
- Node.js >= 18.0.0 (ESM support required)
- npm >= 8.0.0 (または yarn, pnpm)

---

### npm依存関係

**プロダクション依存関係** (package.json dependencies):

```json
{
  "dependencies": {
    "chokidar": "^3.6.0",
    "live-server": "^1.2.2",
    "commander": "^12.0.0",
    "inquirer": "^9.2.0",
    "chalk": "^5.3.0",
    "cosmiconfig": "^9.0.0",
    "fs-extra": "^11.2.0",
    "github-markdown-css": "^5.5.0"
  }
}
```

**各パッケージの役割**:
- `chokidar`: ファイル監視
- `live-server`: ライブリロードサーバー
- `commander`: CLIフレームワーク
- `inquirer`: 対話式プロンプト
- `chalk`: ターミナル装飾
- `cosmiconfig`: 設定ファイル読み込み (TypeScript対応)
- `fs-extra`: ファイル操作ユーティリティ
- `github-markdown-css`: GitHubテーマCSS

**注意**: pandocは外部依存だが、初回起動時に自動インストール対応

---

**開発依存関係** (package.json devDependencies):

```json
{
  "devDependencies": {
    "typescript": "^5.3.0",
    "@types/node": "^20.11.0",
    "@types/marked": "^6.0.0",
    "@types/inquirer": "^9.0.0",
    "vitest": "^1.2.0",
    "@vitest/coverage-v8": "^1.2.0",
    "eslint": "^8.56.0",
    "@typescript-eslint/eslint-plugin": "^6.19.0",
    "@typescript-eslint/parser": "^6.19.0",
    "prettier": "^3.2.0",
    "tsx": "^4.7.0"
  }
}
```

**各パッケージの役割**:
- `typescript`: TypeScript本体
- `@types/*`: 型定義ファイル
- `vitest`: テストフレームワーク
- `eslint`: リンター
- `prettier`: コードフォーマッター
- `tsx`: TypeScript実行環境

---

### 外部依存関係

**必要な外部依存**:
- ✅ **pandoc** - 手動インストール必須（初回実行時にチェック＋案内）
  - macOS: `brew install pandoc`
  - Linux (Debian/Ubuntu): `sudo apt-get install pandoc`
  - Linux (RedHat/CentOS): `sudo yum install pandoc`
  - Windows: `choco install pandoc` または公式インストーラー

**不要な外部依存**:
- ❌ fswatch (chokidar で代替)
- ❌ 自動パッケージマネージャー実行（セキュリティ理由で廃止）

---

## 設定システム

### 設定ファイル形式

**設定方針**:
- ✅ グローバル設定のみ (`~/.vimd/config.js`)
- ❌ プロジェクトローカル設定は作成しない (リポジトリを汚さない)

**優先順位** (高い順):

1. コマンドラインオプション (`--port 8081`)
2. グローバル設定 (`~/.vimd/config.js`)
3. デフォルト設定

---

### 設定ファイル: ~/.vimd/config.js ✅

**保存場所**: `~/.vimd/config.js` (ユーザーのホームディレクトリ)

**JavaScript形式（ESM）+ JSDocで型補完**:

```javascript
// @ts-check

/**
 * @type {import('vimd').VimdConfig}
 */
export default {
  // テーマ設定
  theme: 'github',  // 'github' | 'minimal' | 'dark' | 'academic' | 'technical'

  // サーバー設定
  port: 8080,
  host: 'localhost',
  open: true,  // ブラウザ自動オープン

  // カスタムCSS
  css: './custom.css',  // 相対パス or 絶対パス

  // カスタムテンプレート
  template: null,  // './custom-template.html'

  // pandoc設定
  pandoc: {
    standalone: true,
    toc: false,  // 目次生成
    tocDepth: 3,
    highlightStyle: 'github',  // シンタックスハイライトスタイル
    metadata: {
      title: 'Document Title'
    }
  },

  // ファイル監視設定
  watch: {
    ignored: ['node_modules/**', '.git/**'],
    debounce: 500  // ミリ秒（300 → 500に変更、安定性向上）
  },

  // 出力設定
  build: {
    output: null,  // 出力先ディレクトリ
    inlineCSS: false,  // CSSをインライン化
    standalone: true  // スタンドアロンHTML
  }
};
```

**型定義**:
```typescript
// vimdが提供する型定義（dist/index.d.ts）
export interface VimdConfig {
  theme?: 'github' | 'minimal' | 'dark' | 'academic' | 'technical';
  port?: number;
  host?: string;
  open?: boolean;
  css?: string;
  template?: string | null;
  pandoc?: {
    standalone?: boolean;
    toc?: boolean;
    tocDepth?: number;
    highlightStyle?: string;
    metadata?: Record<string, string>;
  };
  watch?: {
    ignored?: string[];
    debounce?: number;
  };
  build?: {
    output?: string | null;
    inlineCSS?: boolean;
    standalone?: boolean;
  };
}
```

**JSDocによる型補完のメリット**:
- ✅ エディタで自動補完が効く（VSCode, IntelliJ等）
- ✅ 実行時の複雑性なし（純粋なJavaScript）
- ✅ ユーザーが理解しやすい
- ✅ コメントで説明追加可能

---

### ディレクトリ構造

```bash
~/.vimd/               # 設定ディレクトリ
└── config.js            # メイン設定ファイル（JavaScript + JSDoc）

# 将来的な拡張 (Phase 2以降)
~/.vimd/
├── config.js
├── themes/              # カスタムテーマ
│   └── custom.css
└── cache/               # キャッシュ (必要に応じて)
```

---

### 環境変数

```bash
# ポート指定
MDLIVE_PORT=8081 vimd dev spec.md

# テーマ指定
MDLIVE_THEME=dark vimd dev spec.md

# デバッグモード
MDLIVE_DEBUG=true vimd dev spec.md
```

---

## 開発フェーズ

### Phase 1: MVP開発 (npm package) 🎯

**目標**: 動作する最小限のプロダクトを作成

**成果物**:
- ✅ npm package公開
- ✅ 基本機能実装 (dev, build, init)
- ✅ 5種類のテーマ
- ✅ 基本的なドキュメント

**期間**: 2-3週間 (想定)

**マイルストーン**:
1. プロジェクト初期化（ESMモジュール設定）
2. 初回実行時セットアップ機能実装（postinstallは検出のみ）
3. グローバル設定システム実装 (`~/.vimd/config.js`)
4. pandoc検出機能実装（自動インストールは廃止、案内のみ）
5. コア機能実装 (pandoc, chokidar, live-server統合)
6. EventEmitterベースのイベントシステム実装
7. CLI実装 (commander統合)
8. テーマシステム実装（CSSキャッシング含む）
9. 対話式コマンド実装 (`vimd theme`, `vimd config`)
10. テスト作成（カバレッジ70-80%目標）
11. セキュリティ監査（コマンドインジェクション対策、パストラバーサル対策）
12. ドキュメント作成（README.md日本語版、README-en.md英語版）
13. npm公開

---

### Phase 2: Homebrew対応 🔜

**目標**: macOSユーザー向けの利便性向上

**成果物**:
- ✅ Homebrew Formula作成
- ✅ brew tap または Core登録
- ✅ インストールガイド更新

**期間**: 1週間 (想定)

**前提条件**: Phase 1完了 (npm package公開済み)

---

### Phase 3: 拡張機能 (将来)

**候補機能**:
- プラグインシステム
- 追加テーマ
- PDF出力
- プレゼンテーションモード
- マルチファイルプロジェクト対応
- 目次自動生成
- 検索機能

**優先順位**: ユーザーフィードバックに基づき決定

---

## 成功指標

### 技術的指標

- ✅ npm公開成功
- ✅ テストカバレッジ 80%以上
- ✅ TypeScript型エラーゼロ
- ✅ Lintエラーゼロ
- ✅ 全主要OS (Mac/Linux/Windows) で動作確認

---

### ユーザー指標

**初期目標** (Phase 1完了後):
- npm週間ダウンロード: 100以上
- GitHub スター: 50以上
- Issue/PR: アクティブなコミュニティ
- ドキュメント完読率: 70%以上

**長期目標** (6ヶ月後):
- npm週間ダウンロード: 1,000以上
- GitHub スター: 500以上
- コントリビューター: 5人以上
- ブログ記事・紹介: 10件以上

---

## リスクと対策

### リスク1: pandoc自動インストールの失敗

**リスク**: OS環境によって自動インストールに失敗する可能性

**対策**:
- 詳細なエラーメッセージと手動インストール手順の案内
- 複数のインストール方法を提供 (brew, apt, yum, choco, 公式インストーラー)
- フォールバックとして手動インストール済みpandocの検出
- ドキュメントに各OSの手動インストール手順を記載

---

### リスク2: クロスプラットフォーム対応の複雑さ

**リスク**: OS別の挙動の違い

**対策**:
- CI/CDで全OS自動テスト (GitHub Actions)
- 仮想環境でのテスト
- ユーザーからのバグレポート収集

---

### リスク3: npm package名の競合

**リスク**: `vimd` が既に使用されている

**対策**:
- 事前にnpmレジストリ確認
- 代替名を準備 (`vimd-preview`, `markdown-live`, `md-preview`)
- スコープ付きパッケージも検討 (`@username/vimd`)

---

### リスク4: メンテナンスの持続性

**リスク**: 長期的なメンテナンス負担

**対策**:
- コントリビューションガイド充実
- 自動化 (CI/CD, リリース、依存関係更新)
- コミュニティ形成
- シンプルな設計でメンテナンス負担軽減

---

## 参考資料

### 類似ツール調査

**既存ツール**:
- `grip`: GitHub風Markdownプレビュー (Python製)
- `markdown-preview`: VS Code拡張
- `Marked 2`: macOS専用アプリ (有料)
- `vmd`: Vue製Markdownビューア

**差別化ポイント**:
- ✅ 1コマンドインストール (npm)
- ✅ クロスプラットフォーム
- ✅ テーマシステム
- ✅ 軽量・高速
- ✅ 柔軟な設定

---

### 技術リファレンス

- [marked公式ドキュメント](https://marked.js.org/)
- [chokidar GitHub](https://github.com/paulmillr/chokidar)
- [live-server npm](https://www.npmjs.com/package/live-server)
- [commander.js](https://github.com/tj/commander.js)
- [Semantic Versioning](https://semver.org/)

---

## 変更履歴

| 日付 | バージョン | 変更内容 | 担当 |
|------|-----------|---------|------|
| 2025-12-05 | 1.0 | 初版作成 | Claude (Sonnet 4.5) |
| 2025-12-05 | 1.1 | pandoc採用 + 自動インストール対応、設定ファイルをTypeScriptに変更 | Claude (Sonnet 4.5) |
| 2025-12-05 | 1.2 | グローバル設定のみに変更、インストール時自動セットアップ、対話式コマンド追加、英語表記・絵文字なし | Claude (Sonnet 4.5) |
| 2025-12-06 | 1.3 | **技術的問題修正版**: ESM採用、pandoc手動インストール化（セキュリティ対策）、postinstall廃止→初回実行時セットアップ、config.jsに変更（JSDoc型補完）、EventEmitter基盤追加、デバウンス500ms、テストカバレッジ70-80%目標、セキュリティ監査追加、ドキュメント日本語メイン（英語版-en.md）、live-server API検証完了 | Claude (Sonnet 4.5) + notokeishou |

---

## 承認

**作成者**: Claude (Sonnet 4.5) + notokeishou
**レビュー**: ✅ 完了 (v1.3で技術的問題修正)
**承認**: ✅ 承認済み
**ステータス**: 要件定義フェーズ完了、実装準備完了

---

**次のステップ**: プロジェクト構成設計 → 詳細設計 → 実装開始 🚀
