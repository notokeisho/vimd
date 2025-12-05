// src/utils/session-manager.ts
import fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import * as net from 'net';

export interface VimdSession {
  pid: number;
  port: number;
  htmlPath: string;
  sourcePath: string;
  startedAt: string;
}

export interface VimdSessions {
  [port: string]: VimdSession;
}

export interface CleanupResult {
  killed: boolean;
  htmlRemoved: boolean;
  previousPort?: number;
  previousSource?: string;
}

export class SessionManager {
  private static readonly SESSIONS_DIR = path.join(os.tmpdir(), 'vimd');
  private static readonly SESSIONS_FILE = path.join(
    SessionManager.SESSIONS_DIR,
    'sessions.json'
  );

  /**
   * Load all sessions from file
   */
  static async loadSessions(): Promise<VimdSessions> {
    try {
      if (await fs.pathExists(this.SESSIONS_FILE)) {
        return await fs.readJson(this.SESSIONS_FILE);
      }
    } catch {
      // Corrupted file, start fresh
    }
    return {};
  }

  /**
   * Save sessions to file
   */
  static async saveSessions(sessions: VimdSessions): Promise<void> {
    await fs.ensureDir(this.SESSIONS_DIR);
    await fs.writeJson(this.SESSIONS_FILE, sessions, { spaces: 2 });
  }

  /**
   * Get session for specific port
   */
  static async getSession(port: number): Promise<VimdSession | null> {
    const sessions = await this.loadSessions();
    return sessions[port.toString()] || null;
  }

  /**
   * Save session for specific port
   */
  static async saveSession(session: VimdSession): Promise<void> {
    const sessions = await this.loadSessions();
    sessions[session.port.toString()] = session;
    await this.saveSessions(sessions);
  }

  /**
   * Remove session for specific port
   */
  static async removeSession(port: number): Promise<void> {
    const sessions = await this.loadSessions();
    delete sessions[port.toString()];
    await this.saveSessions(sessions);
  }

  /**
   * Check if a process is alive
   */
  static isProcessAlive(pid: number): boolean {
    try {
      process.kill(pid, 0);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Kill a process safely
   */
  static async killProcess(pid: number): Promise<boolean> {
    try {
      process.kill(pid, 'SIGTERM');
      // Wait a bit for graceful shutdown
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Force kill if still alive
      if (this.isProcessAlive(pid)) {
        process.kill(pid, 'SIGKILL');
      }
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Clean up dead sessions (PIDs that no longer exist)
   */
  static async cleanDeadSessions(): Promise<number> {
    const sessions = await this.loadSessions();
    let cleaned = 0;

    for (const [port, session] of Object.entries(sessions)) {
      if (!this.isProcessAlive(session.pid)) {
        // Process is dead, clean up HTML if exists
        try {
          if (await fs.pathExists(session.htmlPath)) {
            await fs.remove(session.htmlPath);
          }
        } catch {
          // Ignore removal errors
        }
        delete sessions[port];
        cleaned++;
      }
    }

    if (cleaned > 0) {
      await this.saveSessions(sessions);
    }

    return cleaned;
  }

  /**
   * Clean up previous session on the same port
   */
  static async cleanupSessionOnPort(port: number): Promise<CleanupResult> {
    const session = await this.getSession(port);

    if (!session) {
      return { killed: false, htmlRemoved: false };
    }

    const result: CleanupResult = {
      killed: false,
      htmlRemoved: false,
      previousPort: port,
      previousSource: session.sourcePath,
    };

    // Kill process if alive
    if (this.isProcessAlive(session.pid)) {
      result.killed = await this.killProcess(session.pid);
    }

    // Remove HTML file
    try {
      if (await fs.pathExists(session.htmlPath)) {
        await fs.remove(session.htmlPath);
        result.htmlRemoved = true;
      }
    } catch {
      // Ignore removal errors
    }

    // Remove session from registry
    await this.removeSession(port);

    return result;
  }

  /**
   * Check if a port is available
   */
  static isPortAvailable(port: number): Promise<boolean> {
    return new Promise((resolve) => {
      const server = net.createServer();
      server.once('error', () => resolve(false));
      server.once('listening', () => {
        server.close();
        resolve(true);
      });
      server.listen(port, '127.0.0.1');
    });
  }

  /**
   * Find an available port starting from startPort
   */
  static async findAvailablePort(startPort: number): Promise<number> {
    const MAX_ATTEMPTS = 10;

    for (let i = 0; i < MAX_ATTEMPTS; i++) {
      const port = startPort + i;
      if (await this.isPortAvailable(port)) {
        return port;
      }
    }

    throw new Error(
      `No available port found (tried ${startPort}-${startPort + MAX_ATTEMPTS - 1})`
    );
  }
}
