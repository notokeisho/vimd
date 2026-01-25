import http from 'http';
import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';
import polka from 'polka';
import { WebSocketServer as WSServer, WebSocket } from 'ws';
import { Logger } from '../../utils/logger.js';
import { SessionManager } from '../../utils/session-manager.js';
import { ThemeManager } from '../../themes/index.js';
import { ParserFactory } from '../parser/index.js';
import { PandocDetector } from '../pandoc-detector.js';
import { FolderScanner } from './folder-scanner.js';
import type {
  FolderModeOptions,
  TreeNode,
  ServerMessage,
  ClientMessage,
} from './types.js';

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
 * Client state for each WebSocket connection
 */
interface ClientState {
  currentFile: string | null;
}

/**
 * Folder mode server for multi-file preview
 */
export class FolderModeServer {
  private httpServer: http.Server | null = null;
  private wsServer: WSServer | null = null;
  private clients: Map<WebSocket, ClientState> = new Map();
  private scanner: FolderScanner;
  private options: FolderModeOptions;
  private _port: number;
  private fileTree: TreeNode[] = [];
  private renderedHtml: string | null = null;

  constructor(options: FolderModeOptions) {
    this.options = options;
    this._port = options.port;
    this.scanner = new FolderScanner({ rootPath: options.rootPath });
  }

  /**
   * Get the actual port the server is running on
   */
  get port(): number {
    return this._port;
  }

  /**
   * Get the root path
   */
  get rootPath(): string {
    return this.options.rootPath;
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

    // Initial scan
    this.fileTree = await this.scanner.scan();
    Logger.info(`Found ${this.countFiles(this.fileTree)} files in folder`);

    // Render template
    this.renderedHtml = await this.renderTemplate();

    // Create polka app
    const app = polka();

    // API: Get file tree
    app.get('/api/tree', (_req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(this.fileTree));
    });

    // Serve folder mode HTML for all routes (SPA style)
    app.get('*', (req, res) => {
      this.serveFolderModeHtml(req, res);
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

      this.httpServer!.listen(actualPort, 'localhost', () => {
        clearTimeout(timeout);
        resolve();
      });

      this.httpServer!.on('error', (err: Error) => {
        clearTimeout(timeout);
        reject(err);
      });
    });

    const url = `http://localhost:${actualPort}`;
    Logger.success(`Folder mode server started at ${url}`);

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
    // Terminate all WebSocket clients
    for (const [client] of this.clients) {
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

    Logger.info('Folder mode server stopped');
  }

  /**
   * Handle new WebSocket connection
   */
  private handleConnection(ws: WebSocket): void {
    // Initialize client state
    this.clients.set(ws, { currentFile: null });
    Logger.info(`WebSocket client connected (${this.clients.size} total)`);

    // Send file tree on connection
    this.sendMessage(ws, { type: 'tree', data: this.fileTree });

    // Handle messages from client
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString()) as ClientMessage;
        this.handleClientMessage(ws, message);
      } catch (error) {
        Logger.warn(`Invalid message from client: ${error}`);
      }
    });

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
   * Handle message from client
   */
  private handleClientMessage(ws: WebSocket, message: ClientMessage): void {
    switch (message.type) {
      case 'selectFile':
        this.handleSelectFile(ws, message.path);
        break;
      default:
        Logger.warn(`Unknown message type: ${(message as { type: string }).type}`);
    }
  }

  /**
   * Handle file selection
   */
  private async handleSelectFile(ws: WebSocket, relativePath: string): Promise<void> {
    const state = this.clients.get(ws);
    if (!state) return;

    // Validate path (security check)
    const absolutePath = this.validatePath(relativePath);
    if (!absolutePath) {
      this.sendMessage(ws, {
        type: 'error',
        data: { type: 'invalid-path', message: 'Invalid file path' },
      });
      return;
    }

    // Check file exists
    if (!(await fs.pathExists(absolutePath))) {
      this.sendMessage(ws, {
        type: 'error',
        data: { type: 'file-not-found', message: 'File not found' },
      });
      return;
    }

    // Determine file type
    const ext = path.extname(relativePath).toLowerCase();
    const isLatex = ext === '.tex' || ext === '.latex';

    // Check pandoc for LaTeX files
    if (isLatex && !PandocDetector.check()) {
      this.sendMessage(ws, {
        type: 'error',
        data: {
          type: 'pandoc-not-found',
          message: 'LaTeX files require pandoc. Please install pandoc.',
        },
      });
      return;
    }

    // Convert file
    try {
      const html = await this.convertFile(absolutePath, isLatex);

      // Update client state
      state.currentFile = relativePath;

      // Send content
      this.sendMessage(ws, {
        type: 'content',
        data: { path: relativePath, html },
      });

      Logger.info(`File converted: ${relativePath}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      Logger.error(`Failed to convert ${relativePath}: ${message}`);
      this.sendMessage(ws, {
        type: 'error',
        data: { type: 'conversion-error', message: `Failed to convert file: ${message}` },
      });
    }
  }

  /**
   * Convert a file to HTML
   */
  private async convertFile(absolutePath: string, isLatex: boolean): Promise<string> {
    const content = await fs.readFile(absolutePath, 'utf-8');
    const fromFormat = isLatex ? 'latex' : 'markdown';
    const parserType = isLatex ? 'pandoc' : 'markdown-it';

    const parser = ParserFactory.create(parserType, {}, undefined, fromFormat);
    return parser.parse(content);
  }

  /**
   * Validate path and return absolute path if valid
   */
  private validatePath(relativePath: string): string | null {
    // Normalize path
    const normalized = path.normalize(relativePath);

    // Reject paths with '..'
    if (normalized.includes('..')) {
      return null;
    }

    // Create absolute path
    const absolutePath = path.join(this.options.rootPath, normalized);

    // Ensure path is within root
    if (!absolutePath.startsWith(this.options.rootPath)) {
      return null;
    }

    return absolutePath;
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
  broadcast(message: ServerMessage): void {
    const data = JSON.stringify(message);
    for (const [client] of this.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    }
  }

  /**
   * Serve folder mode HTML
   */
  private serveFolderModeHtml(
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
   * Render the folder mode template
   */
  private async renderTemplate(): Promise<string> {
    // Load template
    const templatePath = path.join(__dirname, '../../../templates/folder-mode.html');
    let template = await fs.readFile(templatePath, 'utf-8');

    // Load CSS
    const cssPath = path.join(__dirname, 'assets/folder-mode.css');
    const folderModeCss = await fs.readFile(cssPath, 'utf-8');

    // Load JS
    const jsPath = path.join(__dirname, 'assets/folder-mode.js');
    const folderModeJs = await fs.readFile(jsPath, 'utf-8');

    // Load theme CSS
    const themeCss = await ThemeManager.getCSS(this.options.theme);

    // Get folder name for display
    const folderName = path.basename(this.options.rootPath);

    // Replace placeholders
    template = template
      .replace('{{folder_name}}', this.escapeHtml(folderName))
      .replace('{{folder_mode_css}}', folderModeCss)
      .replace('{{theme_css}}', themeCss)
      .replace('{{folder_mode_js}}', folderModeJs);

    // Handle math support (enabled by default)
    template = template
      .replace(/\{\{#if math_enabled\}\}/g, '')
      .replace(/\{\{\/if\}\}/g, '');

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

  /**
   * Count total files in tree
   */
  private countFiles(nodes: TreeNode[]): number {
    let count = 0;
    for (const node of nodes) {
      if (node.type === 'file') {
        count++;
      } else {
        count += this.countFiles(node.children);
      }
    }
    return count;
  }
}
