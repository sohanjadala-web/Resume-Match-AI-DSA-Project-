package com.resumematch.algorithms;

import java.util.*;

/**
 * Hungarian Algorithm (Kuhn-Munkres) for Optimal Candidate-to-Role Assignment
 * 
 * Solves Maximum Weight Bipartite Matching by converting compatibility scores
 * into a min-cost assignment problem on a bipartite graph.
 * 
 * Time Complexity: O(V^3) where V = max(Roles, Candidates)
 * Space Complexity: O(V^2) for cost matrix & auxiliary dual potentials
 */
public class HungarianAlgorithm {

    public static class AssignmentEdge {
        public final String roleId;
        public final String roleTitle;
        public final String candidateId;
        public final String candidateName;
        public final double compatibilityScore;
        public final List<String> supportingSkills;

        public AssignmentEdge(String roleId, String roleTitle, String candidateId, String candidateName,
                              double compatibilityScore, List<String> supportingSkills) {
            this.roleId = roleId;
            this.roleTitle = roleTitle;
            this.candidateId = candidateId;
            this.candidateName = candidateName;
            this.compatibilityScore = compatibilityScore;
            this.supportingSkills = (supportingSkills != null) ? supportingSkills : new ArrayList<>();
        }
    }

    public static class UnassignedItem {
        public final String id;
        public final String nameOrTitle;

        public UnassignedItem(String id, String nameOrTitle) {
            this.id = id;
            this.nameOrTitle = nameOrTitle;
        }
    }

    public static class Result {
        public final String algorithm = "HUNGARIAN_MAX_WEIGHT_BIPARTITE";
        public final List<AssignmentEdge> assignments;
        public final List<UnassignedItem> unassignedCandidates;
        public final List<UnassignedItem> unfilledRoles;
        public final double totalScore;
        public final double averageScore;
        public final double baselineGreedyScore;
        public final double scoreImprovement;
        public final double executionTimeMs;

        public Result(List<AssignmentEdge> assignments, List<UnassignedItem> unassignedCandidates,
                      List<UnassignedItem> unfilledRoles, double totalScore, double averageScore,
                      double baselineGreedyScore, double scoreImprovement, double executionTimeMs) {
            this.assignments = assignments;
            this.unassignedCandidates = unassignedCandidates;
            this.unfilledRoles = unfilledRoles;
            this.totalScore = Math.round(totalScore * 10.0) / 10.0;
            this.averageScore = Math.round(averageScore * 10.0) / 10.0;
            this.baselineGreedyScore = Math.round(baselineGreedyScore * 10.0) / 10.0;
            this.scoreImprovement = Math.round(scoreImprovement * 10.0) / 10.0;
            this.executionTimeMs = Math.round(executionTimeMs * 1000.0) / 1000.0;
        }
    }

    /**
     * Solves minimum-cost assignment on an N x N cost matrix using the Kuhn-Munkres algorithm.
     * Returns matching array where assignment[row] = col.
     * Time Complexity: O(N^3)
     */
    public static int[] solveMinCost(double[][] costMatrix) {
        int n = costMatrix.length;
        if (n == 0) return new int[0];

        double[] u = new double[n + 1];
        double[] v = new double[n + 1];
        int[] p = new int[n + 1];
        int[] way = new int[n + 1];

        for (int i = 1; i <= n; i++) {
            p[0] = i;
            int j0 = 0;
            double[] minv = new double[n + 1];
            Arrays.fill(minv, Double.POSITIVE_INFINITY);
            boolean[] used = new boolean[n + 1];

            do {
                used[j0] = true;
                int i0 = p[j0];
                double delta = Double.POSITIVE_INFINITY;
                int j1 = 0;

                for (int j = 1; j <= n; j++) {
                    if (!used[j]) {
                        double cur = costMatrix[i0 - 1][j - 1] - u[i0] - v[j];
                        if (cur < minv[j]) {
                            minv[j] = cur;
                            way[j] = j0;
                        }
                        if (minv[j] < delta) {
                            delta = minv[j];
                            j1 = j;
                        }
                    }
                }

                for (int j = 0; j <= n; j++) {
                    if (used[j]) {
                        u[p[j]] += delta;
                        v[j] -= delta;
                    } else {
                        minv[j] -= delta;
                    }
                }
                j0 = j1;
            } while (p[j0] != 0);

            do {
                int j1 = way[j0];
                p[j0] = p[j1];
                j0 = j1;
            } while (j0 != 0);
        }

        int[] assignment = new int[n];
        Arrays.fill(assignment, -1);
        for (int j = 1; j <= n; j++) {
            if (p[j] > 0) {
                assignment[p[j] - 1] = j - 1;
            }
        }
        return assignment;
    }

    /**
     * Interface for scoring candidate against role.
     */
    @FunctionalInterface
    public interface CompatibilityEvaluator<R, C> {
        double evaluate(R role, C candidate, List<String> outSupportingSkills);
    }

    /**
     * Optimizes candidate-to-role assignment to maximize global compatibility score.
     */
    public static <R, C> Result optimize(
            List<R> roles,
            List<C> candidates,
            java.util.function.Function<R, String> roleIdFn,
            java.util.function.Function<R, String> roleTitleFn,
            java.util.function.Function<C, String> candidateIdFn,
            java.util.function.Function<C, String> candidateNameFn,
            CompatibilityEvaluator<R, C> evaluator
    ) {
        long startTimeNano = System.nanoTime();

        int numRoles = roles.size();
        int numCandidates = candidates.size();

        if (numRoles == 0 || numCandidates == 0) {
            List<UnassignedItem> unCandidates = new ArrayList<>();
            for (C c : candidates) unCandidates.add(new UnassignedItem(candidateIdFn.apply(c), candidateNameFn.apply(c)));
            List<UnassignedItem> unRoles = new ArrayList<>();
            for (R r : roles) unRoles.add(new UnassignedItem(roleIdFn.apply(r), roleTitleFn.apply(r)));

            return new Result(Collections.emptyList(), unCandidates, unRoles, 0, 0, 0, 0, 0);
        }

        int n = Math.max(numRoles, numCandidates);

        double[][] rawScores = new double[n][n];
        @SuppressWarnings("unchecked")
        List<String>[][] supportingSkillsGrid = new List[n][n];

        double maxScoreFound = 100.0;
        for (int i = 0; i < numRoles; i++) {
            for (int j = 0; j < numCandidates; j++) {
                List<String> supp = new ArrayList<>();
                double s = evaluator.evaluate(roles.get(i), candidates.get(j), supp);
                rawScores[i][j] = s;
                supportingSkillsGrid[i][j] = supp;
                if (s > maxScoreFound) maxScoreFound = s;
            }
        }

        // Calculate Greedy Baseline score for comparison
        double baselineGreedyScore = 0.0;
        Set<Integer> greedyChosen = new HashSet<>();
        for (int i = 0; i < numRoles; i++) {
            int bestCand = -1;
            double bestS = -1.0;
            for (int j = 0; j < numCandidates; j++) {
                if (!greedyChosen.contains(j) && rawScores[i][j] > bestS) {
                    bestS = rawScores[i][j];
                    bestCand = j;
                }
            }
            if (bestCand != -1) {
                greedyChosen.add(bestCand);
                baselineGreedyScore += bestS;
            }
        }

        // Transform into Min-Cost Matrix for Hungarian: cost = maxScore - score
        double[][] costMatrix = new double[n][n];
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                if (i < numRoles && j < numCandidates) {
                    costMatrix[i][j] = maxScoreFound - rawScores[i][j];
                } else {
                    costMatrix[i][j] = maxScoreFound; // Dummy edge penalty
                }
            }
        }

        // Solve using Kuhn-Munkres
        int[] match = solveMinCost(costMatrix);

        List<AssignmentEdge> assignments = new ArrayList<>();
        Set<String> assignedCandIds = new HashSet<>();
        Set<String> assignedRoleIds = new HashSet<>();
        double totalScore = 0.0;

        for (int i = 0; i < numRoles; i++) {
            int j = match[i];
            if (j >= 0 && j < numCandidates) {
                double score = rawScores[i][j];
                R role = roles.get(i);
                C cand = candidates.get(j);

                String rId = roleIdFn.apply(role);
                String rTitle = roleTitleFn.apply(role);
                String cId = candidateIdFn.apply(cand);
                String cName = candidateNameFn.apply(cand);

                assignments.add(new AssignmentEdge(
                    rId, rTitle, cId, cName, score, supportingSkillsGrid[i][j]
                ));
                totalScore += score;
                assignedRoleIds.add(rId);
                assignedCandIds.add(cId);
            }
        }

        List<UnassignedItem> unassignedCandidates = new ArrayList<>();
        for (C c : candidates) {
            String cid = candidateIdFn.apply(c);
            if (!assignedCandIds.contains(cid)) {
                unassignedCandidates.add(new UnassignedItem(cid, candidateNameFn.apply(c)));
            }
        }

        List<UnassignedItem> unfilledRoles = new ArrayList<>();
        for (R r : roles) {
            String rid = roleIdFn.apply(r);
            if (!assignedRoleIds.contains(rid)) {
                unfilledRoles.add(new UnassignedItem(rid, roleTitleFn.apply(r)));
            }
        }

        long endNano = System.nanoTime();
        double executionTimeMs = (endNano - startTimeNano) / 1_000_000.0;
        double averageScore = assignments.isEmpty() ? 0.0 : totalScore / assignments.size();
        double improvement = totalScore - baselineGreedyScore;

        return new Result(
            assignments, unassignedCandidates, unfilledRoles,
            totalScore, averageScore, baselineGreedyScore, improvement, executionTimeMs
        );
    }
}
