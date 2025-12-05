// tests/unit/cli-dev.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { devCommand } from '../../src/cli/commands/dev.js';
import { ConfigLoader } from '../../src/config/loader.js';
import { FileWatcher } from '../../src/core/watcher.js';
import { MarkdownConverter } from '../../src/core/converter.js';
import { LiveServer } from '../../src/core/server.js';
import { PandocDetector } from '../../src/core/pandoc-detector.js';
import { Logger } from '../../src/utils/logger.js';
import { ProcessManager } from '../../src/utils/process-manager.js';
import fs from 'fs-extra';

vi.mock('../../src/config/loader.js');
vi.mock('../../src/core/watcher.js');
vi.mock('../../src/core/converter.js');
vi.mock('../../src/core/server.js');
vi.mock('../../src/core/pandoc-detector.js');
vi.mock('../../src/utils/logger.js');
vi.mock('../../src/utils/process-manager.js');
vi.mock('fs-extra');

describe('devCommand', () => {
  const mockConfig = {
    theme: 'github',
    port: 8080,
    host: 'localhost',
    open: false,
    pandoc: {},
    css: undefined,
    template: undefined,
    watch: { ignored: [] },
  };

  let mockWatcher: any;
  let mockServer: any;
  let mockConverter: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock config
    vi.mocked(ConfigLoader.loadGlobal).mockResolvedValue(mockConfig as any);

    // Mock pandoc
    vi.mocked(PandocDetector.ensureInstalled).mockReturnValue(undefined);

    // Mock file system
    vi.mocked(fs.pathExists).mockResolvedValue(true);
    vi.mocked(fs.ensureDir).mockResolvedValue(undefined);
    vi.mocked(fs.remove).mockResolvedValue(undefined);

    // Mock converter
    mockConverter = {
      convertWithTemplate: vi.fn().mockResolvedValue('<html>test</html>'),
      writeHTML: vi.fn().mockResolvedValue(undefined),
    };
    vi.mocked(MarkdownConverter).mockImplementation(() => mockConverter);

    // Mock server
    mockServer = {
      start: vi.fn().mockResolvedValue(undefined),
      stop: vi.fn().mockResolvedValue(undefined),
    };
    vi.mocked(LiveServer).mockImplementation(() => mockServer);

    // Mock watcher
    mockWatcher = {
      onChange: vi.fn(),
      start: vi.fn(),
      stop: vi.fn().mockResolvedValue(undefined),
    };
    vi.mocked(FileWatcher).mockImplementation(() => mockWatcher);

    // Mock ProcessManager
    vi.mocked(ProcessManager.onExit).mockImplementation(() => {});

    // Mock process.exit
    vi.spyOn(process, 'exit').mockImplementation((() => {}) as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should start dev server with default options', async () => {
    await devCommand('test.md', {});

    expect(ConfigLoader.loadGlobal).toHaveBeenCalled();
    expect(PandocDetector.ensureInstalled).toHaveBeenCalled();
    expect(mockConverter.convertWithTemplate).toHaveBeenCalled();
    expect(mockServer.start).toHaveBeenCalled();
    expect(mockWatcher.start).toHaveBeenCalled();
  });

  it('should override port from options', async () => {
    await devCommand('test.md', { port: '3000' });

    expect(LiveServer).toHaveBeenCalledWith(
      expect.objectContaining({
        port: 3000,
      })
    );
  });

  it('should override theme from options', async () => {
    await devCommand('test.md', { theme: 'custom-theme' });

    expect(MarkdownConverter).toHaveBeenCalledWith(
      expect.objectContaining({
        theme: 'custom-theme',
      })
    );
  });

  it('should override open browser option', async () => {
    await devCommand('test.md', { open: true });

    expect(LiveServer).toHaveBeenCalledWith(
      expect.objectContaining({
        open: true,
      })
    );
  });

  it('should exit with error when file does not exist', async () => {
    vi.mocked(fs.pathExists).mockResolvedValue(false);

    await devCommand('nonexistent.md', {});

    expect(Logger.error).toHaveBeenCalledWith(
      expect.stringContaining('File not found')
    );
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it('should register cleanup handler', async () => {
    await devCommand('test.md', {});

    expect(ProcessManager.onExit).toHaveBeenCalled();
  });

  it('should handle conversion errors gracefully', async () => {
    mockConverter.convertWithTemplate.mockRejectedValue(
      new Error('Conversion failed')
    );

    await devCommand('test.md', {});

    expect(Logger.error).toHaveBeenCalledWith('Failed to start dev server');
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it('should register file change handler', async () => {
    await devCommand('test.md', {});

    expect(mockWatcher.onChange).toHaveBeenCalled();
  });
});
