import { readFile, writeFile } from 'node:fs/promises';

// Standalone landing documents are now the canonical source.
// Updating a document and running this command refreshes the modal copies.
const keys = ['support', 'usage', 'privacy', 'cookies'];
let index = await readFile('index.html', 'utf8');
for (const key of keys) {
  const page = await readFile(`${key}.html`, 'utf8');
  const content = page.match(/<h1>[^<]*<\/h1>([\s\S]*?)<nav class="sk-information-links"/);
  if (!content) throw new Error(`Document body missing: ${key}`);
  const template = new RegExp(`<template id="information-${key}">[\\s\\S]*?<\\/template>`);
  if (!template.test(index)) throw new Error(`Modal template missing: ${key}`);
  index = index.replace(template, () => `<template id="information-${key}">${content[1]}</template>`);
}
await writeFile('index.html', index);
