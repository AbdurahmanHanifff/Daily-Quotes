/* Browser test of the built web app. Needs Playwright with Chromium. */
const { chromium } = require('playwright'), assert = require('assert'), fs = require('fs');
const server = require('../scripts/serve.js');
(async () => {
  await new Promise(r => server.listen(0, r));
  const url = 'http://localhost:' + server.address().port + '/';
  const browser = await chromium.launch(), ctx = await browser.newContext({ viewport: { width: 390, height: 780 }, acceptDownloads: true });
  const p = await ctx.newPage(), errors = [];
  p.on('pageerror', e => errors.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/fonts\.g|ERR_|Failed to load resource/.test(m.text())) errors.push(m.text()); });
  const wait = (ms = 500) => p.waitForTimeout(ms), text = s => p.textContent(s);
  const shot = n => process.env.SHOTS && p.screenshot({ path: process.env.SHOTS + '/' + n + '.png' });
  let passed = 0; const ok = (c, m) => { assert.ok(c, m); passed++; console.log('ok -', m); };

  await p.goto(url); await wait(900);
  ok(await p.isVisible('#picker'), 'picker opens on first visit');
  ok(await p.locator('#beliefs button').count() === 12, '12 belief systems offered');
  ok(await p.isDisabled('#pickDone'), 'cannot start with nothing chosen');
  await p.click('[data-id=stoicism]'); await p.click('[data-id=taoism]'); await shot('picker');
  await p.click('#pickDone'); await wait();
  ok(await text('#count') === '1 of 16', 'feed holds only the two chosen');
  ok((await text('.card .tag')).startsWith("Today's quote"), 'first card is the daily quote');
  const daily = await p.getAttribute('.card', 'data-id'); await shot('feed');
  await p.click('#next'); await wait(800); await p.click('#next'); await wait(800);
  await p.locator('.card').nth(2).locator('[data-a=save]').click(); await wait(1200);
  await p.reload(); await wait(900);
  ok(await text('#count') === '3 of 16' && !(await p.isVisible('#picker')), 'reload resumes place and keeps choices');
  ok(await p.getAttribute('.card', 'data-id') === daily, 'daily quote is unchanged the same day');

  for (const t of ['First of mine', 'Second thought']) { await p.click('#write'); await p.fill('#qText', t); await p.click('#form .primary'); await wait(); }
  ok(await text('[data-tab=written]') === 'Written 2', 'two quotes written');
  await p.fill('#search', 'first'); await wait(); ok(await text('#count') === '1 of 1', 'search filters written quotes'); await p.fill('#search', '');
  await p.click('#write'); await p.fill('#qText', 'unfinished'); await p.click('#cancel'); await p.click('#write');
  ok(await p.inputValue('#qText') === 'unfinished', 'unsent draft is kept'); await p.fill('#qText', ''); await p.click('#cancel');
  await wait(); await p.locator('.card').first().locator('[data-a=save]').click();
  await p.click('#write'); await p.fill('#qText', '<img src=x onerror="window.pwned=1">'); await p.click('#form .primary'); await wait();
  ok(!(await p.evaluate(() => window.pwned)), 'typed markup stays plain text');
  const del = p.locator('.card').first().locator('[data-a=del]'); await del.click(); await del.click(); await wait();
  ok(await text('[data-tab=written]') === 'Written 2', 'delete needs two taps and works');

  await p.click('[data-tab=saved]'); await wait(); ok(await p.locator('#chips button').count() === 3, 'saved can be filtered by belief system'); await shot('saved');
  await p.locator('#chips button', { hasText: 'Written by you' }).click(); await wait(); ok(await text('#count') === '1 of 1', 'filter chip narrows saved');
  await p.click('[data-tab=fy]'); await wait(); ok(await text('#count') === '3 of 16', 'For You keeps its place across tabs');

  let [dl] = await Promise.all([p.waitForEvent('download'), p.locator('.card').nth(2).locator('[data-a=share]').click()]);
  const png = fs.readFileSync(await dl.path()); ok(png.readUInt32BE(16) === 1080 && png.readUInt32BE(20) === 1920, 'quote image is 1080x1920'); if (process.env.SHOTS) fs.writeFileSync(process.env.SHOTS + '/image.png', png);

  await p.click('#menu'); await shot('settings');
  [dl] = await Promise.all([p.waitForEvent('download'), p.click('#export')]);
  const backup = fs.readFileSync(await dl.path(), 'utf8'); ok(Object.keys(JSON.parse(backup).written).length === 2, 'backup has written quotes');
  await p.selectOption('#size', '1.18'); ok(await p.evaluate(() => document.documentElement.style.getPropertyValue('--scale')) === '1.18', 'text size applies');
  await p.click('#erase'); await p.click('#erase'); await wait();
  ok(await p.isVisible('#picker') && await text('[data-tab=written]') === 'Written 0', 'erase clears everything');
  await p.click('[data-id=islam]'); await p.click('#pickDone'); await wait(); await p.click('#menu');
  await p.setInputFiles('#import', { name: 'b.json', mimeType: 'application/json', buffer: Buffer.from(backup) }); await wait();
  ok(await text('[data-tab=written]') === 'Written 2', 'restore brings quotes back');
  await p.setInputFiles('#import', { name: 'x.json', mimeType: 'application/json', buffer: Buffer.from('junk') }); await wait(200);
  ok((await text('#toast')).includes('not a quote backup'), 'bad backup is refused'); await p.click('#close');

  await p.evaluate(() => { const d = JSON.parse(localStorage.getItem('dailyquotes.v1')); d.pos.day = '1'; d.pos.tab = 'saved'; localStorage.setItem('dailyquotes.v1', JSON.stringify(d)); window.addEventListener('pagehide', () => localStorage.setItem('dailyquotes.v1', JSON.stringify(d))); });
  await p.reload(); await wait(900);
  ok(await p.getAttribute('[data-tab=fy]', 'aria-selected') === 'true' && (await text('#count')).startsWith('1 of'), 'a new day opens on the new daily quote');

  /* version 1 data: no belief choices, saves of old quotes */
  const old = await browser.newContext(); const o = await old.newPage(); o.on('pageerror', e => errors.push(e.message));
  await o.addInitScript(() => localStorage.setItem('dailyquotes.v1', JSON.stringify({ st: { seed: 5, saved: { w1: 1, q1: 2 }, written: { w_a: { id: 'w_a', text: 'Old one', by: 'You', cat: 'Yours', created: 1 } } }, pos: { tab: 'fy', day: '2026-11-25', ids: {}, at: 1 } })));
  await o.goto(url); await o.waitForTimeout(900);
  ok(await o.isVisible('#picker') && await o.textContent('[data-tab=saved]') === 'Saved 2' && await o.textContent('[data-tab=written]') === 'Written 1', 'version 1 data carries over');

  await p.evaluate(() => navigator.serviceWorker.ready); await wait(800); await ctx.setOffline(true); await p.reload(); await wait(900);
  ok(await p.locator('.card[data-id]').count() > 0, 'works offline after first visit'); await ctx.setOffline(false);

  for (const [w, h] of [[320, 568], [768, 1024]]) {
    await p.setViewportSize({ width: w, height: h }); await wait();
    ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'no sideways scroll at ' + w + 'px'); await shot('w' + w);
  }

  /* the single-file claude.ai build, with no claude runtime present */
  const a = await browser.newPage(); a.on('pageerror', e => errors.push(e.message));
  await a.setContent('<!doctype html><meta charset="utf-8">' + fs.readFileSync(__dirname + '/../dist/claude-artifact.html', 'utf8')); await a.waitForTimeout(900);
  ok(await a.locator('#beliefs button').count() === 12, 'single-file build starts');

  ok(errors.length === 0, 'no page errors ' + errors.join(' | '));
  console.log('\n' + passed + ' browser checks passed'); await browser.close(); server.close();
})().catch(e => { console.error(e.message); process.exit(1); });
