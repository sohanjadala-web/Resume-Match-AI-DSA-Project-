# ResumeMatch AI — Résumé–Job Matching & Talent Marketplace Engine

**ResumeMatch AI** is a recruitment SaaS platform powered by verified Data Structures & Algorithms (DSA). It features three separate role-based portals (**Candidate**, **Recruiter**, and **Admin**) sharing a centralized backend, database, and DSA computation engine.

---

## 🌟 System Architecture & DSA Workflow

```mermaid
graph TD
    subgraph Client Portals
        CP[Candidate Portal]
        RP[Recruiter Portal]
        AP[Admin Portal]
        PG[DSA Interactive Playground]
    end

    subgraph Backend REST API
        Auth[JWT & RBAC Middleware]
        Parser[File Parser / Extraction Controller]
        Scorer[Compatibility Scorer Controller]
        Alloc[Hungarian Talent Allocation]
        Team[Set Cover Team Formation]
        AdminCtl[Admin Governance & Telemetry]
    end

    subgraph DSA Engine
        AC["Aho-Corasick Automaton<br/>O(N + Σ|P| + Z)"]
        ED["Levenshtein Distance<br/>O(|S1| * |S2|) DP"]
        KMP["Knuth-Morris-Pratt<br/>O(N + M)"]
        CS["Multi-Factor Scorer<br/>50% Req, 20% Pref, 15% Exp, 15% Other"]
        HA["Hungarian Matching<br/>O(V³) Kuhn-Munkres"]
        SC["Greedy Set Cover<br/>H(|U|) Approx"]
        Inst["DSAMetricsTracker<br/>Live Runtime Telemetry"]
    end

    subgraph Database
        DB[(Prisma ORM & SQLite / PostgreSQL)]
    end

    CP --> Auth
    RP --> Auth
    AP --> Auth
    PG --> Backend REST API

    Parser --> AC
    Parser --> ED
    Scorer --> CS
    Alloc --> HA
    Team --> SC

    AC --> Inst
    HA --> Inst
    SC --> Inst

    Backend REST API --> DB
    Inst --> DB
```

---

## 🚀 Key Features

### 1. Core Data Structures & Algorithms
- **Aho-Corasick Multi-Pattern Search**: Rapid multi-keyword scanning over résumé text to identify canonical skills and map aliases (`JS` → `JavaScript`, `ReactJS` → `React`, `Postgres` → `PostgreSQL`).
- **Levenshtein Edit Distance (DP)**: Dynamic programming similarity matrix for typo resolution in technical keywords (e.g., `Pyhton` → `Python`).
- **Knuth-Morris-Pratt (KMP)**: Exact pattern search with precomputed Longest Prefix Suffix (LPS) array.
- **Multi-Factor Compatibility Scorer**:
  - Required Skills Coverage: **50%**
  - Preferred Skills Coverage: **20%**
  - Relevant Years of Experience: **15%**
  - Domain & Project Relevance: **10%**
  - Job-Related Education & Qualifications: **5%**
  - *Deterministic Tie-Breaking* based on required-skill coverage ratio, relevant experience, and lexicographical candidate ID.
- **Hungarian Algorithm (Kuhn-Munkres)**: Solves Maximum Weight Bipartite Matching in $O(V^3)$ for the **Talent Allocation** module, optimizing global candidate-to-role compatibility.
- **Greedy Set Cover Approximation**: Solves Project Team Formation under headcount constraints, selecting minimal candidates to maximize required skill coverage ($H(|U|) = \ln |U| + 1$ guarantee).
- **DSA Telemetry & Instrumentation**: Hardware runtime measurements recorded to the database using `performance.now()`.

---

## 👥 Role-Based Portals

### 1. Candidate Portal
- **Dashboard**: Profile completion meter, market skill demand suggestions, applications pipeline funnel.
- **Résumé Parser**: Upload PDF/DOCX or paste text. Aho-Corasick & Levenshtein extract skills into an editable review form before committing to profile.
- **Job Recommendations**: Compatibility score badges, matched vs missing skills, and "Why This Job Matches You" modal breakdown.
- **Application History**: Complete hiring timeline (`Applied` → `Under Review` → `Shortlisted` → `Interview Scheduled` → `Selected`/`Rejected`) with video interview links.

### 2. Recruiter Portal
- **Dashboard & Job Postings**: Post, pause, reopen, or archive jobs with required and preferred skills.
- **Ranked Candidate Search**: Candidates ranked by compatibility score with deterministic tie-breaking.
- **Side-by-Side Comparison**: Compare 2 to 5 candidates across required skills, experience, and status.
- **Talent Allocation (Hungarian)**: Optimal one-to-one candidate-to-role assignment maximizing global compatibility score.
- **Project Team Formation**: Greedy Set Cover algorithm to assemble project teams covering required technical competencies.

### 3. Admin Portal
- **Platform Overview**: Real database statistics and Recharts analytics (conversion funnel, domain distribution, popular skills).
- **User Management**: Inspect and activate/deactivate candidate and recruiter accounts.
- **Job Management**: Audit postings and enforce platform compliance.
- **DSA Insights & Telemetry**: Execution counts, average latencies, and theoretical vs measured complexity table.
- **Audit Logs**: Immutable event trail recording actor, action, timestamp, and metadata.

### 4. Interactive DSA Playground (`/playground`)
- Interactive workbench allowing anyone to test Aho-Corasick, KMP, Levenshtein, Hungarian Matching, and Greedy Set Cover live with custom input!

---

## 🔑 Demo Access Credentials

The platform includes convenient **1-Click Demo Buttons** on the Login page:

| Portal | Demo Email | Password | Role |
| :--- | :--- | :--- | :--- |
| **Candidate** | `alice.swe@resumematch.ai` | `Password@123` | Senior Full-Stack Engineer |
| **Candidate** | `bob.aiml@resumematch.ai` | `Password@123` | AI/ML Research Engineer |
| **Recruiter** | `recruiter.google@resumematch.ai` | `Password@123` | Google Cloud Platform Recruiter |
| **Recruiter** | `recruiter.ai@resumematch.ai` | `Password@123` | OpenAI Labs Recruiter |
| **Admin** | `admin@resumematch.ai` | `AdminPass@2026` | System Administrator |

---

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### 1. Backend Setup
```bash
cd server
npm install
npx prisma generate
npx prisma db push
npx tsx src/seed/seed.ts
npm run dev
```
The backend starts on `http://localhost:5000`.

### 2. Frontend Setup
```bash
cd client
npm install
npm run dev
```
The frontend starts on `http://localhost:5173`.

### 3. Running Unit Tests
```bash
cd server
npm test
```
Executes all Vitest tests covering Aho-Corasick, KMP, Levenshtein, CompatibilityScorer, Hungarian Bipartite Matching, and Greedy Set Cover.

---

## 📡 REST API Reference

### Authentication
- `POST /api/auth/register` — Register new Candidate or Recruiter
- `POST /api/auth/login` — Login with credentials (sets HTTP-only cookie & returns JWT)
- `POST /api/auth/logout` — Logout session
- `GET /api/auth/me` — Retrieve active session profile

### Candidate
- `GET /api/candidate/profile` — Fetch candidate profile and skills
- `PUT /api/candidate/profile` — Update candidate profile details
- `PUT /api/candidate/skills` — Update skills inventory
- `POST /api/candidate/resume` — Parse PDF/DOCX or text via Aho-Corasick & Levenshtein
- `GET /api/candidate/recommendations` — Scored job recommendations with breakdown
- `GET /api/candidate/applications` — Applications history with status timeline
- `POST /api/candidate/jobs/:jobId/apply` — Apply for job (prevents duplicates)
- `POST /api/candidate/jobs/:jobId/save` — Save job bookmark
- `GET /api/candidate/analytics` — Pipeline funnel and market skills demand

### Recruiter
- `GET /api/recruiter/jobs` — Recruiter jobs with applicant statistics
- `POST /api/recruiter/jobs` — Create new job posting
- `PUT /api/recruiter/jobs/:jobId` — Update job details or status
- `GET /api/recruiter/jobs/:jobId/candidates` — Ranked eligible candidates with tie-breaking
- `PATCH /api/recruiter/applications/:id/status` — Update application status
- `POST /api/recruiter/applications/:id/interview` — Schedule candidate interview
- `POST /api/recruiter/assignments/optimize` — Run Hungarian Bipartite Matching
- `POST /api/recruiter/teams/recommend` — Run Greedy Set Cover Team Formation

### Admin
- `GET /api/admin/analytics` — Real database overview metrics & distribution
- `GET /api/admin/users` — Search and inspect platform users
- `PATCH /api/admin/users/:id/status` — Activate or deactivate account
- `GET /api/admin/jobs` — Platform jobs audit
- `GET /api/admin/algorithm-metrics` — Instrumented algorithm execution runtimes
- `GET /api/admin/audit-logs` — Immutable audit trail

### DSA Interactive Playground
- `POST /api/dsa/playground/run` — Run any algorithm on custom input and return measured latency
