import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { CreditSystem } from "@/lib/credit-system";
import { 
  createSecureErrorResponse,
  validateUserId
} from "@/lib/api-security";

export async function GET() {
  try {
    const headersList = await headers();
    
    // Get session using Better Auth
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate user ID
    if (!validateUserId(session.user.id)) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    // Get credit balance using new credit system
    const creditBalance = await CreditSystem.getUserCreditBalance(session.user.id);
    
    console.log(`[DEBUG] Credit balance for ${session.user.id}:`, creditBalance);
    
    // Calculate usage for legacy compatibility
    const totalAvailable = creditBalance.subscriptionCredits + creditBalance.addonCredits;
    const planName = creditBalance.subscriptionCredits > 5 ? 'starter' : 'free';
    const originalLimit = planName === 'starter' ? 50 : 5;
    const currentMonthUsed = originalLimit - creditBalance.subscriptionCredits;
    
    return NextResponse.json({
      // New format
      subscriptionCredits: creditBalance.subscriptionCredits,
      addonCredits: creditBalance.addonCredits,
      totalCredits: totalAvailable,
      periodStart: creditBalance.periodStart,
      periodEnd: creditBalance.periodEnd,
      
      // Legacy format for compatibility
      currentMonthCount: Math.max(0, currentMonthUsed),
      monthlyLimit: originalLimit,
      planName,
    });

  } catch (error) {
    console.error('Error fetching credit balance:', error);
    return createSecureErrorResponse(error, "Failed to fetch usage data");
  }
} 