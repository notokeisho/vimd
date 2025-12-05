// src/core/server.ts
import liveServer from 'live-server';
import { ServerConfig } from '../config/types.js';
import { Logger } from '../utils/logger.js';
import * as path from 'path';
import open from 'open';

export class LiveServer {
  private running = false;

  constructor(private config: ServerConfig) {}

  async start(htmlPath: string): Promise<void> {
    const root = path.dirname(htmlPath);
    const file = path.basename(htmlPath);

    const params: liveServer.LiveServerParams = {
      port: this.config.port,
      host: this.config.host,
      root: root,
      file: file,
      open: false, // manually open
      wait: 100,
      logLevel: 2, // verbose for debugging
      watch: [root], // explicitly watch the root directory
    };

    try {
      liveServer.start(params);
      this.running = true;

      const url = `http://${this.config.host}:${this.config.port}`;
      Logger.success(`Server started at ${url}`);

      if (this.config.open) {
        await this.openBrowser(url);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to start server: ${errorMessage}`);
    }
  }

  async stop(): Promise<void> {
    if (!this.running) {
      return;
    }

    liveServer.shutdown();
    this.running = false;
    Logger.info('Server stopped');
  }

  async openBrowser(url: string): Promise<void> {
    try {
      await open(url);
      Logger.info('Browser opened');
    } catch (error) {
      Logger.warn('Failed to open browser automatically');
    }
  }

  getURL(): string {
    return `http://${this.config.host}:${this.config.port}`;
  }
}
