package com.resumematch.cli;

import com.resumematch.algorithms.*;
import com.resumematch.data.MockDatabase;

import java.util.*;

/**
 * Interactive Java Console CLI Application for ResumeMatch AI
 * 
 * Specifically designed for academic evaluation, college viva, and technical demonstrations.
 * Provides interactive inputs, dynamic programming matrix visualization,
 * Big-O complexity analyses, and microsecond hardware telemetry.
 */
public class DSACliApplication {

    private static final Scanner scanner = new Scanner(System.in);
    private static final SkillExtractorEngine skillEngine = new SkillExtractorEngine(MockDatabase.SKILLS);

    public static void main(String[] args) {
        printBanner();

        boolean running = true;
        while (running) {
            printMenu();
            System.out.print("\n👉 Select an option (1-8): ");
            if (!scanner.hasNextLine()) break;
            String choice = scanner.nextLine().trim();

            switch (choice) {
                case "1":
                    runAhoCorasickDemo();
                    break;
                case "2":
                    runLevenshteinDemo();
                    break;
                case "3":
                    runKmpDemo();
                    break;
                case "4":
                    runHungarianDemo();
                    break;
                case "5":
                    runGreedySetCoverDemo();
                    break;
                case "6":
                    runCompatibilityScorerDemo();
                    break;
                case "7":
                    runBenchmarkSuite();
                    break;
                case "8":
                    System.out.println("\n👋 Thank you for using ResumeMatch AI DSA Engine! Exiting...");
                    running = false;
                    break;
                default:
                    System.out.println("❌ Invalid option. Please enter a number between 1 and 8.");
            }

            if (running) {
                System.out.println("\nPress [ENTER] to return to the main menu...");
                if (!scanner.hasNextLine()) break;
                scanner.nextLine();
            }
        }
    }

    private static void printBanner() {
        System.out.println("================================================================================");
        System.out.println("   🚀 RESUMEMATCH AI — DSA RECRUITMENT & TALENT ENGINE (JAVA 25 EDITION)       ");
        System.out.println("   Verified Data Structures & Algorithms Implementation for Academic Evaluation ");
        System.out.println("================================================================================");
    }

    private static void printMenu() {
        System.out.println("\n----------------------------- ALGORITHM WORKBENCH -----------------------------");
        System.out.println(" [1] Aho-Corasick Multi-Pattern Search & Résumé Skill Extraction");
        System.out.println(" [2] Levenshtein Distance (DP) & Fuzzy Typo Resolution");
        System.out.println(" [3] Knuth-Morris-Pratt (KMP) Exact Pattern Search & LPS Table");
        System.out.println(" [4] Hungarian Algorithm (Kuhn-Munkres) Optimal Talent Allocation");
        System.out.println(" [5] Greedy Set Cover Approximation for Project Team Formation");
        System.out.println(" [6] Multi-Factor Compatibility Scorer & Deterministic Candidate Ranking");
        System.out.println(" [7] Run Full Algorithm Benchmark Suite & Big-O Telemetry");
        System.out.println(" [8] Exit");
        System.out.println("--------------------------------------------------------------------------------");
    }

    // 1. Aho-Corasick Demo
    private static void runAhoCorasickDemo() {
        System.out.println("\n--- [1] AHO-CORASICK MULTI-PATTERN SEARCH ---");
        System.out.println("Theoretical Complexity: Construction O(Σ|P|), Search O(N + Z)");
        System.out.println("Scans résumé text simultaneously for all 19 canonical tech skills & aliases in a single pass.\n");

        System.out.println("Default sample text:");
        String defaultText = "Senior Full-Stack Engineer with 5 years experience in React, TypeScript, and Node.js. " +
                             "Deployed distributed microservices on AWS with Docker and Kubernetes. " +
                             "Familiar with Pyhton scripting and PostgreSQL database clustering.";
        System.out.println("\"" + defaultText + "\"\n");

        System.out.print("Enter custom text (or press ENTER to use sample above): ");
        String input = scanner.nextLine().trim();
        if (input.isEmpty()) input = defaultText;

        long start = System.nanoTime();
        List<SkillExtractorEngine.ExtractedSkill> extracted = skillEngine.extractSkills(input);
        long end = System.nanoTime();
        double ms = (end - start) / 1_000_000.0;

        DSAMetricsTracker.recordMetric("Aho-Corasick", ms, input.length(), extracted.size(), "CLI Skill Extraction");

        System.out.println("\n✓ Extraction Results (" + extracted.size() + " skills identified in " + String.format("%.3f", ms) + " ms):");
        System.out.printf("%-18s | %-12s | %-20s | %-10s\n", "Skill", "Category", "Detection Method", "Confidence");
        System.out.println("----------------------------------------------------------------------");
        for (SkillExtractorEngine.ExtractedSkill s : extracted) {
            System.out.printf("%-18s | %-12s | %-20s | %.2f%%\n",
                s.canonicalName, s.category, s.matchedVia, s.confidence * 100);
        }
    }

    // 2. Levenshtein Demo
    private static void runLevenshteinDemo() {
        System.out.println("\n--- [2] LEVENSHTEIN EDIT DISTANCE (DYNAMIC PROGRAMMING) ---");
        System.out.println("Theoretical Complexity: Time O(N * M), Space O(N * M)");
        System.out.println("Resolves misspelled technical keywords via edit distance matrix.\n");

        System.out.print("Enter first string (e.g. 'Pyhton'): ");
        String s1 = scanner.nextLine().trim();
        if (s1.isEmpty()) s1 = "Pyhton";

        System.out.print("Enter second string (e.g. 'Python'): ");
        String s2 = scanner.nextLine().trim();
        if (s2.isEmpty()) s2 = "Python";

        long start = System.nanoTime();
        int dist = EditDistance.calculate(s1, s2);
        double sim = EditDistance.similarity(s1, s2);
        int[][] dp = EditDistance.getDPTable(s1, s2);
        long end = System.nanoTime();
        double ms = (end - start) / 1_000_000.0;

        DSAMetricsTracker.recordMetric("Levenshtein", ms, s1.length() + s2.length(), dist, "CLI Edit Distance");

        System.out.printf("\n✓ Levenshtein Distance between '%s' and '%s': %d operations\n", s1, s2, dist);
        System.out.printf("✓ Normalized Similarity Ratio: %.2f%% (Computed in %.3f ms)\n\n", sim * 100, ms);

        System.out.println("Dynamic Programming State Matrix [dp[i][j]]:");
        System.out.print("      ε");
        for (int j = 0; j < s2.length(); j++) {
            System.out.printf("%3c", s2.charAt(j));
        }
        System.out.println();

        for (int i = 0; i <= s1.length(); i++) {
            char rowChar = (i == 0) ? 'ε' : s1.charAt(i - 1);
            System.out.printf("%3c |", rowChar);
            for (int j = 0; j <= s2.length(); j++) {
                System.out.printf("%3d", dp[i][j]);
            }
            System.out.println();
        }
    }

    // 3. KMP Demo
    private static void runKmpDemo() {
        System.out.println("\n--- [3] KNUTH-MORRIS-PRATT (KMP) STRING SEARCH ---");
        System.out.println("Theoretical Complexity: Time O(N + M), Space O(M)");
        System.out.println("Linear-time exact pattern matching with Longest Prefix Suffix (LPS) table.\n");

        System.out.print("Enter text (or ENTER for sample): ");
        String text = scanner.nextLine().trim();
        if (text.isEmpty()) {
            text = "Java developers with Spring Boot, Java 21, and Java cloud native certifications.";
        }

        System.out.print("Enter search pattern (e.g. 'Java'): ");
        String pattern = scanner.nextLine().trim();
        if (pattern.isEmpty()) pattern = "Java";

        long start = System.nanoTime();
        int[] lps = KMP.computeLPS(pattern);
        List<Integer> occurrences = KMP.search(text, pattern);
        long end = System.nanoTime();
        double ms = (end - start) / 1_000_000.0;

        DSAMetricsTracker.recordMetric("KMP", ms, text.length() + pattern.length(), occurrences.size(), "CLI KMP");

        System.out.print("\nPrecomputed LPS Array for pattern '" + pattern + "': [");
        for (int i = 0; i < lps.length; i++) {
            System.out.print(lps[i] + (i < lps.length - 1 ? ", " : ""));
        }
        System.out.println("]");

        System.out.printf("Occurrences found: %d at 0-based indices %s (Execution Time: %.3f ms)\n",
            occurrences.size(), occurrences.toString(), ms);
    }

    // 4. Hungarian Algorithm Demo
    private static void runHungarianDemo() {
        System.out.println("\n--- [4] HUNGARIAN ALGORITHM (KUHN-MUNKRES) TALENT ALLOCATION ---");
        System.out.println("Theoretical Complexity: Time O(V^3), Space O(V^2)");
        System.out.println("Solves Maximum Weight Bipartite Matching to globally optimize candidate-to-role assignment.\n");

        HungarianAlgorithm.Result result = HungarianAlgorithm.optimize(
            MockDatabase.JOBS,
            MockDatabase.CANDIDATES,
            j -> j.jobId,
            j -> j.title,
            c -> c.candidateId,
            c -> c.name,
            (job, cand, supp) -> {
                CompatibilityScorer.CompatibilityResult cr = CompatibilityScorer.calculate(cand, job, null);
                supp.addAll(cr.matchingRequiredSkills);
                return cr.totalScore;
            }
        );

        DSAMetricsTracker.recordMetric("HungarianMatching", result.executionTimeMs, MockDatabase.JOBS.size() * MockDatabase.CANDIDATES.size(),
            result.assignments.size(), "CLI Talent Allocation");

        System.out.println("✓ Optimal Assignments Generated in " + result.executionTimeMs + " ms:");
        System.out.printf("%-28s <---> %-18s | %-12s | %s\n", "Role", "Candidate", "Score", "Matched Skills");
        System.out.println("---------------------------------------------------------------------------------------------");
        for (HungarianAlgorithm.AssignmentEdge edge : result.assignments) {
            System.out.printf("%-28s <---> %-18s | %5.1f / 100  | %s\n",
                edge.roleTitle, edge.candidateName, edge.compatibilityScore, String.join(", ", edge.supportingSkills));
        }

        System.out.println("\nGlobal Performance Optimization Analysis:");
        System.out.printf(" - Hungarian Total Global Score : %.1f\n", result.totalScore);
        System.out.printf(" - Baseline Greedy Score        : %.1f\n", result.baselineGreedyScore);
        System.out.printf(" - Hungarian Score Improvement  : +%.1f (%.1f%% superior to greedy local choice)\n",
            result.scoreImprovement, (result.baselineGreedyScore > 0 ? (result.scoreImprovement / result.baselineGreedyScore) * 100.0 : 0));
        System.out.printf(" - Average Match Quality        : %.1f / 100\n", result.averageScore);
    }

    // 5. Greedy Set Cover Demo
    private static void runGreedySetCoverDemo() {
        System.out.println("\n--- [5] GREEDY SET COVER APPROXIMATION FOR TEAM FORMATION ---");
        System.out.println("Theoretical Complexity: Time O(K * |C| * |U|), Space O(|U| + |C|)");
        System.out.println("Approximation Factor: H(|U|) = ln(|U|) + 1 (best polynomial-time guarantee for NP-hard Set Cover)\n");

        List<String> requiredSkills = Arrays.asList(
            "React", "TypeScript", "Node.js", "Python", "PyTorch", "Kubernetes", "AWS", "PostgreSQL"
        );
        int maxTeamSize = 3;

        System.out.println("Target Project Skills to Cover (" + requiredSkills.size() + "): " + String.join(", ", requiredSkills));
        System.out.println("Maximum Allowed Team Size: " + maxTeamSize + " engineers\n");

        GreedySetCoverTeam.TeamFormationResult res = GreedySetCoverTeam.formTeam(
            requiredSkills, MockDatabase.TEAM_CANDIDATE_POOL, maxTeamSize
        );

        DSAMetricsTracker.recordMetric("GreedySetCover", res.executionTimeMs, requiredSkills.size(),
            res.teamMembers.size(), "CLI Team Formation");

        System.out.println("✓ Recommended Project Team (formed in " + res.executionTimeMs + " ms):");
        for (GreedySetCoverTeam.TeamMemberRecommendation m : res.teamMembers) {
            System.out.printf("  Step %d: %s (%s)\n", m.selectionStep, m.candidateName, m.headline);
            System.out.println("          Newly Covered Skills : " + String.join(", ", m.skillsContributed));
            System.out.println("          Marginal Gain        : +" + m.marginalCoverageCount + " skills");
        }

        System.out.println("\nCoverage Summary:");
        System.out.printf(" - Skills Covered   : %d / %d (%.1f%%)\n", res.totalSkillsCovered, res.totalSkillsRequired, res.coveragePercentage);
        System.out.println(" - Covered List     : " + String.join(", ", res.skillsCovered));
        System.out.println(" - Missing Skills   : " + (res.skillsMissing.isEmpty() ? "None (100% Coverage Achieved!)" : String.join(", ", res.skillsMissing)));
        System.out.println(" - Theoretical Proof: " + res.approximationGuarantee);
    }

    // 6. Compatibility Scorer Demo
    private static void runCompatibilityScorerDemo() {
        System.out.println("\n--- [6] MULTI-FACTOR COMPATIBILITY SCORER & DETERMINISTIC RANKING ---");
        System.out.println("Weighted Formula: 50% Req Skills, 20% Pref Skills, 15% Experience, 10% Domain, 5% Education");
        System.out.println("Tie-Breaking: 1. Total Score -> 2. Req Coverage -> 3. Experience -> 4. Lexicographical ID\n");

        CompatibilityScorer.JobProfile job = MockDatabase.JOBS.get(0); // Senior Full Stack
        System.out.println("Target Job Posting: " + job.title + " (" + job.domain + ")");
        System.out.println("Required Skills: JavaScript, TypeScript, React, Node.js");
        System.out.println("Preferred Skills: PostgreSQL, Docker\n");

        List<CompatibilityScorer.CandidateRankingEntry> ranking = new ArrayList<>();
        Map<String, CompatibilityScorer.CompatibilityResult> details = new HashMap<>();

        for (CompatibilityScorer.CandidateProfile cand : MockDatabase.CANDIDATES) {
            CompatibilityScorer.CompatibilityResult cr = CompatibilityScorer.calculate(cand, job, null);
            details.put(cand.candidateId, cr);
            ranking.add(new CompatibilityScorer.CandidateRankingEntry(
                cand.candidateId, cand.name, cr.totalScore, cr.requiredSkillCoverageRatio, cand.yearsOfExperience
            ));
        }

        // Sort using deterministic tie-breaking comparator
        ranking.sort(CompatibilityScorer.comparator());

        System.out.println("Candidate Rankings:");
        System.out.printf("%-4s | %-18s | %-8s | %-12s | %-10s | %s\n",
            "Rank", "Candidate", "Score", "Req Coverage", "Experience", "Summary");
        System.out.println("-------------------------------------------------------------------------------------------------");
        int rank = 1;
        for (CompatibilityScorer.CandidateRankingEntry r : ranking) {
            CompatibilityScorer.CompatibilityResult cr = details.get(r.candidateId);
            System.out.printf("#%-3d | %-18s | %5.1f%% | %10.0f%% | %4.1f yrs   | %s\n",
                rank++, r.name, r.score, r.requiredCoverage * 100, r.yearsExperience, cr.explanation);
        }

        System.out.println("\nTop Candidate Score Breakdown (" + ranking.get(0).name + "):");
        CompatibilityScorer.ScoreBreakdown b = details.get(ranking.get(0).candidateId).breakdown;
        System.out.printf(" - Required Skills Score (50%% max) : %.1f pts\n", b.requiredSkillsScore);
        System.out.printf(" - Preferred Skills Score (20%% max): %.1f pts\n", b.preferredSkillsScore);
        System.out.printf(" - Experience Score (15%% max)      : %.1f pts\n", b.experienceScore);
        System.out.printf(" - Domain & Project Score (10%% max): %.1f pts\n", b.domainProjectScore);
        System.out.printf(" - Education Score (5%% max)         : %.1f pts\n", b.educationScore);
    }

    // 7. Full Benchmark Suite
    private static void runBenchmarkSuite() {
        System.out.println("\n--- [7] DSA HARDWARE BENCHMARK SUITE & COMPLEXITY TELEMETRY ---");
        System.out.println("Executing automated test suite across all 6 algorithms...\n");

        System.out.printf("%-26s | %-16s | %-16s | %-14s | %-10s\n",
            "Algorithm", "Time Complexity", "Space Complexity", "Input Size", "Measured Time");
        System.out.println("-------------------------------------------------------------------------------------------");

        // 1. Aho-Corasick
        String longText = "Java, React, Node.js, Python, TypeScript, Docker, Kubernetes, AWS, PostgreSQL, Go, C++";
        long t1 = System.nanoTime();
        skillEngine.extractSkills(longText);
        double ms1 = (System.nanoTime() - t1) / 1_000_000.0;
        System.out.printf("%-26s | %-16s | %-16s | %-14s | %.3f ms\n",
            "Aho-Corasick Multi-Pattern", "O(N + Σ|P| + Z)", "O(Σ|P| * |Σ|)", longText.length() + " chars", ms1);

        // 2. Levenshtein
        long t2 = System.nanoTime();
        EditDistance.calculate("KuberenetesCluster", "KubernetesCluster");
        double ms2 = (System.nanoTime() - t2) / 1_000_000.0;
        System.out.printf("%-26s | %-16s | %-16s | %-14s | %.3f ms\n",
            "Levenshtein Distance (DP)", "O(N * M)", "O(N * M)", "18 x 17 chars", ms2);

        // 3. KMP
        long t3 = System.nanoTime();
        KMP.search("AABAACAADAABAABA", "AABA");
        double ms3 = (System.nanoTime() - t3) / 1_000_000.0;
        System.out.printf("%-26s | %-16s | %-16s | %-14s | %.3f ms\n",
            "Knuth-Morris-Pratt (KMP)", "O(N + M)", "O(M) LPS Table", "16 x 4 chars", ms3);

        // 4. Hungarian
        long t4 = System.nanoTime();
        HungarianAlgorithm.optimize(MockDatabase.JOBS, MockDatabase.CANDIDATES,
            j -> j.jobId, j -> j.title, c -> c.candidateId, c -> c.name,
            (j, c, s) -> CompatibilityScorer.calculate(c, j, null).totalScore);
        double ms4 = (System.nanoTime() - t4) / 1_000_000.0;
        System.out.printf("%-26s | %-16s | %-16s | %-14s | %.3f ms\n",
            "Hungarian (Kuhn-Munkres)", "O(V³)", "O(V²)", "4x4 Matrix", ms4);

        // 5. Greedy Set Cover
        long t5 = System.nanoTime();
        GreedySetCoverTeam.formTeam(Arrays.asList("Java", "React", "Docker", "AWS", "NLP"), MockDatabase.TEAM_CANDIDATE_POOL, 3);
        double ms5 = (System.nanoTime() - t5) / 1_000_000.0;
        System.out.printf("%-26s | %-16s | %-16s | %-14s | %.3f ms\n",
            "Greedy Set Cover", "O(K * |C| * |U|)", "O(|U| + |C|)", "5 skills, 4 cands", ms5);

        // 6. Compatibility Scorer
        long t6 = System.nanoTime();
        for (CompatibilityScorer.CandidateProfile c : MockDatabase.CANDIDATES) {
            CompatibilityScorer.calculate(c, MockDatabase.JOBS.get(0), null);
        }
        double ms6 = (System.nanoTime() - t6) / 1_000_000.0;
        System.out.printf("%-26s | %-16s | %-16s | %-14s | %.3f ms\n",
            "Multi-Factor Scorer", "O(|Req| + |Pref|)", "O(1)", "4 candidates", ms6);

        System.out.println("-------------------------------------------------------------------------------------------");
        System.out.println("✓ All hardware measurements completed successfully using System.nanoTime().");
    }
}
