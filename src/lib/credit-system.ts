import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export interface CreditBalance {
  subscriptionCredits: number;
  addonCredits: number;
  totalCredits: number;
  periodStart: Date | null;
  periodEnd: Date | null;
}

export interface CreditUsage {
  success: boolean;
  subscriptionUsed: number;
  addonUsed: number;
  remainingSubscription: number;
  remainingAddon: number;
}

export class CreditSystem {
  
  /**
   * Get current credit balance for a user
   */
  static async getUserCreditBalance(userId: string): Promise<CreditBalance> {
    const client = await pool.connect();
    
    try {
      const result = await client.query(
        'SELECT * FROM get_user_credit_balance($1)',
        [userId]
      );
      
      if (result.rows.length === 0) {
        // User not found, return zero balance
        return {
          subscriptionCredits: 0,
          addonCredits: 0,
          totalCredits: 0,
          periodStart: null,
          periodEnd: null
        };
      }
      
      const row = result.rows[0];
      return {
        subscriptionCredits: row.subscription_credits || 0,
        addonCredits: row.addon_credits || 0,
        totalCredits: row.total_credits || 0,
        periodStart: row.period_start ? new Date(row.period_start) : null,
        periodEnd: row.period_end ? new Date(row.period_end) : null
      };
    } finally {
      client.release();
    }
  }
  
  /**
   * Use one credit (deducts from subscription first, then addon)
   */
  static async useCredit(userId: string, briefId: number): Promise<CreditUsage> {
    const client = await pool.connect();
    
    try {
      const result = await client.query(
        'SELECT * FROM use_credit($1, $2)',
        [userId, briefId]
      );
      
      if (result.rows.length === 0) {
        throw new Error('Failed to use credit');
      }
      
      const row = result.rows[0];
      return {
        success: row.success,
        subscriptionUsed: row.subscription_used,
        addonUsed: row.addon_used,
        remainingSubscription: row.remaining_subscription,
        remainingAddon: row.remaining_addon
      };
    } finally {
      client.release();
    }
  }
  
  /**
   * Grant subscription credits (typically called when subscription renews)
   */
  static async grantSubscriptionCredits(
    userId: string,
    creditAmount: number,
    periodStart: Date,
    periodEnd: Date,
    planName: string
  ): Promise<void> {
    const client = await pool.connect();
    
    try {
      await client.query(
        'SELECT grant_subscription_credits($1, $2, $3, $4, $5)',
        [userId, creditAmount, periodStart, periodEnd, planName]
      );
    } finally {
      client.release();
    }
  }
  
  /**
   * Add addon credits (typically called when user purchases credit pack)
   */
  static async addAddonCredits(
    userId: string,
    creditAmount: number,
    stripeSessionId?: string
  ): Promise<void> {
    const client = await pool.connect();
    
    try {
      await client.query(
        'SELECT add_addon_credits($1, $2, $3)',
        [userId, creditAmount, stripeSessionId || null]
      );
    } finally {
      client.release();
    }
  }
  
  /**
   * Check if user can generate a brief
   */
  static async canUserGenerate(userId: string): Promise<boolean> {
    const balance = await this.getUserCreditBalance(userId);
    return balance.totalCredits > 0;
  }
  
  /**
   * Get plan limits for reference
   */
  static getPlanLimits() {
    return {
      free: 5,
      starter: 50,
    };
  }
  
  /**
   * Reset subscription credits for billing cycle
   */
  static async resetSubscriptionCredits(userId: string, planName: string): Promise<void> {
    const limits = this.getPlanLimits();
    const creditAmount = limits[planName as keyof typeof limits] || limits.free;
    
    // Calculate next billing period (monthly)
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
    
    await this.grantSubscriptionCredits(userId, creditAmount, periodStart, periodEnd, planName);
  }
}