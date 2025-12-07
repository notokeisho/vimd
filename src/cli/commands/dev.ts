// src/cli/commands/dev.ts
import { ConfigLoader } from '../../config/loader.js';
import { FileWatcher } from '../../core/watcher.js';
import { MarkdownConverter } from '../../core/converter.js';
import { LiveServer } from '../../core/server.js';
import { PandocDetector } from '../../core/pandoc-detector.js';
import { ParserFactory } from '../../core/parser/index.js';
import { Logger } from '../../utils/logger.js';
import { ProcessManager } from '../../utils/process-manager.js';
import { SessionManager } from '../../utils/session-manager.js';
import * as path from 'path';
import fs from 'fs-extra';

interface DevOptions {
  port?: string;
  theme?: string;
  open?: boolean;
  pandoc?: boolean;
}

export async function devCommand(
  filePath: string,
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

    // 5. Determine parser type
    const parserType = options.pandoc ? 'pandoc' : config.devParser;
    Logger.info(`Parser: ${parserType}`);

    // 6. Check pandoc installation only if pandoc parser is selected
    if (parserType === 'pandoc') {
      PandocDetector.ensureInstalled();
    }

    // 7. Check file exists
    const absolutePath = path.resolve(filePath);
    if (!(await fs.pathExists(absolutePath))) {
      Logger.error(`File not found: ${filePath}`);
      process.exit(1);
    }

    // 8. Prepare output HTML in source directory
    const sourceDir = path.dirname(absolutePath);
    const basename = path.basename(filePath, path.extname(filePath));
    const htmlFileName = `vimd-preview-${basename}.html`;
    const htmlPath = path.join(sourceDir, htmlFileName);

    // 9. Prepare converter with selected parser
    const parser = ParserFactory.create(parserType, config.pandoc);
    const converter = new MarkdownConverter({
      theme: config.theme,
      pandocOptions: config.pandoc,
      customCSS: config.css,
      template: config.template,
    });
    converter.setParser(parser);

    // 10. Initial conversion
    Logger.info('Converting markdown...');
    const html = await converter.convertWithTemplate(absolutePath);
    await converter.writeHTML(html, htmlPath);
    Logger.success('Conversion complete');

    // 11. Start live server from source directory
    const server = new LiveServer({
      port: port,
      host: config.host,
      open: config.open,
      root: sourceDir,
    });

    const startResult = await server.start(htmlPath);

    // Update port if live-server used a different one
    const actualPort = startResult.actualPort;
    if (startResult.portChanged) {
      port = actualPort;
    }

    // 12. Save session with actual port
    await SessionManager.saveSession({
      pid: process.pid,
      port: actualPort,
      htmlPath: htmlPath,
      sourcePath: absolutePath,
      startedAt: new Date().toISOString(),
    });

    Logger.info(`Watching: ${filePath}`);
    Logger.info('Press Ctrl+C to stop');

    // 13. Start file watching
    const watcher = new FileWatcher(absolutePath, config.watch);

    watcher.onChange(async (changedPath) => {
      Logger.info('File changed, reconverting...');
      try {
        const newHtml = await converter.convertWithTemplate(changedPath);
        await converter.writeHTML(newHtml, htmlPath);
        Logger.success('Reconversion complete');
      } catch (error) {
        Logger.error('Reconversion failed');
        if (error instanceof Error) {
          Logger.error(error.message);
        }
      }
    });

    watcher.start();

    // 14. Register cleanup - remove generated HTML file and session
    ProcessManager.onExit(async () => {
      Logger.info('Shutting down...');
      await watcher.stop();
      await server.stop();

      // Remove the generated preview HTML file
      try {
        await fs.remove(htmlPath);
        Logger.info(`Removed: ${htmlFileName}`);
      } catch {
        // Ignore errors when removing file
      }

      // Remove session from registry (use actual port)
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
