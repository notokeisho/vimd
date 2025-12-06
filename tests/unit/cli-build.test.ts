// tests/unit/cli-build.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { buildCommand } from '../../src/cli/commands/build.js';
import { ConfigLoader } from '../../src/config/loader.js';
import { MarkdownConverter } from '../../src/core/converter.js';
import { PandocDetector } from '../../src/core/pandoc-detector.js';
import { ParserFactory } from '../../src/core/parser/index.js';
import { Logger } from '../../src/utils/logger.js';
import fs from 'fs-extra';

vi.mock('../../src/config/loader.js');
vi.mock('../../src/core/converter.js');
vi.mock('../../src/core/pandoc-detector.js');
vi.mock('../../src/core/parser/index.js');
vi.mock('../../src/utils/logger.js');
vi.mock('fs-extra');

describe('buildCommand', () => {
  const mockConfig = {
    theme: 'github',
    pandoc: { standalone: false },
    css: undefined,
    template: undefined,
    port: 8080,
    host: 'localhost',
    open: false,
    watch: { ignored: [] },
    devParser: 'markdown-it',
    buildParser: 'pandoc',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(ConfigLoader.loadGlobal).mockResolvedValue(mockConfig as any);
    vi.mocked(PandocDetector.ensureInstalled).mockReturnValue(undefined);
    vi.mocked(fs.pathExists).mockResolvedValue(true);

    // Mock ParserFactory
    const mockParser = {
      name: 'pandoc',
      parse: vi.fn().mockResolvedValue('<html>test</html>'),
      isAvailable: vi.fn().mockResolvedValue(true),
    };
    vi.mocked(ParserFactory.create).mockReturnValue(mockParser as any);

    const mockConverter = {
      convertWithTemplate: vi.fn().mockResolvedValue('<html>test</html>'),
      writeHTML: vi.fn().mockResolvedValue(undefined),
      setParser: vi.fn(),
      getParser: vi.fn(),
    };
    vi.mocked(MarkdownConverter).mockImplementation(() => mockConverter as any);

    // Mock process.exit to prevent test termination
    vi.spyOn(process, 'exit').mockImplementation((() => {}) as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should build HTML with default options', async () => {
    await buildCommand('test.md', {});

    expect(ConfigLoader.loadGlobal).toHaveBeenCalled();
    expect(PandocDetector.ensureInstalled).toHaveBeenCalled();
    expect(fs.pathExists).toHaveBeenCalled();
  });

  it('should override theme from options', async () => {
    await buildCommand('test.md', { theme: 'custom-theme' });

    expect(ConfigLoader.loadGlobal).toHaveBeenCalled();
    const converterInstance = vi.mocked(MarkdownConverter).mock.results[0].value;
    expect(converterInstance.convertWithTemplate).toHaveBeenCalled();
  });

  it('should use custom output path when provided', async () => {
    await buildCommand('test.md', { output: 'custom-output.html' });

    const converterInstance = vi.mocked(MarkdownConverter).mock.results[0].value;
    expect(converterInstance.writeHTML).toHaveBeenCalledWith(
      '<html>test</html>',
      expect.stringContaining('custom-output.html')
    );
  });

  it('should exit with error when file does not exist', async () => {
    vi.mocked(fs.pathExists).mockResolvedValue(false);

    await buildCommand('nonexistent.md', {});

    expect(Logger.error).toHaveBeenCalledWith(
      expect.stringContaining('File not found')
    );
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it('should handle conversion errors gracefully', async () => {
    const mockConverter = {
      convertWithTemplate: vi.fn().mockRejectedValue(new Error('Conversion failed')),
      writeHTML: vi.fn(),
      setParser: vi.fn(),
      getParser: vi.fn(),
    };
    vi.mocked(MarkdownConverter).mockImplementation(() => mockConverter as any);

    await buildCommand('test.md', {});

    expect(Logger.error).toHaveBeenCalledWith('Build failed');
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it('should use pandoc parser by default (buildParser config)', async () => {
    await buildCommand('test.md', {});

    expect(PandocDetector.ensureInstalled).toHaveBeenCalled();
    expect(ParserFactory.create).toHaveBeenCalledWith(
      'pandoc',
      expect.objectContaining({ standalone: true })
    );
  });

  it('should use markdown-it parser when --fast option is provided', async () => {
    await buildCommand('test.md', { fast: true });

    // When --fast is used, pandoc check should NOT be called
    expect(PandocDetector.ensureInstalled).not.toHaveBeenCalled();
    expect(ParserFactory.create).toHaveBeenCalledWith(
      'markdown-it',
      expect.objectContaining({ standalone: true })
    );
  });
});
