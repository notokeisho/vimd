// tests/unit/cli-theme.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { themeCommand } from '../../src/cli/commands/theme.js';
import { ConfigLoader } from '../../src/config/loader.js';
import { ThemeManager } from '../../src/themes/index.js';
import { Logger } from '../../src/utils/logger.js';
import inquirer from 'inquirer';

vi.mock('../../src/config/loader.js');
vi.mock('../../src/themes/index.js');
vi.mock('../../src/utils/logger.js');
vi.mock('inquirer');

describe('themeCommand', () => {
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
    { name: 'monokai', displayName: 'Monokai' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(ConfigLoader.loadGlobal).mockResolvedValue(mockConfig as any);
    vi.mocked(ConfigLoader.save).mockResolvedValue(undefined);
    vi.mocked(ThemeManager.list).mockReturnValue(mockThemes as any);
    vi.spyOn(process, 'exit').mockImplementation((() => {}) as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should update theme when different theme is selected', async () => {
    // Set up config with 'github' theme
    const config = { ...mockConfig, theme: 'github' };
    vi.mocked(ConfigLoader.loadGlobal).mockResolvedValueOnce(config as any);

    // User selects different theme
    vi.mocked(inquirer.prompt).mockResolvedValueOnce({ theme: 'solarized' });

    await themeCommand();

    expect(ConfigLoader.loadGlobal).toHaveBeenCalled();
    expect(ThemeManager.list).toHaveBeenCalled();
    expect(inquirer.prompt).toHaveBeenCalled();
    expect(ConfigLoader.save).toHaveBeenCalled();
    expect(Logger.success).toHaveBeenCalledWith(
      expect.stringContaining('solarized')
    );
  });

  it('should not save when same theme is selected', async () => {
    // Ensure mockConfig has theme 'github'
    const config = { ...mockConfig, theme: 'github' };
    vi.mocked(ConfigLoader.loadGlobal).mockResolvedValueOnce(config as any);

    // Mock prompt to return same theme
    vi.mocked(inquirer.prompt).mockResolvedValueOnce({ theme: 'github' });

    await themeCommand();

    expect(ConfigLoader.loadGlobal).toHaveBeenCalled();
    // When theme is unchanged, save should not be called
    expect(ConfigLoader.save).not.toHaveBeenCalled();

    // Check that "Theme unchanged" message is shown
    const infoCalls = vi.mocked(Logger.info).mock.calls;
    const hasUnchangedMessage = infoCalls.some(call => call[0] === 'Theme unchanged');
    expect(hasUnchangedMessage).toBe(true);
  });

  it('should show current theme in choices', async () => {
    // Ensure mockConfig has theme 'github'
    const config = { ...mockConfig, theme: 'github' };
    vi.mocked(ConfigLoader.loadGlobal).mockResolvedValueOnce(config as any);
    vi.mocked(inquirer.prompt).mockResolvedValueOnce({ theme: 'github' });

    await themeCommand();

    // Just verify that prompt was called with correct structure
    expect(inquirer.prompt).toHaveBeenCalledWith([
      expect.objectContaining({
        type: 'list',
        name: 'theme',
        message: 'Select a theme:',
        default: 'github',
      }),
    ]);
  });

  it('should handle errors gracefully', async () => {
    vi.mocked(ConfigLoader.loadGlobal).mockRejectedValueOnce(
      new Error('Config load failed')
    );

    await themeCommand();

    expect(Logger.error).toHaveBeenCalledWith('Failed to change theme');
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it('should handle save errors', async () => {
    // Set up config with 'github' theme
    const config = { ...mockConfig, theme: 'github' };
    vi.mocked(ConfigLoader.loadGlobal).mockResolvedValueOnce(config as any);

    // User selects different theme
    vi.mocked(inquirer.prompt).mockResolvedValueOnce({ theme: 'solarized' });

    // Save will fail
    vi.mocked(ConfigLoader.save).mockRejectedValueOnce(new Error('Save failed'));

    await themeCommand();

    expect(Logger.error).toHaveBeenCalledWith('Failed to change theme');
    expect(process.exit).toHaveBeenCalledWith(1);
  });
});
