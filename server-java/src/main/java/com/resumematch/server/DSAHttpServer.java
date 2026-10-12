package com.resumematch.server;

import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpExchange;

import com.resumematch.algorithms.*;
import com.resumematch.data.MockDatabase;

import java.io.*;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.concurrent.Executors;

/**
 * High-Performance Lightweight REST API Server in Java
 * 
 * Powered by Java standard library (com.sun.net.httpserver) and Virtual Threads.
 * Compatible with the React frontend on http://localhost:5173.
 * Requires ZERO external dependencies to compile or run!
 */
public class DSAHttpServer {

    private static final int DEFAULT_PORT = 5000;
    private static final SkillExtractorEngine skillEngine = new SkillExtractorEngine(MockDatabase.SKILLS);
    private static MockDatabase.UserAccount currentUser = MockDatabase.USERS.get(0); // Alice by default

    public static void main(String[] args) throws IOException {
        int port = DEFAULT_PORT;
        if (args.length > 0) {
            try {
                port = Integer.parseInt(args[0]);
            } catch (NumberFormatException ignored) {}
        }
        String envPort = System.getenv("PORT");
        if (envPort != null) {
            try {
                port = Integer.parseInt(envPort);
            } catch (NumberFormatException ignored) {}
        }

        HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);
        // Use virtual threads for lightweight, high-concurrency request handling (Java 21+)
        server.setExecutor(Executors.newVirtualThreadPerTaskExecutor());

        // Register REST API Endpoints
        server.createContext("/api/health", new HealthHandler());
        server.createContext("/api/auth", new AuthHandler());
        server.createContext("/api/candidate", new CandidateHandler());
        server.createContext("/api/recruiter", new RecruiterHandler());
        server.createContext("/api/dsa/playground", new DSAPlaygroundHandler());
        server.createContext("/api/admin", new AdminHandler());

        server.start();
        System.out.println("================================================================================");
        System.out.println(" 🚀 ResumeMatch AI Java REST API Server is running on http://localhost:" + port);
        System.out.println(" 🌐 Compatible with Vite React Frontend at http://localhost:5173");
        System.out.println(" 🔬 Powered by Java 25 Virtual Threads & Verified DSA Algorithms");
        System.out.println("================================================================================");
    }

    // CORS & Response Utility
    private static void sendJsonResponse(HttpExchange exchange, int statusCode, String jsonResponse) throws IOException {
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type, Authorization");

        byte[] bytes = jsonResponse.getBytes(StandardCharsets.UTF_8);
        exchange.sendResponseHeaders(statusCode, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }

    private static boolean handlePreflight(HttpExchange exchange) throws IOException {
        if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
            exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
            exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
            exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type, Authorization");
            exchange.sendResponseHeaders(204, -1);
            return true;
        }
        return false;
    }

    private static String readRequestBody(HttpExchange exchange) throws IOException {
        try (InputStream is = exchange.getRequestBody()) {
            return new String(is.readAllBytes(), StandardCharsets.UTF_8);
        }
    }

    // Simple JSON value extractor helper
    private static String extractJsonString(String json, String key) {
        if (json == null) return "";
        String pattern = "\"" + key + "\"\\s*:\\s*\"([^\"]+)\"";
        java.util.regex.Matcher m = java.util.regex.Pattern.compile(pattern).matcher(json);
        return m.find() ? m.group(1) : "";
    }

    // 1. Health Handler
    static class HealthHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (handlePreflight(exchange)) return;
            String json = String.format("{\"status\":\"online\",\"platform\":\"ResumeMatch AI (Java 25 Edition)\",\"timestamp\":\"%s\"}",
                new Date().toString());
            sendJsonResponse(exchange, 200, json);
        }
    }

    // 2. Auth Handler
    static class AuthHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (handlePreflight(exchange)) return;
            String path = exchange.getRequestURI().getPath();

            if (path.endsWith("/login")) {
                String body = readRequestBody(exchange);
                String email = extractJsonString(body, "email");
                MockDatabase.UserAccount found = null;
                for (MockDatabase.UserAccount u : MockDatabase.USERS) {
                    if (u.email.equalsIgnoreCase(email)) {
                        found = u;
                        break;
                    }
                }
                if (found == null) found = MockDatabase.USERS.get(0); // fallback to demo user
                currentUser = found;

                String response = String.format("{\"token\":\"demo-jwt-%s\",\"user\":{\"id\":\"%s\",\"email\":\"%s\",\"role\":\"%s\",\"name\":\"%s\"}}",
                    currentUser.id, currentUser.id, currentUser.email, currentUser.role, currentUser.name);
                sendJsonResponse(exchange, 200, response);
            } else if (path.endsWith("/me")) {
                String response = String.format("{\"user\":{\"id\":\"%s\",\"email\":\"%s\",\"role\":\"%s\",\"name\":\"%s\"}}",
                    currentUser.id, currentUser.email, currentUser.role, currentUser.name);
                sendJsonResponse(exchange, 200, response);
            } else if (path.endsWith("/logout")) {
                sendJsonResponse(exchange, 200, "{\"message\":\"Logged out successfully\"}");
            } else {
                sendJsonResponse(exchange, 200, "{}");
            }
        }
    }

    // 3. Candidate Handler
    static class CandidateHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (handlePreflight(exchange)) return;
            String path = exchange.getRequestURI().getPath();

            if (path.endsWith("/resume")) {
                String body = readRequestBody(exchange);
                String resumeText = extractJsonString(body, "resumeText");
                if (resumeText.isEmpty()) {
                    resumeText = "Senior Engineer experienced in React, TypeScript, Node.js, Docker, and PostgreSQL.";
                }

                long start = System.nanoTime();
                List<SkillExtractorEngine.ExtractedSkill> extracted = skillEngine.extractSkills(resumeText);
                double ms = (System.nanoTime() - start) / 1_000_000.0;
                DSAMetricsTracker.recordMetric("Aho-Corasick", ms, resumeText.length(), extracted.size(), "API Resume Parse");

                StringBuilder sb = new StringBuilder();
                sb.append("{\"extractedSkills\":[");
                for (int i = 0; i < extracted.size(); i++) {
                    SkillExtractorEngine.ExtractedSkill s = extracted.get(i);
                    sb.append(String.format("{\"skillId\":\"%s\",\"name\":\"%s\",\"category\":\"%s\",\"matchedVia\":\"%s\",\"confidence\":%.2f}",
                        s.skillId, s.canonicalName, s.category, s.matchedVia, s.confidence));
                    if (i < extracted.size() - 1) sb.append(",");
                }
                sb.append(String.format("],\"executionTimeMs\":%.3f}", ms));
                sendJsonResponse(exchange, 200, sb.toString());

            } else if (path.endsWith("/recommendations")) {
                // Calculate compatibility for active candidate against all jobs
                CompatibilityScorer.CandidateProfile cand = MockDatabase.CANDIDATES.get(0);
                StringBuilder sb = new StringBuilder();
                sb.append("{\"recommendations\":[");

                for (int i = 0; i < MockDatabase.JOBS.size(); i++) {
                    CompatibilityScorer.JobProfile job = MockDatabase.JOBS.get(i);
                    CompatibilityScorer.CompatibilityResult cr = CompatibilityScorer.calculate(cand, job, null);

                    sb.append(String.format("{\"jobId\":\"%s\",\"title\":\"%s\",\"domain\":\"%s\",\"score\":%.1f,\"coverage\":%.2f,\"explanation\":\"%s\",\"missingSkills\":[%s]}",
                        job.jobId, job.title, job.domain, cr.totalScore, cr.requiredSkillCoverageRatio, cr.explanation,
                        formatStringArrayJson(cr.missingRequiredSkills)));

                    if (i < MockDatabase.JOBS.size() - 1) sb.append(",");
                }
                sb.append("]}");
                sendJsonResponse(exchange, 200, sb.toString());

            } else {
                // Candidate profile
                CompatibilityScorer.CandidateProfile cand = MockDatabase.CANDIDATES.get(0);
                String resp = String.format("{\"candidate\":{\"id\":\"%s\",\"name\":\"%s\",\"domain\":\"%s\",\"experience\":%.1f}}",
                    cand.candidateId, cand.name, cand.preferredDomain, cand.yearsOfExperience);
                sendJsonResponse(exchange, 200, resp);
            }
        }
    }

    // 4. Recruiter Handler (Hungarian & Team Builder)
    static class RecruiterHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (handlePreflight(exchange)) return;
            String path = exchange.getRequestURI().getPath();

            if (path.endsWith("/optimize")) {
                // Hungarian Optimal Bipartite Assignment
                HungarianAlgorithm.Result res = HungarianAlgorithm.optimize(
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

                StringBuilder sb = new StringBuilder();
                sb.append(String.format("{\"algorithm\":\"%s\",\"totalScore\":%.1f,\"averageScore\":%.1f,\"baselineGreedyScore\":%.1f,\"scoreImprovement\":%.1f,\"executionTimeMs\":%.3f,\"assignments\":[",
                    res.algorithm, res.totalScore, res.averageScore, res.baselineGreedyScore, res.scoreImprovement, res.executionTimeMs));

                for (int i = 0; i < res.assignments.size(); i++) {
                    HungarianAlgorithm.AssignmentEdge e = res.assignments.get(i);
                    sb.append(String.format("{\"roleId\":\"%s\",\"roleTitle\":\"%s\",\"candidateId\":\"%s\",\"candidateName\":\"%s\",\"compatibilityScore\":%.1f,\"supportingSkills\":[%s]}",
                        e.roleId, e.roleTitle, e.candidateId, e.candidateName, e.compatibilityScore, formatStringArrayJson(e.supportingSkills)));
                    if (i < res.assignments.size() - 1) sb.append(",");
                }
                sb.append("]}");
                sendJsonResponse(exchange, 200, sb.toString());

            } else if (path.endsWith("/recommend")) {
                // Greedy Set Cover Team Formation
                List<String> reqSkills = Arrays.asList("React", "TypeScript", "Node.js", "Python", "Kubernetes", "AWS");
                GreedySetCoverTeam.TeamFormationResult res = GreedySetCoverTeam.formTeam(
                    reqSkills, MockDatabase.TEAM_CANDIDATE_POOL, 3
                );

                StringBuilder sb = new StringBuilder();
                sb.append(String.format("{\"algorithm\":\"%s\",\"coveragePercentage\":%.1f,\"totalSkillsCovered\":%d,\"totalSkillsRequired\":%d,\"executionTimeMs\":%.3f,\"teamMembers\":[",
                    res.algorithm, res.coveragePercentage, res.totalSkillsCovered, res.totalSkillsRequired, res.executionTimeMs));

                for (int i = 0; i < res.teamMembers.size(); i++) {
                    GreedySetCoverTeam.TeamMemberRecommendation m = res.teamMembers.get(i);
                    sb.append(String.format("{\"candidateId\":\"%s\",\"candidateName\":\"%s\",\"headline\":\"%s\",\"marginalGain\":%d,\"skillsContributed\":[%s]}",
                        m.candidateId, m.candidateName, (m.headline != null ? m.headline : ""), m.marginalCoverageCount, formatStringArrayJson(m.skillsContributed)));
                    if (i < res.teamMembers.size() - 1) sb.append(",");
                }
                sb.append("]}");
                sendJsonResponse(exchange, 200, sb.toString());

            } else {
                sendJsonResponse(exchange, 200, "{\"jobs\":[]}");
            }
        }
    }

    // 5. DSA Playground Handler
    static class DSAPlaygroundHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (handlePreflight(exchange)) return;
            String body = readRequestBody(exchange);
            String algorithm = extractJsonString(body, "algorithm");

            if ("Levenshtein".equalsIgnoreCase(algorithm)) {
                String str1 = extractJsonString(body, "str1");
                String str2 = extractJsonString(body, "str2");
                if (str1.isEmpty()) str1 = "Pyhton";
                if (str2.isEmpty()) str2 = "Python";

                long start = System.nanoTime();
                int dist = EditDistance.calculate(str1, str2);
                double sim = EditDistance.similarity(str1, str2);
                double ms = (System.nanoTime() - start) / 1_000_000.0;

                String json = String.format("{\"algorithm\":\"Levenshtein\",\"distance\":%d,\"similarity\":%.2f,\"executionTimeMs\":%.3f,\"theoreticalComplexity\":\"O(N * M)\"}",
                    dist, sim * 100, ms);
                sendJsonResponse(exchange, 200, json);

            } else if ("KMP".equalsIgnoreCase(algorithm)) {
                String text = extractJsonString(body, "text");
                String pattern = extractJsonString(body, "pattern");
                if (text.isEmpty()) text = "Java and Spring Boot microservices";
                if (pattern.isEmpty()) pattern = "Java";

                long start = System.nanoTime();
                List<Integer> occurrences = KMP.search(text, pattern);
                double ms = (System.nanoTime() - start) / 1_000_000.0;

                String json = String.format("{\"algorithm\":\"KMP\",\"matchesCount\":%d,\"executionTimeMs\":%.3f,\"theoreticalComplexity\":\"O(N + M)\"}",
                    occurrences.size(), ms);
                sendJsonResponse(exchange, 200, json);

            } else {
                // Default: Aho-Corasick
                String text = extractJsonString(body, "text");
                if (text.isEmpty()) text = "React, Node.js, Python, and AWS engineer";

                long start = System.nanoTime();
                List<SkillExtractorEngine.ExtractedSkill> list = skillEngine.extractSkills(text);
                double ms = (System.nanoTime() - start) / 1_000_000.0;

                String json = String.format("{\"algorithm\":\"Aho-Corasick\",\"matchesCount\":%d,\"executionTimeMs\":%.3f,\"theoreticalComplexity\":\"O(N + Z)\"}",
                    list.size(), ms);
                sendJsonResponse(exchange, 200, json);
            }
        }
    }

    // 6. Admin Handler
    static class AdminHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (handlePreflight(exchange)) return;
            List<DSAMetricsTracker.MetricEntry> metrics = DSAMetricsTracker.getRecentMetrics();

            StringBuilder sb = new StringBuilder();
            sb.append("{\"metrics\":[");
            for (int i = 0; i < metrics.size(); i++) {
                DSAMetricsTracker.MetricEntry m = metrics.get(i);
                sb.append(String.format("{\"id\":\"%s\",\"algorithmName\":\"%s\",\"executionTimeMs\":%.3f,\"inputSize\":%d,\"notes\":\"%s\"}",
                    m.id, m.algorithmName, m.executionTimeMs, m.inputSize, m.notes != null ? m.notes : ""));
                if (i < metrics.size() - 1) sb.append(",");
            }
            sb.append("],\"totalExecutions\":").append(metrics.size()).append("}");
            sendJsonResponse(exchange, 200, sb.toString());
        }
    }

    private static String formatStringArrayJson(List<String> list) {
        if (list == null || list.isEmpty()) return "";
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < list.size(); i++) {
            sb.append("\"").append(list.get(i).replace("\"", "\\\"")).append("\"");
            if (i < list.size() - 1) sb.append(",");
        }
        return sb.toString();
    }
}
