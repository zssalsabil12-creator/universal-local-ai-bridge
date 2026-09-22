const fs = require('node:fs');
const { spawnSync } = require('node:child_process');
const electron = require('electron');

const args = ['--no-sandbox', '--disable-gpu', 'electron/aiBridgeDom.test.cjs'];
const hasXvfb = fs.existsSync('/usr/bin/xvfb-run') || fs.existsSync('/bin/xvfb-run');
const command = process.platform === 'linux' && hasXvfb ? 'xvfb-run' : electron;
const commandArgs = process.platform === 'linux' && hasXvfb
  ? ['--auto-servernum', electron, ...args]
  : args;

const result = spawnSync(command, commandArgs, {
  stdio: 'inherit',
  cwd: process.cwd(),
  shell: false,
  timeout: 60000,
  killSignal: 'SIGTERM',
});

if (result.error) {
  console.error(result.error);
  process.exit(1);
}
process.exit(result.status ?? 1);
