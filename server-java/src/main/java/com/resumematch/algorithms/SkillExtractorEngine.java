package com.resumematch.algorithms;

import java.util.*;
import java.util.regex.Pattern;

/**
 * Hybrid DSA Résumé & Document Skill Extraction Engine
 * 
 * Pipeline:
 *  1. Aho-Corasick Multi-Pattern Search for O(N + Z) dictionary scanning.
 *  2. Word Boundary Validation to avoid substring false positives.
 *  3. Fast Hash Table Lookup for common aliases (e.g., "JS", "K8s", "Go", "C#", "AWS").
 *  4. Dynamic Programming Levenshtein Distance for fuzzy typo correction (e.g., "Pyhton" -> "Python").
 */
public class SkillExtractorEngine {

    public static class SkillDefinition {
        public final String id;
        public final String name;
        public final String category;
        public final List<String> aliases;

        public SkillDefinition(String id, String name, String category, List<String> aliases) {
            this.id = id;
            this.name = name;
            this.category = category;
            this.aliases = (aliases != null) ? aliases : new ArrayList<>();
        }
    }

    public static class ExtractedSkill {
        public final String skillId;
        public final String canonicalName;
        public final String category;
        public final String matchedVia; // EXACT_AHO_CORASICK, ALIAS_MAPPING, FUZZY_LEVENSHTEIN
        public final double confidence;

        public ExtractedSkill(String skillId, String canonicalName, String category, String matchedVia, double confidence) {
            this.skillId = skillId;
            this.canonicalName = canonicalName;
            this.category = category;
            this.matchedVia = matchedVia;
            this.confidence = Math.round(confidence * 100.0) / 100.0;
        }

        @Override
        public String toString() {
            return String.format("%s (%s) [via %s, conf=%.2f]", canonicalName, category, matchedVia, confidence);
        }
    }

    private final AhoCorasick ahoCorasick;
    private final Map<String, SkillDefinition> skillsMap = new HashMap<>();
    private final Map<String, SkillDefinition> canonicalNameMap = new HashMap<>();
    private final Map<String, String> aliasMap = new HashMap<>(); // lowercase alias -> skillId
    private final List<String> allKnownNames = new ArrayList<>();

    public SkillExtractorEngine(List<SkillDefinition> skills) {
        this.ahoCorasick = new AhoCorasick();
        if (skills != null) {
            for (SkillDefinition skill : skills) {
                this.skillsMap.put(skill.id, skill);
                String lowerName = skill.name.toLowerCase();
                this.canonicalNameMap.put(lowerName, skill);
                this.allKnownNames.add(lowerName);

                this.ahoCorasick.addPattern(skill.name, skill.id);

                for (String alias : skill.aliases) {
                    String lowerAlias = alias.trim().toLowerCase();
                    this.aliasMap.put(lowerAlias, skill.id);
                    this.allKnownNames.add(lowerAlias);
                    this.ahoCorasick.addPattern(alias, skill.id);
                }
            }
        }
        this.ahoCorasick.buildFailureLinks();
    }

    /**
     * Tokenize text while preserving technical punctuation like C++, C#, .NET, Node.js
     */
    public List<String> tokenize(String text) {
        if (text == null) return Collections.emptyList();
        String cleaned = text.replaceAll("[^a-zA-Z0-9+#.-]", " ");
        String[] parts = cleaned.split("\\s+");
        List<String> tokens = new ArrayList<>();
        for (String p : parts) {
            if (p.trim().length() > 1) {
                tokens.add(p.trim());
            }
        }
        return tokens;
    }

    /**
     * Extracts skills from raw résumé or text.
     */
    public List<ExtractedSkill> extractSkills(String rawText) {
        Map<String, ExtractedSkill> results = new HashMap<>();
        if (rawText == null || rawText.isEmpty()) {
            return new ArrayList<>();
        }

        String textLower = " " + rawText.toLowerCase() + " ";

        // 1. Aho-Corasick multi-pattern search
        List<AhoCorasick.MatchResult> matches = ahoCorasick.search(rawText);
        for (AhoCorasick.MatchResult m : matches) {
            SkillDefinition skill = skillsMap.get(m.canonicalId);
            if (skill == null) continue;

            String name = skill.name.toLowerCase();
            int pos = m.position - name.length() + 1;
            if (pos >= 0) {
                char before = (pos > 0) ? textLower.charAt(pos - 1) : ' ';
                char after = (pos + name.length() < textLower.length()) ? textLower.charAt(pos + name.length()) : ' ';
                boolean isBoundary = isBoundaryChar(before) && isBoundaryChar(after);

                if (isBoundary || name.length() > 3) {
                    results.put(skill.id, new ExtractedSkill(
                        skill.id, skill.name, skill.category, "EXACT_AHO_CORASICK", 1.0
                    ));
                }
            }
        }

        // 2. Token-level analysis for short/special keywords and aliases (e.g., C++, AWS, Go, K8s)
        List<String> tokens = tokenize(rawText);
        for (String token : tokens) {
            String lower = token.toLowerCase();

            // Direct Alias Map Lookup
            if (aliasMap.containsKey(lower)) {
                String skillId = aliasMap.get(lower);
                SkillDefinition skill = skillsMap.get(skillId);
                if (skill != null && !results.containsKey(skillId)) {
                    results.put(skillId, new ExtractedSkill(
                        skill.id, skill.name, skill.category, "ALIAS_MAPPING", 0.98
                    ));
                }
            }

            // 3. Fuzzy Levenshtein match for typo resolution on longer tokens (>= 4 characters)
            if (token.length() >= 4) {
                EditDistance.ClosestMatch closest = EditDistance.findClosestMatch(lower, allKnownNames, 0.82);
                if (closest != null && closest.similarity < 1.0) {
                    String matchedTarget = closest.match;
                    String matchedSkillId = aliasMap.get(matchedTarget);
                    if (matchedSkillId == null && canonicalNameMap.containsKey(matchedTarget)) {
                        matchedSkillId = canonicalNameMap.get(matchedTarget).id;
                    }

                    if (matchedSkillId != null && !results.containsKey(matchedSkillId)) {
                        SkillDefinition skill = skillsMap.get(matchedSkillId);
                        if (skill != null) {
                            results.put(matchedSkillId, new ExtractedSkill(
                                skill.id, skill.name, skill.category, "FUZZY_LEVENSHTEIN", closest.similarity
                            ));
                        }
                    }
                }
            }
        }

        return new ArrayList<>(results.values());
    }

    private static boolean isBoundaryChar(char c) {
        return Character.isWhitespace(c) || c == ',' || c == '.' || c == ';' || c == ':' ||
               c == '(' || c == ')' || c == '[' || c == ']' || c == '{' || c == '}' || c == '/';
    }
}
