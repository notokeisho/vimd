// tests/unit/cli-dev.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { devCommand } from '../../src/cli/commands/dev.js';
import { ConfigLoader } from '../../src/config/loader.js';
import { SingleFileServer } from '../../src/core/single-file-server.js';
import { PandocDetector } from '../../src/core/pandoc-detector.js';
import { Logger } from '../../src/utils/logger.js';
import { ProcessManager } from '../../src/utils/process-manager.js';
import { SessionManager } from '../../src/utils/session-manager.js';
import fs from 'fs-extra';
import open from 'open';

vi.mock('../../src/config/loader.js');
vi.mock('../../src/core/single-file-server.js');
vi.mock('../../src/core/pandoc-detector.js');
vi.mock('../../src/utils/logger.js');
vi.mock('../../src/utils/process-manager.js');
vi.mock('../../src/utils/session-manager.js');
vi.mock('fs-extra');
vi.mock('open');

describe('devCommand', () => {
  let mockServer: any;

  const getDefaultConfig = () => ({
    theme: 'github',
    port: 8080,
    host: 'localhost',
    open: false,
    pandoc: {},
    css: undefined,
    template: undefined,
    watch: { ignored: [] },
    math: { enabled: true },
    devParser: 'markdown-it',
    buildParser: 'pandoc',
  });

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock config
    vi.mocked(ConfigLoader.loadGlobal).mockResolvedValue(getDefaultConfig() as any);

    // Mock pandoc
    vi.mocked(PandocDetector.ensureInstalled).mockReturnValue(undefined);

    // Mock file system
    vi.mocked(fs.pathExists).mockResolvedValue(true);
    vi.mocked(fs.stat).mockResolvedValue({
      isDirectory: () => false,
      isFile: () => true,
    } as any);
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

    // Mock SingleFileServer
    mockServer = {
      start: vi.fn().mockResolvedValue({
        actualPort: 8080,
        requestedPort: 8080,
        portChanged: false,
      }),
      stop: vi.fn().mockResolvedValue(undefined),
    };
    vi.mocked(SingleFileServer).mockImplementation(() => mockServer);

    // Mock ProcessManager
    vi.mocked(ProcessManager.onExit).mockImplementation(() => {});

    // Mock open (browser opener)
    vi.mocked(open).mockResolvedValue({} as any);

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
    // PandocDetector.ensureInstalled is NOT called for markdown files
    expect(PandocDetector.ensureInstalled).not.toHaveBeenCalled();
    expect(SingleFileServer).toHaveBeenCalledWith(
      expect.objectContaining({
        port: 8080,
        host: 'localhost',
        theme: 'github',
        mathEnabled: true,
      })
    );
    expect(mockServer.start).toHaveBeenCalled();
    expect(SessionManager.saveSession).toHaveBeenCalledWith(
      expect.objectContaining({
        port: 8080,
        htmlPath: '', // No HTML file in single file mode
      })
    );
  });

  it('should override port from options', async () => {
    await devCommand('test.md', { port: '3000' });

    expect(SessionManager.cleanupSessionOnPort).toHaveBeenCalledWith(3000);
    expect(SessionManager.isPortAvailable).toHaveBeenCalledWith(3000);
    expect(SingleFileServer).toHaveBeenCalledWith(
      expect.objectContaining({
        port: 3000,
      })
    );
  });

  it('should override theme from options', async () => {
    await devCommand('test.md', { theme: 'custom-theme' });

    expect(SingleFileServer).toHaveBeenCalledWith(
      expect.objectContaining({
        theme: 'custom-theme',
      })
    );
  });

  it('should open browser when open option is true', async () => {
    vi.mocked(ConfigLoader.loadGlobal).mockResolvedValue({
      ...getDefaultConfig(),
      open: true,
    } as any);

    await devCommand('test.md', { open: true });

    expect(mockServer.start).toHaveBeenCalled();
    expect(open).toHaveBeenCalledWith('http://localhost:8080/');
    expect(Logger.info).toHaveBeenCalledWith('Browser opened');
  });

  it('should exit with error when file does not exist', async () => {
    vi.mocked(fs.pathExists).mockResolvedValue(false);

    await devCommand('nonexistent.md', {});

    expect(Logger.error).toHaveBeenCalledWith(
      expect.stringContaining('Path not found')
    );
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it('should register cleanup handler', async () => {
    await devCommand('test.md', {});

    expect(ProcessManager.onExit).toHaveBeenCalled();
  });

  it('should handle server start errors gracefully', async () => {
    mockServer.start.mockRejectedValue(new Error('Server start failed'));

    await devCommand('test.md', {});

    expect(Logger.error).toHaveBeenCalledWith('Failed to start dev server');
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it('should find alternative port if port is unavailable', async () => {
    vi.mocked(SessionManager.isPortAvailable).mockResolvedValue(false);
    vi.mocked(SessionManager.findAvailablePort).mockResolvedValue(8081);

    await devCommand('test.md', {});

    expect(SessionManager.findAvailablePort).toHaveBeenCalledWith(8081);
    expect(Logger.warn).toHaveBeenCalledWith(
      'Port 8080 is in use by another application'
    );
    expect(SingleFileServer).toHaveBeenCalledWith(
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

  it('should check pandoc for LaTeX files', async () => {
    await devCommand('document.tex', {});

    expect(PandocDetector.ensureInstalled).toHaveBeenCalledWith(true);
    expect(Logger.info).toHaveBeenCalledWith('Mode: LaTeX');
  });

  it('should check pandoc for .latex files', async () => {
    await devCommand('document.latex', {});

    expect(PandocDetector.ensureInstalled).toHaveBeenCalledWith(true);
  });

  it('should not check pandoc for markdown files', async () => {
    await devCommand('readme.md', {});

    expect(PandocDetector.ensureInstalled).not.toHaveBeenCalled();
  });

  it('should pass pandoc options to SingleFileServer', async () => {
    const customConfig = {
      ...getDefaultConfig(),
      pandoc: { standalone: true },
    };
    vi.mocked(ConfigLoader.loadGlobal).mockResolvedValue(customConfig as any);

    await devCommand('test.md', {});

    expect(SingleFileServer).toHaveBeenCalledWith(
      expect.objectContaining({
        pandocOptions: { standalone: true },
      })
    );
  });

  it('should pass watch options to SingleFileServer', async () => {
    const customConfig = {
      ...getDefaultConfig(),
      watch: { debounce: 300, ignored: ['*.log'] },
    };
    vi.mocked(ConfigLoader.loadGlobal).mockResolvedValue(customConfig as any);

    await devCommand('test.md', {});

    expect(SingleFileServer).toHaveBeenCalledWith(
      expect.objectContaining({
        watchOptions: { debounce: 300, ignored: ['*.log'] },
      })
    );
  });

  it('should pass custom CSS to SingleFileServer', async () => {
    const customConfig = {
      ...getDefaultConfig(),
      css: 'body { background: red; }',
    };
    vi.mocked(ConfigLoader.loadGlobal).mockResolvedValue(customConfig as any);

    await devCommand('test.md', {});

    expect(SingleFileServer).toHaveBeenCalledWith(
      expect.objectContaining({
        customCSS: 'body { background: red; }',
      })
    );
  });

  it('should save session with empty htmlPath', async () => {
    await devCommand('test.md', {});

    expect(SessionManager.saveSession).toHaveBeenCalledWith(
      expect.objectContaining({
        htmlPath: '',
      })
    );
  });
});
