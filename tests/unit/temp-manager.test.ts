import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TempManager } from '../../src/utils/temp-manager.js';
import * as os from 'os';
import * as path from 'path';
import fs from 'fs-extra';

describe('TempManager', () => {
  const testBaseDir = path.join(os.tmpdir(), 'vimd-test');

  beforeEach(async () => {
    // Clean up test directory before each test
    await fs.remove(testBaseDir);
  });

  afterEach(async () => {
    // Clean up test directory after each test
    await fs.remove(testBaseDir);
    vi.restoreAllMocks();
  });

  describe('getBaseDir', () => {
    it('should return path in system temp directory', () => {
      const baseDir = TempManager.getBaseDir();
      expect(baseDir).toContain(os.tmpdir());
      expect(baseDir).toContain('vimd');
    });
  });

  describe('createSessionDir', () => {
    it('should create a session directory with correct naming', async () => {
      const sessionDir = await TempManager.createSessionDir();

      expect(await fs.pathExists(sessionDir)).toBe(true);
      expect(sessionDir).toContain('vimd');
      expect(sessionDir).toMatch(/session-\d+-[a-z0-9]+$/);

      // Cleanup
      await fs.remove(sessionDir);
    });

    it('should create unique session directories', async () => {
      const session1 = await TempManager.createSessionDir();
      const session2 = await TempManager.createSessionDir();

      expect(session1).not.toBe(session2);
      expect(await fs.pathExists(session1)).toBe(true);
      expect(await fs.pathExists(session2)).toBe(true);

      // Cleanup
      await fs.remove(session1);
      await fs.remove(session2);
    });
  });

  describe('cleanupOldSessions', () => {
    it('should remove sessions older than MAX_AGE_MS', async () => {
      const baseDir = TempManager.getBaseDir();
      await fs.ensureDir(baseDir);

      // Create an old session (25 hours ago)
      const oldTimestamp = Date.now() - 25 * 60 * 60 * 1000;
      const oldSessionDir = path.join(baseDir, `session-${oldTimestamp}-abc123`);
      await fs.ensureDir(oldSessionDir);
      await fs.writeFile(path.join(oldSessionDir, 'test.html'), 'test');

      // Create a recent session
      const recentTimestamp = Date.now() - 1 * 60 * 60 * 1000; // 1 hour ago
      const recentSessionDir = path.join(baseDir, `session-${recentTimestamp}-def456`);
      await fs.ensureDir(recentSessionDir);
      await fs.writeFile(path.join(recentSessionDir, 'test.html'), 'test');

      // Run cleanup
      await TempManager.cleanupOldSessions();

      // Old session should be removed
      expect(await fs.pathExists(oldSessionDir)).toBe(false);

      // Recent session should still exist
      expect(await fs.pathExists(recentSessionDir)).toBe(true);

      // Cleanup
      await fs.remove(recentSessionDir);
    });

    it('should ignore non-session directories', async () => {
      const baseDir = TempManager.getBaseDir();
      await fs.ensureDir(baseDir);

      // Create a non-session directory
      const otherDir = path.join(baseDir, 'other-directory');
      await fs.ensureDir(otherDir);

      // Run cleanup
      await TempManager.cleanupOldSessions();

      // Non-session directory should still exist
      expect(await fs.pathExists(otherDir)).toBe(true);

      // Cleanup
      await fs.remove(otherDir);
    });

    it('should handle non-existent base directory gracefully', async () => {
      // Remove base directory if it exists
      const baseDir = TempManager.getBaseDir();
      await fs.remove(baseDir);

      // Should not throw
      await expect(TempManager.cleanupOldSessions()).resolves.not.toThrow();
    });
  });

  describe('removeSessionDir', () => {
    it('should remove an existing session directory', async () => {
      const sessionDir = await TempManager.createSessionDir();
      await fs.writeFile(path.join(sessionDir, 'test.html'), 'test content');

      expect(await fs.pathExists(sessionDir)).toBe(true);

      await TempManager.removeSessionDir(sessionDir);

      expect(await fs.pathExists(sessionDir)).toBe(false);
    });

    it('should handle non-existent directory gracefully', async () => {
      const nonExistentDir = path.join(TempManager.getBaseDir(), 'session-nonexistent');

      // Should not throw
      await expect(TempManager.removeSessionDir(nonExistentDir)).resolves.not.toThrow();
    });

    it('should not remove directories outside vimd base dir', async () => {
      // Create a directory outside vimd
      const outsideDir = path.join(os.tmpdir(), 'outside-vimd-test');
      await fs.ensureDir(outsideDir);

      await TempManager.removeSessionDir(outsideDir);

      // Directory should still exist (not removed)
      expect(await fs.pathExists(outsideDir)).toBe(true);

      // Cleanup
      await fs.remove(outsideDir);
    });

    it('should handle empty string gracefully', async () => {
      await expect(TempManager.removeSessionDir('')).resolves.not.toThrow();
    });
  });

  describe('constants', () => {
    it('should have correct BASE_DIR', () => {
      expect(TempManager.BASE_DIR).toBe('vimd');
    });

    it('should have correct SESSION_PREFIX', () => {
      expect(TempManager.SESSION_PREFIX).toBe('session-');
    });

    it('should have MAX_AGE_MS set to 24 hours', () => {
      expect(TempManager.MAX_AGE_MS).toBe(24 * 60 * 60 * 1000);
    });
  });
});
