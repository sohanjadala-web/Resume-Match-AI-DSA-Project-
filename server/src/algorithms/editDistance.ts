/**
 * Levenshtein Edit Distance using Dynamic Programming
 * Time Complexity: O(N * M)
 * Space Complexity: O(N * M) (or O(min(N, M)) optimized)
 */

export interface EditDistanceResult {
  distance: number;
  similarity: number; // 0.0 to 1.0
  operations: string[];
}

export class EditDistance {
  /**
   * Calculates the Levenshtein distance between two strings
   */
  public static calculate(str1: string, str2: string): number {
    const s1 = str1.trim().toLowerCase();
    const s2 = str2.trim().toLowerCase();

    const m = s1.length;
    const n = s2.length;

    // dp[i][j] stores the min operations to transform s1[0..i-1] into s2[0..j-1]
    const dp: number[][] = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (s1[i - 1] === s2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = 1 + Math.min(
            dp[i - 1][j],    // deletion
            dp[i][j - 1],    // insertion
            dp[i - 1][j - 1] // substitution
          );
        }
      }
    }

    return dp[m][n];
  }

  /**
   * Calculates similarity ratio (0.0 = completely distinct, 1.0 = identical)
   */
  public static similarity(str1: string, str2: string): number {
    const s1 = str1.trim().toLowerCase();
    const s2 = str2.trim().toLowerCase();

    const maxLen = Math.max(s1.length, s2.length);
    if (maxLen === 0) return 1.0;

    const dist = this.calculate(s1, s2);
    return Math.max(0, (maxLen - dist) / maxLen);
  }

  /**
   * Finds the closest match from a list of candidates above a threshold
   */
  public static findClosestMatch(target: string, candidates: string[], threshold = 0.75): { match: string; similarity: number } | null {
    let bestMatch: string | null = null;
    let highestSim = 0;

    for (const cand of candidates) {
      const sim = this.similarity(target, cand);
      if (sim > highestSim && sim >= threshold) {
        highestSim = sim;
        bestMatch = cand;
      }
    }

    return bestMatch ? { match: bestMatch, similarity: highestSim } : null;
  }
}
