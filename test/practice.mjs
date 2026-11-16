// Every practice case against marked, and against the kit's expected HTML.
import { readFileSync } from 'node:fs';
import { KIT, diff, show, parse } from './lib.mjs';

const cases = JSON.parse(readFileSync(new URL('practice/input/cases.json', KIT), 'utf8'));
const expected = JSON.parse(readFileSync(new URL('practice/reference/expected.json', KIT), 'utf8')).cases;
let bad = 0;
for (let i = 0; i < cases.length; i++) {
  const d = diff(cases[i].markdown);
  let wrong = d !== null;
  if (!wrong && parse(cases[i].markdown) !== expected[i].html) wrong = true;
  if (wrong) {
    bad++;
    if (bad <= 3) {
      console.log('FAIL ' + cases[i].id);
      if (d !== null) show(cases[i].markdown, d);
    }
  }
}
console.log(bad === 0 ? `practice: all ${cases.length} cases identical` : `practice: ${bad} of ${cases.length} cases differ`);
process.exit(bad === 0 ? 0 : 1);
