import { BriefCreationRequest, BriefCreationResponse, LinkedInProfile } from '../types/profile';
import { AuthManager } from './auth';

const BASE_URL = 'https://meetingbrief.com';

export class MeetingBriefAPI {
  /**
   * Create a meeting brief from LinkedIn profile data
   */
  static async createBrief(profileData: LinkedInProfile, notes?: string): Promise<BriefCreationResponse> {
    try {
      const headers = await AuthManager.getAuthHeaders();
      
      const response = await fetch(`${BASE_URL}/api/briefs`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          profile: {
            name: profileData.fullName,
            title: profileData.headline,
            company: profileData.company,
            location: profileData.location,
            about: profileData.about,
            linkedinUrl: profileData.profileUrl,
            experience: profileData.experience?.map(exp => ({
              title: exp.title,
              company: exp.company,
              duration: exp.duration,
              description: exp.description
            })) || []
          },
          notes: notes || ''
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please sign in to create meeting briefs');
        }
        if (response.status === 429) {
          throw new Error('You have reached your monthly brief limit. Please upgrade your plan.');
        }
        throw new Error(`Failed to create brief: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        briefId: data.id,
        brief: data.content,
        redirectUrl: `${BASE_URL}/dashboard?brief=${data.id}`
      };
    } catch (error) {
      console.error('Brief creation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get user's usage statistics
   */
  static async getUsage(): Promise<{ remaining: number; total: number; plan: string }> {
    try {
      const headers = await AuthManager.getAuthHeaders();
      
      const response = await fetch(`${BASE_URL}/api/usage`, {
        method: 'GET',
        headers,
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch usage data');
      }

      const data = await response.json();
      return {
        remaining: data.remaining || 0,
        total: data.total || 0,
        plan: data.plan || 'free'
      };
    } catch (error) {
      console.error('Usage fetch failed:', error);
      return { remaining: 0, total: 0, plan: 'free' };
    }
  }

  /**
   * Get user's brief history
   */
  static async getBriefHistory(): Promise<Array<{ id: string; name: string; createdAt: string }>> {
    try {
      const headers = await AuthManager.getAuthHeaders();
      
      const response = await fetch(`${BASE_URL}/api/briefs/history`, {
        method: 'GET',
        headers,
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch brief history');
      }

      const data = await response.json();
      return data.briefs || [];
    } catch (error) {
      console.error('Brief history fetch failed:', error);
      return [];
    }
  }

  /**
   * Check if the service is available
   */
  static async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${BASE_URL}/api/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
} 