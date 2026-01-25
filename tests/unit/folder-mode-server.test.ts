import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FolderModeServer } from '../../src/core/folder-mode/folder-mode-server.js';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

// Mock dependencies
vi.mock('../../src/utils/logger.js', () => ({
  Logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock('../../src/utils/session-manager.js', () => ({
  SessionManager: {
    isPortAvailable: vi.fn().mockResolvedValue(true),
    findAvailablePort: vi.fn().mockResolvedValue(38081),
  },
}));

describe('FolderModeServer', () => {
  let testDir: string;
  let server: FolderModeServer;

  beforeEach(async () => {
    // Create temporary test directory
    testDir = path.join(os.tmpdir(), `vimd-test-${Date.now()}`);
    await fs.ensureDir(testDir);

    // Create test files
    await fs.writeFile(path.join(testDir, 'test.md'), '# Test');
    await fs.writeFile(path.join(testDir, 'readme.md'), '# Readme');
    await fs.ensureDir(path.join(testDir, 'docs'));
    await fs.writeFile(path.join(testDir, 'docs', 'guide.md'), '# Guide');
  });

  afterEach(async () => {
    // Stop server if running
    if (server) {
      await server.stop();
    }
    // Clean up test directory
    await fs.remove(testDir);
  });

  describe('constructor', () => {
    it('should create server with options', () => {
      server = new FolderModeServer({
        rootPath: testDir,
        port: 38080,
        theme: 'github',
      });

      expect(server.port).toBe(38080);
      expect(server.rootPath).toBe(testDir);
    });
  });

  describe('start', () => {
    it('should start server and return result', async () => {
      server = new FolderModeServer({
        rootPath: testDir,
        port: 39100,
        theme: 'github',
      });

      const result = await server.start();

      expect(result.actualPort).toBe(39100);
      expect(result.requestedPort).toBe(39100);
      expect(result.portChanged).toBe(false);
    });

    it('should find available port if requested port is unavailable', async () => {
      const { SessionManager } = await import('../../src/utils/session-manager.js');
      vi.mocked(SessionManager.isPortAvailable).mockResolvedValueOnce(false);
      vi.mocked(SessionManager.findAvailablePort).mockResolvedValueOnce(39101);

      server = new FolderModeServer({
        rootPath: testDir,
        port: 39100,
        theme: 'github',
      });

      const result = await server.start();

      expect(result.actualPort).toBe(39101);
      expect(result.requestedPort).toBe(39100);
      expect(result.portChanged).toBe(true);
    });
  });

  describe('stop', () => {
    it('should stop server without error', async () => {
      server = new FolderModeServer({
        rootPath: testDir,
        port: 39102,
        theme: 'github',
      });

      await server.start();
      await expect(server.stop()).resolves.not.toThrow();
    });

    it('should handle multiple stop calls gracefully', async () => {
      server = new FolderModeServer({
        rootPath: testDir,
        port: 39103,
        theme: 'github',
      });

      await server.start();
      await server.stop();
      await expect(server.stop()).resolves.not.toThrow();
    });
  });

  describe('port property', () => {
    it('should return actual port after start', async () => {
      server = new FolderModeServer({
        rootPath: testDir,
        port: 39104,
        theme: 'github',
      });

      await server.start();
      expect(server.port).toBe(39104);
    });
  });

  describe('rootPath property', () => {
    it('should return root path', () => {
      server = new FolderModeServer({
        rootPath: testDir,
        port: 39105,
        theme: 'github',
      });

      expect(server.rootPath).toBe(testDir);
    });
  });

  describe('broadcast', () => {
    it('should broadcast message without error when no clients', async () => {
      server = new FolderModeServer({
        rootPath: testDir,
        port: 39106,
        theme: 'github',
      });

      await server.start();
      expect(() => server.broadcast({ type: 'reload' })).not.toThrow();
    });
  });
});
