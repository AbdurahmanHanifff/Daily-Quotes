/* Pure logic, shared by the app and the unit tests. */
(function (root) {
function shuffle(a, seed) {
  a = a.slice(); let s = seed >>> 0;
  for (let i = a.length - 1; i > 0; i--) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    const j = Math.floor(s / 4294967296 * (i + 1)); [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const dayNumber = d => Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5);
const poolFor = (quotes, beliefs) => quotes.filter(q => beliefs.includes(q.belief));
/* Today's quote first, then the rest in an order that changes daily. No repeat of a daily quote until the pool is used up. */
function forYou(pool, seed, day) {
  if (!pool.length) return [];
  const order = shuffle(pool, seed), today = order[day % order.length];
  return [today, ...shuffle(pool.filter(q => q !== today), seed + day)];
}
function nextStreak(s, day) {
  if (s && s.last === day) return s;
  if (s && s.last > day) return s;
  const count = s && s.last === day - 1 ? s.count + 1 : 1;
  return { last: day, count, best: Math.max(count, (s && s.best) || 0) };
}
function search(list, term, belief) {
  const t = (term || '').trim().toLowerCase();
  return list.filter(q => (!belief || q.belief === belief) &&
    (!t || [q.text, q.by, q.src, q.beliefName].join(' ').toLowerCase().includes(t)));
}
const str = (v, n) => typeof v === 'string' ? v.slice(0, n) : '';
const validId = id => typeof id === 'string' && /^[A-Za-z0-9_]{1,60}$/.test(id) && !(id in Object.prototype);
function cleanWritten(w) {
  if (!w || !validId(w.id) || !w.id.startsWith('w_') || !str(w.text, 600).trim()) return null;
  return { id: w.id, text: str(w.text, 600), by: str(w.by, 80) || 'You', belief: 'yours', src: '', created: Number(w.created) || 0 };
}
/* A backup file is untrusted input: copy across only known, well-formed fields. */
function parseBackup(text) {
  let b; try { b = JSON.parse(text); } catch (e) { throw new Error('This file is not a quote backup.'); }
  if (!b || b.app !== 'daily-quote-feed') throw new Error('This file is not a quote backup.');
  const out = { saved: {}, written: {} };
  for (const [id, at] of Object.entries(b.saved || {})) if (validId(id)) out.saved[id] = Number(at) || 0;
  for (const w of Object.values(b.written || {})) { const c = cleanWritten(w); if (c) out.written[c.id] = c; }
  return out;
}
const core = { shuffle, dayNumber, poolFor, forYou, nextStreak, search, cleanWritten, parseBackup };
if (typeof module !== 'undefined') module.exports = core; else root.Core = core;
})(this);
