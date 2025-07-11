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

    it('should handle empty string keys', () => {
      cache.set('', 'empty-key-value');
      expect(cache.get('')).toBe('empty-key-value');
    });

    it('should handle very long keys', () => {
      const longKey = 'a'.repeat(1000);
      cache.set(longKey, 'long-key-value');
      expect(cache.get(longKey)).toBe('long-key-value');
    });

    it('should handle special characters in keys', () => {
      const specialKey = '!@#$%^&*()_+{}|:"<>?[]\\;\',./ 中文キー';
      cache.set(specialKey, 'special-value');
      expect(cache.get(specialKey)).toBe('special-value');
    });
  });

  describe('concurrent operations', () => {
    it('should handle concurrent set/get operations', async () => {
      const promises = [];
      const cache = new SimpleCache<number>(5);

      // Simulate concurrent writes
      for (let i = 0; i < 100; i++) {
        promises.push(
          new Promise<void>((resolve) => {
            setTimeout(() => {
              cache.set(`key-${i}`, i);
              resolve();
            }, Math.random() * 10);
          })
        );
      }

      await Promise.all(promises);

      // Verify all values are set
      for (let i = 0; i < 100; i++) {
        expect(cache.get(`key-${i}`)).toBe(i);
      }
    });

    it('should handle rapid set operations on same key', () => {
      for (let i = 0; i < 1000; i++) {
        cache.set('rapid-key', `value-${i}`);
      }
      expect(cache.get('rapid-key')).toBe('value-999');
    });

    it('should handle concurrent cleanup operations', async () => {
      const cache = new SimpleCache<string>(0.1); // Very short TTL
      
      // Set some values
      for (let i = 0; i < 10; i++) {
        cache.set(`key-${i}`, `value-${i}`);
      }

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 150));

      // Run multiple cleanups concurrently
      const cleanupPromises = Array(5).fill(0).map(() => 
        new Promise<void>(resolve => {
          cache.cleanup();
          resolve();
        })
      );

      await Promise.all(cleanupPromises);

      // Verify cache is cleaned
      for (let i = 0; i < 10; i++) {
        expect(cache.has(`key-${i}`)).toBe(false);
      }
    });
  });

  describe('memory usage considerations', () => {
    it('should handle large number of entries', () => {
      const cache = new SimpleCache<string>(10);
      const entryCount = 10000;

      // Add many entries
      for (let i = 0; i < entryCount; i++) {
        cache.set(`key-${i}`, `value-${i}`);
      }

      // Verify random samples
      for (let i = 0; i < 100; i++) {
        const randomKey = Math.floor(Math.random() * entryCount);
        expect(cache.get(`key-${randomKey}`)).toBe(`value-${randomKey}`);
      }
    });

    it('should handle cache operations after expiration without automatic cleanup', async () => {
      const cache = new SimpleCache<string>(0.1); // 100ms TTL
      
      // Fill cache with data
      for (let i = 0; i < 100; i++) {
        cache.set(`key-${i}`, `value-${i}`);
      }

      // Wait for expiration but don't cleanup
      await new Promise(resolve => setTimeout(resolve, 150));

      // Verify expired items return null but are still in memory until accessed
      expect(cache.get('key-0')).toBeNull();
      expect(cache.get('key-50')).toBeNull();
      expect(cache.get('key-99')).toBeNull();

      // Add new items after expiration
      cache.set('new-key', 'new-value');
      expect(cache.get('new-key')).toBe('new-value');
    });
  });
});