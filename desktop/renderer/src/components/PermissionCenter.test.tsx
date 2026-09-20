import assert from 'node:assert/strict';
import { resolvePermission, DEFAULT_CONFIG } from './PermissionCenter';

const config = {
  ...DEFAULT_CONFIG,
  globalPermissions: { ...DEFAULT_CONFIG.globalPermissions, runTerminal:'allow' as const, writeFiles:'ask' as const },
  rules: [
    { id:'1', resource:'scripts/**', type:'path' as const, level:'deny' as const, description:'Protect scripts' },
    { id:'2', resource:'scripts/release.sh', type:'path' as const, level:'allow' as const, description:'Allow release' },
  ],
};

assert.equal(resolvePermission(config, 'runTerminal', 'scripts/dev.sh'), 'deny');
assert.equal(resolvePermission(config, 'runTerminal', 'scripts/release.sh'), 'allow');
assert.equal(resolvePermission(config, 'runTerminal', 'src/app.ts'), 'allow');
assert.equal(resolvePermission({ ...config, globalPermissions:{ ...config.globalPermissions, deleteFiles:'deny' as const } }, 'deleteFiles', 'src/app.ts'), 'deny');

console.log('Permission policy tests: PASS');
