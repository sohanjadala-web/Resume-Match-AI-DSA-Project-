import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { SkillExtractorEngine } from '../algorithms/skillExtractor';
import { CompatibilityScorer } from '../algorithms/compatibilityScorer';
import { DSAMetricsTracker } from '../algorithms/metricsTracker';

// Helper to calculate profile completion percentage
export function calculateProfileCompletion(profile: any): number {
  let score = 20; // base registered account
  if (profile.headline) score += 10;
  if (profile.careerObjective) score += 10;
  if (profile.preferredDomain) score += 10;
  if (profile.skills && profile.skills.length >= 3) score += 20;
  if (profile.experience && profile.experience.length >= 1) score += 10;
  if (profile.education && profile.education.length >= 1) score += 10;
  if (profile.projects && profile.projects.length >= 1) score += 5;
  if (profile.portfolioUrl || profile.githubUrl || profile.linkedinUrl) score += 5;
  return Math.min(100, score);
}

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const candidateProfileId = req.user?.candidateProfileId;
    if (!candidateProfileId) {
      res.status(404).json({ error: 'Candidate profile not found' });
      return;
    }

    const profile = await prisma.candidateProfile.findUnique({
      where: { id: candidateProfileId },
      include: {
        user: { select: { id: true, fullName: true, email: true, phone: true, avatarUrl: true } },
        skills: {
          include: { skill: true },
          orderBy: { yearsOfExperience: 'desc' },
        },
        experience: { orderBy: { startDate: 'desc' } },
        education: { orderBy: { startYear: 'desc' } },
        projects: true,
        certifications: true,
        resumes: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });

    if (!profile) {
      res.status(404).json({ error: 'Candidate profile not found' });
      return;
    }

    res.json({ profile });
  } catch (err: any) {
    console.error('getProfile error:', err);
    res.status(500).json({ error: 'Failed to retrieve candidate profile' });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const candidateProfileId = req.user?.candidateProfileId;
    if (!candidateProfileId) {
      res.status(404).json({ error: 'Candidate profile not found' });
      return;
    }

    const {
      headline,
      careerObjective,
      preferredDomain,
      yearsOfExperience,
      location,
      preferredWorkMode,
      employmentType,
      expectedSalaryMin,
      expectedSalaryMax,
      availabilityNotice,
      portfolioUrl,
      githubUrl,
      linkedinUrl,
      fullName,
      phone,
    } = req.body;

    if (fullName || phone) {
      await prisma.user.update({
        where: { id: req.user!.id },
        data: {
          ...(fullName ? { fullName } : {}),
          ...(phone !== undefined ? { phone } : {}),
        },
      });
    }

    const updatedProfile = await prisma.candidateProfile.update({
      where: { id: candidateProfileId },
      data: {
        headline,
        careerObjective,
        preferredDomain,
        yearsOfExperience: yearsOfExperience !== undefined ? parseFloat(yearsOfExperience) : undefined,
        location,
        preferredWorkMode,
        employmentType,
        expectedSalaryMin: expectedSalaryMin ? parseInt(expectedSalaryMin) : undefined,
        expectedSalaryMax: expectedSalaryMax ? parseInt(expectedSalaryMax) : undefined,
        availabilityNotice,
        portfolioUrl,
        githubUrl,
        linkedinUrl,
      },
      include: {
        skills: true,
        experience: true,
        education: true,
        projects: true,
      },
    });

    // Recalculate completion
    const newCompletion = calculateProfileCompletion(updatedProfile);
    await prisma.candidateProfile.update({
      where: { id: candidateProfileId },
      data: { profileCompletedPercent: newCompletion },
    });

    res.json({ message: 'Profile updated successfully', profile: { ...updatedProfile, profileCompletedPercent: newCompletion } });
  } catch (err: any) {
    console.error('updateProfile error:', err);
    res.status(500).json({ error: 'Failed to update candidate profile' });
  }
};

export const updateSkills = async (req: Request, res: Response): Promise<void> => {
  try {
    const candidateProfileId = req.user?.candidateProfileId;
    if (!candidateProfileId) {
      res.status(404).json({ error: 'Candidate profile not found' });
      return;
    }

    const { skills } = req.body; // Array of { skillId or skillName, proficiencyLevel, yearsOfExperience }
    if (!Array.isArray(skills)) {
      res.status(400).json({ error: 'Skills must be an array' });
      return;
    }

    // Replace skills transactionally
    await prisma.$transaction(async (tx) => {
      await tx.candidateSkill.deleteMany({ where: { candidateProfileId } });

      for (const item of skills) {
        let skillId = item.skillId;
        if (!skillId && item.skillName) {
          let found = await tx.skill.findUnique({ where: { name: item.skillName } });
          if (!found) {
            found = await tx.skill.create({
              data: { name: item.skillName, category: 'Technical' },
            });
          }
          skillId = found.id;
        }

        if (skillId) {
          await tx.candidateSkill.create({
            data: {
              candidateProfileId,
              skillId,
              proficiencyLevel: item.proficiencyLevel || 'Intermediate',
              yearsOfExperience: item.yearsOfExperience ? parseFloat(item.yearsOfExperience) : 1.0,
            },
          });
        }
      }
    });

    const updatedSkills = await prisma.candidateSkill.findMany({
      where: { candidateProfileId },
      include: { skill: true },
    });

    res.json({ message: 'Skills updated successfully', skills: updatedSkills });
  } catch (err: any) {
    console.error('updateSkills error:', err);
    res.status(500).json({ error: 'Failed to update skills' });
  }
};

export const parseResume = async (req: Request, res: Response): Promise<void> => {
  try {
    const candidateProfileId = req.user?.candidateProfileId;
    if (!candidateProfileId) {
      res.status(404).json({ error: 'Candidate profile not found' });
      return;
    }

    let rawText = '';
    let fileName = 'Uploaded-Resume.txt';
    let fileSize = 0;
    let mimeType = 'text/plain';

    if (req.file) {
      fileName = req.file.originalname;
      fileSize = req.file.size;
      mimeType = req.file.mimetype;

      if (mimeType === 'application/pdf') {
        try {
          const pdfParse = require('pdf-parse');
          const pdfData = await pdfParse(req.file.buffer);
          rawText = pdfData.text;
        } catch (pdfErr) {
          console.warn('pdf-parse fallback to raw buffer string:', pdfErr);
          rawText = req.file.buffer.toString('utf-8');
        }
      } else if (
        mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        mimeType === 'application/msword'
      ) {
        try {
          const mammoth = require('mammoth');
          const docxData = await mammoth.extractRawText({ buffer: req.file.buffer });
          rawText = docxData.value;
        } catch (docErr) {
          console.warn('mammoth fallback to raw string:', docErr);
          rawText = req.file.buffer.toString('utf-8');
        }
      } else {
        rawText = req.file.buffer.toString('utf-8');
      }
    } else if (req.body.text) {
      rawText = req.body.text;
      fileSize = rawText.length;
    } else {
      res.status(400).json({ error: 'Please upload a PDF, DOCX, or provide resume text.' });
      return;
    }

    if (!rawText.trim()) {
      res.status(400).json({ error: 'Could not extract text from the uploaded document.' });
      return;
    }

    // 1. Fetch all canonical skills and aliases from database
    const dbSkills = await prisma.skill.findMany({
      include: { aliases: true },
    });

    const skillDefinitions = dbSkills.map((s) => ({
      id: s.id,
      name: s.name,
      category: s.category,
      aliases: s.aliases.map((a) => a.alias),
    }));

    // 2. Execute DSA Skill Extractor Engine (Aho-Corasick + Levenshtein + Tokenization)
    const engine = new SkillExtractorEngine(skillDefinitions);
    const startTime = performance.now();
    const extractedSkills = engine.extractSkills(rawText);
    const sections = engine.parseResumeSections(rawText);
    const duration = parseFloat((performance.now() - startTime).toFixed(3));

    // Record metrics
    await DSAMetricsTracker.recordMetric('Aho-Corasick', duration, rawText.length, extractedSkills.length, 'Resume parsing');

    // Save resume record
    const resume = await prisma.resume.create({
      data: {
        candidateProfileId,
        fileName,
        fileSize,
        mimeType,
        extractedRawText: rawText.slice(0, 10000), // store up to 10k chars
        parsedDataJson: JSON.stringify({
          extractedSkills,
          sections,
        }),
      },
    });

    res.json({
      message: 'Resume parsed successfully via Aho-Corasick & Levenshtein matching.',
      resumeId: resume.id,
      extractedSkills,
      sections,
      executionTimeMs: duration,
      rawTextSnippet: rawText.slice(0, 500),
    });
  } catch (err: any) {
    console.error('parseResume error:', err);
    res.status(500).json({ error: 'Failed to parse resume document' });
  }
};

export const getRecommendations = async (req: Request, res: Response): Promise<void> => {
  try {
    const candidateProfileId = req.user?.candidateProfileId;
    if (!candidateProfileId) {
      res.status(404).json({ error: 'Candidate profile not found' });
      return;
    }

    const { domain, workMode, minScore, search, sort = 'score' } = req.query;

    const candidate = await prisma.candidateProfile.findUnique({
      where: { id: candidateProfileId },
      include: {
        user: { select: { fullName: true } },
        skills: { include: { skill: true } },
        experience: true,
        education: true,
        projects: true,
        applications: { select: { jobId: true, status: true } },
        savedJobs: { select: { jobId: true } },
      },
    });

    if (!candidate) {
      res.status(404).json({ error: 'Candidate profile not found' });
      return;
    }

    // Format candidate input for CompatibilityScorer
    const candidateScoringInput = {
      candidateId: candidate.id,
      name: candidate.user.fullName,
      preferredDomain: candidate.preferredDomain,
      yearsOfExperience: candidate.yearsOfExperience,
      skills: candidate.skills.map((s) => ({
        skillId: s.skillId,
        name: s.skill.name,
        proficiencyLevel: s.proficiencyLevel,
        yearsOfExperience: s.yearsOfExperience,
      })),
      projects: candidate.projects.map((p) => ({
        title: p.title,
        technologies: p.technologies,
        description: p.description,
      })),
      education: candidate.education.map((e) => ({
        degree: e.degree,
        fieldOfStudy: e.fieldOfStudy,
      })),
    };

    // Fetch active jobs
    const jobs = await prisma.job.findMany({
      where: {
        status: 'ACTIVE',
        ...(domain ? { domain: String(domain) } : {}),
        ...(workMode ? { workMode: String(workMode) } : {}),
      },
      include: {
        company: true,
        requiredSkills: { include: { skill: true } },
        preferredSkills: { include: { skill: true } },
      },
    });

    const appliedJobIds = new Map(candidate.applications.map((a) => [a.jobId, a.status]));
    const savedJobIds = new Set(candidate.savedJobs.map((s) => s.jobId));

    // Run Compatibility Scoring on each job
    const startTime = performance.now();
    const scoredJobs = jobs.map((job) => {
      const jobScoringInput = {
        jobId: job.id,
        title: job.title,
        domain: job.domain,
        minExperienceYears: job.minExperienceYears,
        maxExperienceYears: job.maxExperienceYears,
        educationRequired: job.educationRequired,
        requiredSkills: job.requiredSkills.map((r) => ({
          skillId: r.skillId,
          name: r.skill.name,
          minExpYears: r.minExpYears,
        })),
        preferredSkills: job.preferredSkills.map((p) => ({
          skillId: p.skillId,
          name: p.skill.name,
        })),
      };

      const match = CompatibilityScorer.calculate(candidateScoringInput, jobScoringInput);

      return {
        ...job,
        compatibilityScore: match.totalScore,
        scoreBreakdown: match.breakdown,
        matchingRequiredSkills: match.matchingRequiredSkills,
        missingRequiredSkills: match.missingRequiredSkills,
        matchingPreferredSkills: match.matchingPreferredSkills,
        isFullyQualified: match.isFullyQualified,
        explanation: match.explanation,
        hasApplied: appliedJobIds.has(job.id),
        applicationStatus: appliedJobIds.get(job.id) || null,
        isSaved: savedJobIds.has(job.id),
      };
    });

    const duration = parseFloat((performance.now() - startTime).toFixed(3));
    await DSAMetricsTracker.recordMetric('CompatibilityScoring', duration, jobs.length, candidate.skills.length, 'Recommendations ranking');

    // Filter by minScore and search
    let filtered = scoredJobs;
    if (minScore) {
      const minVal = parseFloat(String(minScore));
      filtered = filtered.filter((j) => j.compatibilityScore >= minVal);
    }
    if (search) {
      const q = String(search).toLowerCase();
      filtered = filtered.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.company.name.toLowerCase().includes(q) ||
          j.domain.toLowerCase().includes(q) ||
          j.requiredSkills.some((s) => s.skill.name.toLowerCase().includes(q))
      );
    }

    // Sort using deterministic ranking
    filtered.sort((a, b) => {
      if (sort === 'score') {
        return CompatibilityScorer.compareCandidates(
          { score: a.compatibilityScore, reqCoverage: a.matchingRequiredSkills.length / Math.max(1, a.requiredSkills.length), experienceYears: a.minExperienceYears, candidateId: a.id },
          { score: b.compatibilityScore, reqCoverage: b.matchingRequiredSkills.length / Math.max(1, b.requiredSkills.length), experienceYears: b.minExperienceYears, candidateId: b.id }
        );
      } else if (sort === 'date') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sort === 'salary') {
        return (b.salaryMax || 0) - (a.salaryMax || 0);
      }
      return 0;
    });

    res.json({
      recommendations: filtered,
      totalCount: filtered.length,
      executionTimeMs: duration,
    });
  } catch (err: any) {
    console.error('getRecommendations error:', err);
    res.status(500).json({ error: 'Failed to calculate job recommendations' });
  }
};

export const getApplications = async (req: Request, res: Response): Promise<void> => {
  try {
    const candidateProfileId = req.user?.candidateProfileId;
    if (!candidateProfileId) {
      res.status(404).json({ error: 'Candidate profile not found' });
      return;
    }

    const applications = await prisma.application.findMany({
      where: { candidateProfileId },
      include: {
        job: {
          include: {
            company: true,
            requiredSkills: { include: { skill: true } },
          },
        },
        statusHistory: { orderBy: { timestamp: 'desc' } },
        interviews: { orderBy: { scheduledAt: 'asc' } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    res.json({ applications });
  } catch (err: any) {
    console.error('getApplications error:', err);
    res.status(500).json({ error: 'Failed to retrieve applications' });
  }
};

export const applyForJob = async (req: Request, res: Response): Promise<void> => {
  try {
    const candidateProfileId = req.user?.candidateProfileId;
    const { jobId } = req.params;
    const { coverLetter } = req.body;

    if (!candidateProfileId) {
      res.status(404).json({ error: 'Candidate profile not found' });
      return;
    }

    // Check duplicate
    const existing = await prisma.application.findUnique({
      where: {
        candidateProfileId_jobId: {
          candidateProfileId,
          jobId,
        },
      },
    });

    if (existing) {
      res.status(400).json({ error: 'You have already applied for this job posting.' });
      return;
    }

    // Fetch job and candidate to compute compatibility score
    const [job, candidate] = await Promise.all([
      prisma.job.findUnique({
        where: { id: jobId },
        include: {
          recruiterProfile: { include: { user: true } },
          requiredSkills: { include: { skill: true } },
          preferredSkills: { include: { skill: true } },
        },
      }),
      prisma.candidateProfile.findUnique({
        where: { id: candidateProfileId },
        include: {
          user: true,
          skills: { include: { skill: true } },
          projects: true,
          education: true,
        },
      }),
    ]);

    if (!job || job.status !== 'ACTIVE') {
      res.status(404).json({ error: 'Job posting is inactive or does not exist.' });
      return;
    }
    if (!candidate) {
      res.status(404).json({ error: 'Candidate profile not found.' });
      return;
    }

    // Calculate score
    const candidateInput = {
      candidateId: candidate.id,
      name: candidate.user.fullName,
      preferredDomain: candidate.preferredDomain,
      yearsOfExperience: candidate.yearsOfExperience,
      skills: candidate.skills.map((s) => ({
        skillId: s.skillId,
        name: s.skill.name,
        proficiencyLevel: s.proficiencyLevel,
        yearsOfExperience: s.yearsOfExperience,
      })),
      projects: candidate.projects.map((p) => ({
        title: p.title,
        technologies: p.technologies,
        description: p.description,
      })),
      education: candidate.education.map((e) => ({
        degree: e.degree,
        fieldOfStudy: e.fieldOfStudy,
      })),
    };

    const jobInput = {
      jobId: job.id,
      title: job.title,
      domain: job.domain,
      minExperienceYears: job.minExperienceYears,
      educationRequired: job.educationRequired,
      requiredSkills: job.requiredSkills.map((r) => ({
        skillId: r.skillId,
        name: r.skill.name,
        minExpYears: r.minExpYears,
      })),
      preferredSkills: job.preferredSkills.map((p) => ({
        skillId: p.skillId,
        name: p.skill.name,
      })),
    };

    const match = CompatibilityScorer.calculate(candidateInput, jobInput);

    // Create Application
    const application = await prisma.application.create({
      data: {
        candidateProfileId,
        jobId,
        status: 'APPLIED',
        compatibilityScore: match.totalScore,
        scoreBreakdownJson: JSON.stringify(match.breakdown),
        coverLetter: coverLetter || null,
        statusHistory: {
          create: {
            fromStatus: 'NONE',
            toStatus: 'APPLIED',
            changedByRole: 'CANDIDATE',
            comment: 'Candidate submitted application with match score ' + match.totalScore + '%.',
          },
        },
      },
      include: {
        job: { include: { company: true } },
      },
    });

    // Notify recruiter
    if (job.recruiterProfile && job.recruiterProfile.user) {
      await prisma.notification.create({
        data: {
          userId: job.recruiterProfile.user.id,
          title: `New Applicant for ${job.title}`,
          message: `${candidate.user.fullName} applied for ${job.title} (Match Score: ${match.totalScore}%).`,
          type: 'APPLICATION',
          linkUrl: `/recruiter/jobs/${job.id}`,
        },
      });
    }

    res.status(201).json({
      message: 'Application submitted successfully!',
      application,
      compatibilityResult: match,
    });
  } catch (err: any) {
    console.error('applyForJob error:', err);
    res.status(500).json({ error: 'Failed to submit job application' });
  }
};

export const saveJob = async (req: Request, res: Response): Promise<void> => {
  try {
    const candidateProfileId = req.user?.candidateProfileId;
    const { jobId } = req.params;

    if (!candidateProfileId) {
      res.status(404).json({ error: 'Candidate profile not found' });
      return;
    }

    const saved = await prisma.savedJob.upsert({
      where: {
        candidateProfileId_jobId: {
          candidateProfileId,
          jobId,
        },
      },
      create: { candidateProfileId, jobId },
      update: {},
    });

    res.json({ message: 'Job saved successfully', saved });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to save job' });
  }
};

export const unsaveJob = async (req: Request, res: Response): Promise<void> => {
  try {
    const candidateProfileId = req.user?.candidateProfileId;
    const { jobId } = req.params;

    if (!candidateProfileId) {
      res.status(404).json({ error: 'Candidate profile not found' });
      return;
    }

    await prisma.savedJob.deleteMany({
      where: { candidateProfileId, jobId },
    });

    res.json({ message: 'Job removed from saved list' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to remove saved job' });
  }
};

export const getSavedJobs = async (req: Request, res: Response): Promise<void> => {
  try {
    const candidateProfileId = req.user?.candidateProfileId;
    if (!candidateProfileId) {
      res.status(404).json({ error: 'Candidate profile not found' });
      return;
    }

    const savedJobs = await prisma.savedJob.findMany({
      where: { candidateProfileId },
      include: {
        job: {
          include: {
            company: true,
            requiredSkills: { include: { skill: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ savedJobs });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve saved jobs' });
  }
};

export const getAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const candidateProfileId = req.user?.candidateProfileId;
    if (!candidateProfileId) {
      res.status(404).json({ error: 'Candidate profile not found' });
      return;
    }

    const [applications, profile, savedCount] = await Promise.all([
      prisma.application.findMany({
        where: { candidateProfileId },
        include: { job: { include: { requiredSkills: { include: { skill: true } } } } },
      }),
      prisma.candidateProfile.findUnique({
        where: { id: candidateProfileId },
        include: { skills: { include: { skill: true } } },
      }),
      prisma.savedJob.count({ where: { candidateProfileId } }),
    ]);

    const totalApplications = applications.length;
    const underReview = applications.filter((a) => a.status === 'UNDER_REVIEW').length;
    const shortlisted = applications.filter((a) => a.status === 'SHORTLISTED').length;
    const interviews = applications.filter((a) => a.status === 'INTERVIEW_SCHEDULED').length;
    const selected = applications.filter((a) => a.status === 'SELECTED').length;
    const rejected = applications.filter((a) => a.status === 'REJECTED').length;

    // Matched skills frequency across applications
    const skillCounts: Record<string, number> = {};
    for (const app of applications) {
      for (const reqSkill of app.job.requiredSkills) {
        skillCounts[reqSkill.skill.name] = (skillCounts[reqSkill.skill.name] || 0) + 1;
      }
    }

    const topMarketSkills = Object.entries(skillCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 7);

    // Identify suggested skills candidate doesn't have yet
    const candidateSkillNames = new Set(profile?.skills.map((s) => s.skill.name) || []);
    const suggestedSkills = topMarketSkills
      .filter((s) => !candidateSkillNames.has(s.name))
      .map((s) => s.name);

    res.json({
      analytics: {
        totalApplications,
        underReview,
        shortlisted,
        interviews,
        selected,
        rejected,
        savedJobs: savedCount,
        profileCompletedPercent: profile?.profileCompletedPercent || 25,
        topMarketSkills,
        suggestedSkills,
      },
    });
  } catch (err: any) {
    console.error('getAnalytics error:', err);
    res.status(500).json({ error: 'Failed to retrieve candidate analytics' });
  }
};
