// src/cli/commands/kill.ts
import { SessionManager, VimdSession } from '../../utils/session-manager.js';
import { Logger } from '../../utils/logger.js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface KillOptions {
  all?: boolean;
  port?: string;
}

interface KillResult {
  port: number;
  pid: number;
  killed: boolean;
  htmlRemoved: boolean;
  reason?: string;
}

/**
 * Check if a PID belongs to a vimd/node process
 */
async function isVimdProcess(pid: number): Promise<boolean> {
  try {
    const { stdout } = await execAsync(`ps -p ${pid} -o comm=`);
    const processName = stdout.trim().toLowerCase();
    return processName.includes('node') || processName.includes('vimd');
  } catch {
    // Process doesn't exist
    return false;
  }
}

/**
 * Kill a single session with validation
 */
async function killSession(session: VimdSession): Promise<KillResult> {
  const result: KillResult = {
    port: session.port,
    pid: session.pid,
    killed: false,
    htmlRemoved: false,
  };

  // Check if process is alive
  if (!SessionManager.isProcessAlive(session.pid)) {
    result.reason = 'Process already dead';
    return result;
  }

  // Validate that this is a vimd process (PID safety check)
  const isVimd = await isVimdProcess(session.pid);
  if (!isVimd) {
    result.reason = 'PID reused by another process';
    return result;
  }

  // Kill the process
  result.killed = await SessionManager.killProcess(session.pid);

  return result;
}

export async function killCommand(options: KillOptions): Promise<void> {
  try {
    // Clean up dead sessions first
    const deadCleaned = await SessionManager.cleanDeadSessions();
    if (deadCleaned > 0) {
      Logger.info(`Cleaned ${deadCleaned} dead session(s)`);
    }

    // Load all sessions
    const sessions = await SessionManager.loadSessions();
    const sessionList = Object.values(sessions);

    if (sessionList.length === 0) {
      Logger.info('No active sessions found');
      return;
    }

    // Filter sessions if --port is specified
    let targetSessions: VimdSession[];
    if (options.port) {
      const port = parseInt(options.port, 10);
      const session = sessions[port.toString()];
      if (!session) {
        Logger.warn(`No session found on port ${port}`);
        return;
      }
      targetSessions = [session];
    } else {
      // Kill all sessions (default behavior, same as --all)
      targetSessions = sessionList;
    }

    Logger.info(`Found ${targetSessions.length} active session(s)`);

    // Kill each session
    const results: KillResult[] = [];
    let htmlRemovedCount = 0;

    for (const session of targetSessions) {
      const result = await killSession(session);

      // Remove HTML file regardless of kill result
      const cleanupResult = await SessionManager.cleanupSessionOnPort(
        session.port
      );
      result.htmlRemoved = cleanupResult.htmlRemoved;
      if (result.htmlRemoved) {
        htmlRemovedCount++;
      }

      results.push(result);

      // Log result
      if (result.killed) {
        Logger.success(`Killed session on port ${result.port} (PID: ${result.pid})`);
      } else if (result.reason) {
        Logger.info(`Port ${result.port}: ${result.reason}`);
      }
    }

    // Summary
    const killedCount = results.filter((r) => r.killed).length;
    if (killedCount > 0 || htmlRemovedCount > 0) {
      if (htmlRemovedCount > 0) {
        Logger.success(`Removed ${htmlRemovedCount} preview file(s)`);
      }
      Logger.success('All sessions terminated');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    Logger.error(`Failed to kill sessions: ${errorMessage}`);
    process.exit(1);
  }
}
