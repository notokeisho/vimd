// tests/unit/cli-reset.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { resetCommand } from '../../src/cli/commands/reset.js';
import { Logger } from '../../src/utils/logger.js';
import { PathResolver } from '../../src/utils/path-resolver.js';
import { DEFAULT_CONFIG } from '../../src/config/defaults.js';
import fs from 'fs-extra';
import inquirer from 'inquirer';

vi.mock('../../src/utils/logger.js');
vi.mock('../../src/utils/path-resolver.js');
vi.mock('fs-extra');
vi.mock('inquirer');

describe('resetCommand', () => {
  const mockConfigPath = '/home/user/.vimd/config.js';

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(PathResolver.getConfigPath).mockReturnValue(mockConfigPath);
    vi.spyOn(process, 'exit').mockImplementation((() => {}) as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should show message when config file does not exist', async () => {
    vi.mocked(fs.pathExists).mockResolvedValue(false as never);

    await resetCommand({});

    expect(fs.pathExists).toHaveBeenCalledWith(mockConfigPath);
    expect(Logger.info).toHaveBeenCalledWith(
      'No configuration file found. Already using default settings.'
    );
    expect(Logger.info).toHaveBeenCalledWith(
      `  Default port: ${DEFAULT_CONFIG.port}`
    );
    expect(fs.remove).not.toHaveBeenCalled();
  });

  it('should not delete when user cancels confirmation', async () => {
    vi.mocked(fs.pathExists).mockResolvedValue(true as never);
    vi.mocked(inquirer.prompt).mockResolvedValue({ confirmed: false });

    await resetCommand({});

    expect(inquirer.prompt).toHaveBeenCalled();
    expect(Logger.info).toHaveBeenCalledWith('Configuration reset cancelled');
    expect(fs.remove).not.toHaveBeenCalled();
  });

  it('should delete config file when user confirms', async () => {
    vi.mocked(fs.pathExists).mockResolvedValue(true as never);
    vi.mocked(inquirer.prompt).mockResolvedValue({ confirmed: true });
    vi.mocked(fs.remove).mockResolvedValue(undefined as never);

    await resetCommand({});

    expect(inquirer.prompt).toHaveBeenCalled();
    expect(fs.remove).toHaveBeenCalledWith(mockConfigPath);
    expect(Logger.success).toHaveBeenCalledWith(
      'Configuration reset. Default settings will be used on next run.'
    );
    expect(Logger.info).toHaveBeenCalledWith(
      `  Default port: ${DEFAULT_CONFIG.port}`
    );
  });

  it('should skip confirmation with --yes option', async () => {
    vi.mocked(fs.pathExists).mockResolvedValue(true as never);
    vi.mocked(fs.remove).mockResolvedValue(undefined as never);

    await resetCommand({ yes: true });

    expect(inquirer.prompt).not.toHaveBeenCalled();
    expect(fs.remove).toHaveBeenCalledWith(mockConfigPath);
    expect(Logger.success).toHaveBeenCalledWith(
      'Configuration reset. Default settings will be used on next run.'
    );
  });

  it('should handle errors gracefully', async () => {
    vi.mocked(fs.pathExists).mockResolvedValue(true as never);
    vi.mocked(inquirer.prompt).mockResolvedValue({ confirmed: true });
    vi.mocked(fs.remove).mockRejectedValue(new Error('Permission denied'));

    await resetCommand({});

    expect(Logger.error).toHaveBeenCalledWith(
      'Failed to reset configuration: Permission denied'
    );
    expect(process.exit).toHaveBeenCalledWith(1);
  });
});
