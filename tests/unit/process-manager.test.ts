// tests/unit/process-manager.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ProcessManager } from '../../src/utils/process-manager';

describe('ProcessManager', () => {
  beforeEach(() => {
    ProcessManager.reset(); // テスト間でクリーンアップ
    // process.exit をモック
    vi.spyOn(process, 'exit').mockImplementation((() => {}) as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should register exit handler', () => {
    const handler = vi.fn();
    ProcessManager.onExit(handler);

    // SIGINTイベントを発火
    process.emit('SIGINT');

    expect(handler).toHaveBeenCalled();
  });

  it('should execute multiple exit handlers', async () => {
    const handler1 = vi.fn();
    const handler2 = vi.fn();

    ProcessManager.onExit(handler1);
    ProcessManager.onExit(handler2);

    process.emit('SIGINT');

    // 非同期処理を待つ
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(handler1).toHaveBeenCalled();
    expect(handler2).toHaveBeenCalled();
  });

  it('should cleanup registered handlers', async () => {
    const handler = vi.fn();
    ProcessManager.onExit(handler);

    await ProcessManager.cleanup();

    // cleanup後はハンドラが実行されない
    ProcessManager.reset();
    process.emit('SIGINT');

    expect(handler).toHaveBeenCalledTimes(0);
  });
});
