// src/core/pandoc-detector.ts
import { execSync } from 'child_process';
import { OSType } from '../utils/os-detector.js';

export class PandocDetector {
  static check(): boolean {
    try {
      execSync('pandoc --version', { stdio: 'pipe' });
      return true;
    } catch {
      return false;
    }
  }

  static detectOS(): OSType {
    switch (process.platform) {
      case 'darwin':
        return 'macos';
      case 'win32':
        return 'windows';
      case 'linux':
        // Simplified: default to debian-based
        return 'linux-debian';
      default:
        return 'linux-debian';
    }
  }

  static showInstallGuide(os: OSType): void {
    console.error('⚠️  pandoc not found');
    console.error('');
    console.error('pandoc is required for the selected parser mode.');
    console.error('');
    console.error('Option 1: Use markdown-it mode (no pandoc needed)');
    console.error('  vimd dev document.md       (default, fast preview)');
    console.error('  vimd build document.md --fast');
    console.error('');
    console.error('Option 2: Install pandoc for high-quality output');
    console.error('');

    switch (os) {
      case 'macos':
        console.error('  macOS (Homebrew):');
        console.error('    brew install pandoc');
        console.error('');
        console.error('  macOS (Official installer):');
        console.error('    https://github.com/jgm/pandoc/releases');
        break;

      case 'linux-debian':
        console.error('  Debian/Ubuntu:');
        console.error('    sudo apt-get update');
        console.error('    sudo apt-get install pandoc');
        break;

      case 'linux-redhat':
        console.error('  RedHat/CentOS/Fedora:');
        console.error('    sudo yum install pandoc');
        break;

      case 'windows':
        console.error('  Windows (Chocolatey):');
        console.error('    choco install pandoc');
        console.error('');
        console.error('  Windows (Official installer):');
        console.error('    https://github.com/jgm/pandoc/releases');
        break;
    }

    console.error('');
    console.error('For more installation options:');
    console.error('  https://pandoc.org/installing.html');
    console.error('');

    process.exit(1);
  }

  static ensureInstalled(): void {
    if (this.check()) {
      return;
    }

    const os = this.detectOS();
    this.showInstallGuide(os);
  }
}
