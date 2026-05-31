export interface User {
  id: string;
  name: string;
  email: string;
  profileData: ProfileData | null;
  createdAt: string;
}

export interface ProfileData {
  currentRole?: string;
  yearsOfExperience?: number;
  preferredJobTypes?: string[];
  preferredLocations?: string[];
  expectedSalaryMin?: number;
  expectedSalaryMax?: number;
  onboardingComplete?: boolean;
}

export interface Resume {
  id: string;
  userId: string;
  filePath: string;
  extractedSkills: string[];
  createdAt: string;
}

export type PortalName = 'LinkedIn' | 'Naukri' | 'Indeed' | 'Internshala' | 'Wellfound';
export type CredentialStatus = 'pending' | 'connected' | 'failed';

export interface Credential {
  id: string;
  portal: PortalName;
  username: string;
  status: CredentialStatus;
  createdAt: string;
  updatedAt: string;
}

export type JobType = 'Full-time' | 'Part-time' | 'Contract' | 'Remote' | 'Hybrid' | 'Internship';

export interface Job {
  id: string;
  portal: PortalName;
  title: string;
  company: string;
  salary: string | null;
  location: string;
  jobType: JobType;
  description: string;
  url: string;
  postedAt: string;
  isSaved?: boolean;
}

export interface JobsResponse {
  jobs: Job[];
  total: number;
  page: number;
  pages: number;
}

export type ApplicationStatus =
  | 'Saved'
  | 'Applied'
  | 'Interview Scheduled'
  | 'Offer Received'
  | 'Rejected'
  | 'Withdrawn';

export interface Application {
  id: string;
  userId: string;
  jobId: string | null;
  job: Job | null;
  manualJob: ManualJob | null;
  status: ApplicationStatus;
  dateApplied: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ManualJob {
  title: string;
  company: string;
  url?: string;
  location?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface JobFilters {
  portal?: string;
  location?: string;
  jobType?: string;
  salaryMin?: number;
  salaryMax?: number;
  datePosted?: 'today' | 'week' | 'month';
  search?: string;
  page?: number;
  limit?: number;
}
