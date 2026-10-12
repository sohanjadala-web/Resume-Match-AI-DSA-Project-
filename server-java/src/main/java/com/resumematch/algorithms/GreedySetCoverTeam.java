package com.resumematch.algorithms;

import java.util.*;

/**
 * Greedy Set Cover Approximation Algorithm for Project Team Formation
 * 
 * Problem: Given a universe of required project skills U, and a candidate pool C,
 * select a minimum subset of candidates (size <= maxTeamSize) that maximizes coverage of U.
 * 
 * Theoretical Approximation Ratio: H(|U|) = ln(|U|) + 1, which is the best-possible
 * polynomial-time guarantee unless P = NP (Feige, 1998).
 * 
 * Time Complexity: O(K * |C| * |U|) where K = max team size
 * Space Complexity: O(|U| + |C|)
 */
public class GreedySetCoverTeam {

    public static class CandidateInput {
        public final String id;
        public final String name;
        public final String headline;
        public final int experienceYears;
        public final List<String> skills;

        public CandidateInput(String id, String name, String headline, int experienceYears, List<String> skills) {
            this.id = id;
            this.name = name;
            this.headline = headline;
            this.experienceYears = experienceYears;
            this.skills = (skills != null) ? skills : new ArrayList<>();
        }
    }

    public static class TeamMemberRecommendation {
        public final String candidateId;
        public final String candidateName;
        public final String headline;
        public final List<String> skillsContributed;
        public final List<String> totalSkillsOwned;
        public final int selectionStep;
        public final int marginalCoverageCount;

        public TeamMemberRecommendation(String candidateId, String candidateName, String headline,
                                        List<String> skillsContributed, List<String> totalSkillsOwned,
                                        int selectionStep, int marginalCoverageCount) {
            this.candidateId = candidateId;
            this.candidateName = candidateName;
            this.headline = headline;
            this.skillsContributed = skillsContributed;
            this.totalSkillsOwned = totalSkillsOwned;
            this.selectionStep = selectionStep;
            this.marginalCoverageCount = marginalCoverageCount;
        }
    }

    public static class TeamFormationResult {
        public final String algorithm = "GREEDY_SET_COVER_APPROXIMATION";
        public final List<TeamMemberRecommendation> teamMembers;
        public final int totalSkillsRequired;
        public final int totalSkillsCovered;
        public final List<String> skillsCovered;
        public final List<String> skillsMissing;
        public final double coveragePercentage;
        public final int targetTeamSize;
        public final int actualTeamSize;
        public final String approximationGuarantee;
        public final double executionTimeMs;

        public TeamFormationResult(List<TeamMemberRecommendation> teamMembers, int totalSkillsRequired,
                                   int totalSkillsCovered, List<String> skillsCovered, List<String> skillsMissing,
                                   double coveragePercentage, int targetTeamSize, int actualTeamSize,
                                   String approximationGuarantee, double executionTimeMs) {
            this.teamMembers = teamMembers;
            this.totalSkillsRequired = totalSkillsRequired;
            this.totalSkillsCovered = totalSkillsCovered;
            this.skillsCovered = skillsCovered;
            this.skillsMissing = skillsMissing;
            this.coveragePercentage = Math.round(coveragePercentage * 10.0) / 10.0;
            this.targetTeamSize = targetTeamSize;
            this.actualTeamSize = actualTeamSize;
            this.approximationGuarantee = approximationGuarantee;
            this.executionTimeMs = Math.round(executionTimeMs * 1000.0) / 1000.0;
        }
    }

    /**
     * Forms an optimal project team using the Greedy Set Cover heuristic.
     */
    public static TeamFormationResult formTeam(List<String> requiredSkills, List<CandidateInput> candidatePool, int maxTeamSize) {
        long startNano = System.nanoTime();

        Set<String> uncovered = new HashSet<>();
        Map<String, String> originalSkillCaseMap = new HashMap<>();
        if (requiredSkills != null) {
            for (String s : requiredSkills) {
                if (s != null && !s.trim().isEmpty()) {
                    String lower = s.trim().toLowerCase();
                    uncovered.add(lower);
                    originalSkillCaseMap.put(lower, s.trim());
                }
            }
        }

        List<TeamMemberRecommendation> selectedMembers = new ArrayList<>();
        Set<String> chosenCandIds = new HashSet<>();
        Set<String> allCovered = new HashSet<>();

        int step = 1;

        while (!uncovered.isEmpty() && selectedMembers.size() < maxTeamSize) {
            CandidateInput bestCand = null;
            int maxNewCovered = 0;
            List<String> bestContributed = new ArrayList<>();

            for (CandidateInput cand : candidatePool) {
                if (chosenCandIds.contains(cand.id)) continue;

                // Calculate marginal gain: count how many currently uncovered skills this candidate offers
                List<String> contributed = new ArrayList<>();
                for (String sk : cand.skills) {
                    if (sk == null) continue;
                    String lower = sk.trim().toLowerCase();
                    if (uncovered.contains(lower)) {
                        contributed.add(originalSkillCaseMap.getOrDefault(lower, sk.trim()));
                    }
                }

                if (contributed.size() > maxNewCovered) {
                    maxNewCovered = contributed.size();
                    bestCand = cand;
                    bestContributed = contributed;
                } else if (contributed.size() == maxNewCovered && maxNewCovered > 0 && bestCand != null) {
                    // Tie-break: prefer candidate with more years of experience
                    if (cand.experienceYears > bestCand.experienceYears) {
                        bestCand = cand;
                        bestContributed = contributed;
                    }
                }
            }

            // Stop if no candidate can contribute any new skills
            if (bestCand == null || maxNewCovered == 0) {
                break;
            }

            chosenCandIds.add(bestCand.id);
            for (String s : bestContributed) {
                uncovered.remove(s.toLowerCase());
                allCovered.add(s);
            }

            selectedMembers.add(new TeamMemberRecommendation(
                bestCand.id,
                bestCand.name,
                bestCand.headline,
                bestContributed,
                bestCand.skills,
                step++,
                maxNewCovered
            ));
        }

        List<String> missing = new ArrayList<>();
        if (requiredSkills != null) {
            for (String s : requiredSkills) {
                if (s != null && !allCovered.contains(s.trim())) {
                    missing.add(s.trim());
                }
            }
        }

        int totalReq = (requiredSkills != null) ? requiredSkills.size() : 0;
        int coveredCount = allCovered.size();
        double coveragePct = (totalReq > 0) ? ((double) coveredCount / totalReq) * 100.0 : 100.0;

        long endNano = System.nanoTime();
        double execTimeMs = (endNano - startNano) / 1_000_000.0;

        double approxBound = Math.log(Math.max(1, totalReq)) + 1.0;
        String approxGuarantee = String.format(
            "Harmonic approximation factor H(|U|) = ln(%d) + 1 ≈ %.2f. Guarantees near-optimal team for NP-hard Set Cover.",
            totalReq, approxBound
        );

        return new TeamFormationResult(
            selectedMembers, totalReq, coveredCount,
            new ArrayList<>(allCovered), missing, coveragePct,
            maxTeamSize, selectedMembers.size(), approxGuarantee, execTimeMs
        );
    }
}
