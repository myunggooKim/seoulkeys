// Automated UI checker. Run in the page, per locale/theme/viewport.
// Reports: unintended line wraps, element overlaps, viewport overflow,
// inconsistent control sizing within a row, and text clipped by its own box.
window.__uiAudit = function () {
  const root = document.documentElement;
  const vw = root.clientWidth;
  const out = { locale: root.lang, dir: root.dir, theme: root.getAttribute("data-theme"), vw, wrap: [], overlap: [], overflow: [], sizing: [], clipped: [] };

  const name = (el) => {
    let s = el.tagName.toLowerCase();
    if (typeof el.className === "string" && el.className) s += "." + el.className.trim().split(/\s+/).slice(0, 2).join(".");
    return s;
  };
  const path = (el) => { const p = []; let n = el; for (let i = 0; n && i < 3; i++) { p.unshift(name(n)); n = n.parentElement; } return p.join(">"); };
  const text = (el) => (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 32);
  const visible = (el) => {
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden" || +cs.opacity < 0.1) return false;
    const q = el.getBoundingClientRect();
    return q.width > 1 && q.height > 1;
  };

  const all = [...document.querySelectorAll("body *")].filter(visible);

  // 1. Text that wrapped onto more lines than it should have.
  // Only leaf elements whose own text is short enough that wrapping is a defect.
  const WRAP_WATCH = ".nav-links a, .nav-links button, .theme-chip, .practice-track-picker button, .practice-track-picker > span, .theme-picker-label, .theme-toggle-btn, .keyboard-setup-btn, .button, .streak, .analytics-seg, .owner-members, .card-kicker, .practice-instruction, .signup-cta-button, .sister-promo-link, .eyebrow, .curriculum-progress li b";
  // Count real line boxes with a Range: box height is meaningless for a
  // fixed-height flex control, which made every button look like 3 wrapped lines.
  const lineCount = (el) => {
    const range = document.createRange();
    let found = 0;
    for (const node of el.childNodes) {
      if (node.nodeType !== 3 || !node.textContent.trim()) continue;
      range.selectNodeContents(node);
      const rects = [...range.getClientRects()].filter((r) => r.width > 1 && r.height > 1);
      const tops = new Set(rects.map((r) => Math.round(r.top / 8)));
      found = Math.max(found, tops.size);
    }
    if (!found) {
      range.selectNodeContents(el);
      const rects = [...range.getClientRects()].filter((r) => r.width > 1 && r.height > 1);
      found = new Set(rects.map((r) => Math.round(r.top / 8))).size;
    }
    return found;
  };

  for (const el of document.querySelectorAll(WRAP_WATCH)) {
    if (!visible(el)) continue;
    const lines = lineCount(el);
    const allowed = el.matches('.curriculum-progress li b') ? 2 : 1;
    if (lines > allowed) out.wrap.push({ s: path(el), lines, allowed, t: text(el) });
  }

  // 2. Overlapping siblings (in-flow only).
  const parents = new Set(all.map((el) => el.parentElement).filter(Boolean));
  for (const p of parents) {
    const kids = [...p.children].filter((k) => visible(k) && !["absolute", "fixed"].includes(getComputedStyle(k).position));
    for (let i = 0; i < kids.length; i++) {
      for (let j = i + 1; j < kids.length; j++) {
        const a = kids[i].getBoundingClientRect(), b = kids[j].getBoundingClientRect();
        const ox = Math.min(a.right, b.right) - Math.max(a.left, b.left);
        const oy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
        if (ox > 2 && oy > 2) out.overlap.push({ a: name(kids[i]), b: name(kids[j]), ox: Math.round(ox), oy: Math.round(oy), at: path(p) });
      }
    }
  }

  // 3. Anything sticking out of the viewport.
  for (const el of all) {
    if (getComputedStyle(el).position === "fixed") continue;
    const q = el.getBoundingClientRect();
    if (q.right > vw + 1 || q.left < -1) out.overflow.push({ s: path(el), l: Math.round(q.left), r: Math.round(q.right), t: text(el) });
  }

  // 4. Controls sharing a row that do not share a height.
  const ROWS = [".header-tools", ".nav-links", ".practice-track-picker", ".theme-picker-row", ".hero-actions", ".analytics-segment", ".exit-confirm-actions"];
  for (const sel of ROWS) {
    for (const row of document.querySelectorAll(sel)) {
      if (!visible(row)) continue;
      const kids = [...row.children].filter((k) => visible(k) && /^(button|a|select|label|input)$/i.test(k.tagName));
      if (kids.length < 2) continue;
      const heights = kids.map((k) => Math.round(k.getBoundingClientRect().height));
      const spread = Math.max(...heights) - Math.min(...heights);
      if (spread > 6) out.sizing.push({ row: sel, spread, heights, kids: kids.map(name) });
    }
  }

  // 5. Text clipped by its own overflow box.
  for (const el of all) {
    const cs = getComputedStyle(el);
    if (cs.overflowX === "visible" && cs.overflowY === "visible") continue;
    if (![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue;
    // An intentional ellipsis is not a defect.
    if (cs.textOverflow === "ellipsis") continue;
    if (el.scrollWidth > el.clientWidth + 2 || el.scrollHeight > el.clientHeight + 2) {
      out.clipped.push({ s: path(el), sw: el.scrollWidth, cw: el.clientWidth, t: text(el) });
    }
  }

  out.n = { wrap: out.wrap.length, overlap: out.overlap.length, overflow: out.overflow.length, sizing: out.sizing.length, clipped: out.clipped.length };
  out.total = out.n.wrap + out.n.overlap + out.n.overflow + out.n.sizing + out.n.clipped;
  return out;
};
"ui-audit-ready";
