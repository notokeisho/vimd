# Development Guide

This guide explains how to set up a development environment for vimd.

## Prerequisites

- **Node.js** >= 18.0.0 (ESM support required)
- **pandoc** >= 2.0
- **Git**

## Setup

```bash
# Clone the repository
git clone https://github.com/notokeisho/vimd.git
cd vimd

# Install dependencies
npm install

# Build the project
npm run build
```

## Development Commands

| Command | Description |
|---------|-------------|
| `npm run build` | Build TypeScript to JavaScript |
| `npm run dev` | Run in development mode |
| `npm test` | Run tests |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run typecheck` | Type checking with tsc |
| `npm run lint` | Lint with ESLint |
| `npm run format` | Format with Prettier |

## Development Workflow

### Running in Development Mode

```bash
# Run vimd with a test file
npm run dev -- dev test.md

# Run with specific options
npm run dev -- dev test.md --port 3000 --theme dark
```

### Building

```bash
# Build once
npm run build

# Watch mode (if available)
npm run build -- --watch
```

### Testing

```bash
# Run all tests
npm test

# Run specific test file
npm test -- tests/unit/converter.test.ts

# Run with coverage
npm run test:coverage
```

## Code Style

- **TypeScript** with strict mode
- **ESM** (ES Modules) format
- **Prettier** for formatting
- **ESLint** for linting

### Import Order

1. Node.js built-in modules
2. External dependencies
3. Internal modules (absolute paths)
4. Relative imports

```typescript
// Example
import path from 'path';
import fs from 'fs-extra';
import { Command } from 'commander';
import { ConfigLoader } from '../config/loader.js';
import { logger } from './logger.js';
```

## Making Changes

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

```bash
git checkout -b feature/my-feature
# Make changes
npm test
npm run lint
git commit -m "feat: add my feature"
git push origin feature/my-feature
```

## Debugging

### VS Code

Add this configuration to `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug vimd",
      "program": "${workspaceFolder}/dist/cli/index.js",
      "args": ["dev", "test.md"],
      "outFiles": ["${workspaceFolder}/dist/**/*.js"]
    }
  ]
}
```

### Console Logging

Use the built-in logger:

```typescript
import { logger } from '../utils/logger.js';

logger.info('Information message');
logger.warn('Warning message');
logger.error('Error message');
logger.debug('Debug message');
```
