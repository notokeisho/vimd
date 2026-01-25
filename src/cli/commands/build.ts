// src/cli/commands/build.ts
import { ConfigLoader } from '../../config/loader.js';
import { MarkdownConverter } from '../../core/converter.js';
import { PandocDetector } from '../../core/pandoc-detector.js';
import { ParserFactory } from '../../core/parser/index.js';
import { SourceFormat } from '../../core/parser/pandoc-parser.js';
import { Logger } from '../../utils/logger.js';
import * as path from 'path';
import fs from 'fs-extra';

/**
 * Check if the file is a LaTeX file based on extension.
 */
function isLatexFile(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();
  return ext === '.tex' || ext === '.latex';
}

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

    // 2. Check file exists first (needed for extension detection)
    const absolutePath = path.resolve(filePath);
    if (!(await fs.pathExists(absolutePath))) {
      Logger.error(`File not found: ${filePath}`);
      process.exit(1);
    }

    // 3. Detect file type and determine parser/format
    const isLatex = isLatexFile(filePath);
    const fromFormat: SourceFormat = isLatex ? 'latex' : 'markdown';

    // 4. Determine parser type (LaTeX requires pandoc, --fast is ignored for LaTeX)
    const parserType = isLatex ? 'pandoc' : (options.fast ? 'markdown-it' : config.buildParser);
    Logger.info(`Parser: ${parserType}`);
    if (isLatex) {
      Logger.info('Mode: LaTeX');
    }

    // 5. Check pandoc installation (required for pandoc parser or LaTeX files)
    if (parserType === 'pandoc') {
      PandocDetector.ensureInstalled(isLatex);
    }

    // 6. Determine output path
    const outputPath = options.output
      ? path.resolve(options.output)
      : path.join(
          path.dirname(absolutePath),
          path.basename(filePath, path.extname(filePath)) + '.html'
        );

    Logger.info(`Output: ${outputPath}`);

    // 7. Prepare converter with selected parser
    const parser = ParserFactory.create(parserType, config.pandoc, config.math, fromFormat);
    const converter = new MarkdownConverter({
      theme: config.theme,
      pandocOptions: config.pandoc,
      customCSS: config.css,
      template: config.template || undefined,
      mathEnabled: config.math?.enabled ?? true,
    });
    converter.setParser(parser);

    // 8. Execute conversion
    Logger.info(`Converting ${isLatex ? 'LaTeX' : 'markdown'}...`);
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
