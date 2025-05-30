export interface LinkedInProfile {
  fullName: string;
  headline?: string;
  location?: string;
  company?: string;
  position?: string;
  education?: string;
  profileUrl: string;
  imageUrl?: string;
  about?: string;
  experience?: ExperienceItem[];
  connections?: string;
}

export interface ExperienceItem {
  title: string;
  company: string;
  duration?: string;
  location?: string;
  description?: string;
}

export interface ProxycurlProfile {
  full_name: string;
  headline: string;
  summary: string;
  country: string;
  city: string;
  occupation: string;
  profile_pic_url: string;
  experiences: ProxycurlExperience[];
  education: ProxycurlEducation[];
  public_identifier: string;
}

export interface ProxycurlExperience {
  title: string;
  company: string;
  description: string;
  starts_at: { day: number; month: number; year: number };
  ends_at: { day: number; month: number; year: number } | null;
  location: string;
}

export interface ProxycurlEducation {
  school: string;
  degree_name: string;
  field_of_study: string;
  starts_at: { day: number; month: number; year: number };
  ends_at: { day: number; month: number; year: number } | null;
}

export interface BriefCreationRequest {
  profileData: LinkedInProfile;
  notes?: string;
}

export interface BriefCreationResponse {
  success: boolean;
  briefId?: string;
  brief?: string;
  error?: string;
  redirectUrl?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
  };
  token?: string;
}

export interface ExtensionMessage {
  type: 'PROFILE_EXTRACTED' | 'CREATE_BRIEF' | 'AUTH_STATUS' | 'BRIEF_CREATED';
  data?: any;
  error?: string;
} 