#!/usr/bin/env node

// Set executable permission for CLI entry point
const fs = require('fs');
const path = require('path');

const cliPath = path.join(__dirname, '../dist/cli/index.js');

if (fs.existsSync(cliPath)) {
  fs.chmodSync(cliPath, '755');
  console.log(`Set executable permission: ${cliPath}`);
} else {
  console.warn(`CLI entry point not found: ${cliPath}`);
}
