// Shared pieces of the differential tests: the oracle (marked 18.1.3 from the kit), the kit's
// generator, a seeded random source and a failure minimiser. Nothing here is used by the entry.
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { parse } from '../parse.js';

export const KIT = new URL('../../markdown-render-speed-02-kit/', import.meta.url);
const { marked } = await import(new URL('baselines/vendor/marked/marked.esm.js', KIT).href);

export { parse };
export function oracle(md) {
  return marked.parse(md);
}

/** null when both agree; otherwise a description of the difference. Inputs marked rejects are skipped. */
export function diff(md) {
  let want;
  try {
    want = marked.parse(md);
  } catch {
    return null;
  }
  let got;
  try {
    got = parse(md);
  } catch (err) {
    return { at: -1, want, got: 'THROW ' + (err && err.stack ? err.stack.split('\n').slice(0, 4).join(' | ') : err) };
  }
  if (got === want) return null;
  let at = 0;
  while (at < got.length && at < want.length && got.charCodeAt(at) === want.charCodeAt(at)) at++;
  return { at, want, got };
}

export function show(md, d) {
  const from = Math.max(0, d.at - 60);
  console.log('  input   : ' + JSON.stringify(md.length > 600 ? md.slice(0, 600) + '…' : md));
  console.log('  offset  : ' + d.at);
  console.log('  expected: ' + JSON.stringify(d.want.slice(from, d.at + 100)));
  console.log('  actual  : ' + JSON.stringify(d.got.slice(from, d.at + 100)));
}

/** Shrinks a failing input: drops lines, then characters, while it still fails. */
export function minimise(md) {
  let cur = md;
  let changed = true;
  let budget = 4000;
  while (changed && budget > 0) {
    changed = false;
    const lines = cur.split('\n');
    for (let size = Math.max(1, lines.length >> 1); size >= 1 && budget > 0; size = size >> 1) {
      for (let i = 0; i + size <= lines.length && budget > 0; ) {
        const cand = lines.slice(0, i).concat(lines.slice(i + size)).join('\n');
        budget--;
        if (cand.length < cur.length && diff(cand) !== null) {
          lines.splice(i, size);
          cur = cand;
          changed = true;
        } else {
          i += size;
        }
      }
      if (size === 1) break;
    }
    if (cur.length <= 400) {
      for (let i = 0; i < cur.length && budget > 0; ) {
        const cand = cur.slice(0, i) + cur.slice(i + 1);
        budget--;
        if (diff(cand) !== null) {
          cur = cand;
          changed = true;
        } else {
          i++;
        }
      }
    }
  }
  return cur;
}

/** mulberry32: a small seeded generator, so every run of a test is repeatable. */
export function rng(seed) {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  next.int = (n) => Math.floor(next() * n);
  next.pick = (arr) => arr[Math.floor(next() * arr.length)];
  return next;
}

export const examples = JSON.parse(readFileSync(new URL('program/generator/spec/examples.json', KIT), 'utf8'));

let gen = null;
/** Documents drawn by the kit's generator, exactly as draw.ts draws them, for a seed number. */
export async function drawDocuments(seedNumber, count) {
  if (gen === null) {
    const { readme } = await import(new URL('program/generator/readme.ts', KIT).href);
    const { streamFor } = await import(new URL('program/generator/rng.ts', KIT).href);
    const SENTINEL = 'zq sentinel paragraph';
    const insertable = examples
      .filter((e) => {
        const body = e.markdown.replace(/\n+$/, '');
        if (body.trim() === '') return false;
        const after = marked.parse(`${body}\n\n${SENTINEL}\n`);
        const before = marked.parse(`${SENTINEL}\n\n${body}\n`);
        return after.endsWith(`<p>${SENTINEL}</p>\n`) && before.startsWith(`<p>${SENTINEL}</p>\n`);
      })
      .map((e) => e.markdown);
    gen = { readme, streamFor, insertable };
  }
  const seed = createHash('sha256').update('fastpath-md test seed ' + seedNumber).digest('hex');
  const docs = [];
  for (let i = 0; i < count; i++) {
    const stream = gen.streamFor(seed, 'doc', i);
    const target = stream.between(20000, 100000);
    docs.push(gen.readme(stream, target, gen.insertable));
  }
  return docs;
}
