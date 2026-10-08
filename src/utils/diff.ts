export type DiffType = 'same' | 'add' | 'del';

export interface DiffToken {
  type: DiffType;
  text: string;
}

/** LCS cơ bản trên mảng token — đủ nhanh cho văn bản hợp đồng. */
function lcsTable(a: string[], b: string[]): number[][] {
  const dp: number[][] = Array.from({ length: a.length + 1 }, () =>
    new Array<number>(b.length + 1).fill(0)
  );
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  return dp;
}

function diffTokens(oldT: string[], newT: string[]): DiffToken[] {
  const dp = lcsTable(oldT, newT);
  const out: DiffToken[] = [];
  let i = 0;
  let j = 0;
  while (i < oldT.length && j < newT.length) {
    if (oldT[i] === newT[j]) {
      out.push({ type: 'same', text: oldT[i] });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      out.push({ type: 'del', text: oldT[i] });
      i++;
    } else {
      out.push({ type: 'add', text: newT[j] });
      j++;
    }
  }
  while (i < oldT.length) out.push({ type: 'del', text: oldT[i++] });
  while (j < newT.length) out.push({ type: 'add', text: newT[j++] });
  return out;
}

const splitWords = (s: string): string[] => s.split(/(\s+)/).filter((w) => w.length > 0);

/**
 * Diff theo dòng; với cặp dòng thay thế 1-1 thì diff sâu tới từng từ để tô chính xác
 * chữ bị sửa thay vì cả dòng.
 */
export function diffLines(oldStr: string, newStr: string): DiffToken[][] {
  const oldLines = (oldStr || '').split('\n');
  const newLines = (newStr || '').split('\n');
  const dp = lcsTable(oldLines, newLines);
  const ops: Array<{ type: DiffType; text: string }> = [];
  let i = 0;
  let j = 0;
  while (i < oldLines.length && j < newLines.length) {
    if (oldLines[i] === newLines[j]) {
      ops.push({ type: 'same', text: oldLines[i] });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      ops.push({ type: 'del', text: oldLines[i] });
      i++;
    } else {
      ops.push({ type: 'add', text: newLines[j] });
      j++;
    }
  }
  while (i < oldLines.length) ops.push({ type: 'del', text: oldLines[i++] });
  while (j < newLines.length) ops.push({ type: 'add', text: newLines[j++] });

  // Gom cặp del/add liền kề số lượng bằng nhau -> word-diff từng cặp
  const rows: DiffToken[][] = [];
  let k = 0;
  while (k < ops.length) {
    if (ops[k].type === 'same') {
      rows.push([{ type: 'same', text: ops[k].text }]);
      k++;
      continue;
    }
    const dels: string[] = [];
    const adds: string[] = [];
    while (k < ops.length && ops[k].type !== 'same') {
      if (ops[k].type === 'del') dels.push(ops[k].text);
      else adds.push(ops[k].text);
      k++;
    }
    if (dels.length === adds.length && dels.length > 0) {
      for (let p = 0; p < dels.length; p++) {
        const words = diffTokens(splitWords(dels[p]), splitWords(adds[p]));
        // Giới hạn: dòng quá dài thì giữ nguyên cả dòng để khỏi nặng máy
        rows.push(
          words.length > 120
            ? [
                { type: 'del', text: dels[p] },
                { type: 'add', text: adds[p] },
              ]
            : words
        );
      }
    } else {
      for (const d of dels) rows.push([{ type: 'del', text: d }]);
      for (const a of adds) rows.push([{ type: 'add', text: a }]);
    }
  }
  return rows;
}
