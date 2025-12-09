# アーキテクチャ

このドキュメントでは、vimd のコードベースのアーキテクチャと構造について説明します。

## ディレクトリ構造

```
vimd/
├── src/
│   ├── cli/              # CLI コマンド
│   │   ├── index.ts      # エントリーポイント
│   │   ├── dev.ts        # vimd dev コマンド
│   │   ├── build.ts      # vimd build コマンド
│   │   ├── theme.ts      # vimd theme コマンド
│   │   └── config.ts     # vimd config コマンド
│   │
│   ├── config/           # 設定管理
│   │   ├── loader.ts     # 設定ファイル読み込み
│   │   ├── validator.ts  # 設定の検証
│   │   └── defaults.ts   # デフォルト値
│   │
│   ├── core/             # コア機能
│   │   ├── converter.ts  # Markdown から HTML への変換
│   │   ├── watcher.ts    # ファイル監視
│   │   ├── websocket-server.ts  # WebSocket ライブリロードサーバー
│   │   └── pandoc-detector.ts  # pandoc 検出
│   │
│   ├── themes/           # テーマシステム
│   │   ├── registry.ts   # テーマレジストリ
│   │   ├── manager.ts    # テーマ管理
│   │   └── styles/       # CSS ファイル
│   │       ├── github.css
│   │       ├── dark.css
│   │       ├── academic.css
│   │       ├── minimal.css
│   │       └── technical.css
│   │
│   └── utils/            # ユーティリティ関数
│       ├── logger.ts     # ログ出力
│       ├── os-detector.ts    # OS 検出
│       ├── path-resolver.ts  # パスユーティリティ
│       ├── process-manager.ts # プロセス管理
│       └── session-manager.ts # セッション処理
│
├── tests/
│   ├── unit/             # ユニットテスト
│   └── integration/      # 統合テスト
│
├── templates/            # HTML テンプレート
│   └── preview.html      # プレビューテンプレート
│
├── docs/                 # 開発者ドキュメント
│
└── dist/                 # ビルドファイル (自動生成)
```

## モジュール設計

### CLI レイヤー (`src/cli/`)

Commander.js を使用してコマンドラインインターフェースを処理します。

```
ユーザー入力 → CLI パーサー → コマンドハンドラー → コア機能
```

### コアレイヤー (`src/core/`)

主要なビジネスロジックを含みます。

| モジュール | 責務 |
|-----------|------|
| `converter.ts` | pandoc/markdown-it による Markdown から HTML への変換 |
| `watcher.ts` | chokidar によるファイルシステム監視 |
| `websocket-server.ts` | WebSocket によるライブリロードサーバー (polka + sirv + ws) |
| `pandoc-detector.ts` | pandoc のインストール検出 |

### 設定レイヤー (`src/config/`)

ユーザー設定を管理します。

```
~/.vimd/config.js → ConfigLoader → 検証 → マージされた設定
```

### テーマレイヤー (`src/themes/`)

CSS テーマを管理します。

```
テーマ名 → ThemeManager → CSS コンテンツ → HTML 注入
```

## データフロー

### `vimd dev` コマンド

```
1. CLI 引数のパース
2. 設定の読み込み
3. pandoc の検出 (--pandoc オプション時)
4. ファイルウォッチャーの開始
5. Markdown を HTML に変換
6. WebSocketServer の起動 (HTTP + WebSocket)
7. ブラウザを開く
8. 変更を監視 → 再変換 → WebSocket で reload 送信
```

### `vimd build` コマンド

```
1. CLI 引数のパース
2. 設定の読み込み
3. pandoc の検出
4. Markdown を HTML に変換
5. CSS を注入
6. 出力ファイルを書き込み
```

## 主要な設計決定

### ESM (ES Modules)

vimd は最新の JavaScript 互換性のために ESM 形式を使用します。

```json
// package.json
{
  "type": "module"
}
```

### JavaScript による設定

設定ファイルは柔軟性のために JavaScript (JSON ではなく) を使用します。

```javascript
// ~/.vimd/config.js
export default {
  theme: 'github',
  port: 38080,  // デフォルト: 38080
};
```

### pandoc 依存

vimd は pandoc を別途インストールする必要があります。これにより以下を実現します。
- 高品質な Markdown 変換
- 高度な Markdown 機能のサポート
- プラットフォーム間で一貫した出力

### セッション管理

セッションは `$TMPDIR/vimd/sessions.json` で追跡され、以下に対応します。
- ポートの競合
- 複数インスタンス
- 終了時のクリーンアップ
