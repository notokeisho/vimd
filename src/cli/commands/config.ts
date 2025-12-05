// src/cli/commands/config.ts
import inquirer from 'inquirer';
import { ConfigLoader } from '../../config/loader.js';
import { ThemeManager } from '../../themes/index.js';
import { Logger } from '../../utils/logger.js';
import { PathResolver } from '../../utils/path-resolver.js';
import { VimdConfig } from '../../config/types.js';

interface ConfigOptions {
  list?: boolean;
}

export async function configCommand(options: ConfigOptions): Promise<void> {
  try {
    // --list オプション: 現在の設定を表示
    if (options.list) {
      await showCurrentConfig();
      return;
    }

    // 対話的設定変更
    await interactiveConfig();
  } catch (error) {
    Logger.error('Failed to update configuration');
    if (error instanceof Error) {
      Logger.error(error.message);
    }
    process.exit(1);
  }
}

async function showCurrentConfig(): Promise<void> {
  const config = await ConfigLoader.loadGlobal();
  const configPath = PathResolver.getConfigPath();

  console.log('\nCurrent configuration:');
  console.log(`  Theme: ${config.theme}`);
  console.log(`  Port: ${config.port}`);
  console.log(`  Host: ${config.host}`);
  console.log(`  Open Browser: ${config.open}`);
  console.log(`  Config File: ${configPath}\n`);
}

async function interactiveConfig(): Promise<void> {
  const config = await ConfigLoader.loadGlobal();

  // 変更したい項目を選択
  const { item } = await inquirer.prompt([
    {
      type: 'list',
      name: 'item',
      message: 'What would you like to change?',
      choices: [
        { name: 'Theme', value: 'theme' },
        { name: 'Port number', value: 'port' },
        { name: 'Auto-open browser', value: 'open' },
        { name: 'Cancel', value: 'cancel' },
      ],
    },
  ]);

  if (item === 'cancel') {
    Logger.info('Configuration unchanged');
    return;
  }

  // 項目別の変更処理
  switch (item) {
    case 'theme':
      await changeTheme(config);
      break;
    case 'port':
      await changePort(config);
      break;
    case 'open':
      await changeOpen(config);
      break;
  }

  // 設定保存
  await ConfigLoader.save(config);
  Logger.success('Configuration updated');
}

async function changeTheme(config: VimdConfig): Promise<void> {
  const themes = ThemeManager.list();

  const { theme } = await inquirer.prompt([
    {
      type: 'list',
      name: 'theme',
      message: 'Select a theme:',
      choices: themes.map((t) => ({
        name:
          t.name === config.theme
            ? `${t.displayName} (current)`
            : t.displayName,
        value: t.name,
      })),
      default: config.theme,
    },
  ]);

  config.theme = theme as any;
}

async function changePort(config: VimdConfig): Promise<void> {
  const { port } = await inquirer.prompt([
    {
      type: 'input',
      name: 'port',
      message: 'Enter port number:',
      default: config.port.toString(),
      validate: (input: string) => {
        const num = parseInt(input, 10);
        if (isNaN(num) || num < 1 || num > 65535) {
          return 'Port must be between 1 and 65535';
        }
        return true;
      },
    },
  ]);

  config.port = parseInt(port, 10);
}

async function changeOpen(config: VimdConfig): Promise<void> {
  const { open } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'open',
      message: 'Auto-open browser in preview?',
      default: config.open,
    },
  ]);

  config.open = open;
}
