#!/usr/bin/env node
// scripts/copy-assets.cjs
const fs = require('fs-extra');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');

async function copyAssets() {
  try {
    // Copy theme styles
    const stylesSource = path.join(projectRoot, 'src', 'themes', 'styles');
    const stylesDest = path.join(projectRoot, 'dist', 'themes', 'styles');
    await fs.copy(stylesSource, stylesDest);
    console.log('✓ Copied theme styles to dist/themes/styles/');

    // Copy templates
    const templatesSource = path.join(projectRoot, 'templates');
    const templatesDest = path.join(projectRoot, 'dist', 'templates');
    await fs.copy(templatesSource, templatesDest);
    console.log('✓ Copied templates to dist/templates/');
  } catch (error) {
    console.error('✗ Failed to copy assets:', error.message);
    process.exit(1);
  }
}

copyAssets();
