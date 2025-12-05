# Contributing to vimd

🌐 English | [日本語](CONTRIBUTING.md)

Thank you for considering contributing to vimd!

## Development Setup

1. Fork the repository
2. Clone your fork
3. Install dependencies: `npm install`
4. Create a branch: `git checkout -b feature/your-feature`

## Development Workflow

### Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

### Code Quality

```bash
# Lint
npm run lint
npm run lint:fix

# Format
npm run format

# Type check
npm run typecheck
```

### Building

```bash
npm run build
```

## Testing Your Changes

```bash
# Run vimd locally
npm run dev -- dev test.md
npm run dev -- build test.md
```

## Commit Messages

Follow Conventional Commits format:

```
<type>: <description>

<body>

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

### Examples

```
feat: add theme switching feature

- Support 5 built-in themes
- Interactive selection via vimd theme command

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
```

## Pull Request Process

1. Add/update tests for your changes
2. Ensure all tests pass
3. Update documentation if needed
4. Create pull request with clear description

## Coding Standards

### TypeScript

- Use strict mode
- Prefer explicit type annotations
- Minimize use of `any`

### File Organization

- One responsibility per file
- Keep related code in the same directory
- Place tests in `tests/` directory

### Naming Conventions

- File names: kebab-case (`config-loader.ts`)
- Class names: PascalCase (`ConfigLoader`)
- Function/variable names: camelCase (`loadConfig`)
- Constants: UPPER_SNAKE_CASE (`DEFAULT_PORT`)

## Reporting Issues

When reporting a bug, please include:

1. **Environment**: OS, Node.js version, pandoc version
2. **Steps to reproduce**: How to reproduce the issue
3. **Expected behavior**: What should happen
4. **Actual behavior**: What actually happened
5. **Error messages**: Console output if available

## Feature Requests

When proposing a new feature:

1. Check existing issues first
2. Clearly describe the use case
3. Provide implementation suggestions if possible

## Questions & Support

- Ask questions on [GitHub Issues](https://github.com/notokeishou/vimd/issues)
- Use the `question` tag

---

Thank you again for considering contributing! 🙏
