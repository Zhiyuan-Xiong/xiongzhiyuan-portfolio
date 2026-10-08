import { spawn } from 'node:child_process';
import { mkdirSync, existsSync } from 'node:fs';
import { dirname, join, delimiter } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const cache = join(dirname(root), '.tool-cache');
const temp = join(cache, 'tmp');
const config = join(root, '.cache', 'cloudflare');
for (const dir of [temp, config, join(config, 'logs'), join(cache, 'xdg-cache'), join(cache, 'python-pycache'), join(cache, 'pip')]) {
  mkdirSync(dir, { recursive: true });
}
const env = {
  ...process.env,
  TEMP: temp, TMP: temp, TMPDIR: temp,
  XDG_CONFIG_HOME: config,
  XDG_CACHE_HOME: join(cache, 'xdg-cache'),
  WRANGLER_LOG_PATH: join(config, 'logs'),
  WRANGLER_SEND_METRICS: 'false',
  ASTRO_TELEMETRY_DISABLED: '1',
  PYTHONPYCACHEPREFIX: join(cache, 'python-pycache'),
  PIP_CACHE_DIR: join(cache, 'pip'),
  PYTHONPATH: [join(root, '.cache', 'python-libs'), process.env.PYTHONPATH].filter(Boolean).join(delimiter),
};
const [task, ...args] = process.argv.slice(2);
if (task === 'build') await import('./prepare-entry-atlas.mjs');
let executable = process.execPath;
let command;
if (['dev', 'build', 'preview', 'check'].includes(task)) {
  command = [join(root, 'node_modules', 'astro', 'bin', 'astro.mjs'), task, ...args];
} else if (task === 'test') {
  command = [join(root, 'scripts', 'verify-site.mjs'), ...args];
} else if (task === 'wrangler') {
  command = [join(root, 'node_modules', 'wrangler', 'bin', 'wrangler.js'), ...args];
} else if (['font', 'images', 'resumes', 'contact-sheet'].includes(task)) {
  const bundledPython = join(dirname(dirname(dirname(process.execPath))), 'python', 'python.exe');
  executable = process.env.PORTFOLIO_PYTHON || (process.platform === 'win32' && existsSync(bundledPython) ? bundledPython : 'python');
  const scripts = { font: 'prepare-font.py', images: 'prepare-images.py', resumes: 'create-resumes.py', 'contact-sheet': 'inspect-sources.py' };
  command = [join(root, 'scripts', scripts[task]), ...args];
} else {
  console.error('Use dev, build, preview, check, test, wrangler, font, images, resumes, or contact-sheet.');
  process.exit(1);
}
const child = spawn(executable, command, { cwd: root, env, stdio: 'inherit' });
child.on('error', (error) => { console.error(error.message); process.exitCode = 1; });
child.on('exit', (code) => { process.exitCode = code ?? 1; });