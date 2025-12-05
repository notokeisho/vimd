// tests/unit/theme-manager.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ThemeManager } from '../../src/themes';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';

describe('ThemeManager', () => {
  const testDir = path.join(os.tmpdir(), 'vimd-theme-test');
  const testCSSPath = path.join(testDir, 'custom.css');

  beforeEach(async () => {
    await fs.ensureDir(testDir);
  });

  afterEach(async () => {
    await fs.remove(testDir);
  });

  describe('list', () => {
    it('should return all available themes', () => {
      const themes = ThemeManager.list();
      expect(themes).toHaveLength(5);
    });

    it('should return themes with all required properties', () => {
      const themes = ThemeManager.list();
      themes.forEach((theme) => {
        expect(theme.name).toBeDefined();
        expect(theme.displayName).toBeDefined();
        expect(theme.description).toBeDefined();
        expect(theme.cssPath).toBeDefined();
      });
    });
  });

  describe('getCSS', () => {
    it('should return CSS content for valid theme', async () => {
      // まずCSSファイルを作成
      const cssDir = path.join(__dirname, '../../src/themes/styles');
      await fs.ensureDir(cssDir);
      await fs.writeFile(
        path.join(cssDir, 'github.css'),
        'body { color: black; }'
      );

      const css = await ThemeManager.getCSS('github');
      expect(css).toContain('body');
    });

    it('should throw error for invalid theme', async () => {
      await expect(ThemeManager.getCSS('invalid')).rejects.toThrow();
    });
  });

  describe('loadCustomCSS', () => {
    it('should load custom CSS from file', async () => {
      const customCSS = 'h1 { color: red; }';
      await fs.writeFile(testCSSPath, customCSS);

      const css = await ThemeManager.loadCustomCSS(testCSSPath);
      expect(css).toBe(customCSS);
    });

    it('should throw error if file not exists', async () => {
      await expect(
        ThemeManager.loadCustomCSS('/nonexistent/file.css')
      ).rejects.toThrow();
    });
  });
});
