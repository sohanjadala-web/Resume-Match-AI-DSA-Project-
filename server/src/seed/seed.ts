import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed for ResumeMatch AI...');

  // Clean existing tables in proper order
  await prisma.algorithmMetric.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.assignmentResult.deleteMany();
  await prisma.assignmentRun.deleteMany();
  await prisma.teamRecommendation.deleteMany();
  await prisma.teamProjectRequiredSkill.deleteMany();
  await prisma.teamProject.deleteMany();
  await prisma.recruiterNote.deleteMany();
  await prisma.interview.deleteMany();
  await prisma.applicationStatusHistory.deleteMany();
  await prisma.application.deleteMany();
  await prisma.savedJob.deleteMany();
  await prisma.jobPreferredSkill.deleteMany();
  await prisma.jobRequiredSkill.deleteMany();
  await prisma.job.deleteMany();
  await prisma.resume.deleteMany();
  await prisma.candidateCertification.deleteMany();
  await prisma.candidateProject.deleteMany();
  await prisma.candidateEducation.deleteMany();
  await prisma.candidateExperience.deleteMany();
  await prisma.candidateSkill.deleteMany();
  await prisma.skillAlias.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.recruiterProfile.deleteMany();
  await prisma.company.deleteMany();
  await prisma.candidateProfile.deleteMany();
  await prisma.user.deleteMany();

  console.log('✓ Cleared previous database state.');

  // 1. SEED SKILLS AND ALIASES
  const skillDefinitions = [
    // Frontend
    { name: 'JavaScript', category: 'Frontend', aliases: ['js', 'es6', 'ecmascript', 'vanilla js'] },
    { name: 'TypeScript', category: 'Frontend', aliases: ['ts', 'typescriptlang'] },
    { name: 'React', category: 'Frontend', aliases: ['reactjs', 'react.js', 'react native'] },
    { name: 'Next.js', category: 'Frontend', aliases: ['nextjs', 'next'] },
    { name: 'Vue.js', category: 'Frontend', aliases: ['vue', 'vuejs'] },
    { name: 'Tailwind CSS', category: 'Frontend', aliases: ['tailwind', 'tailwindcss'] },
    { name: 'HTML5/CSS3', category: 'Frontend', aliases: ['html', 'css', 'html5', 'css3'] },

    // Backend
    { name: 'Node.js', category: 'Backend', aliases: ['nodejs', 'node'] },
    { name: 'Python', category: 'Backend', aliases: ['py', 'python3'] },
    { name: 'Go', category: 'Backend', aliases: ['golang'] },
    { name: 'Java', category: 'Backend', aliases: ['core java', 'java 17', 'java 21'] },
    { name: 'C++', category: 'Backend', aliases: ['cpp', 'c plus plus'] },
    { name: 'FastAPI', category: 'Backend', aliases: ['fast api'] },
    { name: 'Express.js', category: 'Backend', aliases: ['express', 'expressjs'] },
    { name: 'Django', category: 'Backend', aliases: ['django rest framework', 'drf'] },

    // Database
    { name: 'PostgreSQL', category: 'Database', aliases: ['postgres', 'psql'] },
    { name: 'MongoDB', category: 'Database', aliases: ['mongo'] },
    { name: 'Redis', category: 'Database', aliases: ['redis cache'] },
    { name: 'SQL', category: 'Database', aliases: ['rdbms', 'mysql'] },

    // Cloud & DevOps
    { name: 'Docker', category: 'DevOps', aliases: ['containers', 'docker compose'] },
    { name: 'Kubernetes', category: 'DevOps', aliases: ['k8s'] },
    { name: 'AWS', category: 'DevOps', aliases: ['amazon web services', 'ec2', 's3', 'lambda'] },
    { name: 'CI/CD', category: 'DevOps', aliases: ['continuous integration', 'github actions', 'jenkins'] },
    { name: 'Terraform', category: 'DevOps', aliases: ['iac', 'infrastructure as code'] },

    // AI & Data Science
    { name: 'PyTorch', category: 'AI/ML', aliases: ['torch'] },
    { name: 'TensorFlow', category: 'AI/ML', aliases: ['tf'] },
    { name: 'Machine Learning', category: 'AI/ML', aliases: ['ml', 'statistical learning'] },
    { name: 'Deep Learning', category: 'AI/ML', aliases: ['neural networks', 'dl'] },
    { name: 'NLP', category: 'AI/ML', aliases: ['natural language processing', 'llm', 'transformers'] },
    { name: 'Pandas', category: 'AI/ML', aliases: ['pandas library'] },
    { name: 'Scikit-Learn', category: 'AI/ML', aliases: ['sklearn'] },

    // Cybersecurity
    { name: 'Penetration Testing', category: 'Security', aliases: ['pen testing', 'ethical hacking'] },
    { name: 'Cryptography', category: 'Security', aliases: ['crypto', 'encryption', 'pki'] },
    { name: 'Network Security', category: 'Security', aliases: ['firewalls', 'siem', 'ids/ips'] },
    { name: 'Linux', category: 'Security', aliases: ['unix', 'ubuntu', 'kali linux'] },

    // UI/UX & Design
    { name: 'Figma', category: 'Design', aliases: ['figma app', 'figma design'] },
    { name: 'UI/UX Design', category: 'Design', aliases: ['user interface', 'user experience', 'wireframing'] },
    { name: 'Design Systems', category: 'Design', aliases: ['component library', 'storybook'] },
  ];

  const skillRecordMap = new Map<string, string>(); // name -> id

  for (const s of skillDefinitions) {
    const createdSkill = await prisma.skill.create({
      data: {
        name: s.name,
        category: s.category,
      },
    });
    skillRecordMap.set(s.name, createdSkill.id);

    for (const alias of s.aliases) {
      await prisma.skillAlias.create({
        data: {
          skillId: createdSkill.id,
          alias: alias.toLowerCase(),
        },
      });
    }
  }

  console.log(`✓ Seeded ${skillDefinitions.length} canonical skills and aliases.`);

  // 2. SEED COMPANIES
  const companiesData = [
    {
      name: 'Google Cloud Platform',
      industry: 'Cloud Computing & Enterprise AI',
      description: 'Leading global cloud computing services and AI infrastructure solutions.',
      location: 'Mountain View, CA & Remote',
      website: 'https://cloud.google.com',
    },
    {
      name: 'Stripe Payments',
      industry: 'Financial Technology',
      description: 'Financial infrastructure platform for millions of internet businesses worldwide.',
      location: 'San Francisco, CA & Hybrid',
      website: 'https://stripe.com',
    },
    {
      name: 'OpenAI Labs',
      industry: 'Artificial Intelligence',
      description: 'Pioneering safe, beneficial artificial general intelligence and LLM technologies.',
      location: 'San Francisco, CA & Hybrid',
      website: 'https://openai.com',
    },
    {
      name: 'Datadog Observability',
      industry: 'Cloud Monitoring & Security',
      description: 'Observability and security service for cloud-scale applications.',
      location: 'New York, NY & Remote',
      website: 'https://datadoghq.com',
    },
  ];

  const companyMap = new Map<string, string>();
  for (const c of companiesData) {
    const created = await prisma.company.create({ data: c });
    companyMap.set(c.name, created.id);
  }

  // 3. SEED USERS & ROLES
  const defaultPassword = await bcrypt.hash('Password@123', 10);
  const adminPassword = await bcrypt.hash('AdminPass@2026', 10);

  // Admin User
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@resumematch.ai',
      passwordHash: adminPassword,
      role: 'ADMIN',
      fullName: 'System Administrator',
      phone: '+1 (555) 019-2831',
    },
  });

  // Recruiters
  const recruiter1 = await prisma.user.create({
    data: {
      email: 'recruiter.google@resumematch.ai',
      passwordHash: defaultPassword,
      role: 'RECRUITER',
      fullName: 'Sarah Jenkins',
      phone: '+1 (555) 234-5678',
      recruiterProfile: {
        create: {
          companyId: companyMap.get('Google Cloud Platform'),
          title: 'Principal Technical Recruiter',
        },
      },
    },
    include: { recruiterProfile: true },
  });

  const recruiter2 = await prisma.user.create({
    data: {
      email: 'recruiter.ai@resumematch.ai',
      passwordHash: defaultPassword,
      role: 'RECRUITER',
      fullName: 'Marcus Vance',
      phone: '+1 (555) 345-6789',
      recruiterProfile: {
        create: {
          companyId: companyMap.get('OpenAI Labs'),
          title: 'Head of AI Talent Acquisition',
        },
      },
    },
    include: { recruiterProfile: true },
  });

  const recruiter3 = await prisma.user.create({
    data: {
      email: 'recruiter.stripe@resumematch.ai',
      passwordHash: defaultPassword,
      role: 'RECRUITER',
      fullName: 'Priya Sharma',
      phone: '+1 (555) 456-7890',
      recruiterProfile: {
        create: {
          companyId: companyMap.get('Stripe Payments'),
          title: 'Senior Engineering Recruiter',
        },
      },
    },
    include: { recruiterProfile: true },
  });

  console.log('✓ Seeded Admin and 3 Recruiter accounts.');

  // Candidates across 5 domains
  const candidatesData = [
    {
      email: 'alice.swe@resumematch.ai',
      fullName: 'Alice Chen',
      headline: 'Senior Full Stack Software Engineer | React, TypeScript, Node.js',
      careerObjective: 'Passionate about building scalable distributed web applications with elegant user interfaces.',
      preferredDomain: 'Software Engineering',
      yearsOfExperience: 5.5,
      location: 'San Francisco, CA',
      preferredWorkMode: 'Remote',
      employmentType: 'Full-time',
      expectedSalaryMin: 140000,
      expectedSalaryMax: 175000,
      availabilityNotice: 'Immediate',
      portfolioUrl: 'https://alicechen.dev',
      githubUrl: 'https://github.com/alicechen',
      linkedinUrl: 'https://linkedin.com/in/alicechen',
      skills: [
        { name: 'JavaScript', level: 'Expert', years: 5.5 },
        { name: 'TypeScript', level: 'Expert', years: 4.0 },
        { name: 'React', level: 'Expert', years: 5.0 },
        { name: 'Node.js', level: 'Advanced', years: 4.0 },
        { name: 'PostgreSQL', level: 'Advanced', years: 3.5 },
        { name: 'Docker', level: 'Intermediate', years: 2.5 },
        { name: 'Next.js', level: 'Advanced', years: 3.0 },
      ],
      experience: [
        {
          jobTitle: 'Senior Frontend Engineer',
          companyName: 'Vercel Ecosystem Partner',
          startDate: new Date('2022-01-15'),
          isCurrent: true,
          description: 'Architected micro-frontends serving 2M+ monthly active users with React and Next.js.',
          technologiesUsed: 'React, TypeScript, Next.js, GraphQL, Tailwind CSS',
        },
        {
          jobTitle: 'Software Engineer',
          companyName: 'CloudScale Inc',
          startDate: new Date('2019-06-01'),
          endDate: new Date('2021-12-31'),
          isCurrent: false,
          description: 'Developed scalable REST APIs and client dashboards using Node.js and PostgreSQL.',
          technologiesUsed: 'Node.js, Express, PostgreSQL, Docker',
        },
      ],
      education: [
        {
          institution: 'University of California, Berkeley',
          degree: 'B.S. in Computer Science',
          fieldOfStudy: 'Computer Science',
          startYear: 2015,
          endYear: 2019,
          grade: '3.9 GPA',
        },
      ],
      projects: [
        {
          title: 'High-Throughput Collaborative Canvas',
          description: 'Real-time collaborative drawing canvas using WebSockets, React, and CRDT data structures.',
          technologies: 'React, TypeScript, Node.js, WebSockets',
          githubUrl: 'https://github.com/alicechen/collab-canvas',
        },
      ],
    },
    {
      email: 'bob.aiml@resumematch.ai',
      fullName: 'Dr. Robert Patel',
      headline: 'Machine Learning Research Engineer | LLMs, PyTorch, Deep Learning',
      careerObjective: 'Advancing state-of-the-art foundation models and generative AI systems.',
      preferredDomain: 'AI/ML',
      yearsOfExperience: 4.0,
      location: 'New York, NY',
      preferredWorkMode: 'Hybrid',
      employmentType: 'Full-time',
      expectedSalaryMin: 160000,
      expectedSalaryMax: 210000,
      availabilityNotice: '15 Days',
      githubUrl: 'https://github.com/rpatel-ai',
      skills: [
        { name: 'Python', level: 'Expert', years: 6.0 },
        { name: 'PyTorch', level: 'Expert', years: 4.0 },
        { name: 'TensorFlow', level: 'Advanced', years: 3.0 },
        { name: 'Machine Learning', level: 'Expert', years: 5.0 },
        { name: 'Deep Learning', level: 'Expert', years: 4.0 },
        { name: 'NLP', level: 'Expert', years: 4.0 },
        { name: 'Docker', level: 'Intermediate', years: 2.0 },
      ],
      experience: [
        {
          jobTitle: 'AI Research Scientist',
          companyName: 'NeuralVision Labs',
          startDate: new Date('2021-03-01'),
          isCurrent: true,
          description: 'Trained transformer architectures and multi-modal neural models on GPU clusters.',
          technologiesUsed: 'Python, PyTorch, CUDA, Transformers, MLflow',
        },
      ],
      education: [
        {
          institution: 'Carnegie Mellon University',
          degree: 'M.S. in Machine Learning',
          fieldOfStudy: 'Artificial Intelligence',
          startYear: 2018,
          endYear: 2020,
        },
      ],
      projects: [
        {
          title: 'Transformer Attention Pruner',
          description: 'Sparse attention mechanism reducing LLM inference latency by 35% with minimal perplexity loss.',
          technologies: 'Python, PyTorch, CUDA',
        },
      ],
    },
    {
      email: 'carol.ds@resumematch.ai',
      fullName: 'Carol Martinez',
      headline: 'Lead Data Scientist | Predictive Analytics, SQL, Python, Pandas',
      careerObjective: 'Transforming raw unstructured data into actionable predictive insights and statistical models.',
      preferredDomain: 'Data Science',
      yearsOfExperience: 4.5,
      location: 'Austin, TX',
      preferredWorkMode: 'Remote',
      employmentType: 'Full-time',
      expectedSalaryMin: 130000,
      expectedSalaryMax: 165000,
      availabilityNotice: '1 Month',
      skills: [
        { name: 'Python', level: 'Expert', years: 4.5 },
        { name: 'SQL', level: 'Expert', years: 5.0 },
        { name: 'Pandas', level: 'Expert', years: 4.5 },
        { name: 'Scikit-Learn', level: 'Advanced', years: 4.0 },
        { name: 'Machine Learning', level: 'Advanced', years: 3.5 },
        { name: 'PostgreSQL', level: 'Advanced', years: 3.0 },
      ],
      experience: [
        {
          jobTitle: 'Senior Data Scientist',
          companyName: 'FinMetrics Analytics',
          startDate: new Date('2020-08-01'),
          isCurrent: true,
          description: 'Built customer churn prediction models and automated real-time ETL pipelines.',
          technologiesUsed: 'Python, SQL, Pandas, Scikit-Learn, PostgreSQL',
        },
      ],
      education: [
        {
          institution: 'UT Austin',
          degree: 'B.S. in Statistics and Data Science',
          fieldOfStudy: 'Applied Statistics',
          startYear: 2016,
          endYear: 2020,
        },
      ],
      projects: [
        {
          title: 'Algorithmic Financial Risk Predictor',
          description: 'Ensemble model predicting loan default probabilities with 92% AUC-ROC.',
          technologies: 'Python, Scikit-Learn, Pandas, SQL',
        },
      ],
    },
    {
      email: 'dave.cyber@resumematch.ai',
      fullName: 'David Kowalski',
      headline: 'Information Security & Penetration Testing Specialist | CISSP',
      careerObjective: 'Securing cloud infrastructure, detecting advanced zero-day threats, and hardening enterprise systems.',
      preferredDomain: 'Cybersecurity',
      yearsOfExperience: 6.0,
      location: 'Seattle, WA',
      preferredWorkMode: 'On-site',
      employmentType: 'Full-time',
      expectedSalaryMin: 150000,
      expectedSalaryMax: 190000,
      availabilityNotice: 'Immediate',
      skills: [
        { name: 'Penetration Testing', level: 'Expert', years: 6.0 },
        { name: 'Cryptography', level: 'Advanced', years: 4.0 },
        { name: 'Network Security', level: 'Expert', years: 6.0 },
        { name: 'Linux', level: 'Expert', years: 7.0 },
        { name: 'Python', level: 'Advanced', years: 4.0 },
        { name: 'Docker', level: 'Intermediate', years: 3.0 },
      ],
      experience: [
        {
          jobTitle: 'Lead Security Engineer',
          companyName: 'Fortress Cyber Defense',
          startDate: new Date('2019-01-10'),
          isCurrent: true,
          description: 'Executed red-team penetration tests, automated vulnerability scanners, and audited cloud firewalls.',
          technologiesUsed: 'Linux, Python, Kali Linux, Wireshark, Docker',
        },
      ],
      education: [
        {
          institution: 'University of Washington',
          degree: 'B.S. in Computer Engineering',
          startYear: 2014,
          endYear: 2018,
        },
      ],
      projects: [
        {
          title: 'Automated Port Scanner & Vulnerability Analyzer',
          description: 'High-speed asynchronous network scanner written in Python and C.',
          technologies: 'Python, Linux, Network Security',
        },
      ],
    },
    {
      email: 'elena.uiux@resumematch.ai',
      fullName: 'Elena Rostova',
      headline: 'Senior Product Designer & UI/UX Specialist | Figma, Design Systems',
      careerObjective: 'Creating intuitive, beautiful, and accessible digital product experiences that users love.',
      preferredDomain: 'UI/UX',
      yearsOfExperience: 5.0,
      location: 'San Francisco, CA',
      preferredWorkMode: 'Hybrid',
      employmentType: 'Full-time',
      expectedSalaryMin: 125000,
      expectedSalaryMax: 160000,
      availabilityNotice: '15 Days',
      skills: [
        { name: 'Figma', level: 'Expert', years: 5.0 },
        { name: 'UI/UX Design', level: 'Expert', years: 5.0 },
        { name: 'Design Systems', level: 'Expert', years: 4.5 },
        { name: 'HTML5/CSS3', level: 'Advanced', years: 4.0 },
        { name: 'Tailwind CSS', level: 'Intermediate', years: 2.5 },
        { name: 'React', level: 'Intermediate', years: 2.0 },
      ],
      experience: [
        {
          jobTitle: 'Lead UI/UX Designer',
          companyName: 'SaaS Studio Global',
          startDate: new Date('2020-04-01'),
          isCurrent: true,
          description: 'Designed unified design system spanning 4 web apps and 2 mobile products.',
          technologiesUsed: 'Figma, Design Systems, Prototyping, CSS3',
        },
      ],
      education: [
        {
          institution: 'Rhode Island School of Design (RISD)',
          degree: 'B.F.A. in Graphic & Interaction Design',
          startYear: 2015,
          endYear: 2019,
        },
      ],
      projects: [
        {
          title: 'Open Source Accessible Design Tokens Library',
          description: 'Comprehensive design system token specification for multi-brand SaaS apps.',
          technologies: 'Figma, Tailwind CSS, Design Systems',
        },
      ],
    },
    {
      email: 'frank.cloud@resumematch.ai',
      fullName: 'Frank Gallagher',
      headline: 'Senior Cloud & DevOps Engineer | Kubernetes, AWS, Terraform, Docker',
      careerObjective: 'Architecting resilient cloud native infrastructure with 99.99% uptime guarantees.',
      preferredDomain: 'Software Engineering',
      yearsOfExperience: 6.0,
      location: 'Denver, CO',
      preferredWorkMode: 'Remote',
      employmentType: 'Full-time',
      expectedSalaryMin: 150000,
      expectedSalaryMax: 185000,
      availabilityNotice: 'Immediate',
      skills: [
        { name: 'Kubernetes', level: 'Expert', years: 5.0 },
        { name: 'Docker', level: 'Expert', years: 6.0 },
        { name: 'AWS', level: 'Expert', years: 5.5 },
        { name: 'Terraform', level: 'Advanced', years: 4.0 },
        { name: 'CI/CD', level: 'Expert', years: 5.0 },
        { name: 'Go', level: 'Advanced', years: 3.5 },
        { name: 'Linux', level: 'Expert', years: 6.0 },
      ],
      experience: [
        {
          jobTitle: 'Principal Cloud Architect',
          companyName: 'Peak DevOps Advisory',
          startDate: new Date('2018-09-01'),
          isCurrent: true,
          description: 'Managed Kubernetes clusters over 500 nodes across multi-region AWS environments.',
          technologiesUsed: 'Kubernetes, AWS, Terraform, Docker, Go',
        },
      ],
      education: [
        {
          institution: 'Colorado State University',
          degree: 'B.S. in Computer Information Systems',
          startYear: 2013,
          endYear: 2017,
        },
      ],
      projects: [
        {
          title: 'Zero-Downtime Multi-Cloud Kubernetes Orchestrator',
          description: 'Automated failover operator written in Go with Kubernetes Custom Resource Definitions.',
          technologies: 'Go, Kubernetes, AWS, Docker',
        },
      ],
    },
  ];

  const candidateProfileMap = new Map<string, string>(); // email -> candidateProfileId

  for (const c of candidatesData) {
    const user = await prisma.user.create({
      data: {
        email: c.email,
        passwordHash: defaultPassword,
        role: 'CANDIDATE',
        fullName: c.fullName,
        candidateProfile: {
          create: {
            headline: c.headline,
            careerObjective: c.careerObjective,
            preferredDomain: c.preferredDomain,
            yearsOfExperience: c.yearsOfExperience,
            location: c.location,
            preferredWorkMode: c.preferredWorkMode,
            employmentType: c.employmentType,
            expectedSalaryMin: c.expectedSalaryMin,
            expectedSalaryMax: c.expectedSalaryMax,
            availabilityNotice: c.availabilityNotice,
            portfolioUrl: c.portfolioUrl,
            githubUrl: c.githubUrl,
            linkedinUrl: c.linkedinUrl,
            profileCompletedPercent: 95,
          },
        },
      },
      include: { candidateProfile: true },
    });

    const profileId = user.candidateProfile!.id;
    candidateProfileMap.set(c.email, profileId);

    // Add candidate skills
    for (const sk of c.skills) {
      const skillId = skillRecordMap.get(sk.name);
      if (skillId) {
        await prisma.candidateSkill.create({
          data: {
            candidateProfileId: profileId,
            skillId,
            proficiencyLevel: sk.level,
            yearsOfExperience: sk.years,
            isVerifiedByResume: true,
          },
        });
      }
    }

    // Add experiences
    for (const exp of c.experience) {
      const e = exp as any;
      await prisma.candidateExperience.create({
        data: {
          candidateProfileId: profileId,
          jobTitle: e.jobTitle,
          companyName: e.companyName,
          startDate: e.startDate,
          endDate: e.endDate || null,
          isCurrent: Boolean(e.isCurrent),
          description: e.description,
          technologiesUsed: e.technologiesUsed,
        },
      });
    }

    // Add education
    for (const edu of c.education) {
      const ed = edu as any;
      await prisma.candidateEducation.create({
        data: {
          candidateProfileId: profileId,
          institution: ed.institution,
          degree: ed.degree,
          fieldOfStudy: ed.fieldOfStudy || null,
          startYear: ed.startYear,
          endYear: ed.endYear || null,
          grade: ed.grade || null,
        },
      });
    }

    // Add projects
    for (const proj of c.projects) {
      const p = proj as any;
      await prisma.candidateProject.create({
        data: {
          candidateProfileId: profileId,
          title: p.title,
          description: p.description,
          technologies: p.technologies,
          githubUrl: p.githubUrl || null,
        },
      });
    }
  }

  console.log(`✓ Seeded 6 candidate profiles across all 5 domains with skills, experiences, and projects.`);

  // 4. SEED JOBS WITH REQUIRED AND PREFERRED SKILLS
  const jobsData = [
    {
      title: 'Senior Frontend Architect',
      recruiterId: recruiter1.recruiterProfile!.id,
      companyId: companyMap.get('Google Cloud Platform')!,
      domain: 'Software Engineering',
      description: 'Lead the next-generation web console for Google Cloud enterprise customers. Design modular micro-frontends with React and TypeScript.',
      openings: 2,
      location: 'Mountain View, CA & Remote',
      workMode: 'Remote',
      employmentType: 'Full-time',
      minExperienceYears: 4.0,
      salaryMin: 160000,
      salaryMax: 195000,
      educationRequired: 'Bachelor in Computer Science or related field',
      requiredSkills: [
        { name: 'React', minExp: 3.5 },
        { name: 'TypeScript', minExp: 3.0 },
        { name: 'JavaScript', minExp: 4.0 },
      ],
      preferredSkills: ['Next.js', 'Tailwind CSS', 'Docker'],
    },
    {
      title: 'Foundation Model Research Engineer',
      recruiterId: recruiter2.recruiterProfile!.id,
      companyId: companyMap.get('OpenAI Labs')!,
      domain: 'AI/ML',
      description: 'Join OpenAI Labs to train, evaluate, and scale state-of-the-art transformer foundation models and autonomous reasoning agents.',
      openings: 3,
      location: 'San Francisco, CA',
      workMode: 'Hybrid',
      employmentType: 'Full-time',
      minExperienceYears: 3.0,
      salaryMin: 180000,
      salaryMax: 240000,
      educationRequired: 'Master or Ph.D. in Computer Science or Artificial Intelligence',
      requiredSkills: [
        { name: 'Python', minExp: 3.0 },
        { name: 'PyTorch', minExp: 3.0 },
        { name: 'Deep Learning', minExp: 3.0 },
        { name: 'NLP', minExp: 2.5 },
      ],
      preferredSkills: ['TensorFlow', 'Docker', 'Machine Learning'],
    },
    {
      title: 'Senior Payments Platform Engineer',
      recruiterId: recruiter3.recruiterProfile!.id,
      companyId: companyMap.get('Stripe Payments')!,
      domain: 'Software Engineering',
      description: 'Build mission-critical payment rails handling billions in transactions daily. Architect resilient APIs with Node.js and PostgreSQL.',
      openings: 2,
      location: 'San Francisco, CA & Remote',
      workMode: 'Remote',
      employmentType: 'Full-time',
      minExperienceYears: 4.0,
      salaryMin: 155000,
      salaryMax: 190000,
      educationRequired: 'Bachelor degree in Engineering or equivalent experience',
      requiredSkills: [
        { name: 'Node.js', minExp: 3.5 },
        { name: 'PostgreSQL', minExp: 3.0 },
        { name: 'TypeScript', minExp: 2.5 },
      ],
      preferredSkills: ['Redis', 'Docker', 'AWS'],
    },
    {
      title: 'Lead Cloud Observability & Reliability Engineer',
      recruiterId: recruiter1.recruiterProfile!.id,
      companyId: companyMap.get('Datadog Observability')!,
      domain: 'Software Engineering',
      description: 'Scale distributed monitoring agents and Kubernetes daemonsets processing petabytes of telemetry and metric events.',
      openings: 1,
      location: 'Denver, CO & Remote',
      workMode: 'Remote',
      employmentType: 'Full-time',
      minExperienceYears: 5.0,
      salaryMin: 165000,
      salaryMax: 200000,
      requiredSkills: [
        { name: 'Kubernetes', minExp: 4.0 },
        { name: 'Docker', minExp: 4.0 },
        { name: 'AWS', minExp: 4.0 },
      ],
      preferredSkills: ['Terraform', 'CI/CD', 'Go', 'Linux'],
    },
    {
      title: 'Senior Product Designer (Design Systems)',
      recruiterId: recruiter3.recruiterProfile!.id,
      companyId: companyMap.get('Stripe Payments')!,
      domain: 'UI/UX',
      description: 'Craft beautiful, pixel-perfect financial UI components. Establish design tokens, accessible guidelines, and design systems.',
      openings: 1,
      location: 'San Francisco, CA',
      workMode: 'Hybrid',
      employmentType: 'Full-time',
      minExperienceYears: 4.0,
      salaryMin: 135000,
      salaryMax: 170000,
      requiredSkills: [
        { name: 'Figma', minExp: 3.5 },
        { name: 'UI/UX Design', minExp: 4.0 },
        { name: 'Design Systems', minExp: 3.0 },
      ],
      preferredSkills: ['HTML5/CSS3', 'Tailwind CSS', 'React'],
    },
    {
      title: 'Principal Security & Penetration Tester',
      recruiterId: recruiter1.recruiterProfile!.id,
      companyId: companyMap.get('Google Cloud Platform')!,
      domain: 'Cybersecurity',
      description: 'Protect cloud services from sophisticated attacks. Conduct deep vulnerability assessments, threat modeling, and kernel audits.',
      openings: 1,
      location: 'Seattle, WA',
      workMode: 'On-site',
      employmentType: 'Full-time',
      minExperienceYears: 5.0,
      salaryMin: 170000,
      salaryMax: 215000,
      requiredSkills: [
        { name: 'Penetration Testing', minExp: 4.0 },
        { name: 'Network Security', minExp: 4.0 },
        { name: 'Linux', minExp: 5.0 },
      ],
      preferredSkills: ['Cryptography', 'Python', 'Docker'],
    },
  ];

  const jobMap = new Map<string, string>(); // title -> id

  for (const j of jobsData) {
    const createdJob = await prisma.job.create({
      data: {
        title: j.title,
        recruiterProfileId: j.recruiterId,
        companyId: j.companyId,
        domain: j.domain,
        description: j.description,
        openings: j.openings,
        location: j.location,
        workMode: j.workMode,
        employmentType: j.employmentType,
        minExperienceYears: j.minExperienceYears,
        salaryMin: j.salaryMin,
        salaryMax: j.salaryMax,
        educationRequired: j.educationRequired,
        status: 'ACTIVE',
      },
    });

    jobMap.set(j.title, createdJob.id);

    // Required Skills
    for (const rs of j.requiredSkills) {
      const skillId = skillRecordMap.get(rs.name);
      if (skillId) {
        await prisma.jobRequiredSkill.create({
          data: {
            jobId: createdJob.id,
            skillId,
            minExpYears: rs.minExp,
          },
        });
      }
    }

    // Preferred Skills
    for (const ps of j.preferredSkills) {
      const skillId = skillRecordMap.get(ps);
      if (skillId) {
        await prisma.jobPreferredSkill.create({
          data: {
            jobId: createdJob.id,
            skillId,
          },
        });
      }
    }
  }

  console.log(`✓ Seeded 6 realistic jobs with required & preferred skills.`);

  // 5. SEED APPLICATIONS WITH DIFFERENT HIRING STAGES
  const applicationsToSeed = [
    {
      candidateEmail: 'alice.swe@resumematch.ai',
      jobTitle: 'Senior Frontend Architect',
      status: 'SHORTLISTED',
      score: 96.5,
      breakdown: { required: 50, preferred: 18, experience: 15, domain: 9, edu: 4.5 },
      coverLetter: 'I have extensive experience leading micro-frontends with React and TypeScript and would love to contribute to Google Cloud.',
    },
    {
      candidateEmail: 'alice.swe@resumematch.ai',
      jobTitle: 'Senior Payments Platform Engineer',
      status: 'UNDER_REVIEW',
      score: 88.0,
      breakdown: { required: 45, preferred: 15, experience: 15, domain: 8.5, edu: 4.5 },
      coverLetter: 'Passionate about fintech platforms and backend scalability.',
    },
    {
      candidateEmail: 'bob.aiml@resumematch.ai',
      jobTitle: 'Foundation Model Research Engineer',
      status: 'INTERVIEW_SCHEDULED',
      score: 97.2,
      breakdown: { required: 50, preferred: 19, experience: 14.5, domain: 9, edu: 4.7 },
      coverLetter: 'My research in transformer attention optimization aligns directly with OpenAI mission.',
    },
    {
      candidateEmail: 'dave.cyber@resumematch.ai',
      jobTitle: 'Principal Security & Penetration Tester',
      status: 'SHORTLISTED',
      score: 94.0,
      breakdown: { required: 50, preferred: 16, experience: 15, domain: 8.5, edu: 4.5 },
      coverLetter: 'Seasoned red-team penetration tester excited about cloud-scale threat defense.',
    },
    {
      candidateEmail: 'elena.uiux@resumematch.ai',
      jobTitle: 'Senior Product Designer (Design Systems)',
      status: 'SELECTED',
      score: 95.8,
      breakdown: { required: 50, preferred: 17, experience: 15, domain: 9, edu: 4.8 },
      coverLetter: 'Specialist in multi-tier design systems, eager to elevate Stripe user experience.',
    },
    {
      candidateEmail: 'frank.cloud@resumematch.ai',
      jobTitle: 'Lead Cloud Observability & Reliability Engineer',
      status: 'INTERVIEW_SCHEDULED',
      score: 98.0,
      breakdown: { required: 50, preferred: 20, experience: 15, domain: 8.5, edu: 4.5 },
      coverLetter: 'Managed large Kubernetes fleets in multi-region environments for years.',
    },
  ];

  for (const app of applicationsToSeed) {
    const candidateProfileId = candidateProfileMap.get(app.candidateEmail);
    const jobId = jobMap.get(app.jobTitle);

    if (candidateProfileId && jobId) {
      const createdApp = await prisma.application.create({
        data: {
          candidateProfileId,
          jobId,
          status: app.status,
          compatibilityScore: app.score,
          scoreBreakdownJson: JSON.stringify(app.breakdown),
          coverLetter: app.coverLetter,
        },
      });

      // Status history
      await prisma.applicationStatusHistory.create({
        data: {
          applicationId: createdApp.id,
          fromStatus: 'APPLIED',
          toStatus: app.status,
          changedByRole: 'RECRUITER',
          comment: `Initial review by technical recruiter - candidate qualified with ${app.score}% score.`,
        },
      });

      // If interview scheduled, create interview record
      if (app.status === 'INTERVIEW_SCHEDULED') {
        await prisma.interview.create({
          data: {
            applicationId: createdApp.id,
            title: 'Technical Deep Dive & Architecture Round',
            scheduledAt: new Date(Date.now() + 86400000 * 2), // 2 days later
            durationMins: 60,
            meetingLink: 'https://meet.google.com/xyz-resumematch-demo',
            interviewType: 'Technical',
            status: 'SCHEDULED',
          },
        });
      }
    }
  }

  console.log(`✓ Seeded applications with status history and scheduled interviews.`);

  // 6. SEED NOTIFICATIONS & AUDIT LOGS & ALGORITHM METRICS
  const sampleMetrics = [
    { algorithmName: 'Aho-Corasick', executionTimeMs: 0.84, inputSize: 2450, itemCount: 12, notes: 'Resume skill scan' },
    { algorithmName: 'Levenshtein', executionTimeMs: 0.12, inputSize: 18, itemCount: 1, notes: 'Fuzzy skill normalization' },
    { algorithmName: 'CompatibilityScoring', executionTimeMs: 1.45, inputSize: 25, itemCount: 6, notes: 'Multi-factor match' },
    { algorithmName: 'HungarianMatching', executionTimeMs: 3.21, inputSize: 12, itemCount: 6, notes: 'Bipartite role allocation' },
    { algorithmName: 'GreedySetCover', executionTimeMs: 2.05, inputSize: 8, itemCount: 4, notes: 'Project team generation' },
  ];

  for (const m of sampleMetrics) {
    await prisma.algorithmMetric.create({
      data: {
        algorithmName: m.algorithmName,
        executionTimeMs: m.executionTimeMs,
        inputSize: m.inputSize,
        itemCount: m.itemCount,
        notes: m.notes,
      },
    });
  }

  // Create welcome notifications
  const candidateUsers = await prisma.user.findMany({ where: { role: 'CANDIDATE' } });
  for (const u of candidateUsers) {
    await prisma.notification.create({
      data: {
        userId: u.id,
        title: 'Welcome to ResumeMatch AI',
        message: 'Your profile has been indexed! Check your personalized Job Recommendations powered by DSA matching.',
        type: 'JOB_MATCH',
        linkUrl: '/candidate/recommendations',
      },
    });
  }

  console.log('✅ Database seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
