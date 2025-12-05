// src/utils/process-manager.ts

type ExitHandler = () => void | Promise<void>;

export class ProcessManager {
  private static handlers: ExitHandler[] = [];
  private static initialized = false;

  private static init() {
    if (this.initialized) return;

    process.on('SIGINT', async () => {
      await this.executeHandlers();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      await this.executeHandlers();
      process.exit(0);
    });

    this.initialized = true;
  }

  static onExit(handler: ExitHandler): void {
    this.init();
    this.handlers.push(handler);
  }

  private static async executeHandlers(): Promise<void> {
    for (const handler of this.handlers) {
      await handler();
    }
  }

  static async cleanup(): Promise<void> {
    this.handlers = [];
  }

  // テスト用: ハンドラをリセット
  static reset(): void {
    this.handlers = [];
    this.initialized = false;
  }
}
