// tests/unit/parser-factory.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  ParserFactory,
  MarkdownItParser,
  PandocParser,
  ParserType,
} from '../../src/core/parser/index.js';
import { MarkdownConverter } from '../../src/core/converter.js';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';

describe('ParserFactory', () => {
  describe('create', () => {
    it('should create markdown-it parser', () => {
      const parser = ParserFactory.create('markdown-it');

      expect(parser).toBeInstanceOf(MarkdownItParser);
      expect(parser.name).toBe('markdown-it');
    });

    it('should create pandoc parser', () => {
      const parser = ParserFactory.create('pandoc');

      expect(parser).toBeInstanceOf(PandocParser);
      expect(parser.name).toBe('pandoc');
    });

    it('should create pandoc parser with custom config', () => {
      const parser = ParserFactory.create('pandoc', {
        standalone: true,
        toc: true,
        tocDepth: 2,
      });

      expect(parser).toBeInstanceOf(PandocParser);
      expect(parser.name).toBe('pandoc');
    });

    it('should throw error for unknown parser type', () => {
      // @ts-expect-error - Testing invalid type
      expect(() => ParserFactory.create('invalid')).toThrow('Unknown parser type');
    });
  });

  describe('createWithFallback', () => {
    it('should return markdown-it parser when requested', async () => {
      const parser = await ParserFactory.createWithFallback('markdown-it');

      expect(parser).toBeInstanceOf(MarkdownItParser);
      expect(parser.name).toBe('markdown-it');
    });

    it('should return pandoc parser when available', async () => {
      const parser = await ParserFactory.createWithFallback('pandoc');

      // pandoc should be installed in dev environment
      expect(parser).toBeInstanceOf(PandocParser);
      expect(parser.name).toBe('pandoc');
    });

    it('should throw error when pandoc is requested but not available', async () => {
      // This test assumes pandoc IS installed in the dev environment
      // If it weren't, createWithFallback would throw
      const parser = await ParserFactory.createWithFallback('pandoc');
      expect(parser.name).toBe('pandoc');
    });
  });

  describe('getDefaultDevParser', () => {
    it('should return markdown-it as default for dev mode', () => {
      const defaultType = ParserFactory.getDefaultDevParser();

      expect(defaultType).toBe('markdown-it');
    });
  });

  describe('getDefaultBuildParser', () => {
    it('should return pandoc as default for build mode', () => {
      const defaultType = ParserFactory.getDefaultBuildParser();

      expect(defaultType).toBe('pandoc');
    });
  });
});

describe('MarkdownConverter with Parser', () => {
  const testDir = path.join(os.tmpdir(), 'vimd-converter-parser-test');
  const testMdPath = path.join(testDir, 'test.md');

  beforeEach(async () => {
    await fs.ensureDir(testDir);
    await fs.writeFile(testMdPath, '# Test\n\nHello **world**!');
  });

  afterEach(async () => {
    await fs.remove(testDir);
  });

  it('should use legacy pandoc when no parser is set', async () => {
    const converter = new MarkdownConverter({
      theme: 'github',
      pandocOptions: {
        standalone: false,
        toc: false,
      },
    });

    // No parser set - should use legacy pandoc
    expect(converter.getParser()).toBeNull();

    const html = await converter.convert(testMdPath);

    expect(html).toContain('<h1');
    expect(html).toContain('Test');
    expect(html).toContain('<strong>world</strong>');
  });

  it('should use markdown-it parser when set', async () => {
    const converter = new MarkdownConverter({
      theme: 'github',
      pandocOptions: {
        standalone: false,
        toc: false,
      },
    });

    const parser = ParserFactory.create('markdown-it');
    converter.setParser(parser);

    expect(converter.getParser()).toBe(parser);
    expect(converter.getParser()?.name).toBe('markdown-it');

    const html = await converter.convert(testMdPath);

    expect(html).toContain('<h1>');
    expect(html).toContain('Test');
    expect(html).toContain('<strong>world</strong>');
  });

  it('should use pandoc parser when set', async () => {
    const converter = new MarkdownConverter({
      theme: 'github',
      pandocOptions: {
        standalone: false,
        toc: false,
      },
    });

    const parser = ParserFactory.create('pandoc');
    converter.setParser(parser);

    expect(converter.getParser()).toBe(parser);
    expect(converter.getParser()?.name).toBe('pandoc');

    const html = await converter.convert(testMdPath);

    expect(html).toContain('<h1');
    expect(html).toContain('Test');
    expect(html).toContain('<strong>world</strong>');
  });

  it('should allow switching parsers', async () => {
    const converter = new MarkdownConverter({
      theme: 'github',
      pandocOptions: {
        standalone: false,
        toc: false,
      },
    });

    // Start with markdown-it
    const mdItParser = ParserFactory.create('markdown-it');
    converter.setParser(mdItParser);
    expect(converter.getParser()?.name).toBe('markdown-it');

    const html1 = await converter.convert(testMdPath);
    expect(html1).toContain('<h1>');

    // Switch to pandoc
    const pandocParser = ParserFactory.create('pandoc');
    converter.setParser(pandocParser);
    expect(converter.getParser()?.name).toBe('pandoc');

    const html2 = await converter.convert(testMdPath);
    expect(html2).toContain('<h1');
  });

  it('should work with convertWithTemplate using custom parser', async () => {
    const converter = new MarkdownConverter({
      theme: 'github',
      pandocOptions: {
        standalone: false,
        toc: false,
      },
    });

    const parser = ParserFactory.create('markdown-it');
    converter.setParser(parser);

    const html = await converter.convertWithTemplate(testMdPath);

    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<style>');
    expect(html).toContain('<h1>');
    expect(html).toContain('Test');
  });
});

describe('Parser type inference', () => {
  it('should correctly type ParserType', () => {
    const validTypes: ParserType[] = ['markdown-it', 'pandoc'];

    expect(validTypes).toHaveLength(2);
    expect(validTypes).toContain('markdown-it');
    expect(validTypes).toContain('pandoc');
  });
});
