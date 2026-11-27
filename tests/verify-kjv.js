/* Checks every King James quote against the "kjv" npm package. Usage: node tests/verify-kjv.js path/to/verses-1769.json */
const verses = require(require('path').resolve(process.argv[2])), { QUOTES } = require('../src/quotes.js');
const norm = s => s.replace(/[#\[\]]/g, '').toLowerCase().replace(/[^a-z ]/g, '').replace(/\s+/g, ' ').trim();
let bad = 0, n = 0;
for (const q of QUOTES.filter(q => q.src.includes('KJV'))) {
  const ref = q.src.split(' · ')[0].replace(/^Psalm /, 'Psalms '); n++;
  if (!verses[ref] || !norm(verses[ref]).includes(norm(q.text))) { bad++; console.log('MISMATCH', ref, q.text, '|', verses[ref]); }
}
console.log(n + ' checked, ' + bad + ' mismatched'); process.exit(bad ? 1 : 0);
