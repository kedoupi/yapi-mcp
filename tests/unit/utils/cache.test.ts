import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { SimpleCache } from '../../../src/utils/cache.js';

describe('SimpleCache', () => {
  let cache: SimpleCache<string>;

  beforeEach(() => {
    cache = new SimpleCache<string>(1); // 1 second TTL for testing
  });

  describe('constructor', () => {
    it('should create cache with default TTL', () => {
      const defaultCache = new SimpleCache<string>();
      expect(defaultCache).toBeInstanceOf(SimpleCache);
    });

    it('should create cache with custom TTL', () => {
      const customCache = new SimpleCache<string>(600);
      expect(customCache).toBeInstanceOf(SimpleCache);
    });
  });

  describe('set and get', () => {
    it('should store and retrieve values', () => {
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');
    });

    it('should return null for non-existent keys', () => {
      expect(cache.get('nonexistent')).toBeNull();
    });

    it('should overwrite existing values', () => {
      cache.set('key1', 'value1');
      cache.set('key1', 'value2');
      expect(cache.get('key1')).toBe('value2');
    });
  });

  describe('TTL expiration', () => {
    it('should expire values after TTL', async () => {
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      expect(cache.get('key1')).toBeNull();
    });

    it('should return valid values before expiration', async () => {
      cache.set('key1', 'value1');
      
      // Wait less than TTL
      await new Promise(resolve => setTimeout(resolve, 500));
      
      expect(cache.get('key1')).toBe('value1');
    });
  });

  describe('has', () => {
    it('should return true for existing keys', () => {
      cache.set('key1', 'value1');
      expect(cache.has('key1')).toBe(true);
    });

    it('should return false for non-existent keys', () => {
      expect(cache.has('nonexistent')).toBe(false);
    });

    it('should return false for expired keys', async () => {
      cache.set('key1', 'value1');
      expect(cache.has('key1')).toBe(true);

      await new Promise(resolve => setTimeout(resolve, 1100));
      expect(cache.has('key1')).toBe(false);
    });
  });

  describe('delete', () => {
    it('should delete existing keys', () => {
      cache.set('key1', 'value1');
      expect(cache.has('key1')).toBe(true);
      
      cache.delete('key1');
      expect(cache.has('key1')).toBe(false);
    });

    it('should handle deleting non-existent keys gracefully', () => {
      expect(() => cache.delete('nonexistent')).not.toThrow();
    });
  });

  describe('clear', () => {
    it('should clear all cached values', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');
      
      expect(cache.has('key1')).toBe(true);
      expect(cache.has('key2')).toBe(true);
      expect(cache.has('key3')).toBe(true);
      
      cache.clear();
      
      expect(cache.has('key1')).toBe(false);
      expect(cache.has('key2')).toBe(false);
      expect(cache.has('key3')).toBe(false);
    });
  });

  describe('cleanup', () => {
    it('should remove expired entries', async () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      
      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      // Add a new key
      cache.set('key3', 'value3');
      
      // Cleanup should remove expired keys but keep valid ones
      cache.cleanup();
      
      expect(cache.has('key1')).toBe(false);
      expect(cache.has('key2')).toBe(false);
      expect(cache.has('key3')).toBe(true);
    });

    it('should handle cleanup on empty cache', () => {
      expect(() => cache.cleanup()).not.toThrow();
    });
  });

  describe('edge cases', () => {
    it('should handle storing null and undefined values', () => {
      const cache = new SimpleCache<any>(1);
      
      cache.set('null-key', null);
      cache.set('undefined-key', undefined);
      
      expect(cache.get('null-key')).toBeNull();
      expect(cache.get('undefined-key')).toBeUndefined();
    });

    it('should handle complex objects', () => {
      const cache = new SimpleCache<object>(1);
      const obj = { foo: 'bar', nested: { value: 123 } };
      
      cache.set('object-key', obj);
      expect(cache.get('object-key')).toEqual(obj);
    });
  });
});