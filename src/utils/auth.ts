import { AuthState } from '../types/profile';

const BASE_URL = 'https://meetingbrief.com';

export class AuthManager {
  private static readonly TOKEN_KEY = 'meetingbrief_token';
  private static readonly USER_KEY = 'meetingbrief_user';

  /**
   * Get current authentication state
   */
  static async getAuthState(): Promise<AuthState> {
    try {
      const stored = await chrome.storage.local.get([this.TOKEN_KEY, this.USER_KEY]);
      
      if (!stored[this.TOKEN_KEY]) {
        return { isAuthenticated: false };
      }

      // Verify token with Better Auth
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
      console.error('Auth state check failed:', error);
      return { isAuthenticated: false };
    }
  }

  /**
   * Authenticate user via Google OAuth using Better Auth
   */
  static async authenticate(): Promise<AuthState> {
    try {
      // Use Chrome identity API for OAuth
      const redirectUrl = chrome.identity.getRedirectURL();
      
      const authUrl = `${BASE_URL}/api/auth/google?` + new URLSearchParams({
        redirect_uri: redirectUrl,
        response_type: 'code',
        scope: 'openid email profile'
      });

      return new Promise((resolve) => {
        chrome.identity.launchWebAuthFlow({
          url: authUrl,
          interactive: true
        }, async (responseUrl) => {
          if (chrome.runtime.lastError || !responseUrl) {
            console.error('OAuth failed:', chrome.runtime.lastError);
            resolve({ isAuthenticated: false });
            return;
          }

          try {
            // Extract auth code from callback URL
            const url = new URL(responseUrl);
            const code = url.searchParams.get('code');
            
            if (!code) {
              throw new Error('No auth code received');
            }

            // Exchange code for session with Better Auth
            const tokenResponse = await fetch(`${BASE_URL}/api/auth/callback/google`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                code,
                redirectUrl
              }),
              credentials: 'include'
            });

            if (!tokenResponse.ok) {
              throw new Error('Token exchange failed');
            }

            const authData = await tokenResponse.json();

            // Store session data
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
            console.error('Auth callback failed:', error);
            resolve({ isAuthenticated: false });
          }
        });
      });
    } catch (error) {
      console.error('Authentication failed:', error);
      return { isAuthenticated: false };
    }
  }

  /**
   * Sign out user
   */
  static async signOut(): Promise<void> {
    try {
      const authState = await this.getAuthState();
      
      if (authState.isAuthenticated && authState.token) {
        // Call Better Auth sign out endpoint
        await fetch(`${BASE_URL}/api/auth/sign-out`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authState.token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
      }
    } catch (error) {
      console.error('Sign out API call failed:', error);
    } finally {
      await this.clearAuth();
    }
  }

  /**
   * Clear local authentication data
   */
  private static async clearAuth(): Promise<void> {
    await chrome.storage.local.remove([this.TOKEN_KEY, this.USER_KEY]);
  }

  /**
   * Verify session with Better Auth
   */
  private static async verifySession(token: string): Promise<boolean> {
    try {
      const response = await fetch(`${BASE_URL}/api/auth/session`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      return response.ok;
    } catch (error) {
      console.error('Session verification failed:', error);
      return false;
    }
  }

  /**
   * Get authenticated fetch headers
   */
  static async getAuthHeaders(): Promise<HeadersInit> {
    const authState = await this.getAuthState();
    
    if (authState.isAuthenticated && authState.token) {
      return {
        'Authorization': `Bearer ${authState.token}`,
        'Content-Type': 'application/json'
      };
    }

    return {
      'Content-Type': 'application/json'
    };
  }

  /**
   * Check if user has remaining usage
   */
  static async checkUsage(): Promise<{ hasUsage: boolean; remaining: number }> {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${BASE_URL}/api/usage`, {
        method: 'GET',
        headers,
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Usage check failed');
      }

      const data = await response.json();
      return {
        hasUsage: data.remaining > 0,
        remaining: data.remaining
      };
    } catch (error) {
      console.error('Usage check failed:', error);
      return { hasUsage: false, remaining: 0 };
    }
  }
}