import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';

const root = resolve('.');
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml' };
createServer(async (request, response) => {
  try {
    const path = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname);
    const file = resolve(root, `.${path === '/' ? '/index.html' : path}`);
    if (!file.startsWith(root + sep) || !types[extname(file)]) throw new Error('Not public');
    const content = await readFile(file);
    response.writeHead(200, { 'Content-Type': types[extname(file)] });
    response.end(content);
  } catch {
    response.writeHead(404).end();
  }
}).listen(4310, '127.0.0.1');
