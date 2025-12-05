// tests/integration/cli.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { execSync } from 'child_process';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';

describe('CLI Integration Tests', () => {
  const testDir = path.join(os.tmpdir(), 'vimd-cli-test');
  const testMd = path.join(testDir, 'test.md');

  beforeEach(async () => {
    await fs.ensureDir(testDir);
    await fs.writeFile(testMd, '# Test\n\nHello **world**!');
  });

  afterEach(async () => {
    await fs.remove(testDir);
  });

  it('should show version', () => {
    const output = execSync('npm run dev -- --version', {
      encoding: 'utf-8',
    });

    expect(output).toContain('0.1.0');
  });

  it('should show help', () => {
    const output = execSync('npm run dev -- --help', {
      encoding: 'utf-8',
    });

    expect(output).toContain('vimd');
    expect(output).toContain('dev');
    expect(output).toContain('build');
  });

  it('should build HTML file', () => {
    const outputPath = path.join(testDir, 'output.html');

    execSync(`npm run dev build ${testMd} -- -o ${outputPath}`, {
      encoding: 'utf-8',
      cwd: process.cwd(),
    });

    expect(fs.existsSync(outputPath)).toBe(true);

    const html = fs.readFileSync(outputPath, 'utf-8');
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<h1');
    expect(html).toContain('Test');
  });
});
