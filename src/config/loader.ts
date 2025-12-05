// src/config/loader.ts
import { VimdConfig } from './types.js';
import { DEFAULT_CONFIG } from './defaults.js';
import { PathResolver } from '../utils/path-resolver.js';
import * as fs from 'fs-extra';
import * as path from 'path';

export class ConfigLoader {
  static merge(partial: Partial<VimdConfig>): VimdConfig {
    return {
      ...DEFAULT_CONFIG,
      ...partial,
      pandoc: partial.pandoc
        ? {
            ...DEFAULT_CONFIG.pandoc,
            ...partial.pandoc,
          }
        : DEFAULT_CONFIG.pandoc,
      watch: partial.watch
        ? {
            ...DEFAULT_CONFIG.watch,
            ...partial.watch,
          }
        : DEFAULT_CONFIG.watch,
      build: partial.build
        ? {
            ...DEFAULT_CONFIG.build,
            ...partial.build,
          }
        : DEFAULT_CONFIG.build,
    };
  }

  static async save(
    config: VimdConfig,
    configPath?: string
  ): Promise<void> {
    const targetPath = configPath || PathResolver.getConfigPath();
    const configDir = path.dirname(targetPath);

    // ディレクトリ作成
    await fs.ensureDir(configDir);

    // TypeScript設定ファイルとして出力
    const content = this.generateConfigFile(config);
    await fs.writeFile(targetPath, content, 'utf-8');
  }

  static async loadGlobal(configPath?: string): Promise<VimdConfig> {
    const targetPath = configPath || PathResolver.getConfigPath();

    // ファイルが存在しない場合はデフォルト設定を返す
    if (!(await fs.pathExists(targetPath))) {
      return DEFAULT_CONFIG;
    }

    try {
      // TypeScript設定ファイルを動的にインポート
      // 注: 実際の実装では、tsx等でTypeScriptファイルを実行する必要がある
      // 今回は簡易的にJSONとしてパース
      const content = await fs.readFile(targetPath, 'utf-8');
      const config = this.parseConfigFile(content);
      return this.merge(config);
    } catch (error) {
      console.error('Failed to load config file:', error);
      return DEFAULT_CONFIG;
    }
  }

  private static generateConfigFile(config: VimdConfig): string {
    return `import { defineConfig } from 'vimd';

export default defineConfig(${JSON.stringify(config, null, 2)});
`;
  }

  private static parseConfigFile(content: string): Partial<VimdConfig> {
    // 簡易的なパース (実際はtsx等でTypeScriptを実行)
    // JSON部分を抽出
    const match = content.match(/defineConfig\(([\s\S]*)\);/);
    if (match) {
      try {
        return JSON.parse(match[1]);
      } catch {
        return {};
      }
    }
    return {};
  }
}
