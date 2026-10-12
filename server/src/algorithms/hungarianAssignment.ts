/**
 * Hungarian Algorithm (Kuhn-Munkres) for Optimal Candidate-to-Role Assignment
 * Solves Maximum Weight Bipartite Matching.
 * Time Complexity: O(N^3)
 * Space Complexity: O(N^2)
 */

export interface CandidateItem {
  id: string;
  name: string;
  skills: string[];
}

export interface RoleItem {
  id: string;
  title: string;
  companyName: string;
  requiredSkills: string[];
}

export interface AssignmentEdge {
  roleId: string;
  roleTitle: string;
  candidateId: string;
  candidateName: string;
  compatibilityScore: number;
  supportingSkills: string[];
}

export interface AssignmentResultOutput {
  algorithm: 'HUNGARIAN_MAX_WEIGHT_BIPARTITE';
  assignments: AssignmentEdge[];
  unassignedCandidates: { id: string; name: string }[];
  unfilledRoles: { id: string; title: string }[];
  totalScore: number;
  averageScore: number;
  baselineGreedyScore: number;
  scoreImprovement: number;
  executionTimeMs: number;
}

export class HungarianAlgorithm {
  /**
   * Solves min-cost assignment on an N x N cost matrix using Kuhn-Munkres algorithm.
   * Returns matching: matching[row] = col
   */
  public static solveMinCost(costMatrix: number[][]): number[] {
    const n = costMatrix.length;
    if (n === 0) return [];

    const u = new Array<number>(n + 1).fill(0);
    const v = new Array<number>(n + 1).fill(0);
    const p = new Array<number>(n + 1).fill(0);
    const way = new Array<number>(n + 1).fill(0);

    for (let i = 1; i <= n; i++) {
      p[0] = i;
      let j0 = 0;
      const minv = new Array<number>(n + 1).fill(Infinity);
      const used = new Array<boolean>(n + 1).fill(false);

      do {
        used[j0] = true;
        const i0 = p[j0];
        let delta = Infinity;
        let j1 = 0;

        for (let j = 1; j <= n; j++) {
          if (!used[j]) {
            const cur = costMatrix[i0 - 1][j - 1] - u[i0] - v[j];
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

        for (let j = 0; j <= n; j++) {
          if (used[j]) {
            u[p[j]] += delta;
            v[j] -= delta;
          } else {
            minv[j] -= delta;
          }
        }
        j0 = j1;
      } while (p[j0] !== 0);

      do {
        const j1 = way[j0];
        p[j0] = p[j1];
        j0 = j1;
      } while (j0 !== 0);
    }

    const assignment = new Array<number>(n).fill(-1);
    for (let j = 1; j <= n; j++) {
      if (p[j] > 0) {
        assignment[p[j] - 1] = j - 1;
      }
    }
    return assignment;
  }

  /**
   * Optimize candidate-to-role assignment to maximize total compatibility score.
   */
  public static optimizeAssignment(
    roles: RoleItem[],
    candidates: CandidateItem[],
    scoreMatrixFn: (role: RoleItem, candidate: CandidateItem) => { score: number; supportingSkills: string[] }
  ): AssignmentResultOutput {
    const startTime = performance.now();

    const numRoles = roles.length;
    const numCandidates = candidates.length;

    if (numRoles === 0 || numCandidates === 0) {
      return {
        algorithm: 'HUNGARIAN_MAX_WEIGHT_BIPARTITE',
        assignments: [],
        unassignedCandidates: candidates.map(c => ({ id: c.id, name: c.name })),
        unfilledRoles: roles.map(r => ({ id: r.id, title: r.title })),
        totalScore: 0,
        averageScore: 0,
        baselineGreedyScore: 0,
        scoreImprovement: 0,
        executionTimeMs: 0,
      };
    }

    // Dimension N is max(numRoles, numCandidates)
    const n = Math.max(numRoles, numCandidates);

    // Compute raw compatibility scores (0 - 100)
    const rawScores: number[][] = Array.from({ length: n }, () => new Array<number>(n).fill(0));
    const supportingSkillsGrid: string[][][] = Array.from({ length: n }, () =>
      Array.from({ length: n }, () => [])
    );

    let maxScoreFound = 100;
    for (let i = 0; i < numRoles; i++) {
      for (let j = 0; j < numCandidates; j++) {
        const res = scoreMatrixFn(roles[i], candidates[j]);
        rawScores[i][j] = res.score;
        supportingSkillsGrid[i][j] = res.supportingSkills;
        if (res.score > maxScoreFound) maxScoreFound = res.score;
      }
    }

    // Baseline Greedy score for comparison
    let baselineGreedyScore = 0;
    const greedyChosenCandidates = new Set<number>();
    for (let i = 0; i < numRoles; i++) {
      let bestCand = -1;
      let bestS = -1;
      for (let j = 0; j < numCandidates; j++) {
        if (!greedyChosenCandidates.has(j) && rawScores[i][j] > bestS) {
          bestS = rawScores[i][j];
          bestCand = j;
        }
      }
      if (bestCand !== -1) {
        greedyChosenCandidates.add(bestCand);
        baselineGreedyScore += bestS;
      }
    }

    // Convert to Min-Cost Matrix for Hungarian: cost = (maxScoreFound - score)
    const costMatrix: number[][] = Array.from({ length: n }, () => new Array<number>(n).fill(0));
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i < numRoles && j < numCandidates) {
          costMatrix[i][j] = maxScoreFound - rawScores[i][j];
        } else {
          costMatrix[i][j] = maxScoreFound; // Dummy edge penalty
        }
      }
    }

    // Solve using Kuhn-Munkres algorithm
    const match = this.solveMinCost(costMatrix);

    const assignments: AssignmentEdge[] = [];
    const assignedCandidates = new Set<string>();
    const assignedRoles = new Set<string>();
    let totalScore = 0;

    for (let i = 0; i < numRoles; i++) {
      const j = match[i];
      if (j !== undefined && j < numCandidates) {
        const score = rawScores[i][j];
        assignments.push({
          roleId: roles[i].id,
          roleTitle: roles[i].title,
          candidateId: candidates[j].id,
          candidateName: candidates[j].name,
          compatibilityScore: score,
          supportingSkills: supportingSkillsGrid[i][j],
        });
        totalScore += score;
        assignedCandidates.add(candidates[j].id);
        assignedRoles.add(roles[i].id);
      }
    }

    const unassignedCandidates = candidates
      .filter(c => !assignedCandidates.has(c.id))
      .map(c => ({ id: c.id, name: c.name }));

    const unfilledRoles = roles
      .filter(r => !assignedRoles.has(r.id))
      .map(r => ({ id: r.id, title: r.title }));

    const endTime = performance.now();
    const executionTimeMs = parseFloat((endTime - startTime).toFixed(3));
    const averageScore = assignments.length > 0 ? parseFloat((totalScore / assignments.length).toFixed(1)) : 0;
    const scoreImprovement = parseFloat((totalScore - baselineGreedyScore).toFixed(1));

    return {
      algorithm: 'HUNGARIAN_MAX_WEIGHT_BIPARTITE',
      assignments,
      unassignedCandidates,
      unfilledRoles,
      totalScore: parseFloat(totalScore.toFixed(1)),
      averageScore,
      baselineGreedyScore: parseFloat(baselineGreedyScore.toFixed(1)),
      scoreImprovement,
      executionTimeMs,
    };
  }
}
