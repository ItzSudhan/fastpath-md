// The program the grader runs: node /bot/main.ts. It reads the cases from /input/cases.json, renders
// each one with parse() and writes the HTML strings, in order, to /output/html.json.
// Outside a container MAKEFUN_INPUT_DIR and MAKEFUN_OUTPUT_DIR stand in for /input and /output.

import { readFileSync, writeFileSync } from 'node:fs';
import { setFlagsFromString } from 'node:v8';

// A whole run lasts a fraction of a second. In that time V8's optimising compiler costs more CPU
// than the code it produces saves, so it is switched off before the parser is loaded. The setting
// changes only how the code is compiled, never what it computes.
setFlagsFromString('--no-opt');

const { parse } = await import('./parse.js');

const inputDir: string = process.env.MAKEFUN_INPUT_DIR ?? '/input';
const outputDir: string = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const cases = JSON.parse(readFileSync(inputDir + '/cases.json', 'utf8')) as { id: string; markdown: string }[];
const html: string[] = new Array(cases.length);
for (let i = 0; i < cases.length; i++) html[i] = parse(cases[i].markdown);
writeFileSync(outputDir + '/html.json', JSON.stringify(html));
