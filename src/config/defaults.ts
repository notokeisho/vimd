// src/config/defaults.ts
import { VimdConfig } from './types.js';

export const DEFAULT_CONFIG: VimdConfig = {
  theme: 'github',
  port: 38080,
  host: 'localhost',
  open: true,
  pandoc: {
    standalone: true,
    toc: false,
    tocDepth: 3,
  },
  watch: {
    ignored: ['node_modules/**', '.git/**', 'dist/**'],
    debounce: 100,
  },
  build: {
    inlineCSS: false,
    standalone: true,
  },
  devParser: 'markdown-it',
  buildParser: 'pandoc',
};
