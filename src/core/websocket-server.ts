// src/core/websocket-server.ts
import http from 'http';
import polka from 'polka';
import sirv from 'sirv';
import { WebSocketServer as WSServer, WebSocket } from 'ws';
import { Logger } from '../utils/logger.js';
import { SessionManager } from '../utils/session-manager.js';

/**
 * WebSocketServer options
 * Note: 'open' property is not included (handled by dev.ts)
 */
export interface WebSocketServerOptions {
  port: number;
  root: string;
  host?: string;
}

/**
 * Result of server start operation
 * Same interface as previous LiveServer for compatibility
 */
export interface ServerStartResult {
  actualPort: number;
  requestedPort: number;
  portChanged: boolean;
}

/**
 * WebSocket reload script injected into HTML
 * Features:
 * - Reconnection with max 5 retries (prevents infinite loop)
 * - Protocol detection for future HTTPS support
 */
const RELOAD_SCRIPT = `
<script>
(function() {
  var protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
  var ws = new WebSocket(protocol + '//' + location.host);

  ws.onmessage = function(event) {
    var data = JSON.parse(event.data);
    if (data.type === 'reload') {
      location.reload();
    }
  };

  ws.onclose = function() {
    var retries = 0;
    var maxRetries = 5;

    function reconnect() {
      if (retries++ >= maxRetries) {
        console.log('[vimd] Server disconnected. Please refresh manually.');
        return;
      }
      setTimeout(function() {
        var newWs = new WebSocket(protocol + '//' + location.host);
        newWs.onopen = function() { location.reload(); };
        newWs.onerror = reconnect;
      }, 1000);
    }
    reconnect();
  };
})();
</script>
`;

/**
 * WebSocket server for live reload functionality
 * Replaces live-server with direct WebSocket control
 */
export class WebSocketServer {
  private httpServer: http.Server | null = null;
  private wsServer: WSServer | null = null;
  private clients: Set<WebSocket> = new Set();
  private options: WebSocketServerOptions;
  private _port: number;

  constructor(options: WebSocketServerOptions) {
    this.options = {
      host: 'localhost',
      ...options,
    };
    this._port = options.port;
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

    // Check if port is available, find alternative if not
    if (!(await SessionManager.isPortAvailable(requestedPort))) {
      actualPort = await SessionManager.findAvailablePort(requestedPort + 1);
      Logger.warn(`Port ${requestedPort} was unavailable, using port ${actualPort}`);
    }

    this._port = actualPort;

    // Create static file server with sirv
    const serve = sirv(this.options.root, {
      dev: true, // Enable dev mode for no caching
    });

    // Create polka app with HTML injection middleware
    const app = polka();

    // Middleware to inject reload script into HTML
    app.use((req, res, next) => {
      // Only process GET requests for HTML files
      if (req.method !== 'GET' || !req.url?.endsWith('.html')) {
        return serve(req, res, next);
      }

      // For HTML files, we need to inject the script
      // Override res.end to modify the response
      const originalEnd = res.end.bind(res);
      let body = '';

      res.write = (chunk: any) => {
        body += chunk.toString();
        return true;
      };

      res.end = ((chunk?: any) => {
        if (chunk) {
          body += chunk.toString();
        }

        // Inject reload script before </body> or </html>
        const injectedBody = this.injectReloadScript(body);

        // Update Content-Length header
        const contentLength = Buffer.byteLength(injectedBody, 'utf8');
        res.setHeader('Content-Length', contentLength);

        return originalEnd(injectedBody);
      }) as typeof res.end;

      serve(req, res, next);
    });

    // Create HTTP server
    this.httpServer = http.createServer(app.handler as http.RequestListener);

    // Create WebSocket server attached to HTTP server
    this.wsServer = new WSServer({ server: this.httpServer });

    // Handle WebSocket connections
    this.wsServer.on('connection', (ws: WebSocket) => {
      this.clients.add(ws);
      Logger.info(`WebSocket client connected (${this.clients.size} total)`);

      ws.on('close', () => {
        this.clients.delete(ws);
        Logger.info(`WebSocket client disconnected (${this.clients.size} remaining)`);
      });

      ws.on('error', (error) => {
        Logger.warn(`WebSocket error: ${error.message}`);
        this.clients.delete(ws);
      });
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
    // Close all WebSocket connections
    for (const client of this.clients) {
      try {
        client.close();
      } catch {
        // Ignore close errors
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
      await new Promise<void>((resolve) => {
        this.httpServer!.close(() => resolve());
      });
      this.httpServer = null;
    }

    Logger.info('Server stopped');
  }

  /**
   * Broadcast a message to all connected clients
   */
  broadcast(type: string, data?: unknown): void {
    const message = JSON.stringify({ type, data });

    for (const client of this.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    }
  }

  /**
   * Inject reload script into HTML content
   */
  private injectReloadScript(html: string): string {
    // Try to inject before </body>
    if (html.includes('</body>')) {
      return html.replace('</body>', `${RELOAD_SCRIPT}</body>`);
    }

    // Fallback: inject before </html>
    if (html.includes('</html>')) {
      return html.replace('</html>', `${RELOAD_SCRIPT}</html>`);
    }

    // Last resort: append to the end
    return html + RELOAD_SCRIPT;
  }
}
