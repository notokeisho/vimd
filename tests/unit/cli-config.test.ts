// tests/unit/cli-config.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { configCommand } from '../../src/cli/commands/config.js';
import { ConfigLoader } from '../../src/config/loader.js';
import { ThemeManager } from '../../src/themes/index.js';
import { Logger } from '../../src/utils/logger.js';
import { PathResolver } from '../../src/utils/path-resolver.js';
import inquirer from 'inquirer';

vi.mock('../../src/config/loader.js');
vi.mock('../../src/themes/index.js');
vi.mock('../../src/utils/logger.js');
vi.mock('../../src/utils/path-resolver.js');
vi.mock('inquirer');

describe('configCommand', () => {
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

  const mockThemes = [
    { name: 'github', displayName: 'GitHub' },
    { name: 'solarized', displayName: 'Solarized' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(ConfigLoader.loadGlobal).mockResolvedValue(mockConfig as any);
    vi.mocked(ConfigLoader.save).mockResolvedValue(undefined);
    vi.mocked(ThemeManager.list).mockReturnValue(mockThemes as any);
    vi.mocked(PathResolver.getConfigPath).mockReturnValue('/path/to/config');
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(process, 'exit').mockImplementation((() => {}) as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should display current config with --list option', async () => {
    await configCommand({ list: true });

    expect(ConfigLoader.loadGlobal).toHaveBeenCalled();
    expect(PathResolver.getConfigPath).toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Current configuration')
    );
  });

  it('should start interactive config when no list option', async () => {
    vi.mocked(inquirer.prompt).mockResolvedValueOnce({ item: 'cancel' });

    await configCommand({});

    expect(inquirer.prompt).toHaveBeenCalled();
    expect(Logger.info).toHaveBeenCalledWith('Configuration unchanged');
  });

  it('should update theme through interactive config', async () => {
    vi.mocked(inquirer.prompt)
      .mockResolvedValueOnce({ item: 'theme' })
      .mockResolvedValueOnce({ theme: 'solarized' });

    await configCommand({});

    expect(ConfigLoader.save).toHaveBeenCalled();
    expect(Logger.success).toHaveBeenCalledWith('Configuration updated');
  });

  it('should update port through interactive config', async () => {
    vi.mocked(inquirer.prompt)
      .mockResolvedValueOnce({ item: 'port' })
      .mockResolvedValueOnce({ port: '3000' });

    await configCommand({});

    expect(ConfigLoader.save).toHaveBeenCalled();
    expect(Logger.success).toHaveBeenCalledWith('Configuration updated');
  });

  it('should update open browser option through interactive config', async () => {
    vi.mocked(inquirer.prompt)
      .mockResolvedValueOnce({ item: 'open' })
      .mockResolvedValueOnce({ open: true });

    await configCommand({});

    expect(ConfigLoader.save).toHaveBeenCalled();
    expect(Logger.success).toHaveBeenCalledWith('Configuration updated');
  });

  it('should handle errors gracefully', async () => {
    vi.mocked(ConfigLoader.loadGlobal).mockRejectedValue(
      new Error('Config load failed')
    );

    await configCommand({});

    expect(Logger.error).toHaveBeenCalledWith('Failed to update configuration');
    expect(process.exit).toHaveBeenCalledWith(1);
  });
});
