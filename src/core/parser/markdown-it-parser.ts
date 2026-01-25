// src/core/parser/markdown-it-parser.ts

import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import strikethrough from 'markdown-it-strikethrough-alt';
import taskLists from 'markdown-it-task-lists';
import { Parser } from './types.js';
import { MathConfig } from '../../config/types.js';

/**
 * Markdown parser using markdown-it library.
 * Provides fast markdown to HTML conversion with GFM support.
 */
export class MarkdownItParser implements Parser {
  readonly name = 'markdown-it';
  private md: MarkdownIt;

  constructor(_mathConfig?: MathConfig) {
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

    // Note: For MathJax, we don't need a markdown-it plugin.
    // MathJax will find and render $...$ and $$...$$ in the browser.
    // The markdown-it-texmath plugin is for server-side KaTeX rendering,
    // which conflicts with client-side MathJax rendering.
  }

  /**
   * Convert markdown to HTML.
   * Math blocks ($$...$$) are protected from markdown-it processing
   * to preserve LaTeX syntax (especially backslashes).
   * @param markdown - The markdown content to convert
   * @returns The converted HTML string
   */
  async parse(markdown: string): Promise<string> {
    // Protect math blocks from markdown-it processing
    const mathBlocks: string[] = [];

    // Replace block math ($$...$$) with placeholders
    let processed = markdown.replace(/\$\$([\s\S]*?)\$\$/g, (match) => {
      mathBlocks.push(match);
      return `\n\n%%MATH_BLOCK_${mathBlocks.length - 1}%%\n\n`;
    });

    // Replace inline math ($...$) with placeholders
    // Be careful not to match $$ or currency amounts like $100
    const inlineMathBlocks: string[] = [];
    processed = processed.replace(/(?<!\$)\$(?!\$)([^\$\n]+?)\$(?!\$)/g, (match) => {
      inlineMathBlocks.push(match);
      return `%%INLINE_MATH_${inlineMathBlocks.length - 1}%%`;
    });

    // Process with markdown-it
    let html = this.md.render(processed);

    // Restore block math (wrap in div for centering)
    mathBlocks.forEach((block, i) => {
      html = html.replace(
        `%%MATH_BLOCK_${i}%%`,
        `<div class="math-block">${block}</div>`
      );
    });

    // Restore inline math
    inlineMathBlocks.forEach((block, i) => {
      html = html.replace(`%%INLINE_MATH_${i}%%`, block);
    });

    return html;
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
