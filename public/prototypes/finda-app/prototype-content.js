// Display-only prototype values. Never read or write answers, drafts or test events.
export function applyPrototypeContent(root, screen) {
  if (screen === 'point') {
    const points = root.querySelector('[data-node-id="4468:11698"]');
    if (points) points.textContent = '50 P';
  }

  const copy = value => value.replace(/OOO(?=님)/g, '테스터')
    // Keep excluded financial figures hidden rather than inventing personal data.
    .replace(/OOO(?=\s*점)/g, '???')
    .replace(/OOO(?=\s*(?:원|만|%|개월|년|월|회|P))/g, '****')
    .replace(/OOO/g, '테스터');
  const walker = root.ownerDocument.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (!node.parentElement.closest('script,style')) node.nodeValue = copy(node.nodeValue);
  }
  for (const element of root.querySelectorAll('[aria-label],[alt],[title]')) {
    for (const attribute of ['aria-label', 'alt', 'title']) {
      if (element.hasAttribute(attribute)) element.setAttribute(attribute, copy(element.getAttribute(attribute)));
    }
  }
}
