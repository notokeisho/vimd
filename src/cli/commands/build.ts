// src/cli/commands/build.ts
import { ConfigLoader } from '../../config/loader.js';
import { MarkdownConverter } from '../../core/converter.js';
import { PandocDetector } from '../../core/pandoc-detector.js';
import { Logger } from '../../utils/logger.js';
import * as path from 'path';
import fs from 'fs-extra';

interface BuildOptions {
  output?: string;
  theme?: string;
}

export async function buildCommand(
  filePath: string,
  options: BuildOptions
): Promise<void> {
  try {
    Logger.info('Building HTML...');

    // 1. Load configuration
    const config = await ConfigLoader.loadGlobal();

    // Override with command line options
    if (options.theme) {
      config.theme = options.theme as any;
    }

    Logger.info(`Theme: ${config.theme}`);

    // 2. Check pandoc installation
    PandocDetector.ensureInstalled();

    // 3. Check file exists
    const absolutePath = path.resolve(filePath);
    if (!(await fs.pathExists(absolutePath))) {
      Logger.error(`File not found: ${filePath}`);
      process.exit(1);
    }

    // 4. Determine output path
    const outputPath = options.output
      ? path.resolve(options.output)
      : path.join(
          path.dirname(absolutePath),
          path.basename(filePath, path.extname(filePath)) + '.html'
        );

    Logger.info(`Output: ${outputPath}`);

    // 5. Prepare converter
    const converter = new MarkdownConverter({
      theme: config.theme,
      pandocOptions: {
        ...config.pandoc,
        standalone: true, // build always uses standalone
      },
      customCSS: config.css,
      template: config.template || undefined,
    });

    // 6. Execute conversion
    Logger.info('Converting...');
    const html = await converter.convertWithTemplate(absolutePath);
    await converter.writeHTML(html, outputPath);

    Logger.success(`Build complete: ${outputPath}`);
  } catch (error) {
    Logger.error('Build failed');
    if (error instanceof Error) {
      Logger.error(error.message);
    }
    process.exit(1);
  }
}
