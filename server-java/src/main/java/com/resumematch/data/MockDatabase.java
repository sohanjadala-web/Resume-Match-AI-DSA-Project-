package com.resumematch.data;

import com.resumematch.algorithms.*;
import java.util.*;

/**
 * Pre-populated In-Memory Database with authentic Tech Skills, Roles, and Candidates.
 * Used for both the Java Console CLI and the REST API.
 */
public class MockDatabase {

    public static final List<SkillExtractorEngine.SkillDefinition> SKILLS = new ArrayList<>();
    public static final List<CompatibilityScorer.CandidateProfile> CANDIDATES = new ArrayList<>();
    public static final List<CompatibilityScorer.JobProfile> JOBS = new ArrayList<>();
    public static final List<GreedySetCoverTeam.CandidateInput> TEAM_CANDIDATE_POOL = new ArrayList<>();

    public static class UserAccount {
        public final String id;
        public final String email;
        public final String password;
        public final String role;
        public final String name;

        public UserAccount(String id, String email, String password, String role, String name) {
            this.id = id;
            this.email = email;
            this.password = password;
            this.role = role;
            this.name = name;
        }
    }

    public static final List<UserAccount> USERS = new ArrayList<>();

    static {
        initSkills();
        initCandidates();
        initJobs();
        initUsers();
    }

    private static void initSkills() {
        SKILLS.add(new SkillExtractorEngine.SkillDefinition("s1", "JavaScript", "Frontend", Arrays.asList("js", "es6", "vanilla js")));
        SKILLS.add(new SkillExtractorEngine.SkillDefinition("s2", "TypeScript", "Frontend", Arrays.asList("ts", "typescriptlang")));
        SKILLS.add(new SkillExtractorEngine.SkillDefinition("s3", "React", "Frontend", Arrays.asList("reactjs", "react.js", "react native")));
        SKILLS.add(new SkillExtractorEngine.SkillDefinition("s4", "Next.js", "Frontend", Arrays.asList("nextjs", "next")));
        SKILLS.add(new SkillExtractorEngine.SkillDefinition("s5", "Node.js", "Backend", Arrays.asList("nodejs", "node")));
        SKILLS.add(new SkillExtractorEngine.SkillDefinition("s6", "Python", "Backend", Arrays.asList("py", "python3")));
        SKILLS.add(new SkillExtractorEngine.SkillDefinition("s7", "Java", "Backend", Arrays.asList("core java", "java 17", "java 21", "java 25", "spring", "spring boot")));
        SKILLS.add(new SkillExtractorEngine.SkillDefinition("s8", "Go", "Backend", Arrays.asList("golang")));
        SKILLS.add(new SkillExtractorEngine.SkillDefinition("s9", "C++", "Backend", Arrays.asList("cpp", "c plus plus")));
        SKILLS.add(new SkillExtractorEngine.SkillDefinition("s10", "PostgreSQL", "Database", Arrays.asList("postgres", "psql")));
        SKILLS.add(new SkillExtractorEngine.SkillDefinition("s11", "MongoDB", "Database", Arrays.asList("mongo")));
        SKILLS.add(new SkillExtractorEngine.SkillDefinition("s12", "Redis", "Database", Arrays.asList("redis cache")));
        SKILLS.add(new SkillExtractorEngine.SkillDefinition("s13", "Docker", "DevOps", Arrays.asList("containers", "docker compose")));
        SKILLS.add(new SkillExtractorEngine.SkillDefinition("s14", "Kubernetes", "DevOps", Arrays.asList("k8s")));
        SKILLS.add(new SkillExtractorEngine.SkillDefinition("s15", "AWS", "DevOps", Arrays.asList("amazon web services", "ec2", "s3", "lambda")));
        SKILLS.add(new SkillExtractorEngine.SkillDefinition("s16", "PyTorch", "AI/ML", Arrays.asList("torch")));
        SKILLS.add(new SkillExtractorEngine.SkillDefinition("s17", "TensorFlow", "AI/ML", Arrays.asList("tf")));
        SKILLS.add(new SkillExtractorEngine.SkillDefinition("s18", "Machine Learning", "AI/ML", Arrays.asList("ml", "statistical learning")));
        SKILLS.add(new SkillExtractorEngine.SkillDefinition("s19", "NLP", "AI/ML", Arrays.asList("natural language processing", "llm", "transformers")));
    }

    private static void initCandidates() {
        // Alice - Senior Full Stack
        List<CompatibilityScorer.CandidateSkillInput> aliceSkills = Arrays.asList(
            new CompatibilityScorer.CandidateSkillInput("s1", "JavaScript", "EXPERT", 5.0),
            new CompatibilityScorer.CandidateSkillInput("s2", "TypeScript", "EXPERT", 4.5),
            new CompatibilityScorer.CandidateSkillInput("s3", "React", "EXPERT", 5.0),
            new CompatibilityScorer.CandidateSkillInput("s5", "Node.js", "ADVANCED", 4.0),
            new CompatibilityScorer.CandidateSkillInput("s10", "PostgreSQL", "ADVANCED", 4.0),
            new CompatibilityScorer.CandidateSkillInput("s13", "Docker", "INTERMEDIATE", 3.0),
            new CompatibilityScorer.CandidateSkillInput("s15", "AWS", "INTERMEDIATE", 2.5)
        );
        List<CompatibilityScorer.CandidateProjectInput> aliceProjects = Arrays.asList(
            new CompatibilityScorer.CandidateProjectInput("E-Commerce SaaS", "React, Node.js, PostgreSQL", "Built high-throughput payment platform processing 10k req/sec.")
        );
        List<CompatibilityScorer.CandidateEducationInput> aliceEdu = Arrays.asList(
            new CompatibilityScorer.CandidateEducationInput("Bachelor of Technology", "Computer Science")
        );
        CANDIDATES.add(new CompatibilityScorer.CandidateProfile(
            "cand-001", "Alice Chen", "Fintech", 5.5, aliceSkills, aliceProjects, aliceEdu
        ));
        TEAM_CANDIDATE_POOL.add(new GreedySetCoverTeam.CandidateInput(
            "cand-001", "Alice Chen", "Senior Full-Stack Engineer", 5,
            Arrays.asList("JavaScript", "TypeScript", "React", "Node.js", "PostgreSQL", "Docker", "AWS")
        ));

        // Bob - AI / ML Engineer
        List<CompatibilityScorer.CandidateSkillInput> bobSkills = Arrays.asList(
            new CompatibilityScorer.CandidateSkillInput("s6", "Python", "EXPERT", 4.0),
            new CompatibilityScorer.CandidateSkillInput("s16", "PyTorch", "ADVANCED", 3.5),
            new CompatibilityScorer.CandidateSkillInput("s18", "Machine Learning", "ADVANCED", 4.0),
            new CompatibilityScorer.CandidateSkillInput("s19", "NLP", "EXPERT", 3.5),
            new CompatibilityScorer.CandidateSkillInput("s13", "Docker", "INTERMEDIATE", 2.0)
        );
        List<CompatibilityScorer.CandidateProjectInput> bobProjects = Arrays.asList(
            new CompatibilityScorer.CandidateProjectInput("LLM Summarizer", "Python, PyTorch, NLP", "Trained domain transformer model with 92% ROUGE score.")
        );
        List<CompatibilityScorer.CandidateEducationInput> bobEdu = Arrays.asList(
            new CompatibilityScorer.CandidateEducationInput("Master of Science", "Artificial Intelligence")
        );
        CANDIDATES.add(new CompatibilityScorer.CandidateProfile(
            "cand-002", "Bob Martinez", "Artificial Intelligence", 4.0, bobSkills, bobProjects, bobEdu
        ));
        TEAM_CANDIDATE_POOL.add(new GreedySetCoverTeam.CandidateInput(
            "cand-002", "Bob Martinez", "AI/ML Research Engineer", 4,
            Arrays.asList("Python", "PyTorch", "Machine Learning", "NLP", "Docker")
        ));

        // Charlie - DevOps / Cloud Infrastructure
        List<CompatibilityScorer.CandidateSkillInput> charlieSkills = Arrays.asList(
            new CompatibilityScorer.CandidateSkillInput("s13", "Docker", "EXPERT", 5.0),
            new CompatibilityScorer.CandidateSkillInput("s14", "Kubernetes", "EXPERT", 4.5),
            new CompatibilityScorer.CandidateSkillInput("s15", "AWS", "EXPERT", 5.0),
            new CompatibilityScorer.CandidateSkillInput("s8", "Go", "ADVANCED", 3.5),
            new CompatibilityScorer.CandidateSkillInput("s12", "Redis", "ADVANCED", 3.0)
        );
        CANDIDATES.add(new CompatibilityScorer.CandidateProfile(
            "cand-003", "Charlie Kumar", "Cloud / Infrastructure", 5.0, charlieSkills, Collections.emptyList(),
            Arrays.asList(new CompatibilityScorer.CandidateEducationInput("B.Tech", "Information Technology"))
        ));
        TEAM_CANDIDATE_POOL.add(new GreedySetCoverTeam.CandidateInput(
            "cand-003", "Charlie Kumar", "Staff Cloud Architect", 5,
            Arrays.asList("Docker", "Kubernetes", "AWS", "Go", "Redis")
        ));

        // Diana - Backend Java Engineer
        List<CompatibilityScorer.CandidateSkillInput> dianaSkills = Arrays.asList(
            new CompatibilityScorer.CandidateSkillInput("s7", "Java", "EXPERT", 6.0),
            new CompatibilityScorer.CandidateSkillInput("s10", "PostgreSQL", "EXPERT", 5.0),
            new CompatibilityScorer.CandidateSkillInput("s12", "Redis", "ADVANCED", 4.0),
            new CompatibilityScorer.CandidateSkillInput("s13", "Docker", "INTERMEDIATE", 3.0)
        );
        CANDIDATES.add(new CompatibilityScorer.CandidateProfile(
            "cand-004", "Diana Prince", "Enterprise Systems", 6.0, dianaSkills, Collections.emptyList(),
            Arrays.asList(new CompatibilityScorer.CandidateEducationInput("Master of Computer Applications", "Computer Science"))
        ));
        TEAM_CANDIDATE_POOL.add(new GreedySetCoverTeam.CandidateInput(
            "cand-004", "Diana Prince", "Principal Java Backend Engineer", 6,
            Arrays.asList("Java", "PostgreSQL", "Redis", "Docker", "Kubernetes")
        ));
    }

    private static void initJobs() {
        JOBS.add(new CompatibilityScorer.JobProfile(
            "job-001",
            "Senior Full-Stack Engineer",
            "Fintech",
            4.0,
            "Bachelor degree in Computer Science",
            Arrays.asList(
                new CompatibilityScorer.JobRequiredSkillInput("s1", "JavaScript", 3.0),
                new CompatibilityScorer.JobRequiredSkillInput("s2", "TypeScript", 3.0),
                new CompatibilityScorer.JobRequiredSkillInput("s3", "React", 3.0),
                new CompatibilityScorer.JobRequiredSkillInput("s5", "Node.js", 3.0)
            ),
            Arrays.asList(
                new CompatibilityScorer.JobPreferredSkillInput("s10", "PostgreSQL"),
                new CompatibilityScorer.JobPreferredSkillInput("s13", "Docker")
            )
        ));

        JOBS.add(new CompatibilityScorer.JobProfile(
            "job-002",
            "AI & NLP Research Engineer",
            "Artificial Intelligence",
            3.0,
            "Master or Ph.D. in AI/ML",
            Arrays.asList(
                new CompatibilityScorer.JobRequiredSkillInput("s6", "Python", 3.0),
                new CompatibilityScorer.JobRequiredSkillInput("s16", "PyTorch", 2.0),
                new CompatibilityScorer.JobRequiredSkillInput("s19", "NLP", 2.0)
            ),
            Arrays.asList(
                new CompatibilityScorer.JobPreferredSkillInput("s18", "Machine Learning"),
                new CompatibilityScorer.JobPreferredSkillInput("s13", "Docker")
            )
        ));

        JOBS.add(new CompatibilityScorer.JobProfile(
            "job-003",
            "DevOps & Kubernetes Specialist",
            "Cloud / Infrastructure",
            4.0,
            "Bachelor in Engineering",
            Arrays.asList(
                new CompatibilityScorer.JobRequiredSkillInput("s13", "Docker", 3.0),
                new CompatibilityScorer.JobRequiredSkillInput("s14", "Kubernetes", 3.0),
                new CompatibilityScorer.JobRequiredSkillInput("s15", "AWS", 3.0)
            ),
            Arrays.asList(
                new CompatibilityScorer.JobPreferredSkillInput("s8", "Go")
            )
        ));

        JOBS.add(new CompatibilityScorer.JobProfile(
            "job-004",
            "Enterprise Backend Java Architect",
            "Enterprise Systems",
            5.0,
            "Bachelor or Master in Computer Science",
            Arrays.asList(
                new CompatibilityScorer.JobRequiredSkillInput("s7", "Java", 4.0),
                new CompatibilityScorer.JobRequiredSkillInput("s10", "PostgreSQL", 3.0)
            ),
            Arrays.asList(
                new CompatibilityScorer.JobPreferredSkillInput("s12", "Redis"),
                new CompatibilityScorer.JobPreferredSkillInput("s13", "Docker")
            )
        ));
    }

    private static void initUsers() {
        USERS.add(new UserAccount("u1", "alice.swe@resumematch.ai", "Password@123", "CANDIDATE", "Alice Chen"));
        USERS.add(new UserAccount("u2", "bob.aiml@resumematch.ai", "Password@123", "CANDIDATE", "Bob Martinez"));
        USERS.add(new UserAccount("u3", "recruiter.google@resumematch.ai", "Password@123", "RECRUITER", "Google Cloud Recruiter"));
        USERS.add(new UserAccount("u4", "admin@resumematch.ai", "AdminPass@2026", "ADMIN", "System Administrator"));
    }
}
