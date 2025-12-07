// tests/unit/cli-dev.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { devCommand } from '../../src/cli/commands/dev.js';
import { ConfigLoader } from '../../src/config/loader.js';
import { FileWatcher } from '../../src/core/watcher.js';
import { MarkdownConverter } from '../../src/core/converter.js';
import { LiveServer } from '../../src/core/server.js';
import { PandocDetector } from '../../src/core/pandoc-detector.js';
import { ParserFactory } from '../../src/core/parser/index.js';
import { Logger } from '../../src/utils/logger.js';
import { ProcessManager } from '../../src/utils/process-manager.js';
import { SessionManager } from '../../src/utils/session-manager.js';
import fs from 'fs-extra';

vi.mock('../../src/config/loader.js');
vi.mock('../../src/core/watcher.js');
vi.mock('../../src/core/converter.js');
vi.mock('../../src/core/server.js');
vi.mock('../../src/core/pandoc-detector.js');
vi.mock('../../src/core/parser/index.js');
vi.mock('../../src/utils/logger.js');
vi.mock('../../src/utils/process-manager.js');
vi.mock('../../src/utils/session-manager.js');
vi.mock('fs-extra');

describe('devCommand', () => {
  let mockWatcher: any;
  let mockServer: any;
  let mockConverter: any;

  const getDefaultConfig = () => ({
    theme: 'github',
    port: 8080,
    host: 'localhost',
    open: false,
    pandoc: {},
    css: undefined,
    template: undefined,
    watch: { ignored: [] },
    devParser: 'markdown-it',
    buildParser: 'pandoc',
  });

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock config
    vi.mocked(ConfigLoader.loadGlobal).mockResolvedValue(getDefaultConfig() as any);

    // Mock pandoc
    vi.mocked(PandocDetector.ensureInstalled).mockReturnValue(undefined);

    // Mock ParserFactory
    const mockParser = {
      name: 'markdown-it',
      parse: vi.fn().mockResolvedValue('<html>test</html>'),
      isAvailable: vi.fn().mockResolvedValue(true),
    };
    vi.mocked(ParserFactory.create).mockReturnValue(mockParser as any);

    // Mock file system
    vi.mocked(fs.pathExists).mockResolvedValue(true);
    vi.mocked(fs.ensureDir).mockResolvedValue(undefined);
    vi.mocked(fs.remove).mockResolvedValue(undefined);

    // Mock SessionManager
    vi.mocked(SessionManager.cleanDeadSessions).mockResolvedValue(0);
    vi.mocked(SessionManager.cleanupSessionOnPort).mockResolvedValue({
      killed: false,
      htmlRemoved: false,
    });
    vi.mocked(SessionManager.isPortAvailable).mockResolvedValue(true);
    vi.mocked(SessionManager.saveSession).mockResolvedValue(undefined);
    vi.mocked(SessionManager.removeSession).mockResolvedValue(undefined);

    // Mock converter
    mockConverter = {
      convertWithTemplate: vi.fn().mockResolvedValue('<html>test</html>'),
      writeHTML: vi.fn().mockResolvedValue(undefined),
      setParser: vi.fn(),
      getParser: vi.fn(),
    };
    vi.mocked(MarkdownConverter).mockImplementation(() => mockConverter);

    // Mock server
    mockServer = {
      start: vi.fn().mockResolvedValue({
        actualPort: 8080,
        requestedPort: 8080,
        portChanged: false,
      }),
      stop: vi.fn().mockResolvedValue(undefined),
      getActualPort: vi.fn().mockReturnValue(8080),
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
    expect(SessionManager.cleanDeadSessions).toHaveBeenCalled();
    expect(SessionManager.cleanupSessionOnPort).toHaveBeenCalledWith(8080);
    expect(SessionManager.isPortAvailable).toHaveBeenCalledWith(8080);
    // Note: PandocDetector.ensureInstalled is NOT called by default
    // because devParser defaults to 'markdown-it'
    expect(PandocDetector.ensureInstalled).not.toHaveBeenCalled();
    expect(ParserFactory.create).toHaveBeenCalledWith('markdown-it', {});
    expect(mockConverter.setParser).toHaveBeenCalled();
    expect(mockConverter.convertWithTemplate).toHaveBeenCalled();
    expect(mockServer.start).toHaveBeenCalled();
    expect(SessionManager.saveSession).toHaveBeenCalled();
    expect(mockWatcher.start).toHaveBeenCalled();
  });

  it('should override port from options', async () => {
    await devCommand('test.md', { port: '3000' });

    expect(SessionManager.cleanupSessionOnPort).toHaveBeenCalledWith(3000);
    expect(SessionManager.isPortAvailable).toHaveBeenCalledWith(3000);
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

  it('should find alternative port if port is unavailable', async () => {
    vi.mocked(SessionManager.isPortAvailable).mockResolvedValue(false);
    vi.mocked(SessionManager.findAvailablePort).mockResolvedValue(8081);

    await devCommand('test.md', {});

    expect(SessionManager.findAvailablePort).toHaveBeenCalledWith(8081);
    expect(Logger.warn).toHaveBeenCalledWith(
      'Port 8080 is in use by another application'
    );
    expect(LiveServer).toHaveBeenCalledWith(
      expect.objectContaining({
        port: 8081,
      })
    );
  });

  it('should log when cleaning stale sessions', async () => {
    vi.mocked(SessionManager.cleanDeadSessions).mockResolvedValue(2);

    await devCommand('test.md', {});

    expect(Logger.info).toHaveBeenCalledWith('Cleaned 2 stale session(s)');
  });

  it('should log when killing previous session on same port', async () => {
    vi.mocked(SessionManager.cleanupSessionOnPort).mockResolvedValue({
      killed: true,
      htmlRemoved: true,
      previousPort: 8080,
      previousSource: '/tmp/old.md',
    });

    await devCommand('test.md', {});

    expect(Logger.info).toHaveBeenCalledWith(
      'Stopped previous session on port 8080'
    );
    expect(Logger.info).toHaveBeenCalledWith('Removed previous preview file');
  });

  it('should use pandoc parser when --pandoc option is provided', async () => {
    await devCommand('test.md', { pandoc: true });

    expect(PandocDetector.ensureInstalled).toHaveBeenCalled();
    expect(ParserFactory.create).toHaveBeenCalledWith('pandoc', {});
    expect(mockConverter.setParser).toHaveBeenCalled();
  });

  it('should use markdown-it parser by default (devParser config)', async () => {
    await devCommand('test.md', {});

    expect(PandocDetector.ensureInstalled).not.toHaveBeenCalled();
    expect(ParserFactory.create).toHaveBeenCalledWith('markdown-it', {});
  });
});
