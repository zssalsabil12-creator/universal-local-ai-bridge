const fs = require('fs');
const path = require('path');
const os = require('os');
const cp = require('child_process');

function run(command, args) {
  cp.spawnSync(command, args, { stdio: 'inherit', windowsHide: false });
}

const installDir = path.join(process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local'), 'ULAB');
const archive = path.join(__dirname, '..', 'installer-package', 'ULAB-v1.0.0-Windows.zip');
const temp = path.join(os.tmpdir(), `ulab-install-${Date.now()}`);

console.log('Universal Local AI Bridge â€” Windows Installer');
console.log('Installing to:', installDir);

if (!fs.existsSync(archive)) {
  console.error('Installer payload is missing.');
  process.exit(1);
}

fs.mkdirSync(installDir, { recursive: true });
fs.mkdirSync(temp, { recursive: true });

const ps = [
  '-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command',
  "$zip=$env:ULAB_ARCHIVE; $dst=$env:ULAB_INSTALL; $tmp=$env:ULAB_TEMP; Add-Type -AssemblyName System.IO.Compression.FileSystem; [IO.Compression.ZipFile]::ExtractToDirectory($zip,$tmp); Copy-Item (Join-Path $tmp '*') $dst -Recurse -Force"
];
const env = { ...process.env, ULAB_ARCHIVE: archive, ULAB_INSTALL: installDir, ULAB_TEMP: temp };
const result = cp.spawnSync('powershell.exe', ps, { stdio: 'inherit', env, windowsHide: false });
if (result.status !== 0) process.exit(result.status || 1);

const launcher = path.join(installDir, 'Launch-ULAB.bat');
fs.writeFileSync(launcher, [
  '@echo off',
  'setlocal',
  `start "ULAB Local Agent" "%LOCALAPPDATA%\\ULAB\\ulab-agent.exe" --port 19999 --workspace "%LOCALAPPDATA%\\ULAB\\workspace"`,
  'timeout /t 2 /nobreak >nul',
  'start "" "chrome://extensions/"',
].join('\r\n') + '\r\n', 'ascii');

const psShortcut = `
$w=New-Object -ComObject WScript.Shell;
$s=$w.CreateShortcut([Environment]::GetFolderPath('Desktop') + '\\ULAB.lnk');
$s.TargetPath=$env:LOCALAPPDATA + '\\ULAB\\Launch-ULAB.bat';
$s.WorkingDirectory=$env:LOCALAPPDATA + '\\ULAB';
$s.Description='Universal Local AI Bridge';
$s.Save();
`;
cp.spawnSync('powershell.exe', ['-NoProfile', '-Command', psShortcut], { stdio: 'inherit', windowsHide: false });

try { fs.rmSync(temp, { recursive: true, force: true }); } catch {}
console.log('Installation complete.');
console.log('A desktop shortcut was created.');
console.log('Chrome extension setup will open now.');
cp.spawn('cmd.exe', ['/c', 'start', '', 'chrome://extensions/'], { detached: true, stdio: 'ignore', windowsHide: true }).unref();

