/* Builds www/ (installable web app and phone apps) and dist/claude-artifact.html from src/. */
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const root = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');
const out = (f, d) => { fs.mkdirSync(path.dirname(path.join(root, f)), { recursive: true }); fs.writeFileSync(path.join(root, f), d); };
const css = read('src/styles.css'), body = read('src/body.html');
const js = ['src/quotes.js', 'src/core.js', 'src/app.js'].map(read).join('\n');
const fonts = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;600;700&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500&display=swap">';

out('dist/claude-artifact.html', `<title>Daily Quote Feed</title>\n<meta name="claude:viewport-fit-sides" content="cover">\n${fonts}\n<style>\n${css}</style>\n${body}<script>\n${js}</script>\n`);

fs.rmSync(path.join(root, 'www'), { recursive: true, force: true });
let native = false;
try {
  require('esbuild').buildSync({ entryPoints: [path.join(root, 'src/native.js')], bundle: true, format: 'iife', minify: true, outfile: path.join(root, 'www/native.js'), logLevel: 'silent' });
  native = true;
} catch (e) {
  if (process.env.REQUIRE_NATIVE) throw e;
  console.warn('Phone features were not bundled (run npm install first).');
}
/* Fonts ship inside the app: they work offline and nothing is requested from another company. */
let faces = '';
for (const [pkg, family, weights] of [['figtree', 'Figtree', [400, 600, 700]], ['newsreader', 'Newsreader', [400, 500]]]) {
  for (const w of weights) for (const [subset, range] of [['latin', 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+2000-206F,U+2190-2193'], ['latin-ext', 'U+0100-02BA,U+1E00-1EFF']]) {
    const file = `${pkg}-${subset}-${w}-normal.woff2`;
    fs.mkdirSync(path.join(root, 'www'), { recursive: true });
    fs.copyFileSync(path.join(root, 'node_modules/@fontsource', pkg, 'files', file), path.join(root, 'www', file));
    faces += `@font-face{font-family:'${family}';font-weight:${w};font-display:swap;src:url(${file}) format('woff2');unicode-range:${range}}\n`;
  }
}
const safe = `body{padding:env(safe-area-inset-top,0px) 0 env(safe-area-inset-bottom,0px)}`;
const index = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; style-src 'self'; font-src 'self'; img-src 'self' blob: data:; object-src 'none'; base-uri 'none'">
<title>Daily Quote Feed</title>
<meta name="theme-color" content="#10141c">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icon-192.png"><link rel="apple-touch-icon" href="icon-180.png">
<link rel="stylesheet" href="styles.css"></head>
<body>
${body}${native ? '<script src="native.js"></script>\n' : ''}<script src="app.js"></script>
<script src="register.js"></script>
</body></html>
`;
out('www/index.html', index); out('www/styles.css', faces + css + safe + '\n'); out('www/app.js', js);
out('www/register.js', `if ('serviceWorker' in navigator && !(window.Native && window.Native.isNative)) navigator.serviceWorker.register('sw.js').catch(() => {});\n`);
for (const f of fs.readdirSync(path.join(root, 'public'))) fs.copyFileSync(path.join(root, 'public', f), path.join(root, 'www', f));
const files = fs.readdirSync(path.join(root, 'www')).filter(f => f !== 'sw.js').sort();
const hash = crypto.createHash('sha256'); files.forEach(f => hash.update(fs.readFileSync(path.join(root, 'www', f))));
out('www/sw.js', read('public/sw.js').replace('__VERSION__', hash.digest('hex').slice(0, 12)).replace('__FILES__', JSON.stringify(['./', ...files.filter(f => f !== 'sw.js')])));
console.log('Built www/ and dist/claude-artifact.html');
