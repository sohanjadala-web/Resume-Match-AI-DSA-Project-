package com.resumematch.spring.service;

import com.resumematch.algorithms.*;
import com.resumematch.data.MockDatabase;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DSAService {

    private final SkillExtractorEngine skillEngine = new SkillExtractorEngine(MockDatabase.SKILLS);

    public List<SkillExtractorEngine.ExtractedSkill> extractSkills(String text) {
        return skillEngine.extractSkills(text);
    }

    public int calculateLevenshtein(String s1, String s2) {
        return EditDistance.calculate(s1, s2);
    }

    public double calculateSimilarity(String s1, String s2) {
        return EditDistance.similarity(s1, s2);
    }

    public List<Integer> searchKmp(String text, String pattern) {
        return KMP.search(text, pattern);
    }

    public HungarianAlgorithm.Result runHungarianAllocation() {
        return HungarianAlgorithm.optimize(
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
    }

    public GreedySetCoverTeam.TeamFormationResult runSetCover(List<String> requiredSkills, int teamSize) {
        return GreedySetCoverTeam.formTeam(requiredSkills, MockDatabase.TEAM_CANDIDATE_POOL, teamSize);
    }
}
