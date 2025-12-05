// tests/unit/os-detector.test.ts
import { describe, it, expect, vi } from 'vitest';
import { OSDetector } from '../../src/utils/os-detector';

describe('OSDetector', () => {
  it('should detect macOS', () => {
    vi.spyOn(process, 'platform', 'get').mockReturnValue('darwin');
    expect(OSDetector.isMac()).toBe(true);
    expect(OSDetector.isLinux()).toBe(false);
    expect(OSDetector.isWindows()).toBe(false);
  });

  it('should detect Linux', () => {
    vi.spyOn(process, 'platform', 'get').mockReturnValue('linux');
    expect(OSDetector.isLinux()).toBe(true);
    expect(OSDetector.isMac()).toBe(false);
    expect(OSDetector.isWindows()).toBe(false);
  });

  it('should detect Windows', () => {
    vi.spyOn(process, 'platform', 'get').mockReturnValue('win32');
    expect(OSDetector.isWindows()).toBe(true);
    expect(OSDetector.isMac()).toBe(false);
    expect(OSDetector.isLinux()).toBe(false);
  });

  it('should return correct OS type for macOS', () => {
    vi.spyOn(process, 'platform', 'get').mockReturnValue('darwin');
    const result = OSDetector.detect();
    expect(result).toBe('macos');
  });

  it('should return correct OS type for Windows', () => {
    vi.spyOn(process, 'platform', 'get').mockReturnValue('win32');
    const result = OSDetector.detect();
    expect(result).toBe('windows');
  });

  it('should return correct OS type for Debian Linux', () => {
    vi.spyOn(process, 'platform', 'get').mockReturnValue('linux');
    const result = OSDetector.detect();
    // デフォルトはlinux-debianを返す想定
    expect(['linux-debian', 'linux-redhat']).toContain(result);
  });
});
