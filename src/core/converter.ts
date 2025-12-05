// src/core/converter.ts
import { execSync } from 'child_process';
import { ConverterConfig } from '../config/types.js';
import { ThemeManager } from '../themes/index.js';
import * as fs from 'fs-extra';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class MarkdownConverter {
  constructor(private config: ConverterConfig) {}

  async convert(markdownPath: string): Promise<string> {
    const pandocArgs = this.buildPandocArgs();
    const command = `pandoc ${pandocArgs.join(' ')} "${markdownPath}"`;

    try {
      const html = execSync(command, {
        encoding: 'utf-8',
        maxBuffer: 10 * 1024 * 1024, // 10MB
      });

      return html;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to convert markdown: ${errorMessage}`);
    }
  }

  async convertWithTemplate(markdownPath: string): Promise<string> {
    const contentHtml = await this.convert(markdownPath);
    const themeCSS = await ThemeManager.getCSS(this.config.theme);

    let customCSS = '';
    if (this.config.customCSS) {
      customCSS = await ThemeManager.loadCustomCSS(this.config.customCSS);
    }

    const templatePath = this.config.template
      ? this.config.template
      : path.join(__dirname, '../../templates/default.html');

    const template = await fs.readFile(templatePath, 'utf-8');

    // Simple template replacement
    let html = template
      .replace('{{title}}', path.basename(markdownPath, '.md'))
      .replace('{{theme_css}}', themeCSS)
      .replace('{{content}}', contentHtml);

    if (customCSS) {
      html = html.replace('{{custom_css}}', customCSS);
    } else {
      html = html.replace(/\{\{#if custom_css\}\}[\s\S]*?\{\{\/if\}\}/g, '');
    }

    return html;
  }

  async writeHTML(html: string, outputPath: string): Promise<void> {
    await fs.ensureDir(path.dirname(outputPath));
    await fs.writeFile(outputPath, html, 'utf-8');
  }

  private buildPandocArgs(): string[] {
    const args: string[] = [];

    // Basic options
    args.push('--from=markdown');
    args.push('--to=html');

    if (this.config.pandocOptions.standalone) {
      args.push('--standalone');
    }

    if (this.config.pandocOptions.toc) {
      args.push('--toc');
      if (this.config.pandocOptions.tocDepth) {
        args.push(`--toc-depth=${this.config.pandocOptions.tocDepth}`);
      }
    }

    if (this.config.pandocOptions.highlightStyle) {
      args.push(`--highlight-style=${this.config.pandocOptions.highlightStyle}`);
    }

    // Metadata
    if (this.config.pandocOptions.metadata) {
      Object.entries(this.config.pandocOptions.metadata).forEach(([key, value]) => {
        args.push(`--metadata=${key}:"${value}"`);
      });
    }

    return args;
  }
}
