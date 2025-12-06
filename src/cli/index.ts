#!/usr/bin/env node

import { Command } from 'commander';
import { createRequire } from 'module';
import { devCommand } from './commands/dev.js';
import { buildCommand } from './commands/build.js';
import { themeCommand } from './commands/theme.js';
import { configCommand } from './commands/config.js';

const require = createRequire(import.meta.url);
const packageJson = require('../../package.json');

const program = new Command();

program
  .name('vimd')
  .description('Real-time Markdown preview tool (view markdown)')
  .version(packageJson.version);

// vimd dev <file>
program
  .command('dev <file>')
  .description('Start live preview server')
  .option('-p, --port <port>', 'Port number', '8080')
  .option('-t, --theme <theme>', 'Theme name')
  .option('--no-open', 'Do not open browser automatically')
  .option('--pandoc', 'Use pandoc parser instead of markdown-it')
  .action(devCommand);

// vimd build <file>
program
  .command('build <file>')
  .description('Build static HTML file')
  .option('-o, --output <path>', 'Output file path')
  .option('-t, --theme <theme>', 'Theme name')
  .option('--fast', 'Use markdown-it parser for faster build')
  .action(buildCommand);

// vimd theme
program
  .command('theme')
  .description('Change theme interactively')
  .action(themeCommand);

// vimd config
program
  .command('config')
  .description('Edit configuration interactively')
  .option('-l, --list', 'List current configuration')
  .action(configCommand);

program.parse(process.argv);
