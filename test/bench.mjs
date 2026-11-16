// CPU time (user + system) of whole node runs on the practice set, variants interleaved.
//   node test/bench.mjs [runs] label=command ...
// A command is split on spaces, e.g. ours="node main.ts" base="node ../kit/baselines/main.ts".
// Prints the median and the spread per variant. Uses /usr/bin/time -l (macOS) or -v (Linux).
import { spawnSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { KIT } from './lib.mjs';

const args = process.argv.slice(2);
const runs = /^\d+$/.test(args[0] ?? '') ? Number(args.shift()) : 11;
const variants = args.map((a) => {
  const eq = a.indexOf('=');
  return { label: a.slice(0, eq), cmd: a.slice(eq + 1).split(' ').filter(Boolean), times: [] };
});
const out = '/tmp/mdfast/bench-out';
mkdirSync(out, { recursive: true });
const env = { ...process.env, MAKEFUN_INPUT_DIR: fileURLToPath(new URL('practice/input', KIT)), MAKEFUN_OUTPUT_DIR: out };
const flag = process.platform === 'darwin' ? '-l' : '-v';
// A nominal clock rate to print cycle counts as time; only ratios between variants matter.
const CYCLES_PER_SECOND = Number(process.env.BENCH_HZ ?? 3.2e9);

function cpu(cmd) {
  const r = spawnSync('/usr/bin/time', [flag, ...cmd], { env, encoding: 'utf8' });
  if (r.status !== 0) throw new Error(cmd.join(' ') + ' failed: ' + r.stderr.slice(0, 400));
  if (process.platform === 'darwin') {
    // macOS rounds user and sys to 10 ms; the cycle count is finer, so use it when it is there
    // (converted with the ratio of this run's own rounded time, it stays in seconds overall)
    const m = /([\d.]+) real\s+([\d.]+) user\s+([\d.]+) sys/.exec(r.stderr);
    const cyc = /(\d+)\s+cycles elapsed/.exec(r.stderr);
    if (cyc) return Number(cyc[1]) / CYCLES_PER_SECOND;
    return Number(m[2]) + Number(m[3]);
  }
  const u = /User time \(seconds\): ([\d.]+)/.exec(r.stderr);
  const s = /System time \(seconds\): ([\d.]+)/.exec(r.stderr);
  return Number(u[1]) + Number(s[1]);
}

for (const v of variants) cpu(v.cmd); // warm-up
for (let i = 0; i < runs; i++) for (const v of variants) v.times.push(cpu(v.cmd));
for (const v of variants) {
  const t = v.times.slice().sort((a, b) => a - b);
  const med = t[t.length >> 1];
  console.log(`${v.label.padEnd(14)} median ${(med * 1000).toFixed(0).padStart(4)} ms   min ${(t[0] * 1000).toFixed(0)}   max ${(t[t.length - 1] * 1000).toFixed(0)}`);
}
