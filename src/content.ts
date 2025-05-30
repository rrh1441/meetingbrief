import { LinkedInExtractor } from './utils/linkedin-extractor';
import { ProxycurlService } from './utils/proxycurl';
import { ExtensionMessage, LinkedInProfile } from './types/profile';

class ContentScript {
  private extractedProfile: LinkedInProfile | null = null;
  private isExtracting = false;

  constructor() {
    this.init();
  }

  private init(): void {
    // Only run on LinkedIn profile pages
    if (!LinkedInExtractor.isLinkedInProfile()) {
      return;
    }

    console.log('MeetingBrief: LinkedIn profile detected');

    // Listen for messages from popup/background
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sendResponse);
      return true; // Keep the message channel open for async response
    });

    // Extract profile data when page loads
    this.extractProfileData();

    // Re-extract if page content changes (SPA navigation)
    this.observePageChanges();

    // Add brief creation button to page
    this.addBriefButton();
  }

  private async handleMessage(message: ExtensionMessage, sendResponse: (response: any) => void): Promise<void> {
    switch (message.type) {
      case 'PROFILE_EXTRACTED':
        sendResponse({ profile: this.extractedProfile });
        break;

      case 'CREATE_BRIEF':
        if (!this.extractedProfile) {
          await this.extractProfileData();
        }
        
        if (this.extractedProfile) {
          // Send profile data to background script for processing
          chrome.runtime.sendMessage({
            type: 'CREATE_BRIEF',
            data: {
              profile: this.extractedProfile,
              notes: message.data?.notes || ''
            }
          });
          sendResponse({ success: true });
        } else {
          sendResponse({ success: false, error: 'Could not extract profile data' });
        }
        break;

      default:
        sendResponse({ error: 'Unknown message type' });
    }
  }

  private async extractProfileData(): Promise<void> {
    if (this.isExtracting) return;
    this.isExtracting = true;

    try {
      console.log('MeetingBrief: Extracting profile data...');
      
      // Try to extract from page
      let profile = LinkedInExtractor.extractProfile();
      
      // If extraction failed or incomplete, try Proxycurl fallback
      if (!profile || this.isProfileIncomplete(profile)) {
        console.log('MeetingBrief: Profile incomplete, trying Proxycurl fallback...');
        
        if (ProxycurlService.isAvailable()) {
          const proxycurlProfile = await ProxycurlService.fetchProfile(window.location.href);
          
          if (proxycurlProfile) {
            // Merge the data, preferring Proxycurl for missing fields
            profile = this.mergeProfileData(profile, proxycurlProfile);
          }
        }
      }

      this.extractedProfile = profile;
      
      if (profile) {
        console.log('MeetingBrief: Profile extracted successfully:', profile.fullName);
        
        // Notify popup that profile is ready
        chrome.runtime.sendMessage({
          type: 'PROFILE_EXTRACTED',
          data: profile
        });
      } else {
        console.warn('MeetingBrief: Failed to extract profile data');
      }
    } catch (error) {
      console.error('MeetingBrief: Profile extraction error:', error);
    } finally {
      this.isExtracting = false;
    }
  }

  private isProfileIncomplete(profile: LinkedInProfile): boolean {
    // Check if essential fields are missing
    return !profile.fullName || 
           (!profile.headline && !profile.position) ||
           !profile.company;
  }

  private mergeProfileData(primary: LinkedInProfile | null, fallback: LinkedInProfile): LinkedInProfile {
    if (!primary) return fallback;

    return {
      fullName: primary.fullName || fallback.fullName,
      headline: primary.headline || fallback.headline,
      location: primary.location || fallback.location,
      company: primary.company || fallback.company,
      position: primary.position || fallback.position,
      education: primary.education || fallback.education,
      profileUrl: primary.profileUrl,
      imageUrl: primary.imageUrl || fallback.imageUrl,
      about: primary.about || fallback.about,
      experience: primary.experience?.length ? primary.experience : fallback.experience,
      connections: primary.connections || fallback.connections
    };
  }

  private observePageChanges(): void {
    // Watch for LinkedIn SPA navigation
    let currentUrl = window.location.href;
    
    const observer = new MutationObserver(() => {
      if (window.location.href !== currentUrl) {
        currentUrl = window.location.href;
        
        if (LinkedInExtractor.isLinkedInProfile()) {
          console.log('MeetingBrief: Page navigation detected, re-extracting...');
          setTimeout(() => this.extractProfileData(), 2000); // Wait for page to load
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  private addBriefButton(): void {
    // Add a floating button to create brief
    const buttonId = 'meetingbrief-create-btn';
    
    // Remove existing button if present
    const existingButton = document.getElementById(buttonId);
    if (existingButton) {
      existingButton.remove();
    }

    const button = document.createElement('button');
    button.id = buttonId;
    button.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
        <polyline points="14,2 14,8 20,8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10,9 9,9 8,9"/>
      </svg>
      Create Brief
    `;
    
    button.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #0073b1;
      color: white;
      border: none;
      border-radius: 24px;
      padding: 12px 20px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 115, 177, 0.3);
      z-index: 9999;
      transition: all 0.2s ease;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    `;

    button.addEventListener('mouseenter', () => {
      button.style.transform = 'translateY(-2px)';
      button.style.boxShadow = '0 6px 16px rgba(0, 115, 177, 0.4)';
    });

    button.addEventListener('mouseleave', () => {
      button.style.transform = 'translateY(0)';
      button.style.boxShadow = '0 4px 12px rgba(0, 115, 177, 0.3)';
    });

    button.addEventListener('click', () => {
      // Open the extension popup or trigger brief creation
      chrome.runtime.sendMessage({ type: 'OPEN_POPUP' });
    });

    document.body.appendChild(button);
  }
}

// Initialize content script
new ContentScript(); 