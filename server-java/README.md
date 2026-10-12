# ResumeMatch AI — Java Edition (DSA Recruitment Engine)

**ResumeMatch AI (Java Edition)** is the enterprise Java implementation of the DSA-powered recruitment and talent allocation platform. Built with **Java 25**, it features exact mathematical implementations of 6 core Data Structures & Algorithms, an interactive Console CLI workbench for academic viva/evaluations, and a lightweight REST API server compatible with the React frontend.

---

## 🌟 Core Data Structures & Algorithms (Viva Ready)

| Algorithm | Module / Role | Time Complexity | Space Complexity | Practical Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Aho-Corasick Automaton** | Résumé Keyword Extraction | $O(N + \Sigma\|P\| + Z)$ | $O(\Sigma\|P\| \times \|\Sigma\|)$ | Multi-pattern dictionary search scanning entire résumé for all technical skills & aliases in a single pass. |
| **Levenshtein Distance (DP)** | Fuzzy Typo Resolution | $O(N \times M)$ | $O(N \times M)$ | Dynamic programming similarity matrix resolving misspellings (e.g. `Pyhton` → `Python`, `Postgrez` → `PostgreSQL`). |
| **Knuth-Morris-Pratt (KMP)** | Exact Skill Verification | $O(N + M)$ | $O(M)$ | Linear-time pattern matching with precomputed Longest Proper Prefix-Suffix (LPS) array. |
| **Hungarian Algorithm (Kuhn-Munkres)** | Optimal Talent Allocation | $O(V^3)$ | $O(V^2)$ | Maximum Weight Bipartite Matching globally optimizing 1-to-1 candidate-to-role assignment. |
| **Greedy Set Cover Approximation** | Project Team Formation | $O(K \times \|C\| \times \|U\|)$ | $O(\|U\| + \|C\|)$ | Assembles minimal headcount team covering maximum required technical competencies ($H(\|U\|) = \ln\|U\| + 1$ guarantee). |
| **Multi-Factor Scorer & Tie-Breaker** | Candidate Ranking | $O(\|Req\| + \|Pref\|)$ | $O(1)$ | Weighted formula (50% Req, 20% Pref, 15% Exp, 10% Domain, 5% Edu) with 4-tier deterministic tie-breaker. |

---

## 🚀 Quick Start Guide

### 1. Interactive Console CLI (For College Viva & Demonstrations)
Run the 1-click batch script or run the Java command directly:

```bash
# Option A: 1-Click Script (Windows)
run-cli.bat

# Option B: Manual Command (Any OS)
javac -d bin -encoding UTF-8 src/main/java/com/resumematch/algorithms/*.java src/main/java/com/resumematch/data/*.java src/main/java/com/resumematch/cli/*.java src/main/java/com/resumematch/server/*.java src/main/java/com/resumematch/Main.java
java -cp bin com.resumematch.cli.DSACliApplication
```

**Features in the CLI Workbench:**
- Interactive menu to test any algorithm with custom inputs.
- Visual display of the Levenshtein Dynamic Programming state matrix $dp[i][j]$.
- Step-by-step trace of KMP LPS table generation.
- Real-time comparison between **Hungarian Algorithm** vs **Greedy Baseline** (demonstrating why Hungarian yields a globally optimal solution).
- Greedy Set Cover selection sequence showing marginal coverage gains step-by-step.
- Full hardware telemetry benchmark measured in microseconds via `System.nanoTime()`.

---

### 2. REST API Server (Connecting to React Frontend)
Run the 1-click batch script:

```bash
# Option A: 1-Click Script (Windows)
run-server.bat

# Option B: Manual Command (Any OS)
java -cp bin com.resumematch.Main --server
```

The server starts on `http://localhost:5000` and immediately serves the React client running on `http://localhost:5173`.

---

### 3. Spring Boot 3 & Maven Build (Optional)
If importing into IntelliJ IDEA, Eclipse, or VS Code as a Spring Boot Maven project:

```bash
mvn clean compile
mvn spring-boot:run
```

---

## 📚 Viva Questions & Answers Reference

### Q1: Why use Aho-Corasick instead of running multiple regexes or KMP searches?
> **Answer**: If we search for $K$ different skills in a document of length $N$, running KMP or standard string search for each skill takes $O(K \times N)$. Aho-Corasick constructs a trie with failure links in $O(\Sigma |P_i|)$ time once, and then processes the text in a single pass of $O(N + Z)$ time, where $Z$ is the count of matches. This is orders of magnitude faster when searching for hundreds of technical keywords.

### Q2: Why is Hungarian Algorithm preferable to a Greedy matching approach?
> **Answer**: The Greedy approach chooses the highest compatibility pair locally. However, this local decision can steal a candidate who is uniquely qualified for another role, leaving subsequent roles with very low or zero matches. The Hungarian Algorithm (Kuhn-Munkres) solves Maximum Weight Bipartite Matching in polynomial time $O(V^3)$ and is mathematically guaranteed to find the **global maximum** total compatibility score across all candidates and roles.

### Q3: Why is Set Cover an NP-hard problem, and what is the Greedy approximation guarantee?
> **Answer**: Minimum Set Cover is one of Karp's 21 NP-complete problems. Finding the absolute minimal team size is computationally intractable for large universes. Our Greedy Set Cover algorithm selects the candidate providing the maximum number of currently uncovered skills at each step, achieving an approximation ratio of $H(|U|) = \ln |U| + 1$. By Feige's theorem (1998), no polynomial-time algorithm can achieve a better approximation ratio unless $P = NP$.

### Q4: How is Levenshtein Distance calculated using Dynamic Programming?
> **Answer**: We define $dp[i][j]$ as the minimum number of insertions, deletions, or substitutions to transform substring $S_1[0..i-1]$ into $S_2[0..j-1]$.
> - If $S_1[i-1] == S_2[j-1]$, then $dp[i][j] = dp[i-1][j-1]$.
> - Otherwise, $dp[i][j] = 1 + \min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])$.
> The normalized similarity ratio is $( \max(|S_1|, |S_2|) - dp[m][n] ) / \max(|S_1|, |S_2|)$.
