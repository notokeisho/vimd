// src/core/server.ts
import liveServer from 'live-server';
import { ServerConfig } from '../config/types.js';
import { Logger } from '../utils/logger.js';
import * as path from 'path';
import open from 'open';
import { AddressInfo } from 'net';

export interface ServerStartResult {
  actualPort: number;
  requestedPort: number;
  portChanged: boolean;
}

export class LiveServer {
  private running = false;
  private actualPort: number;

  constructor(private config: ServerConfig) {
    this.actualPort = config.port;
  }

  async start(htmlPath: string): Promise<ServerStartResult> {
    const root = path.dirname(htmlPath);
    const file = path.basename(htmlPath);

    const params: liveServer.LiveServerParams = {
      port: this.config.port,
      host: this.config.host,
      root: root,
      file: file,
      open: false, // manually open
      wait: 50,
      logLevel: 0, // silent
      watch: [root], // explicitly watch the root directory
    };

    try {
      const server = liveServer.start(params);

      // Wait for server to start and get actual port
      const actualPort = await new Promise<number>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Server start timeout'));
        }, 10000);

        server.addListener('listening', () => {
          clearTimeout(timeout);
          const address = server.address() as AddressInfo;
          resolve(address.port);
        });

        server.addListener('error', (err: Error) => {
          clearTimeout(timeout);
          reject(err);
        });
      });

      this.actualPort = actualPort;
      this.running = true;

      const portChanged = actualPort !== this.config.port;
      const url = `http://${this.config.host}:${actualPort}`;

      if (portChanged) {
        Logger.warn(`Port ${this.config.port} was unavailable, using port ${actualPort}`);
      }
      Logger.success(`Server started at ${url}`);

      if (this.config.open) {
        await this.openBrowser(url);
      }

      return {
        actualPort,
        requestedPort: this.config.port,
        portChanged,
      };
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
    return `http://${this.config.host}:${this.actualPort}`;
  }

  getActualPort(): number {
    return this.actualPort;
  }
}
