"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { useAuth } from "@/hooks/useAuth";

interface Subscription {
  id: string;
  plan: string;
  status: string;
  periodStart?: Date | undefined;
  periodEnd?: Date | undefined;
  cancelAtPeriodEnd?: boolean;
  limits?: Record<string, number> | undefined;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  priceId?: string;
}

const PLAN_FEATURES = {
  free: [
    "5 MeetingBriefs per month",
    "Basic research and insights",
    "Standard support"
  ],
  starter: [
    "50 MeetingBriefs per month",
    "Advanced research and insights",
    "Priority support",
    "LinkedIn Chrome Extension (Coming Soon)",
    "Calendar Integration (Coming Soon)"
  ],
  scale: [
    "50 MeetingBriefs per month", // Migrated to starter equivalent
    "Advanced research and insights",
    "Priority support",
    "LinkedIn Chrome Extension (Coming Soon)",
    "Calendar Integration (Coming Soon)"
  ]
};


export function SubscriptionManager() {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadSubscriptions();
    }
  }, [user]);

  const loadSubscriptions = async () => {
    try {
      const { data } = await authClient.subscription.list();
      setSubscriptions((data as Subscription[]) || []);
    } catch (error) {
      console.error("Failed to load subscriptions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planName: string) => {
    setActionLoading(planName);
    try {
      // Clean up any incomplete subscriptions before creating new one
      try {
        await fetch('/api/cleanup-subscriptions', { method: 'POST' });
      } catch (cleanupError) {
        console.warn('Cleanup failed, continuing with upgrade:', cleanupError);
      }
      
      // Handle paid plans through Stripe
      const baseUrl = process.env.NODE_ENV === "production" 
        ? "https://meetingbrief.com" 
        : window.location.origin;
        
      const upgradeParams: {
        plan: string;
        successUrl: string;
        cancelUrl: string;
      } = {
        plan: planName,
        successUrl: `${baseUrl}/dashboard?success=true`,
        cancelUrl: `${baseUrl}/dashboard?canceled=true`,
      };
        
      const result = await authClient.subscription.upgrade(upgradeParams);

      if (result.error) {
        console.error("Upgrade failed:", result.error);
        alert(`Upgrade failed: ${result.error.message}`);
      }
      // If successful, the user will be redirected to Stripe Checkout
    } catch (error) {
      console.error("Upgrade error:", error);
      alert("An error occurred during upgrade");
    } finally {
      setActionLoading(null);
    }
  };

  const handleGetMoreBriefs = async () => {
    setActionLoading("credits_addon");
    try {
      const baseUrl = process.env.NODE_ENV === "production" 
        ? "https://meetingbrief.com" 
        : window.location.origin;
        
      const response = await fetch('/api/purchase-credits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          successUrl: `${baseUrl}/dashboard?success=true`,
          cancelUrl: `${baseUrl}/dashboard?canceled=true`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error("Add-on purchase error:", error);
      alert("An error occurred during purchase");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async () => {
    setActionLoading("cancel");
    try {
      const baseUrl = process.env.NODE_ENV === "production" 
        ? "https://meetingbrief.com" 
        : window.location.origin;
        
      const result = await authClient.subscription.cancel({
        returnUrl: `${baseUrl}/dashboard`,
      });

      if (result.error) {
        console.error("Cancel failed:", result.error);
        alert(`Cancel failed: ${result.error.message}`);
      }
      // If successful, the user will be redirected to Stripe Billing Portal
    } catch (error) {
      console.error("Cancel error:", error);
      alert("An error occurred during cancellation");
    } finally {
      setActionLoading(null);
    }
  };


  if (loading) {
    return <div className="text-center py-8">Loading subscription information...</div>;
  }

  const activeSubscription = subscriptions.find(
    sub => sub.status === "active" || sub.status === "trialing"
  );

  const currentPlan = activeSubscription ? activeSubscription.plan : 'free';
  const planFeatures = PLAN_FEATURES[currentPlan as keyof typeof PLAN_FEATURES] || PLAN_FEATURES.free;
  const planDisplayName = currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Billing & Subscriptions</h2>

      {/* Current Subscription Card */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-semibold mb-2">Current Plan: {planDisplayName}</h3>
            {activeSubscription && (
              <div className="space-y-1 text-sm text-gray-600">
                <p><strong>Status:</strong> 
                  <span className={`ml-2 px-2 py-1 rounded text-xs ${
                    activeSubscription.status === "active" 
                      ? "bg-green-100 text-green-800" 
                      : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {activeSubscription.status}
                  </span>
                </p>
                {activeSubscription.periodStart && activeSubscription.periodEnd && (
                  <p><strong>Billing Period:</strong> {new Date(activeSubscription.periodStart).toLocaleDateString()} - {new Date(activeSubscription.periodEnd).toLocaleDateString()}</p>
                )}
              </div>
            )}
          </div>
          <div className="text-right">
            {currentPlan !== 'free' && (
              <p className="text-2xl font-bold text-blue-600">$10/month</p>
            )}
          </div>
        </div>

        <div className="mb-6">
          <h4 className="font-medium mb-3">What&apos;s included:</h4>
          <ul className="space-y-2">
            {planFeatures.map((feature, index) => (
              <li key={index} className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={handleGetMoreBriefs}
            disabled={actionLoading === "credits_addon"}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium disabled:opacity-50"
          >
            {actionLoading === "credits_addon" ? "Processing..." : "Get More Briefs"}
          </button>
          
          {activeSubscription && (
            <button
              onClick={handleCancel}
              disabled={actionLoading === "cancel"}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-md font-medium disabled:opacity-50"
            >
              {actionLoading === "cancel" ? "Processing..." : "Manage Billing"}
            </button>
          )}
          
          {currentPlan === 'free' && (
            <button
              onClick={() => handleUpgrade("starter")}
              disabled={actionLoading === "starter"}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-medium disabled:opacity-50"
            >
              {actionLoading === "starter" ? "Processing..." : "Upgrade to Starter"}
            </button>
          )}
        </div>
      </div>

      {/* Add-on Credits Section */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Add-on Credits</h3>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium">Credit Add-on Pack</h4>
              <p className="text-sm text-gray-600">50 additional briefs • One-time purchase • No expiration</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-green-600">$10</p>
              <button
                onClick={handleGetMoreBriefs}
                disabled={actionLoading === "credits_addon"}
                className="mt-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium disabled:opacity-50"
              >
                {actionLoading === "credits_addon" ? "Processing..." : "Purchase"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 