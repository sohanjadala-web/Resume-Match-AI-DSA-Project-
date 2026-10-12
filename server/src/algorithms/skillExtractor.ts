import { AhoCorasick } from './ahoCorasick';
import { EditDistance } from './editDistance';

export interface CanonicalSkillDefinition {
  id: string;
  name: string;
  category: string;
  aliases: string[];
}

export interface ExtractedSkillResult {
  skillId: string;
  canonicalName: string;
  category: string;
  matchedVia: 'EXACT_AHO_CORASICK' | 'ALIAS_MAPPING' | 'FUZZY_LEVENSHTEIN';
  confidence: number;
}

export class SkillExtractorEngine {
  private ahoCorasick: AhoCorasick;
  private skillsMap: Map<string, CanonicalSkillDefinition>; // skillId -> Skill
  private canonicalNameMap: Map<string, CanonicalSkillDefinition>; // lowercase name -> Skill
  private aliasMap: Map<string, string>; // lowercase alias -> skillId
  private allKnownNames: string[]; // for fuzzy matching

  constructor(skills: CanonicalSkillDefinition[]) {
    this.ahoCorasick = new AhoCorasick();
    this.skillsMap = new Map();
    this.canonicalNameMap = new Map();
    this.aliasMap = new Map();
    this.allKnownNames = [];

    this.initialize(skills);
  }

  private initialize(skills: CanonicalSkillDefinition[]): void {
    for (const skill of skills) {
      this.skillsMap.set(skill.id, skill);
      const lowerName = skill.name.toLowerCase();
      this.canonicalNameMap.set(lowerName, skill);
      this.allKnownNames.push(lowerName);

      // Add canonical name to Aho-Corasick
      this.ahoCorasick.addPattern(skill.name, skill.id);

      // Add aliases
      for (const alias of skill.aliases) {
        const lowerAlias = alias.toLowerCase();
        this.aliasMap.set(lowerAlias, skill.id);
        this.allKnownNames.push(lowerAlias);
        this.ahoCorasick.addPattern(alias, skill.id);
      }
    }

    this.ahoCorasick.buildFailureLinks();
  }

  /**
   * Tokenize text into words / clean tokens
   */
  public tokenize(text: string): string[] {
    return text
      .replace(/[^\w\+\#\.\-]/g, ' ') // keep +, #, ., - for C++, C#, .NET, Node.js
      .split(/\s+/)
      .filter((t) => t.trim().length > 1);
  }

  /**
   * Extract skills from a document or resume text using combined DSA approach:
   * 1. Aho-Corasick multi-pattern search with word boundary validation
   * 2. Direct alias hash table lookup
   * 3. Levenshtein fuzzy matching on individual tokens
   */
  public extractSkills(rawText: string): ExtractedSkillResult[] {
    const resultsMap = new Map<string, ExtractedSkillResult>();
    const textLower = ` ${rawText.toLowerCase()} `;

    // 1. Aho-Corasick search
    const matches = this.ahoCorasick.search(rawText);
    for (const m of matches) {
      const skill = this.skillsMap.get(m.canonicalId);
      if (!skill) continue;

      // Word boundary check to prevent substring false positives
      // e.g. "go" in "mango", "c" in "cat"
      const name = skill.name.toLowerCase();
      const pos = m.position - name.length + 1;
      if (pos >= 0) {
        const before = pos > 0 ? textLower[pos - 1] : ' ';
        const after = pos + name.length < textLower.length ? textLower[pos + name.length] : ' ';
        const isBoundary = /[\s,.;:\(\)\[\]\{\}\/]/.test(before) && /[\s,.;:\(\)\[\]\{\}\/]/.test(after);

        if (isBoundary || name.length > 3) {
          resultsMap.set(skill.id, {
            skillId: skill.id,
            canonicalName: skill.name,
            category: skill.category,
            matchedVia: 'EXACT_AHO_CORASICK',
            confidence: 1.0,
          });
        }
      }
    }

    // 2. Token-level analysis for short/special tokens (e.g. "C++", "C#", "Go", "AWS", "K8s")
    const tokens = this.tokenize(rawText);
    for (const token of tokens) {
      const lower = token.toLowerCase();

      // Check direct alias map
      if (this.aliasMap.has(lower)) {
        const skillId = this.aliasMap.get(lower)!;
        const skill = this.skillsMap.get(skillId)!;
        if (!resultsMap.has(skillId)) {
          resultsMap.set(skillId, {
            skillId: skill.id,
            canonicalName: skill.name,
            category: skill.category,
            matchedVia: 'ALIAS_MAPPING',
            confidence: 0.98,
          });
        }
      }

      // 3. Fuzzy Levenshtein match for longer tokens with typos (min length 4)
      if (token.length >= 4 && !resultsMap.has(token)) {
        const closest = EditDistance.findClosestMatch(lower, this.allKnownNames, 0.82);
        if (closest && closest.similarity < 1.0) {
          // Resolve which canonical skill this matched
          const matchedTarget = closest.match;
          let matchedSkillId = this.aliasMap.get(matchedTarget);
          if (!matchedSkillId) {
            const canonical = this.canonicalNameMap.get(matchedTarget);
            if (canonical) matchedSkillId = canonical.id;
          }

          if (matchedSkillId && !resultsMap.has(matchedSkillId)) {
            const skill = this.skillsMap.get(matchedSkillId)!;
            resultsMap.set(matchedSkillId, {
              skillId: skill.id,
              canonicalName: skill.name,
              category: skill.category,
              matchedVia: 'FUZZY_LEVENSHTEIN',
              confidence: parseFloat(closest.similarity.toFixed(2)),
            });
          }
        }
      }
    }

    return Array.from(resultsMap.values());
  }

  /**
   * Structure a parsed résumé text into sections
   */
  public parseResumeSections(text: string): {
    skillsText: string;
    experienceText: string;
    educationText: string;
    projectsText: string;
  } {
    const lines = text.split('\n');
    let currentSection = 'summary';

    let skillsText = '';
    let experienceText = '';
    let educationText = '';
    let projectsText = '';

    const sectionRegexes = {
      skills: /^(skills|technical skills|technologies|core competencies|tools)\b/i,
      experience: /^(experience|work experience|employment history|work history|professional experience)\b/i,
      education: /^(education|academic background|qualifications|academics)\b/i,
      projects: /^(projects|academic projects|key projects|personal projects)\b/i,
    };

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      if (sectionRegexes.skills.test(trimmed)) {
        currentSection = 'skills';
        continue;
      } else if (sectionRegexes.experience.test(trimmed)) {
        currentSection = 'experience';
        continue;
      } else if (sectionRegexes.education.test(trimmed)) {
        currentSection = 'education';
        continue;
      } else if (sectionRegexes.projects.test(trimmed)) {
        currentSection = 'projects';
        continue;
      }

      if (currentSection === 'skills') skillsText += trimmed + ' ';
      else if (currentSection === 'experience') experienceText += trimmed + '\n';
      else if (currentSection === 'education') educationText += trimmed + '\n';
      else if (currentSection === 'projects') projectsText += trimmed + '\n';
    }

    return { skillsText, experienceText, educationText, projectsText };
  }
}
