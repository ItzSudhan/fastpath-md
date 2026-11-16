// Seeded fuzzers against marked.
//   node test/fuzz.mjs mut   [seed] [count]   mutations of generated documents and spec examples
//   node test/fuzz.mjs dense [seed] [count]   short strings made mostly of special characters
import { diff, show, minimise, rng, examples, drawDocuments } from './lib.mjs';

const mode = process.argv[2] ?? 'mut';
const seed = Number(process.argv[3] ?? 1);
const count = Number(process.argv[4] ?? 20000);
const rand = rng(seed * 7919 + (mode === 'mut' ? 1 : 2));

const INSERTS = ['*', '_', '[', ']', '(', ')', '<', '>', '`', '~', '|', '\\', '!', '#', '-', '+', '=', '&', ';', ':', '"', "'",
  '\n', '\r\n', '\t', ' ', '  ', '\n\n', '**', '__', '~~', '``', '](', '][', '[]', '![', '<!--', '-->', '</', '/>', '://', '@',
  'www.', 'http://', 'https://a.b', '&amp;', '&#35;', '&#x41;', '1. ', '- ', '> ', '    ', '```', '~~~', '---', '===', '| a | b |',
  '|---|---|', '[x] ', '[ ] ', 'é', 'ß', ' ', ' ', '中', '😀', '\ud83d', '\udc00', '\f', '\v', '\0', 'a@b.co', '<a ', '</a>',
  '<pre>', '</pre>', '<b>', '[foo]: /url "t"', '[foo]', '<div>', '<x@y.z>', '<http://a.b>', '\\\n', '  \n', 'mailto:', 'xmpp:a@b.c'];
const PREFIXES = ['> ', '- ', '1. ', ' ', '  ', '   ', '    ', '\t', '* ', '+ ', '2) ', '>', '# ', '- [ ] ', '- [x] ', '| ', '>> ', ' - ', '   > '];

function mutate(doc, pool) {
  let s = doc;
  const rounds = 1 + rand.int(4);
  for (let r = 0; r < rounds; r++) {
    const lines = s.split('\n');
    const i = rand.int(lines.length);
    switch (rand.int(12)) {
      case 0:
        lines.splice(i, 1 + rand.int(3));
        s = lines.join('\n');
        break;
      case 1:
        lines.splice(i, 0, lines[rand.int(lines.length)]);
        s = lines.join('\n');
        break;
      case 2: {
        const j = rand.int(lines.length);
        const t = lines[i];
        lines[i] = lines[j];
        lines[j] = t;
        s = lines.join('\n');
        break;
      }
      case 3: {
        const k = 1 + rand.int(4);
        const p = rand.pick(PREFIXES);
        for (let j = i; j < Math.min(lines.length, i + k); j++) lines[j] = p + lines[j];
        s = lines.join('\n');
        break;
      }
      case 4:
        lines[i] = lines[i].replace(/^[ \t>]+/, '');
        s = lines.join('\n');
        break;
      case 5:
      case 6:
      case 7: {
        const at = rand.int(s.length + 1);
        s = s.slice(0, at) + rand.pick(INSERTS) + s.slice(at);
        break;
      }
      case 8: {
        const at = rand.int(s.length + 1);
        s = s.slice(0, at) + s.slice(Math.min(s.length, at + 1 + rand.int(8)));
        break;
      }
      case 9:
        s = rand.int(2) ? s.slice(0, rand.int(s.length + 1)) : s.slice(rand.int(s.length + 1));
        break;
      case 10: {
        const other = rand.pick(pool);
        const a = rand.int(other.length);
        const frag = other.slice(a, a + 1 + rand.int(200));
        const at = rand.int(s.length + 1);
        s = s.slice(0, at) + frag + s.slice(at);
        break;
      }
      default:
        s = rand.int(2) ? s.replace(/\n/g, '\r\n') : s.replace(/ {2,}/g, '\t');
    }
  }
  return s;
}

function dense() {
  const alphabet = ['*', '_', '[', ']', '(', ')', '<', '>', '`', '~', '|', '\\', '!', '#', '-', '+', '=', '&', ';', ':', '"', "'",
    '\n', '\n', ' ', ' ', '\t', 'a', 'b', '1', '.', '/', '@', 'w', 'x', 'é', '😀', '*', '_', '[', ']', '`', '~', '\n', '>', '-'];
  const n = 1 + rand.int(40);
  let s = '';
  for (let i = 0; i < n; i++) s += rand.int(25) === 0 ? rand.pick(INSERTS) : rand.pick(alphabet);
  if (rand.int(6) === 0) s = '[foo]: /u\n[b a]: <x y> "t"\n\n' + s;
  return s;
}

let pool = [];
if (mode === 'mut') {
  const docs = await drawDocuments(1000 + seed, 6);
  for (const d of docs) {
    for (let at = 0; at < d.length; ) {
      const n = 150 + rand.int(1800);
      let end = d.indexOf('\n', at + n);
      if (end < 0) end = d.length;
      pool.push(d.slice(at, end + 1));
      at = end + 1;
    }
  }
  for (const e of examples) pool.push(e.markdown);
}

let bad = 0;
let skipped = 0;
for (let i = 0; i < count; i++) {
  const md = mode === 'mut' ? mutate(rand.pick(pool), pool) : dense();
  let d;
  try {
    d = diff(md);
  } catch (err) {
    skipped++;
    continue;
  }
  if (d !== null) {
    bad++;
    if (bad <= 3) {
      console.log(`FAIL ${mode} seed ${seed} case ${i}`);
      const small = minimise(md);
      show(small, diff(small) ?? d);
    }
    if (bad >= 20) break;
  }
}
console.log(bad === 0 ? `fuzz ${mode} seed ${seed}: all ${count} cases identical` : `fuzz ${mode} seed ${seed}: ${bad} failures`);
process.exit(bad === 0 ? 0 : 1);
