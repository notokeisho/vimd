// src/core/single-file-server.ts
import http from 'http';
import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';
import polka from 'polka';
import sirv from 'sirv';
import { WebSocketServer as WSServer, WebSocket } from 'ws';
import { Logger } from '../utils/logger.js';
import { SessionManager } from '../utils/session-manager.js';
import { ThemeManager } from '../themes/index.js';
import { ParserFactory } from './parser/index.js';
import { PandocDetector } from './pandoc-detector.js';
import { FileWatcher } from './watcher.js';
import type { SourceFormat } from './parser/pandoc-parser.js';
import type { WatchConfig, PandocConfig } from '../config/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Result of server start operation
 */
export interface ServerStartResult {
  actualPort: number;
  requestedPort: number;
  portChanged: boolean;
}

/**
 * SingleFileServer options
 */
export interface SingleFileServerOptions {
  port: number;
  host?: string;
  filePath: string;
  theme: string;
  mathEnabled?: boolean;
  pandocOptions?: Partial<PandocConfig>;
  customCSS?: string;
  watchOptions?: Partial<WatchConfig>;
}

/**
 * WebSocket message types
 */
type ServerMessage =
  | { type: 'content'; data: { html: string; title: string } }
  | { type: 'error'; data: { message: string } };

/**
 * Single file mode server for preview
 * Serves HTML template in memory, sends content via WebSocket
 */
export class SingleFileServer {
  private httpServer: http.Server | null = null;
  private wsServer: WSServer | null = null;
  private clients: Set<WebSocket> = new Set();
  private watcher: FileWatcher | null = null;
  private options: SingleFileServerOptions;
  private _port: number;
  private renderedHtml: string | null = null;
  private currentContent: string | null = null;
  private fileTitle: string = '';

  constructor(options: SingleFileServerOptions) {
    this.options = {
      host: 'localhost',
      mathEnabled: true,
      ...options,
    };
    this._port = options.port;
    this.fileTitle = path.basename(options.filePath, path.extname(options.filePath));
  }

  /**
   * Get the actual port the server is running on
   */
  get port(): number {
    return this._port;
  }

  /**
   * Start the HTTP and WebSocket servers
   */
  async start(): Promise<ServerStartResult> {
    const requestedPort = this.options.port;
    let actualPort = requestedPort;

    // Check if port is available
    if (!(await SessionManager.isPortAvailable(requestedPort))) {
      actualPort = await SessionManager.findAvailablePort(requestedPort + 1);
      Logger.warn(`Port ${requestedPort} was unavailable, using port ${actualPort}`);
    }

    this._port = actualPort;

    // Render template
    this.renderedHtml = await this.renderTemplate();

    // Initial conversion
    await this.convertAndCacheFile();

    // Create polka app
    const app = polka();

    // Static file server for images, CSS, JS from source directory
    const sourceDir = path.dirname(this.options.filePath);
    const serve = sirv(sourceDir, {
      dev: true, // Disable caching for development
    });

    // Serve static files (images, etc.) but not the source markdown/latex
    app.use((req, res, next) => {
      const url = req.url || '/';

      // Root path serves our template
      if (url === '/' || url === '/index.html') {
        return next();
      }

      // Serve static files
      serve(req, res, next);
    });

    // Serve single file mode HTML for root
    app.get('/', (req, res) => {
      this.serveHtml(req, res);
    });

    app.get('/index.html', (req, res) => {
      this.serveHtml(req, res);
    });

    // Create HTTP server
    this.httpServer = http.createServer(app.handler as http.RequestListener);

    // Create WebSocket server
    this.wsServer = new WSServer({ server: this.httpServer });

    // Handle WebSocket connections
    this.wsServer.on('connection', (ws: WebSocket) => {
      this.handleConnection(ws);
    });

    // Start listening
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Server start timeout'));
      }, 10000);

      this.httpServer!.listen(actualPort, this.options.host, () => {
        clearTimeout(timeout);
        resolve();
      });

      this.httpServer!.on('error', (err: Error) => {
        clearTimeout(timeout);
        reject(err);
      });
    });

    // Start file watcher
    this.startWatcher();

    const url = `http://${this.options.host}:${actualPort}`;
    Logger.success(`Server started at ${url}`);

    return {
      actualPort,
      requestedPort,
      portChanged: actualPort !== requestedPort,
    };
  }

  /**
   * Stop the server
   */
  async stop(): Promise<void> {
    // Stop file watcher
    if (this.watcher) {
      await this.watcher.stop();
      this.watcher = null;
    }

    // Terminate all WebSocket clients
    for (const client of this.clients) {
      try {
        client.terminate();
      } catch {
        // Ignore termination errors
      }
    }
    this.clients.clear();

    // Close WebSocket server
    if (this.wsServer) {
      await new Promise<void>((resolve) => {
        this.wsServer!.close(() => resolve());
      });
      this.wsServer = null;
    }

    // Close HTTP server
    if (this.httpServer) {
      this.httpServer.closeAllConnections();
      await new Promise<void>((resolve) => {
        this.httpServer!.close(() => resolve());
      });
      this.httpServer = null;
    }

    Logger.info('Server stopped');
  }

  /**
   * Handle new WebSocket connection
   */
  private handleConnection(ws: WebSocket): void {
    this.clients.add(ws);
    Logger.info(`WebSocket client connected (${this.clients.size} total)`);

    // Send current content on connection
    if (this.currentContent) {
      this.sendMessage(ws, {
        type: 'content',
        data: { html: this.currentContent, title: this.fileTitle },
      });
    }

    ws.on('close', () => {
      this.clients.delete(ws);
      Logger.info(`WebSocket client disconnected (${this.clients.size} remaining)`);
    });

    ws.on('error', (error) => {
      Logger.warn(`WebSocket error: ${error.message}`);
      this.clients.delete(ws);
    });
  }

  /**
   * Start watching the file for changes
   */
  private startWatcher(): void {
    const watchOptions: WatchConfig = {
      debounce: this.options.watchOptions?.debounce ?? 500,
      ignored: this.options.watchOptions?.ignored ?? [],
    };
    this.watcher = new FileWatcher(this.options.filePath, watchOptions);

    this.watcher.onChange(async () => {
      Logger.info('File changed, reconverting...');
      try {
        await this.convertAndCacheFile();
        this.broadcastContent();
        Logger.success('Reconversion complete');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        Logger.error(`Reconversion failed: ${message}`);
        this.broadcast({
          type: 'error',
          data: { message: `Conversion failed: ${message}` },
        });
      }
    });

    this.watcher.start();
    Logger.info(`Watching: ${this.options.filePath}`);
  }

  /**
   * Convert file and cache the result
   */
  private async convertAndCacheFile(): Promise<void> {
    const filePath = this.options.filePath;
    const ext = path.extname(filePath).toLowerCase();
    const isLatex = ext === '.tex' || ext === '.latex';
    const fromFormat: SourceFormat = isLatex ? 'latex' : 'markdown';

    // Check pandoc for LaTeX files
    if (isLatex && !PandocDetector.check()) {
      throw new Error('LaTeX files require pandoc. Please install pandoc.');
    }

    const content = await fs.readFile(filePath, 'utf-8');
    const parserType = isLatex ? 'pandoc' : 'markdown-it';

    const parser = ParserFactory.create(
      parserType,
      this.options.pandocOptions || {},
      undefined,
      fromFormat
    );
    this.currentContent = await parser.parse(content);
  }

  /**
   * Broadcast current content to all clients
   */
  private broadcastContent(): void {
    if (this.currentContent) {
      this.broadcast({
        type: 'content',
        data: { html: this.currentContent, title: this.fileTitle },
      });
    }
  }

  /**
   * Send message to a specific client
   */
  private sendMessage(ws: WebSocket, message: ServerMessage): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  /**
   * Broadcast message to all clients
   */
  private broadcast(message: ServerMessage): void {
    const data = JSON.stringify(message);
    for (const client of this.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    }
  }

  /**
   * Serve the HTML template
   */
  private serveHtml(
    _req: http.IncomingMessage,
    res: http.ServerResponse
  ): void {
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    });
    res.end(this.renderedHtml);
  }

  /**
   * Render the single file template
   */
  private async renderTemplate(): Promise<string> {
    // Load template
    const templatePath = path.join(__dirname, '../../templates/single-file.html');
    let template = await fs.readFile(templatePath, 'utf-8');

    // Load theme CSS
    const themeCss = await ThemeManager.getCSS(this.options.theme);

    // Replace placeholders
    template = template
      .replace('{{title}}', this.escapeHtml(this.fileTitle))
      .replace('{{theme_css}}', themeCss);

    // Handle math support
    if (this.options.mathEnabled) {
      template = template
        .replace(/\{\{#if math_enabled\}\}/g, '')
        .replace(/\{\{\/if\}\}/g, '');
    } else {
      // Remove math-related content
      template = template.replace(
        /\{\{#if math_enabled\}\}[\s\S]*?\{\{\/if\}\}/g,
        ''
      );
    }

    return template;
  }

  /**
   * Escape HTML special characters
   */
  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
