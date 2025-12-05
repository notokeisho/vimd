// src/cli/commands/dev.ts
import { ConfigLoader } from '../../config/loader.js';
import { FileWatcher } from '../../core/watcher.js';
import { MarkdownConverter } from '../../core/converter.js';
import { LiveServer } from '../../core/server.js';
import { PandocDetector } from '../../core/pandoc-detector.js';
import { Logger } from '../../utils/logger.js';
import { ProcessManager } from '../../utils/process-manager.js';
import { TempManager } from '../../utils/temp-manager.js';
import * as path from 'path';
import fs from 'fs-extra';

interface DevOptions {
  port?: string;
  theme?: string;
  open?: boolean;
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

    Logger.info(`Theme: ${config.theme}`);
    Logger.info(`Port: ${config.port}`);

    // 2. Check pandoc installation
    PandocDetector.ensureInstalled();

    // 3. Check file exists
    const absolutePath = path.resolve(filePath);
    if (!(await fs.pathExists(absolutePath))) {
      Logger.error(`File not found: ${filePath}`);
      process.exit(1);
    }

    // 4. Prepare output directory in system temp
    const outputDir = await TempManager.createSessionDir();
    const htmlPath = path.join(
      outputDir,
      path.basename(filePath, path.extname(filePath)) + '.html'
    );

    // 5. Prepare converter
    const converter = new MarkdownConverter({
      theme: config.theme,
      pandocOptions: config.pandoc,
      customCSS: config.css,
      template: config.template,
    });

    // 6. Initial conversion
    Logger.info('Converting markdown...');
    const html = await converter.convertWithTemplate(absolutePath);
    await converter.writeHTML(html, htmlPath);
    Logger.success('Conversion complete');

    // 7. Start live server
    const server = new LiveServer({
      port: config.port,
      host: config.host,
      open: config.open,
      root: outputDir,
    });

    await server.start(htmlPath);

    Logger.info(`Watching: ${filePath}`);
    Logger.info('Press Ctrl+C to stop');

    // 8. Start file watching
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

    // 9. Register cleanup
    ProcessManager.onExit(async () => {
      Logger.info('Shutting down...');
      await watcher.stop();
      await server.stop();
      await TempManager.removeSessionDir(outputDir);
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
