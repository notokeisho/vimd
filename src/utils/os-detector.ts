// src/utils/os-detector.ts
import { platform } from 'os';
import { existsSync } from 'fs';

export type OSType = 'macos' | 'linux-debian' | 'linux-redhat' | 'windows';

export class OSDetector {
  static isMac(): boolean {
    return process.platform === 'darwin';
  }

  static isLinux(): boolean {
    return process.platform === 'linux';
  }

  static isWindows(): boolean {
    return process.platform === 'win32';
  }

  static detect(): OSType {
    if (this.isMac()) {
      return 'macos';
    }

    if (this.isWindows()) {
      return 'windows';
    }

    if (this.isLinux()) {
      // Debian系かRedHat系か判定
      if (existsSync('/etc/debian_version')) {
        return 'linux-debian';
      }
      if (existsSync('/etc/redhat-release')) {
        return 'linux-redhat';
      }
      // デフォルトはDebian系として扱う
      return 'linux-debian';
    }

    throw new Error(`Unsupported platform: ${platform()}`);
  }
}
