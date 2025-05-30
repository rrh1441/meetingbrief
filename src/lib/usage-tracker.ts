// Usage tracking for both anonymous and authenticated users
export interface UsageData {
  count: number;
  limit: number;
  isAuthenticated: boolean;
  needsSignup: boolean;
}

// Anonymous user limits
const ANONYMOUS_LIMIT = 2;
const AUTHENTICATED_FREE_LIMIT = 5;

// Local storage key for anonymous usage
const ANONYMOUS_USAGE_KEY = 'meetingbrief_anonymous_usage';

export class UsageTracker {
  // Get current usage for anonymous users
  static getAnonymousUsage(): { count: number; limit: number } {
    if (typeof window === 'undefined') {
      return { count: 0, limit: ANONYMOUS_LIMIT };
    }

    try {
      const stored = localStorage.getItem(ANONYMOUS_USAGE_KEY);
      if (!stored) {
        return { count: 0, limit: ANONYMOUS_LIMIT };
      }

      const data = JSON.parse(stored);
      
      // Reset count if it's a new month
      if (data.lastReset !== this.getCurrentMonth()) {
        return { count: 0, limit: ANONYMOUS_LIMIT };
      }

      return { 
        count: data.count || 0, 
        limit: ANONYMOUS_LIMIT 
      };
    } catch (error) {
      console.error('Error reading anonymous usage:', error);
      return { count: 0, limit: ANONYMOUS_LIMIT };
    }
  }

  // Increment anonymous usage
  static incrementAnonymousUsage(): void {
    if (typeof window === 'undefined') return;

    try {
      const current = this.getAnonymousUsage();
      const newCount = current.count + 1;
      
      const data = {
        count: newCount,
        lastReset: this.getCurrentMonth(),
        updatedAt: new Date().toISOString()
      };

      localStorage.setItem(ANONYMOUS_USAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error updating anonymous usage:', error);
    }
  }

  // Check if anonymous user can generate brief
  static canAnonymousUserGenerate(): boolean {
    const usage = this.getAnonymousUsage();
    return usage.count < usage.limit;
  }

  // Get current month key for resetting counts
  private static getCurrentMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${now.getMonth() + 1}`;
  }

  // Get usage data for authenticated users (call API)
  static async getAuthenticatedUsage(): Promise<{ count: number; limit: number; planName: string } | null> {
    try {
      const response = await fetch('/api/brief-usage', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        return {
          count: data.currentMonthCount,
          limit: data.monthlyLimit,
          planName: data.planName
        };
      }
    } catch (error) {
      console.error('Error fetching authenticated usage:', error);
    }

    return null;
  }

  // Main function to get usage data based on auth status
  static async getUsageData(isAuthenticated: boolean): Promise<UsageData> {
    if (isAuthenticated) {
      const authUsage = await this.getAuthenticatedUsage();
      if (authUsage) {
        return {
          count: authUsage.count,
          limit: authUsage.limit,
          isAuthenticated: true,
          needsSignup: false
        };
      }
      // Fallback if API fails
      return {
        count: 0,
        limit: AUTHENTICATED_FREE_LIMIT,
        isAuthenticated: true,
        needsSignup: false
      };
    } else {
      const anonUsage = this.getAnonymousUsage();
      return {
        count: anonUsage.count,
        limit: anonUsage.limit,
        isAuthenticated: false,
        needsSignup: anonUsage.count >= anonUsage.limit
      };
    }
  }

  // Check if user can generate (works for both anonymous and authenticated)
  static async canGenerate(isAuthenticated: boolean): Promise<boolean> {
    const usage = await this.getUsageData(isAuthenticated);
    return usage.count < usage.limit;
  }
} 