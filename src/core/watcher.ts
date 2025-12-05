// src/core/watcher.ts
import chokidar, { FSWatcher } from 'chokidar';
import { WatchConfig } from '../config/types.js';

type ChangeCallback = (path: string) => void;

export class FileWatcher {
  private watcher: FSWatcher | null = null;
  private callbacks: ChangeCallback[] = [];
  private debounceTimer: NodeJS.Timeout | null = null;

  constructor(
    private filePath: string,
    private config: WatchConfig
  ) {}

  onChange(callback: ChangeCallback): void {
    this.callbacks.push(callback);
  }

  start(): void {
    this.watcher = chokidar.watch(this.filePath, {
      ignored: this.config.ignored,
      persistent: true,
      ignoreInitial: true,
    });

    this.watcher.on('change', (path: string) => {
      this.handleChange(path);
    });
  }

  async stop(): Promise<void> {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    if (this.watcher) {
      await this.watcher.close();
      this.watcher = null;
    }
  }

  private handleChange(path: string): void {
    // デバウンス処理
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.callbacks.forEach((callback) => callback(path));
      this.debounceTimer = null;
    }, this.config.debounce);
  }
}
