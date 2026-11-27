const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), p = await b.newPage();
  for (const [name, n] of [['public/icon-180.png', 180], ['public/icon-192.png', 192], ['public/icon-512.png', 512], ['assets/icon.png', 1024]]) {
    require('fs').mkdirSync(require('path').dirname(name), { recursive: true });
    await p.setViewportSize({ width: n, height: n });
    await p.setContent(`<body style="margin:0;width:${n}px;height:${n}px;background:#10141c;display:grid;place-items:center"><div style="width:62%;height:62%;border-radius:50%;background:#ffc94d;display:grid;place-items:center;font:${n * .55}px Georgia,serif;color:#17130a;line-height:1;overflow:hidden"><span style="position:relative;top:${n * .13}px">“</span></div></body>`);
    await p.screenshot({ path: name });
  }
  await b.close();
})();
