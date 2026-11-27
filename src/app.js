(() => {
const { BELIEFS, QUOTES, OLD } = Library;
const NAME = Object.fromEntries(BELIEFS.map(b => [b.id, b.name]));
Object.assign(NAME, { yours: 'Written by you', classic: 'Classic' });
const COLOR = Object.fromEntries(BELIEFS.map(b => [b.id, b.color]));
const ALL = [...QUOTES, ...OLD];
ALL.forEach(q => q.beliefName = NAME[q.belief]);
const BY_ID = new Map(ALL.map(q => [q.id, q]));
const native = () => (window.Native && window.Native.isNative) ? window.Native : null;

const $ = s => document.querySelector(s);
const feed = $('#feed'), searchBox = $('#search');
const el = (t, c, x) => { const e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; };

const fresh = () => ({ seed: Math.floor(Math.random() * 1e9), beliefs: [], saved: {}, written: {}, streak: null, settings: { size: '1', remind: false, remindAt: '08:00' } });
const freshPos = () => ({ tab: 'fy', day: '', ids: {}, at: 0 });
let st = fresh(), pos = freshPos();
let col = null, downloads = null, tab = 'fy', list = [], index = 0, editing = null, restoring = false, shownDay = '', ready = false;
const term = { saved: '', written: '' };
let chip = '';
const KEY = 'dailyquotes.v1';

/* ---------- storage: browser storage always, plus the claude.ai database or native preferences ---------- */
const lsGet = () => { try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; } };
function localSave() {
  const s = JSON.stringify({ st, pos });
  try { localStorage.setItem(KEY, s); } catch (e) {}
  if (native()) native().set(KEY, s).catch(() => toast("Couldn't save on this phone."));
}
let toastT;
function toast(m) { const t = $('#toast'); t.textContent = m; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => t.hidden = true, 3000); }
const chains = {};
/* One write at a time per document. */
function push(id, make) {
  localSave(); if (!col) return Promise.resolve();
  return chains[id] = (chains[id] || Promise.resolve())
    .then(() => { const d = make(); return d ? col.doc(id).set(d) : col.doc(id).delete(); })
    .catch(() => toast("Couldn't sync. Kept on this device only."));
}
const pushProfile = () => push('profile', () => JSON.parse(JSON.stringify({ seed: st.seed, saved: st.saved, beliefs: st.beliefs, streak: st.streak, settings: st.settings })));
const pushWritten = id => push(id, () => st.written[id] || null);
let posT;
function pushPos() { pos.at = Date.now(); localSave(); clearTimeout(posT); posT = setTimeout(flushPos, 900); }
function flushPos() { if (posT) { clearTimeout(posT); posT = null; push('pos', () => JSON.parse(JSON.stringify(pos))); } }

/* ---------- lists ---------- */
const dayKey = () => String(Core.dayNumber(new Date()));
const pool = () => Core.poolFor(QUOTES, st.beliefs);
const mine = () => Object.values(st.written).sort((a, b) => b.created - a.created).map(w => ({ ...w, beliefName: NAME.yours }));
const find = id => Object.prototype.hasOwnProperty.call(st.written, id) ? { ...st.written[id], beliefName: NAME.yours } : BY_ID.get(id);
const savedList = () => Object.entries(st.saved).sort((a, b) => b[1] - a[1]).map(e => find(e[0])).filter(Boolean);
function items() {
  if (tab === 'fy') return Core.forYou(pool(), st.seed, Core.dayNumber(new Date()));
  return Core.search(tab === 'written' ? mine() : savedList(), term[tab], tab === 'saved' ? chip : '');
}
const filtering = () => tab !== 'fy' && (term[tab] || (tab === 'saved' && chip));

/* ---------- actions ---------- */
const ICONS = { save: 'M6 3h12v18l-6-4-6 4z', copy: 'M9 9h11v11H9zM5 15H4V4h11v1', share: 'M12 3v12M7 8l5-5 5 5M5 13v8h14v-8', listen: 'M4 9v6h4l5 4V5L8 9zM17 8c2 2 2 6 0 8', edit: 'M4 20l4-1L19 8l-3-3L5 16zM14 7l3 3', del: 'M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13' };
function action(name, label, fn) {
  const b = el('button'); b.type = 'button'; b.dataset.a = name; const i = el('i');
  i.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + ICONS[name] + '"/></svg>';
  b.append(i, el('span', null, label)); b.onclick = () => fn(b); return b;
}
function paintSave(b, id) { const on = !!st.saved[id]; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); b.querySelector('span').textContent = on ? 'Saved' : 'Save'; }
function toggleSave(id, b) {
  if (st.saved[id]) delete st.saved[id]; else { st.saved[id] = Date.now(); if (navigator.vibrate) navigator.vibrate(12); }
  pushProfile(); paintSave(b, id);
  if (tab === 'saved' && !st.saved[id]) render(neighbour()); else counts();
}
const neighbour = () => (list[index + 1] || list[index - 1] || {}).id;
const citation = q => [q.src, q.kind === 'p' ? 'Paraphrase' : ''].filter(Boolean).join(' · ');
const shareText = q => '“' + q.text + '” — ' + q.by + (citation(q) ? ' (' + citation(q) + ')' : '');
function copy(q) {
  const fail = () => toast('Copy is blocked here. Select the text to copy it.');
  try { navigator.clipboard.writeText(shareText(q)).then(() => toast('Copied'), fail); } catch (e) { fail(); }
}
/* Draw the quote as a 1080×1920 story image. */
function drawImage(q) {
  const c = document.createElement('canvas'); c.width = 1080; c.height = 1920; const x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, 500, 1920); g.addColorStop(0, COLOR[q.belief] || '#6a4310'); g.addColorStop(1, '#10141c');
  x.fillStyle = g; x.fillRect(0, 0, 1080, 1920); x.fillStyle = '#f6f3ec'; x.textBaseline = 'top';
  const wrap = (text, font) => { x.font = font; const out = []; for (const para of text.split('\n')) { let line = ''; for (let word of para.split(/\s+/)) {
    const t = line ? line + ' ' + word : word; if (x.measureText(t).width <= 880) { line = t; continue; }
    if (line) out.push(line);
    while (x.measureText(word).width > 880) { let n = word.length; while (x.measureText(word.slice(0, n)).width > 880) n--; out.push(word.slice(0, n)); word = word.slice(n); }
    line = word; } out.push(line); } return out; };
  let size = 80, lines, font;
  do { font = size + 'px Newsreader, Georgia, serif'; lines = wrap(q.text, font); size -= 4; } while (lines.length * (size + 4) * 1.3 > 1200 && size > 24);
  const h = (size + 4) * 1.3; let y = Math.max(200, (1920 - lines.length * h - 200) / 2);
  x.font = font; for (const l of lines) { x.fillText(l, 100, y); y += h; }
  y += 50; for (const l of wrap(q.by, '700 42px Figtree, sans-serif')) { x.fillText(l, 100, y); y += 56; }
  x.globalAlpha = .75; for (const l of wrap(citation(q), '32px Figtree, sans-serif')) { x.fillText(l, 100, y + 8); y += 44; }
  return c;
}
/* Hand a file to the viewer by whichever route this platform supports. */
async function deliver(filename, blob, title) {
  try {
    if (native()) return await native().shareFile(filename, blob, title);
    if (downloads) { await downloads.save({ filename, data: blob }); return; }
    const file = new File([blob], filename, { type: blob.type });
    if (navigator.canShare && navigator.canShare({ files: [file] })) return await navigator.share({ files: [file], title });
    const a = el('a'); a.href = URL.createObjectURL(blob); a.download = filename; document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  } catch (e) {
    if (e && (e.name === 'AbortError' || e.code === 'declined' || /cancel/i.test(e.message || ''))) return;
    toast("Couldn't share the file here. Use Copy instead.");
  }
}
const shareImage = q => drawImage(q).toBlob(b => b ? deliver('quote-' + q.id + '.png', b, 'Quote') : toast("Couldn't make the image."), 'image/png');
function listen(q) {
  const s = window.speechSynthesis; if (s.speaking) { s.cancel(); return; }
  s.speak(new SpeechSynthesisUtterance(q.text + '. ' + q.by));
}
function armed(b, label, again) {
  if (b.classList.contains('arm')) { b.classList.remove('arm'); return true; }
  const span = b.querySelector('span') || b, old = span.textContent; b.classList.add('arm'); span.textContent = again;
  setTimeout(() => { if (b.classList.contains('arm')) { b.classList.remove('arm'); span.textContent = old; } }, 3500); return false;
}

/* ---------- rendering ---------- */
function card(q, i) {
  const c = el('section', 'card'); c.dataset.id = q.id;
  c.style.setProperty('--g', 'linear-gradient(165deg,' + (COLOR[q.belief] || '#6a4310') + ',#10141c 94%)');
  const inner = el('div', 'inner'), isToday = tab === 'fy' && i === 0;
  inner.append(el('span', 'tag' + (isToday ? ' today' : ''), isToday ? "Today's quote · " + q.beliefName : q.beliefName));
  inner.append(el('blockquote', q.text.length > 120 ? 'long' : '', q.text), el('p', 'by', q.by));
  if (citation(q)) inner.append(el('p', 'src', citation(q)));
  const rail = el('div', 'rail'), s = action('save', 'Save', b => toggleSave(q.id, b)); paintSave(s, q.id);
  rail.append(s, action('share', 'Image', () => shareImage(q)), action('copy', 'Copy', () => copy(q)));
  if (Object.prototype.hasOwnProperty.call(st.written, q.id)) {
    rail.append(action('edit', 'Edit', () => openSheet(q.id)), action('del', 'Delete', b => {
      if (!armed(b, 'Delete', 'Confirm')) return;
      const next = neighbour(); delete st.written[q.id]; pushWritten(q.id);
      if (st.saved[q.id]) { delete st.saved[q.id]; pushProfile(); }
      render(next); toast('Quote deleted');
    }));
  } else if (window.speechSynthesis) rail.append(action('listen', 'Listen', () => listen(q)));
  inner.ondblclick = () => { if (!st.saved[q.id]) toggleSave(q.id, s); };
  c.append(inner, rail); return c;
}
function counts() {
  const n = { fy: 'For You', saved: 'Saved ' + savedList().length, written: 'Written ' + Object.keys(st.written).length };
  document.querySelectorAll('nav button').forEach(b => { b.textContent = n[b.dataset.tab]; b.setAttribute('aria-selected', b.dataset.tab === tab); });
  $('#streak').textContent = '🔥 ' + ((st.streak && st.streak.count) || 0);
}
function chips() {
  const box = $('#chips'), present = [...new Set(savedList().map(q => q.belief))];
  if (!present.includes(chip)) chip = '';
  box.hidden = tab !== 'saved' || present.length < 2;
  box.replaceChildren(...['', ...present].map(id => {
    const b = el('button', null, id ? NAME[id] : 'All'); b.type = 'button'; b.setAttribute('aria-pressed', id === chip);
    b.onclick = () => { chip = id; render(); }; return b;
  }));
}
function status() { $('#count').textContent = list.length ? (index + 1) + ' of ' + list.length : ''; $('#prev').disabled = index <= 0; $('#next').disabled = index >= list.length - 1; }
function remember() {
  if (!ready || !list[index] || filtering()) return;
  pos.ids[tab] = list[index].id; if (tab === 'fy') pos.day = dayKey(); pos.tab = tab; pushPos();
}
function empty() {
  const c = el('section', 'card empty'), f = filtering();
  c.append(el('h2', null, f ? 'No matches' : tab === 'saved' ? 'Nothing saved yet' : 'Your page is blank'),
    el('p', null, f ? 'Try a different word or filter.' : tab === 'saved' ? 'Tap Save or double-tap a quote to keep it here.' : 'Quotes you write show up here.'));
  if (!f) { const b = el('button', 'primary', tab === 'saved' ? 'Browse For You' : 'Write your first quote'); b.onclick = () => tab === 'saved' ? go('fy') : openSheet(); c.append(b); }
  return c;
}
function render(targetId) {
  restoring = true; shownDay = dayKey();
  searchBox.hidden = tab === 'fy';
  if (tab !== 'fy') { searchBox.placeholder = 'Search your ' + tab + ' quotes'; if (searchBox.value !== term[tab]) searchBox.value = term[tab]; }
  chips(); list = items(); counts();
  feed.replaceChildren(...(list.length ? list.map(card) : [empty()]));
  let want = targetId;
  /* A new day opens For You on the new daily quote; otherwise every tab resumes where it was left. */
  if (!want && !(tab === 'fy' && pos.day !== dayKey()) && !filtering()) want = pos.ids[tab];
  index = Math.max(0, list.findIndex(q => q.id === want));
  feed.scrollTop = index * feed.clientHeight; status();
  requestAnimationFrame(() => { feed.scrollTop = index * feed.clientHeight; restoring = false; remember(); });
}
function go(t) { tab = t; pos.tab = t; render(); pushPos(); }

/* ---------- belief picker ---------- */
let picked = new Set();
function paintPicker() {
  document.querySelectorAll('#beliefs button').forEach(b => { const on = picked.has(b.dataset.id); b.setAttribute('aria-pressed', on); b.querySelector('b').textContent = on ? '✓' : ''; });
  $('#pickDone').disabled = !picked.size; $('#all').textContent = picked.size === BELIEFS.length ? 'Clear all' : 'Select all';
}
$('#beliefs').append(...BELIEFS.map(b => {
  const btn = el('button'); btn.type = 'button'; btn.dataset.id = b.id; btn.style.setProperty('--c', b.color); btn.append(el('span', null, b.name), el('b'));
  btn.onclick = () => { picked.has(b.id) ? picked.delete(b.id) : picked.add(b.id); paintPicker(); }; return btn;
}));
function openPicker() {
  picked = new Set(st.beliefs); paintPicker(); $('#pickCancel').hidden = !st.beliefs.length;
  $('#pickDone').textContent = st.beliefs.length ? 'Save choices' : 'Start reading'; $('#settings').hidden = true; $('#picker').hidden = false;
}
$('#all').onclick = () => { picked = new Set(picked.size === BELIEFS.length ? [] : BELIEFS.map(b => b.id)); paintPicker(); };
$('#pickCancel').onclick = () => $('#picker').hidden = true;
$('#pickDone').onclick = () => {
  const changed = BELIEFS.filter(b => picked.has(b.id)).map(b => b.id), same = changed.join() === st.beliefs.join();
  st.beliefs = changed; $('#picker').hidden = true; if (same) return;
  pos.day = ''; delete pos.ids.fy; tab = 'fy'; pushProfile(); render(); remind();
};

/* ---------- write ---------- */
let draft = { text: '', by: '' };
function openSheet(id) {
  editing = id || null; const q = id ? st.written[id] : draft;
  $('#sheetTitle').textContent = id ? 'Edit your quote' : 'Write a quote';
  $('#qText').value = q.text; $('#qBy').value = q.by === 'You' ? '' : q.by; $('#err').hidden = true; $('#sheet').hidden = false; $('#qText').focus();
}
function closeSheet() { if (!editing) draft = { text: $('#qText').value, by: $('#qBy').value }; $('#sheet').hidden = true; }
$('#write').onclick = () => openSheet(); $('#cancel').onclick = closeSheet;
$('#form').onsubmit = e => {
  e.preventDefault(); const text = $('#qText').value.trim();
  if (!text) { $('#err').textContent = 'Type your quote first.'; $('#err').hidden = false; return; }
  const id = editing || 'w_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  st.written[id] = { id, text, by: $('#qBy').value.trim() || 'You', belief: 'yours', src: '', created: (st.written[id] && st.written[id].created) || Date.now() };
  pushWritten(id); if (!editing) draft = { text: '', by: '' }; $('#sheet').hidden = true; term.written = '';
  if (editing && tab === 'saved') render(id); else { tab = 'written'; pos.tab = tab; render(id); pushPos(); }
  toast(editing ? 'Changes saved' : 'Quote added');
};

/* ---------- settings, reminders, backup ---------- */
const applySize = () => document.documentElement.style.setProperty('--scale', st.settings.size);
/* Schedule the next 30 daily quotes. Re-run on every open so the queue stays full. */
async function remind() {
  const n = native(); if (!n || !st.beliefs.length) return;
  const items = [];
  if (st.settings.remind) {
    const [h, m] = st.settings.remindAt.split(':').map(Number);
    for (let i = 0; i < 31 && items.length < 30; i++) {
      const at = new Date(); at.setDate(at.getDate() + i); at.setHours(h, m, 0, 0);
      if (at <= new Date()) continue;
      const q = Core.forYou(pool(), st.seed, Core.dayNumber(at))[0];
      items.push({ id: 1000 + i, title: "Today's quote", body: '“' + q.text + '” — ' + q.by + (q.kind === 'p' ? ' (paraphrase)' : ''), at });
    }
  }
  try {
    if (!await n.schedule(items) && st.settings.remind) {
      st.settings.remind = false; $('#remind').checked = false; pushProfile(); toast("Allow notifications in your phone's settings to get reminders.");
    }
  } catch (e) { toast("Couldn't set the reminder."); }
}
function openSettings() {
  $('#chosen').textContent = st.beliefs.length + ' of ' + BELIEFS.length; $('#size').value = st.settings.size;
  $('#reminderRow').hidden = !native(); $('#remindNote').hidden = !!native();
  $('#remind').checked = st.settings.remind; $('#remindAt').value = st.settings.remindAt; $('#settings').hidden = false;
}
$('#menu').onclick = openSettings; $('#close').onclick = () => $('#settings').hidden = true; $('#editBeliefs').onclick = openPicker;
$('#size').onchange = e => { st.settings.size = e.target.value; applySize(); pushProfile(); render((list[index] || {}).id); };
$('#remind').onchange = e => { st.settings.remind = e.target.checked; pushProfile(); remind(); };
$('#remindAt').onchange = e => { if (e.target.value) { st.settings.remindAt = e.target.value; pushProfile(); remind(); } };
$('#export').onclick = () => deliver('quote-backup.json', new Blob([JSON.stringify({ app: 'daily-quote-feed', saved: st.saved, written: st.written }, null, 1)], { type: 'application/json' }), 'Quote backup');
$('#import').onchange = async e => {
  const f = e.target.files[0]; e.target.value = ''; if (!f) return;
  try {
    if (f.size > 2e6) throw new Error('This file is too large to be a quote backup.');
    const b = Core.parseBackup(await f.text());
    /* Merge. A quote already on this device is never overwritten. */
    const added = Object.keys(b.written).filter(id => !st.written[id]);
    added.forEach(id => { st.written[id] = b.written[id]; pushWritten(id); });
    Object.assign(st.saved, b.saved, { ...st.saved }); pushProfile(); render(); toast('Backup restored. ' + added.length + ' written quotes added.');
  } catch (err) { toast(err.message); }
};
$('#erase').onclick = async e => {
  if (!armed(e.currentTarget, 'Erase', 'Tap again to erase everything')) return;
  e.currentTarget.textContent = 'Erase all my data';
  const ids = Object.keys(st.written), keepSeed = st.seed;
  st = fresh(); st.seed = keepSeed; pos = freshPos(); tab = 'fy'; chip = ''; term.saved = term.written = ''; draft = { text: '', by: '' };
  ids.forEach(pushWritten); pushProfile(); pushPos(); applySize();
  const n = native(); if (n) n.schedule([]).catch(() => {});
  $('#settings').hidden = true; render(); openPicker();
};
$('#streak').onclick = () => toast(((st.streak && st.streak.count) || 0) + '-day streak. Best: ' + ((st.streak && st.streak.best) || 0) + '.');

/* ---------- navigation ---------- */
feed.addEventListener('scroll', () => {
  if (restoring || !list.length || !feed.clientHeight) return; const i = Math.round(feed.scrollTop / feed.clientHeight);
  if (i !== index && list[i]) { index = i; status(); remember(); }
}, { passive: true });
const step = d => { const i = Math.min(list.length - 1, Math.max(0, index + d)); feed.scrollTo({ top: i * feed.clientHeight, behavior: matchMedia('(prefers-reduced-motion:reduce)').matches ? 'auto' : 'smooth' }); };
$('#prev').onclick = () => step(-1); $('#next').onclick = () => step(1);
addEventListener('resize', () => { restoring = true; feed.scrollTop = index * feed.clientHeight; requestAnimationFrame(() => restoring = false); });
function closeTop() {
  if (!$('#sheet').hidden) { closeSheet(); return true; }
  if (!$('#picker').hidden) { if (st.beliefs.length) { $('#picker').hidden = true; return true; } return false; }
  if (!$('#settings').hidden) { $('#settings').hidden = true; return true; }
  return false;
}
addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeTop(); return; }
  if (!$('#sheet').hidden || !$('#picker').hidden || !$('#settings').hidden || /INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return;
  if (e.key === 'ArrowDown') { e.preventDefault(); step(1); } if (e.key === 'ArrowUp') { e.preventDefault(); step(-1); }
});
document.querySelectorAll('nav button').forEach(b => b.onclick = () => { if (b.dataset.tab !== tab) go(b.dataset.tab); else if (list.length) feed.scrollTop = 0; });
searchBox.oninput = () => { term[tab] = searchBox.value; render(); };

function touchStreak() { const n = Core.nextStreak(st.streak, Core.dayNumber(new Date())); if (n !== st.streak) { st.streak = n; pushProfile(); counts(); } }
function newDay() {
  if (!ready || document.visibilityState !== 'visible') return;
  touchStreak();
  if (shownDay !== dayKey() && $('#sheet').hidden) { tab = 'fy'; render(); remind(); }
}
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flushPos(); else newDay(); });
addEventListener('pagehide', flushPos); setInterval(newDay, 60000);

/* ---------- start ---------- */
async function loadCloud() {
  if (!window.claude || !window.claude.use) return null;
  const [db, user, dl] = await Promise.all([claude.use('db'), claude.use('user'), claude.use('downloads')]);
  downloads = dl;
  const uid = db && user ? await user.id() : null; if (!uid) return null;
  const c = db.collection('data/users/' + uid), snap = await c.limit(1000).get(); return { c, docs: snap.docs };
}
const timeout = (p, ms) => Promise.race([p, new Promise((_, r) => setTimeout(() => r(new Error('timeout')), ms))]);
function adopt(data) {
  if (!data || !data.st) return;
  st = { ...fresh(), ...data.st }; st.settings = { ...fresh().settings, ...st.settings };
  pos = { ...freshPos(), ...data.pos }; pos.ids = pos.ids || {};
}
async function boot() {
  let local = lsGet();
  if (native()) { try { const s = await native().get(KEY); if (s) local = JSON.parse(s); } catch (e) {} }
  adopt(local);
  let cloud = null; const inClaude = !!(window.claude && window.claude.use);
  if (inClaude) { try { cloud = await timeout(loadCloud(), 12000); } catch (e) {} }
  if (cloud) {
    col = cloud.c; const docs = {}; cloud.docs.forEach(d => docs[d.id] = JSON.parse(JSON.stringify(d.data())));
    if (docs.profile) {
      const written = {}; for (const k in docs) if (k.startsWith('w_')) written[k] = { ...docs[k], belief: 'yours', src: '' };
      const newer = docs.pos && (!local || docs.pos.at >= ((local.pos || {}).at || 0));
      adopt({ st: { ...docs.profile, written }, pos: newer ? docs.pos : pos });
    } else { pushProfile(); Object.keys(st.written).forEach(pushWritten); }
  }
  st.beliefs = (st.beliefs || []).filter(id => COLOR[id]);
  Object.values(st.written).forEach(w => { w.belief = 'yours'; w.src = ''; });
  tab = ['fy', 'saved', 'written'].includes(pos.tab) && pos.day === dayKey() ? pos.tab : 'fy';
  ready = true; applySize(); touchStreak(); render();
  if (!st.beliefs.length) openPicker(); else remind();
  if (inClaude && !cloud) toast('Saving on this device only');
  if (native()) native().onBack(closeTop, flushPos);
}
boot();
})();
