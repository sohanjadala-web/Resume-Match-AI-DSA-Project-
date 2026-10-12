/**
 * Knuth-Morris-Pratt (KMP) Exact Pattern Matching Algorithm
 * Time Complexity: O(N + M) where N is text length, M is pattern length
 * Space Complexity: O(M) for Longest Prefix Suffix (LPS) table
 */

export class KMP {
  /**
   * Precomputes the Longest Proper Prefix which is also Suffix array (LPS)
   */
  private static computeLPS(pattern: string): number[] {
    const m = pattern.length;
    const lps = new Array<number>(m).fill(0);
    let len = 0;
    let i = 1;

    while (i < m) {
      if (pattern[i].toLowerCase() === pattern[len].toLowerCase()) {
        len++;
        lps[i] = len;
        i++;
      } else {
        if (len !== 0) {
          len = lps[len - 1];
        } else {
          lps[i] = 0;
          i++;
        }
      }
    }
    return lps;
  }

  /**
   * Search all occurrences of pattern in text
   */
  public static search(text: string, pattern: string): number[] {
    const indices: number[] = [];
    if (!text || !pattern || pattern.length === 0) return indices;

    const n = text.length;
    const m = pattern.length;
    const lps = this.computeLPS(pattern);

    let i = 0; // index for text
    let j = 0; // index for pattern

    while (i < n) {
      if (text[i].toLowerCase() === pattern[j].toLowerCase()) {
        i++;
        j++;
      }

      if (j === m) {
        indices.push(i - j);
        j = lps[j - 1];
      } else if (i < n && text[i].toLowerCase() !== pattern[j].toLowerCase()) {
        if (j !== 0) {
          j = lps[j - 1];
        } else {
          i++;
        }
      }
    }

    return indices;
  }

  /**
   * Returns true if text contains pattern
   */
  public static contains(text: string, pattern: string): boolean {
    return this.search(text, pattern).length > 0;
  }
}
