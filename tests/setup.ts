import { jest } from '@jest/globals';

// Global test setup
beforeAll(() => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.LOG_LEVEL = 'error'; // Suppress logs during tests
});

afterAll(() => {
  // Cleanup after all tests
  jest.restoreAllMocks();
});

// Mock console methods to reduce noise in test output
const originalConsole = global.console;
beforeEach(() => {
  global.console = {
    ...originalConsole,
    log: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  } as any;
});

afterEach(() => {
  global.console = originalConsole;
  jest.clearAllMocks();
});

// Increase timeout for integration tests
jest.setTimeout(15000);