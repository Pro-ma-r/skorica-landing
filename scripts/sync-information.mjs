import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createRequire } from 'node:module';
import vm from 'node:vm';

// Use the app's existing compiler/renderer; no production dependencies are added.
const source = resolve(process.argv[2] ?? '');
const revision = process.argv[3];
if (!/^[a-f0-9]{40}$/.test(revision ?? '')) throw new Error('Supply the source app commit SHA');
const requireApp = createRequire(resolve(source, 'package.json'));
const ts = requireApp('typescript');
const React = requireApp('react');
const { renderToStaticMarkup } = requireApp('react-dom/server');
function compile(text, imports = {}) {
  const module = { exports: {} };
  const output = ts.transpileModule(text, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  vm.runInNewContext(output, { module, exports: module.exports, require: name => imports[name] ?? requireApp(name) });
  return module.exports;
}
const settings = compile(await readFile(resolve(source, 'lib/public-information.ts'), 'utf8'));
const Content = compile(await readFile(resolve(source, 'app/components/InformationContent.tsx'), 'utf8'), { '@/lib/public-information': settings }).default;
const pages = Object.entries(settings.INFORMATION_PAGES);
const templates = [];
const links = pages.map(([key, page]) => `<a href="/${key}.html" data-information="${key}">${page.title}</a>`).join('');
for (const [key, page] of pages) {
  const scope = key === 'cookies' ? '<p>Ova landing stranica ne postavlja kolačiće za prijavu. Opis nužnih kolačića u nastavku odnosi se na aplikaciju app.skorica.com.</p>' : '';
  const html = scope + renderToStaticMarkup(React.createElement(Content, { page: key })) + '<p>Informacije ažurirane 13. listopada 2026.</p>';
  templates.push(`<template id="information-${key}">${html}</template>`);
  await writeFile(`${key}.html`, `<!DOCTYPE html>\n<html lang="hr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${page.title} | Skorica</title><link rel="stylesheet" href="/styles.css"><link rel="stylesheet" href="/information.css"><link rel="icon" href="/favicon.svg" type="image/svg+xml"></head><body><main class="sk-information-page sk-copy-restricted"><a href="/"><img src="/assets/skorica-logo.svg" width="170" height="45" alt="Skorica"></a><h1>${page.title}</h1>${html}<nav class="sk-information-links" aria-label="Informacije o Skorici">${links}</nav><p><a href="/">Povratak na početnu</a></p></main><script src="/information.js" defer></script></body></html>\n`);
}
let index = await readFile('index.html', 'utf8');
const block = `<!-- INFORMATION START -->\n${templates.join('\n')}\n<dialog class="sk-information-dialog sk-copy-restricted" aria-labelledby="information-title"><header class="sk-information-dialog-header"><h2 id="information-title"></h2><button type="button" aria-label="Zatvori informacije">Zatvori ×</button></header><div class="sk-information-dialog-content"></div></dialog>\n<!-- INFORMATION END -->`;
index = index.includes('<!-- INFORMATION START -->') ? index.replace(/<!-- INFORMATION START -->[\s\S]*?<!-- INFORMATION END -->/, block) : index.replace('</body>', `${block}\n<script src="/information.js" defer></script>\n</body>`);
await writeFile('index.html', index);
const css = await readFile(resolve(source, 'app/information.css'), 'utf8');
await writeFile('information.css', `.sk-information-dialog,.sk-information-page,.sk-information-links{--sk-border:#e7e8ec;--sk-radius-lg:16px;--sk-radius-sm:8px;--sk-surface:#fff;--sk-text:#1f2026;--sk-orange:#ff6a2a;--sk-shadow:0 8px 24px rgba(31,32,38,.06)}\n${css}\n.footer-links{flex-wrap:wrap;gap:12px 20px}.footer-inner{grid-template-columns:1fr;justify-items:center;padding:28px 0;text-align:center}.provider-contact{margin-top:16px!important}.provider-contact a{text-decoration:underline!important}\n`);
await mkdir('docs', { recursive: true });
await writeFile('docs/information-source.json', JSON.stringify({ repository: 'Pro-ma-r/skorica-app', revision, generatedAt: '2026-10-13', provider: settings.PROVIDER, pages: pages.map(([key, page]) => ({ page: key, title: page.title })) }, null, 2) + '\n');
