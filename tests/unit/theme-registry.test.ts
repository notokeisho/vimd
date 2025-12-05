// tests/unit/theme-registry.test.ts
import { describe, it, expect } from 'vitest';
import { THEMES, getThemeByName } from '../../src/themes/registry';

describe('Theme Registry', () => {
  it('should export 5 themes', () => {
    expect(THEMES).toHaveLength(5);
  });

  it('should have github theme', () => {
    const github = THEMES.find((t) => t.name === 'github');
    expect(github).toBeDefined();
    expect(github?.displayName).toContain('GitHub');
  });

  it('should have all required themes', () => {
    const names = THEMES.map((t) => t.name);
    expect(names).toContain('github');
    expect(names).toContain('minimal');
    expect(names).toContain('dark');
    expect(names).toContain('academic');
    expect(names).toContain('technical');
  });

  it('should return theme by name', () => {
    const theme = getThemeByName('github');
    expect(theme).toBeDefined();
    expect(theme?.name).toBe('github');
  });

  it('should return undefined for invalid theme', () => {
    const theme = getThemeByName('invalid');
    expect(theme).toBeUndefined();
  });

  it('should have cssPath for each theme', () => {
    THEMES.forEach((theme) => {
      expect(theme.cssPath).toBeDefined();
      expect(theme.cssPath).toContain('.css');
    });
  });
});
