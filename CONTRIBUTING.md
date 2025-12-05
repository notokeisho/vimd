# vimd へのコントリビューション

🌐 [English](CONTRIBUTING-en.md) | 日本語

vimd へのコントリビューションを検討していただきありがとうございます!

## 開発環境のセットアップ

1. リポジトリをフォーク
2. フォークをクローン
3. 依存関係をインストール: `npm install`
4. ブランチを作成: `git checkout -b feature/your-feature`

## 開発ワークフロー

### テストの実行

```bash
# 全てのテストを実行
npm test

# ウォッチモード
npm run test:watch

# カバレッジ
npm run test:coverage
```

### コード品質

```bash
# Lint
npm run lint
npm run lint:fix

# フォーマット
npm run format

# 型チェック
npm run typecheck
```

### ビルド

```bash
npm run build
```

## 変更のテスト

```bash
# vimd をローカルで実行
npm run dev -- dev test.md
npm run dev -- build test.md
```

## コミットメッセージ

Conventional Commits形式に従ってください:

```
<type>: <description>

<body>

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
```

タイプ: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

### 例

```
feat: テーマ切り替え機能を追加

- 5つの組み込みテーマをサポート
- vimd theme コマンドで対話的に変更可能

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
```

## プルリクエストのプロセス

1. 変更に対するテストを追加・更新
2. 全てのテストが通ることを確認
3. 必要に応じてドキュメントを更新
4. 明確な説明を付けてプルリクエストを作成

## コーディング規約

### TypeScript

- strict モードを使用
- 明示的な型アノテーションを推奨
- `any` の使用は最小限に

### ファイル構成

- 1ファイル1責任
- 関連するコードは同じディレクトリに
- テストは `tests/` ディレクトリに配置

### 命名規則

- ファイル名: kebab-case (`config-loader.ts`)
- クラス名: PascalCase (`ConfigLoader`)
- 関数名・変数名: camelCase (`loadConfig`)
- 定数: UPPER_SNAKE_CASE (`DEFAULT_PORT`)

## Issue の報告

バグを報告する際は、以下の情報を含めてください:

1. **環境情報**: OS, Node.js バージョン, pandoc バージョン
2. **再現手順**: 問題を再現するための手順
3. **期待される動作**: 何が起こるべきか
4. **実際の動作**: 何が起こったか
5. **エラーメッセージ**: コンソール出力があれば

## 機能リクエスト

新機能を提案する際は:

1. 既存の Issue を確認
2. ユースケースを明確に説明
3. 可能であれば実装案を提示

## 質問・サポート

- [GitHub Issues](https://github.com/notokeishou/vimd/issues) で質問してください
- タグ `question` を使用してください

---

改めて、コントリビューションを検討していただきありがとうございます! 🙏
