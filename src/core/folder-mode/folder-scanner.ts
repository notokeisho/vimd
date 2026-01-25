import * as fs from 'fs/promises';
import * as path from 'path';
import type {
  TreeNode,
  FileNode,
  FolderNode,
  SupportedExtension,
  FolderScannerOptions,
} from './types.js';

/**
 * Default exclude patterns
 */
const DEFAULT_EXCLUDE_PATTERNS = ['node_modules', '.git', 'dist', 'build'];

/**
 * Supported file extensions
 */
const SUPPORTED_EXTENSIONS: SupportedExtension[] = ['.md', '.tex', '.latex'];

/**
 * Folder scanner for building file tree structure
 */
export class FolderScanner {
  private rootPath: string;
  private excludePatterns: string[];

  constructor(options: FolderScannerOptions) {
    this.rootPath = options.rootPath;
    this.excludePatterns = [
      ...DEFAULT_EXCLUDE_PATTERNS,
      ...(options.excludePatterns || []),
    ];
  }

  /**
   * Scan the folder and return tree structure
   */
  async scan(): Promise<TreeNode[]> {
    return this.scanDirectory(this.rootPath, '');
  }

  /**
   * Recursively scan a directory
   */
  private async scanDirectory(
    dirPath: string,
    relativePath: string
  ): Promise<TreeNode[]> {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    const nodes: TreeNode[] = [];

    for (const entry of entries) {
      const entryRelativePath =
        relativePath === '' ? entry.name : path.join(relativePath, entry.name);

      // Skip hidden files/folders (except at root level when explicitly specified)
      if (relativePath !== '' && this.isHidden(entry.name)) {
        continue;
      }

      // Skip excluded patterns
      if (this.shouldExclude(entry.name)) {
        continue;
      }

      if (entry.isDirectory()) {
        // Recursively scan subdirectory
        const children = await this.scanDirectory(
          path.join(dirPath, entry.name),
          entryRelativePath
        );

        // Only add folder if it has matching files
        if (children.length > 0) {
          const folderNode: FolderNode = {
            name: entry.name,
            path: entryRelativePath,
            type: 'folder',
            children,
          };
          nodes.push(folderNode);
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();

        // Only include supported extensions
        if (this.isSupportedExtension(ext)) {
          const fileNode: FileNode = {
            name: entry.name,
            path: entryRelativePath,
            type: 'file',
            extension: ext as SupportedExtension,
          };
          nodes.push(fileNode);
        }
      }
    }

    return this.sortNodes(nodes);
  }

  /**
   * Check if a name is hidden (starts with .)
   */
  private isHidden(name: string): boolean {
    return name.startsWith('.');
  }

  /**
   * Check if a name matches exclude patterns
   */
  private shouldExclude(name: string): boolean {
    return this.excludePatterns.includes(name);
  }

  /**
   * Check if extension is supported
   */
  private isSupportedExtension(ext: string): boolean {
    return SUPPORTED_EXTENSIONS.includes(ext as SupportedExtension);
  }

  /**
   * Sort nodes: folders first, then files, both in alphabetical order
   */
  private sortNodes(nodes: TreeNode[]): TreeNode[] {
    return nodes.sort((a, b) => {
      // Folders come first
      if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1;
      }
      // Alphabetical order (case-insensitive)
      return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
    });
  }
}
