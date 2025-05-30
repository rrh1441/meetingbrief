(() => {
  // src/utils/auth.ts
  var BASE_URL = "https://meetingbrief.com";
  var AuthManager = class {
    /**
     * Get current authentication state
     */
    static async getAuthState() {
      try {
        const stored = await chrome.storage.local.get([this.TOKEN_KEY, this.USER_KEY]);
        if (!stored[this.TOKEN_KEY]) {
          return { isAuthenticated: false };
        }
        const isValid = await this.verifySession(stored[this.TOKEN_KEY]);
        if (!isValid) {
          await this.clearAuth();
          return { isAuthenticated: false };
        }
        return {
          isAuthenticated: true,
          user: stored[this.USER_KEY],
          token: stored[this.TOKEN_KEY]
        };
      } catch (error) {
        console.error("Auth state check failed:", error);
        return { isAuthenticated: false };
      }
    }
    /**
     * Authenticate user via Google OAuth using Better Auth
     */
    static async authenticate() {
      try {
        const redirectUrl = chrome.identity.getRedirectURL();
        const authUrl = `${BASE_URL}/api/auth/google?` + new URLSearchParams({
          redirect_uri: redirectUrl,
          response_type: "code",
          scope: "openid email profile"
        });
        return new Promise((resolve) => {
          chrome.identity.launchWebAuthFlow({
            url: authUrl,
            interactive: true
          }, async (responseUrl) => {
            if (chrome.runtime.lastError || !responseUrl) {
              console.error("OAuth failed:", chrome.runtime.lastError);
              resolve({ isAuthenticated: false });
              return;
            }
            try {
              const url = new URL(responseUrl);
              const code = url.searchParams.get("code");
              if (!code) {
                throw new Error("No auth code received");
              }
              const tokenResponse = await fetch(`${BASE_URL}/api/auth/callback/google`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  code,
                  redirectUrl
                }),
                credentials: "include"
              });
              if (!tokenResponse.ok) {
                throw new Error("Token exchange failed");
              }
              const authData = await tokenResponse.json();
              await chrome.storage.local.set({
                [this.TOKEN_KEY]: authData.token || authData.sessionToken,
                [this.USER_KEY]: authData.user
              });
              resolve({
                isAuthenticated: true,
                user: authData.user,
                token: authData.token || authData.sessionToken
              });
            } catch (error) {
              console.error("Auth callback failed:", error);
              resolve({ isAuthenticated: false });
            }
          });
        });
      } catch (error) {
        console.error("Authentication failed:", error);
        return { isAuthenticated: false };
      }
    }
    /**
     * Sign out user
     */
    static async signOut() {
      try {
        const authState = await this.getAuthState();
        if (authState.isAuthenticated && authState.token) {
          await fetch(`${BASE_URL}/api/auth/sign-out`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${authState.token}`,
              "Content-Type": "application/json"
            },
            credentials: "include"
          });
        }
      } catch (error) {
        console.error("Sign out API call failed:", error);
      } finally {
        await this.clearAuth();
      }
    }
    /**
     * Clear local authentication data
     */
    static async clearAuth() {
      await chrome.storage.local.remove([this.TOKEN_KEY, this.USER_KEY]);
    }
    /**
     * Verify session with Better Auth
     */
    static async verifySession(token) {
      try {
        const response = await fetch(`${BASE_URL}/api/auth/session`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          credentials: "include"
        });
        return response.ok;
      } catch (error) {
        console.error("Session verification failed:", error);
        return false;
      }
    }
    /**
     * Get authenticated fetch headers
     */
    static async getAuthHeaders() {
      const authState = await this.getAuthState();
      if (authState.isAuthenticated && authState.token) {
        return {
          "Authorization": `Bearer ${authState.token}`,
          "Content-Type": "application/json"
        };
      }
      return {
        "Content-Type": "application/json"
      };
    }
    /**
     * Check if user has remaining usage
     */
    static async checkUsage() {
      try {
        const headers = await this.getAuthHeaders();
        const response = await fetch(`${BASE_URL}/api/usage`, {
          method: "GET",
          headers,
          credentials: "include"
        });
        if (!response.ok) {
          throw new Error("Usage check failed");
        }
        const data = await response.json();
        return {
          hasUsage: data.remaining > 0,
          remaining: data.remaining
        };
      } catch (error) {
        console.error("Usage check failed:", error);
        return { hasUsage: false, remaining: 0 };
      }
    }
  };
  AuthManager.TOKEN_KEY = "meetingbrief_token";
  AuthManager.USER_KEY = "meetingbrief_user";

  // src/utils/api-client.ts
  var BASE_URL2 = "https://meetingbrief.com";
  var MeetingBriefAPI = class {
    /**
     * Create a meeting brief from LinkedIn profile data
     */
    static async createBrief(profileData, notes) {
      var _a;
      try {
        const headers = await AuthManager.getAuthHeaders();
        const response = await fetch(`${BASE_URL2}/api/briefs`, {
          method: "POST",
          headers,
          credentials: "include",
          body: JSON.stringify({
            profile: {
              name: profileData.fullName,
              title: profileData.headline,
              company: profileData.company,
              location: profileData.location,
              about: profileData.about,
              linkedinUrl: profileData.profileUrl,
              experience: ((_a = profileData.experience) == null ? void 0 : _a.map((exp) => ({
                title: exp.title,
                company: exp.company,
                duration: exp.duration,
                description: exp.description
              }))) || []
            },
            notes: notes || ""
          })
        });
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Please sign in to create meeting briefs");
          }
          if (response.status === 429) {
            throw new Error("You have reached your monthly brief limit. Please upgrade your plan.");
          }
          throw new Error(`Failed to create brief: ${response.statusText}`);
        }
        const data = await response.json();
        return {
          success: true,
          briefId: data.id,
          brief: data.content,
          redirectUrl: `${BASE_URL2}/dashboard?brief=${data.id}`
        };
      } catch (error) {
        console.error("Brief creation failed:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error occurred"
        };
      }
    }
    /**
     * Get user's usage statistics
     */
    static async getUsage() {
      try {
        const headers = await AuthManager.getAuthHeaders();
        const response = await fetch(`${BASE_URL2}/api/usage`, {
          method: "GET",
          headers,
          credentials: "include"
        });
        if (!response.ok) {
          throw new Error("Failed to fetch usage data");
        }
        const data = await response.json();
        return {
          remaining: data.remaining || 0,
          total: data.total || 0,
          plan: data.plan || "free"
        };
      } catch (error) {
        console.error("Usage fetch failed:", error);
        return { remaining: 0, total: 0, plan: "free" };
      }
    }
    /**
     * Get user's brief history
     */
    static async getBriefHistory() {
      try {
        const headers = await AuthManager.getAuthHeaders();
        const response = await fetch(`${BASE_URL2}/api/briefs/history`, {
          method: "GET",
          headers,
          credentials: "include"
        });
        if (!response.ok) {
          throw new Error("Failed to fetch brief history");
        }
        const data = await response.json();
        return data.briefs || [];
      } catch (error) {
        console.error("Brief history fetch failed:", error);
        return [];
      }
    }
    /**
     * Check if the service is available
     */
    static async healthCheck() {
      try {
        const response = await fetch(`${BASE_URL2}/api/health`, {
          method: "GET",
          headers: { "Content-Type": "application/json" }
        });
        return response.ok;
      } catch (error) {
        console.error("Health check failed:", error);
        return false;
      }
    }
  };

  // src/background.ts
  var BackgroundScript = class {
    constructor() {
      this.init();
    }
    init() {
      var _a;
      chrome.runtime.onInstalled.addListener(this.handleInstalled.bind(this));
      chrome.runtime.onMessage.addListener(this.handleMessage.bind(this));
      chrome.action.onClicked.addListener(this.handleActionClick.bind(this));
      (_a = chrome.webNavigation) == null ? void 0 : _a.onCompleted.addListener(this.handleNavigation.bind(this));
    }
    handleInstalled(details) {
      console.log("MeetingBrief extension installed:", details.reason);
      if (details.reason === "install") {
        chrome.tabs.create({
          url: "https://meetingbrief.com/extension-welcome"
        });
      }
    }
    async handleMessage(message, sender, sendResponse) {
      var _a;
      try {
        switch (message.type) {
          case "CREATE_BRIEF":
            await this.handleCreateBrief(message.data, sendResponse);
            break;
          case "AUTH_STATUS":
            const authState = await AuthManager.getAuthState();
            sendResponse(authState);
            break;
          case "OPEN_POPUP":
            await this.openPopup((_a = sender.tab) == null ? void 0 : _a.id);
            sendResponse({ success: true });
            break;
          default:
            sendResponse({ error: "Unknown message type" });
        }
      } catch (error) {
        console.error("Background message handling error:", error);
        sendResponse({
          error: error instanceof Error ? error.message : "Unknown error"
        });
      }
    }
    async handleCreateBrief(data, sendResponse) {
      try {
        const authState = await AuthManager.getAuthState();
        if (!authState.isAuthenticated) {
          sendResponse({
            success: false,
            error: "Please sign in to create meeting briefs",
            requiresAuth: true
          });
          return;
        }
        const usage = await AuthManager.checkUsage();
        if (!usage.hasUsage) {
          sendResponse({
            success: false,
            error: "You have reached your monthly brief limit. Please upgrade your plan.",
            requiresUpgrade: true
          });
          return;
        }
        const result = await MeetingBriefAPI.createBrief(data.profile, data.notes);
        if (result.success) {
          await this.showSuccessNotification(data.profile.fullName, result.redirectUrl);
          chrome.tabs.create({
            url: result.redirectUrl,
            active: false
          });
        }
        sendResponse(result);
      } catch (error) {
        console.error("Brief creation error:", error);
        sendResponse({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error occurred"
        });
      }
    }
    async handleActionClick(tab) {
      var _a;
      if ((_a = tab.url) == null ? void 0 : _a.includes("linkedin.com/in/")) {
        await this.openPopup(tab.id);
      } else {
        chrome.tabs.create({
          url: "https://www.linkedin.com"
        });
      }
    }
    async handleNavigation(details) {
      if (details.frameId !== 0 || !details.url.includes("linkedin.com/in/")) {
        return;
      }
      setTimeout(async () => {
        try {
          await chrome.tabs.sendMessage(details.tabId, {
            type: "PROFILE_EXTRACTED"
          });
        } catch (error) {
          console.log("Content script not ready yet");
        }
      }, 3e3);
    }
    async openPopup(tabId) {
      if (!tabId) return;
      try {
        await chrome.tabs.sendMessage(tabId, { type: "TOGGLE_POPUP" });
      } catch (error) {
        console.log("Could not communicate with content script");
      }
    }
    async showSuccessNotification(profileName, redirectUrl) {
      const notificationId = `brief-created-${Date.now()}`;
      await chrome.notifications.create(notificationId, {
        type: "basic",
        iconUrl: "icons/icon-48.png",
        title: "Meeting Brief Created!",
        message: `Brief for ${profileName} is ready. Click to view.`,
        buttons: [
          { title: "View Brief" },
          { title: "Dismiss" }
        ]
      });
      chrome.notifications.onButtonClicked.addListener((id, buttonIndex) => {
        if (id === notificationId && buttonIndex === 0) {
          chrome.tabs.create({ url: redirectUrl });
        }
        chrome.notifications.clear(id);
      });
      chrome.notifications.onClicked.addListener((id) => {
        if (id === notificationId) {
          chrome.tabs.create({ url: redirectUrl });
          chrome.notifications.clear(id);
        }
      });
      setTimeout(() => {
        chrome.notifications.clear(notificationId);
      }, 1e4);
    }
  };
  new BackgroundScript();
})();
//# sourceMappingURL=background.js.map