// src/cli/setup.ts
import inquirer from 'inquirer';
import { ConfigLoader } from '../config/loader.js';
import { DEFAULT_CONFIG } from '../config/defaults.js';
import { ThemeManager } from '../themes/index.js';
import { Logger } from '../utils/logger.js';
import { PathResolver } from '../utils/path-resolver.js';
import * as fs from 'fs-extra';

export async function setupCommand(): Promise<void> {
  console.log('\nWelcome to vimd!\n');

  const themes = ThemeManager.list();

  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'theme',
      message: 'Select a theme:',
      choices: themes.map((t) => ({
        name: `${t.displayName} - ${t.description}`,
        value: t.name,
      })),
      default: 'github',
    },
  ]);

  const config = {
    ...DEFAULT_CONFIG,
    theme: answers.theme,
  };

  try {
    const configPath = PathResolver.getConfigPath();
    const configDir = PathResolver.getConfigDir();

    // Create configuration directory
    Logger.info(`Creating configuration directory: ${configDir}`);
    await fs.ensureDir(configDir);

    // Save configuration
    Logger.info(`Saving configuration: ${configPath}`);
    await ConfigLoader.save(config, configPath);

    Logger.success('\nSetup complete!\n');
    console.log('Get started:');
    console.log('  vimd dev README.md  - Start preview');
    console.log('  vimd theme          - Change theme');
    console.log('  vimd config         - Advanced settings\n');
  } catch (error) {
    Logger.error('Setup failed');
    if (error instanceof Error) {
      Logger.error(error.message);
    }
    process.exit(1);
  }
}
