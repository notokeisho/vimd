// src/config/types.ts

export interface VimdConfig {
  theme: 'github' | 'minimal' | 'dark' | 'academic' | 'technical';
  port: number;
  host: string;
  open: boolean;
  css?: string;
  template?: string;
  pandoc: PandocConfig;
  watch: WatchConfig;
  build?: BuildConfig;
}

export interface PandocConfig {
  standalone: boolean;
  toc: boolean;
  tocDepth?: number;
  highlightStyle: string;
  metadata?: Record<string, string>;
}

export interface WatchConfig {
  ignored: string[];
  debounce: number;
}

export interface BuildConfig {
  output?: string;
  inlineCSS: boolean;
  standalone: boolean;
}

export interface ThemeInfo {
  name: string;
  displayName: string;
  description: string;
  cssPath: string;
}

export interface ServerConfig {
  port: number;
  host: string;
  open: boolean;
  root: string;
}

export interface ConverterConfig {
  theme: string;
  pandocOptions: PandocConfig;
  customCSS?: string;
  template?: string;
}

export function defineConfig(config: Partial<VimdConfig>): VimdConfig {
  return config as VimdConfig;
}
