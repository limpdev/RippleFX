#!/usr/bin/env node

// Package script for creating distributable .zip files
// Works cross-platform (Windows, Mac, Linux)

const fs = require("fs");
const path = require("path");
const archiver = require("archiver");

const BROWSERS = ["chrome", "firefox", "edge"];

console.log("📦 Packaging RippleFX extensions...\n");

async function packageBrowser(browser) {
  const distDir = `dist-${browser}`;
  const outputFile = `ripplefx-${browser}.zip`;

  if (!fs.existsSync(distDir)) {
    console.log(`⚠️  ${distDir} not found. Run 'yarn build:cross' first.`);
    return;
  }

  // Remove existing zip if present
  if (fs.existsSync(outputFile)) {
    fs.unlinkSync(outputFile);
  }

  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputFile);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", () => {
      const sizeMB = (archive.pointer() / 1024 / 1024).toFixed(2);
      console.log(`✓ ${outputFile} (${sizeMB} MB)`);
      resolve();
    });

    archive.on("error", reject);
    archive.pipe(output);

    // Add all files from dist directory
    archive.directory(distDir, false);
    archive.finalize();
  });
}

async function packageAll() {
  for (const browser of BROWSERS) {
    await packageBrowser(browser);
  }
  console.log("\n✅ All packages created!");
  console.log("\n📤 Ready to upload:");
  console.log("   - ripplefx-chrome.zip → Chrome Web Store");
  console.log("   - ripplefx-firefox.zip → Firefox Add-ons");
  console.log("   - ripplefx-edge.zip → Edge Add-ons");
}

packageAll().catch((err) => {
  console.error("❌ Packaging failed:", err);
  process.exit(1);
});
