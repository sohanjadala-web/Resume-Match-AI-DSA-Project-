package com.resumematch.algorithms;

import java.util.*;

/**
 * Knuth-Morris-Pratt (KMP) Exact Pattern Matching Algorithm
 * 
 * Time Complexity: O(N + M) where N is text length, M is pattern length
 * Space Complexity: O(M) for Longest Prefix Suffix (LPS) table
 * 
 * Avoids redundant comparisons by shifting the pattern using precomputed LPS values.
 */
public class KMP {

    /**
     * Precomputes the Longest Proper Prefix which is also a Suffix (LPS) array.
     * Time Complexity: O(M)
     */
    public static int[] computeLPS(String pattern) {
        if (pattern == null || pattern.isEmpty()) return new int[0];

        int m = pattern.length();
        int[] lps = new int[m];
        int len = 0;
        int i = 1;

        while (i < m) {
            if (Character.toLowerCase(pattern.charAt(i)) == Character.toLowerCase(pattern.charAt(len))) {
                len++;
                lps[i] = len;
                i++;
            } else {
                if (len != 0) {
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
     * Search all occurrences of pattern in text using KMP.
     * Returns 0-based start indices of all occurrences.
     * Time Complexity: O(N + M)
     */
    public static List<Integer> search(String text, String pattern) {
        List<Integer> indices = new ArrayList<>();
        if (text == null || pattern == null || pattern.isEmpty() || text.isEmpty()) {
            return indices;
        }

        int n = text.length();
        int m = pattern.length();
        int[] lps = computeLPS(pattern);

        int i = 0; // index for text
        int j = 0; // index for pattern

        while (i < n) {
            if (Character.toLowerCase(text.charAt(i)) == Character.toLowerCase(pattern.charAt(j))) {
                i++;
                j++;
            }

            if (j == m) {
                indices.add(i - j);
                j = lps[j - 1];
            } else if (i < n && Character.toLowerCase(text.charAt(i)) != Character.toLowerCase(pattern.charAt(j))) {
                if (j != 0) {
                    j = lps[j - 1];
                } else {
                    i++;
                }
            }
        }

        return indices;
    }

    /**
     * Returns true if text contains pattern.
     */
    public static boolean contains(String text, String pattern) {
        return !search(text, pattern).isEmpty();
    }
}
