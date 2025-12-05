// src/cli/commands/theme.ts
import inquirer from 'inquirer';
import { ConfigLoader } from '../../config/loader.js';
import { ThemeManager } from '../../themes/index.js';
import { Logger } from '../../utils/logger.js';

export async function themeCommand(): Promise<void> {
  try {
    // 1. 現在の設定読み込み
    const config = await ConfigLoader.loadGlobal();
    const currentTheme = config.theme;

    // 2. テーマ一覧取得
    const themes = ThemeManager.list();

    // 3. 対話的選択
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'theme',
        message: 'Select a theme:',
        choices: themes.map((t) => ({
          name:
            t.name === currentTheme
              ? `${t.displayName} (current)`
              : t.displayName,
          value: t.name,
        })),
        default: currentTheme,
      },
    ]);

    // 変更がない場合
    if (answers.theme === currentTheme) {
      Logger.info('Theme unchanged');
      return;
    }

    // 4. 設定更新
    config.theme = answers.theme as any;
    await ConfigLoader.save(config);

    Logger.success(`Theme updated to '${answers.theme}'`);
    Logger.info('All projects will use this theme.');
  } catch (error) {
    Logger.error('Failed to change theme');
    if (error instanceof Error) {
      Logger.error(error.message);
    }
    process.exit(1);
  }
}
