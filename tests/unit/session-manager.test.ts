// tests/unit/session-manager.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SessionManager, VimdSession } from '../../src/utils/session-manager';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

describe('SessionManager', () => {
  const testSessionsDir = path.join(os.tmpdir(), 'vimd-test');
  const testSessionsFile = path.join(testSessionsDir, 'sessions.json');

  beforeEach(async () => {
    // Clean up test directory before each test
    await fs.remove(testSessionsDir);
  });

  afterEach(async () => {
    // Clean up test directory after each test
    await fs.remove(testSessionsDir);
  });

  describe('loadSessions', () => {
    it('should return empty object when no file exists', async () => {
      const sessions = await SessionManager.loadSessions();
      expect(sessions).toEqual({});
    });
  });

  describe('isPortAvailable', () => {
    it('should return true for unused port', async () => {
      // Using a high port number that is likely unused
      const available = await SessionManager.isPortAvailable(19999);
      expect(available).toBe(true);
    });
  });

  describe('findAvailablePort', () => {
    it('should find an available port', async () => {
      const port = await SessionManager.findAvailablePort(18000);
      expect(port).toBeGreaterThanOrEqual(18000);
    });
  });

  describe('isProcessAlive', () => {
    it('should return true for current process', () => {
      expect(SessionManager.isProcessAlive(process.pid)).toBe(true);
    });

    it('should return false for non-existent PID', () => {
      // Using a very high PID that is unlikely to exist
      expect(SessionManager.isProcessAlive(999999)).toBe(false);
    });
  });

  describe('session CRUD operations', () => {
    it('should save and retrieve a session', async () => {
      const testPort = 19001;
      const session: VimdSession = {
        pid: process.pid,
        port: testPort,
        htmlPath: '/tmp/test.html',
        sourcePath: '/tmp/test.md',
        startedAt: new Date().toISOString(),
      };

      await SessionManager.saveSession(session);
      const retrieved = await SessionManager.getSession(testPort);

      expect(retrieved).not.toBeNull();
      expect(retrieved?.pid).toBe(session.pid);
      expect(retrieved?.port).toBe(session.port);
      expect(retrieved?.htmlPath).toBe(session.htmlPath);
      expect(retrieved?.sourcePath).toBe(session.sourcePath);

      // Clean up
      await SessionManager.removeSession(testPort);
    });

    it('should return null for non-existent session', async () => {
      const session = await SessionManager.getSession(59999);
      expect(session).toBeNull();
    });

    it('should remove a session', async () => {
      const testPort = 19002;
      const session: VimdSession = {
        pid: process.pid,
        port: testPort,
        htmlPath: '/tmp/test.html',
        sourcePath: '/tmp/test.md',
        startedAt: new Date().toISOString(),
      };

      await SessionManager.saveSession(session);
      await SessionManager.removeSession(testPort);
      const retrieved = await SessionManager.getSession(testPort);

      expect(retrieved).toBeNull();
    });
  });

  describe('cleanupSessionOnPort', () => {
    it('should return empty result when no session exists', async () => {
      const result = await SessionManager.cleanupSessionOnPort(49999);
      expect(result.killed).toBe(false);
      expect(result.htmlRemoved).toBe(false);
    });
  });

  describe('cleanDeadSessions', () => {
    it('should clean sessions with dead PIDs', async () => {
      // Use a unique port for this test
      const testPort = 19080;
      // Create a session with a non-existent PID
      const session: VimdSession = {
        pid: 999999, // Non-existent PID
        port: testPort,
        htmlPath: '/tmp/nonexistent.html',
        sourcePath: '/tmp/test.md',
        startedAt: new Date().toISOString(),
      };

      await SessionManager.saveSession(session);
      const cleaned = await SessionManager.cleanDeadSessions();

      expect(cleaned).toBeGreaterThanOrEqual(1);

      // Verify session was removed
      const retrieved = await SessionManager.getSession(testPort);
      expect(retrieved).toBeNull();
    });

    it('should not clean sessions with alive PIDs', async () => {
      // Use a unique port for this test
      const testPort = 19081;
      // Create a session with current process PID
      const session: VimdSession = {
        pid: process.pid,
        port: testPort,
        htmlPath: '/tmp/test.html',
        sourcePath: '/tmp/test.md',
        startedAt: new Date().toISOString(),
      };

      await SessionManager.saveSession(session);

      // Verify session was saved
      const beforeClean = await SessionManager.getSession(testPort);
      expect(beforeClean).not.toBeNull();

      const cleaned = await SessionManager.cleanDeadSessions();

      // This session should not have been cleaned
      expect(cleaned).toBe(0);

      // Verify session still exists
      const retrieved = await SessionManager.getSession(testPort);
      expect(retrieved).not.toBeNull();

      // Clean up
      await SessionManager.removeSession(testPort);
    });
  });

  describe('multiple sessions', () => {
    it('should handle multiple sessions on different ports', async () => {
      const testPort1 = 19101;
      const testPort2 = 19102;
      const session1: VimdSession = {
        pid: process.pid,
        port: testPort1,
        htmlPath: '/tmp/test1.html',
        sourcePath: '/tmp/test1.md',
        startedAt: new Date().toISOString(),
      };

      const session2: VimdSession = {
        pid: process.pid,
        port: testPort2,
        htmlPath: '/tmp/test2.html',
        sourcePath: '/tmp/test2.md',
        startedAt: new Date().toISOString(),
      };

      await SessionManager.saveSession(session1);
      await SessionManager.saveSession(session2);

      const retrieved1 = await SessionManager.getSession(testPort1);
      const retrieved2 = await SessionManager.getSession(testPort2);

      expect(retrieved1).not.toBeNull();
      expect(retrieved2).not.toBeNull();
      expect(retrieved1?.port).toBe(testPort1);
      expect(retrieved2?.port).toBe(testPort2);

      // Clean up
      await SessionManager.removeSession(testPort1);
      await SessionManager.removeSession(testPort2);
    });
  });
});
