// tests/integration/e2e.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { ConfigLoader } from '../../src/config/loader.js';
import { MarkdownConverter } from '../../src/core/converter.js';
import { FileWatcher } from '../../src/core/watcher.js';
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
    expect(htmlContent).toContain('sourceCode javascript');

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
