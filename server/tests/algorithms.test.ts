import { describe, it, expect } from 'vitest';
import { AhoCorasick } from '../src/algorithms/ahoCorasick';
import { KMP } from '../src/algorithms/kmp';
import { EditDistance } from '../src/algorithms/editDistance';
import { SkillExtractorEngine } from '../src/algorithms/skillExtractor';
import { CompatibilityScorer } from '../src/algorithms/compatibilityScorer';
import { HungarianAlgorithm } from '../src/algorithms/hungarianAssignment';
import { GreedySetCoverTeam } from '../src/algorithms/setCoverTeam';

describe('DSA Modules Testing', () => {
  it('Aho-Corasick multi-pattern search detects multiple patterns', () => {
    const ac = new AhoCorasick();
    ac.addPattern('react', 'react-id');
    ac.addPattern('reactjs', 'react-id');
    ac.addPattern('typescript', 'ts-id');
    ac.addPattern('node', 'node-id');
    ac.buildFailureLinks();

    const matches = ac.search('I have built applications with React and TypeScript and Node.');
    const foundIds = new Set(matches.map(m => m.canonicalId));

    expect(foundIds.has('react-id')).toBe(true);
    expect(foundIds.has('ts-id')).toBe(true);
    expect(foundIds.has('node-id')).toBe(true);
  });

  it('KMP exact pattern search computes LPS and matches indices', () => {
    const text = 'Senior Full Stack Engineer with React experience';
    const pattern = 'React';
    const indices = KMP.search(text, pattern);
    expect(indices.length).toBe(1);
    expect(KMP.contains(text, 'Full Stack')).toBe(true);
    expect(KMP.contains(text, 'Python')).toBe(false);
  });

  it('Levenshtein distance detects typos and computes similarity', () => {
    const dist = EditDistance.calculate('Pyhton', 'Python');
    expect(dist).toBe(2); // transpose/substitute
    const sim = EditDistance.similarity('Pyhton', 'Python');
    expect(sim).toBeGreaterThan(0.65);

    const match = EditDistance.findClosestMatch('Postgresql', ['MongoDB', 'PostgreSQL', 'Redis'], 0.8);
    expect(match?.match).toBe('PostgreSQL');
  });

  it('SkillExtractorEngine normalizes aliases and fuzzy matches', () => {
    const engine = new SkillExtractorEngine([
      { id: '1', name: 'JavaScript', category: 'Frontend', aliases: ['js', 'es6', 'ecmascript'] },
      { id: '2', name: 'React', category: 'Frontend', aliases: ['reactjs', 'react.js'] },
      { id: '3', name: 'PostgreSQL', category: 'Database', aliases: ['postgres', 'psql'] },
      { id: '4', name: 'Python', category: 'Backend', aliases: ['py'] },
    ]);

    const extracted = engine.extractSkills('Experienced with JS, React.js, and Postgres databases. Also know Pyhton.');
    const names = extracted.map(e => e.canonicalName);

    expect(names).toContain('JavaScript');
    expect(names).toContain('React');
    expect(names).toContain('PostgreSQL');
    expect(names).toContain('Python');
  });

  it('CompatibilityScorer calculates multi-factor score and tie-breaks correctly', () => {
    const candidate = {
      candidateId: 'cand-1',
      name: 'Alice Dev',
      preferredDomain: 'Software Engineering',
      yearsOfExperience: 4,
      skills: [
        { skillId: 's1', name: 'React', proficiencyLevel: 'Advanced', yearsOfExperience: 3 },
        { skillId: 's2', name: 'Node.js', proficiencyLevel: 'Intermediate', yearsOfExperience: 2 },
      ],
      projects: [{ title: 'E-commerce', technologies: 'React, Node.js', description: 'Web app' }],
      education: [{ degree: 'B.Tech in Computer Science' }],
    };

    const job = {
      jobId: 'job-1',
      title: 'Frontend Developer',
      domain: 'Software Engineering',
      minExperienceYears: 3,
      educationRequired: 'Bachelor',
      requiredSkills: [{ skillId: 's1', name: 'React', minExpYears: 2 }],
      preferredSkills: [{ skillId: 's2', name: 'Node.js' }],
    };

    const result = CompatibilityScorer.calculate(candidate, job);
    expect(result.totalScore).toBeGreaterThan(80);
    expect(result.isFullyQualified).toBe(true);
    expect(result.missingRequiredSkills.length).toBe(0);

    // Test tie-breaking
    const candA = { score: 85, reqCoverage: 1.0, experienceYears: 5, candidateId: 'a' };
    const candB = { score: 85, reqCoverage: 0.8, experienceYears: 6, candidateId: 'b' };
    expect(CompatibilityScorer.compareCandidates(candA, candB)).toBeLessThan(0); // candA ranks higher due to higher reqCoverage
  });

  it('Hungarian algorithm solves optimal bipartite matching', () => {
    const roles = [
      { id: 'r1', title: 'React Lead', companyName: 'Acme', requiredSkills: ['React'] },
      { id: 'r2', title: 'Backend Lead', companyName: 'Acme', requiredSkills: ['Node.js'] },
    ];
    const candidates = [
      { id: 'c1', name: 'Bob', skills: ['React'] },
      { id: 'c2', name: 'Charlie', skills: ['Node.js'] },
    ];

    const res = HungarianAlgorithm.optimizeAssignment(roles, candidates, (r, c) => {
      const match = r.requiredSkills[0] === c.skills[0];
      return { score: match ? 95 : 30, supportingSkills: match ? [r.requiredSkills[0]] : [] };
    });

    expect(res.assignments.length).toBe(2);
    expect(res.totalScore).toBe(190);
    expect(res.assignments.find(a => a.roleId === 'r1')?.candidateName).toBe('Bob');
    expect(res.assignments.find(a => a.roleId === 'r2')?.candidateName).toBe('Charlie');
  });

  it('GreedySetCoverTeam selects minimal team covering target skills', () => {
    const requiredSkills = ['React', 'Python', 'Docker', 'AWS'];
    const candidates = [
      { id: 'c1', name: 'Alice', experienceYears: 5, skills: ['React', 'Python'] },
      { id: 'c2', name: 'Bob', experienceYears: 4, skills: ['Docker', 'AWS'] },
      { id: 'c3', name: 'Carol', experienceYears: 2, skills: ['Python'] },
    ];

    const result = GreedySetCoverTeam.formTeam(requiredSkills, candidates, 3);
    expect(result.coveragePercentage).toBe(100);
    expect(result.actualTeamSize).toBe(2); // c1 and c2 cover all 4
    expect(result.skillsMissing.length).toBe(0);
  });
});
