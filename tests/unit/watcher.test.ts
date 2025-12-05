// tests/unit/watcher.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FileWatcher } from '../../src/core/watcher';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';

describe('FileWatcher', () => {
  const testDir = path.join(os.tmpdir(), 'vimd-watcher-test');
  const testFile = path.join(testDir, 'test.md');

  beforeEach(async () => {
    await fs.ensureDir(testDir);
    await fs.writeFile(testFile, '# Test');
  });

  afterEach(async () => {
    await fs.remove(testDir);
  });

  it('should create watcher instance', () => {
    const watcher = new FileWatcher(testFile, {
      ignored: ['node_modules/**'],
      debounce: 100,
    });

    expect(watcher).toBeDefined();
  });

  it('should call onChange callback when file changes', async () => {
    const callback = vi.fn();
    const watcher = new FileWatcher(testFile, {
      ignored: [],
      debounce: 100,
    });

    watcher.onChange(callback);
    watcher.start();

    // watcher初期化待機
    await new Promise((resolve) => setTimeout(resolve, 100));

    // ファイルを変更
    await fs.writeFile(testFile, '# Changed');

    // デバウンス待機
    await new Promise((resolve) => setTimeout(resolve, 300));

    expect(callback).toHaveBeenCalled();

    await watcher.stop();
  });

  it('should debounce rapid changes', async () => {
    const callback = vi.fn();
    const watcher = new FileWatcher(testFile, {
      ignored: [],
      debounce: 500,
    });

    watcher.onChange(callback);
    watcher.start();

    // 連続で変更
    await fs.writeFile(testFile, '# Change 1');
    await fs.writeFile(testFile, '# Change 2');
    await fs.writeFile(testFile, '# Change 3');

    // デバウンス期間待機
    await new Promise((resolve) => setTimeout(resolve, 600));

    // デバウンスにより1回のみ呼ばれる
    expect(callback).toHaveBeenCalledTimes(1);

    await watcher.stop();
  });

  it('should stop watching when stop() is called', async () => {
    const callback = vi.fn();
    const watcher = new FileWatcher(testFile, {
      ignored: [],
      debounce: 100,
    });

    watcher.onChange(callback);
    watcher.start();
    await watcher.stop();

    // 停止後の変更は検知されない
    await fs.writeFile(testFile, '# After stop');
    await new Promise((resolve) => setTimeout(resolve, 200));

    expect(callback).not.toHaveBeenCalled();
  });
});
