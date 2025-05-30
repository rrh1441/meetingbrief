import { LinkedInProfile, ProxycurlProfile } from '../types/profile';

const PROXYCURL_API_KEY = 'YOUR_PROXYCURL_API_KEY'; // This should be set in manifest or env

export class ProxycurlService {
  /**
   * Fetch profile data from Proxycurl API
   */
  static async fetchProfile(linkedinUrl: string): Promise<LinkedInProfile | null> {
    try {
      const response = await fetch('https://nubela.co/proxycurl/api/v2/linkedin', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${PROXYCURL_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          linkedin_profile_url: linkedinUrl,
          extra: 'include',
          github_profile_id: 'include',
          facebook_profile_id: 'include',
          twitter_profile_id: 'include',
          personal_contact_number: 'include',
          personal_email: 'include',
          inferred_salary: 'include',
          skills: 'include',
          use_cache: 'if-present',
          fallback_to_cache: 'on-error'
        })
      });

      if (!response.ok) {
        throw new Error(`Proxycurl API error: ${response.status}`);
      }

      const data: ProxycurlProfile = await response.json();
      return this.transformToLinkedInProfile(data, linkedinUrl);
    } catch (error) {
      console.error('Proxycurl fetch failed:', error);
      return null;
    }
  }

  /**
   * Transform Proxycurl response to LinkedInProfile format
   */
  private static transformToLinkedInProfile(data: ProxycurlProfile, originalUrl: string): LinkedInProfile {
    // Get current experience (first in list, if any)
    const currentExperience = data.experiences?.[0];
    
    // Transform experience items
    const experience = data.experiences?.map(exp => ({
      title: exp.title || '',
      company: exp.company || '',
      duration: this.formatDuration(exp.starts_at, exp.ends_at),
      location: exp.location || '',
      description: exp.description || ''
    })) || [];

    // Format education
    const education = data.education?.map(edu => 
      `${edu.degree_name} ${edu.field_of_study} at ${edu.school}`
    ).join(', ') || '';

    return {
      fullName: data.full_name || '',
      headline: data.headline || '',
      location: [data.city, data.country].filter(Boolean).join(', '),
      company: currentExperience?.company || '',
      position: currentExperience?.title || data.occupation || '',
      education,
      profileUrl: originalUrl,
      imageUrl: data.profile_pic_url || '',
      about: data.summary || '',
      experience
    };
  }

  /**
   * Format duration from Proxycurl date objects
   */
  private static formatDuration(
    startDate: { day: number; month: number; year: number } | null,
    endDate: { day: number; month: number; year: number } | null
  ): string {
    if (!startDate) return '';

    const start = `${this.getMonthName(startDate.month)} ${startDate.year}`;
    
    if (!endDate) {
      return `${start} - Present`;
    }

    const end = `${this.getMonthName(endDate.month)} ${endDate.year}`;
    return `${start} - ${end}`;
  }

  private static getMonthName(month: number): string {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return months[month - 1] || '';
  }

  /**
   * Check if Proxycurl service is available
   */
  static isAvailable(): boolean {
    return !!PROXYCURL_API_KEY && PROXYCURL_API_KEY !== 'YOUR_PROXYCURL_API_KEY';
  }
} 