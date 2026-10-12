package com.resumematch.spring.controller;

import com.resumematch.algorithms.*;
import com.resumematch.spring.service.DSAService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/dsa")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"})
public class DSAController {

    @Autowired
    private DSAService dsaService;

    @PostMapping("/playground/run")
    public ResponseEntity<Map<String, Object>> runPlayground(@RequestBody Map<String, String> payload) {
        String algorithm = payload.getOrDefault("algorithm", "Aho-Corasick");
        Map<String, Object> response = new HashMap<>();

        long start = System.nanoTime();
        if ("Levenshtein".equalsIgnoreCase(algorithm)) {
            String s1 = payload.getOrDefault("str1", "Pyhton");
            String s2 = payload.getOrDefault("str2", "Python");
            int dist = dsaService.calculateLevenshtein(s1, s2);
            double sim = dsaService.calculateSimilarity(s1, s2);
            double ms = (System.nanoTime() - start) / 1_000_000.0;

            response.put("algorithm", "Levenshtein");
            response.put("distance", dist);
            response.put("similarity", Math.round(sim * 1000.0) / 10.0);
            response.put("executionTimeMs", Math.round(ms * 1000.0) / 1000.0);
            response.put("theoreticalComplexity", "O(N * M)");

        } else if ("KMP".equalsIgnoreCase(algorithm)) {
            String text = payload.getOrDefault("text", "Java Spring Boot microservices");
            String pattern = payload.getOrDefault("pattern", "Java");
            List<Integer> matches = dsaService.searchKmp(text, pattern);
            double ms = (System.nanoTime() - start) / 1_000_000.0;

            response.put("algorithm", "KMP");
            response.put("matchesCount", matches.size());
            response.put("indices", matches);
            response.put("executionTimeMs", Math.round(ms * 1000.0) / 1000.0);
            response.put("theoreticalComplexity", "O(N + M)");

        } else if ("Hungarian".equalsIgnoreCase(algorithm)) {
            HungarianAlgorithm.Result res = dsaService.runHungarianAllocation();
            response.put("algorithm", "Hungarian (Kuhn-Munkres)");
            response.put("totalScore", res.totalScore);
            response.put("baselineGreedyScore", res.baselineGreedyScore);
            response.put("scoreImprovement", res.scoreImprovement);
            response.put("executionTimeMs", res.executionTimeMs);
            response.put("theoreticalComplexity", "O(V³)");

        } else {
            String text = payload.getOrDefault("text", "Full-Stack React and Node.js with AWS");
            List<SkillExtractorEngine.ExtractedSkill> list = dsaService.extractSkills(text);
            double ms = (System.nanoTime() - start) / 1_000_000.0;

            response.put("algorithm", "Aho-Corasick");
            response.put("matchesCount", list.size());
            response.put("skills", list);
            response.put("executionTimeMs", Math.round(ms * 1000.0) / 1000.0);
            response.put("theoreticalComplexity", "O(N + Z)");
        }

        return ResponseEntity.ok(response);
    }
}
