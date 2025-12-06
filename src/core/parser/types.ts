// src/core/parser/types.ts

/**
 * Parser interface for markdown to HTML conversion.
 * Both markdown-it and pandoc parsers implement this interface.
 */
export interface Parser {
  /**
   * Convert markdown content to HTML.
   * @param markdown - The markdown content to convert
   * @returns The converted HTML string
   */
  parse(markdown: string): Promise<string>;

  /**
   * Check if the parser is available for use.
   * @returns true if the parser can be used
   */
  isAvailable(): Promise<boolean>;

  /**
   * The name of the parser.
   */
  readonly name: string;
}

/**
 * Available parser types.
 */
export type ParserType = 'markdown-it' | 'pandoc';
