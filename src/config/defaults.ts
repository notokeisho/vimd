// src/config/defaults.ts
import { VimdConfig } from './types.js';

export const DEFAULT_CONFIG: VimdConfig = {
  theme: 'github',
  port: 38080,
  host: 'localhost',
  open: true,
  pandoc: {
    standalone: false, // Template is always used, so standalone is not needed
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
  math: {
    enabled: true,
    engine: 'mathjax',
  },
  devParser: 'markdown-it',
  buildParser: 'pandoc',
};
