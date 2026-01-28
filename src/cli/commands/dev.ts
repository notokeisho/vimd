// src/cli/commands/dev.ts
import { ConfigLoader } from '../../config/loader.js';
import { SingleFileServer } from '../../core/single-file-server.js';
import { FolderModeServer } from '../../core/folder-mode/index.js';
import { PandocDetector } from '../../core/pandoc-detector.js';
import { Logger } from '../../utils/logger.js';
import { ProcessManager } from '../../utils/process-manager.js';
import { SessionManager } from '../../utils/session-manager.js';
import * as path from 'path';
import fs from 'fs-extra';
import open from 'open';

/**
 * Check if the file is a LaTeX file based on extension.
 */
function isLatexFile(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();
  return ext === '.tex' || ext === '.latex';
}

interface DevOptions {
  port?: string;
  theme?: string;
  open?: boolean;
  pandoc?: boolean;
}

export async function devCommand(
  targetPath: string,
  options: DevOptions
): Promise<void> {
  try {
    Logger.info('Starting vimd dev...');

    // 1. Load configuration
    const config = await ConfigLoader.loadGlobal();

    // Override with command line options
    if (options.port) {
      config.port = parseInt(options.port, 10);
    }
    if (options.theme) {
      config.theme = options.theme as any;
    }
    if (options.open !== undefined) {
      config.open = options.open;
    }

    let port = config.port;

    // 2. Clean dead sessions first
    const deadCleaned = await SessionManager.cleanDeadSessions();
    if (deadCleaned > 0) {
      Logger.info(`Cleaned ${deadCleaned} stale session(s)`);
    }

    // 3. Check and cleanup previous session on same port
    const cleanup = await SessionManager.cleanupSessionOnPort(port);
    if (cleanup.killed) {
      Logger.info(`Stopped previous session on port ${port}`);
    }
    if (cleanup.htmlRemoved) {
      Logger.info('Removed previous preview file');
    }

    // 4. Check if port is available (might be used by other app)
    if (!(await SessionManager.isPortAvailable(port))) {
      const newPort = await SessionManager.findAvailablePort(port + 1);
      Logger.warn(`Port ${port} is in use by another application`);
      Logger.info(`Using port ${newPort} instead`);
      port = newPort;
    }

    Logger.info(`Theme: ${config.theme}`);
    Logger.info(`Port: ${port}`);

    // 5. Check target exists and determine mode
    const absolutePath = path.resolve(targetPath);
    if (!(await fs.pathExists(absolutePath))) {
      Logger.error(`Path not found: ${targetPath}`);
      process.exit(1);
    }

    const stat = await fs.stat(absolutePath);

    // 6. Branch: Folder mode or Single file mode
    if (stat.isDirectory()) {
      await startFolderMode(absolutePath, port, config, options);
      return;
    }

    // Continue with single file mode
    const isLatex = isLatexFile(targetPath);
    if (isLatex) {
      Logger.info('Mode: LaTeX');
      // Check pandoc installation for LaTeX files
      PandocDetector.ensureInstalled(true);
    }

    // 7. Create and start SingleFileServer
    // Server handles conversion, watching, and WebSocket internally
    const server = new SingleFileServer({
      port: port,
      host: config.host,
      filePath: absolutePath,
      theme: config.theme,
      mathEnabled: config.math?.enabled ?? true,
      pandocOptions: config.pandoc,
      customCSS: config.css,
      watchOptions: config.watch,
    });

    const startResult = await server.start();
    const actualPort = startResult.actualPort;

    // 8. Open browser if configured
    if (config.open) {
      const url = `http://${config.host}:${actualPort}/`;
      try {
        await open(url);
        Logger.info('Browser opened');
      } catch {
        Logger.warn('Failed to open browser automatically');
      }
    }

    // 9. Save session (no HTML file in single file mode)
    await SessionManager.saveSession({
      pid: process.pid,
      port: actualPort,
      htmlPath: '', // No HTML file generated
      sourcePath: absolutePath,
      startedAt: new Date().toISOString(),
    });

    Logger.info('Press Ctrl+C to stop');

    // 10. Register cleanup
    ProcessManager.onExit(async () => {
      Logger.info('Shutting down...');
      await server.stop();
      await SessionManager.removeSession(actualPort);
      Logger.info('Cleanup complete');
    });
  } catch (error) {
    Logger.error('Failed to start dev server');
    if (error instanceof Error) {
      Logger.error(error.message);
    }
    process.exit(1);
  }
}

/**
 * Start folder mode server
 */
async function startFolderMode(
  folderPath: string,
  port: number,
  config: Awaited<ReturnType<typeof ConfigLoader.loadGlobal>>,
  _options: DevOptions
): Promise<void> {
  Logger.info('Mode: Folder');
  Logger.info(`Folder: ${folderPath}`);

  // Create folder mode server
  const server = new FolderModeServer({
    rootPath: folderPath,
    port: port,
    theme: config.theme,
    open: config.open,
  });

  const startResult = await server.start();
  const actualPort = startResult.actualPort;

  // Open browser if configured
  if (config.open) {
    const url = `http://localhost:${actualPort}/`;
    try {
      await open(url);
      Logger.info('Browser opened');
    } catch {
      Logger.warn('Failed to open browser automatically');
    }
  }

  // Save session
  await SessionManager.saveSession({
    pid: process.pid,
    port: actualPort,
    htmlPath: '', // No HTML file in folder mode
    sourcePath: folderPath,
    startedAt: new Date().toISOString(),
  });

  Logger.info('Press Ctrl+C to stop');

  // Register cleanup
  ProcessManager.onExit(async () => {
    Logger.info('Shutting down...');
    await server.stop();
    await SessionManager.removeSession(actualPort);
    Logger.info('Cleanup complete');
  });
}
