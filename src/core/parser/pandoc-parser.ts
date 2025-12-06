// src/core/parser/pandoc-parser.ts

import { execSync } from 'child_process';
import { Parser } from './types.js';
import { PandocConfig } from '../../config/types.js';

/**
 * Default pandoc configuration for high-quality HTML output.
 */
const DEFAULT_PANDOC_CONFIG: PandocConfig = {
  standalone: false,
  toc: false,
  tocDepth: 3,
  highlightStyle: 'pygments',
};

/**
 * Markdown parser using pandoc.
 * Provides high-quality markdown to HTML conversion with extensive features.
 */
export class PandocParser implements Parser {
  readonly name = 'pandoc';
  private config: PandocConfig;

  constructor(config: Partial<PandocConfig> = {}) {
    this.config = { ...DEFAULT_PANDOC_CONFIG, ...config };
  }

  /**
   * Convert markdown to HTML using pandoc.
   * @param markdown - The markdown content to convert
   * @returns The converted HTML string
   */
  async parse(markdown: string): Promise<string> {
    const pandocArgs = this.buildPandocArgs();
    const command = `pandoc ${pandocArgs.join(' ')}`;

    try {
      const html = execSync(command, {
        encoding: 'utf-8',
        input: markdown,
        maxBuffer: 10 * 1024 * 1024, // 10MB
      });

      return html;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to convert markdown with pandoc: ${errorMessage}`);
    }
  }

  /**
   * Check if pandoc is available.
   * @returns true if pandoc is installed and accessible
   */
  async isAvailable(): Promise<boolean> {
    try {
      execSync('pandoc --version', { stdio: 'pipe' });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Build pandoc command arguments from config.
   */
  private buildPandocArgs(): string[] {
    const args: string[] = [];

    // Basic options
    args.push('--from=markdown');
    args.push('--to=html');

    if (this.config.standalone) {
      args.push('--standalone');
    }

    if (this.config.toc) {
      args.push('--toc');
      if (this.config.tocDepth) {
        args.push(`--toc-depth=${this.config.tocDepth}`);
      }
    }

    if (this.config.highlightStyle) {
      args.push(`--syntax-highlighting=${this.config.highlightStyle}`);
    }

    // Metadata
    if (this.config.metadata) {
      Object.entries(this.config.metadata).forEach(([key, value]) => {
        args.push(`--metadata=${key}:"${value}"`);
      });
    }

    return args;
  }
}
