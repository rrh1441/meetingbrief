import { LinkedInExtractor } from '../src/utils/linkedin-extractor';
import { readFileSync } from 'fs';
import { join } from 'path';

// Mock DOM environment
const mockDocument = (html: string) => {
  const dom = new DOMParser().parseFromString(html, 'text/html');
  (global as any).document = dom;
  (global as any).window = {
    location: {
      href: 'https://www.linkedin.com/in/john-doe/',
      hostname: 'linkedin.com',
      pathname: '/in/john-doe/'
    }
  };
};

describe('LinkedInExtractor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isLinkedInProfile', () => {
    it('should return true for LinkedIn profile URLs', () => {
      (global as any).window = {
        location: {
          hostname: 'linkedin.com',
          pathname: '/in/john-doe/'
        }
      };
      expect(LinkedInExtractor.isLinkedInProfile()).toBe(true);
    });

    it('should return false for non-LinkedIn URLs', () => {
      (global as any).window = {
        location: {
          hostname: 'google.com',
          pathname: '/search'
        }
      };
      expect(LinkedInExtractor.isLinkedInProfile()).toBe(false);
    });
  });

  describe('getProfileId', () => {
    it('should extract profile ID from LinkedIn URL', () => {
      (global as any).window = {
        location: {
          pathname: '/in/john-doe-12345/'
        }
      };
      expect(LinkedInExtractor.getProfileId()).toBe('john-doe-12345');
    });

    it('should return null for invalid URLs', () => {
      (global as any).window = {
        location: {
          pathname: '/company/test-company/'
        }
      };
      expect(LinkedInExtractor.getProfileId()).toBe(null);
    });
  });

  describe('extractProfile', () => {
    it('should extract profile from standard LinkedIn page', () => {
      const html = readFileSync(join(__dirname, 'fixtures/linkedin-profile-1.html'), 'utf-8');
      mockDocument(html);

      const profile = LinkedInExtractor.extractProfile();
      
      expect(profile).toBeTruthy();
      expect(profile?.fullName).toBe('John Doe');
      expect(profile?.headline).toBe('Senior Software Engineer at Tech Corp');
      expect(profile?.location).toBe('San Francisco, CA');
    });

    it('should extract profile from executive profile page', () => {
      const html = readFileSync(join(__dirname, 'fixtures/linkedin-profile-2.html'), 'utf-8');
      mockDocument(html);

      const profile = LinkedInExtractor.extractProfile();
      
      expect(profile).toBeTruthy();
      expect(profile?.fullName).toBe('Jane Smith');
      expect(profile?.company).toBe('Fortune 500 Corp');
    });

    it('should handle minimal profile data', () => {
      const html = readFileSync(join(__dirname, 'fixtures/linkedin-profile-3.html'), 'utf-8');
      mockDocument(html);

      const profile = LinkedInExtractor.extractProfile();
      
      expect(profile).toBeTruthy();
      expect(profile?.fullName).toBeTruthy();
    });

    it('should return null for invalid page structure', () => {
      const html = readFileSync(join(__dirname, 'fixtures/linkedin-profile-4.html'), 'utf-8');
      mockDocument(html);

      const profile = LinkedInExtractor.extractProfile();
      
      expect(profile).toBe(null);
    });
  });
}); 