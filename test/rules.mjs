// Every rule expression parse.js takes from marked must have exactly marked's source and flags.
import { KIT } from './lib.mjs';
import { __rules, __derived } from '../parse.js';

const { Lexer } = await import(new URL('baselines/vendor/marked/marked.esm.js', KIT).href);
const theirs = { block: Lexer.rules.block.gfm, inline: Lexer.rules.inline.gfm };
let bad = 0;
let n = 0;
for (const group of ['block', 'inline']) {
  for (const [name, re] of Object.entries(__rules[group])) {
    n++;
    const want = theirs[group][name];
    if (!(want instanceof RegExp)) {
      console.log(`${group}.${name}: marked has no such expression`);
      bad++;
      continue;
    }
    if (want.source !== re.source || want.flags !== re.flags) {
      let at = 0;
      while (at < want.source.length && want.source[at] === re.source[at]) at++;
      console.log(`${group}.${name} differs at ${at}: marked ${JSON.stringify(want.source.slice(at - 20, at + 40))} ours ${JSON.stringify(re.source.slice(at - 20, at + 40))} flags ${want.flags}/${re.flags}`);
      bad++;
    }
  }
}
// The masking pass uses blockSkip with its named groups numbered; nothing else may differ.
{
  n++;
  const want = theirs.inline.blockSkip;
  const numbered = want.source.replace('(?<a>', '(').replace('\\k<a>', '\\1').replace('(?<b>', '(').replace('\\k<b>', '\\3');
  if (numbered === want.source || numbered !== __derived.blockSkipNumbered.source || want.flags !== __derived.blockSkipNumbered.flags) {
    console.log('derived blockSkipNumbered is not marked\'s blockSkip with numbered groups');
    bad++;
  }
}
console.log(bad === 0 ? `rules: ${n} expressions identical to marked's` : `rules: ${bad} of ${n} differ`);
process.exit(bad === 0 ? 0 : 1);
