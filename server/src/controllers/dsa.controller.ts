import { Request, Response } from 'express';
import { AhoCorasick } from '../algorithms/ahoCorasick';
import { KMP } from '../algorithms/kmp';
import { EditDistance } from '../algorithms/editDistance';
import { HungarianAlgorithm } from '../algorithms/hungarianAssignment';
import { GreedySetCoverTeam } from '../algorithms/setCoverTeam';
import { DSAMetricsTracker } from '../algorithms/metricsTracker';

export const runPlayground = async (req: Request, res: Response): Promise<void> => {
  try {
    const { algorithm, params } = req.body;

    if (!algorithm) {
      res.status(400).json({ error: 'Algorithm name is required' });
      return;
    }

    const startTime = performance.now();

    if (algorithm === 'aho-corasick') {
      const { patterns, text } = params || {};
      const patternList = Array.isArray(patterns) ? patterns : ['React', 'Python', 'TypeScript', 'Node.js', 'Docker'];
      const sampleText = text || 'We are looking for a developer with hands-on expertise in React, TypeScript, and Docker containerization.';

      const ac = new AhoCorasick();
      for (const p of patternList) {
        ac.addPattern(p, p);
      }
      ac.buildFailureLinks();

      const matches = ac.search(sampleText);
      const executionTimeMs = parseFloat((performance.now() - startTime).toFixed(3));

      await DSAMetricsTracker.recordMetric('Aho-Corasick', executionTimeMs, sampleText.length, patternList.length, 'Live playground execution');

      res.json({
        algorithm: 'Aho-Corasick Automaton',
        timeComplexity: 'O(N + Σ|P_i| + Z)',
        spaceComplexity: 'O(Σ|P_i| * |Alphabet|)',
        patterns: patternList,
        text: sampleText,
        matches,
        executionTimeMs,
      });
      return;
    }

    if (algorithm === 'kmp') {
      const { text, pattern } = params || {};
      const sampleText = text || 'The recruitment platform uses KMP for exact substring matching and pattern verification.';
      const samplePattern = pattern || 'KMP';

      const matchIndices = KMP.search(sampleText, samplePattern);
      const executionTimeMs = parseFloat((performance.now() - startTime).toFixed(3));

      await DSAMetricsTracker.recordMetric('KMP', executionTimeMs, sampleText.length, 1, 'Live playground execution');

      res.json({
        algorithm: 'Knuth-Morris-Pratt (KMP)',
        timeComplexity: 'O(N + M)',
        spaceComplexity: 'O(M) for LPS Array',
        pattern: samplePattern,
        text: sampleText,
        matchesFound: matchIndices.length,
        matchIndices,
        executionTimeMs,
      });
      return;
    }

    if (algorithm === 'edit-distance') {
      const { str1, str2 } = params || {};
      const s1 = str1 || 'Pyhton';
      const s2 = str2 || 'Python';

      const distance = EditDistance.calculate(s1, s2);
      const similarity = EditDistance.similarity(s1, s2);
      const executionTimeMs = parseFloat((performance.now() - startTime).toFixed(3));

      await DSAMetricsTracker.recordMetric('Levenshtein', executionTimeMs, s1.length * s2.length, 1, 'Live playground execution');

      res.json({
        algorithm: 'Levenshtein Edit Distance Dynamic Programming',
        timeComplexity: 'O(|S1| * |S2|)',
        spaceComplexity: 'O(|S1| * |S2|)',
        string1: s1,
        string2: s2,
        distance,
        similarityPercentage: parseFloat((similarity * 100).toFixed(1)),
        executionTimeMs,
      });
      return;
    }

    if (algorithm === 'hungarian') {
      const { matrix } = params || {};
      // Sample 3x3 compatibility score matrix
      const defaultRoles = [
        { id: '1', title: 'Frontend Lead', companyName: 'Google', requiredSkills: ['React'] },
        { id: '2', title: 'ML Specialist', companyName: 'OpenAI', requiredSkills: ['PyTorch'] },
        { id: '3', title: 'Security Engineer', companyName: 'Stripe', requiredSkills: ['Linux'] },
      ];
      const defaultCandidates = [
        { id: 'c1', name: 'Alice', skills: ['React', 'TypeScript'] },
        { id: 'c2', name: 'Bob', skills: ['PyTorch', 'Python'] },
        { id: 'c3', name: 'Dave', skills: ['Linux', 'Penetration Testing'] },
      ];

      const result = HungarianAlgorithm.optimizeAssignment(defaultRoles, defaultCandidates, (r, c) => {
        let score = 50;
        if (r.requiredSkills.some((sk: string) => c.skills.includes(sk))) score = 95;
        return { score, supportingSkills: r.requiredSkills };
      });

      await DSAMetricsTracker.recordMetric('HungarianMatching', result.executionTimeMs, 9, 3, 'Live playground execution');

      res.json({
        algorithmName: 'Hungarian Algorithm (Kuhn-Munkres)',
        timeComplexity: 'O(V^3)',
        spaceComplexity: 'O(V^2)',
        ...result,
      });
      return;
    }

    if (algorithm === 'set-cover') {
      const { requiredSkills, teamSize } = params || {};
      const targetUniverse = Array.isArray(requiredSkills) ? requiredSkills : ['React', 'Python', 'Docker', 'AWS', 'Kubernetes', 'Figma'];
      const candidatePool = [
        { id: '1', name: 'Candidate A', experienceYears: 5, skills: ['React', 'Docker'] },
        { id: '2', name: 'Candidate B', experienceYears: 4, skills: ['Python', 'AWS', 'Docker'] },
        { id: '3', name: 'Candidate C', experienceYears: 3, skills: ['Kubernetes', 'AWS'] },
        { id: '4', name: 'Candidate D', experienceYears: 5, skills: ['Figma', 'React'] },
      ];

      const result = GreedySetCoverTeam.formTeam(targetUniverse, candidatePool, teamSize || 3);

      await DSAMetricsTracker.recordMetric('GreedySetCover', result.executionTimeMs, targetUniverse.length, candidatePool.length, 'Live playground execution');

      res.json({
        algorithmName: 'Greedy Set Cover Approximation',
        timeComplexity: 'O(K * |C| * |U|)',
        spaceComplexity: 'O(|U| + |C|)',
        targetSkills: targetUniverse,
        ...result,
      });
      return;
    }

    res.status(400).json({ error: `Unknown algorithm '${algorithm}'` });
  } catch (err: any) {
    console.error('runPlayground error:', err);
    res.status(500).json({ error: 'Failed to execute algorithm playground' });
  }
};
