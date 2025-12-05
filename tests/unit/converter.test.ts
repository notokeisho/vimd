// tests/unit/converter.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MarkdownConverter } from '../../src/core/converter';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';

describe('MarkdownConverter', () => {
  const testDir = path.join(os.tmpdir(), 'vimd-converter-test');
  const testMdPath = path.join(testDir, 'test.md');
  const testHtmlPath = path.join(testDir, 'test.html');

  beforeEach(async () => {
    await fs.ensureDir(testDir);
    await fs.writeFile(testMdPath, '# Test\n\nHello **world**!');
  });

  afterEach(async () => {
    await fs.remove(testDir);
  });

  it('should create converter instance', () => {
    const converter = new MarkdownConverter({
      theme: 'github',
      pandocOptions: {
        standalone: true,
        toc: false,
      },
    });

    expect(converter).toBeDefined();
  });

  it('should convert markdown to HTML', async () => {
    const converter = new MarkdownConverter({
      theme: 'github',
      pandocOptions: {
        standalone: false,
        toc: false,
      },
    });

    const html = await converter.convert(testMdPath);

    expect(html).toContain('<h1');
    expect(html).toContain('Test');
    expect(html).toContain('<strong>world</strong>');
  });

  it('should write HTML to file', async () => {
    const converter = new MarkdownConverter({
      theme: 'github',
      pandocOptions: {
        standalone: false,
        toc: false,
      },
    });

    const html = await converter.convert(testMdPath);
    await converter.writeHTML(html, testHtmlPath);

    const exists = await fs.pathExists(testHtmlPath);
    expect(exists).toBe(true);

    const content = await fs.readFile(testHtmlPath, 'utf-8');
    expect(content).toContain('<h1');
  });

  it('should include theme CSS in output', async () => {
    const converter = new MarkdownConverter({
      theme: 'github',
      pandocOptions: {
        standalone: false,
        toc: false,
      },
    });

    const html = await converter.convertWithTemplate(testMdPath);

    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<style>');
  });

  it('should handle pandoc errors', async () => {
    const converter = new MarkdownConverter({
      theme: 'github',
      pandocOptions: {
        standalone: false,
        toc: false,
      },
    });

    await expect(
      converter.convert('/nonexistent/file.md')
    ).rejects.toThrow();
  });
});
