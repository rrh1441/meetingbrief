import { LinkedInProfile, ExperienceItem } from '../types/profile';

export class LinkedInExtractor {
  /**
   * Extract profile data from LinkedIn page
   * Tries JSON-LD blocks first, falls back to DOM parsing
   */
  static extractProfile(): LinkedInProfile | null {
    try {
      // Try JSON-LD extraction first
      const jsonProfile = this.extractFromJsonLD();
      if (jsonProfile) return jsonProfile;

      // Fallback to DOM extraction
      return this.extractFromDOM();
    } catch (error) {
      console.error('Profile extraction failed:', error);
      return null;
    }
  }

  private static extractFromJsonLD(): LinkedInProfile | null {
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    
    for (const script of scripts) {
      try {
        const data = JSON.parse(script.textContent || '');
        if (data['@type'] === 'Person' || data.name) {
          return {
            fullName: data.name || '',
            headline: data.jobTitle || data.headline || '',
            location: data.address?.addressLocality || '',
            company: data.worksFor?.name || '',
            position: data.jobTitle || '',
            profileUrl: window.location.href,
            imageUrl: data.image || '',
            about: data.description || ''
          };
        }
      } catch (e) {
        continue;
      }
    }

    // Try Profile Card API data
    const profileData = this.extractFromProfileCard();
    if (profileData) return profileData;

    return null;
  }

  private static extractFromProfileCard(): LinkedInProfile | null {
    try {
      // LinkedIn often stores profile data in window.voyager or similar
      const voyagerData = (window as any).voyager;
      if (voyagerData?.profile) {
        const profile = voyagerData.profile;
        return {
          fullName: profile.firstName + ' ' + profile.lastName,
          headline: profile.headline,
          location: profile.locationName,
          profileUrl: window.location.href,
          imageUrl: profile.pictureUrl,
          about: profile.summary
        };
      }

      // Try Apollo cache
      const apolloCache = (window as any).__APOLLO_STATE__;
      if (apolloCache) {
        // Extract from Apollo cache structure
        const profileKeys = Object.keys(apolloCache).filter(key => 
          key.includes('Profile:') || key.includes('Person:')
        );
        
        if (profileKeys.length > 0) {
          const profileData = apolloCache[profileKeys[0]];
          return {
            fullName: `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim(),
            headline: profileData.headline,
            location: profileData.geoLocationName,
            profileUrl: window.location.href,
            imageUrl: profileData.picture?.['com.linkedin.common.VectorImage']?.artifacts?.[0]?.fileIdentifyingUrlPathSegment
          };
        }
      }
    } catch (error) {
      console.error('Profile card extraction failed:', error);
    }
    return null;
  }

  private static extractFromDOM(): LinkedInProfile | null {
    try {
      // Main profile section
      const profileSection = document.querySelector('.pv-top-card') || 
                           document.querySelector('.ph5.pb5') ||
                           document.querySelector('[data-section="profile"]');

      if (!profileSection) return null;

      // Name extraction
      const nameElement = profileSection.querySelector('h1') ||
                         document.querySelector('h1.text-heading-xlarge') ||
                         document.querySelector('[data-anonymize="person-name"]');
      
      const fullName = nameElement?.textContent?.trim() || '';

      // Headline
      const headlineElement = profileSection.querySelector('.text-body-medium.break-words') ||
                             document.querySelector('[data-anonymize="headline"]') ||
                             document.querySelector('.pv-top-card--headline');
      
      const headline = headlineElement?.textContent?.trim() || '';

      // Location
      const locationElement = profileSection.querySelector('.text-body-small.inline.t-black--light.break-words') ||
                             document.querySelector('[data-anonymize="location"]');
      
      const location = locationElement?.textContent?.trim() || '';

      // Profile image
      const imageElement = profileSection.querySelector('img.pv-top-card-profile-picture__image') ||
                          document.querySelector('.profile-photo-edit__preview') ||
                          document.querySelector('img[data-anonymize="headshot-photo"]');
      
      const imageUrl = imageElement?.getAttribute('src') || '';

      // About section
      const aboutSection = document.querySelector('#about') || 
                          document.querySelector('[data-section="aboutSection"]');
      
      let about = '';
      if (aboutSection) {
        const aboutText = aboutSection.nextElementSibling?.querySelector('.pv-shared-text-with-see-more') ||
                         aboutSection.parentElement?.querySelector('.display-flex.full-width');
        about = aboutText?.textContent?.trim() || '';
      }

      // Experience section
      const experience = this.extractExperienceFromDOM();

      // Current position/company from experience or profile
      const currentJob = experience?.[0];
      const company = currentJob?.company || '';
      const position = currentJob?.title || headline;

      return {
        fullName,
        headline,
        location,
        company,
        position,
        profileUrl: window.location.href,
        imageUrl,
        about,
        experience
      };

    } catch (error) {
      console.error('DOM extraction failed:', error);
      return null;
    }
  }

  private static extractExperienceFromDOM(): ExperienceItem[] {
    try {
      const experienceSection = document.querySelector('#experience') || 
                               document.querySelector('[data-section="experienceSection"]');
      
      if (!experienceSection) return [];

      const experienceItems: ExperienceItem[] = [];
      const experienceList = experienceSection.parentElement?.querySelectorAll('li.artdeco-list__item') ||
                            document.querySelectorAll('.pvs-list__item--line-separated');

      experienceList.forEach(item => {
        try {
          const titleElement = item.querySelector('.mr1.hoverable-link-text.t-bold') ||
                              item.querySelector('[data-anonymize="job-title"]');
          const title = titleElement?.textContent?.trim() || '';

          const companyElement = item.querySelector('.t-normal') ||
                                item.querySelector('[data-anonymize="company-name"]');
          const company = companyElement?.textContent?.trim() || '';

          const durationElement = item.querySelector('.t-black--light.t-normal') ||
                                 item.querySelector('[data-anonymize="duration"]');
          const duration = durationElement?.textContent?.trim() || '';

          const locationElement = item.querySelector('.t-black--light.t-normal.mt1') ||
                                 item.querySelector('[data-anonymize="job-location"]');
          const location = locationElement?.textContent?.trim() || '';

          if (title && company) {
            experienceItems.push({
              title,
              company,
              duration,
              location
            });
          }
        } catch (e) {
          console.warn('Failed to extract experience item:', e);
        }
      });

      return experienceItems;
    } catch (error) {
      console.error('Experience extraction failed:', error);
      return [];
    }
  }

  /**
   * Get LinkedIn profile ID from URL
   */
  static getProfileId(): string | null {
    const match = window.location.pathname.match(/\/in\/([^\/]+)/);
    return match ? match[1] : null;
  }

  /**
   * Check if current page is a LinkedIn profile
   */
  static isLinkedInProfile(): boolean {
    return window.location.hostname.includes('linkedin.com') && 
           window.location.pathname.startsWith('/in/');
  }
} 