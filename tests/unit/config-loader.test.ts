// tests/unit/config-loader.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ConfigLoader } from '../../src/config/loader';
import { DEFAULT_CONFIG } from '../../src/config/defaults';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';

describe('ConfigLoader', () => {
  const testConfigDir = path.join(os.tmpdir(), 'vimd-test-config');
  const testConfigPath = path.join(testConfigDir, 'config.js');

  beforeEach(async () => {
    // テスト用ディレクトリをクリーンアップ
    await fs.remove(testConfigDir);
  });

  afterEach(async () => {
    await fs.remove(testConfigDir);
    vi.restoreAllMocks();
  });

  describe('merge', () => {
    it('should merge partial config with defaults', () => {
      const partial = { theme: 'dark' as const };
      const merged = ConfigLoader.merge(partial);

      expect(merged.theme).toBe('dark');
      expect(merged.port).toBe(DEFAULT_CONFIG.port);
      expect(merged.host).toBe(DEFAULT_CONFIG.host);
    });

    it('should override nested properties', () => {
      const partial = {
        pandoc: {
          toc: true,
        },
      };
      const merged = ConfigLoader.merge(partial);

      expect(merged.pandoc.toc).toBe(true);
      expect(merged.pandoc.standalone).toBe(DEFAULT_CONFIG.pandoc.standalone);
    });
  });

  describe('save', () => {
    it('should create config directory if not exists', async () => {
      const config = DEFAULT_CONFIG;

      await ConfigLoader.save(config, testConfigPath);

      const exists = await fs.pathExists(testConfigDir);
      expect(exists).toBe(true);
    });

    it('should write config file', async () => {
      const config = { ...DEFAULT_CONFIG, theme: 'dark' as const };

      await ConfigLoader.save(config, testConfigPath);

      const exists = await fs.pathExists(testConfigPath);
      expect(exists).toBe(true);

      const content = await fs.readFile(testConfigPath, 'utf-8');
      expect(content).toContain('defineConfig');
      expect(content).toContain('dark');
    });
  });

  describe('loadGlobal', () => {
    it('should return default config if file not exists', async () => {
      const config = await ConfigLoader.loadGlobal(testConfigPath);
      expect(config).toEqual(DEFAULT_CONFIG);
    });

    it('should load config from file if exists', async () => {
      const savedConfig = { ...DEFAULT_CONFIG, theme: 'minimal' as const };
      await ConfigLoader.save(savedConfig, testConfigPath);

      const loaded = await ConfigLoader.loadGlobal(testConfigPath);
      expect(loaded.theme).toBe('minimal');
    });
  });
});
