// src/themes/registry.ts
import { ThemeInfo } from '../config/types.js';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const THEMES: ThemeInfo[] = [
  {
    name: 'github',
    displayName: 'GitHub (Recommended)',
    description: 'GitHub Markdown style with clean design',
    cssPath: path.join(__dirname, 'styles', 'github.css'),
  },
  {
    name: 'minimal',
    displayName: 'Minimal',
    description: 'Simple white background with minimal decoration',
    cssPath: path.join(__dirname, 'styles', 'minimal.css'),
  },
  {
    name: 'dark',
    displayName: 'Dark',
    description: 'VS Code inspired dark mode',
    cssPath: path.join(__dirname, 'styles', 'dark.css'),
  },
  {
    name: 'academic',
    displayName: 'Academic',
    description: 'Paper-style layout for academic writing',
    cssPath: path.join(__dirname, 'styles', 'academic.css'),
  },
  {
    name: 'technical',
    displayName: 'Technical',
    description: 'API documentation style with sidebar',
    cssPath: path.join(__dirname, 'styles', 'technical.css'),
  },
];

export function getThemeByName(name: string): ThemeInfo | undefined {
  return THEMES.find((theme) => theme.name === name);
}
