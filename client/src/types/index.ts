export type UserRole = 'CANDIDATE' | 'RECRUITER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  phone?: string;
  isActive?: boolean;
  createdAt?: string;
  candidateProfileId?: string;
  recruiterProfileId?: string;
  candidateProfile?: any;
  recruiterProfile?: any;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
}

export interface CandidateSkill {
  id: string;
  skillId: string;
  proficiencyLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  yearsOfExperience: number;
  isVerifiedByResume: boolean;
  skill: Skill;
}

export interface CandidateExperience {
  id: string;
  jobTitle: string;
  companyName: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description?: string;
  technologiesUsed?: string;
}

export interface CandidateEducation {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startYear: number;
  endYear?: number;
  grade?: string;
}

export interface CandidateProject {
  id: string;
  title: string;
  description: string;
  technologies: string;
  projectUrl?: string;
  githubUrl?: string;
}

export interface CandidateProfile {
  id: string;
  userId: string;
  headline?: string;
  careerObjective?: string;
  preferredDomain?: string;
  yearsOfExperience: number;
  location?: string;
  preferredWorkMode?: string;
  employmentType?: string;
  expectedSalaryMin?: number;
  expectedSalaryMax?: number;
  availabilityNotice?: string;
  portfolioUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  profileCompletedPercent: number;
  user: {
    fullName: string;
    email: string;
    phone?: string;
    avatarUrl?: string;
  };
  skills: CandidateSkill[];
  experience: CandidateExperience[];
  education: CandidateEducation[];
  projects: CandidateProject[];
}

export interface Company {
  id: string;
  name: string;
  logoUrl?: string;
  industry?: string;
  description?: string;
  location?: string;
  website?: string;
  isVerified?: boolean;
}

export interface Job {
  id: string;
  title: string;
  domain: string;
  description: string;
  openings: number;
  location: string;
  workMode: string;
  employmentType: string;
  minExperienceYears: number;
  maxExperienceYears?: number;
  salaryMin?: number;
  salaryMax?: number;
  status: 'ACTIVE' | 'PAUSED' | 'CLOSED' | 'ARCHIVED';
  deadline?: string;
  educationRequired?: string;
  createdAt: string;
  company: Company;
  requiredSkills: { skillId: string; minExpYears: number; skill: Skill }[];
  preferredSkills: { skillId: string; skill: Skill }[];
  compatibilityScore?: number;
  scoreBreakdown?: {
    requiredSkillsScore: number;
    preferredSkillsScore: number;
    experienceScore: number;
    domainProjectScore: number;
    educationScore: number;
  };
  matchingRequiredSkills?: string[];
  missingRequiredSkills?: string[];
  matchingPreferredSkills?: string[];
  isFullyQualified?: boolean;
  explanation?: string;
  hasApplied?: boolean;
  applicationStatus?: string;
  isSaved?: boolean;
  stats?: {
    applicants: number;
    shortlisted: number;
    interview: number;
    selected: number;
    avgScore: number;
  };
}

export interface Application {
  id: string;
  candidateProfileId: string;
  jobId: string;
  status: 'APPLIED' | 'UNDER_REVIEW' | 'SHORTLISTED' | 'INTERVIEW_SCHEDULED' | 'SELECTED' | 'REJECTED' | 'WITHDRAWN';
  compatibilityScore: number;
  scoreBreakdownJson?: string;
  coverLetter?: string;
  createdAt: string;
  updatedAt: string;
  job: Job;
  candidateProfile?: CandidateProfile;
  statusHistory?: {
    id: string;
    fromStatus: string;
    toStatus: string;
    changedByRole: string;
    comment?: string;
    timestamp: string;
  }[];
  interviews?: {
    id: string;
    title: string;
    scheduledAt: string;
    durationMins: number;
    meetingLink?: string;
    interviewType: string;
    status: string;
  }[];
  notes?: {
    id: string;
    noteText: string;
    createdAt: string;
  }[];
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  linkUrl?: string;
  createdAt: string;
}
