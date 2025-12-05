#!/usr/bin/env node

// Run after npm install -g vimd
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const setupScript = path.join(__dirname, '../dist/cli/setup.js');

// Only run if dist exists (not in development mode)
if (fs.existsSync(setupScript)) {
  try {
    execSync(`node ${setupScript}`, { stdio: 'inherit' });
  } catch (error) {
    console.error('Setup failed. You can run "vimd theme" to configure later.');
  }
} else {
  console.log('Skipping setup (development mode)');
}
