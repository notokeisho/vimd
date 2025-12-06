# テスト

このドキュメントでは、vimd のテスト戦略と構造について説明します。

## テストフレームワーク

vimd はテストに **Vitest** を使用します。

## テスト構造

```
tests/
├── unit/                    # ユニットテスト
│   ├── converter.test.ts    # Markdown コンバーターテスト
│   ├── config-loader.test.ts # 設定テスト
│   ├── theme-manager.test.ts # テーマシステムテスト
│   ├── watcher.test.ts      # ファイルウォッチャーテスト
│   ├── pandoc-detector.test.ts # pandoc 検出テスト
│   └── session-manager.test.ts # セッション管理テスト
│
└── integration/             # 統合テスト
    └── cli.test.ts          # CLI 統合テスト
```

## テストの実行

```bash
# すべてのテストを実行
npm test

# ウォッチモードで実行
npm test -- --watch

# 特定のファイルを実行
npm test -- tests/unit/converter.test.ts

# パターンにマッチするテストを実行
npm test -- --grep "converter"
```

## カバレッジ

```bash
# カバレッジ付きで実行
npm run test:coverage

# カバレッジレポートの場所
open coverage/index.html
```

### 現在のカバレッジ

| メトリック | カバレッジ |
|-----------|-----------|
| Statements | 73.52% |
| Branches | 77.98% |
| Functions | 82.08% |
| Lines | 73.52% |

## テストの書き方

### ユニットテストの例

```typescript
import { describe, it, expect } from 'vitest';
import { ThemeManager } from '../../src/themes/manager';

describe('ThemeManager', () => {
  describe('list', () => {
    it('利用可能なすべてのテーマを返すべき', () => {
      const themes = ThemeManager.list();

      expect(themes).toHaveLength(5);
      expect(themes.map(t => t.name)).toContain('github');
    });
  });

  describe('get', () => {
    it('有効なテーマの CSS コンテンツを返すべき', () => {
      const css = ThemeManager.get('github');

      expect(css).toContain('body');
      expect(css).toContain('font-family');
    });

    it('無効なテーマでエラーを投げるべき', () => {
      expect(() => ThemeManager.get('invalid'))
        .toThrow('Theme not found');
    });
  });
});
```

### 非同期テストの例

```typescript
import { describe, it, expect } from 'vitest';
import { ConfigLoader } from '../../src/config/loader';

describe('ConfigLoader', () => {
  describe('loadGlobal', () => {
    it('ファイルが存在しない場合はデフォルト設定を読み込むべき', async () => {
      const config = await ConfigLoader.loadGlobal();

      expect(config.theme).toBe('github');
      expect(config.port).toBe(8080);
    });
  });
});
```

### モックの例

```typescript
import { describe, it, expect, vi } from 'vitest';
import { execSync } from 'child_process';
import { PandocDetector } from '../../src/core/pandoc-detector';

vi.mock('child_process');

describe('PandocDetector', () => {
  it('インストール済みの場合に pandoc を検出するべき', () => {
    vi.mocked(execSync).mockReturnValue(Buffer.from('pandoc 3.0.0'));

    const result = PandocDetector.detect();

    expect(result.installed).toBe(true);
    expect(result.version).toBe('3.0.0');
  });
});
```

## テストガイドライン

1. **分離**: 各テストは独立しているべき
2. **明確さ**: テスト名は動作を説明するべき
3. **カバレッジ**: 重要なパスで高いカバレッジを目指す
4. **速度**: テストを高速に保つ (外部依存をモック)

## 既知の問題

### スキップされたテスト

不安定な動作のためにスキップされているテストがあります。

- `session-manager.test.ts`: 並列テスト間のファイル I/O でタイミングの問題

これらはテストファイル内で `.skip` でマークされ、ドキュメント化されています。
