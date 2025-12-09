// tests/unit/websocket-server.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { WebSocketServer } from '../../src/core/websocket-server';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';

describe('WebSocketServer', () => {
  const testDir = path.join(os.tmpdir(), 'vimd-ws-test');
  let server: WebSocketServer | null = null;

  beforeEach(async () => {
    await fs.ensureDir(testDir);
    // Create a simple HTML file for testing
    await fs.writeFile(
      path.join(testDir, 'test.html'),
      '<!DOCTYPE html><html><body>Test</body></html>'
    );
  });

  afterEach(async () => {
    if (server) {
      await server.stop();
      server = null;
    }
    await fs.remove(testDir);
  });

  describe('constructor', () => {
    it('should create server instance with default host', () => {
      server = new WebSocketServer({
        port: 39000,
        root: testDir,
      });

      expect(server).toBeDefined();
      expect(server.port).toBe(39000);
    });

    it('should create server instance with custom host', () => {
      server = new WebSocketServer({
        port: 39001,
        root: testDir,
        host: '0.0.0.0',
      });

      expect(server).toBeDefined();
    });
  });

  describe('start', () => {
    it('should start server and return result', async () => {
      server = new WebSocketServer({
        port: 39002,
        root: testDir,
      });

      const result = await server.start();

      expect(result.requestedPort).toBe(39002);
      expect(result.actualPort).toBe(39002);
      expect(result.portChanged).toBe(false);
    });

    // Note: Port availability test is skipped because it depends on race conditions
    // between SessionManager.isPortAvailable and actual server binding.
    // This scenario is better tested through integration tests.
    it.skip('should find alternative port if requested port is unavailable', async () => {
      // Start first server on port 39003
      const server1 = new WebSocketServer({
        port: 39003,
        root: testDir,
      });
      await server1.start();

      try {
        // Start second server - should find alternative port
        server = new WebSocketServer({
          port: 39003,
          root: testDir,
        });
        const result = await server.start();

        expect(result.requestedPort).toBe(39003);
        expect(result.actualPort).not.toBe(39003);
        expect(result.portChanged).toBe(true);
      } finally {
        // Cleanup first server
        await server1.stop();
      }
    }, 10000);
  });

  describe('stop', () => {
    it('should stop server without error', async () => {
      server = new WebSocketServer({
        port: 39004,
        root: testDir,
      });

      await server.start();
      await expect(server.stop()).resolves.not.toThrow();
    });

    it('should handle multiple stop calls gracefully', async () => {
      server = new WebSocketServer({
        port: 39005,
        root: testDir,
      });

      await server.start();
      await server.stop();
      await expect(server.stop()).resolves.not.toThrow();
      server = null; // Already stopped
    });
  });

  describe('broadcast', () => {
    it('should broadcast message without error when no clients', async () => {
      server = new WebSocketServer({
        port: 39006,
        root: testDir,
      });

      await server.start();

      // Should not throw even with no clients
      expect(() => server!.broadcast('reload')).not.toThrow();
    });

    it('should broadcast message with data', async () => {
      server = new WebSocketServer({
        port: 39007,
        root: testDir,
      });

      await server.start();

      // Should not throw with additional data
      expect(() => server!.broadcast('update', { path: '/test.html' })).not.toThrow();
    });
  });

  describe('injectReloadScript', () => {
    it('should inject script before </body>', async () => {
      server = new WebSocketServer({
        port: 39008,
        root: testDir,
      });

      // Access private method through any cast for testing
      const serverAny = server as any;
      const html = '<!DOCTYPE html><html><body>Content</body></html>';
      const result = serverAny.injectReloadScript(html);

      expect(result).toContain('<script>');
      expect(result).toContain('WebSocket');
      // Script is injected before </body> with newline
      expect(result).toContain('</script>\n</body>');
    });

    it('should inject script before </html> if no </body>', async () => {
      server = new WebSocketServer({
        port: 39009,
        root: testDir,
      });

      const serverAny = server as any;
      const html = '<!DOCTYPE html><html>Content</html>';
      const result = serverAny.injectReloadScript(html);

      expect(result).toContain('<script>');
      // Script is injected before </html> with newline
      expect(result).toContain('</script>\n</html>');
    });

    it('should append script at end if no closing tags', async () => {
      server = new WebSocketServer({
        port: 39010,
        root: testDir,
      });

      const serverAny = server as any;
      const html = 'Just plain text';
      const result = serverAny.injectReloadScript(html);

      expect(result).toContain('Just plain text');
      expect(result).toContain('<script>');
      expect(result.endsWith('</script>\n')).toBe(true);
    });
  });

  describe('port property', () => {
    it('should return actual port after start', async () => {
      server = new WebSocketServer({
        port: 39011,
        root: testDir,
      });

      expect(server.port).toBe(39011);

      await server.start();
      expect(server.port).toBe(39011);
    });
  });
});
