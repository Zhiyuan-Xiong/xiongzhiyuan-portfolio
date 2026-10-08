import { spawn } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const stableUploadRuntime = join(root, '../.tool-cache/node-lts/node-v22.23.3-win-x64/node.exe');
const uploadRuntime = existsSync(stableUploadRuntime) ? stableUploadRuntime : process.execPath;
const run = (args, runtime = process.execPath) => new Promise((resolve, reject) => {
  const child = spawn(runtime, args, { cwd: root, stdio: 'inherit' });
  child.on('error', reject);
  child.on('exit', code => code === 0 ? resolve() : reject(new Error(`Command failed (${code}): ${args.join(' ')}`)));
});
try {
  const project = join(root, 'scripts/project.mjs');
  for (const task of ['check', 'build', 'test']) await run([project, task]);
  await run([project, 'wrangler', 'pages', 'deploy', 'dist', '--project-name=xiongzhiyuan-portfolio', '--branch=main'], uploadRuntime);
  await run([join(root, 'scripts/verify-public-site.mjs')], uploadRuntime);
  console.log('Published and verified: https://xiongzhiyuan-portfolio.pages.dev/');
} catch (cause) {
  console.error(cause.message);
  process.exitCode = 1;
}
