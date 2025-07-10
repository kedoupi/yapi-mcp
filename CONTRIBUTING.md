# Contributing to YApi MCP Enhanced

🎉 Thank you for considering contributing to YApi MCP Enhanced! Every contribution helps make this project better.

## 🤝 Ways to Contribute

### 🐛 Report Bugs
- Check existing [issues](https://github.com/kedoupi/yapi-mcp/issues) first
- Use the bug report template
- Include reproduction steps, expected vs actual behavior
- Add relevant logs, screenshots, or code snippets

### 💡 Suggest Features
- Check existing [feature requests](https://github.com/kedoupi/yapi-mcp/issues?q=is%3Aissue+is%3Aopen+label%3Aenhancement)
- Use the feature request template
- Explain the use case and expected benefits
- Consider implementation complexity

### 🔧 Code Contributions
- Fork the repository
- Create a feature branch
- Follow coding standards
- Add tests for new functionality
- Update documentation as needed

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Local Development
```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/yapi-mcp.git
cd yapi-mcp

# Install dependencies
npm install

# Create environment config
cp .env.example .env
# Edit .env with your YApi configuration

# Start development mode
npm run dev

# Run tests
npm test
```

### Branch Naming
- `feature/description` - for new features
- `fix/description` - for bug fixes
- `docs/description` - for documentation updates
- `refactor/description` - for code refactoring

## 📝 Coding Standards

### TypeScript Guidelines
- Use TypeScript strict mode
- Define proper types for all functions
- Avoid `any` type unless absolutely necessary
- Use meaningful variable and function names

### Code Style
- Use ESLint configuration provided
- Follow existing code patterns
- Use 2 spaces for indentation
- Maximum line length: 100 characters
- Use meaningful commit messages

### Testing Requirements
- Write unit tests for new functions
- Add integration tests for new workflows
- Maintain 80%+ test coverage
- Use descriptive test names

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test file
npx jest tests/unit/utils/logger.test.ts

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

## 📋 Pull Request Process

### Before Submitting
1. **Test your changes**
   ```bash
   npm test
   npm run lint
   npm run build
   ```

2. **Update documentation**
   - Update README if needed
   - Add JSDoc comments for new functions
   - Update CHANGELOG if applicable

3. **Check your commit**
   - Meaningful commit messages
   - One logical change per commit
   - Squash related commits if needed

### PR Requirements
- [ ] Tests pass locally
- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] Commit messages are clear
- [ ] Changes are backwards compatible

### PR Template
When creating a PR, please:
- Use the provided PR template
- Reference related issues
- Describe changes and rationale
- Include testing instructions
- Add screenshots for UI changes

## 🚀 Release Process

### Version Numbering
We follow [Semantic Versioning](https://semver.org/):
- `MAJOR.MINOR.PATCH`
- MAJOR: Breaking changes
- MINOR: New features (backwards compatible)
- PATCH: Bug fixes (backwards compatible)

### Release Steps
1. Update version in `package.json`
2. Update CHANGELOG.md
3. Create release PR
4. After merge, tag release
5. Publish to npm (maintainers only)

## 📊 Issue Labels

- `bug` - Something isn't working
- `enhancement` - New feature request
- `documentation` - Documentation improvements
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed
- `question` - Further information requested
- `wontfix` - This won't be worked on

## 💬 Communication

### Questions & Discussions
- [GitHub Discussions](https://github.com/kedoupi/yapi-mcp/discussions) for general questions
- [Issues](https://github.com/kedoupi/yapi-mcp/issues) for bug reports and feature requests

### Code of Conduct
- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Assume positive intent

## 🎯 Priority Areas

We especially welcome contributions in:
- 🧪 **Testing**: Improve test coverage and quality
- 📚 **Documentation**: Better examples and guides
- 🐛 **Bug fixes**: Issues marked as `good first issue`
- 🚀 **Performance**: Optimization and caching improvements
- 🔧 **Tooling**: Development and CI/CD improvements

## 🏆 Recognition

Contributors will be:
- Listed in the README contributors section
- Mentioned in release notes for significant contributions
- Invited to join the core team for sustained contributions

## 📋 Project Roadmap

### Current Focus
- Enhanced Mock data support
- Batch operations for multiple APIs
- Real-time synchronization with YApi
- Multi-project parallel management

### Future Plans
- GraphQL API support
- Web-based configuration UI
- Custom plugin system
- Advanced analytics dashboard

## 🙋‍♀️ Need Help?

- Check existing [documentation](./docs)
- Browse [GitHub Discussions](https://github.com/kedoupi/yapi-mcp/discussions)
- Look at [good first issues](https://github.com/kedoupi/yapi-mcp/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22)

Thank you for contributing! 🚀