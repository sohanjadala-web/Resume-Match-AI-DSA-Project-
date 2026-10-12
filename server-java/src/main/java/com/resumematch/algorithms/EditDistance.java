package com.resumematch.algorithms;

import java.util.*;

/**
 * Levenshtein Edit Distance using Dynamic Programming
 * 
 * Time Complexity: O(N * M) where N and M are string lengths
 * Space Complexity: O(N * M) for full matrix, or O(min(N, M)) for 1D reduction
 * 
 * Used for technical keyword typo tolerance (e.g., resolving "Pyhton" -> "Python",
 * "Kuberenetes" -> "Kubernetes", "Postgrez" -> "PostgreSQL").
 */
public class EditDistance {

    public static class ClosestMatch {
        public final String match;
        public final double similarity;

        public ClosestMatch(String match, double similarity) {
            this.match = match;
            this.similarity = similarity;
        }

        @Override
        public String toString() {
            return String.format("ClosestMatch[Word='%s', Similarity=%.2f%%]", match, similarity * 100);
        }
    }

    /**
     * Calculates the Levenshtein distance between two strings using DP.
     * Operations: Insertion, Deletion, Substitution.
     */
    public static int calculate(String str1, String str2) {
        if (str1 == null) str1 = "";
        if (str2 == null) str2 = "";

        String s1 = str1.trim().toLowerCase();
        String s2 = str2.trim().toLowerCase();

        int m = s1.length();
        int n = s2.length();

        // dp[i][j] stores the min operations to transform s1[0..i-1] into s2[0..j-1]
        int[][] dp = new int[m + 1][n + 1];

        for (int i = 0; i <= m; i++) dp[i][0] = i;
        for (int j = 0; j <= n; j++) dp[0][j] = j;

        for (int i = 1; i <= m; i++) {
            for (int j = 1; j <= n; j++) {
                if (s1.charAt(i - 1) == s2.charAt(j - 1)) {
                    dp[i][j] = dp[i - 1][j - 1];
                } else {
                    dp[i][j] = 1 + Math.min(
                        dp[i - 1][j],       // Deletion
                        Math.min(
                            dp[i][j - 1],   // Insertion
                            dp[i - 1][j - 1] // Substitution
                        )
                    );
                }
            }
        }

        return dp[m][n];
    }

    /**
     * Returns the full dynamic programming table for visualization and viva explanation.
     */
    public static int[][] getDPTable(String str1, String str2) {
        String s1 = (str1 == null ? "" : str1.trim().toLowerCase());
        String s2 = (str2 == null ? "" : str2.trim().toLowerCase());

        int m = s1.length();
        int n = s2.length();
        int[][] dp = new int[m + 1][n + 1];

        for (int i = 0; i <= m; i++) dp[i][0] = i;
        for (int j = 0; j <= n; j++) dp[0][j] = j;

        for (int i = 1; i <= m; i++) {
            for (int j = 1; j <= n; j++) {
                if (s1.charAt(i - 1) == s2.charAt(j - 1)) {
                    dp[i][j] = dp[i - 1][j - 1];
                } else {
                    dp[i][j] = 1 + Math.min(dp[i - 1][j], Math.min(dp[i][j - 1], dp[i - 1][j - 1]));
                }
            }
        }
        return dp;
    }

    /**
     * Calculates similarity ratio (0.0 = completely distinct, 1.0 = identical).
     * Formula: (max(len1, len2) - distance) / max(len1, len2)
     */
    public static double similarity(String str1, String str2) {
        if (str1 == null) str1 = "";
        if (str2 == null) str2 = "";

        String s1 = str1.trim().toLowerCase();
        String s2 = str2.trim().toLowerCase();

        int maxLen = Math.max(s1.length(), s2.length());
        if (maxLen == 0) return 1.0;

        int dist = calculate(s1, s2);
        return Math.max(0.0, (double) (maxLen - dist) / maxLen);
    }

    /**
     * Finds the closest match from a list of candidates above a similarity threshold.
     */
    public static ClosestMatch findClosestMatch(String target, Collection<String> candidates, double threshold) {
        String bestMatch = null;
        double highestSim = 0.0;

        for (String cand : candidates) {
            double sim = similarity(target, cand);
            if (sim > highestSim && sim >= threshold) {
                highestSim = sim;
                bestMatch = cand;
            }
        }

        return (bestMatch != null) ? new ClosestMatch(bestMatch, highestSim) : null;
    }
}
