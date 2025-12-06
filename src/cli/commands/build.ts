// src/cli/commands/build.ts
import { ConfigLoader } from '../../config/loader.js';
import { MarkdownConverter } from '../../core/converter.js';
import { PandocDetector } from '../../core/pandoc-detector.js';
import { ParserFactory } from '../../core/parser/index.js';
import { Logger } from '../../utils/logger.js';
import * as path from 'path';
import fs from 'fs-extra';

interface BuildOptions {
  output?: string;
  theme?: string;
  fast?: boolean;
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

    // 2. Determine parser type
    const parserType = options.fast ? 'markdown-it' : config.buildParser;
    Logger.info(`Parser: ${parserType}`);

    // 3. Check pandoc installation only if pandoc parser is selected
    if (parserType === 'pandoc') {
      PandocDetector.ensureInstalled();
    }

    // 4. Check file exists
    const absolutePath = path.resolve(filePath);
    if (!(await fs.pathExists(absolutePath))) {
      Logger.error(`File not found: ${filePath}`);
      process.exit(1);
    }

    // 5. Determine output path
    const outputPath = options.output
      ? path.resolve(options.output)
      : path.join(
          path.dirname(absolutePath),
          path.basename(filePath, path.extname(filePath)) + '.html'
        );

    Logger.info(`Output: ${outputPath}`);

    // 6. Prepare converter with selected parser
    const pandocOptions = {
      ...config.pandoc,
      standalone: true, // build always uses standalone
    };
    const parser = ParserFactory.create(parserType, pandocOptions);
    const converter = new MarkdownConverter({
      theme: config.theme,
      pandocOptions: pandocOptions,
      customCSS: config.css,
      template: config.template || undefined,
    });
    converter.setParser(parser);

    // 7. Execute conversion
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
