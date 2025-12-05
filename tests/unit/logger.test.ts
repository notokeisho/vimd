// tests/unit/logger.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Logger } from '../../src/utils/logger';

describe('Logger', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should log info messages', () => {
    Logger.info('test message');
    expect(console.log).toHaveBeenCalled();
  });

  it('should log success messages', () => {
    Logger.success('success message');
    expect(console.log).toHaveBeenCalled();
  });

  it('should log warning messages', () => {
    Logger.warn('warning message');
    expect(console.log).toHaveBeenCalled();
  });

  it('should log error messages', () => {
    Logger.error('error message');
    expect(console.error).toHaveBeenCalled();
  });
});
