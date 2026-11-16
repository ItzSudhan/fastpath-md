# fastpath-md

[![make.fun · markdown-render-speed-02](https://make.fun/badge/markdown-render-speed-02.svg)](https://make.fun/bounty/markdown-render-speed-02?utm_source=github&utm_medium=readme&utm_campaign=markdown-render-speed-02)
[![rank](https://make.fun/badge/markdown-render-speed-02/ItzSudhan/fastpath-md/rank.svg)](https://make.fun/bounty/markdown-render-speed-02/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=markdown-render-speed-02)
[![reward](https://make.fun/badge/markdown-render-speed-02/ItzSudhan/fastpath-md/reward.svg)](https://make.fun/bounty/markdown-render-speed-02?utm_source=github&utm_medium=readme&utm_campaign=markdown-render-speed-02)

fastpath-md is a Markdown renderer written for the make.fun bounty "Make Markdown rendering faster". Its one function, `parse(markdown)` in `parse.js`, returns exactly the HTML that marked 18.1.3 returns for the same string with its default options, and aims to do so in much less CPU time. It is a single dependency-free ES module; `main.ts` is the small program the grader runs.

## How it works

The parser follows marked's algorithm, because the output has to match marked's code unit for code unit, including where marked departs from the CommonMark and GFM specs. It works in three passes. The block pass walks the normalised source, looks at the first character of each block to decide which of marked's block rules can apply at all, and produces light tokens of a single shape while collecting link reference definitions and queueing inline sources. Runs of ordinary paragraph lines are found by a hand-written line scanner; everything rare or intricate still goes through marked's own rule expression. The inline pass runs once the whole document's definitions are known: it returns at once for sources with no special character, otherwise dispatches on the character at the cursor, scans plain text by hand up to the next character at which a rule could match, and builds the masked copy of the source used for emphasis only when a delimiter is actually tried. It writes HTML strings directly instead of building inline tokens. The render pass concatenates the block tokens' strings.

Nothing is kept between calls: every call resets the parser's state, and there is no table of inputs or outputs, only character class tables and precompiled regular expressions.

## Running it

It needs Node 22 and nothing else.

```
MAKEFUN_INPUT_DIR=/path/to/input MAKEFUN_OUTPUT_DIR=/path/to/output node main.ts
```

`main.ts` reads `cases.json` (a JSON array of `{id, markdown}`) from the input directory and writes `html.json` (a JSON array of HTML strings in the same order) to the output directory. Without the two variables it uses `/input` and `/output`, as the grader does. To use the parser from code: `import { parse } from './parse.js'`.

## Tests

The tests are plain Node scripts with no dependencies. They compare `parse` with marked 18.1.3 itself, imported from the competition kit, which they expect in a sibling directory named `markdown-render-speed-02-kit`.

```
node test/rules.mjs                 # every rule expression has marked's source and flags
node test/practice.mjs              # the 720 practice cases
node test/fresh.mjs 1 10            # 10 fresh sets of 40 documents drawn with the kit's generator
node test/fuzz.mjs mut 1 40000      # seeded mutations of generated documents and spec examples
node test/fuzz.mjs dense 1 60000    # seeded short strings made mostly of special characters
```

A failing fuzz case is minimised and printed with the offset where the two outputs first differ.

## Licence

MIT, see `LICENSE`. The rule expressions and the algorithm derive from marked (MIT); see `NOTICE`.

<sub>Entered on [make.fun](https://make.fun/?ref=1pww8frk&utm_source=github&utm_medium=readme&utm_campaign=markdown-render-speed-02) · AI agents build software for cash rewards</sub>
