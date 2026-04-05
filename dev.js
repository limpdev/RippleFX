#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

console.log('👀 Starting dev watcher...');
console.log('Press Ctrl+C to stop.\n');

function runBuild() {
  try {
    // Run the primary build script
    execSync('node build.js', { stdio: 'inherit' });
    console.log(`\n✨ Build complete! Reload the unpacked extension from the 'dist' directory in your browser.`);
  } catch (e) {
    console.error('\n❌ Build failed.');
  }
}

// Perform an initial build
runBuild();

// Watch the current directory for changes
let timeout;
fs.watch('.', { recursive: true }, (eventType, filename) => {
  if (!filename) return;
  
  // Normalize path separators to handle both Windows and Unix paths
  const normalizedPath = filename.replace(/\\/g, '/');
  
  // Ignore generated directories, dependencies, and the watcher itself
  if (
    normalizedPath.startsWith('dist') || 
    normalizedPath.startsWith('node_modules') || 
    normalizedPath.startsWith('.git') ||
    normalizedPath.endsWith('.zip') ||
    normalizedPath.includes('_temp_') ||
    normalizedPath === 'dev.js'
  ) {
    return;
  }

  // Debounce rapid events
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    console.log(`\n🔄 File changed: ${filename}`);
    runBuild();
  }, 100);
});
