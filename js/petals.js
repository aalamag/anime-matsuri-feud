// Falling sakura petals background (decorative).
(function () {
  const host = document.querySelector('.petals');
  if (!host || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const svg = (f, s) => `<svg viewBox="0 0 24 24"><path d="M12 2 C 5 7 4 15 12 22 C 20 15 19 7 12 2 Z M12 2 L10.5 5.5 L12 4.6 L13.5 5.5 Z" fill="${f}" stroke="${s}" stroke-width="0.8"/></svg>`;
  let html = '';
  for (let i = 0; i < 22; i++) {
    const size = 10 + Math.random() * 12;
    const gold = i % 7 === 0;
    const leaf = i % 4 === 1; // drifting leaves among the petals
    const art = leaf
      ? `<svg viewBox="0 0 24 24"><path d="M3 21 C 3 9 11 3 21 3 C 21 13 15 21 3 21 Z M3 21 L14 10" fill="${gold ? '#FFE8C2' : '#ECC9CF'}" stroke="#D8A56D" stroke-width="0.8"/></svg>`
      : gold ? svg('#FFE8C2', '#D8A56D') : svg('#F7B7C3', '#E991A0');
    html += `<span style="left:${Math.random() * 100}%;width:${size}px;height:${size}px;animation-duration:${14 + Math.random() * 10}s;animation-delay:${-Math.random() * 20}s;--drift:${-120 + Math.random() * 60}px">${art}</span>`;
  }
  host.innerHTML = html;
})();
