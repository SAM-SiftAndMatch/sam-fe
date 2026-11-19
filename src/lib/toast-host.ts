/** Keep one toast container inside the active native dialog's top layer. */
export function mountToastHost(host: HTMLElement, page: Document = document): () => void {
  const move = () => {
    const dialogs = page.querySelectorAll<HTMLDialogElement>('dialog[open]');
    const focusedDialog = page.activeElement?.closest<HTMLDialogElement>('dialog[open]');
    const target = focusedDialog ?? dialogs.item(dialogs.length - 1) ?? page.body;
    if (host.parentElement !== target) target.appendChild(host);
  };
  const observer = new MutationObserver(move);
  move();
  observer.observe(page.body, {
    attributes: true,
    attributeFilter: ['open'],
    childList: true,
    subtree: true,
  });
  return () => {
    observer.disconnect();
    host.remove();
  };
}
