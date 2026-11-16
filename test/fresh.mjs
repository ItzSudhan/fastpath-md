// Fresh documents drawn with the kit's generator: node test/fresh.mjs [firstSeed] [sets]
// Each set is 40 documents, drawn as draw.ts draws them, compared with marked.
import { diff, show, minimise, drawDocuments } from './lib.mjs';

const first = Number(process.argv[2] ?? 1);
const sets = Number(process.argv[3] ?? 10);
let bad = 0;
let total = 0;
for (let s = first; s < first + sets; s++) {
  const docs = await drawDocuments(s, 40);
  for (let i = 0; i < docs.length; i++) {
    total++;
    const d = diff(docs[i]);
    if (d !== null) {
      bad++;
      if (bad <= 2) {
        console.log(`FAIL seed ${s} doc ${i + 1}`);
        const small = minimise(docs[i]);
        show(small, diff(small));
      }
    }
  }
}
console.log(bad === 0 ? `fresh: all ${total} documents identical` : `fresh: ${bad} of ${total} documents differ`);
process.exit(bad === 0 ? 0 : 1);
