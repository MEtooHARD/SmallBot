import { LINE_START_HAS_NON_WHITESPACE_REGEX } from "./common_static";

/**
 * Adds Markdown dimming to the start of each non-whitespace line in the content.
 * @param content The input string to be processed.
 * @returns The processed string with Markdown dimming applied.
 */
export function MD_dim(content: string): string { return content.replaceAll(LINE_START_HAS_NON_WHITESPACE_REGEX, '-# '); }

/**
 * 強制將字串陣列拆分為長度最平衡（最接近相等）的兩個部分。
 * 使用二元搜尋找出最佳切割點。
 *
 * @param lines - 原始字串陣列
 * @returns [part1, part2] - 切割後的兩個陣列
 */
export function balanced_halve(lines: string[]): string[][] {
    const N = lines.length;

    // 邊界情況處理：
    // 0 個元素 -> [[], []]
    // 1 個元素 -> [[item], []] (無法拆分，只能全給左邊)
    if (N === 0) return [[], []];
    if (N === 1) return [lines, []];

    // 1. 預計算前綴和 (Prefix Sums)
    // prefixSums[i] = 前 i 行的總字元數
    const prefixSums: number[] = new Array(N + 1).fill(0);
    let currentLen = 0;

    for (let i = 0; i < N; i++) {
        currentLen += lines[i].length;
        prefixSums[i + 1] = currentLen;
    }

    const totalLength = prefixSums[N];

    // 2. 二元搜尋最佳平衡點
    // 我們要找一個切割索引 k (1 到 N-1)，使得 |左邊長 - 右邊長| 最小
    let low = 1;
    let high = N - 1; // 確保左右至少各分到 1 個元素
    let bestSplitIndex = 1;
    let minDiff = Infinity;

    while (low <= high) {
        const mid = Math.floor((low + high) / 2);

        const leftLen = prefixSums[mid];
        const rightLen = totalLength - leftLen;

        // 差異 = 左邊 - 右邊
        const diff = leftLen - rightLen;

        // 記錄絕對值最小的差異
        const absDiff = Math.abs(diff);
        if (absDiff < minDiff) {
            minDiff = absDiff;
            bestSplitIndex = mid;
        }

        if (diff < 0) { // 左邊比右邊短 (Diff < 0) -> 切點往右移，讓左邊變長
            low = mid + 1;
        } else if (diff > 0) { // 左邊比右邊長 (Diff > 0) -> 切點往左移，讓左邊變短
            high = mid - 1;
        } else { // 完美平衡 (Diff === 0)
            bestSplitIndex = mid;
            break;
        }
    }

    // 3. 執行拆分
    return [
        lines.slice(0, bestSplitIndex),
        lines.slice(bestSplitIndex)
    ];
}