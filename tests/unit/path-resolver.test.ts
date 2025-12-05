// tests/unit/path-resolver.test.ts
import { describe, it, expect } from 'vitest';
import { PathResolver } from '../../src/utils/path-resolver';
import * as os from 'os';
import * as path from 'path';

describe('PathResolver', () => {
  it('should return home directory', () => {
    const homeDir = PathResolver.getHomeDir();
    expect(homeDir).toBe(os.homedir());
  });

  it('should return config directory path', () => {
    const configDir = PathResolver.getConfigDir();
    expect(configDir).toContain('.vimd');
    expect(path.isAbsolute(configDir)).toBe(true);
  });

  it('should return config file path', () => {
    const configPath = PathResolver.getConfigPath();
    expect(configPath).toContain('.vimd');
    expect(configPath).toContain('config.js');
    expect(path.isAbsolute(configPath)).toBe(true);
  });

  it('should resolve relative path to absolute', () => {
    const relativePath = './test.md';
    const resolved = PathResolver.resolve(relativePath);
    expect(path.isAbsolute(resolved)).toBe(true);
  });

  it('should keep absolute path unchanged', () => {
    const absolutePath = '/tmp/test.md';
    const resolved = PathResolver.resolve(absolutePath);
    expect(resolved).toBe(absolutePath);
  });

  it('should expand ~ to home directory', () => {
    const tildePathFile = '~/test.md';
    const resolved = PathResolver.resolve(tildePathFile);
    expect(resolved).toBe(path.join(os.homedir(), 'test.md'));
  });

  it('should expand ~/ to home directory', () => {
    const tildePath = '~/Documents/test.md';
    const resolved = PathResolver.resolve(tildePath);
    expect(resolved).toBe(path.join(os.homedir(), 'Documents', 'test.md'));
  });
});
