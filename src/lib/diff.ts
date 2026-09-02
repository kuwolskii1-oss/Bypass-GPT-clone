/**
 * Word-level diff used by the "Compare" view. LCS on whitespace-attached tokens,
 * computed per paragraph so long documents stay cheap.
 */
export interface DiffOp {
  type: "equal" | "insert" | "delete";
  text: string;
}

interface Token {
  key: string;
  raw: string;
}

const MAX_CELLS = 2_500_000;

function tokenize(s: string): Token[] {
  const out: Token[] = [];
  const re = /\S+\s*/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s)) !== null) {
    out.push({ raw: m[0], key: m[0].trim() });
  }
  return out;
}

function push(ops: DiffOp[], type: DiffOp["type"], text: string): void {
  const last = ops[ops.length - 1];
  if (last && last.type === type) last.text += text;
  else ops.push({ type, text });
}

function diffTokens(a: Token[], b: Token[]): DiffOp[] {
  const n = a.length;
  const m = b.length;
  const ops: DiffOp[] = [];
  if (n === 0 && m === 0) return ops;
  if ((n + 1) * (m + 1) > MAX_CELLS) {
    // Too large to diff comfortably in the browser: show the new text unmarked.
    push(ops, "equal", b.map((t) => t.raw).join(""));
    return ops;
  }
  const w = m + 1;
  const dp = new Uint16Array((n + 1) * w);
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i * w + j] =
        a[i].key === b[j].key ? dp[(i + 1) * w + j + 1] + 1 : Math.max(dp[(i + 1) * w + j], dp[i * w + j + 1]);
    }
  }
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i].key === b[j].key) {
      push(ops, "equal", b[j].raw);
      i++;
      j++;
    } else if (dp[(i + 1) * w + j] >= dp[i * w + j + 1]) {
      push(ops, "delete", a[i].raw);
      i++;
    } else {
      push(ops, "insert", b[j].raw);
      j++;
    }
  }
  while (i < n) push(ops, "delete", a[i++].raw);
  while (j < m) push(ops, "insert", b[j++].raw);
  return ops;
}

/** Diff two texts paragraph by paragraph (paragraphs are separated by blank lines). */
export function diffWords(before: string, after: string): DiffOp[] {
  const pa = before.split(/\n{2,}/);
  const pb = after.split(/\n{2,}/);
  if (pa.length !== pb.length) return diffTokens(tokenize(before), tokenize(after));
  const ops: DiffOp[] = [];
  pa.forEach((p, idx) => {
    if (idx > 0) push(ops, "equal", "\n\n");
    for (const op of diffTokens(tokenize(p), tokenize(pb[idx]))) push(ops, op.type, op.text);
  });
  return ops;
}
