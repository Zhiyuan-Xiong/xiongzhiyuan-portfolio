import { readdirSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, 'dist');
const origin = new URL(process.argv[2] || 'https://xiongzhiyuan-portfolio.pages.dev');
if (origin.protocol !== 'https:') throw new Error('Verify an HTTPS production address.');
const walk = directory => readdirSync(directory, { withFileTypes: true }).flatMap(entry =>
  entry.isDirectory() ? walk(join(directory, entry.name)) : [join(directory, entry.name)]);
const files = walk(dist);
const report = { checkedAt: new Date().toISOString(), origin: origin.origin, pages: [], assets: [], ranges: [], errors: [] };
const error = message => report.errors.push(message);
async function request(path, options = {}) {
  let last;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await fetch(new URL(path, origin), { ...options, signal: AbortSignal.timeout(20000) });
      if (response.status >= 500 && attempt === 0) { await response.body?.cancel(); continue; }
      return response;
    } catch (cause) { last = cause; }
  }
  throw last;
}
async function parallel(items, task, concurrency = 6) {
  let index = 0;
  await Promise.all(Array.from({ length: Math.min(items.length, concurrency) }, async () => {
    while (index < items.length) {
      const item = items[index++];
      try { await task(item); } catch (cause) { error(`${item}: ${cause.message}`); }
    }
  }));
}
const redirect = await request('/', { redirect: 'manual' });
report.root = { status: redirect.status, location: redirect.headers.get('location') };
const entrance = await redirect.text();
if (redirect.status !== 200 || report.root.location || !entrance.includes('data-mode="intro"') || !entrance.includes('EUAN PLANET') || /http-equiv="refresh"/.test(entrance)) error('Root does not directly serve the planet entrance.');
const htmlFiles = files.filter(path => path.endsWith('.html') && !['index.html', '404.html'].includes(relative(dist, path)));
await parallel(htmlFiles, async file => {
  const path = '/' + relative(dist, file).replaceAll('\\', '/').replace(/index\.html$/, '');
  const response = await request(path);
  const html = await response.text();
  const canonical = html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/)?.[1];
  const item = { path, status: response.status, canonical, cache: response.headers.get('cache-control') };
  report.pages.push(item);
  if (response.status !== 200 || !response.headers.get('content-type')?.includes('text/html')) error(`${path}: HTML not publicly available (${response.status}).`);
  if (canonical !== new URL(path, origin).href) error(`${path}: incorrect canonical URL.`);
  if (!html.includes('property="og:image"') || !html.includes('hreflang="en"') || !html.includes('hreflang="zh-CN"')) error(`${path}: missing sharing/language metadata.`);
});
console.log(`Checked ${report.pages.length} anonymous public pages.`);
const assets = files.filter(path => !path.endsWith('.html') && !['_headers', '_redirects'].includes(relative(dist, path)));
await parallel(assets, async file => {
  const path = '/' + relative(dist, file).replaceAll('\\', '/');
  const response = await request(path, { method: 'HEAD' });
  const type = response.headers.get('content-type');
  const item = { path, status: response.status, type, bytes: response.headers.get('content-length'), cache: response.headers.get('cache-control') };
  report.assets.push(item);
  if (response.status !== 200 || type?.includes('text/html')) error(`${path}: asset unavailable or replaced by HTML (${response.status}).`);
  if (path.startsWith('/media/') && !item.cache?.includes('max-age=86400')) error(`${path}: media cache policy missing.`);
  if (report.assets.length % 100 === 0) console.log(`Checked ${report.assets.length}/${assets.length} public assets.`);
});
const binaryAssets = assets.filter(file => /\.(mp4|mov|bin|pdf)$/i.test(file));
await parallel(binaryAssets, async file => {
  const path = '/' + relative(dist, file).replaceAll('\\', '/');
  const completeFile = readFileSync(file);
  const expected = completeFile.subarray(0, 4096);
  const response = await request(path, { headers: { Range: `bytes=0-${expected.length - 1}` } });
  const received = Buffer.from(await response.arrayBuffer());
  const digest = data => createHash('sha256').update(data).digest('hex');
  // Pages can return the complete file with 200 for Range requests. Verify that
  // full response against the build, rather than mistake it for a missing video.
  const mode = response.status === 206 ? 'partial' : 'complete';
  const matches = digest(received) === digest(response.status === 206 ? expected : completeFile);
  report.ranges.push({ path, status: response.status, mode, range: response.headers.get('content-range'), bytes: received.length, matches });
  if (![200, 206].includes(response.status) || !matches) error(`${path}: media response failed or differs from build.`);
});
const robots = await request('/robots.txt');
if (!(await robots.text()).includes(`Sitemap: ${origin.origin}/sitemap.xml`)) error('Incorrect robots sitemap.');
const sitemap = await request('/sitemap.xml');
const locations = [...(await sitemap.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
report.sitemapPages = locations.length;
if (locations.length !== htmlFiles.length || locations.some(location => !location.startsWith(origin.origin + '/'))) error('Sitemap does not match published routes.');
const missing = await request('/__missing_public_launch_check__/');
report.notFound = missing.status;
await missing.body?.cancel();
if (missing.status !== 404) error('Missing page does not return HTTP 404.');
const receipt = join(root, '.cache', 'public-launch', 'http-verification.json');
mkdirSync(dirname(receipt), { recursive: true });
writeFileSync(receipt, JSON.stringify(report, null, 2));
console.log(`Public verification: ${report.pages.length} pages, ${report.assets.length} assets, ${report.ranges.length} range downloads; ${report.errors.length} errors. Receipt: ${receipt}`);
for (const message of report.errors) console.error(message);
if (report.errors.length) process.exitCode = 1;
