import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { Logger, type LogLevel } from '../../../src/utils/logger.js';

describe('Logger', () => {
  let logger: Logger;
  let consoleSpy: {
    debug: jest.MockedFunction<any>;
    info: jest.MockedFunction<any>;
    warn: jest.MockedFunction<any>;
    error: jest.MockedFunction<any>;
  };

  beforeEach(() => {
    consoleSpy = {
      debug: jest.spyOn(console, 'debug').mockImplementation(),
      info: jest.spyOn(console, 'info').mockImplementation(),
      warn: jest.spyOn(console, 'warn').mockImplementation(),
      error: jest.spyOn(console, 'error').mockImplementation(),
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should create logger with default info level', () => {
      logger = new Logger();
      logger.info('test message');
      expect(consoleSpy.info).toHaveBeenCalledWith('[INFO] test message');
    });

    it('should create logger with specified level', () => {
      logger = new Logger('error');
      logger.warn('test warning');
      expect(consoleSpy.warn).not.toHaveBeenCalled();
      
      logger.error('test error');
      expect(consoleSpy.error).toHaveBeenCalledWith('[ERROR] test error');
    });
  });

  describe('setLevel', () => {
    it('should update log level', () => {
      logger = new Logger('info');
      logger.debug('debug message');
      expect(consoleSpy.debug).not.toHaveBeenCalled();

      logger.setLevel('debug');
      logger.debug('debug message');
      expect(consoleSpy.debug).toHaveBeenCalledWith('[DEBUG] debug message');
    });
  });

  describe('logging methods', () => {
    beforeEach(() => {
      logger = new Logger('debug');
    });

    it('should log debug messages', () => {
      logger.debug('debug message', { extra: 'data' });
      expect(consoleSpy.debug).toHaveBeenCalledWith('[DEBUG] debug message', { extra: 'data' });
    });

    it('should log info messages', () => {
      logger.info('info message', 'arg1', 'arg2');
      expect(consoleSpy.info).toHaveBeenCalledWith('[INFO] info message', 'arg1', 'arg2');
    });

    it('should log warn messages', () => {
      logger.warn('warning message');
      expect(consoleSpy.warn).toHaveBeenCalledWith('[WARN] warning message');
    });

    it('should log error messages', () => {
      logger.error('error message');
      expect(consoleSpy.error).toHaveBeenCalledWith('[ERROR] error message');
    });
  });

  describe('log level filtering', () => {
    const testCases: Array<{ level: LogLevel; expected: string[] }> = [
      { level: 'debug', expected: ['debug', 'info', 'warn', 'error'] },
      { level: 'info', expected: ['info', 'warn', 'error'] },
      { level: 'warn', expected: ['warn', 'error'] },
      { level: 'error', expected: ['error'] },
    ];

    testCases.forEach(({ level, expected }) => {
      it(`should filter logs correctly for ${level} level`, () => {
        logger = new Logger(level);
        
        logger.debug('debug');
        logger.info('info');
        logger.warn('warn');
        logger.error('error');

        expect(consoleSpy.debug).toHaveBeenCalledTimes(expected.includes('debug') ? 1 : 0);
        expect(consoleSpy.info).toHaveBeenCalledTimes(expected.includes('info') ? 1 : 0);
        expect(consoleSpy.warn).toHaveBeenCalledTimes(expected.includes('warn') ? 1 : 0);
        expect(consoleSpy.error).toHaveBeenCalledTimes(expected.includes('error') ? 1 : 0);
      });
    });
  });
});