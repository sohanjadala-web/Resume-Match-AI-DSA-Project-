package com.resumematch.algorithms;

import java.util.*;

/**
 * Multi-Factor Compatibility Scorer & Deterministic Tie-Breaker
 * 
 * Implements deterministic formula:
 *  - Required Skills Coverage: 50%
 *  - Preferred Skills Coverage: 20%
 *  - Relevant Experience: 15%
 *  - Domain & Project Relevance: 10%
 *  - Education & Qualifications: 5%
 * 
 * Provides transparent mathematical breakdowns and 4-tier deterministic tie-breaking.
 */
public class CompatibilityScorer {

    public static class Weights {
        public final double requiredSkills;
        public final double preferredSkills;
        public final double experience;
        public final double domainProject;
        public final double education;

        public Weights(double requiredSkills, double preferredSkills, double experience, double domainProject, double education) {
            this.requiredSkills = requiredSkills;
            this.preferredSkills = preferredSkills;
            this.experience = experience;
            this.domainProject = domainProject;
            this.education = education;
        }

        public static Weights defaultWeights() {
            return new Weights(0.50, 0.20, 0.15, 0.10, 0.05);
        }
    }

    public static class CandidateSkillInput {
        public final String skillId;
        public final String name;
        public final String proficiency;
        public final double yearsOfExperience;

        public CandidateSkillInput(String skillId, String name, String proficiency, double yearsOfExperience) {
            this.skillId = skillId;
            this.name = name;
            this.proficiency = proficiency;
            this.yearsOfExperience = yearsOfExperience;
        }
    }

    public static class CandidateProjectInput {
        public final String title;
        public final String technologies;
        public final String description;

        public CandidateProjectInput(String title, String technologies, String description) {
            this.title = title;
            this.technologies = technologies;
            this.description = description;
        }
    }

    public static class CandidateEducationInput {
        public final String degree;
        public final String fieldOfStudy;

        public CandidateEducationInput(String degree, String fieldOfStudy) {
            this.degree = degree;
            this.fieldOfStudy = fieldOfStudy;
        }
    }

    public static class CandidateProfile {
        public final String candidateId;
        public final String name;
        public final String preferredDomain;
        public final double yearsOfExperience;
        public final List<CandidateSkillInput> skills;
        public final List<CandidateProjectInput> projects;
        public final List<CandidateEducationInput> education;

        public CandidateProfile(String candidateId, String name, String preferredDomain, double yearsOfExperience,
                                List<CandidateSkillInput> skills, List<CandidateProjectInput> projects,
                                List<CandidateEducationInput> education) {
            this.candidateId = candidateId;
            this.name = name;
            this.preferredDomain = preferredDomain;
            this.yearsOfExperience = yearsOfExperience;
            this.skills = (skills != null) ? skills : new ArrayList<>();
            this.projects = (projects != null) ? projects : new ArrayList<>();
            this.education = (education != null) ? education : new ArrayList<>();
        }
    }

    public static class JobRequiredSkillInput {
        public final String skillId;
        public final String name;
        public final double minExpYears;

        public JobRequiredSkillInput(String skillId, String name, double minExpYears) {
            this.skillId = skillId;
            this.name = name;
            this.minExpYears = minExpYears;
        }
    }

    public static class JobPreferredSkillInput {
        public final String skillId;
        public final String name;

        public JobPreferredSkillInput(String skillId, String name) {
            this.skillId = skillId;
            this.name = name;
        }
    }

    public static class JobProfile {
        public final String jobId;
        public final String title;
        public final String domain;
        public final double minExperienceYears;
        public final String educationRequired;
        public final List<JobRequiredSkillInput> requiredSkills;
        public final List<JobPreferredSkillInput> preferredSkills;

        public JobProfile(String jobId, String title, String domain, double minExperienceYears,
                          String educationRequired, List<JobRequiredSkillInput> requiredSkills,
                          List<JobPreferredSkillInput> preferredSkills) {
            this.jobId = jobId;
            this.title = title;
            this.domain = domain;
            this.minExperienceYears = minExperienceYears;
            this.educationRequired = educationRequired;
            this.requiredSkills = (requiredSkills != null) ? requiredSkills : new ArrayList<>();
            this.preferredSkills = (preferredSkills != null) ? preferredSkills : new ArrayList<>();
        }
    }

    public static class ScoreBreakdown {
        public final double requiredSkillsScore;
        public final double preferredSkillsScore;
        public final double experienceScore;
        public final double domainProjectScore;
        public final double educationScore;

        public ScoreBreakdown(double required, double preferred, double exp, double domain, double edu) {
            this.requiredSkillsScore = Math.round(required * 100.0) / 100.0;
            this.preferredSkillsScore = Math.round(preferred * 100.0) / 100.0;
            this.experienceScore = Math.round(exp * 100.0) / 100.0;
            this.domainProjectScore = Math.round(domain * 100.0) / 100.0;
            this.educationScore = Math.round(edu * 100.0) / 100.0;
        }
    }

    public static class CompatibilityResult {
        public final double totalScore;
        public final double requiredSkillCoverageRatio;
        public final double preferredSkillCoverageRatio;
        public final boolean isFullyQualified;
        public final ScoreBreakdown breakdown;
        public final List<String> matchingRequiredSkills;
        public final List<String> missingRequiredSkills;
        public final List<String> matchingPreferredSkills;
        public final String explanation;

        public CompatibilityResult(double totalScore, double reqCoverage, double prefCoverage,
                                   boolean isFullyQualified, ScoreBreakdown breakdown,
                                   List<String> matchingRequiredSkills, List<String> missingRequiredSkills,
                                   List<String> matchingPreferredSkills, String explanation) {
            this.totalScore = Math.round(totalScore * 10.0) / 10.0;
            this.requiredSkillCoverageRatio = Math.round(reqCoverage * 100.0) / 100.0;
            this.preferredSkillCoverageRatio = Math.round(prefCoverage * 100.0) / 100.0;
            this.isFullyQualified = isFullyQualified;
            this.breakdown = breakdown;
            this.matchingRequiredSkills = matchingRequiredSkills;
            this.missingRequiredSkills = missingRequiredSkills;
            this.matchingPreferredSkills = matchingPreferredSkills;
            this.explanation = explanation;
        }
    }

    /**
     * Calculates compatibility score between CandidateProfile and JobProfile.
     */
    public static CompatibilityResult calculate(CandidateProfile candidate, JobProfile job, Weights weights) {
        if (weights == null) weights = Weights.defaultWeights();

        Map<String, CandidateSkillInput> candidateSkillMap = new HashMap<>();
        Set<String> candidateSkillNames = new HashSet<>();

        for (CandidateSkillInput s : candidate.skills) {
            if (s.skillId != null) candidateSkillMap.put(s.skillId.toLowerCase(), s);
            if (s.name != null) {
                candidateSkillMap.put(s.name.trim().toLowerCase(), s);
                candidateSkillNames.add(s.name.trim().toLowerCase());
            }
        }

        // 1. Required Skills Score (50%)
        List<String> matchingReq = new ArrayList<>();
        List<String> missingReq = new ArrayList<>();
        double reqPoints = 0.0;

        for (JobRequiredSkillInput req : job.requiredSkills) {
            String idKey = (req.skillId != null) ? req.skillId.toLowerCase() : "";
            String nameKey = (req.name != null) ? req.name.trim().toLowerCase() : "";

            CandidateSkillInput matched = candidateSkillMap.get(idKey);
            if (matched == null && !nameKey.isEmpty()) {
                matched = candidateSkillMap.get(nameKey);
            }

            if (matched != null) {
                matchingReq.add(req.name);
                double expMultiplier = (req.minExpYears > 0)
                        ? Math.min(1.0, matched.yearsOfExperience / req.minExpYears)
                        : 1.0;
                reqPoints += 1.0 * expMultiplier;
            } else {
                missingReq.add(req.name);
            }
        }

        int totalReq = job.requiredSkills.size();
        double reqCoverageRatio = (totalReq == 0) ? 1.0 : (double) matchingReq.size() / totalReq;
        double reqNormalized = (totalReq == 0) ? 1.0 : reqPoints / totalReq;
        double requiredScore = reqNormalized * (weights.requiredSkills * 100.0);

        // 2. Preferred Skills Score (20%)
        List<String> matchingPref = new ArrayList<>();
        for (JobPreferredSkillInput pref : job.preferredSkills) {
            String idKey = (pref.skillId != null) ? pref.skillId.toLowerCase() : "";
            String nameKey = (pref.name != null) ? pref.name.trim().toLowerCase() : "";

            if (candidateSkillMap.containsKey(idKey) || candidateSkillMap.containsKey(nameKey)) {
                matchingPref.add(pref.name);
            }
        }
        int totalPref = job.preferredSkills.size();
        double prefCoverageRatio = (totalPref == 0) ? 1.0 : (double) matchingPref.size() / totalPref;
        double preferredScore = prefCoverageRatio * (weights.preferredSkills * 100.0);

        // 3. Relevant Experience Score (15%)
        double expRatio = 1.0;
        if (job.minExperienceYears > 0) {
            if (candidate.yearsOfExperience >= job.minExperienceYears) {
                expRatio = 1.0;
            } else {
                expRatio = Math.max(0.2, candidate.yearsOfExperience / job.minExperienceYears);
            }
        }
        double experienceScore = expRatio * (weights.experience * 100.0);

        // 4. Domain & Project Relevance Score (10%)
        double domainScoreRaw = 0.5;
        if (candidate.preferredDomain != null && job.domain != null) {
            if (candidate.preferredDomain.equalsIgnoreCase(job.domain)) {
                domainScoreRaw += 0.3;
            }
        }
        int projectHits = 0;
        for (CandidateProjectInput p : candidate.projects) {
            String text = ((p.title != null ? p.title : "") + " " +
                           (p.technologies != null ? p.technologies : "") + " " +
                           (p.description != null ? p.description : "")).toLowerCase();
            for (JobRequiredSkillInput req : job.requiredSkills) {
                if (req.name != null && text.contains(req.name.toLowerCase())) {
                    projectHits++;
                    break;
                }
            }
        }
        if (projectHits > 0) domainScoreRaw += 0.2;
        domainScoreRaw = Math.min(1.0, domainScoreRaw);
        double domainScore = domainScoreRaw * (weights.domainProject * 100.0);

        // 5. Education Score (5%)
        double eduRatio = 0.8;
        if (job.educationRequired != null && !candidate.education.isEmpty()) {
            String reqLower = job.educationRequired.toLowerCase();
            boolean hasMatch = false;
            for (CandidateEducationInput edu : candidate.education) {
                String d = (edu.degree != null) ? edu.degree.toLowerCase() : "";
                String f = (edu.fieldOfStudy != null) ? edu.fieldOfStudy.toLowerCase() : "";
                if (d.contains("bachelor") || d.contains("master") || d.contains("b.tech") || (!f.isEmpty() && reqLower.contains(f))) {
                    hasMatch = true;
                    break;
                }
            }
            eduRatio = hasMatch ? 1.0 : 0.7;
        }
        double educationScore = eduRatio * (weights.education * 100.0);

        double totalScore = Math.min(100.0, Math.max(0.0, requiredScore + preferredScore + experienceScore + domainScore + educationScore));

        boolean isFullyQualified = missingReq.isEmpty();
        String explanation;
        if (isFullyQualified) {
            explanation = String.format("Excellent match: Candidate satisfies 100%% of required skills (%s) with %.1f yrs experience in %s.",
                String.join(", ", matchingReq), candidate.yearsOfExperience, job.domain);
        } else if (reqCoverageRatio >= 0.6) {
            explanation = String.format("Strong candidate with %d%% required skills match (%s). Missing: %s.",
                (int) Math.round(reqCoverageRatio * 100), String.join(", ", matchingReq), String.join(", ", missingReq));
        } else {
            explanation = String.format("Partial match (%d%% required skills). Lacks critical required skills: %s.",
                (int) Math.round(reqCoverageRatio * 100), String.join(", ", missingReq));
        }

        ScoreBreakdown breakdown = new ScoreBreakdown(requiredScore, preferredScore, experienceScore, domainScore, educationScore);
        return new CompatibilityResult(
            totalScore, reqCoverageRatio, prefCoverageRatio,
            isFullyQualified, breakdown, matchingReq, missingReq, matchingPref, explanation
        );
    }

    /**
     * Deterministic 4-tier candidate comparator:
     * 1. Higher total compatibility score
     * 2. Higher required skill coverage ratio
     * 3. Higher years of experience
     * 4. Lexicographical Candidate ID
     */
    public static Comparator<CandidateRankingEntry> comparator() {
        return (a, b) -> {
            if (Double.compare(b.score, a.score) != 0) {
                return Double.compare(b.score, a.score);
            }
            if (Double.compare(b.requiredCoverage, a.requiredCoverage) != 0) {
                return Double.compare(b.requiredCoverage, a.requiredCoverage);
            }
            if (Double.compare(b.yearsExperience, a.yearsExperience) != 0) {
                return Double.compare(b.yearsExperience, a.yearsExperience);
            }
            return a.candidateId.compareTo(b.candidateId);
        };
    }

    public static class CandidateRankingEntry {
        public final String candidateId;
        public final String name;
        public final double score;
        public final double requiredCoverage;
        public final double yearsExperience;

        public CandidateRankingEntry(String candidateId, String name, double score, double requiredCoverage, double yearsExperience) {
            this.candidateId = candidateId;
            this.name = name;
            this.score = score;
            this.requiredCoverage = requiredCoverage;
            this.yearsExperience = yearsExperience;
        }
    }
}
