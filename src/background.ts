import { AuthManager } from './utils/auth';
import { MeetingBriefAPI } from './utils/api-client';
import { ExtensionMessage, BriefCreationResponse } from './types/profile';

class BackgroundScript {
  constructor() {
    this.init();
  }

  private init(): void {
    // Handle installation
    chrome.runtime.onInstalled.addListener(this.handleInstalled.bind(this));

    // Handle messages from content script and popup
    chrome.runtime.onMessage.addListener(this.handleMessage.bind(this));

    // Handle browser action click
    chrome.action.onClicked.addListener(this.handleActionClick.bind(this));

    // Handle web navigation to detect LinkedIn profile visits
    chrome.webNavigation?.onCompleted.addListener(this.handleNavigation.bind(this));
  }

  private handleInstalled(details: any): void {
    console.log('MeetingBrief extension installed:', details.reason);
    
    if (details.reason === 'install') {
      // Open welcome page or registration
      chrome.tabs.create({
        url: 'https://meetingbrief.com/extension-welcome'
      });
    }
  }

  private async handleMessage(
    message: ExtensionMessage,
    sender: any,
    sendResponse: (response: any) => void
  ): Promise<void> {
    try {
      switch (message.type) {
        case 'CREATE_BRIEF':
          await this.handleCreateBrief(message.data, sendResponse);
          break;

        case 'AUTH_STATUS':
          const authState = await AuthManager.getAuthState();
          sendResponse(authState);
          break;

        case 'OPEN_POPUP':
          await this.openPopup(sender.tab?.id);
          sendResponse({ success: true });
          break;

        default:
          sendResponse({ error: 'Unknown message type' });
      }
    } catch (error) {
      console.error('Background message handling error:', error);
      sendResponse({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  private async handleCreateBrief(
    data: { profile: any; notes?: string },
    sendResponse: (response: any) => void
  ): Promise<void> {
    try {
      // Check authentication
      const authState = await AuthManager.getAuthState();
      
      if (!authState.isAuthenticated) {
        sendResponse({
          success: false,
          error: 'Please sign in to create meeting briefs',
          requiresAuth: true
        });
        return;
      }

      // Check usage limits
      const usage = await AuthManager.checkUsage();
      if (!usage.hasUsage) {
        sendResponse({
          success: false,
          error: 'You have reached your monthly brief limit. Please upgrade your plan.',
          requiresUpgrade: true
        });
        return;
      }

      // Create the brief
      const result = await MeetingBriefAPI.createBrief(data.profile, data.notes);
      
      if (result.success) {
        // Show success notification
        await this.showSuccessNotification(data.profile.fullName, result.redirectUrl!);
        
        // Optionally open the brief in a new tab
        chrome.tabs.create({
          url: result.redirectUrl,
          active: false
        });
      }

      sendResponse(result);
    } catch (error) {
      console.error('Brief creation error:', error);
      sendResponse({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }

  private async handleActionClick(tab: any): Promise<void> {
    // If on LinkedIn profile page, open popup
    if (tab.url?.includes('linkedin.com/in/')) {
      await this.openPopup(tab.id);
    } else {
      // Otherwise, navigate to LinkedIn or show info
      chrome.tabs.create({
        url: 'https://www.linkedin.com'
      });
    }
  }

  private async handleNavigation(details: any): Promise<void> {
    // Only process main frame navigations to LinkedIn profiles
    if (details.frameId !== 0 || !details.url.includes('linkedin.com/in/')) {
      return;
    }

    // Wait a bit for page to load, then check if we can extract profile
    setTimeout(async () => {
      try {
        await chrome.tabs.sendMessage(details.tabId, {
          type: 'PROFILE_EXTRACTED'
        });
      } catch (error) {
        // Tab might not have content script loaded yet
        console.log('Content script not ready yet');
      }
    }, 3000);
  }

  private async openPopup(tabId?: number): Promise<void> {
    if (!tabId) return;

    // Check if popup is already open
    try {
      await chrome.tabs.sendMessage(tabId, { type: 'TOGGLE_POPUP' });
    } catch (error) {
      console.log('Could not communicate with content script');
    }
  }

  private async showSuccessNotification(profileName: string, redirectUrl: string): Promise<void> {
    const notificationId = `brief-created-${Date.now()}`;
    
    await chrome.notifications.create(notificationId, {
      type: 'basic',
      iconUrl: 'icons/icon-48.png',
      title: 'Meeting Brief Created!',
      message: `Brief for ${profileName} is ready. Click to view.`,
      buttons: [
        { title: 'View Brief' },
        { title: 'Dismiss' }
      ]
    });

    // Handle notification clicks
    chrome.notifications.onButtonClicked.addListener((id: any, buttonIndex: any) => {
      if (id === notificationId && buttonIndex === 0) {
        chrome.tabs.create({ url: redirectUrl });
      }
      chrome.notifications.clear(id);
    });

    chrome.notifications.onClicked.addListener((id: any) => {
      if (id === notificationId) {
        chrome.tabs.create({ url: redirectUrl });
        chrome.notifications.clear(id);
      }
    });

    // Auto-dismiss after 10 seconds
    setTimeout(() => {
      chrome.notifications.clear(notificationId);
    }, 10000);
  }
}

// Initialize background script
new BackgroundScript(); 