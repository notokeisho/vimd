// src/utils/path-resolver.ts
import { homedir } from 'os';
import { join, resolve as pathResolve, isAbsolute } from 'path';

export class PathResolver {
  static getHomeDir(): string {
    return homedir();
  }

  static getConfigDir(): string {
    return join(this.getHomeDir(), '.vimd');
  }

  static getConfigPath(): string {
    return join(this.getConfigDir(), 'config.js');
  }

  static resolve(path: string): string {
    // ~ または ~/ で始まる場合はホームディレクトリに展開
    if (path.startsWith('~/') || path === '~') {
      return join(this.getHomeDir(), path.slice(2));
    }

    // 既に絶対パスの場合はそのまま返す
    if (isAbsolute(path)) {
      return path;
    }

    // 相対パスを絶対パスに変換
    return pathResolve(process.cwd(), path);
  }
}
