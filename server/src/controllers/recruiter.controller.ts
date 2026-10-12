import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { CompatibilityScorer } from '../algorithms/compatibilityScorer';
import { HungarianAlgorithm } from '../algorithms/hungarianAssignment';
import { GreedySetCoverTeam } from '../algorithms/setCoverTeam';
import { DSAMetricsTracker } from '../algorithms/metricsTracker';

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const recruiterProfileId = req.user?.recruiterProfileId;
    if (!recruiterProfileId) {
      res.status(404).json({ error: 'Recruiter profile not found' });
      return;
    }

    const profile = await prisma.recruiterProfile.findUnique({
      where: { id: recruiterProfileId },
      include: {
        user: { select: { id: true, fullName: true, email: true, phone: true } },
        company: true,
      },
    });

    res.json({ profile });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve recruiter profile' });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const recruiterProfileId = req.user?.recruiterProfileId;
    if (!recruiterProfileId) {
      res.status(404).json({ error: 'Recruiter profile not found' });
      return;
    }

    const { fullName, phone, title, companyName, industry, description, location, website, logoUrl } = req.body;

    if (fullName || phone) {
      await prisma.user.update({
        where: { id: req.user!.id },
        data: {
          ...(fullName ? { fullName } : {}),
          ...(phone !== undefined ? { phone } : {}),
        },
      });
    }

    const recruiter = await prisma.recruiterProfile.findUnique({
      where: { id: recruiterProfileId },
      include: { company: true },
    });

    let companyId = recruiter?.companyId;
    if (companyName) {
      if (companyId) {
        await prisma.company.update({
          where: { id: companyId },
          data: {
            name: companyName,
            industry,
            description,
            location,
            website,
            logoUrl,
          },
        });
      } else {
        const newCo = await prisma.company.create({
          data: {
            name: companyName,
            industry,
            description,
            location,
            website,
            logoUrl,
          },
        });
        companyId = newCo.id;
      }
    }

    const updated = await prisma.recruiterProfile.update({
      where: { id: recruiterProfileId },
      data: {
        title,
        companyId,
      },
      include: {
        user: true,
        company: true,
      },
    });

    res.json({ message: 'Profile updated successfully', profile: updated });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update recruiter profile' });
  }
};

export const getJobs = async (req: Request, res: Response): Promise<void> => {
  try {
    const recruiterProfileId = req.user?.recruiterProfileId;
    if (!recruiterProfileId) {
      res.status(404).json({ error: 'Recruiter profile not found' });
      return;
    }

    const jobs = await prisma.job.findMany({
      where: { recruiterProfileId },
      include: {
        company: true,
        requiredSkills: { include: { skill: true } },
        preferredSkills: { include: { skill: true } },
        applications: {
          select: { id: true, status: true, compatibilityScore: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const jobsWithStats = jobs.map((j) => {
      const applicants = j.applications.length;
      const shortlisted = j.applications.filter((a) => a.status === 'SHORTLISTED').length;
      const interview = j.applications.filter((a) => a.status === 'INTERVIEW_SCHEDULED').length;
      const selected = j.applications.filter((a) => a.status === 'SELECTED').length;
      const avgScore = applicants > 0
        ? parseFloat((j.applications.reduce((acc, curr) => acc + curr.compatibilityScore, 0) / applicants).toFixed(1))
        : 0;

      return {
        ...j,
        stats: {
          applicants,
          shortlisted,
          interview,
          selected,
          avgScore,
        },
      };
    });

    res.json({ jobs: jobsWithStats });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve jobs' });
  }
};

export const createJob = async (req: Request, res: Response): Promise<void> => {
  try {
    const recruiterProfileId = req.user?.recruiterProfileId;
    if (!recruiterProfileId) {
      res.status(404).json({ error: 'Recruiter profile not found' });
      return;
    }

    const recruiter = await prisma.recruiterProfile.findUnique({
      where: { id: recruiterProfileId },
      include: { company: true },
    });

    if (!recruiter?.companyId) {
      res.status(400).json({ error: 'Please update your company profile before posting a job.' });
      return;
    }

    const {
      title,
      domain,
      description,
      openings,
      location,
      workMode,
      employmentType,
      minExperienceYears,
      maxExperienceYears,
      salaryMin,
      salaryMax,
      educationRequired,
      deadline,
      requiredSkills, // array of { name or id, minExpYears }
      preferredSkills, // array of name or id
    } = req.body;

    const job = await prisma.job.create({
      data: {
        recruiterProfileId,
        companyId: recruiter.companyId,
        title,
        domain: domain || 'Software Engineering',
        description,
        openings: openings ? parseInt(openings) : 1,
        location: location || 'Remote',
        workMode: workMode || 'Remote',
        employmentType: employmentType || 'Full-time',
        minExperienceYears: minExperienceYears ? parseFloat(minExperienceYears) : 0,
        maxExperienceYears: maxExperienceYears ? parseFloat(maxExperienceYears) : null,
        salaryMin: salaryMin ? parseInt(salaryMin) : null,
        salaryMax: salaryMax ? parseInt(salaryMax) : null,
        educationRequired,
        deadline: deadline ? new Date(deadline) : null,
        status: 'ACTIVE',
      },
    });

    // Add required skills
    if (Array.isArray(requiredSkills)) {
      for (const item of requiredSkills) {
        let skillId = item.skillId || item.id;
        if (!skillId && item.name) {
          let found = await prisma.skill.findUnique({ where: { name: item.name } });
          if (!found) found = await prisma.skill.create({ data: { name: item.name, category: 'Technical' } });
          skillId = found.id;
        }

        if (skillId) {
          await prisma.jobRequiredSkill.create({
            data: {
              jobId: job.id,
              skillId,
              minExpYears: item.minExpYears ? parseFloat(item.minExpYears) : 1.0,
            },
          });
        }
      }
    }

    // Add preferred skills
    if (Array.isArray(preferredSkills)) {
      for (const item of preferredSkills) {
        let skillId = typeof item === 'string' ? item : (item.skillId || item.id);
        if (!skillId && item.name) {
          let found = await prisma.skill.findUnique({ where: { name: item.name } });
          if (!found) found = await prisma.skill.create({ data: { name: item.name, category: 'Technical' } });
          skillId = found.id;
        }

        if (skillId) {
          await prisma.jobPreferredSkill.create({
            data: {
              jobId: job.id,
              skillId,
            },
          });
        }
      }
    }

    const completeJob = await prisma.job.findUnique({
      where: { id: job.id },
      include: {
        company: true,
        requiredSkills: { include: { skill: true } },
        preferredSkills: { include: { skill: true } },
      },
    });

    res.status(201).json({ message: 'Job created successfully', job: completeJob });
  } catch (err: any) {
    console.error('createJob error:', err);
    res.status(500).json({ error: 'Failed to create job' });
  }
};

export const updateJob = async (req: Request, res: Response): Promise<void> => {
  try {
    const recruiterProfileId = req.user?.recruiterProfileId;
    const { jobId } = req.params;

    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job || job.recruiterProfileId !== recruiterProfileId) {
      res.status(403).json({ error: 'Unauthorized to modify this job posting' });
      return;
    }

    const {
      title,
      domain,
      description,
      openings,
      location,
      workMode,
      employmentType,
      minExperienceYears,
      maxExperienceYears,
      salaryMin,
      salaryMax,
      educationRequired,
      deadline,
      status,
    } = req.body;

    const updated = await prisma.job.update({
      where: { id: jobId },
      data: {
        title,
        domain,
        description,
        openings: openings ? parseInt(openings) : undefined,
        location,
        workMode,
        employmentType,
        minExperienceYears: minExperienceYears !== undefined ? parseFloat(minExperienceYears) : undefined,
        maxExperienceYears: maxExperienceYears !== undefined ? parseFloat(maxExperienceYears) : undefined,
        salaryMin: salaryMin !== undefined ? parseInt(salaryMin) : undefined,
        salaryMax: salaryMax !== undefined ? parseInt(salaryMax) : undefined,
        educationRequired,
        deadline: deadline ? new Date(deadline) : undefined,
        status,
      },
      include: {
        company: true,
        requiredSkills: { include: { skill: true } },
        preferredSkills: { include: { skill: true } },
      },
    });

    res.json({ message: 'Job updated successfully', job: updated });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update job' });
  }
};

export const getJobDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const { jobId } = req.params;
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        company: true,
        requiredSkills: { include: { skill: true } },
        preferredSkills: { include: { skill: true } },
        applications: {
          include: {
            candidateProfile: {
              include: {
                user: { select: { fullName: true, email: true, phone: true } },
                skills: { include: { skill: true } },
                experience: true,
                education: true,
              },
            },
            statusHistory: { orderBy: { timestamp: 'desc' } },
            interviews: true,
            notes: { orderBy: { createdAt: 'desc' } },
          },
          orderBy: { compatibilityScore: 'desc' },
        },
      },
    });

    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    res.json({ job });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve job details' });
  }
};

export const searchCandidates = async (req: Request, res: Response): Promise<void> => {
  try {
    const { q, domain, minExp, skill, availability } = req.query;

    const candidates = await prisma.candidateProfile.findMany({
      where: {
        user: { isActive: true },
        ...(domain ? { preferredDomain: String(domain) } : {}),
        ...(minExp ? { yearsOfExperience: { gte: parseFloat(String(minExp)) } } : {}),
        ...(availability ? { availabilityNotice: String(availability) } : {}),
      },
      include: {
        user: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
        skills: { include: { skill: true } },
        experience: true,
        education: true,
        projects: true,
      },
    });

    let filtered = candidates;

    // Filter by skill or search keyword
    if (skill) {
      const targetSkill = String(skill).toLowerCase();
      filtered = filtered.filter((c) =>
        c.skills.some((s) => s.skill.name.toLowerCase().includes(targetSkill))
      );
    }

    if (q) {
      const keyword = String(q).toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.user.fullName.toLowerCase().includes(keyword) ||
          (c.headline && c.headline.toLowerCase().includes(keyword)) ||
          (c.careerObjective && c.careerObjective.toLowerCase().includes(keyword)) ||
          c.skills.some((s) => s.skill.name.toLowerCase().includes(keyword)) ||
          c.projects.some((p) => p.title.toLowerCase().includes(keyword) || p.technologies.toLowerCase().includes(keyword))
      );
    }

    res.json({ candidates: filtered, totalCount: filtered.length });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to search candidates' });
  }
};

export const getRankedCandidatesForJob = async (req: Request, res: Response): Promise<void> => {
  try {
    const { jobId } = req.params;

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        requiredSkills: { include: { skill: true } },
        preferredSkills: { include: { skill: true } },
      },
    });

    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    // Fetch all candidates and existing applications for this job
    const [candidates, existingApplications] = await Promise.all([
      prisma.candidateProfile.findMany({
        where: { user: { isActive: true } },
        include: {
          user: { select: { id: true, fullName: true, email: true, phone: true } },
          skills: { include: { skill: true } },
          experience: true,
          education: true,
          projects: true,
        },
      }),
      prisma.application.findMany({
        where: { jobId },
        include: { notes: true, interviews: true, statusHistory: { orderBy: { timestamp: 'desc' } } },
      }),
    ]);

    const appMap = new Map(existingApplications.map((a) => [a.candidateProfileId, a]));

    const jobInput = {
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

    const startTime = performance.now();
    const ranked = candidates.map((candidate) => {
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

      const match = CompatibilityScorer.calculate(candidateInput, jobInput);
      const app = appMap.get(candidate.id);

      return {
        candidate,
        compatibilityScore: match.totalScore,
        scoreBreakdown: match.breakdown,
        matchingRequiredSkills: match.matchingRequiredSkills,
        missingRequiredSkills: match.missingRequiredSkills,
        matchingPreferredSkills: match.matchingPreferredSkills,
        isFullyQualified: match.isFullyQualified,
        explanation: match.explanation,
        hasApplied: !!app,
        application: app || null,
        status: app ? app.status : 'NOT_APPLIED',
      };
    });

    const duration = parseFloat((performance.now() - startTime).toFixed(3));
    await DSAMetricsTracker.recordMetric('CompatibilityScoring', duration, candidates.length, job.requiredSkills.length, 'Candidate ranking for job');

    // Deterministic ranking sort
    ranked.sort((a, b) =>
      CompatibilityScorer.compareCandidates(
        {
          score: a.compatibilityScore,
          reqCoverage: a.matchingRequiredSkills.length / Math.max(1, job.requiredSkills.length),
          experienceYears: a.candidate.yearsOfExperience,
          candidateId: a.candidate.id,
        },
        {
          score: b.compatibilityScore,
          reqCoverage: b.matchingRequiredSkills.length / Math.max(1, job.requiredSkills.length),
          experienceYears: b.candidate.yearsOfExperience,
          candidateId: b.candidate.id,
        }
      )
    );

    res.json({
      job,
      rankedCandidates: ranked,
      totalCandidates: ranked.length,
      executionTimeMs: duration,
    });
  } catch (err: any) {
    console.error('getRankedCandidatesForJob error:', err);
    res.status(500).json({ error: 'Failed to rank candidates for job' });
  }
};

export const updateApplicationStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { applicationId } = req.params;
    const { status, comment } = req.body; // "SHORTLISTED", "INTERVIEW_SCHEDULED", "SELECTED", "REJECTED", "UNDER_REVIEW"

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        job: true,
        candidateProfile: { include: { user: true } },
      },
    });

    if (!application) {
      res.status(404).json({ error: 'Application not found' });
      return;
    }

    const previousStatus = application.status;

    // Update status and append to status history
    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: {
        status,
        statusHistory: {
          create: {
            fromStatus: previousStatus,
            toStatus: status,
            changedByRole: 'RECRUITER',
            changedByUserId: req.user?.id,
            comment: comment || `Status updated from ${previousStatus} to ${status} by recruiter.`,
          },
        },
      },
      include: {
        statusHistory: { orderBy: { timestamp: 'desc' } },
      },
    });

    // Notify candidate
    await prisma.notification.create({
      data: {
        userId: application.candidateProfile.user.id,
        title: `Application Status Updated: ${status.replace('_', ' ')}`,
        message: `Your application for ${application.job.title} is now marked as "${status.replace('_', ' ')}".`,
        type: 'STATUS_CHANGE',
        linkUrl: '/candidate/applications',
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user?.id,
        action: 'UPDATE_APPLICATION_STATUS',
        targetModel: 'Application',
        targetId: applicationId,
        metadataJson: JSON.stringify({ fromStatus: previousStatus, toStatus: status, comment }),
      },
    });

    res.json({ message: 'Application status updated successfully', application: updated });
  } catch (err: any) {
    console.error('updateApplicationStatus error:', err);
    res.status(500).json({ error: 'Failed to update application status' });
  }
};

export const addNote = async (req: Request, res: Response): Promise<void> => {
  try {
    const recruiterProfileId = req.user?.recruiterProfileId;
    const { applicationId } = req.params;
    const { noteText } = req.body;

    if (!recruiterProfileId || !noteText) {
      res.status(400).json({ error: 'Note text is required' });
      return;
    }

    const note = await prisma.recruiterNote.create({
      data: {
        recruiterProfileId,
        applicationId,
        noteText,
      },
    });

    res.status(201).json({ message: 'Note added successfully', note });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to add recruiter note' });
  }
};

export const scheduleInterview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { applicationId } = req.params;
    const { title, scheduledAt, durationMins, meetingLink, interviewType } = req.body;

    const interview = await prisma.interview.create({
      data: {
        applicationId,
        title: title || 'Technical Interview',
        scheduledAt: new Date(scheduledAt),
        durationMins: durationMins ? parseInt(durationMins) : 45,
        meetingLink: meetingLink || 'https://meet.google.com/xyz-resumematch',
        interviewType: interviewType || 'Technical',
        status: 'SCHEDULED',
      },
      include: {
        application: {
          include: {
            job: true,
            candidateProfile: { include: { user: true } },
          },
        },
      },
    });

    // Update application status to INTERVIEW_SCHEDULED
    await prisma.application.update({
      where: { id: applicationId },
      data: {
        status: 'INTERVIEW_SCHEDULED',
        statusHistory: {
          create: {
            fromStatus: interview.application.status,
            toStatus: 'INTERVIEW_SCHEDULED',
            changedByRole: 'RECRUITER',
            comment: `Interview scheduled for ${new Date(scheduledAt).toLocaleString()}: ${title}`,
          },
        },
      },
    });

    // Notify candidate
    await prisma.notification.create({
      data: {
        userId: interview.application.candidateProfile.user.id,
        title: `Interview Scheduled: ${title}`,
        message: `An interview for ${interview.application.job.title} is scheduled on ${new Date(scheduledAt).toLocaleString()}.`,
        type: 'INTERVIEW',
        linkUrl: '/candidate/applications',
      },
    });

    res.status(201).json({ message: 'Interview scheduled successfully', interview });
  } catch (err: any) {
    console.error('scheduleInterview error:', err);
    res.status(500).json({ error: 'Failed to schedule interview' });
  }
};

export const optimizeAssignments = async (req: Request, res: Response): Promise<void> => {
  try {
    const recruiterProfileId = req.user?.recruiterProfileId;
    if (!recruiterProfileId) {
      res.status(404).json({ error: 'Recruiter profile not found' });
      return;
    }

    const { jobIds, candidateIds } = req.body;

    if (!Array.isArray(jobIds) || !Array.isArray(candidateIds) || jobIds.length === 0 || candidateIds.length === 0) {
      res.status(400).json({ error: 'Please select at least one role and one candidate for talent allocation.' });
      return;
    }

    // Fetch jobs
    const jobs = await prisma.job.findMany({
      where: { id: { in: jobIds } },
      include: {
        company: true,
        requiredSkills: { include: { skill: true } },
        preferredSkills: { include: { skill: true } },
      },
    });

    // Fetch candidates
    const candidates = await prisma.candidateProfile.findMany({
      where: { id: { in: candidateIds } },
      include: {
        user: true,
        skills: { include: { skill: true } },
        experience: true,
        education: true,
        projects: true,
      },
    });

    // Build role items and candidate items
    const roleItems = jobs.map((j) => ({
      id: j.id,
      title: j.title,
      companyName: j.company.name,
      requiredSkills: j.requiredSkills.map((r) => r.skill.name),
    }));

    const candidateItems = candidates.map((c) => ({
      id: c.id,
      name: c.user.fullName,
      skills: c.skills.map((s) => s.skill.name),
    }));

    // Precalculate scores using CompatibilityScorer
    const scoreMatrixFn = (role: any, cand: any) => {
      const fullJob = jobs.find((j) => j.id === role.id)!;
      const fullCand = candidates.find((c) => c.id === cand.id)!;

      const jobInput = {
        jobId: fullJob.id,
        title: fullJob.title,
        domain: fullJob.domain,
        minExperienceYears: fullJob.minExperienceYears,
        requiredSkills: fullJob.requiredSkills.map((r) => ({
          skillId: r.skillId,
          name: r.skill.name,
          minExpYears: r.minExpYears,
        })),
        preferredSkills: fullJob.preferredSkills.map((p) => ({
          skillId: p.skillId,
          name: p.skill.name,
        })),
      };

      const candInput = {
        candidateId: fullCand.id,
        name: fullCand.user.fullName,
        preferredDomain: fullCand.preferredDomain,
        yearsOfExperience: fullCand.yearsOfExperience,
        skills: fullCand.skills.map((s) => ({
          skillId: s.skillId,
          name: s.skill.name,
          proficiencyLevel: s.proficiencyLevel,
          yearsOfExperience: s.yearsOfExperience,
        })),
        projects: fullCand.projects.map((p) => ({
          title: p.title,
          technologies: p.technologies,
          description: p.description,
        })),
        education: fullCand.education.map((e) => ({
          degree: e.degree,
        })),
      };

      const match = CompatibilityScorer.calculate(candInput, jobInput);
      return {
        score: match.totalScore,
        supportingSkills: match.matchingRequiredSkills,
      };
    };

    // Execute Kuhn-Munkres Hungarian Algorithm
    const result = HungarianAlgorithm.optimizeAssignment(roleItems, candidateItems, scoreMatrixFn);

    // Save run in database
    const assignmentRun = await prisma.assignmentRun.create({
      data: {
        recruiterProfileId,
        algorithmUsed: 'HUNGARIAN',
        totalScore: result.totalScore,
        executionTimeMs: result.executionTimeMs,
        results: {
          create: result.assignments.map((a) => ({
            jobId: a.roleId,
            candidateProfileId: a.candidateId,
            matchScore: a.compatibilityScore,
            supportingSkills: JSON.stringify(a.supportingSkills),
            isConfirmed: false,
          })),
        },
      },
      include: { results: true },
    });

    // Record metric
    await DSAMetricsTracker.recordMetric(
      'HungarianMatching',
      result.executionTimeMs,
      roleItems.length * candidateItems.length,
      result.assignments.length,
      `Allocated ${result.assignments.length} roles`
    );

    res.json({
      message: 'Talent allocation completed using Hungarian Bipartite Matching algorithm.',
      assignmentRunId: assignmentRun.id,
      ...result,
    });
  } catch (err: any) {
    console.error('optimizeAssignments error:', err);
    res.status(500).json({ error: 'Failed to optimize talent allocation' });
  }
};

export const recommendTeam = async (req: Request, res: Response): Promise<void> => {
  try {
    const recruiterProfileId = req.user?.recruiterProfileId;
    if (!recruiterProfileId) {
      res.status(404).json({ error: 'Recruiter profile not found' });
      return;
    }

    const { projectName, description, requiredSkills, targetTeamSize = 4, domain } = req.body;

    if (!projectName || !Array.isArray(requiredSkills) || requiredSkills.length === 0) {
      res.status(400).json({ error: 'Please enter a project name and at least one required skill.' });
      return;
    }

    // Fetch candidate pool
    const candidates = await prisma.candidateProfile.findMany({
      where: { user: { isActive: true } },
      include: {
        user: true,
        skills: { include: { skill: true } },
      },
    });

    const candidatePool = candidates.map((c) => ({
      id: c.id,
      name: c.user.fullName,
      headline: c.headline,
      experienceYears: c.yearsOfExperience,
      skills: c.skills.map((s) => s.skill.name),
    }));

    // Execute Greedy Set Cover Algorithm
    const result = GreedySetCoverTeam.formTeam(
      requiredSkills,
      candidatePool,
      parseInt(String(targetTeamSize))
    );

    // Save project in database
    const teamProject = await prisma.teamProject.create({
      data: {
        recruiterProfileId,
        projectName,
        description: description || '',
        targetTeamSize: parseInt(String(targetTeamSize)),
        domain: domain || 'General Engineering',
        recommendations: {
          create: result.teamMembers.map((m) => ({
            candidateProfileId: m.candidateId,
            skillsContributed: JSON.stringify(m.skillsContributed),
            selectionOrder: m.selectionStep,
          })),
        },
      },
      include: { recommendations: true },
    });

    // Record metric
    await DSAMetricsTracker.recordMetric(
      'GreedySetCover',
      result.executionTimeMs,
      requiredSkills.length,
      result.teamMembers.length,
      `Team formation: covered ${result.totalSkillsCovered}/${result.totalSkillsRequired} skills`
    );

    res.json({
      message: 'Project team formed using Greedy Set Cover Approximation algorithm.',
      teamProjectId: teamProject.id,
      ...result,
    });
  } catch (err: any) {
    console.error('recommendTeam error:', err);
    res.status(500).json({ error: 'Failed to recommend project team' });
  }
};
