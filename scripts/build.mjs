import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

const files = ['index.html', 'styles.css', 'favicon.svg', 'information.css', 'information.js', 'support.html', 'usage.html', 'privacy.html', 'cookies.html'];
await mkdir('dist', { recursive: true });
const checksums = {};
for (const file of files) {
  await cp(file, `dist/${file}`);
  checksums[file] = createHash('sha256').update(await readFile(file)).digest('hex');
}
await cp('assets', 'dist/assets', { recursive: true });
const revision = process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.GITHUB_SHA ?? execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
if (!/^[a-f0-9]{40}$/.test(revision)) throw new Error('Expected a full source revision');
await writeFile('dist/version.json', JSON.stringify({ revision, checksums }) + '\n');
