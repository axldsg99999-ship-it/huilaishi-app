// Destination, UI language and the author of an object are separate concepts.
export function paperCulture(world, owner = 'player') {
  const destination = world === 'cn' ? 'cn' : 'th';
  if (owner === 'cn' || owner === 'th') return owner;
  return owner === 'resident' || owner === 'partner' ? destination : destination === 'th' ? 'cn' : 'th';
}
export const inkMaterial = culture => culture === 'cn' ? 'xiaoai' : 'chaninda';
// UI copy only. Never run this over Chinese lesson targets or audio keys.
export function uiCopy(world, zh, th) {
  return world === 'th' ? zh : String(th ?? '').replaceAll('小艾', 'XIAO AI');
}

// Allow for fractional pixels and elastic overscroll without claiming that a
// person has read the text. This describes position, never learning progress.
export function readingEdge(top, height, total) {
  if (total <= height + 2) return 'none';
  return Math.max(0, top) + height >= total - 3 ? 'end' : 'more';
}
