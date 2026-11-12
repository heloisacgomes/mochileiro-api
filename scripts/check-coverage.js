import { spawnSync } from 'node:child_process';
const result = spawnSync(process.execPath, ['--experimental-test-coverage', '--test', 'tests/integration.test.js', 'tests/validation.test.js'], { encoding: 'utf8' });
process.stdout.write(result.stdout || '');
process.stderr.write(result.stderr || '');
if (result.status !== 0) process.exit(result.status ?? 1);
const match = result.stdout.match(/^# all files\s*\|\s*([\d.]+)\s*\|/m);
if (!match) { console.error('Não foi possível detectar a cobertura de linhas'); process.exit(1); }
const coverage = Number(match[1]);
const minimum = 80;
console.log(`Cobertura de linhas: ${coverage}% (mínimo: ${minimum}%)`);
if (coverage < minimum) process.exit(1);
