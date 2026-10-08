import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile, writeFile, access } from 'node:fs/promises';
import sharp from 'sharp';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const keys = JSON.parse(await readFile(join(root, 'src/data/planet-images.json'), 'utf8'));
if (keys.length > 16) throw new Error('Entry atlas capacity is 16 images.');
const sources = await Promise.all(keys.map(key => readFile(join(root, 'public', key.src.slice(1)))));
const hash = createHash('sha256').update('entry-atlas:4x4:256:luma601:quality86:v2');
for (const bytes of sources) hash.update(bytes);
const src = `/media/planet/entry-atlas-${hash.digest('hex').slice(0, 12)}.webp`;
const destination = join(root, 'public', src.slice(1));
try { await access(destination); } catch {
  const tiles = await Promise.all(sources.map(async (source, index) => ({
    input: await sharp(source).resize(256, 256, { fit: 'fill' }).png().toBuffer(),
    left: index % 4 * 256, top: Math.floor(index / 4) * 256,
  })));
  await sharp({ create: { width: 1024, height: 1024, channels: 4, background: '#00000000' } })
    .composite(tiles).recomb([[.299,.587,.114],[.299,.587,.114],[.299,.587,.114]]).webp({ quality: 86 }).toFile(destination);
}
const metadata = JSON.stringify({ src, count: keys.length, width: 1024, height: 1024 }, null, 2) + '\n';
const manifest = join(root, 'src/data/entry-atlas.json');
let current = ''; try { current = await readFile(manifest, 'utf8'); } catch {}
if (metadata !== current) await writeFile(manifest, metadata);
console.log(`Entry atlas ready: ${keys.length} images in one request (${src}).`);
