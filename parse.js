// fastpath-md: a Markdown renderer whose output equals marked 18.1.3's default output.
// The rule regular expressions below derive from marked (MIT, see NOTICE); the parser around
// them is written for this project: a block pass, an inline pass and a string render pass.

// ---------------------------------------------------------------------------------------------
// Rule expressions (block level)
// ---------------------------------------------------------------------------------------------
const TAB = '\t';
const BT = '`';
const TAGS = 'address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul';

const F_HR = / {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/.source;
const F_HEAD = / {0,3}#{1,6}(?:\s|$)/.source;
const F_FENCE = / {0,3}(?:`{3,}(?=[^`\n]*(?:\n|$))|~~~)[^\n]*(?:\n|$)/.source;
const F_HTML = String.raw` {0,3}(?:</?(?:${TAGS})(?: +|\n|/?>)|<(?:(?:script|pre|style|textarea)(?:[\s>]|$)|!--)|<\?|<![A-Za-z]|<!\[CDATA\[)`;
const F_TABLE = String.raw` *([^\n ].*)\n {0,3}((?:\| *)?:?-+:? *(?:\| *:?-+:? *)*(?:\| *)?)(?:\n((?:(?! *\n|${F_HR}|${F_HEAD}| {0,3}>|(?: {4}| {0,3}${TAB})[^\n]|${F_FENCE}| {0,3}(?:[*+-]|1[.)])[ \t]|${F_HTML}).*(?:\n|$))*)\n*|$)`;

const NEWLINE_RE = /^(?:[ \t]*(?:\n|$))+/;
const CODE_RE = /^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/;
const FENCES_RE = /^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}(?:(?=`)\1`*|(?=~)\1~*) *(?=\n|$)|$)/;
const HEADING_RE = /^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/;
const HR_RE = /^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/;
const LIST_RE = /^( {0,3}(?:[*+-]|\d{1,9}[.)]))([ \t][^\n]*?)?(?:\n|$)/;
const DEF_RE = /^ {0,3}\[((?!\s*\])(?:\\[\s\S]|[^\[\]\\\n]|\n(?![ \t]*\n))+)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)((?:"(?:\\[\s\S]|[^"\\])*"|'(?:\\[\s\S]|[^'\\\n]|\n(?!\n))*'|\((?:\\[\s\S]|[^()\\])*\))))? *(?:\n+|$)/;
const BLOCKTEXT_RE = /^[^\n]+/;
const LHEADING_RE = /^(?! {0,3}(?:[*+-]|\d{1,9}[.)]) |(?: {4}| {0,3}\t)| {0,3}(?:`{3,}|~{3,})| {0,3}>| {0,3}#{1,6}(?:\s|$)| {0,3}<[^\n>]+>\n| {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n)((?:.|\n(?!\s*?\n| {0,3}(?:[*+-]|\d{1,9}[.)]) | {0,3}(?:`{3,}|~{3,})| {0,3}>| {0,3}#{1,6}(?:\s|$)| {0,3}(?:(?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)| {0,3}<[^\n>]+>\n| {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n))+?)\n {0,3}(=+|-+)[ \t]*(?:\n+|$)/;
const HTML_RE = new RegExp(String.raw`^ {0,3}(?:<(script|pre|style|textarea)[\s>][\s\S]*?(?:</\1>[^\n]*\n*|$)|<!--(?:-?>|[\s\S]*?(?:-->|$))[^\n]*(\n+|$)|<\?[\s\S]*?(?:\?>[^\n]*\n*|$)|<![A-Z][\s\S]*?(?:>[^\n]*\n*|$)|<!\[CDATA\[[\s\S]*?(?:\]\]>[^\n]*\n*|$)|</?(${TAGS})(?:[ \t]+|\n|/?>|$)[\s\S]*?(?:(?:\n[ ${TAB}]*)+\n|$)|<(?!(?:script|pre|style|textarea)(?![a-z0-9-]))([a-z][a-z0-9-]*)(?: +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>${BT}]+)?)*? */?>(?=[ \t]*(?:\n|$))[\s\S]*?(?:(?:\n[ ${TAB}]*)+\n|$)|</[a-z][a-z0-9-]*\s*>(?=[ \t]*(?:\n|$))[\s\S]*?(?:(?:\n[ ${TAB}]*)+\n|$))`, 'i');
const TABLE_RE = new RegExp('^' + F_TABLE);
const PARAGRAPH_RE = new RegExp(String.raw`^([^\n]+(?:\n(?!${F_HR}|${F_HEAD}| {0,3}>|${F_FENCE}| {0,3}(?:[*+-]|1[.)])[ \t]+[^ \t\n]|${F_HTML}|${F_TABLE}|[ \t]+\n)[^\n]+)*)`);
const BLOCKQUOTE_RE = new RegExp(String.raw`^( {0,3}> ?(?:(?![ \t]*(?:\n|$))(([^\n]+(?:\n(?!${F_HR}|${F_HEAD}| {0,3}>|${F_FENCE}| {0,3}(?:[*+-]|\d{1,9}[.)])(?:[ \t]|\n|$)|${F_HTML}|[ \t]+\n)[^\n]+)*))|[^\n]*)(?:\n|$))+`);

// ---------------------------------------------------------------------------------------------
// Rule expressions (inline level)
// ---------------------------------------------------------------------------------------------
const CODESPAN_RE = /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/;
const BR_RE = /^( {2,}|\\)\n(?!\s*$)[ \t]*/;
const INLINETEXT_RE = /^(?:[^a-zA-Z0-9](?=(?:mailto|xmpp):)|(`+|~+|[^`~])(?:(?=[`~])|(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|[hH][tT][tT][pP][sS]?|[fF][tT][pP]:\/\/|(?<![^\s*_~(])www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9](?=(?:mailto|xmpp):)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@))))/;
const PUNCT_RE = /^((?![*_])[\s\p{P}\p{S}])/u;
const BLOCKSKIP_RE = /\[(?:[^\[\]`]|(?<a>`+)[^`]+\k<a>(?!`))*?\]\((?:\\[\s\S]|[^\\\(\)]|\((?:\\[\s\S]|[^\\\(\)])*\))*\)|(?<!`)()(?<b>`+)[^`]+\k<b>(?!`)|<(?! )[^<>]*?>/g;
const EM_LDELIM_RE = /^(?:\*+(?:((?!\*)(?!~)[\p{P}\p{S}])|([^\s*]))?)|^_+(?:((?!_)(?!~)[\p{P}\p{S}])|([^\s_]))?/u;
const EM_RDELIM_AST_RE = /^[^_*]*?__[^_*]*?\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\*)(?!~)[\p{P}\p{S}](\*+)(?=[\s]|$)|(?:[^\s\p{P}\p{S}]|~)(\*+)(?!\*)(?=(?!~)[\s\p{P}\p{S}]|$)|(?!\*)(?!~)[\s\p{P}\p{S}](\*+)(?=(?:[^\s\p{P}\p{S}]|~))|[\s](\*+)(?!\*)(?=(?!~)[\p{P}\p{S}])|(?!\*)(?!~)[\p{P}\p{S}](\*+)(?!\*)(?=(?!~)[\p{P}\p{S}])|(?:[^\s\p{P}\p{S}]|~)(\*+)(?=(?:[^\s\p{P}\p{S}]|~))/gu;
const EM_RDELIM_UND_RE = /^[^_*]*?\*\*[^_*]*?_[^_*]*?(?=\*\*)|[^_]+(?=[^_])|(?!_)[\p{P}\p{S}](_+)(?=[\s]|$)|[^\s\p{P}\p{S}](_+)(?!_)(?=[\s\p{P}\p{S}]|$)|(?!_)[\s\p{P}\p{S}](_+)(?=[^\s\p{P}\p{S}])|[\s](_+)(?!_)(?=[\p{P}\p{S}])|(?!_)[\p{P}\p{S}](_+)(?!_)(?=[\p{P}\p{S}])/gu;
const DEL_LDELIM_RE = /^~~?(?:((?!~)[\p{P}\p{S}])|[^\s~])/u;
const DEL_RDELIM_RE = /^[^~]+(?=[^~])|(?!~)[\p{P}\p{S}](~~?)(?=[\s]|$)|[^\s\p{P}\p{S}](~~?)(?!~)(?=[\s\p{P}\p{S}]|$)|(?!~)[\s\p{P}\p{S}](~~?)(?=[^\s\p{P}\p{S}])|[\s](~~?)(?!~)(?=[\p{P}\p{S}])|(?!~)[\p{P}\p{S}](~~?)(?!~)(?=[\p{P}\p{S}])|[^\s\p{P}\p{S}](~~?)(?=[^\s\p{P}\p{S}])/gu;
const ANYPUNCT_RE = /\\([\p{P}\p{S}])/gu;
const ANYPUNCT_OUTSIDE_CODE_RE = /(`+)(?:[^`]|[^`][\s\S]*?[^`])\1(?!`)|`+|\\([\p{P}\p{S}])/gu;
const AUTOLINK_RE = /^<([a-zA-Z][a-zA-Z0-9+.-]{1,31}:[^\s\x00-\x1f<>]*|[a-zA-Z0-9.!#$%&'*+/=?_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_]))>/;
const LINK_RE = /^!?\[((?:\[(?:\[(?:\\[\s\S]|[^\[\]\\])*\]|\\[\s\S]|[^\[\]\\])*\]|\\[\s\S]|`+(?!`)[^`]*?`+(?!`)|``+(?=\])|[^\[\]\\`])*?)\]\([ \t\n]*(<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]+|(?=\)))(?:(?:[ \t]+(?:\n[ \t]*)?|\n[ \t]*)("(?:\\[\s\S]|[^"\\])*"|'(?:\\[\s\S]|[^'\\])*'|\((?:\\[\s\S]|[^)\\])*\)))?[ \t\n]*\)/;
const NOLINK_RE = /^!?\[((?!\s*\])(?:\\[\s\S]|[^\[\]\\\n]|\n(?![ \t]*\n))+)\](?:\[\])?/;
const REFLINK_RE = /^!?\[((?:\[(?:\[(?:\\[\s\S]|[^\[\]\\])*\]|\\[\s\S]|[^\[\]\\])*\]|\\[\s\S]|`+(?!`)[^`]*?`+(?!`)|``+(?=\])|[^\[\]\\`])*?)\]\[((?!\s*\])(?:\\[\s\S]|[^\[\]\\\n]|\n(?![ \t]*\n))+)\]/;
const REFLINK_SEARCH_RE = /!?\[((?:[^\[\]\\`]*(?:\[(?:\[(?:\\[\s\S]|[^\[\]\\])*\]|\\[\s\S]|[^\[\]\\])*\]|\\[\s\S]|`+(?!`)[^`]*?`+(?!`)|``+(?=\]))){0,999}?[^\[\]\\`]*?)\]\[((?!\s*\])(?:\\[\s\S]|[^\[\]\\]){1,999})\]|!?\[((?!\s*\])(?:\\[\s\S]|[^\[\]\\]){1,999})\](?:\[\])?(?!\()/g;
const TAG_RE = /^<!--(?:-?>|[\s\S]*?-->)|^<\/[a-zA-Z][a-zA-Z0-9-]*\s*>|^<[a-zA-Z][a-zA-Z0-9-]*(?:\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?)*?\s*\/?>|^<\?[\s\S]*?\?>|^<![a-zA-Z]+\s[\s\S]*?>|^<!\[CDATA\[[\s\S]*?\]\]>/;
const URL_RE = /^(?:mailto:[A-Za-z0-9._+-]+@[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![\w-])|xmpp:[A-Za-z0-9._+-]+@[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![\w-])(?:\/[A-Za-z0-9@.]+)?)|^((?:[hH][tT][tT][pP][sS]?|[fF][tT][pP]):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![\w-])/;
const BACKPEDAL_RE = /(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/;

/** The rule expressions that must equal marked's, by marked's own names (checked by test/rules.mjs). */
export const __rules = {
  block: {
    blockquote: BLOCKQUOTE_RE, code: CODE_RE, def: DEF_RE, fences: FENCES_RE, heading: HEADING_RE, hr: HR_RE,
    html: HTML_RE, lheading: LHEADING_RE, list: LIST_RE, newline: NEWLINE_RE, paragraph: PARAGRAPH_RE,
    table: TABLE_RE, text: BLOCKTEXT_RE,
  },
  inline: {
    _backpedal: BACKPEDAL_RE, anyPunctuation: ANYPUNCT_RE, anyPunctuationOutsideCode: ANYPUNCT_OUTSIDE_CODE_RE,
    autolink: AUTOLINK_RE, blockSkip: BLOCKSKIP_RE, br: BR_RE, code: CODESPAN_RE, delLDelim: DEL_LDELIM_RE,
    delRDelim: DEL_RDELIM_RE, emStrongLDelim: EM_LDELIM_RE, emStrongRDelimAst: EM_RDELIM_AST_RE,
    emStrongRDelimUnd: EM_RDELIM_UND_RE, link: LINK_RE, nolink: NOLINK_RE, punctuation: PUNCT_RE,
    reflink: REFLINK_RE, reflinkSearch: REFLINK_SEARCH_RE, tag: TAG_RE, text: INLINETEXT_RE, url: URL_RE,
  },
};

// ---------------------------------------------------------------------------------------------
// Small expressions of this parser
// ---------------------------------------------------------------------------------------------
const CR_RE = /\r\n|\r/g;
const BLANK_LINE_RE = /^[ \t]*$/;
const LEADING_WS_RE = /^[ \t]+/;
const NON_SPACE_RE = /[^ ]/;
const TAB_G_RE = /\t/g;
const DOUBLE_BLANK_RE = /\n[ \t]*\n[ \t]*$/;
const TASK_RE = /^\[[ xX]\][ \t]+\S/;
const TASK_STRIP_RE = /^\[[ xX]\][ \t]+/;
const TASK_BOX_RE = /\[[ xX]\]/;
const ANY_LINE_RE = /\n.*\n/;
const SETEXT_LINE_RE = /^ {0,3}(?:=+|-+) *$/;
const UP_TO_3_SPACES_RE = /^ {0,3}/;
const BQ_START_RE = /^ {0,3}>/;
const BQ_MARKER_WS_RE = /^( {0,3}>)([ \t]+)/gm;
const BQ_SETEXT_RE = /\n {0,3}((?:=+|-+)[ \t]*)(?=\n|$)/g;
const BQ_STRIP_RE = /^ {0,3}>[ \t]?/gm;
const FIRST_NL_RE = /^\n/;
const CODE_INDENT_RE = /^(?: {0,3}\t| {1,4})/gm;
const FENCE_INDENT_RE = /^(\s+)(?:```)/;
const LEADING_SPACE_RE = /^\s+/;
const HREF_BRACKETS_RE = /^<(.*)>$/;
const TABLE_DELIM_RE = /[:|]/;
const TABLE_ALIGN_CHARS_RE = /^\||\| *$/g;
const TABLE_ROW_BLANK_RE = /\n[ \t]*$/;
const ALIGN_RIGHT_RE = /^ *-+: *$/;
const ALIGN_CENTER_RE = /^ *:-+: *$/;
const ALIGN_LEFT_RE = /^ *:-+ *$/;
const PIPE_G_RE = /\|/g;
const SPLIT_PIPE_RE = / \|/;
const SLASH_PIPE_RE = /\\\|/g;
const WS_G_RE = /\s+/g;
const NOT_SPACE_START_RE = /^\S*/;
const ENDING_NL_RE = /\n$/;
const ESC_TEST_RE = /[&<>"']/;
const ESC_G_RE = /[&<>"']/g;
const ESC_NE_TEST_RE = /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/;
const ESC_NE_G_RE = /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g;
const NUMREF_RE = /&#(?:(\d{1,7})|[Xx]([A-Fa-f0-9]{1,6}));/;
const NUMREF_OR_AMP_RE = /&#(?:(\d{1,7})|[Xx]([A-Fa-f0-9]{1,6}));|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g;
const PERCENT25_RE = /%25/g;
const SAFE_URL_RE = /^[A-Za-z0-9\-_.!~*'();\/?:@&=+$,#]*$/;
const OUTPUT_LINK_RE = /\\([\[\]])/g;
const START_A_RE = /^<a /i;
const END_A_RE = /^<\/a>/i;
const START_RAW_RE = /^<(pre|code|kbd|script)(\s|>)/i;
const END_RAW_RE = /^<\/(pre|code|kbd|script)(\s|>)/i;
const ALNUM_U_RE = /[\p{L}\p{N}]/u;
const NL_G_RE = /\n/g;
const BT_G_RE = /`/g;
// Anything the inline pass has to look at: without a match the source is one run of text.
const INLINE_SPECIAL_RE = /[\\<\[`*~_&@]| {2,}\n|[hH][tT][tT][pP]|[fF][tT][pP]:\/\/|www\.|mailto:|xmpp:/;
// The constructs for which marked's text rule stops inside a run of ordinary characters.
const URLISH_RE = /@|[hH][tT][tT][pP]|[fF][tT][pP]:\/\/|www\.|mailto:|xmpp:/;

function listItemRe(bull) {
  return new RegExp(`^( {0,3}${bull})((?:[\t ][^\\n]*)?(?:\\n|$))`);
}
const ITEM_AST_RE = listItemRe('\\*');
const ITEM_PLUS_RE = listItemRe('\\+');
const ITEM_DASH_RE = listItemRe('\\-');
const ITEM_DOT_RE = listItemRe('\\d{1,9}\\.');
const ITEM_PAREN_RE = listItemRe('\\d{1,9}\\)');

function byIndent(make) {
  return [make(0), make(1), make(2), make(3)];
}
const NEXT_BULLET_RES = byIndent((n) => new RegExp(`^ {0,${n}}(?:[*+-]|\\d{1,9}[.)])((?:[ \t][^\\n]*)?(?:\\n|$))`));
const ITEM_HR_RES = byIndent((n) => new RegExp(`^ {0,${n}}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\\*[ \t]*){3,})(?:\\n+|$)`));
const ITEM_FENCE_RES = byIndent((n) => new RegExp(`^ {0,${n}}(?:\`\`\`|~~~)`));
const ITEM_HEADING_RES = byIndent((n) => new RegExp(`^ {0,${n}}#{1,6}(?:\\s|$)`));
const ITEM_HTML_RES = byIndent((n) => new RegExp(`^ {0,${n}}(?:</?(?:${TAGS})(?: +|$|/?>)|<(?:(?:script|pre|style|textarea)(?:[\\s>]|$)|!--)|<\\?|<![A-Za-z]|<!\\[CDATA\\[)`, 'i'));
const ITEM_BQ_RES = byIndent((n) => new RegExp(`^ {0,${n}}>`));

// ---------------------------------------------------------------------------------------------
// Character tables
// ---------------------------------------------------------------------------------------------
// 1 where an ASCII character may begin a paragraph that the line scanner can take.
const PARA_START = new Uint8Array(128);
// 1 where an ASCII character at the start of a following line needs the full rules.
const CONT_UNSAFE = new Uint8Array(128);
// 1 for ASCII punctuation (what a backslash escapes).
const ASCII_PUNCT = new Uint8Array(128);
// 1 where marked's text rule stops.
const TEXT_STOP = new Uint8Array(128);
// 1 where the url rule can begin.
const URL_START = new Uint8Array(128);
// 1 for the characters that can begin a construct that ends a list item's text.
const ITEM_MARKER = new Uint8Array(128);
// 1 for letters and digits; 1 for the characters of an e-mail address's local part.
const ALNUM = new Uint8Array(128);
const EMAIL_CH = new Uint8Array(128);
// What a character means to the text scanners: 0 nothing, 1 the text rule stops, 2 a space,
// 3 h, 4 f, 5 w, 6 m or x (the starts of url-like constructs), 7 an at sign.
const TEXT_CLASS = new Uint8Array(128);
// 1 for ASCII white space and punctuation other than * and _ (marked's punctuation rule).
const PUNCT_SPACE = new Uint8Array(128);
{
  for (const ch of '`~#<>*+-_0123456789') ITEM_MARKER[ch.charCodeAt(0)] = 1;
  for (const ch of '\\<![`*~_') TEXT_CLASS[ch.charCodeAt(0)] = 1;
  TEXT_CLASS[32] = 2;
  TEXT_CLASS[104] = TEXT_CLASS[72] = 3;
  TEXT_CLASS[102] = TEXT_CLASS[70] = 4;
  TEXT_CLASS[119] = 5;
  TEXT_CLASS[109] = TEXT_CLASS[120] = 6;
  TEXT_CLASS[64] = 7;
  for (const c of [9, 10, 11, 12, 13, 32]) PUNCT_SPACE[c] = 1;
  for (const ch of '!"#$%&\'()+,-./:;<=>?@[\\]^`{|}~') PUNCT_SPACE[ch.charCodeAt(0)] = 1;
  for (let c = 48; c < 58; c++) ALNUM[c] = EMAIL_CH[c] = 1;
  for (let c = 65; c < 91; c++) ALNUM[c] = ALNUM[c + 32] = EMAIL_CH[c] = EMAIL_CH[c + 32] = 1;
  for (const ch of ".!#$%&'*+/=?_`{|}~-") EMAIL_CH[ch.charCodeAt(0)] = 1;
  for (let c = 33; c < 127; c++) PARA_START[c] = 1;
  for (const ch of '#`~-_*+><[0123456789') PARA_START[ch.charCodeAt(0)] = 0;
  for (let c = 0; c < 33; c++) CONT_UNSAFE[c] = 1;
  for (const ch of '#>`~*+-_<=|:[0123456789') CONT_UNSAFE[ch.charCodeAt(0)] = 1;
  for (const ch of '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~') ASCII_PUNCT[ch.charCodeAt(0)] = 1;
  for (const ch of '\\<![`*~_') TEXT_STOP[ch.charCodeAt(0)] = 1;
  for (let c = 48; c < 58; c++) URL_START[c] = 1;
  for (let c = 65; c < 91; c++) URL_START[c] = URL_START[c + 32] = 1;
  for (const ch of '._+-') URL_START[ch.charCodeAt(0)] = 1;
}

// ---------------------------------------------------------------------------------------------
// Token and queue shapes
// ---------------------------------------------------------------------------------------------
const T_SPACE = 0, T_CODE = 1, T_HEADING = 2, T_HR = 3, T_BLOCKQUOTE = 4, T_LIST = 5, T_HTML = 6, T_DEF = 7,
  T_TABLE = 8, T_PARAGRAPH = 9, T_TEXT = 10;

class Tok {
  constructor(type, raw, text) {
    this.type = type;
    this.raw = raw;
    this.text = text;
    this.kids = null; // child block tokens, or a list's items
    this.q = null; // the inline queue entry holding this token's inline source
    this.n = 0; // heading depth, list start, checkbox state (0 none, 1 open, 2 checked)
    this.s = ''; // code language
    this.f = false; // list: ordered; item: task
    this.loose = false;
    this.x = null; // table data
  }
}

class Entry {
  constructor(src) {
    this.src = src;
    this.out = '';
  }
}

class Link {
  constructor(href, title) {
    this.href = href;
    this.title = title;
  }
}

// ---------------------------------------------------------------------------------------------
// Per-call state (reset at the start of every parse)
// ---------------------------------------------------------------------------------------------
let gLinks = new Map();
let gQueue = [];
let gTop = true;
let sInLink = false;
let sRaw = false;
let sLinkEmitted = false;
let sLinkParen = true;

// ---------------------------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------------------------
const ESC_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
function escChar(ch) {
  return ESC_MAP[ch];
}
function escAll(s) {
  return ESC_TEST_RE.test(s) ? s.replace(ESC_G_RE, escChar) : s;
}
function escNE(s) {
  return ESC_NE_TEST_RE.test(s) ? s.replace(ESC_NE_G_RE, escChar) : s;
}
function numRefRepl(whole, dec, hex) {
  if (dec === undefined && hex === undefined) return '&amp;';
  const v = dec === undefined ? Number.parseInt(hex, 16) : Number.parseInt(dec, 10);
  if (v === 0 || v > 1114111 || (v >= 55296 && v <= 57343)) return '\uFFFD';
  return v === 38 ? '&amp;' : String.fromCodePoint(v);
}
function decodeNumRefs(s) {
  return NUMREF_RE.test(s) ? s.replace(NUMREF_OR_AMP_RE, numRefRepl) : s;
}
function cleanUrl(href) {
  // encodeURI leaves these characters alone, and none of them is a percent sign
  if (SAFE_URL_RE.test(href)) return href;
  try {
    return encodeURI(href).replace(PERCENT25_RE, '%');
  } catch {
    return null;
  }
}
function rtrimChar(s, code) {
  let n = s.length;
  while (n > 0 && s.charCodeAt(n - 1) === code) n--;
  return n === s.length ? s : s.slice(0, n);
}
function trimTrailingBlankLines(s) {
  const lines = s.split('\n');
  let t = lines.length - 1;
  while (t >= 0 && BLANK_LINE_RE.test(lines[t])) t--;
  return lines.length - t <= 2 ? s : lines.slice(0, t + 1).join('\n');
}
function normLabel(s) {
  return s.trim().replace(WS_G_RE, ' ').toLowerCase().toUpperCase().toLowerCase();
}
function expandTabs(s, col) {
  let out = '';
  for (let i = 0; i < s.length; i++) {
    if (s.charCodeAt(i) === 9) {
      const w = 4 - (col % 4);
      out += ' '.repeat(w);
      col += w;
    } else {
      out += s[i];
      col++;
    }
  }
  return out;
}
function expandLeading(ws) {
  return expandTabs(ws, 0);
}
function firstLine(s) {
  const i = s.indexOf('\n');
  return i < 0 ? s : s.slice(0, i);
}
function closingParen(s) {
  if (s.indexOf('(') === -1 && s.indexOf(')') === -1) return -1;
  let depth = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if (c === 92) i++;
    else if (c === 40) depth++;
    else if (c === 41) {
      depth--;
      if (depth < 0) return i;
    }
  }
  return depth > 0 ? -2 : -1;
}
function pipeRepl(m, off, str) {
  let esc = false;
  let p = off;
  while (--p >= 0 && str[p] === '\\') esc = !esc;
  return esc ? '|' : ' |';
}
function splitCells(row, count) {
  const cells = row.replace(PIPE_G_RE, pipeRepl).split(SPLIT_PIPE_RE);
  if (!cells[0].trim()) cells.shift();
  if (cells.length > 0 && !cells[cells.length - 1].trim()) cells.pop();
  if (count) {
    if (cells.length > count) cells.splice(count);
    else while (cells.length < count) cells.push('');
  }
  for (let i = 0; i < cells.length; i++) cells[i] = cells[i].trim().replace(SLASH_PIPE_RE, '|');
  return cells;
}
function fenceText(raw, text) {
  const m = FENCE_INDENT_RE.exec(raw);
  if (m === null) return text;
  const width = m[1].length;
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const lead = LEADING_SPACE_RE.exec(lines[i]);
    if (lead !== null) lines[i] = lines[i].slice(Math.min(lead[0].length, width));
  }
  return lines.join('\n');
}
function enqueue(src) {
  const e = new Entry(src);
  gQueue.push(e);
  return e;
}

// ---------------------------------------------------------------------------------------------
// Block pass
// ---------------------------------------------------------------------------------------------

// The end of a run of plain lines starting at `pos`, or -1 when a following line needs the rules.
function scanPlainLines(src, pos, len) {
  let i = pos;
  for (;;) {
    const nl = src.indexOf('\n', i);
    if (nl < 0) return len;
    const q = nl + 1;
    if (q >= len) return nl;
    const c = src.charCodeAt(q);
    if (c === 10) return nl;
    if (c < 128 && CONT_UNSAFE[c] === 1) return -1;
    i = q;
  }
}

// Whether a setext underline could follow within the lines up to the next blank one.
function mayBeSetext(src, pos, len) {
  let nl = src.indexOf('\n', pos);
  while (nl >= 0) {
    let q = nl + 1;
    let sp = 0;
    while (q < len && sp < 3 && src.charCodeAt(q) === 32) {
      q++;
      sp++;
    }
    if (q >= len) return false;
    const c = src.charCodeAt(q);
    if (c === 61 || c === 45) return true;
    // a line of blanks ends the search
    let r = q;
    while (r < len && (src.charCodeAt(r) === 32 || src.charCodeAt(r) === 9)) r++;
    if (r >= len || src.charCodeAt(r) === 10) return false;
    nl = src.indexOf('\n', r);
  }
  return false;
}

function pushParagraph(toks, raw, text, lazy) {
  const last = toks.length > 0 ? toks[toks.length - 1] : null;
  if (lazy && last !== null && last.type === T_PARAGRAPH) {
    last.raw += (last.raw.endsWith('\n') ? '' : '\n') + raw;
    last.text += '\n' + text;
    gQueue[gQueue.length - 1].src = last.text;
  } else {
    const tok = new Tok(T_PARAGRAPH, raw, text);
    tok.q = enqueue(text);
    toks.push(tok);
  }
}

function pushText(toks, raw) {
  const last = toks.length > 0 ? toks[toks.length - 1] : null;
  if (last !== null && last.type === T_TEXT) {
    last.raw += (last.raw.endsWith('\n') ? '' : '\n') + raw;
    last.text += '\n' + raw;
    gQueue[gQueue.length - 1].src = last.text;
  } else {
    const tok = new Tok(T_TEXT, raw, raw);
    tok.q = enqueue(raw);
    toks.push(tok);
  }
}

function blockTokens(src, toks, lazy) {
  const len = src.length;
  let pos = 0;
  while (pos < len) {
    let c = src.charCodeAt(pos);
    let ws = false;
    if (c === 32 || c === 9 || c === 10) {
      const end = scanBlankLines(src, pos, len);
      if (end > pos) {
        if (end - pos === 1 && toks.length > 0) toks[toks.length - 1].raw += '\n';
        else toks.push(new Tok(T_SPACE, src.slice(pos, end), ''));
        pos = end;
        continue;
      }
      // one to three spaces before a character leave the choice of rules to that character
      ws = true;
      if (c === 32) {
        let p = pos + 1;
        while (p < len && p - pos < 4 && src.charCodeAt(p) === 32) p++;
        if (p - pos < 4 && p < len) {
          const d = src.charCodeAt(p);
          if (d !== 9 && d !== 10) {
            c = d;
            ws = false;
          }
        }
      }
    }
    if (!ws && (c > 127 || PARA_START[c] === 1)) {
      const end = scanPlainLines(src, pos, len);
      if (end >= 0) {
        const chunk = src.slice(pos, end);
        if (gTop) {
          pushParagraph(toks, chunk, chunk, lazy);
          lazy = false;
        } else {
          pushText(toks, chunk);
        }
        pos = end;
        continue;
      }
    }
    const rest = pos === 0 ? src : src.slice(pos);
    let m;
    if (ws) {
      m = CODE_RE.exec(rest);
      if (m !== null) {
        const raw = trimTrailingBlankLines(m[0]);
        const text = raw.replace(CODE_INDENT_RE, '');
        pos += raw.length;
        const last = toks.length > 0 ? toks[toks.length - 1] : null;
        if (last !== null && (last.type === T_PARAGRAPH || last.type === T_TEXT)) {
          last.raw += (last.raw.endsWith('\n') ? '' : '\n') + raw;
          last.text += '\n' + text;
          gQueue[gQueue.length - 1].src = last.text;
        } else {
          toks.push(new Tok(T_CODE, raw, text));
        }
        continue;
      }
    }
    if (ws || c === 96 || c === 126) {
      m = FENCES_RE.exec(rest);
      if (m !== null) {
        const raw = m[0];
        const tok = new Tok(T_CODE, raw, fenceText(raw, m[3] || ''));
        tok.s = m[2] ? m[2].trim().replace(ANYPUNCT_RE, '$1') : '';
        toks.push(tok);
        pos += raw.length;
        continue;
      }
    }
    if (ws || c === 35) {
      m = HEADING_RE.exec(rest);
      if (m !== null) {
        let text = m[2].trim();
        if (text.charCodeAt(text.length - 1) === 35) {
          const cut = rtrimChar(text, 35);
          if (!cut || cut.charCodeAt(cut.length - 1) === 32 || cut.charCodeAt(cut.length - 1) === 9) text = cut.trim();
        }
        const raw = rtrimChar(m[0], 10);
        const tok = new Tok(T_HEADING, raw, text);
        tok.n = m[1].length;
        tok.q = enqueue(text);
        toks.push(tok);
        pos += raw.length;
        continue;
      }
    }
    if (ws || c === 45 || c === 95 || c === 42) {
      m = HR_RE.exec(rest);
      if (m !== null) {
        const raw = rtrimChar(m[0], 10);
        toks.push(new Tok(T_HR, raw, ''));
        pos += raw.length;
        continue;
      }
    }
    if (ws || c === 62) {
      const tok = lexBlockquote(rest);
      if (tok !== null) {
        toks.push(tok);
        pos += tok.raw.length;
        continue;
      }
    }
    if (ws || c === 42 || c === 43 || c === 45 || (c >= 48 && c <= 57)) {
      const tok = lexList(rest);
      if (tok !== null) {
        toks.push(tok);
        pos += tok.raw.length;
        continue;
      }
    }
    if (ws || c === 60) {
      m = HTML_RE.exec(rest);
      if (m !== null) {
        const raw = trimTrailingBlankLines(m[0]);
        toks.push(new Tok(T_HTML, raw, raw));
        pos += raw.length;
        continue;
      }
    }
    if (ws || c === 91) {
      m = DEF_RE.exec(rest);
      if (m !== null && (m[2].charCodeAt(0) === 60 || closingParen(m[2]) === -1)) {
        const raw = rtrimChar(m[0], 10);
        pos += raw.length;
        const last = toks.length > 0 ? toks[toks.length - 1] : null;
        if (last !== null && (last.type === T_PARAGRAPH || last.type === T_TEXT)) {
          last.raw += (last.raw.endsWith('\n') ? '' : '\n') + raw;
          last.text += '\n' + raw;
          gQueue[gQueue.length - 1].src = last.text;
        } else {
          const tag = normLabel(m[1]);
          if (!gLinks.has(tag)) {
            const href = m[2] ? m[2].replace(HREF_BRACKETS_RE, '$1').replace(ANYPUNCT_RE, '$1') : '';
            const title = m[3] ? m[3].substring(1, m[3].length - 1).replace(ANYPUNCT_RE, '$1') : m[3];
            gLinks.set(tag, new Link(href, title));
          }
          toks.push(new Tok(T_DEF, raw, ''));
        }
        continue;
      }
    }
    if (delimiterRowFollows(src, pos, len)) {
      const tok = lexTable(rest);
      if (tok !== null) {
        toks.push(tok);
        pos += tok.raw.length;
        continue;
      }
    }
    if (mayBeSetext(src, pos, len)) {
      m = LHEADING_RE.exec(rest);
      if (m !== null) {
        const text = m[1].trim();
        const raw = rtrimChar(m[0], 10);
        const tok = new Tok(T_HEADING, raw, text);
        tok.n = m[2].charCodeAt(0) === 61 ? 1 : 2;
        tok.q = enqueue(text);
        toks.push(tok);
        pos += raw.length;
        continue;
      }
    }
    if (gTop) {
      m = PARAGRAPH_RE.exec(rest);
      if (m !== null) {
        const body = m[1];
        const text = body.charCodeAt(body.length - 1) === 10 ? body.slice(0, -1) : body;
        pushParagraph(toks, m[0], text, lazy);
        lazy = false;
        pos += m[0].length;
        continue;
      }
    }
    {
      // marked's block text rule: the rest of the line
      const nl = src.indexOf('\n', pos);
      const end = nl < 0 ? len : nl;
      pushText(toks, src.slice(pos, end));
      pos = end;
    }
  }
  gTop = true;
  return toks;
}

// The end of the blank lines that start at `pos` (marked's newline rule), or `pos` when the line
// there is not blank. Blanks that run to the end of the input count as a blank line.
function scanBlankLines(src, pos, len) {
  let end = pos;
  let p = pos;
  while (p < len) {
    let q = p;
    let c = 0;
    while (q < len && ((c = src.charCodeAt(q)) === 32 || c === 9)) q++;
    if (q >= len) return len;
    if (c !== 10) break;
    end = q + 1;
    p = end;
  }
  return end;
}

// Whether the line after the one at `pos` could be a table's delimiter row.
function delimiterRowFollows(src, pos, len) {
  const nl = src.indexOf('\n', pos);
  if (nl < 0) return false;
  let p = nl + 1;
  let n = 0;
  while (p < len && n < 3 && src.charCodeAt(p) === 32) {
    p++;
    n++;
  }
  if (p >= len) return false;
  const c = src.charCodeAt(p);
  return c === 124 || c === 58 || c === 45;
}

function lexTable(rest) {
  const m = TABLE_RE.exec(rest);
  if (m === null || !TABLE_DELIM_RE.test(m[2])) return null;
  const heads = splitCells(m[1], 0);
  const aligns = m[2].replace(TABLE_ALIGN_CHARS_RE, '').split('|');
  if (heads.length !== aligns.length) return null;
  const rows = m[3] && m[3].trim() ? m[3].replace(TABLE_ROW_BLANK_RE, '').split('\n') : [];
  const tok = new Tok(T_TABLE, rtrimChar(m[0], 10), '');
  const align = [];
  for (let i = 0; i < aligns.length; i++) {
    const a = aligns[i];
    align.push(ALIGN_RIGHT_RE.test(a) ? 'right' : ALIGN_CENTER_RE.test(a) ? 'center' : ALIGN_LEFT_RE.test(a) ? 'left' : '');
  }
  const header = [];
  for (let i = 0; i < heads.length; i++) header.push(enqueue(heads[i]));
  const body = [];
  for (let r = 0; r < rows.length; r++) {
    const cells = splitCells(rows[r], header.length);
    const row = [];
    for (let i = 0; i < cells.length; i++) row.push(enqueue(cells[i]));
    body.push(row);
  }
  tok.x = { align, header, body };
  return tok;
}

function bqMarkerRepl(whole, marker, ws) {
  return marker + expandTabs(ws, marker.length);
}

function lexBlockquote(src) {
  const m = BLOCKQUOTE_RE.exec(src);
  if (m === null) return null;
  let lines = rtrimChar(m[0], 10).split('\n');
  let raw = '';
  let text = '';
  const toks = [];
  while (lines.length > 0) {
    let inQuote = false;
    const cur = [];
    let i;
    for (i = 0; i < lines.length; i++) {
      if (BQ_START_RE.test(lines[i])) {
        cur.push(lines[i]);
        inQuote = true;
      } else if (!inQuote) {
        cur.push(lines[i]);
      } else {
        break;
      }
    }
    lines = lines.slice(i);
    const curRaw = cur.join('\n');
    const curText = curRaw.replace(BQ_MARKER_WS_RE, bqMarkerRepl).replace(BQ_SETEXT_RE, '\n    $1').replace(BQ_STRIP_RE, '');
    raw = raw ? raw + '\n' + curRaw : curRaw;
    text = text ? text + '\n' + curText : curText;
    const top = gTop;
    gTop = true;
    blockTokens(curText, toks, true);
    gTop = top;
    if (lines.length === 0) break;
    const last = toks.length > 0 ? toks[toks.length - 1] : null;
    if (last === null) continue;
    const lt = last.type;
    if (lt === T_CODE || lt === T_HEADING || lt === T_HR || lt === T_HTML || lt === T_TABLE) break;
    if (lt === T_BLOCKQUOTE) {
      const joined = lines.join('\n');
      const newSrc = last.raw + '\n' + joined.replace(BQ_STRIP_RE, '');
      const inner = lexBlockquote(newSrc);
      toks[toks.length - 1] = inner;
      const remainder = newSrc.substring(inner.raw.length).replace(FIRST_NL_RE, '');
      const left = remainder ? remainder.split('\n').length : 0;
      const used = left ? lines.slice(0, -left) : lines;
      if (used.length > 0) raw = raw + '\n' + used.join('\n');
      text = text.substring(0, text.length - last.text.length) + inner.text;
      lines = lines.slice(used.length);
      if (lines.length > 0 && BQ_START_RE.test(lines[0])) continue;
      break;
    } else if (lt === T_LIST) {
      const newSrc = last.raw + '\n' + lines.join('\n');
      const inner = lexList(newSrc);
      toks[toks.length - 1] = inner;
      const used = inner.raw.length > last.raw.length ? newSrc.slice(last.raw.length + 1, inner.raw.length).split('\n').length : 0;
      if (used > 0) {
        const add = lines.slice(0, used).join('\n');
        raw = raw + '\n' + add;
        text = text + '\n' + add;
      }
      lines = lines.slice(used);
      continue;
    }
  }
  const tok = new Tok(T_BLOCKQUOTE, raw, text);
  tok.kids = toks;
  return tok;
}

// The leading spaces and tabs of `s` with the tabs expanded from column `col`.
function expandLead(s, col) {
  let p = 0;
  let hasTab = false;
  while (p < s.length) {
    const c = s.charCodeAt(p);
    if (c === 9) hasTab = true;
    else if (c !== 32) break;
    p++;
  }
  return hasTab ? expandTabs(s.slice(0, p), col) + s.slice(p) : s;
}

// Whether `s` ends with a blank line: a line end, blanks, a line end, blanks.
function endsWithBlankLine(s) {
  let i = s.length - 1;
  let c = 0;
  while (i >= 0 && ((c = s.charCodeAt(i)) === 32 || c === 9)) i--;
  if (i < 0 || c !== 10) return false;
  i--;
  while (i >= 0 && ((c = s.charCodeAt(i)) === 32 || c === 9)) i--;
  return i >= 0 && c === 10;
}

function lexList(src) {
  let m = LIST_RE.exec(src);
  if (m === null) return null;
  const bull = m[1].trim();
  const ordered = bull.length > 1;
  const lastCh = bull.charCodeAt(bull.length - 1);
  const itemRe = ordered ? (lastCh === 46 ? ITEM_DOT_RE : ITEM_PAREN_RE) : lastCh === 42 ? ITEM_AST_RE : lastCh === 43 ? ITEM_PLUS_RE : ITEM_DASH_RE;
  const list = new Tok(T_LIST, '', '');
  list.f = ordered;
  list.n = ordered ? +bull.slice(0, -1) : 0;
  const items = [];
  const total = src.length;
  const maybeHr = !ordered && lastCh !== 43;
  let off = 0;
  let loose = false;
  let endsWithBlank = false;
  while (off < total) {
    const e = off === 0 ? src : src.slice(off);
    let endEarly = false;
    let itemText = '';
    m = itemRe.exec(e);
    if (m === null || (maybeHr && HR_RE.test(e))) break;
    const startOff = off;
    off += m[0].length;
    const width = m[1].length;
    let line = expandLead(firstLine(m[2]), width);
    let blank = !line.trim();
    let indent = 0;
    if (blank) {
      indent = width + 1;
      // an empty first line followed by a blank line ends the item
      let p = off;
      while (p < total && (src.charCodeAt(p) === 32 || src.charCodeAt(p) === 9)) p++;
      if (p >= total || src.charCodeAt(p) === 10) {
        off = Math.min(total, p + 1);
        endEarly = true;
      }
    } else {
      indent = line.search(NON_SPACE_RE);
      indent = indent > 4 ? 1 : indent;
      itemText = line.slice(indent);
      indent += width;
    }
    if (!endEarly) {
      const k = Math.max(0, Math.min(3, indent - 1));
      const nextBullet = NEXT_BULLET_RES[k];
      const hrRe = ITEM_HR_RES[k];
      const fenceRe = ITEM_FENCE_RES[k];
      const headRe = ITEM_HEADING_RES[k];
      const htmlRe = ITEM_HTML_RES[k];
      const bqRe = ITEM_BQ_RES[k];
      while (off < total) {
        const nl = src.indexOf('\n', off);
        const lineEnd = nl < 0 ? total : nl;
        // leading spaces and tabs of the line
        let p = off;
        let hasTab = false;
        let fc = 0;
        while (p < lineEnd) {
          fc = src.charCodeAt(p);
          if (fc === 32) p++;
          else if (fc === 9) {
            hasTab = true;
            p++;
          } else break;
        }
        const lead = p - off;
        const onlyBlanks = p === lineEnd;
        if (!onlyBlanks && !hasTab && lead <= 3 && fc < 128 && ITEM_MARKER[fc] === 1) {
          const nextLine = src.slice(off, lineEnd);
          if (fenceRe.test(nextLine) || headRe.test(nextLine) || htmlRe.test(nextLine) || bqRe.test(nextLine) || nextBullet.test(nextLine) || hrRe.test(nextLine)) break;
        }
        const lineBlank = onlyBlanks ? true : fc > 32 && fc < 128 ? false : !src.slice(off, lineEnd).trim();
        let cut; // the line without the item's indentation
        let firstNon; // where the tab-expanded line stops being spaces
        let expanded = '';
        if (hasTab) {
          expanded = expandTabs(src.slice(off, p), 0) + src.slice(p, lineEnd);
          firstNon = onlyBlanks ? -1 : expanded.length - (lineEnd - p);
          cut = expanded.slice(indent);
        } else {
          firstNon = onlyBlanks ? -1 : lead;
          cut = off + indent >= lineEnd ? '' : src.slice(off + indent, lineEnd);
        }
        if (firstNon >= indent || lineBlank) {
          itemText += '\n' + cut;
        } else {
          if (blank || line.replace(TAB_G_RE, '    ').search(NON_SPACE_RE) >= 4 || fenceRe.test(line) || headRe.test(line) || htmlRe.test(line) || hrRe.test(line)) break;
          const nextLine = src.slice(off, lineEnd);
          if (!hasTab) expanded = nextLine;
          const cont = SETEXT_LINE_RE.test(nextLine) && LHEADING_RE.test(line + '\n' + nextLine) ? '    ' + expanded.replace(UP_TO_3_SPACES_RE, '') : nextLine;
          itemText += '\n' + cont;
        }
        blank = lineBlank;
        off = Math.min(total, lineEnd + 1);
        line = cut;
      }
    }
    const itemRaw = src.slice(startOff, off);
    if (!loose) {
      if (endsWithBlank) loose = true;
      else if (endsWithBlankLine(itemRaw)) endsWithBlank = true;
    }
    const item = new Tok(T_TEXT, itemRaw, itemText);
    item.f = itemText.charCodeAt(0) === 91 && TASK_RE.test(itemText);
    items.push(item);
  }
  if (items.length === 0) return null;
  const lastItem = items[items.length - 1];
  lastItem.raw = lastItem.raw.trimEnd();
  lastItem.text = lastItem.text.trimEnd();
  list.raw = src.slice(0, off).trimEnd();
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    gTop = false;
    item.kids = blockTokens(item.text, [], false);
    if (!loose) {
      const kids = item.kids;
      for (let j = 0; j < kids.length; j++) {
        if (kids[j].type === T_SPACE && ANY_LINE_RE.test(kids[j].raw)) {
          loose = true;
          break;
        }
      }
    }
  }
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item.f) continue;
    const first = item.kids.length > 0 ? item.kids[0] : null;
    if (first !== null && (first.type === T_TEXT || first.type === T_PARAGRAPH)) {
      item.text = item.text.replace(TASK_STRIP_RE, '');
      first.raw = first.raw.replace(TASK_STRIP_RE, '');
      first.text = first.text.replace(TASK_STRIP_RE, '');
      for (let g = gQueue.length - 1; g >= 0; g--) {
        if (TASK_RE.test(gQueue[g].src)) {
          gQueue[g].src = gQueue[g].src.replace(TASK_STRIP_RE, '');
          break;
        }
      }
      const box = TASK_BOX_RE.exec(item.raw);
      if (box !== null) {
        first.n = box[0] !== '[ ]' ? 2 : 1;
        if (loose) {
          first.raw = box[0] + ' ' + first.raw;
          first.text = box[0] + ' ' + first.text;
        }
      }
    } else {
      item.f = false;
    }
  }
  if (loose) {
    for (let i = 0; i < items.length; i++) {
      const kids = items[i].kids;
      for (let j = 0; j < kids.length; j++) if (kids[j].type === T_TEXT) kids[j].type = T_PARAGRAPH;
    }
  }
  list.loose = loose;
  list.kids = items;
  return list;
}

// ---------------------------------------------------------------------------------------------
// Inline pass
// ---------------------------------------------------------------------------------------------

// Results of the delimiter matchers (emphasis and strikethrough).
let rLen = 0;
let rKind = 0;
let rText = '';

function maskRef(whole) {
  const open = whole.lastIndexOf('[');
  if (!gLinks.has(normLabel(whole.slice(open + 1, -1)))) return whole;
  if (open > 1 && whole.charCodeAt(0) !== 33) {
    const inner = whole.slice(1, open - 1);
    if (linkInText(inner)) return '[' + inner.replace(REFLINK_SEARCH_RE, maskRef) + '][' + 'a'.repeat(whole.length - open - 2) + ']';
  }
  return '[' + 'a'.repeat(whole.length - 2) + ']';
}
function maskCode(whole, ticks, punct) {
  if (punct) return '+'.repeat(whole.length);
  if (ticks) return ticks + whole.slice(ticks.length, -ticks.length).replace(BT_G_RE, '+') + ticks;
  return whole;
}
function maskSkip(whole) {
  return '[' + 'a'.repeat(whole.length - 2) + ']';
}
function linkInText(s) {
  if (!s.includes('[')) return false;
  for (const m of s.matchAll(BLOCKSKIP_RE)) {
    if (LINK_RE.test(m[0]) && s.charAt(m.index - 1) !== '!') return true;
  }
  for (const m of s.matchAll(REFLINK_SEARCH_RE)) {
    const whole = m[0];
    const open = whole.lastIndexOf('[');
    if (!(whole.charAt(0) === '!' || !gLinks.has(normLabel(whole.slice(open + 1, -1)))) && !(open > 1 && linkInText(whole.slice(1, open - 1)))) return true;
  }
  return false;
}

// The copy of an inline source in which links, code and escapes cannot hold delimiters.
// Each replacement is skipped when the text has nothing it could change.
function maskSource(src) {
  let t = src;
  if (gLinks.size > 0 && src.includes('[')) t = t.replace(REFLINK_SEARCH_RE, maskRef);
  // without a backslash only a code span that holds other backticks changes, which takes a run of two
  if (t.includes('\\') || t.includes('``')) t = t.replace(ANYPUNCT_OUTSIDE_CODE_RE, maskCode);
  if (t.includes('`') || t.includes('<') || t.includes('](')) t = t.replace(BLOCKSKIP_RE, maskSkip);
  return t;
}

// Where the last run of a delimiter that is not preceded by white space starts, or -1.
function lastCloser(t, code, ch) {
  let from = t.length - 1;
  while (from >= 0) {
    let p = t.lastIndexOf(ch, from);
    if (p < 0) return -1;
    while (p > 0 && t.charCodeAt(p - 1) === code) p--;
    if (p === 0) return -1;
    const b = t.charCodeAt(p - 1);
    if (b !== 32 && b !== 9 && b !== 10 && b !== 13 && b !== 12) return p;
    from = p - 2;
  }
  return -1;
}

function codePoints(s) {
  let n = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if (c >= 0xd800 && c <= 0xdbff && i + 1 < s.length) {
      const d = s.charCodeAt(i + 1);
      if (d >= 0xdc00 && d <= 0xdfff) i++;
    }
    n++;
  }
  return n;
}
function firstPointLen(s) {
  if (s.length > 1) {
    const c = s.charCodeAt(0);
    if (c >= 0xd800 && c <= 0xdbff) {
      const d = s.charCodeAt(1);
      if (d >= 0xdc00 && d <= 0xdfff) return 2;
    }
  }
  return 1;
}

// marked's punctuation rule (white space or punctuation, but not * or _) on the start of `s`.
function isPunctSpace(s) {
  if (s.length === 0) return false;
  const c = s.charCodeAt(0);
  return c < 128 ? PUNCT_SPACE[c] === 1 : PUNCT_RE.test(s);
}
// Whether `s` (one character, or none) holds a letter or a digit.
function isAlnum(s) {
  if (s.length === 0) return false;
  const c = s.charCodeAt(0);
  return c < 128 ? ALNUM[c] === 1 : ALNUM_U_RE.test(s);
}

// Emphasis and strong emphasis at `pos`; true with rLen, rKind (1 em, 2 strong) and rText set.
function matchEmphasis(src, pos, rest, masked, prev, closer) {
  let m = EM_LDELIM_RE.exec(rest);
  if (m === null || (!m[1] && !m[2] && !m[3] && !m[4])) return false;
  const delim = rest.charCodeAt(0);
  const delimCh = rest[0];
  const sameAsPrev = prev === delimCh;
  let l = pos;
  while (l > 0 && masked.charCodeAt(l - 1) === delim) l--;
  let before = '';
  if (l > 0) {
    before = masked[l - 1];
    if (l > 1) {
      const lo = masked.charCodeAt(l - 1);
      const hi = masked.charCodeAt(l - 2);
      if (lo >= 0xdc00 && lo <= 0xdfff && hi >= 0xd800 && hi <= 0xdbff) before = masked.slice(l - 2, l);
    }
  }
  const beforeIsPunct = before === '*' || before === '_' || isPunctSpace(before);
  if (l < pos) prev = before;
  const prevIsPunct = l < pos ? beforeIsPunct : isPunctSpace(prev);
  if (m[4] && isAlnum(prev)) return false;
  const nextPunct = m[1] || m[3] || '';
  if (!nextPunct || !prev || prevIsPunct) {
    const lLength = codePoints(m[0]) - 1;
    let delimTotal = lLength;
    let midDelimTotal = 0;
    const openRun = pos - l + lLength;
    const leftBoth = !!before.trim() && (!!nextPunct || (delim === 42 && !beforeIsPunct));
    const re = delim === 42 ? EM_RDELIM_AST_RE : EM_RDELIM_UND_RE;
    const start = pos + lLength;
    if (closer < start) return false;
    const tail = masked.slice(start);
    const limit = closer - start;
    re.lastIndex = 0;
    while ((m = re.exec(tail)) !== null && !(m.index > limit)) {
      const run = m[1] || m[2] || m[3] || m[4] || m[5] || m[6];
      if (!run) continue;
      let rLength = run.length;
      if (m[3] || m[4]) {
        delimTotal += rLength;
        continue;
      } else if (m[5] || m[6] || leftBoth) {
        if (sameAsPrev && (m[5] || m[6])) break;
        if (openRun % 3 && !((openRun + rLength) % 3)) {
          midDelimTotal += rLength;
          continue;
        }
      }
      delimTotal -= rLength;
      if (delimTotal > 0) continue;
      rLength = Math.min(rLength, rLength + delimTotal + midDelimTotal);
      const raw = rest.slice(0, lLength + m.index + firstPointLen(m[0]) + rLength);
      rLen = raw.length;
      if (Math.min(lLength, rLength) % 2) {
        rKind = 1;
        rText = raw.slice(1, -1);
      } else {
        rKind = 2;
        rText = raw.slice(2, -2);
      }
      return true;
    }
  }
  return false;
}

// Whether the underscores at `pos` sit between two ASCII letters or digits: the character before
// them (`before`, the end of the text just read) and the one after. marked gives up on those
// right after matching the opening delimiter, so nothing else needs to be worked out.
function wordUnderscore(src, pos, len, before) {
  if (!(before < 128 && ALNUM[before] === 1) || src.charCodeAt(pos - 1) !== before) return false;
  let r = pos + 1;
  while (r < len && src.charCodeAt(r) === 95) r++;
  if (r >= len) return false;
  const after = src.charCodeAt(r);
  return after < 128 && ALNUM[after] === 1;
}

// Strikethrough at `pos`; true with rLen and rText set.
function matchDel(src, pos, rest, masked, prev, closer) {
  let m = DEL_LDELIM_RE.exec(rest);
  if (m === null) return false;
  if (!(m[1] || '') || !prev || isPunctSpace(prev)) {
    const lLength = codePoints(m[0]) - 1;
    let delimTotal = lLength;
    const start = pos + lLength;
    if (closer < start) return false;
    const tail = masked.slice(start);
    const limit = closer - start;
    const re = DEL_RDELIM_RE;
    re.lastIndex = 0;
    while ((m = re.exec(tail)) !== null && !(m.index > limit)) {
      const run = m[1] || m[2] || m[3] || m[4] || m[5] || m[6];
      if (!run) continue;
      let rLength = run.length;
      if (rLength !== lLength) continue;
      if (m[3] || m[4]) {
        delimTotal += rLength;
        continue;
      }
      delimTotal -= rLength;
      if (delimTotal > 0) continue;
      rLength = Math.min(rLength, rLength + delimTotal);
      const raw = rest.slice(0, lLength + m.index + firstPointLen(m[0]) + rLength);
      rLen = raw.length;
      rText = raw.slice(lLength, -lLength);
      return true;
    }
  }
  return false;
}

// Whether an HTML tag or autolink that starts inside a link label runs past its end.
function tagCrossesLabel(rest, label, offset) {
  if (!label.includes('<')) return false;
  for (let s = 0; s < label.length; s++) {
    const c = label.charCodeAt(s);
    if (c === 92) {
      s++;
      continue;
    }
    if (c === 96) {
      const code = CODESPAN_RE.exec(label.slice(s));
      if (code !== null) {
        s += code[0].length - 1;
        continue;
      }
    }
    if (c !== 60) continue;
    const from = rest.slice(offset + s);
    const tag = TAG_RE.exec(from) || AUTOLINK_RE.exec(from);
    if (tag !== null) {
      if (tag[0].length > label.length - s) return true;
      s += tag[0].length - 1;
    }
  }
  return false;
}

// Renders a link or an image around its label; null when the label itself emitted a link.
function outputLink(label, href, title, image, alt) {
  const text = label.replace(OUTPUT_LINK_RE, '$1');
  const wasInLink = sInLink;
  const wasEmitted = sLinkEmitted;
  const wasRaw = sRaw;
  sInLink = true;
  sLinkEmitted = false;
  const inner = inline(text, alt || image);
  const emitted = sLinkEmitted;
  sLinkEmitted = wasEmitted;
  sInLink = wasInLink;
  if (!image) {
    if (emitted) {
      sRaw = wasRaw;
      return null;
    }
    sLinkEmitted = true;
  }
  if (alt) return inner;
  const url = cleanUrl(href);
  if (image) {
    if (url === null) return escNE(inner);
    let out = '<img src="' + escNE(url) + '" alt="' + escNE(inner) + '"';
    if (title) out += ' title="' + escNE(title) + '"';
    return out + '>';
  }
  if (url === null) return inner;
  let out = '<a href="' + escNE(url) + '"';
  if (title) out += ' title="' + escNE(title) + '"';
  return out + '>' + inner + '</a>';
}

// Length of the raw link at the start of `rest`, with its HTML in rText; 0 when there is none.
function matchLink(rest, alt) {
  const m = LINK_RE.exec(rest);
  if (m === null) return 0;
  const image = rest.charCodeAt(0) === 33;
  if (tagCrossesLabel(rest, m[1], image ? 2 : 1)) return 0;
  let whole = m[0];
  let dest = m[2];
  let titleRaw = m[3];
  const trimmed = dest.trim();
  if (trimmed.charCodeAt(0) === 60) {
    if (trimmed.charCodeAt(trimmed.length - 1) !== 62) return 0;
    const inside = trimmed.slice(0, -1);
    if ((trimmed.length - rtrimChar(inside, 92).length) % 2 === 0) return 0;
  } else {
    const close = closingParen(dest);
    if (close === -2) return 0;
    if (close > -1) {
      const cut = (image ? 5 : 4) + m[1].length + close;
      dest = dest.substring(0, close);
      whole = whole.substring(0, cut).trim();
      titleRaw = '';
    }
  }
  if ((whole.length - rtrimChar(whole.slice(0, -1), 92).length) % 2 === 0) return 0;
  let href = dest.trim();
  let title = titleRaw ? titleRaw.slice(1, -1) : '';
  if (href.charCodeAt(0) === 60) href = href.slice(1, -1);
  const html = outputLink(m[1], href && href.replace(ANYPUNCT_RE, '$1'), title && title.replace(ANYPUNCT_RE, '$1'), image, alt);
  if (html === null) return 0;
  rText = html;
  return whole.length;
}

// A reference link at the start of `rest`: 0 none, -1 an unknown label (one character of text),
// otherwise the raw length with the HTML in rText.
function matchReflink(rest, alt) {
  const m = REFLINK_RE.exec(rest) || NOLINK_RE.exec(rest);
  if (m === null) return 0;
  const image = rest.charCodeAt(0) === 33;
  if (tagCrossesLabel(rest, m[1], image ? 2 : 1)) return 0;
  const link = gLinks.get(normLabel(m[2] || m[1]));
  if (link === undefined) return -1;
  const html = outputLink(m[1], link.href, link.title, image, alt);
  if (html === null) return 0;
  rText = html;
  return m[0].length;
}

// The end of the text run that starts at `pos`, for sources without url-like constructs.
function scanText(src, pos, len) {
  const c = src.charCodeAt(pos);
  let j = pos + 1;
  if (c === 96 || c === 126) {
    while (j < len && src.charCodeAt(j) === c) j++;
  }
  if (j >= len) return len;
  const d = src.charCodeAt(j);
  if (d === 96 || d === 126) return j;
  if (d === 32 && hardBreakAt(src, j, len)) return j;
  for (let k = j; k < len; k++) {
    const ch = src.charCodeAt(k);
    if (ch >= 128) continue;
    const cls = TEXT_CLASS[ch];
    if (cls === 0 || cls > 2) continue;
    if (cls === 1) return k;
    // a space: a hard break starts here when the character before is not a space
    if (k > j && k + 2 < len && src.charCodeAt(k + 1) === 32 && src.charCodeAt(k - 1) !== 32 && hardBreakAt(src, k, len)) return k;
  }
  return len;
}
// The same for sources that may hold extended autolinks: the text also stops before "http",
// "ftp://", a "www." after white space or one of *_~( , "mailto:" or "xmpp:" after a character
// that is not a letter or digit, and before a run of address characters that ends in "@".
function scanTextUrl(src, pos, len) {
  const c = src.charCodeAt(pos);
  if (!(c < 128 && ALNUM[c] === 1) && schemeAt(src, pos + 1, len)) return pos + 1;
  let j = pos + 1;
  if (c === 96 || c === 126) {
    while (j < len && src.charCodeAt(j) === c) j++;
  }
  if (j >= len) return len;
  const d = src.charCodeAt(j);
  if (d === 96 || d === 126) return j;
  if (d === 32 && hardBreakAt(src, j, len)) return j;
  // `stop`: where the run of address characters before the next "@" starts (-1: none ahead)
  let stop = -1;
  let at = src.indexOf('@', j);
  if (at >= 0) {
    const run = addressStart(src, at);
    if (run <= j) {
      if (j < at) return j;
    } else if (run < at) stop = run;
  }
  for (let k = j; k < len; k++) {
    if (k === stop) return k;
    const ch = src.charCodeAt(k);
    if (ch >= 128) continue;
    const cls = TEXT_CLASS[ch];
    if (cls === 0) continue;
    if (cls === 1) return k;
    if (cls === 2) {
      if (k > j && k + 2 < len && src.charCodeAt(k + 1) === 32 && src.charCodeAt(k - 1) !== 32 && hardBreakAt(src, k, len)) return k;
    } else if (cls === 3) {
      if (k + 3 < len && (src.charCodeAt(k + 1) | 32) === 116 && (src.charCodeAt(k + 2) | 32) === 116 && (src.charCodeAt(k + 3) | 32) === 112) return k;
    } else if (cls === 4) {
      if (k + 5 < len && (src.charCodeAt(k + 1) | 32) === 116 && (src.charCodeAt(k + 2) | 32) === 112 && src.charCodeAt(k + 3) === 58 && src.charCodeAt(k + 4) === 47 && src.charCodeAt(k + 5) === 47) return k;
    } else if (cls === 5) {
      if (src.startsWith('www.', k) && wwwBoundary(src.charCodeAt(k - 1))) return k;
    } else if (cls === 6) {
      if (k > j && schemeAt(src, k, len)) {
        const b = src.charCodeAt(k - 1);
        if (!(b < 128 && ALNUM[b] === 1)) return k;
      }
    } else {
      // an "@": look for the next one
      stop = -1;
      at = src.indexOf('@', k + 1);
      if (at >= 0) {
        const run = addressStart(src, at);
        if (run < at) stop = run;
      }
    }
  }
  return len;
}
// Whether "mailto:" or "xmpp:" starts at `p`.
function schemeAt(src, p, len) {
  if (p >= len) return false;
  const c = src.charCodeAt(p);
  return (c === 109 && src.startsWith('mailto:', p)) || (c === 120 && src.startsWith('xmpp:', p));
}
// Where the run of address characters that ends just before `at` starts.
function addressStart(src, at) {
  let s = at;
  while (s > 0) {
    const c = src.charCodeAt(s - 1);
    if (c < 128 && EMAIL_CH[c] === 1) s--;
    else break;
  }
  return s;
}
const WS_CHAR_RE = /\s/;
function wwwBoundary(code) {
  if (code === 42 || code === 95 || code === 126 || code === 40 || code === 32 || (code >= 9 && code <= 13)) return true;
  return code > 127 && WS_CHAR_RE.test(String.fromCharCode(code));
}
// Whether two or more spaces and then a line end start at `j`.
function hardBreakAt(src, j, len) {
  let k = j;
  while (k < len && src.charCodeAt(k) === 32) k++;
  return k - j >= 2 && k < len && src.charCodeAt(k) === 10;
}

function autoLinkHtml(text, href, alt) {
  if (alt) return text;
  const shown = escAll(text);
  const url = cleanUrl(href);
  if (url === null) return shown;
  return '<a href="' + escAll(url) + '">' + shown + '</a>';
}

// Renders an inline source: HTML, or the plain text of an image description when `alt` is set.
function inline(src, alt) {
  if (!INLINE_SPECIAL_RE.test(src)) return alt || sRaw ? src : escNE(src);
  const parenWas = sLinkParen;
  sLinkParen = parenWas && src.includes(')');
  const out = inlineRun(src, alt);
  sLinkParen = parenWas;
  return out;
}

function inlineRun(src, alt) {
  const len = src.length;
  const urlish = URLISH_RE.test(src);
  let masked = '';
  let haveMask = false;
  let cAst = -2; // -2: not looked for yet
  let cUnd = -2;
  let cDel = -2;
  let out = '';
  let pend = '';
  let hasPend = false;
  let pendEsc = false;
  let pos = 0;
  let prev = '';
  let keep = false;
  while (pos < len) {
    if (!keep) prev = '';
    keep = false;
    const c = src.charCodeAt(pos);
    let piece = null; // HTML of a non-text token
    let adv = 0;
    if (c === 92) {
      const d = pos + 1 < len ? src.charCodeAt(pos + 1) : 0;
      if (d < 128 && ASCII_PUNCT[d] === 1) {
        const ch = src[pos + 1];
        piece = alt ? ch : escNE(ch);
        adv = 2;
      } else if (d === 10) {
        const m = BR_RE.exec(src.slice(pos));
        if (m !== null) {
          piece = alt ? '' : '<br>';
          adv = m[0].length;
        }
      }
    } else if (c === 60) {
      const rest = src.slice(pos);
      let m = TAG_RE.exec(rest);
      if (m !== null) {
        const raw = m[0];
        if (!sInLink && START_A_RE.test(raw)) sInLink = true;
        else if (sInLink && END_A_RE.test(raw)) sInLink = false;
        if (!sRaw && START_RAW_RE.test(raw)) sRaw = true;
        else if (sRaw && END_RAW_RE.test(raw)) sRaw = false;
        piece = raw;
        adv = raw.length;
      } else {
        m = AUTOLINK_RE.exec(rest);
        if (m !== null) {
          piece = autoLinkHtml(m[1], m[2] === '@' ? 'mailto:' + m[1] : m[1], alt);
          adv = m[0].length;
        }
      }
    } else if (c === 91 || (c === 33 && pos + 1 < len && src.charCodeAt(pos + 1) === 91)) {
      const rest = src.slice(pos);
      let n = sLinkParen ? matchLink(rest, alt) : 0;
      if (n > 0) {
        piece = rText;
        adv = n;
      } else {
        n = matchReflink(rest, alt);
        if (n > 0) {
          piece = rText;
          adv = n;
        } else if (n < 0) {
          // an unknown reference: its first character becomes text
          const ch = src[pos];
          if (hasPend) pend += ch;
          else {
            pend = ch;
            pendEsc = false;
            hasPend = true;
          }
          pos += 1;
          continue;
        }
      }
    } else if (c === 42 || c === 95) {
      if (c === 95 && prev.length === 1 && wordUnderscore(src, pos, len, prev.charCodeAt(0))) {
        // an underscore inside a word never opens emphasis
      } else {
        if (!haveMask) {
          masked = maskSource(src);
          haveMask = true;
        }
        let closer;
        if (c === 42) {
          if (cAst === -2) cAst = lastCloser(masked, 42, '*');
          closer = cAst;
        } else {
          if (cUnd === -2) cUnd = lastCloser(masked, 95, '_');
          closer = cUnd;
        }
        if (matchEmphasis(src, pos, src.slice(pos), masked, prev, closer)) {
          const kind = rKind;
          adv = rLen;
          const inner = inline(rText, alt);
          piece = alt ? inner : kind === 1 ? '<em>' + inner + '</em>' : '<strong>' + inner + '</strong>';
        }
      }
    } else if (c === 96) {
      const m = CODESPAN_RE.exec(src.slice(pos));
      if (m !== null) {
        let text = m[2].replace(NL_G_RE, ' ');
        if (NON_SPACE_RE.test(text) && text.charCodeAt(0) === 32 && text.charCodeAt(text.length - 1) === 32) text = text.substring(1, text.length - 1);
        piece = alt ? text : '<code>' + escAll(text) + '</code>';
        adv = m[0].length;
      }
    } else if (c === 32) {
      if (pos + 1 < len && src.charCodeAt(pos + 1) === 32) {
        const m = BR_RE.exec(src.slice(pos));
        if (m !== null) {
          piece = alt ? '' : '<br>';
          adv = m[0].length;
        }
      }
    } else if (c === 126) {
      if (!haveMask) {
        masked = maskSource(src);
        haveMask = true;
      }
      if (cDel === -2) cDel = lastCloser(masked, 126, '~');
      if (matchDel(src, pos, src.slice(pos), masked, prev, cDel)) {
        adv = rLen;
        const inner = inline(rText, alt);
        piece = alt ? inner : '<del>' + inner + '</del>';
      }
    }
    if (piece === null && urlish && !sInLink && c < 128 && URL_START[c] === 1) {
      const m = URL_RE.exec(src.slice(pos));
      if (m !== null) {
        let text;
        let href;
        let raw = m[0];
        if (m[2] === '@') {
          text = raw;
          href = 'mailto:' + text;
        } else {
          let before;
          do {
            before = raw;
            const b = BACKPEDAL_RE.exec(raw);
            raw = b !== null ? b[0] : '';
          } while (before !== raw);
          text = raw;
          href = m[1] === 'www.' ? 'http://' + raw : raw;
        }
        if (raw.length === 0) throw new Error('Infinite loop on byte: ' + c);
        piece = autoLinkHtml(text, href, alt);
        adv = raw.length;
      }
    }
    if (piece !== null) {
      if (hasPend) {
        out += pendEsc || alt ? pend : escNE(pend);
        hasPend = false;
      }
      out += piece;
      pos += adv;
      continue;
    }
    // text
    const end = urlish ? scanTextUrl(src, pos, len) : scanText(src, pos, len);
    const raw = src.slice(pos, end);
    if (src.charCodeAt(end - 1) !== 95) prev = src[end - 1];
    keep = true;
    const text = sRaw ? raw : decodeNumRefs(raw);
    if (hasPend) pend += text;
    else {
      pend = text;
      pendEsc = sRaw;
      hasPend = true;
    }
    pos = end;
  }
  if (hasPend) out += pendEsc || alt ? pend : escNE(pend);
  return out;
}

// ---------------------------------------------------------------------------------------------
// Render pass
// ---------------------------------------------------------------------------------------------
const BOX_OPEN = '<input disabled="" type="checkbox"> ';
const BOX_CHECKED = '<input checked="" disabled="" type="checkbox"> ';

function renderCell(entry, tag, align) {
  return (align ? '<' + tag + ' align="' + align + '">' : '<' + tag + '>') + entry.out + '</' + tag + '>\n';
}

function render(toks) {
  let out = '';
  for (let i = 0; i < toks.length; i++) {
    const tok = toks[i];
    switch (tok.type) {
      case T_PARAGRAPH:
        out += '<p>' + (tok.n === 0 ? '' : tok.n === 2 ? BOX_CHECKED : BOX_OPEN) + tok.q.out + '</p>\n';
        break;
      case T_TEXT:
        out += (tok.n === 0 ? '' : tok.n === 2 ? BOX_CHECKED : BOX_OPEN) + tok.q.out;
        break;
      case T_HEADING:
        out += '<h' + tok.n + '>' + tok.q.out + '</h' + tok.n + '>\n';
        break;
      case T_CODE: {
        const lang = NOT_SPACE_START_RE.exec(tok.s)[0];
        const body = tok.text ? tok.text.replace(ENDING_NL_RE, '') + '\n' : '';
        out += (lang ? '<pre><code class="language-' + escNE(lang) + '">' : '<pre><code>') + escAll(body) + '</code></pre>\n';
        break;
      }
      case T_HR:
        out += '<hr>\n';
        break;
      case T_BLOCKQUOTE:
        out += '<blockquote>\n' + render(tok.kids) + '</blockquote>\n';
        break;
      case T_LIST: {
        const items = tok.kids;
        let body = '';
        for (let j = 0; j < items.length; j++) body += '<li>' + render(items[j].kids) + '</li>\n';
        const tag = tok.f ? 'ol' : 'ul';
        out += '<' + tag + (tok.f && tok.n !== 1 ? ' start="' + tok.n + '"' : '') + '>\n' + body + '</' + tag + '>\n';
        break;
      }
      case T_HTML:
        out += tok.text;
        break;
      case T_TABLE: {
        const t = tok.x;
        let head = '';
        for (let j = 0; j < t.header.length; j++) head += renderCell(t.header[j], 'th', t.align[j]);
        let body = '';
        for (let r = 0; r < t.body.length; r++) {
          const row = t.body[r];
          let cells = '';
          for (let j = 0; j < row.length; j++) cells += renderCell(row[j], 'td', t.align[j]);
          body += '<tr>\n' + cells + '</tr>\n';
        }
        if (body) body = '<tbody>' + body + '</tbody>';
        out += '<table>\n<thead>\n<tr>\n' + head + '</tr>\n</thead>\n' + body + '</table>\n';
        break;
      }
      default:
        break;
    }
  }
  return out;
}

// ---------------------------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------------------------

/** The HTML marked 18.1.3 renders for `markdown` with its default options. */
export function parse(markdown) {
  gLinks = new Map();
  gQueue = [];
  gTop = true;
  sInLink = false;
  sRaw = false;
  sLinkEmitted = false;
  sLinkParen = true;
  const src = markdown.indexOf('\r') < 0 ? markdown : markdown.replace(CR_RE, '\n');
  const toks = blockTokens(src, [], false);
  const queue = gQueue;
  for (let i = 0; i < queue.length; i++) {
    sRaw = false;
    const entry = queue[i];
    entry.out = inline(entry.src, false);
  }
  const html = render(toks);
  gLinks = new Map();
  gQueue = [];
  return html;
}
