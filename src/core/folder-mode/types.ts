/**
 * Folder mode type definitions
 */

/**
 * Supported file extensions for folder mode
 */
export type SupportedExtension = '.md' | '.tex' | '.latex';

/**
 * File node in the tree structure
 */
export interface FileNode {
  /** File name (e.g., "plan.md") */
  name: string;
  /** Relative path from root (e.g., "docs/plan.md") */
  path: string;
  /** Node type */
  type: 'file';
  /** File extension */
  extension: SupportedExtension;
}

/**
 * Folder node in the tree structure
 */
export interface FolderNode {
  /** Folder name (e.g., "docs") */
  name: string;
  /** Relative path from root (e.g., "docs") */
  path: string;
  /** Node type */
  type: 'folder';
  /** Child nodes (sorted) */
  children: TreeNode[];
}

/**
 * Tree node (file or folder)
 */
export type TreeNode = FileNode | FolderNode;

/**
 * Type guard for FileNode
 */
export function isFileNode(node: TreeNode): node is FileNode {
  return node.type === 'file';
}

/**
 * Type guard for FolderNode
 */
export function isFolderNode(node: TreeNode): node is FolderNode {
  return node.type === 'folder';
}

/**
 * Folder scanner options
 */
export interface FolderScannerOptions {
  /** Root path to scan */
  rootPath: string;
  /** Additional exclude patterns (glob) */
  excludePatterns?: string[];
}

/**
 * Folder mode server options
 */
export interface FolderModeOptions {
  /** Root path of the folder */
  rootPath: string;
  /** Server port */
  port: number;
  /** Theme name */
  theme: string;
  /** Open browser on start */
  open: boolean;
}

/**
 * WebSocket message from server to client
 */
export type ServerMessage =
  | { type: 'tree'; data: TreeNode[] }
  | { type: 'content'; data: { path: string; html: string } }
  | { type: 'reload' }
  | { type: 'error'; data: { type: string; message: string } }
  | { type: 'fileDeleted'; data: { path: string } };

/**
 * WebSocket message from client to server
 */
export type ClientMessage = { type: 'selectFile'; path: string };
