package com.resumematch.algorithms;

import java.util.*;

/**
 * Aho-Corasick Multi-Pattern String Matching Automaton
 * 
 * Time Complexity:
 *   - Trie & Failure Link Construction: O(Σ |P_i|) where P_i are the skill patterns
 *   - Search: O(N + Z) where N is text length, Z is count of matches
 * Space Complexity: O(Σ |P_i| * |Alphabet|)
 * 
 * Used for rapid multi-keyword scanning over résumé text to identify canonical
 * skills and map technology aliases (e.g., "JS" -> "JavaScript", "ReactJS" -> "React").
 */
public class AhoCorasick {

    public static class TrieNode {
        public final Map<Character, TrieNode> children = new HashMap<>();
        public TrieNode fail = null;
        public final List<String> output = new ArrayList<>();
        public boolean isEndOfWord = false;
    }

    public static class MatchResult {
        public final String canonicalId;
        public final int position;

        public MatchResult(String canonicalId, int position) {
            this.canonicalId = canonicalId;
            this.position = position;
        }

        @Override
        public String toString() {
            return String.format("Match[Skill='%s', EndPos=%d]", canonicalId, position);
        }
    }

    private final TrieNode root;

    public AhoCorasick() {
        this.root = new TrieNode();
    }

    public TrieNode getRoot() {
        return root;
    }

    /**
     * Add a pattern (e.g. skill alias or canonical name) mapped to a canonical skill ID.
     */
    public void addPattern(String pattern, String canonicalId) {
        if (pattern == null) return;
        String normalized = pattern.trim().toLowerCase();
        if (normalized.isEmpty()) return;

        TrieNode current = this.root;
        for (char ch : normalized.toCharArray()) {
            current = current.children.computeIfAbsent(ch, k -> new TrieNode());
        }
        current.isEndOfWord = true;
        if (!current.output.contains(canonicalId)) {
            current.output.add(canonicalId);
        }
    }

    /**
     * Build failure links using Breadth-First Search (BFS).
     * Time Complexity: O(Σ |P_i|)
     */
    public void buildFailureLinks() {
        Queue<TrieNode> queue = new ArrayDeque<>();

        // Root children fail links point to root
        for (TrieNode child : root.children.values()) {
            child.fail = root;
            queue.add(child);
        }

        while (!queue.isEmpty()) {
            TrieNode current = queue.poll();

            for (Map.Entry<Character, TrieNode> entry : current.children.entrySet()) {
                char ch = entry.getKey();
                TrieNode child = entry.getValue();

                TrieNode failCandidate = current.fail;
                while (failCandidate != null && !failCandidate.children.containsKey(ch)) {
                    failCandidate = failCandidate.fail;
                }

                child.fail = (failCandidate != null) ? failCandidate.children.get(ch) : root;

                // Merge dictionary output links from failure state
                if (child.fail != null && !child.fail.output.isEmpty()) {
                    for (String out : child.fail.output) {
                        if (!child.output.contains(out)) {
                            child.output.add(out);
                        }
                    }
                }

                queue.add(child);
            }
        }
    }

    /**
     * Search input text and return list of matched canonical skill IDs with end positions.
     * Time Complexity: O(N + Z)
     */
    public List<MatchResult> search(String text) {
        List<MatchResult> matches = new ArrayList<>();
        if (text == null || text.isEmpty()) return matches;

        String normalized = text.toLowerCase();
        TrieNode current = root;

        for (int i = 0; i < normalized.length(); i++) {
            char ch = normalized.charAt(i);

            while (current != root && !current.children.containsKey(ch)) {
                current = (current.fail != null) ? current.fail : root;
            }

            if (current.children.containsKey(ch)) {
                current = current.children.get(ch);
            } else {
                current = root;
            }

            if (!current.output.isEmpty()) {
                for (String id : current.output) {
                    matches.add(new MatchResult(id, i));
                }
            }
        }

        return matches;
    }
}
