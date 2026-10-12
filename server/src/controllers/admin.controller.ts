import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const getAnalytics = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [
      totalCandidates,
      totalRecruiters,
      totalCompanies,
      activeJobs,
      closedJobs,
      totalApplications,
      applicationsByStatus,
      recentUsers,
      jobsByDomain,
      skillCounts,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'CANDIDATE' } }),
      prisma.user.count({ where: { role: 'RECRUITER' } }),
      prisma.company.count(),
      prisma.job.count({ where: { status: 'ACTIVE' } }),
      prisma.job.count({ where: { status: 'CLOSED' } }),
      prisma.application.count(),
      prisma.application.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
      prisma.user.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        select: { id: true, fullName: true, email: true, role: true, isActive: true, createdAt: true },
      }),
      prisma.job.groupBy({
        by: ['domain'],
        _count: { _all: true },
      }),
      prisma.candidateSkill.groupBy({
        by: ['skillId'],
        _count: { _all: true },
        take: 10,
        orderBy: { _count: { skillId: 'desc' } },
      }),
    ]);

    // Map status counts
    const statusMap: Record<string, number> = {};
    for (const s of applicationsByStatus) {
      statusMap[s.status] = s._count._all;
    }

    const applied = totalApplications;
    const shortlisted = statusMap['SHORTLISTED'] || 0;
    const interviews = statusMap['INTERVIEW_SCHEDULED'] || 0;
    const selected = statusMap['SELECTED'] || 0;
    const rejected = statusMap['REJECTED'] || 0;
    const underReview = statusMap['UNDER_REVIEW'] || 0;

    const conversionRate = applied > 0 ? parseFloat(((selected / applied) * 100).toFixed(1)) : 0;
    const shortlistRate = applied > 0 ? parseFloat(((shortlisted / applied) * 100).toFixed(1)) : 0;

    // Resolve skill names for popular skills
    const popularSkillsWithNames = await Promise.all(
      skillCounts.map(async (sc) => {
        const sk = await prisma.skill.findUnique({ where: { id: sc.skillId } });
        return {
          name: sk?.name || 'Unknown',
          count: sc._count._all,
          category: sk?.category || 'General',
        };
      })
    );

    res.json({
      analytics: {
        overview: {
          totalCandidates,
          totalRecruiters,
          totalCompanies,
          activeJobs,
          closedJobs,
          totalApplications,
          underReview,
          shortlisted,
          interviews,
          selected,
          rejected,
          conversionRate,
          shortlistRate,
        },
        jobsByDomain: jobsByDomain.map((j) => ({ domain: j.domain, count: j._count._all })),
        popularSkills: popularSkillsWithNames,
        recentUsers,
      },
    });
  } catch (err: any) {
    console.error('admin getAnalytics error:', err);
    res.status(500).json({ error: 'Failed to retrieve administrative analytics' });
  }
};

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role, search } = req.query;

    const users = await prisma.user.findMany({
      where: {
        ...(role ? { role: String(role) } : {}),
        ...(search
          ? {
              OR: [
                { fullName: { contains: String(search) } },
                { email: { contains: String(search) } },
              ],
            }
          : {}),
      },
      include: {
        candidateProfile: { select: { preferredDomain: true, yearsOfExperience: true } },
        recruiterProfile: { include: { company: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ users });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve users' });
  }
};

export const updateUserStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (user.role === 'ADMIN' && req.user?.id !== userId) {
      res.status(403).json({ error: 'Cannot deactivate an administrator account' });
      return;
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { isActive: Boolean(isActive) },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user?.id,
        action: isActive ? 'ACTIVATE_USER' : 'DEACTIVATE_USER',
        targetModel: 'User',
        targetId: userId,
        metadataJson: JSON.stringify({ email: user.email, newStatus: isActive }),
      },
    });

    res.json({ message: `User ${isActive ? 'activated' : 'deactivated'} successfully`, user: updated });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update user status' });
  }
};

export const getJobs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, search } = req.query;

    const jobs = await prisma.job.findMany({
      where: {
        ...(status ? { status: String(status) } : {}),
        ...(search
          ? {
              OR: [
                { title: { contains: String(search) } },
                { company: { name: { contains: String(search) } } },
              ],
            }
          : {}),
      },
      include: {
        company: true,
        recruiterProfile: { include: { user: { select: { fullName: true, email: true } } } },
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ jobs });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve jobs' });
  }
};

export const updateJobStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { jobId } = req.params;
    const { status } = req.body; // "ACTIVE", "CLOSED", "ARCHIVED"

    const updated = await prisma.job.update({
      where: { id: jobId },
      data: { status },
      include: { company: true },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user?.id,
        action: 'ADMIN_UPDATE_JOB_STATUS',
        targetModel: 'Job',
        targetId: jobId,
        metadataJson: JSON.stringify({ title: updated.title, newStatus: status }),
      },
    });

    res.json({ message: 'Job status updated', job: updated });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update job status' });
  }
};

export const getAuditLogs = async (_req: Request, res: Response): Promise<void> => {
  try {
    const logs = await prisma.auditLog.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, fullName: true, email: true, role: true } },
      },
    });

    res.json({ logs });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve audit logs' });
  }
};

export const getAlgorithmMetrics = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [metrics, aggregateStats] = await Promise.all([
      prisma.algorithmMetric.findMany({
        take: 50,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.algorithmMetric.groupBy({
        by: ['algorithmName'],
        _avg: { executionTimeMs: true },
        _count: { _all: true },
        _max: { executionTimeMs: true },
        _min: { executionTimeMs: true },
      }),
    ]);

    const formattedAverages = aggregateStats.map((stat) => ({
      algorithmName: stat.algorithmName,
      invocations: stat._count._all,
      avgLatencyMs: parseFloat((stat._avg.executionTimeMs || 0).toFixed(3)),
      maxLatencyMs: parseFloat((stat._max.executionTimeMs || 0).toFixed(3)),
      minLatencyMs: parseFloat((stat._min.executionTimeMs || 0).toFixed(3)),
    }));

    res.json({
      metrics,
      aggregateStats: formattedAverages,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve algorithm metrics' });
  }
};
