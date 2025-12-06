// src/core/parser/markdown-it-parser.ts

import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import strikethrough from 'markdown-it-strikethrough-alt';
import taskLists from 'markdown-it-task-lists';
import { Parser } from './types.js';

/**
 * Markdown parser using markdown-it library.
 * Provides fast markdown to HTML conversion with GFM support.
 */
export class MarkdownItParser implements Parser {
  readonly name = 'markdown-it';
  private md: MarkdownIt;

  constructor() {
    this.md = new MarkdownIt({
      html: true,
      linkify: true,
      typographer: true,
      highlight: (str: string, lang: string): string => {
        if (lang && hljs.getLanguage(lang)) {
          try {
            return hljs.highlight(str, { language: lang }).value;
          } catch {
            // Ignore highlight errors
          }
        }
        return ''; // Use external default escaping
      },
    });

    // Enable GFM plugins
    this.md.use(strikethrough); // ~~strikethrough~~
    this.md.use(taskLists); // - [ ] task list
  }

  /**
   * Convert markdown to HTML.
   * @param markdown - The markdown content to convert
   * @returns The converted HTML string
   */
  async parse(markdown: string): Promise<string> {
    return this.md.render(markdown);
  }

  /**
   * Check if the parser is available.
   * markdown-it is always available as it's an npm package.
   * @returns Always returns true
   */
  async isAvailable(): Promise<boolean> {
    return true;
  }
}
