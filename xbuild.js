#!/usr/bin/env node

// Cross-browser build script for RippleFX
// Builds for Chrome, Firefox, and Edge with proper manifests

const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const BROWSERS = ['chrome', 'firefox', 'edge'];

// Clean all dist directories
BROWSERS.forEach(browser => {
  const distDir = `dist-${browser}`;
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true });
  }
});

console.log('🔨 Building RippleFX for multiple browsers...\n');

BROWSERS.forEach(browser => {
  buildForBrowser(browser);
});

console.log('\n✅ All builds complete!');
console.log('\n📦 Ready to package:');
BROWSERS.forEach(browser => {
  console.log(`   - dist-${browser}/ → ${browser === 'firefox' ? 'Firefox Add-ons' : 'Chrome Web Store'}`);
});

function buildForBrowser(browser) {
  const distDir = `dist-${browser}`;
  const iconsDir = path.join(distDir, 'icons');

  console.log(`📦 Building for ${browser}...`);

  // Create directories
  fs.mkdirSync(distDir);
  fs.mkdirSync(iconsDir);

  // Build content script with browser-specific wrapper
  const contentWrapper = browser === 'firefox' 
    ? '(() => { if (typeof browser !== "undefined" && !self.chrome) { self.chrome = browser; } })();\n'
    : '';

  const contentCode = fs.readFileSync('content.js', 'utf8');
  const wrappedContent = contentWrapper + contentCode;
  
  fs.writeFileSync('_temp_content.js', wrappedContent);

  esbuild.buildSync({
    entryPoints: ['_temp_content.js'],
    bundle: true,
    minify: true,
    outfile: path.join(distDir, 'content.js'),
    target: browser === 'firefox' ? 'firefox109' : 'chrome90',
    format: 'iife',
  });

  fs.unlinkSync('_temp_content.js');

  // Build popup script
  esbuild.buildSync({
    entryPoints: ['popup.js'],
    minify: true,
    outfile: path.join(distDir, 'popup.js'),
    target: browser === 'firefox' ? 'firefox109' : 'chrome90',
  });

  // Minify popup HTML
  const popupHtml = fs.readFileSync('popup.html', 'utf8');
  const minifiedHtml = popupHtml
    .replace(/\n\s+/g, '')
    .replace(/>\s+</g, '><')
    .replace(/\s{2,}/g, ' ');

  fs.writeFileSync(path.join(distDir, 'popup.html'), minifiedHtml);

  // Create browser-specific manifest
  const manifest = createManifest(browser);
  fs.writeFileSync(
    path.join(distDir, 'manifest.json'),
    JSON.stringify(manifest, null, 2)
  );

  // Copy LICENSE
  fs.copyFileSync('LICENSE', path.join(distDir, 'LICENSE'));

  // Copy icons
  const icons = ['icon16.png', 'icon48.png', 'icon128.png', 'icon1024.png'];
  icons.forEach(icon => {
    const src = path.join('icons', icon);
    const dest = path.join(iconsDir, icon);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
    }
  });

  console.log(`   ✓ ${browser} build: ${getFileSize(path.join(distDir, 'content.js'))}`);
}

function createManifest(browser) {
  const baseManifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));

  if (browser === 'firefox') {
    // Firefox-specific additions
    baseManifest.browser_specific_settings = {
      gecko: {
        id: 'ripplefx@limpdev.com',
        strict_min_version: '109.0'
      }
    };
  } else if (browser === 'edge') {
    // Edge uses same manifest as Chrome but with optional tweaks
    baseManifest.author = baseManifest.author || 'limpdev';
  }

  return baseManifest;
}

function getFileSize(filepath) {
  const stats = fs.statSync(filepath);
  const kb = (stats.size / 1024).toFixed(2);
  return `${kb} KB`;
}