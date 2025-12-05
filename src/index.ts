// src/index.ts
// Public API exports for vimd library

// ==================== 型定義エクスポート ====================
export type { VimdConfig, ThemeInfo } from './config/types.js';
export { defineConfig } from './config/types.js';

// ==================== コア機能エクスポート ====================
export { MarkdownConverter } from './core/converter.js';
export { FileWatcher } from './core/watcher.js';
export { LiveServer } from './core/server.js';
export { PandocDetector } from './core/pandoc-detector.js';

// ==================== テーマ管理エクスポート ====================
export { ThemeManager } from './themes/index.js';

// ==================== 設定管理エクスポート ====================
export { ConfigLoader } from './config/loader.js';
export { DEFAULT_CONFIG } from './config/defaults.js';
export { ConfigValidator } from './config/validator.js';

// ==================== ユーティリティエクスポート ====================
export { Logger } from './utils/logger.js';
export { OSDetector } from './utils/os-detector.js';
export { PathResolver } from './utils/path-resolver.js';
