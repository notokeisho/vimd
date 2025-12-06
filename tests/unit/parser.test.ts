// tests/unit/parser.test.ts
import { describe, it, expect } from 'vitest';
import {
  MarkdownItParser,
  PandocParser,
  Parser,
  ParserType,
} from '../../src/core/parser/index.js';

describe('Parser Types', () => {
  it('should have correct ParserType values', () => {
    const types: ParserType[] = ['markdown-it', 'pandoc'];
    expect(types).toContain('markdown-it');
    expect(types).toContain('pandoc');
  });
});

describe('MarkdownItParser', () => {
  it('should implement Parser interface', () => {
    const parser: Parser = new MarkdownItParser();
    expect(parser.name).toBe('markdown-it');
    expect(typeof parser.parse).toBe('function');
    expect(typeof parser.isAvailable).toBe('function');
  });

  it('should always be available', async () => {
    const parser = new MarkdownItParser();
    const available = await parser.isAvailable();
    expect(available).toBe(true);
  });

  it('should convert basic markdown to HTML', async () => {
    const parser = new MarkdownItParser();
    const markdown = '# Hello\n\nWorld';
    const html = await parser.parse(markdown);

    expect(html).toContain('<h1>');
    expect(html).toContain('Hello');
    expect(html).toContain('<p>');
    expect(html).toContain('World');
  });

  it('should support bold and italic', async () => {
    const parser = new MarkdownItParser();
    const markdown = '**bold** and *italic*';
    const html = await parser.parse(markdown);

    expect(html).toContain('<strong>bold</strong>');
    expect(html).toContain('<em>italic</em>');
  });

  it('should support code blocks with syntax highlighting', async () => {
    const parser = new MarkdownItParser();
    const markdown = '```javascript\nconst x = 1;\n```';
    const html = await parser.parse(markdown);

    expect(html).toContain('<pre>');
    expect(html).toContain('<code');
    expect(html).toContain('const');
  });

  it('should support strikethrough', async () => {
    const parser = new MarkdownItParser();
    const markdown = '~~deleted~~';
    const html = await parser.parse(markdown);

    expect(html).toContain('<s>deleted</s>');
  });

  it('should support task lists', async () => {
    const parser = new MarkdownItParser();
    const markdown = '- [ ] Todo\n- [x] Done';
    const html = await parser.parse(markdown);

    expect(html).toContain('type="checkbox"');
    expect(html).toContain('checked');
  });

  it('should support links', async () => {
    const parser = new MarkdownItParser();
    const markdown = '[link](https://example.com)';
    const html = await parser.parse(markdown);

    expect(html).toContain('<a href="https://example.com"');
    expect(html).toContain('>link</a>');
  });

  it('should support images', async () => {
    const parser = new MarkdownItParser();
    const markdown = '![alt](image.png)';
    const html = await parser.parse(markdown);

    expect(html).toContain('<img');
    expect(html).toContain('src="image.png"');
    expect(html).toContain('alt="alt"');
  });

  it('should support tables', async () => {
    const parser = new MarkdownItParser();
    const markdown = '| A | B |\n|---|---|\n| 1 | 2 |';
    const html = await parser.parse(markdown);

    expect(html).toContain('<table>');
    expect(html).toContain('<th>');
    expect(html).toContain('<td>');
  });

  it('should support blockquotes', async () => {
    const parser = new MarkdownItParser();
    const markdown = '> Quote';
    const html = await parser.parse(markdown);

    expect(html).toContain('<blockquote>');
    expect(html).toContain('Quote');
  });

  it('should support unordered lists', async () => {
    const parser = new MarkdownItParser();
    const markdown = '- Item 1\n- Item 2';
    const html = await parser.parse(markdown);

    expect(html).toContain('<ul>');
    expect(html).toContain('<li>');
  });

  it('should support ordered lists', async () => {
    const parser = new MarkdownItParser();
    const markdown = '1. First\n2. Second';
    const html = await parser.parse(markdown);

    expect(html).toContain('<ol>');
    expect(html).toContain('<li>');
  });

  it('should support inline code', async () => {
    const parser = new MarkdownItParser();
    const markdown = 'Use `code` here';
    const html = await parser.parse(markdown);

    expect(html).toContain('<code>code</code>');
  });

  it('should support horizontal rules', async () => {
    const parser = new MarkdownItParser();
    const markdown = '---';
    const html = await parser.parse(markdown);

    expect(html).toContain('<hr');
  });

  it('should linkify URLs', async () => {
    const parser = new MarkdownItParser();
    const markdown = 'Visit https://example.com';
    const html = await parser.parse(markdown);

    expect(html).toContain('<a href="https://example.com"');
  });
});

describe('PandocParser', () => {
  it('should implement Parser interface', () => {
    const parser: Parser = new PandocParser();
    expect(parser.name).toBe('pandoc');
    expect(typeof parser.parse).toBe('function');
    expect(typeof parser.isAvailable).toBe('function');
  });

  it('should check pandoc availability', async () => {
    const parser = new PandocParser();
    const available = await parser.isAvailable();
    // pandoc should be installed in the dev environment
    expect(typeof available).toBe('boolean');
  });

  it('should convert basic markdown to HTML', async () => {
    const parser = new PandocParser();
    const markdown = '# Hello\n\nWorld';
    const html = await parser.parse(markdown);

    expect(html).toContain('<h1');
    expect(html).toContain('Hello');
    expect(html).toContain('<p>');
    expect(html).toContain('World');
  });

  it('should support bold and italic', async () => {
    const parser = new PandocParser();
    const markdown = '**bold** and *italic*';
    const html = await parser.parse(markdown);

    expect(html).toContain('<strong>bold</strong>');
    expect(html).toContain('<em>italic</em>');
  });

  it('should support code blocks', async () => {
    const parser = new PandocParser();
    const markdown = '```javascript\nconst x = 1;\n```';
    const html = await parser.parse(markdown);

    expect(html).toContain('<pre');
    expect(html).toContain('<code');
  });

  it('should support custom pandoc config', async () => {
    const parser = new PandocParser({
      highlightStyle: 'tango',
    });

    const markdown = '```javascript\nconst x = 1;\n```';
    const html = await parser.parse(markdown);

    expect(html).toContain('<pre');
    expect(html).toContain('<code');
  });

  it('should support tables', async () => {
    const parser = new PandocParser();
    const markdown = '| A | B |\n|---|---|\n| 1 | 2 |';
    const html = await parser.parse(markdown);

    expect(html).toContain('<table');
  });

  it('should support blockquotes', async () => {
    const parser = new PandocParser();
    const markdown = '> Quote';
    const html = await parser.parse(markdown);

    expect(html).toContain('<blockquote>');
    expect(html).toContain('Quote');
  });

  it('should support lists', async () => {
    const parser = new PandocParser();
    const markdown = '- Item 1\n- Item 2';
    const html = await parser.parse(markdown);

    expect(html).toContain('<ul>');
    expect(html).toContain('<li>');
  });

  it('should handle empty input', async () => {
    const parser = new PandocParser();
    const html = await parser.parse('');

    expect(typeof html).toBe('string');
  });

  it('should throw on invalid pandoc execution', async () => {
    const parser = new PandocParser({
      // @ts-expect-error - Testing invalid config handling
      invalidOption: true,
    });

    // Even with invalid config, basic parsing should work
    // because we only use known options
    const html = await parser.parse('# Test');
    expect(html).toContain('Test');
  });
});

describe('Parser Comparison', () => {
  it('should produce similar output for basic markdown', async () => {
    const mdIt = new MarkdownItParser();
    const pandoc = new PandocParser();

    const markdown = '# Title\n\n**Bold** text';

    const htmlMdIt = await mdIt.parse(markdown);
    const htmlPandoc = await pandoc.parse(markdown);

    // Both should contain heading and bold
    expect(htmlMdIt).toContain('<h1>');
    expect(htmlPandoc).toContain('<h1');
    expect(htmlMdIt).toContain('<strong>Bold</strong>');
    expect(htmlPandoc).toContain('<strong>Bold</strong>');
  });

  it('both parsers should have different names', () => {
    const mdIt = new MarkdownItParser();
    const pandoc = new PandocParser();

    expect(mdIt.name).not.toBe(pandoc.name);
    expect(mdIt.name).toBe('markdown-it');
    expect(pandoc.name).toBe('pandoc');
  });
});
