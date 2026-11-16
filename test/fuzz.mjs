// Seeded fuzzers against marked.
//   node test/fuzz.mjs mut   [seed] [count]   mutations of generated documents and spec examples
//   node test/fuzz.mjs dense [seed] [count]   short strings made mostly of special characters
//   node test/fuzz.mjs url   [seed] [count]   short strings made of the parts of links and addresses
//   node test/fuzz.mjs emph  [seed] [count]   short strings made of emphasis delimiters and their neighbours
//   node test/fuzz.mjs para  [seed] [count]   a few lines that start like blocks or like inline content
//   node test/fuzz.mjs table [seed] [count]   small tables with pipes, escapes and code in their cells
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

const URL_PARTS = ['www.', 'http', 'https://', 'ftp://', 'HTTP://', 'hTtPs://', 'mailto:', 'xmpp:', '@', '@', 'a', 'b.c', '.', '.', ' ', ' ',
  '  \n', '\n', '*', '_', '~', '(', ')', '<', '>', '[', ']', '`', '!', '-', '+', 'x', 'm', 'w', 'h', 'f', 't', 'p', ':', '/', '&', ';', '#',
  'é', ' ', 'com', '1', '?', ',', "'", '"', 'a@b.co', 'www.a.b', 'http://a.b/c?d=e&f', 'ww', 'ft', 'htt', '\\', '\t', '=', '{', '|', '}'];
function urls() {
  const n = 1 + rand.int(25);
  let s = '';
  for (let i = 0; i < n; i++) s += rand.pick(URL_PARTS);
  return s;
}

const EMPH_PARTS = ['*', '*', '*', '**', '_', '_', '__', '~', '~~', ' ', ' ', 'a', 'b', 'c', '.', ',', '(', ')', '"', '\n', 'é', '-', '!', '?',
  '***', '___', 'a*', '*a', '_a', 'a_', ' *', '* ', ' _', '_ ', '`', '[', ']', '\\', '<', '>', '](u)', '[x]', '`c`', '<b>', '\\*', '\\_', '😀', ' ', '+', '&', '1', '\t'];
function emph() {
  const n = 1 + rand.int(22);
  let s = '';
  for (let i = 0; i < n; i++) s += rand.pick(EMPH_PARTS);
  if (rand.int(8) === 0) s = '[x]: /u\n\n' + s;
  return s;
}

const LINES = ['`a`', '``', '```', '````x', '~', '~~a~~', '~~~', '[a]', '[a]: /u', '1', '1.', '1. a', '1) a', '12. a', '2. a', '10', '*', '* a',
  '*a*', '**a**', '***', '** *', '* * *', '_a_', '__a__', '___', '_ _ _', '__', '**', '*\t', 'a', 'b c', 'a', 'text', '', ' ', '  a', '    a', '-', '- a',
  '---', '===', '=', '| a |', '|-|', ':-', '#', '# a', '>', '> a', '<b>', '<div>', '+', '+ a', 'é', '\t', '1.a', '*a', '_a', '`', '``` a', '~~~a', '[', ']',
  '1)', '0. a', '*  a', '_', '**a', '__a', '*_', '_*', '`` ` ``', '~~', '1.\ta', '*\ta', '_\t_', '** a', '__ a', '9) a', '[a](b)', '![a](b)', '`a', '~a'];
function para() {
  const n = 2 + rand.int(6);
  const lines = [];
  for (let i = 0; i < n; i++) lines.push(rand.pick(LINES));
  let s = lines.join('\n');
  const wrap = rand.int(8);
  if (wrap === 0) s = '- ' + s.replace(/\n/g, '\n  ');
  else if (wrap === 1) s = '> ' + s.replace(/\n/g, '\n> ');
  else if (wrap === 2) s = '1. ' + s.replace(/\n/g, '\n   ');
  if (rand.int(4) === 0) s += '\n';
  return s;
}

const CELL_PARTS = ['a', 'b', ' ', ' ', '|', '|', '|', '\\|', '\\', '\\\\|', '`|`', '*b*', '  ', ':', '-', 'x', '\t', 'é', '[l](u)', '\\\\', '| ', ' |', '||'];
const DELIM_ROWS = ['|---|---|', '|-|-|', '---|---', '|:-|-:|', '| :-: | --- |', '-|-', '|---|', '---', '|--|--|--|', ':-|:-:', '| - | - |', '|-|-|\\'];
function table() {
  const row = () => {
    const n = 1 + rand.int(9);
    let s = '';
    for (let i = 0; i < n; i++) s += rand.pick(CELL_PARTS);
    return s;
  };
  let s = row() + '\n' + rand.pick(DELIM_ROWS);
  const rows = rand.int(4);
  for (let i = 0; i < rows; i++) s += '\n' + row();
  if (rand.int(5) === 0) s = 'text\n' + s;
  if (rand.int(5) === 0) s += '\n\nafter';
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
  const md = mode === 'mut' ? mutate(rand.pick(pool), pool) : mode === 'url' ? urls() : mode === 'emph' ? emph() : mode === 'para' ? para() : mode === 'table' ? table() : dense();
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
