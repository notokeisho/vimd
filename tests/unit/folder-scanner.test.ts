// tests/unit/folder-scanner.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FolderScanner } from '../../src/core/folder-mode/folder-scanner';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';

describe('FolderScanner', () => {
  const testDir = path.join(os.tmpdir(), 'vimd-folder-scanner-test');

  beforeEach(async () => {
    await fs.ensureDir(testDir);
  });

  afterEach(async () => {
    await fs.remove(testDir);
  });

  describe('basic scan', () => {
    it('should scan markdown files', async () => {
      await fs.writeFile(path.join(testDir, 'README.md'), '# README');
      await fs.writeFile(path.join(testDir, 'plan.md'), '# Plan');

      const scanner = new FolderScanner({ rootPath: testDir });
      const tree = await scanner.scan();

      expect(tree).toHaveLength(2);
      expect(tree[0].name).toBe('plan.md');
      expect(tree[1].name).toBe('README.md');
    });

    it('should scan tex and latex files', async () => {
      await fs.writeFile(path.join(testDir, 'thesis.tex'), '\\documentclass{article}');
      await fs.writeFile(path.join(testDir, 'paper.latex'), '\\documentclass{article}');

      const scanner = new FolderScanner({ rootPath: testDir });
      const tree = await scanner.scan();

      expect(tree).toHaveLength(2);
      expect(tree.find((n) => n.name === 'thesis.tex')).toBeDefined();
      expect(tree.find((n) => n.name === 'paper.latex')).toBeDefined();
    });

    it('should ignore unsupported extensions', async () => {
      await fs.writeFile(path.join(testDir, 'README.md'), '# README');
      await fs.writeFile(path.join(testDir, 'script.js'), 'console.log("hi")');
      await fs.writeFile(path.join(testDir, 'style.css'), 'body {}');

      const scanner = new FolderScanner({ rootPath: testDir });
      const tree = await scanner.scan();

      expect(tree).toHaveLength(1);
      expect(tree[0].name).toBe('README.md');
    });
  });

  describe('recursive scan', () => {
    it('should scan subdirectories', async () => {
      await fs.ensureDir(path.join(testDir, 'docs'));
      await fs.writeFile(path.join(testDir, 'README.md'), '# README');
      await fs.writeFile(path.join(testDir, 'docs', 'plan.md'), '# Plan');

      const scanner = new FolderScanner({ rootPath: testDir });
      const tree = await scanner.scan();

      expect(tree).toHaveLength(2);

      const docsFolder = tree.find((n) => n.name === 'docs');
      expect(docsFolder).toBeDefined();
      expect(docsFolder?.type).toBe('folder');

      if (docsFolder?.type === 'folder') {
        expect(docsFolder.children).toHaveLength(1);
        expect(docsFolder.children[0].name).toBe('plan.md');
      }
    });

    it('should not include empty folders', async () => {
      await fs.ensureDir(path.join(testDir, 'empty'));
      await fs.writeFile(path.join(testDir, 'README.md'), '# README');

      const scanner = new FolderScanner({ rootPath: testDir });
      const tree = await scanner.scan();

      expect(tree).toHaveLength(1);
      expect(tree[0].name).toBe('README.md');
    });

    it('should not include folders with only unsupported files', async () => {
      await fs.ensureDir(path.join(testDir, 'scripts'));
      await fs.writeFile(path.join(testDir, 'scripts', 'build.sh'), '#!/bin/bash');
      await fs.writeFile(path.join(testDir, 'README.md'), '# README');

      const scanner = new FolderScanner({ rootPath: testDir });
      const tree = await scanner.scan();

      expect(tree).toHaveLength(1);
      expect(tree[0].name).toBe('README.md');
    });
  });

  describe('exclude patterns', () => {
    it('should exclude node_modules', async () => {
      await fs.ensureDir(path.join(testDir, 'node_modules', 'some-pkg'));
      await fs.writeFile(
        path.join(testDir, 'node_modules', 'some-pkg', 'README.md'),
        '# Package'
      );
      await fs.writeFile(path.join(testDir, 'README.md'), '# README');

      const scanner = new FolderScanner({ rootPath: testDir });
      const tree = await scanner.scan();

      expect(tree).toHaveLength(1);
      expect(tree[0].name).toBe('README.md');
    });

    it('should exclude .git', async () => {
      await fs.ensureDir(path.join(testDir, '.git'));
      await fs.writeFile(path.join(testDir, '.git', 'config.md'), '# Config');
      await fs.writeFile(path.join(testDir, 'README.md'), '# README');

      const scanner = new FolderScanner({ rootPath: testDir });
      const tree = await scanner.scan();

      expect(tree).toHaveLength(1);
      expect(tree[0].name).toBe('README.md');
    });

    it('should exclude dist and build', async () => {
      await fs.ensureDir(path.join(testDir, 'dist'));
      await fs.ensureDir(path.join(testDir, 'build'));
      await fs.writeFile(path.join(testDir, 'dist', 'output.md'), '# Output');
      await fs.writeFile(path.join(testDir, 'build', 'output.md'), '# Output');
      await fs.writeFile(path.join(testDir, 'README.md'), '# README');

      const scanner = new FolderScanner({ rootPath: testDir });
      const tree = await scanner.scan();

      expect(tree).toHaveLength(1);
      expect(tree[0].name).toBe('README.md');
    });
  });

  describe('hidden files', () => {
    it('should exclude hidden files in subdirectories', async () => {
      await fs.ensureDir(path.join(testDir, 'docs'));
      await fs.writeFile(path.join(testDir, 'docs', '.hidden.md'), '# Hidden');
      await fs.writeFile(path.join(testDir, 'docs', 'visible.md'), '# Visible');

      const scanner = new FolderScanner({ rootPath: testDir });
      const tree = await scanner.scan();

      expect(tree).toHaveLength(1);
      const docsFolder = tree[0];
      if (docsFolder.type === 'folder') {
        expect(docsFolder.children).toHaveLength(1);
        expect(docsFolder.children[0].name).toBe('visible.md');
      }
    });

    it('should exclude hidden folders in subdirectories', async () => {
      await fs.ensureDir(path.join(testDir, 'docs', '.hidden'));
      await fs.writeFile(path.join(testDir, 'docs', '.hidden', 'secret.md'), '# Secret');
      await fs.writeFile(path.join(testDir, 'docs', 'visible.md'), '# Visible');

      const scanner = new FolderScanner({ rootPath: testDir });
      const tree = await scanner.scan();

      expect(tree).toHaveLength(1);
      const docsFolder = tree[0];
      if (docsFolder.type === 'folder') {
        expect(docsFolder.children).toHaveLength(1);
        expect(docsFolder.children[0].name).toBe('visible.md');
      }
    });

    it('should include hidden files at root level', async () => {
      await fs.writeFile(path.join(testDir, '.hidden.md'), '# Hidden');
      await fs.writeFile(path.join(testDir, 'visible.md'), '# Visible');

      const scanner = new FolderScanner({ rootPath: testDir });
      const tree = await scanner.scan();

      expect(tree).toHaveLength(2);
      expect(tree.find((n) => n.name === '.hidden.md')).toBeDefined();
    });
  });

  describe('sorting', () => {
    it('should sort folders before files', async () => {
      await fs.ensureDir(path.join(testDir, 'docs'));
      await fs.writeFile(path.join(testDir, 'docs', 'plan.md'), '# Plan');
      await fs.writeFile(path.join(testDir, 'aaa.md'), '# AAA');

      const scanner = new FolderScanner({ rootPath: testDir });
      const tree = await scanner.scan();

      expect(tree).toHaveLength(2);
      expect(tree[0].type).toBe('folder');
      expect(tree[0].name).toBe('docs');
      expect(tree[1].type).toBe('file');
      expect(tree[1].name).toBe('aaa.md');
    });

    it('should sort alphabetically (case-insensitive)', async () => {
      await fs.writeFile(path.join(testDir, 'Zebra.md'), '# Zebra');
      await fs.writeFile(path.join(testDir, 'apple.md'), '# Apple');
      await fs.writeFile(path.join(testDir, 'Banana.md'), '# Banana');

      const scanner = new FolderScanner({ rootPath: testDir });
      const tree = await scanner.scan();

      expect(tree).toHaveLength(3);
      expect(tree[0].name).toBe('apple.md');
      expect(tree[1].name).toBe('Banana.md');
      expect(tree[2].name).toBe('Zebra.md');
    });
  });

  describe('file node properties', () => {
    it('should have correct extension property', async () => {
      await fs.writeFile(path.join(testDir, 'doc.md'), '# Doc');
      await fs.writeFile(path.join(testDir, 'thesis.tex'), '\\documentclass');

      const scanner = new FolderScanner({ rootPath: testDir });
      const tree = await scanner.scan();

      const mdFile = tree.find((n) => n.name === 'doc.md');
      const texFile = tree.find((n) => n.name === 'thesis.tex');

      expect(mdFile?.type).toBe('file');
      if (mdFile?.type === 'file') {
        expect(mdFile.extension).toBe('.md');
      }

      expect(texFile?.type).toBe('file');
      if (texFile?.type === 'file') {
        expect(texFile.extension).toBe('.tex');
      }
    });

    it('should have correct path property', async () => {
      await fs.ensureDir(path.join(testDir, 'docs', 'specs'));
      await fs.writeFile(path.join(testDir, 'docs', 'specs', 'api.md'), '# API');

      const scanner = new FolderScanner({ rootPath: testDir });
      const tree = await scanner.scan();

      const docsFolder = tree[0];
      if (docsFolder.type === 'folder') {
        expect(docsFolder.path).toBe('docs');

        const specsFolder = docsFolder.children[0];
        if (specsFolder.type === 'folder') {
          expect(specsFolder.path).toBe('docs/specs');

          const apiFile = specsFolder.children[0];
          expect(apiFile.path).toBe('docs/specs/api.md');
        }
      }
    });
  });
});
