// src/cli/commands/reset.ts
import inquirer from 'inquirer';
import fs from 'fs-extra';
import { Logger } from '../../utils/logger.js';
import { PathResolver } from '../../utils/path-resolver.js';
import { DEFAULT_CONFIG } from '../../config/defaults.js';

interface ResetOptions {
  yes?: boolean;
}

export async function resetCommand(options: ResetOptions): Promise<void> {
  try {
    const configPath = PathResolver.getConfigPath();

    // Check if config file exists
    if (!(await fs.pathExists(configPath))) {
      Logger.info('No configuration file found. Already using default settings.');
      Logger.info(`  Default port: ${DEFAULT_CONFIG.port}`);
      return;
    }

    // Confirm deletion unless --yes is specified
    if (!options.yes) {
      const { confirmed } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirmed',
          message: 'Are you sure you want to reset the configuration?',
          default: false,
        },
      ]);

      if (!confirmed) {
        Logger.info('Configuration reset cancelled');
        return;
      }
    }

    // Delete the config file
    await fs.remove(configPath);

    Logger.success('Configuration reset. Default settings will be used on next run.');
    Logger.info(`  Default port: ${DEFAULT_CONFIG.port}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    Logger.error(`Failed to reset configuration: ${errorMessage}`);
    process.exit(1);
  }
}
