#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import open from 'open';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const PORT = process.env.PORT || 3847;

console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🔷 Claude HEX Visualizer                                ║
║   3D Hexagonal Agent Visualization                        ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
`);

const args = process.argv.slice(2);
const command = args[0];

if (command === 'help' || command === '--help' || command === '-h') {
  console.log(`
Usage: claude-hex [command]

Commands:
  (default)     Start the visualizer
  help          Show this help message
  version       Show version information

The visualizer will automatically:
  - Scan your ~/.claude/projects/ directory for sessions
  - Display active Claude Code instances in a 3D hex grid
  - Update in real-time as sessions change

Requirements:
  - Claude Code must be installed and have created sessions
  - A modern web browser with WebGL support
`);
  process.exit(0);
}

if (command === 'version' || command === '--version' || command === '-v') {
  const pkg = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf-8'));
  console.log(`claude-hex v${pkg.version}`);
  process.exit(0);
}

// Check if dist exists (production mode)
const distPath = join(rootDir, 'dist');
const serverPath = join(rootDir, 'dist-server', 'index.js');

if (existsSync(distPath) && existsSync(serverPath)) {
  // Production mode - use built files
  console.log('Starting production server...');

  import(serverPath).then(() => {
    console.log(`\n🌐 Open http://localhost:${PORT} in your browser`);

    // Auto-open browser after a short delay
    setTimeout(() => {
      open(`http://localhost:${PORT}`).catch(() => {
        console.log('Could not open browser automatically. Please open the URL manually.');
      });
    }, 1000);
  }).catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
} else {
  // Development mode - run npm dev
  console.log('Starting in development mode...');
  console.log(`\n🌐 The app will open at http://localhost:5173`);

  const dev = spawn('npm', ['run', 'dev'], {
    cwd: rootDir,
    stdio: 'inherit',
    shell: true,
  });

  dev.on('error', (err) => {
    console.error('Failed to start:', err);
    process.exit(1);
  });

  // Auto-open browser after Vite starts
  setTimeout(() => {
    open('http://localhost:5173').catch(() => {
      console.log('Could not open browser automatically.');
    });
  }, 3000);

  process.on('SIGINT', () => {
    dev.kill();
    process.exit(0);
  });
}
