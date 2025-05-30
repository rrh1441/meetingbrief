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

  // src/popup/popup.ts
  var PopupController = class {
    constructor() {
      this.currentProfile = null;
      this.isCreatingBrief = false;
      this.init();
    }
    async init() {
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => this.setupElements());
      } else {
        this.setupElements();
      }
    }
    setupElements() {
      this.loadingDiv = document.getElementById("loading");
      this.authRequiredDiv = document.getElementById("auth-required");
      this.mainInterfaceDiv = document.getElementById("main-interface");
      this.statusDiv = document.getElementById("status");
      this.usageInfoDiv = document.getElementById("usage-info");
      this.profilePreviewDiv = document.getElementById("profile-preview");
      this.notesTextarea = document.getElementById("notes");
      this.createBriefBtn = document.getElementById("create-brief-btn");
      this.signInBtn = document.getElementById("sign-in-btn");
      this.createBriefBtn.addEventListener("click", () => this.handleCreateBrief());
      this.signInBtn.addEventListener("click", () => this.handleSignIn());
      this.initialize();
    }
    async initialize() {
      var _a;
      try {
        const authState = await AuthManager.getAuthState();
        if (!authState.isAuthenticated) {
          this.showAuthRequired();
          return;
        }
        this.showMainInterface();
        await this.loadUsageInfo();
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        const currentTab = tabs[0];
        if (!((_a = currentTab.url) == null ? void 0 : _a.includes("linkedin.com/in/"))) {
          this.showStatus("Please navigate to a LinkedIn profile page to create a brief.", "info");
          return;
        }
        await this.loadProfileData(currentTab.id);
      } catch (error) {
        console.error("Popup initialization error:", error);
        this.showStatus("Failed to initialize extension. Please try again.", "error");
      }
    }
    showAuthRequired() {
      this.loadingDiv.classList.add("hidden");
      this.authRequiredDiv.classList.remove("hidden");
      this.mainInterfaceDiv.classList.add("hidden");
    }
    showMainInterface() {
      this.loadingDiv.classList.add("hidden");
      this.authRequiredDiv.classList.add("hidden");
      this.mainInterfaceDiv.classList.remove("hidden");
    }
    async handleSignIn() {
      try {
        this.signInBtn.disabled = true;
        this.signInBtn.innerHTML = '<div class="spinner"></div> Signing in...';
        const authState = await AuthManager.authenticate();
        if (authState.isAuthenticated) {
          await this.initialize();
        } else {
          this.showStatus("Sign in failed. Please try again.", "error");
          this.signInBtn.disabled = false;
          this.signInBtn.innerHTML = "Sign in with Google";
        }
      } catch (error) {
        console.error("Sign in error:", error);
        this.showStatus("Sign in failed. Please try again.", "error");
        this.signInBtn.disabled = false;
        this.signInBtn.innerHTML = "Sign in with Google";
      }
    }
    async loadUsageInfo() {
      try {
        const usage = await AuthManager.checkUsage();
        if (usage.remaining <= 0) {
          this.usageInfoDiv.innerHTML = `
          You have reached your monthly brief limit. 
          <a href="https://meetingbrief.com/pricing" target="_blank" style="color: #0073b1; text-decoration: underline;">
            Upgrade your plan
          </a> to create more briefs.
        `;
          this.usageInfoDiv.classList.remove("hidden");
          this.createBriefBtn.disabled = true;
        } else if (usage.remaining <= 2) {
          this.usageInfoDiv.innerHTML = `
          \u26A0\uFE0F You have ${usage.remaining} brief${usage.remaining === 1 ? "" : "s"} remaining this month.
        `;
          this.usageInfoDiv.classList.remove("hidden");
        } else {
          this.usageInfoDiv.classList.add("hidden");
        }
      } catch (error) {
        console.error("Usage check failed:", error);
      }
    }
    async loadProfileData(tabId) {
      try {
        const response = await chrome.tabs.sendMessage(tabId, {
          type: "PROFILE_EXTRACTED"
        });
        if (response.profile) {
          this.currentProfile = response.profile;
          this.renderProfile(response.profile);
          this.createBriefBtn.disabled = false;
        } else {
          setTimeout(() => this.loadProfileData(tabId), 2e3);
        }
      } catch (error) {
        console.error("Profile loading error:", error);
        this.showStatus("Could not extract profile data. Please refresh the page and try again.", "error");
      }
    }
    renderProfile(profile) {
      const avatar = profile.imageUrl ? `<img src="${profile.imageUrl}" alt="${profile.fullName}" class="profile-avatar">` : `<div class="profile-avatar">${profile.fullName.charAt(0).toUpperCase()}</div>`;
      this.profilePreviewDiv.className = "profile-preview";
      this.profilePreviewDiv.innerHTML = `
      <div class="profile-header">
        ${avatar}
        <div class="profile-info">
          <h3>${profile.fullName}</h3>
          <p>${profile.headline || profile.position || "LinkedIn Professional"}</p>
        </div>
      </div>
      <div class="profile-details">
        ${profile.company ? `<div><strong>Company:</strong> ${profile.company}</div>` : ""}
        ${profile.location ? `<div><strong>Location:</strong> ${profile.location}</div>` : ""}
        ${profile.experience && profile.experience.length > 0 ? `<div><strong>Recent Experience:</strong> ${profile.experience[0].title} at ${profile.experience[0].company}</div>` : ""}
      </div>
    `;
    }
    async handleCreateBrief() {
      if (this.isCreatingBrief || !this.currentProfile) return;
      try {
        this.isCreatingBrief = true;
        this.createBriefBtn.disabled = true;
        this.createBriefBtn.innerHTML = '<div class="spinner"></div> Creating Brief...';
        const notes = this.notesTextarea.value.trim();
        const response = await chrome.runtime.sendMessage({
          type: "CREATE_BRIEF",
          data: {
            profile: this.currentProfile,
            notes
          }
        });
        if (response.success) {
          this.showStatus(`
          \u{1F389} Brief created successfully! 
          <a href="${response.redirectUrl}" target="_blank" style="color: #155724; text-decoration: underline;">
            Click here to view
          </a>
        `, "success");
          await this.loadUsageInfo();
          this.notesTextarea.value = "";
        } else {
          if (response.requiresAuth) {
            this.showAuthRequired();
          } else if (response.requiresUpgrade) {
            this.showStatus(`
            ${response.error} 
            <a href="https://meetingbrief.com/pricing" target="_blank" style="color: #721c24; text-decoration: underline;">
              Upgrade now
            </a>
          `, "error");
          } else {
            this.showStatus(response.error || "Failed to create brief", "error");
          }
        }
      } catch (error) {
        console.error("Brief creation error:", error);
        this.showStatus("Failed to create brief. Please try again.", "error");
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
    showStatus(message, type) {
      this.statusDiv.className = `status ${type}`;
      this.statusDiv.innerHTML = message;
      this.statusDiv.classList.remove("hidden");
      if (type !== "error") {
        setTimeout(() => {
          this.statusDiv.classList.add("hidden");
        }, 5e3);
      }
    }
  };
  new PopupController();
})();
//# sourceMappingURL=popup.js.map