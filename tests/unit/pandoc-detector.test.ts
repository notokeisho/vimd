// tests/unit/pandoc-detector.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PandocDetector } from '../../src/core/pandoc-detector';
import { execSync } from 'child_process';

vi.mock('child_process');

describe('PandocDetector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('check', () => {
    it('should return true if pandoc is installed', () => {
      vi.mocked(execSync).mockReturnValue(Buffer.from('pandoc 2.19'));

      const result = PandocDetector.check();
      expect(result).toBe(true);
    });

    it('should return false if pandoc is not installed', () => {
      vi.mocked(execSync).mockImplementation(() => {
        throw new Error('command not found');
      });

      const result = PandocDetector.check();
      expect(result).toBe(false);
    });
  });

  describe('detectOS', () => {
    it('should return macos for darwin', () => {
      const originalPlatform = process.platform;
      Object.defineProperty(process, 'platform', { value: 'darwin' });

      const os = PandocDetector.detectOS();
      expect(os).toBe('macos');

      Object.defineProperty(process, 'platform', { value: originalPlatform });
    });

    it('should return windows for win32', () => {
      const originalPlatform = process.platform;
      Object.defineProperty(process, 'platform', { value: 'win32' });

      const os = PandocDetector.detectOS();
      expect(os).toBe('windows');

      Object.defineProperty(process, 'platform', { value: originalPlatform });
    });
  });

  describe('showInstallGuide', () => {
    it('should log install guide for macOS', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => {}) as any);

      PandocDetector.showInstallGuide('macos');

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('brew install pandoc'));
      expect(exitSpy).toHaveBeenCalledWith(1);

      consoleSpy.mockRestore();
      exitSpy.mockRestore();
    });

    it('should log install guide for Windows', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => {}) as any);

      PandocDetector.showInstallGuide('windows');

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('choco install pandoc'));
      expect(exitSpy).toHaveBeenCalledWith(1);

      consoleSpy.mockRestore();
      exitSpy.mockRestore();
    });
  });
});
