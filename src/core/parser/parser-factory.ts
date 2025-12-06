// src/core/parser/parser-factory.ts

import { Parser, ParserType } from './types.js';
import { MarkdownItParser } from './markdown-it-parser.js';
import { PandocParser } from './pandoc-parser.js';
import { PandocConfig } from '../../config/types.js';

/**
 * Factory for creating parser instances.
 * Provides methods to create parsers by type and with fallback support.
 */
export class ParserFactory {
  /**
   * Create a parser instance by type.
   * @param type - The type of parser to create
   * @param pandocConfig - Optional configuration for pandoc parser
   * @returns A parser instance
   * @throws Error if the parser type is unknown
   */
  static create(type: ParserType, pandocConfig?: Partial<PandocConfig>): Parser {
    switch (type) {
      case 'markdown-it':
        return new MarkdownItParser();
      case 'pandoc':
        return new PandocParser(pandocConfig);
      default:
        // TypeScript exhaustive check
        const _exhaustive: never = type;
        throw new Error(`Unknown parser type: ${_exhaustive}`);
    }
  }

  /**
   * Create a parser with fallback support.
   * If the preferred parser is not available, falls back to markdown-it.
   * @param preferred - The preferred parser type
   * @param pandocConfig - Optional configuration for pandoc parser
   * @returns A parser instance that is guaranteed to be available
   * @throws Error if pandoc is preferred but not installed (no silent fallback)
   */
  static async createWithFallback(
    preferred: ParserType,
    pandocConfig?: Partial<PandocConfig>
  ): Promise<Parser> {
    const parser = this.create(preferred, pandocConfig);

    if (await parser.isAvailable()) {
      return parser;
    }

    // If pandoc was requested but not available, throw an error
    // (we don't silently fall back to markdown-it for explicit pandoc requests)
    if (preferred === 'pandoc') {
      throw new Error(
        'pandoc is not installed. Please install pandoc or use markdown-it parser.'
      );
    }

    // For markdown-it, it's always available
    return parser;
  }

  /**
   * Get the default parser type for dev mode.
   * @returns 'markdown-it' as the default for fast preview
   */
  static getDefaultDevParser(): ParserType {
    return 'markdown-it';
  }

  /**
   * Get the default parser type for build mode.
   * @returns 'pandoc' as the default for high-quality output
   */
  static getDefaultBuildParser(): ParserType {
    return 'pandoc';
  }
}
