import { describe, it, expect } from 'vitest';
import { isValidType, mapType } from './typeValidator';

describe('typeValidator Utility', () => {
  describe('isValidType', () => {
    it('validates primitive types', () => {
      expect(isValidType('number')).toBe(true);
      expect(isValidType('string')).toBe(true);
      expect(isValidType('boolean')).toBe(true);
      expect(isValidType('void')).toBe(true);
    });

    it('validates generic types', () => {
      expect(isValidType('array<number>')).toBe(true);
      expect(isValidType('matrix<string>')).toBe(true);
      expect(isValidType('tree<number>')).toBe(true);
      expect(isValidType('array<array<number>>')).toBe(true);
    });

    it('rejects invalid types', () => {
      expect(isValidType('int')).toBe(false);
      expect(isValidType('array')).toBe(false);
      expect(isValidType('array<>')).toBe(false);
      expect(isValidType('number<int>')).toBe(false);
    });
  });

  describe('mapType', () => {
    it('maps to C++', () => {
      expect(mapType('cpp', 'number')).toBe('int');
      expect(mapType('cpp', 'array<number>')).toBe('vector<int>');
      expect(mapType('cpp', 'tree<number>')).toBe('TreeNode*');
    });

    it('maps to Java', () => {
      expect(mapType('java', 'number')).toBe('int');
      expect(mapType('java', 'array<number>')).toBe('int[]');
      expect(mapType('java', 'matrix<number>')).toBe('int[][]');
    });

    it('maps to Go', () => {
      expect(mapType('go', 'number')).toBe('int');
      expect(mapType('go', 'array<number>')).toBe('[]int');
    });
  });
});
