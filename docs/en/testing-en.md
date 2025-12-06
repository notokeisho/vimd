# Testing

This document describes the testing strategy and structure for vimd.

## Test Framework

vimd uses **Vitest** for testing.

## Test Structure

```
tests/
├── unit/                    # Unit tests
│   ├── converter.test.ts    # Markdown converter tests
│   ├── config-loader.test.ts # Configuration tests
│   ├── theme-manager.test.ts # Theme system tests
│   ├── watcher.test.ts      # File watcher tests
│   ├── pandoc-detector.test.ts # pandoc detection tests
│   └── session-manager.test.ts # Session management tests
│
└── integration/             # Integration tests
    └── cli.test.ts          # CLI integration tests
```

## Running Tests

```bash
# Run all tests
npm test

# Run with watch mode
npm test -- --watch

# Run specific file
npm test -- tests/unit/converter.test.ts

# Run tests matching pattern
npm test -- --grep "converter"
```

## Coverage

```bash
# Run with coverage
npm run test:coverage

# Coverage report location
open coverage/index.html
```

### Current Coverage

| Metric | Coverage |
|--------|----------|
| Statements | 73.52% |
| Branches | 77.98% |
| Functions | 82.08% |
| Lines | 73.52% |

## Writing Tests

### Unit Test Example

```typescript
import { describe, it, expect } from 'vitest';
import { ThemeManager } from '../../src/themes/manager';

describe('ThemeManager', () => {
  describe('list', () => {
    it('should return all available themes', () => {
      const themes = ThemeManager.list();

      expect(themes).toHaveLength(5);
      expect(themes.map(t => t.name)).toContain('github');
    });
  });

  describe('get', () => {
    it('should return CSS content for valid theme', () => {
      const css = ThemeManager.get('github');

      expect(css).toContain('body');
      expect(css).toContain('font-family');
    });

    it('should throw for invalid theme', () => {
      expect(() => ThemeManager.get('invalid'))
        .toThrow('Theme not found');
    });
  });
});
```

### Async Test Example

```typescript
import { describe, it, expect } from 'vitest';
import { ConfigLoader } from '../../src/config/loader';

describe('ConfigLoader', () => {
  describe('loadGlobal', () => {
    it('should load default config when file does not exist', async () => {
      const config = await ConfigLoader.loadGlobal();

      expect(config.theme).toBe('github');
      expect(config.port).toBe(8080);
    });
  });
});
```

### Mocking Example

```typescript
import { describe, it, expect, vi } from 'vitest';
import { execSync } from 'child_process';
import { PandocDetector } from '../../src/core/pandoc-detector';

vi.mock('child_process');

describe('PandocDetector', () => {
  it('should detect pandoc when installed', () => {
    vi.mocked(execSync).mockReturnValue(Buffer.from('pandoc 3.0.0'));

    const result = PandocDetector.detect();

    expect(result.installed).toBe(true);
    expect(result.version).toBe('3.0.0');
  });
});
```

## Test Guidelines

1. **Isolation**: Each test should be independent
2. **Clarity**: Test names should describe behavior
3. **Coverage**: Aim for high coverage on critical paths
4. **Speed**: Keep tests fast (mock external dependencies)

## Known Issues

### Skipped Tests

Some tests are skipped due to flaky behavior:

- `session-manager.test.ts`: Timing issues with file I/O between parallel tests

These are marked with `.skip` and documented in the test files.
