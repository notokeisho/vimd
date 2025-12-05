// src/themes/index.ts
import { ThemeInfo } from '../config/types.js';
import { THEMES, getThemeByName } from './registry.js';
import * as fs from 'fs-extra';

export class ThemeManager {
  static list(): ThemeInfo[] {
    return THEMES;
  }

  static async getCSS(themeName: string): Promise<string> {
    const theme = getThemeByName(themeName);

    if (!theme) {
      throw new Error(`Theme not found: ${themeName}`);
    }

    try {
      const css = await fs.readFile(theme.cssPath, 'utf-8');
      return css;
    } catch (error) {
      throw new Error(
        `Failed to load theme CSS for '${themeName}': ${error}`
      );
    }
  }

  static async loadCustomCSS(cssPath: string): Promise<string> {
    try {
      const css = await fs.readFile(cssPath, 'utf-8');
      return css;
    } catch (error) {
      throw new Error(`Failed to load custom CSS from '${cssPath}': ${error}`);
    }
  }
}
