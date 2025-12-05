// src/utils/temp-manager.ts
import * as os from 'os';
import * as path from 'path';
import fs from 'fs-extra';
import { Logger } from './logger.js';

export class TempManager {
  static readonly BASE_DIR = 'vimd';
  static readonly SESSION_PREFIX = 'session-';
  static readonly MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Get the base directory for vimd temp files
   */
  static getBaseDir(): string {
    return path.join(os.tmpdir(), this.BASE_DIR);
  }

  /**
   * Create a unique session directory
   * @returns The path to the created session directory
   */
  static async createSessionDir(): Promise<string> {
    const baseDir = this.getBaseDir();
    await fs.ensureDir(baseDir);

    // Clean up old sessions before creating a new one
    await this.cleanupOldSessions();

    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const sessionName = `${this.SESSION_PREFIX}${timestamp}-${randomId}`;
    const sessionDir = path.join(baseDir, sessionName);

    await fs.ensureDir(sessionDir);
    return sessionDir;
  }

  /**
   * Clean up sessions older than MAX_AGE_MS
   */
  static async cleanupOldSessions(): Promise<void> {
    const baseDir = this.getBaseDir();

    if (!(await fs.pathExists(baseDir))) {
      return;
    }

    try {
      const entries = await fs.readdir(baseDir, { withFileTypes: true });
      const now = Date.now();

      for (const entry of entries) {
        if (!entry.isDirectory() || !entry.name.startsWith(this.SESSION_PREFIX)) {
          continue;
        }

        // Extract timestamp from session name
        const match = entry.name.match(/^session-(\d+)-/);
        if (!match) {
          continue;
        }

        const sessionTimestamp = parseInt(match[1], 10);
        const age = now - sessionTimestamp;

        if (age > this.MAX_AGE_MS) {
          const sessionPath = path.join(baseDir, entry.name);
          try {
            await fs.remove(sessionPath);
            Logger.info(`Cleaned up old session: ${entry.name}`);
          } catch {
            // Ignore errors when cleaning up individual sessions
          }
        }
      }
    } catch {
      // Ignore errors when listing directory
    }
  }

  /**
   * Remove a specific session directory
   * @param sessionDir The path to the session directory to remove
   */
  static async removeSessionDir(sessionDir: string): Promise<void> {
    if (!sessionDir) {
      return;
    }

    // Verify the directory is within our base directory
    const baseDir = this.getBaseDir();
    if (!sessionDir.startsWith(baseDir)) {
      return;
    }

    try {
      await fs.remove(sessionDir);
    } catch {
      // Ignore errors when removing session directory
    }
  }
}
