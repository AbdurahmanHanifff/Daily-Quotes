const test = require('node:test'), assert = require('node:assert');
const C = require('../src/core.js'), { BELIEFS, QUOTES, OLD } = require('../src/quotes.js');

test('at least 10 belief systems, each with 5 or more quotes', () => {
  assert.ok(BELIEFS.length >= 10);
  for (const b of BELIEFS) assert.ok(C.poolFor(QUOTES, [b.id]).length >= 5, b.id);
});
test('every quote is complete and ids are unique', () => {
  const ids = [...QUOTES, ...OLD].map(q => q.id);
  assert.strictEqual(new Set(ids).size, ids.length);
  for (const q of QUOTES) { assert.ok(q.text && q.by && q.src, q.id); assert.ok(['t', 'p'].includes(q.kind)); assert.ok(BELIEFS.some(b => b.id === q.belief)); }
});
test('every hadith is from Sahih al-Bukhari with a number', () => {
  for (const q of QUOTES.filter(q => q.id.startsWith('h'))) assert.match(q.src, /^Sahih al-Bukhari \d+/);
});
test('daily quote is stable within a day and does not repeat until all are used', () => {
  for (const b of BELIEFS) {
    const pool = C.poolFor(QUOTES, [b.id]);
    assert.strictEqual(C.forYou(pool, 7, 100)[0].id, C.forYou(pool, 7, 100)[0].id);
    assert.strictEqual(new Set(pool.map((_, i) => C.forYou(pool, 7, 100 + i)[0].id)).size, pool.length);
  }
});
test('feed contains only the chosen belief systems, once each', () => {
  const pool = C.poolFor(QUOTES, ['islam', 'taoism']), feed = C.forYou(pool, 1, 2);
  assert.strictEqual(new Set(feed).size, pool.length);
  assert.ok(feed.every(q => ['islam', 'taoism'].includes(q.belief)));
  assert.deepStrictEqual(C.forYou([], 1, 2), []);
});
test('streak', () => {
  let s = C.nextStreak(null, 10); assert.strictEqual(s.count, 1);
  assert.strictEqual(C.nextStreak(s, 10), s);
  s = C.nextStreak(s, 11); assert.strictEqual(s.count, 2);
  s = C.nextStreak(s, 14); assert.deepStrictEqual([s.count, s.best], [1, 2]);
  assert.strictEqual(C.nextStreak(s, 13), s);
});
test('calendar day number ignores the time of day', () => {
  assert.strictEqual(C.dayNumber(new Date(2026, 10, 26, 0, 1)), C.dayNumber(new Date(2026, 10, 26, 23, 59)));
  assert.strictEqual(C.dayNumber(new Date(2026, 10, 27)) - C.dayNumber(new Date(2026, 10, 26)), 1);
});
test('backup restore rejects junk and unsafe fields', () => {
  assert.throws(() => C.parseBackup('nope')); assert.throws(() => C.parseBackup('{"app":"other"}')); assert.throws(() => C.parseBackup('null'));
  const r = C.parseBackup(JSON.stringify({ app: 'daily-quote-feed', saved: { q1: 5, '../x': 1, constructor: 1 }, written: {
    a: { id: 'w_ok', text: 'x'.repeat(900), belief: 'islam', extra: 1 }, b: { id: 'profile', text: 'no' }, c: { id: 'w_blank', text: '  ' } } }));
  assert.deepStrictEqual(Object.keys(r.saved), ['q1']);
  assert.deepStrictEqual(Object.keys(r.written), ['w_ok']);
  assert.strictEqual(r.written.w_ok.text.length, 600); assert.strictEqual(r.written.w_ok.belief, 'yours'); assert.ok(!('extra' in r.written.w_ok));
});
