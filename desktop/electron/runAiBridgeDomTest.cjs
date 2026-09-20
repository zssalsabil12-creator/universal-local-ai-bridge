const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const electron = require('electron');

const args = ['--no-sandbox', 'electron/aiBridgeDom.test.cjs'];
const hasXvfb = fs.existsSync('/usr/bin/xvfb-run') || fs.existsSync('/bin/xvfb-run');
const command = process.platform === 'linux' && hasXvfb ? 'xvfb-run' : electron;
const commandArgs = process.platform === 'linux' && hasXvfb
  ? ['--auto-servernum', electron, ...args]
  : args;

const result = spawnSync(command, commandArgs, {
  stdio: 'inherit',
  cwd: process.cwd(),
  shell: false,
});

if (result.error) {
  console.error(result.error);
  process.exit(1);
}
process.exit(result.status ?? 1);
