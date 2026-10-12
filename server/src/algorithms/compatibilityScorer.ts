/**
 * DSA-Based Multi-Factor Compatibility Scorer
 * Implements deterministic compatibility formula:
 *  - Required Skills Coverage: 50%
 *  - Preferred Skills Coverage: 20%
 *  - Relevant Experience: 15%
 *  - Domain & Project Relevance: 10%
 *  - Education & Qualifications: 5%
 * 
 * Provides mathematical transparency, full sub-score breakdown,
 * and deterministic tie-breaking.
 */

export interface ScoringWeights {
  requiredSkills: number;  // 0.50
  preferredSkills: number; // 0.20
  experience: number;      // 0.15
  domainProject: number;   // 0.10
  education: number;       // 0.05
}

export const DEFAULT_WEIGHTS: ScoringWeights = {
  requiredSkills: 0.50,
  preferredSkills: 0.20,
  experience: 0.15,
  domainProject: 0.10,
  education: 0.05,
};

export interface CandidateProfileScoringInput {
  candidateId: string;
  name: string;
  preferredDomain?: string | null;
  yearsOfExperience: number;
  skills: { skillId: string; name: string; proficiencyLevel: string; yearsOfExperience: number }[];
  projects: { title: string; technologies: string; description: string }[];
  education: { degree: string; fieldOfStudy?: string | null }[];
}

export interface JobScoringInput {
  jobId: string;
  title: string;
  domain: string;
  minExperienceYears: number;
  maxExperienceYears?: number | null;
  educationRequired?: string | null;
  requiredSkills: { skillId: string; name: string; minExpYears: number }[];
  preferredSkills: { skillId: string; name: string }[];
}

export interface CompatibilityResult {
  totalScore: number; // 0 - 100
  requiredSkillCoverageRatio: number; // 0 - 1
  preferredSkillCoverageRatio: number; // 0 - 1
  isFullyQualified: boolean; // all required skills present
  breakdown: {
    requiredSkillsScore: number;  // out of 50
    preferredSkillsScore: number; // out of 20
    experienceScore: number;      // out of 15
    domainProjectScore: number;   // out of 10
    educationScore: number;       // out of 5
  };
  matchingRequiredSkills: string[];
  missingRequiredSkills: string[];
  matchingPreferredSkills: string[];
  explanation: string;
}

export class CompatibilityScorer {
  /**
   * Calculate compatibility between candidate and job posting
   */
  public static calculate(
    candidate: CandidateProfileScoringInput,
    job: JobScoringInput,
    weights: ScoringWeights = DEFAULT_WEIGHTS
  ): CompatibilityResult {
    const candidateSkillMap = new Map<string, { proficiency: string; years: number }>();
    const candidateSkillNames = new Set<string>();

    for (const s of candidate.skills) {
      candidateSkillMap.set(s.skillId, { proficiency: s.proficiencyLevel, years: s.yearsOfExperience });
      candidateSkillNames.add(s.name.toLowerCase());
    }

    // 1. Required Skills Score (50%)
    const matchingReq: string[] = [];
    const missingReq: string[] = [];
    let reqPoints = 0;

    for (const req of job.requiredSkills) {
      if (candidateSkillMap.has(req.skillId)) {
        matchingReq.push(req.name);
        const candSkill = candidateSkillMap.get(req.skillId)!;
        // Bonus for meeting or exceeding required experience for the skill
        const expMultiplier = req.minExpYears > 0 
          ? Math.min(1.0, candSkill.years / req.minExpYears)
          : 1.0;
        reqPoints += 1.0 * expMultiplier;
      } else {
        missingReq.push(req.name);
      }
    }

    const totalReq = job.requiredSkills.length;
    const reqCoverageRatio = totalReq === 0 ? 1.0 : matchingReq.length / totalReq;
    const reqNormalized = totalReq === 0 ? 1.0 : reqPoints / totalReq;
    const requiredScore = parseFloat((reqNormalized * (weights.requiredSkills * 100)).toFixed(2));

    // 2. Preferred Skills Score (20%)
    const matchingPref: string[] = [];
    for (const pref of job.preferredSkills) {
      if (candidateSkillMap.has(pref.skillId)) {
        matchingPref.push(pref.name);
      }
    }
    const totalPref = job.preferredSkills.length;
    const prefCoverageRatio = totalPref === 0 ? 1.0 : matchingPref.length / totalPref;
    const preferredScore = parseFloat((prefCoverageRatio * (weights.preferredSkills * 100)).toFixed(2));

    // 3. Relevant Experience Score (15%)
    let expRatio = 1.0;
    if (job.minExperienceYears > 0) {
      if (candidate.yearsOfExperience >= job.minExperienceYears) {
        // Full score if candidate meets minimum experience
        expRatio = 1.0;
      } else {
        // Pro-rated score if below minimum
        expRatio = Math.max(0.2, candidate.yearsOfExperience / job.minExperienceYears);
      }
    }
    const experienceScore = parseFloat((expRatio * (weights.experience * 100)).toFixed(2));

    // 4. Domain & Project Relevance Score (10%)
    let domainScoreRaw = 0.5; // base baseline
    if (candidate.preferredDomain && job.domain) {
      if (candidate.preferredDomain.toLowerCase() === job.domain.toLowerCase()) {
        domainScoreRaw += 0.3;
      }
    }
    // Check if candidate projects mention any required or preferred skills
    let projectSkillHit = 0;
    for (const p of candidate.projects) {
      const projText = `${p.title} ${p.technologies} ${p.description}`.toLowerCase();
      for (const req of job.requiredSkills) {
        if (projText.includes(req.name.toLowerCase())) {
          projectSkillHit++;
          break;
        }
      }
    }
    if (projectSkillHit > 0) domainScoreRaw += 0.2;
    domainScoreRaw = Math.min(1.0, domainScoreRaw);
    const domainProjectScore = parseFloat((domainScoreRaw * (weights.domainProject * 100)).toFixed(2));

    // 5. Job-Related Qualifications / Education Score (5%)
    let eduRatio = 0.8; // default acceptable
    if (job.educationRequired && candidate.education.length > 0) {
      const reqEduLower = job.educationRequired.toLowerCase();
      const hasMatch = candidate.education.some(e => 
        e.degree.toLowerCase().includes('bachelor') || 
        e.degree.toLowerCase().includes('master') || 
        e.degree.toLowerCase().includes('b.tech') ||
        (e.fieldOfStudy && reqEduLower.includes(e.fieldOfStudy.toLowerCase()))
      );
      eduRatio = hasMatch ? 1.0 : 0.7;
    }
    const educationScore = parseFloat((eduRatio * (weights.education * 100)).toFixed(2));

    // Total Score (0 - 100)
    let totalScore = parseFloat(
      (requiredScore + preferredScore + experienceScore + domainProjectScore + educationScore).toFixed(1)
    );
    totalScore = Math.min(100, Math.max(0, totalScore));

    // Formulate transparent explanation
    const isFullyQualified = missingReq.length === 0;
    let explanation = '';
    if (isFullyQualified) {
      explanation = `Excellent match: Candidate satisfies 100% of required skills (${matchingReq.join(', ')}) with ${candidate.yearsOfExperience} years of experience in ${job.domain}.`;
    } else if (reqCoverageRatio >= 0.6) {
      explanation = `Strong candidate with ${Math.round(reqCoverageRatio * 100)}% required skills match (${matchingReq.join(', ')}). Missing: ${missingReq.join(', ')}.`;
    } else {
      explanation = `Partial match (${Math.round(reqCoverageRatio * 100)}% required skills). Lacks critical required skills: ${missingReq.join(', ')}.`;
    }

    return {
      totalScore,
      requiredSkillCoverageRatio: parseFloat(reqCoverageRatio.toFixed(2)),
      preferredSkillCoverageRatio: parseFloat(prefCoverageRatio.toFixed(2)),
      isFullyQualified,
      breakdown: {
        requiredSkillsScore: requiredScore,
        preferredSkillsScore: preferredScore,
        experienceScore: experienceScore,
        domainProjectScore: domainProjectScore,
        educationScore: educationScore,
      },
      matchingRequiredSkills: matchingReq,
      missingRequiredSkills: missingReq,
      matchingPreferredSkills: matchingPref,
      explanation,
    };
  }

  /**
   * Deterministic tie-breaker for candidate ranking:
   * 1. Primary: Higher total compatibility score
   * 2. Secondary: Higher required skills coverage ratio
   * 3. Tertiary: Higher years of relevant experience
   * 4. Quaternary: Alphabetical/lexicographical candidate ID
   */
  public static compareCandidates(
    a: { score: number; reqCoverage: number; experienceYears: number; candidateId: string },
    b: { score: number; reqCoverage: number; experienceYears: number; candidateId: string }
  ): number {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    if (b.reqCoverage !== a.reqCoverage) {
      return b.reqCoverage - a.reqCoverage;
    }
    if (b.experienceYears !== a.experienceYears) {
      return b.experienceYears - a.experienceYears;
    }
    return a.candidateId.localeCompare(b.candidateId);
  }
}
