// tests/unit/config-validator.test.ts
import { describe, it, expect } from 'vitest';
import { ConfigValidator } from '../../src/config/validator';
import { DEFAULT_CONFIG } from '../../src/config/defaults';

describe('ConfigValidator', () => {
  describe('validatePort', () => {
    it('should accept valid port numbers', () => {
      expect(ConfigValidator.validatePort(8080)).toBe(true);
      expect(ConfigValidator.validatePort(3000)).toBe(true);
      expect(ConfigValidator.validatePort(65535)).toBe(true);
    });

    it('should reject port 0', () => {
      expect(ConfigValidator.validatePort(0)).toBe(false);
    });

    it('should reject negative ports', () => {
      expect(ConfigValidator.validatePort(-1)).toBe(false);
    });

    it('should reject ports above 65535', () => {
      expect(ConfigValidator.validatePort(65536)).toBe(false);
    });
  });

  describe('validateTheme', () => {
    it('should accept valid themes', () => {
      expect(ConfigValidator.validateTheme('github')).toBe(true);
      expect(ConfigValidator.validateTheme('minimal')).toBe(true);
      expect(ConfigValidator.validateTheme('dark')).toBe(true);
      expect(ConfigValidator.validateTheme('academic')).toBe(true);
      expect(ConfigValidator.validateTheme('technical')).toBe(true);
    });

    it('should reject invalid themes', () => {
      expect(ConfigValidator.validateTheme('invalid')).toBe(false);
      expect(ConfigValidator.validateTheme('')).toBe(false);
    });
  });

  describe('validate', () => {
    it('should validate correct config', () => {
      const result = ConfigValidator.validate(DEFAULT_CONFIG);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect invalid port', () => {
      const config = { ...DEFAULT_CONFIG, port: 70000 };
      const result = ConfigValidator.validate(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid port number: 70000');
    });

    it('should detect invalid theme', () => {
      const config = { ...DEFAULT_CONFIG, theme: 'invalid' as any };
      const result = ConfigValidator.validate(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid theme: invalid');
    });

    it('should detect multiple errors', () => {
      const config = {
        ...DEFAULT_CONFIG,
        port: -1,
        theme: 'invalid' as any,
      };
      const result = ConfigValidator.validate(config);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });
});
