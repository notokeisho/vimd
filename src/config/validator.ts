// src/config/validator.ts
import { VimdConfig } from './types.js';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

const VALID_THEMES = ['github', 'minimal', 'dark', 'academic', 'technical'];

export class ConfigValidator {
  static validatePort(port: number): boolean {
    return Number.isInteger(port) && port > 0 && port <= 65535;
  }

  static validateTheme(theme: string): boolean {
    return VALID_THEMES.includes(theme);
  }

  static validate(config: VimdConfig): ValidationResult {
    const errors: string[] = [];

    // Port validation
    if (!this.validatePort(config.port)) {
      errors.push(`Invalid port number: ${config.port}`);
    }

    // Theme validation
    if (!this.validateTheme(config.theme)) {
      errors.push(`Invalid theme: ${config.theme}`);
    }

    // Host validation
    if (!config.host || config.host.trim() === '') {
      errors.push('Host cannot be empty');
    }

    // Pandoc validation
    if (config.pandoc.tocDepth !== undefined) {
      if (config.pandoc.tocDepth < 1 || config.pandoc.tocDepth > 6) {
        errors.push(
          `Invalid tocDepth: ${config.pandoc.tocDepth} (must be 1-6)`
        );
      }
    }

    // Watch debounce validation
    if (config.watch.debounce < 0) {
      errors.push(
        `Invalid debounce: ${config.watch.debounce} (must be >= 0)`
      );
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
