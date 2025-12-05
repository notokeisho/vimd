// tests/unit/config-defaults.test.ts
import { describe, it, expect } from 'vitest';
import { DEFAULT_CONFIG } from '../../src/config/defaults';

describe('DEFAULT_CONFIG', () => {
  it('should have default theme as github', () => {
    expect(DEFAULT_CONFIG.theme).toBe('github');
  });

  it('should have default port as 8080', () => {
    expect(DEFAULT_CONFIG.port).toBe(8080);
  });

  it('should have default host as localhost', () => {
    expect(DEFAULT_CONFIG.host).toBe('localhost');
  });

  it('should have default open as true', () => {
    expect(DEFAULT_CONFIG.open).toBe(true);
  });

  it('should have pandoc configuration', () => {
    expect(DEFAULT_CONFIG.pandoc).toBeDefined();
    expect(DEFAULT_CONFIG.pandoc.standalone).toBe(true);
    expect(DEFAULT_CONFIG.pandoc.toc).toBe(false);
    // highlightStyle is optional and removed from defaults
    expect(DEFAULT_CONFIG.pandoc.highlightStyle).toBeUndefined();
  });

  it('should have watch configuration', () => {
    expect(DEFAULT_CONFIG.watch).toBeDefined();
    expect(DEFAULT_CONFIG.watch.ignored).toContain('node_modules/**');
    expect(DEFAULT_CONFIG.watch.debounce).toBe(100);
  });
});
