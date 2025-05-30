import { AuthManager } from '../utils/auth';
import { LinkedInProfile, AuthState } from '../types/profile';

class PopupController {
  private currentProfile: LinkedInProfile | null = null;
  private isCreatingBrief = false;

  // DOM elements
  private loadingDiv!: HTMLElement;
  private authRequiredDiv!: HTMLElement;
  private mainInterfaceDiv!: HTMLElement;
  private statusDiv!: HTMLElement;
  private usageInfoDiv!: HTMLElement;
  private profilePreviewDiv!: HTMLElement;
  private notesTextarea!: HTMLTextAreaElement;
  private createBriefBtn!: HTMLButtonElement;
  private signInBtn!: HTMLButtonElement;

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupElements());
    } else {
      this.setupElements();
    }
  }

  private setupElements(): void {
    // Get DOM elements
    this.loadingDiv = document.getElementById('loading')!;
    this.authRequiredDiv = document.getElementById('auth-required')!;
    this.mainInterfaceDiv = document.getElementById('main-interface')!;
    this.statusDiv = document.getElementById('status')!;
    this.usageInfoDiv = document.getElementById('usage-info')!;
    this.profilePreviewDiv = document.getElementById('profile-preview')!;
    this.notesTextarea = document.getElementById('notes') as HTMLTextAreaElement;
    this.createBriefBtn = document.getElementById('create-brief-btn') as HTMLButtonElement;
    this.signInBtn = document.getElementById('sign-in-btn') as HTMLButtonElement;

    // Bind event handlers
    this.createBriefBtn.addEventListener('click', () => this.handleCreateBrief());
    this.signInBtn.addEventListener('click', () => this.handleSignIn());

    // Initialize the popup
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      // Check authentication status
      const authState = await AuthManager.getAuthState();
      
      if (!authState.isAuthenticated) {
        this.showAuthRequired();
        return;
      }

      // Show main interface
      this.showMainInterface();

      // Load usage information
      await this.loadUsageInfo();

      // Get current tab and check if it's LinkedIn
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const currentTab = tabs[0];

      if (!currentTab.url?.includes('linkedin.com/in/')) {
        this.showStatus('Please navigate to a LinkedIn profile page to create a brief.', 'info');
        return;
      }

      // Request profile data from content script
      await this.loadProfileData(currentTab.id!);

    } catch (error) {
      console.error('Popup initialization error:', error);
      this.showStatus('Failed to initialize extension. Please try again.', 'error');
    }
  }

  private showAuthRequired(): void {
    this.loadingDiv.classList.add('hidden');
    this.authRequiredDiv.classList.remove('hidden');
    this.mainInterfaceDiv.classList.add('hidden');
  }

  private showMainInterface(): void {
    this.loadingDiv.classList.add('hidden');
    this.authRequiredDiv.classList.add('hidden');
    this.mainInterfaceDiv.classList.remove('hidden');
  }

  private async handleSignIn(): Promise<void> {
    try {
      this.signInBtn.disabled = true;
      this.signInBtn.innerHTML = '<div class="spinner"></div> Signing in...';

      const authState = await AuthManager.authenticate();
      
      if (authState.isAuthenticated) {
        // Refresh the popup
        await this.initialize();
      } else {
        this.showStatus('Sign in failed. Please try again.', 'error');
        this.signInBtn.disabled = false;
        this.signInBtn.innerHTML = 'Sign in with Google';
      }
    } catch (error) {
      console.error('Sign in error:', error);
      this.showStatus('Sign in failed. Please try again.', 'error');
      this.signInBtn.disabled = false;
      this.signInBtn.innerHTML = 'Sign in with Google';
    }
  }

  private async loadUsageInfo(): Promise<void> {
    try {
      const usage = await AuthManager.checkUsage();
      
      if (usage.remaining <= 0) {
        this.usageInfoDiv.innerHTML = `
          You have reached your monthly brief limit. 
          <a href="https://meetingbrief.com/pricing" target="_blank" style="color: #0073b1; text-decoration: underline;">
            Upgrade your plan
          </a> to create more briefs.
        `;
        this.usageInfoDiv.classList.remove('hidden');
        this.createBriefBtn.disabled = true;
      } else if (usage.remaining <= 2) {
        this.usageInfoDiv.innerHTML = `
          ⚠️ You have ${usage.remaining} brief${usage.remaining === 1 ? '' : 's'} remaining this month.
        `;
        this.usageInfoDiv.classList.remove('hidden');
      } else {
        this.usageInfoDiv.classList.add('hidden');
      }
    } catch (error) {
      console.error('Usage check failed:', error);
    }
  }

  private async loadProfileData(tabId: number): Promise<void> {
    try {
      // Request profile data from content script
      const response = await chrome.tabs.sendMessage(tabId, {
        type: 'PROFILE_EXTRACTED'
      });

      if (response.profile) {
        this.currentProfile = response.profile;
        this.renderProfile(response.profile);
        this.createBriefBtn.disabled = false;
      } else {
        // Profile not ready yet, wait a bit and try again
        setTimeout(() => this.loadProfileData(tabId), 2000);
      }
    } catch (error) {
      console.error('Profile loading error:', error);
      this.showStatus('Could not extract profile data. Please refresh the page and try again.', 'error');
    }
  }

  private renderProfile(profile: LinkedInProfile): void {
    const avatar = profile.imageUrl 
      ? `<img src="${profile.imageUrl}" alt="${profile.fullName}" class="profile-avatar">`
      : `<div class="profile-avatar">${profile.fullName.charAt(0).toUpperCase()}</div>`;

    this.profilePreviewDiv.className = 'profile-preview';
    this.profilePreviewDiv.innerHTML = `
      <div class="profile-header">
        ${avatar}
        <div class="profile-info">
          <h3>${profile.fullName}</h3>
          <p>${profile.headline || profile.position || 'LinkedIn Professional'}</p>
        </div>
      </div>
      <div class="profile-details">
        ${profile.company ? `<div><strong>Company:</strong> ${profile.company}</div>` : ''}
        ${profile.location ? `<div><strong>Location:</strong> ${profile.location}</div>` : ''}
        ${profile.experience && profile.experience.length > 0 ? 
          `<div><strong>Recent Experience:</strong> ${profile.experience[0].title} at ${profile.experience[0].company}</div>` : ''
        }
      </div>
    `;
  }

  private async handleCreateBrief(): Promise<void> {
    if (this.isCreatingBrief || !this.currentProfile) return;

    try {
      this.isCreatingBrief = true;
      this.createBriefBtn.disabled = true;
      this.createBriefBtn.innerHTML = '<div class="spinner"></div> Creating Brief...';

      const notes = this.notesTextarea.value.trim();

      // Send creation request to background script
      const response = await chrome.runtime.sendMessage({
        type: 'CREATE_BRIEF',
        data: {
          profile: this.currentProfile,
          notes: notes
        }
      });

      if (response.success) {
        this.showStatus(`
          🎉 Brief created successfully! 
          <a href="${response.redirectUrl}" target="_blank" style="color: #155724; text-decoration: underline;">
            Click here to view
          </a>
        `, 'success');
        
        // Update usage info
        await this.loadUsageInfo();
        
        // Clear notes
        this.notesTextarea.value = '';
      } else {
        if (response.requiresAuth) {
          this.showAuthRequired();
        } else if (response.requiresUpgrade) {
          this.showStatus(`
            ${response.error} 
            <a href="https://meetingbrief.com/pricing" target="_blank" style="color: #721c24; text-decoration: underline;">
              Upgrade now
            </a>
          `, 'error');
        } else {
          this.showStatus(response.error || 'Failed to create brief', 'error');
        }
      }
    } catch (error) {
      console.error('Brief creation error:', error);
      this.showStatus('Failed to create brief. Please try again.', 'error');
    } finally {
      this.isCreatingBrief = false;
      this.createBriefBtn.disabled = false;
      this.createBriefBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
          <polyline points="14,2 14,8 20,8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10,9 9,9 8,9"/>
        </svg>
        Create Meeting Brief
      `;
    }
  }

  private showStatus(message: string, type: 'info' | 'error' | 'success'): void {
    this.statusDiv.className = `status ${type}`;
    this.statusDiv.innerHTML = message;
    this.statusDiv.classList.remove('hidden');

    // Auto-hide success/info messages after 5 seconds
    if (type !== 'error') {
      setTimeout(() => {
        this.statusDiv.classList.add('hidden');
      }, 5000);
    }
  }
}

// Initialize popup when DOM is ready
new PopupController(); 