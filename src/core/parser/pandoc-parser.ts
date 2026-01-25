// src/core/parser/pandoc-parser.ts

import { execSync } from 'child_process';
import { Parser } from './types.js';
import { MathConfig, PandocConfig } from '../../config/types.js';

/**
 * Source format for pandoc conversion.
 */
export type SourceFormat = 'markdown' | 'latex';

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
 * Document parser using pandoc.
 * Provides high-quality document to HTML conversion with extensive features.
 * Supports both Markdown and LaTeX source formats.
 */
export class PandocParser implements Parser {
  readonly name = 'pandoc';
  private config: PandocConfig;
  private mathConfig?: MathConfig;
  private fromFormat: SourceFormat;

  /**
   * Create a new PandocParser instance.
   * @param config - Pandoc configuration options
   * @param mathConfig - Math rendering configuration
   * @param fromFormat - Source format ('markdown' or 'latex')
   */
  constructor(
    config: Partial<PandocConfig> = {},
    mathConfig?: MathConfig,
    fromFormat: SourceFormat = 'markdown'
  ) {
    this.config = { ...DEFAULT_PANDOC_CONFIG, ...config };
    this.mathConfig = mathConfig;
    this.fromFormat = fromFormat;
  }

  /**
   * Convert document to HTML using pandoc.
   * @param content - The document content to convert
   * @returns The converted HTML string
   */
  async parse(content: string): Promise<string> {
    const pandocArgs = this.buildPandocArgs();
    const command = `pandoc ${pandocArgs.join(' ')}`;

    try {
      const html = execSync(command, {
        encoding: 'utf-8',
        input: content,
        maxBuffer: 10 * 1024 * 1024, // 10MB
      });

      return html;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to convert document with pandoc: ${errorMessage}`);
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
    args.push(`--from=${this.fromFormat}`);
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

    // Math support
    if (this.mathConfig?.enabled) {
      if (this.mathConfig.engine === 'mathjax') {
        args.push('--mathjax');
      } else if (this.mathConfig.engine === 'katex') {
        args.push('--katex');
      }
    }

    return args;
  }
}
