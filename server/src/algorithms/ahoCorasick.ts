/**
 * Aho-Corasick Multi-Pattern String Matching Algorithm
 * Time Complexity:
 *   Construction: O(Σ |P_i|) where P_i are the skill patterns
 *   Search: O(N + Z) where N is text length, Z is count of matches
 * Space Complexity: O(Σ |P_i| * |Alphabet|)
 */

export interface TrieNode {
  children: Map<string, TrieNode>;
  fail: TrieNode | null;
  output: string[]; // matched canonical skill names or ids
  isEndOfWord: boolean;
}

export class AhoCorasick {
  private root: TrieNode;

  constructor() {
    this.root = this.createNode();
  }

  private createNode(): TrieNode {
    return {
      children: new Map(),
      fail: null,
      output: [],
      isEndOfWord: false
    };
  }

  /**
   * Add a pattern (e.g. skill alias or canonical name) mapped to a canonical skill ID
   */
  public addPattern(pattern: string, canonicalId: string): void {
    const normalized = pattern.trim().toLowerCase();
    if (!normalized) return;

    let current = this.root;
    for (const char of normalized) {
      if (!current.children.has(char)) {
        current.children.set(char, this.createNode());
      }
      current = current.children.get(char)!;
    }
    current.isEndOfWord = true;
    if (!current.output.includes(canonicalId)) {
      current.output.push(canonicalId);
    }
  }

  /**
   * Build failure links using BFS
   */
  public buildFailureLinks(): void {
    const queue: TrieNode[] = [];

    // Root children fail links point to root
    for (const [, child] of this.root.children) {
      child.fail = this.root;
      queue.push(child);
    }

    while (queue.length > 0) {
      const current = queue.shift()!;

      for (const [char, child] of current.children) {
        let failCandidate = current.fail;

        while (failCandidate !== null && !failCandidate.children.has(char)) {
          failCandidate = failCandidate.fail;
        }

        child.fail = failCandidate ? failCandidate.children.get(char)! : this.root;
        
        // Merge output links from the failure state
        if (child.fail && child.fail.output.length > 0) {
          for (const out of child.fail.output) {
            if (!child.output.includes(out)) {
              child.output.push(out);
            }
          }
        }

        queue.push(child);
      }
    }
  }

  /**
   * Search input text and return set of matched canonical IDs with positions
   */
  public search(text: string): { canonicalId: string; position: number }[] {
    const normalized = text.toLowerCase();
    const matches: { canonicalId: string; position: number }[] = [];
    let current = this.root;

    for (let i = 0; i < normalized.length; i++) {
      const char = normalized[i];

      while (current !== this.root && !current.children.has(char)) {
        current = current.fail || this.root;
      }

      if (current.children.has(char)) {
        current = current.children.get(char)!;
      } else {
        current = this.root;
      }

      if (current.output.length > 0) {
        // Boundary check helper: ensure matched word is a discrete token or technology keyword
        for (const id of current.output) {
          matches.push({ canonicalId: id, position: i });
        }
      }
    }

    return matches;
  }
}
