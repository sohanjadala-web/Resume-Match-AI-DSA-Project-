/**
 * Greedy Set Cover Approximation Algorithm for Project Team Formation
 * 
 * Problem: Given a target universe of required project skills U, and a set of candidate profiles C,
 * find a small subset of candidates of size <= K that maximizes coverage of U.
 * 
 * Approximation Ratio: H(|U|) = ln(|U|) + 1, which is the best-possible polynomial time approximation
 * unless P = NP (Feige, 1998).
 * 
 * Time Complexity: O(K * |C| * |U|)
 * Space Complexity: O(|U| + |C|)
 */

export interface CandidateTeamMemberInput {
  id: string;
  name: string;
  headline?: string | null;
  experienceYears: number;
  skills: string[];
}

export interface TeamMemberRecommendation {
  candidateId: string;
  candidateName: string;
  headline?: string | null;
  skillsContributed: string[];
  totalSkillsOwned: string[];
  selectionStep: number;
  marginalCoverageCount: number;
}

export interface TeamFormationResult {
  algorithm: 'GREEDY_SET_COVER_APPROXIMATION';
  teamMembers: TeamMemberRecommendation[];
  totalSkillsRequired: number;
  totalSkillsCovered: number;
  skillsCovered: string[];
  skillsMissing: string[];
  coveragePercentage: number;
  targetTeamSize: number;
  actualTeamSize: number;
  approximationGuarantee: string;
  executionTimeMs: number;
}

export class GreedySetCoverTeam {
  public static formTeam(
    requiredSkills: string[],
    candidatePool: CandidateTeamMemberInput[],
    maxTeamSize: number
  ): TeamFormationResult {
    const startTime = performance.now();

    // Set of uncovered skills
    const uncoveredSkills = new Set<string>(requiredSkills.map(s => s.toLowerCase()));
    const originalSkillCaseMap = new Map<string, string>();
    for (const s of requiredSkills) {
      originalSkillCaseMap.set(s.toLowerCase(), s);
    }

    const selectedMembers: TeamMemberRecommendation[] = [];
    const chosenCandidateIds = new Set<string>();
    const allCoveredSkillsSet = new Set<string>();

    let step = 1;

    while (uncoveredSkills.size > 0 && selectedMembers.length < maxTeamSize) {
      let bestCandidate: CandidateTeamMemberInput | null = null;
      let maxNewSkillsCovered = 0;
      let bestContributedSkills: string[] = [];

      for (const cand of candidatePool) {
        if (chosenCandidateIds.has(cand.id)) continue;

        // Calculate marginal gain (how many currently uncovered skills this candidate provides)
        const contributed: string[] = [];
        for (const skill of cand.skills) {
          const lower = skill.toLowerCase();
          if (uncoveredSkills.has(lower)) {
            contributed.push(originalSkillCaseMap.get(lower) || skill);
          }
        }

        if (contributed.length > maxNewSkillsCovered) {
          maxNewSkillsCovered = contributed.length;
          bestCandidate = cand;
          bestContributedSkills = contributed;
        } else if (contributed.length === maxNewSkillsCovered && contributed.length > 0 && bestCandidate) {
          // Tie-break: prefer candidate with more years of experience
          if (cand.experienceYears > bestCandidate.experienceYears) {
            bestCandidate = cand;
            bestContributedSkills = contributed;
          }
        }
      }

      // If no remaining candidate can contribute any more uncovered skills, break
      if (!bestCandidate || maxNewSkillsCovered === 0) {
        break;
      }

      // Select candidate
      chosenCandidateIds.add(bestCandidate.id);
      for (const s of bestContributedSkills) {
        uncoveredSkills.delete(s.toLowerCase());
        allCoveredSkillsSet.add(s);
      }

      selectedMembers.push({
        candidateId: bestCandidate.id,
        candidateName: bestCandidate.name,
        headline: bestCandidate.headline,
        skillsContributed: bestContributedSkills,
        totalSkillsOwned: bestCandidate.skills,
        selectionStep: step++,
        marginalCoverageCount: maxNewSkillsCovered,
      });
    }

    const missingSkills: string[] = [];
    for (const s of requiredSkills) {
      if (!allCoveredSkillsSet.has(s)) {
        missingSkills.push(s);
      }
    }

    const totalRequired = requiredSkills.length;
    const coveredCount = allCoveredSkillsSet.size;
    const coveragePercentage = totalRequired > 0 
      ? parseFloat(((coveredCount / totalRequired) * 100).toFixed(1)) 
      : 100;

    const endTime = performance.now();
    const executionTimeMs = parseFloat((endTime - startTime).toFixed(3));

    return {
      algorithm: 'GREEDY_SET_COVER_APPROXIMATION',
      teamMembers: selectedMembers,
      totalSkillsRequired: totalRequired,
      totalSkillsCovered: coveredCount,
      skillsCovered: Array.from(allCoveredSkillsSet),
      skillsMissing: missingSkills,
      coveragePercentage,
      targetTeamSize: maxTeamSize,
      actualTeamSize: selectedMembers.length,
      approximationGuarantee: `Theoretical approximation ratio is H(|U|) = ln(${totalRequired}) + 1 ≈ ${(Math.log(Math.max(1, totalRequired)) + 1).toFixed(2)}. Provides an efficient near-optimal team for NP-hard Set Cover problem.`,
      executionTimeMs,
    };
  }
}
