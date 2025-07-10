# Test Examples and Usage

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration
```

## Test Structure

### Unit Tests
Located in `tests/unit/`, these test individual components in isolation:

- **Utils Tests**: Logger, Cache functionality
- **Service Tests**: YApi client with mocked HTTP calls
- **Config Tests**: Configuration loading and validation
- **Server Tests**: MCP server initialization

### Integration Tests
Located in `tests/integration/`, these test complete workflows:

- **End-to-End API Workflows**: Complete YApi operations
- **Cache Integration**: Cache behavior with real timeouts
- **Error Handling**: Network and API error scenarios

## Test Coverage Goals

- **Statements**: 80%+
- **Branches**: 75%+
- **Functions**: 80%+
- **Lines**: 80%+

## Example Test Commands

```bash
# Test specific file
npx jest tests/unit/utils/logger.test.ts

# Test with verbose output
npx jest --verbose

# Test and generate coverage report
npx jest --coverage --verbose

# Test specific pattern
npx jest --testNamePattern="should cache"
```

## Mock Strategies

### HTTP Mocking with Nock
```typescript
import nock from 'nock';

nock('https://api.example.com')
  .get('/endpoint')
  .reply(200, { data: 'response' });
```

### Service Mocking with Jest
```typescript
jest.mock('../services/yapi-client.js', () => ({
  YApiClient: jest.fn().mockImplementation(() => ({
    getProjects: jest.fn().mockResolvedValue([]),
  })),
}));
```

## Test Environment

Tests run with:
- Node.js test environment
- Suppressed console output
- 10-second timeout (configurable per test)
- Automatic mock cleanup between tests

## CI/CD Integration

Tests are configured for continuous integration with:
- Jest test framework
- Coverage reporting
- ESLint integration
- TypeScript compilation validation