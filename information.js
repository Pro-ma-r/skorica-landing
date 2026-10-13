const dialog = document.querySelector('.sk-information-dialog');
const title = dialog?.querySelector('#information-title');
const content = dialog?.querySelector('.sk-information-dialog-content');
let previousOverflow;

document.addEventListener('click', event => {
  if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  const link = event.target instanceof Element ? event.target.closest('a[data-information]') : null;
  if (!link || !dialog || !title || !content || typeof dialog.showModal !== 'function') return;
  const key = link.dataset.information;
  if (!['support', 'usage', 'privacy', 'cookies'].includes(key)) return;
  const template = document.getElementById(`information-${key}`);
  if (!(template instanceof HTMLTemplateElement)) return;
  event.preventDefault();
  title.textContent = link.textContent;
  content.replaceChildren(template.content.cloneNode(true));
  if (!dialog.open) {
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.showModal();
  }
  dialog.scrollTop = 0;
  dialog.scrollLeft = 0;
});

dialog?.querySelector('button')?.addEventListener('click', () => dialog.close());
dialog?.addEventListener('close', () => { document.body.style.overflow = previousOverflow ?? ''; });

for (const type of ['copy', 'cut', 'contextmenu']) {
  document.addEventListener(type, event => {
    if (event.target instanceof Element && event.target.closest('.sk-copy-restricted')) event.preventDefault();
  });
}
