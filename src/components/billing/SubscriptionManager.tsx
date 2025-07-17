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

const PLANS = [
  {
    name: "starter",
    displayName: "Starter",
    price: "$10/month",
    features: [
      "50 meeting briefs per month",
      "Additional credits available for purchase",
      "LinkedIn Chrome Extension (Coming Soon)",
      "Calendar Integration (Coming Soon)"
    ],
  },
];

const ADDONS = [
  {
    name: "credits_addon",
    displayName: "Credit Add-on",
    price: "$10",
    features: [
      "50 additional meeting briefs",
      "One-time purchase",
      "No expiration"
    ],
  },
];

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

  const handleRestore = async () => {
    setActionLoading("restore");
    try {
      const result = await authClient.subscription.restore();

      if (result.error) {
        console.error("Restore failed:", result.error);
        alert(`Restore failed: ${result.error.message}`);
      } else {
        alert("Subscription restored successfully!");
        await loadSubscriptions();
      }
    } catch (error) {
      console.error("Restore error:", error);
      alert("An error occurred during restoration");
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

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Subscription Management</h2>

      {activeSubscription ? (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Current Subscription</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p><strong>Plan:</strong> {activeSubscription.plan.charAt(0).toUpperCase() + activeSubscription.plan.slice(1)}</p>
              <p><strong>Status:</strong> 
                <span className={`ml-2 px-2 py-1 rounded text-sm ${
                  activeSubscription.status === "active" 
                    ? "bg-green-100 text-green-800" 
                    : "bg-yellow-100 text-yellow-800"
                }`}>
                  {activeSubscription.status}
                </span>
              </p>
              <p><strong>Period:</strong> {
                activeSubscription.periodStart && activeSubscription.periodEnd
                  ? `${new Date(activeSubscription.periodStart).toLocaleDateString()} - ${new Date(activeSubscription.periodEnd).toLocaleDateString()}`
                  : 'N/A'
              }</p>
            </div>
            <div>
              {activeSubscription.limits && (
                <p><strong>Monthly Briefs:</strong> {
                  activeSubscription.limits.briefsPerMonth === -1 
                    ? "Unlimited" 
                    : activeSubscription.limits.briefsPerMonth || 'N/A'
                }</p>
              )}
            </div>
          </div>
          
          <div className="mt-4 space-x-4">
            {activeSubscription.cancelAtPeriodEnd ? (
              <button
                onClick={handleRestore}
                disabled={actionLoading === "restore"}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                {actionLoading === "restore" ? "Restoring..." : "Restore Subscription"}
              </button>
            ) : (
              <button
                onClick={handleCancel}
                disabled={actionLoading === "cancel"}
                className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                {actionLoading === "cancel" ? "Processing..." : "Manage Billing"}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <p className="text-blue-800">Currently on the Free Plan. Upgrade below for more briefs!</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => (
          <div key={plan.name} className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-2">{plan.displayName}</h3>
            <p className="text-2xl font-bold text-blue-600 mb-4">{plan.price}</p>
            <ul className="space-y-2 mb-6">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleUpgrade(plan.name)}
              disabled={
                actionLoading === plan.name ||
                (activeSubscription && activeSubscription.plan === plan.name)
              }
              className={`w-full py-2 px-4 rounded font-medium ${
                activeSubscription && activeSubscription.plan === plan.name
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
              }`}
            >
              {actionLoading === plan.name 
                ? "Processing..." 
                : activeSubscription && activeSubscription.plan === plan.name
                ? "Current Plan"
                : "Choose Plan"
              }
            </button>
          </div>
        ))}
      </div>

      {/* Add-on Credits Section */}
      <div className="mt-12">
        <h3 className="text-xl font-semibold mb-6 text-center">Need More Credits?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ADDONS.map((addon) => (
            <div key={addon.name} className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold mb-2">{addon.displayName}</h3>
              <p className="text-2xl font-bold text-green-600 mb-4">{addon.price}</p>
              <ul className="space-y-2 mb-6">
                {addon.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleUpgrade(addon.name)}
                disabled={actionLoading === addon.name}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded font-medium disabled:opacity-50"
              >
                {actionLoading === addon.name ? "Processing..." : "Purchase Credits"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 