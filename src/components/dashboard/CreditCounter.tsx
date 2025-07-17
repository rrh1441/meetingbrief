"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";

interface CreditBalance {
  subscriptionCredits: number;
  addonCredits: number;
  totalCredits: number;
}

export function CreditCounter() {
  const [credits, setCredits] = useState<CreditBalance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCredits();
  }, []);

  const loadCredits = async () => {
    try {
      const response = await fetch('/api/brief-usage', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setCredits({
          subscriptionCredits: data.subscriptionCredits || 0,
          addonCredits: data.addonCredits || 0,
          totalCredits: data.totalCredits || 0
        });
      }
    } catch (error) {
      console.error('Failed to load credits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGetMoreBriefs = async () => {
    try {
      const baseUrl = process.env.NODE_ENV === "production" 
        ? "https://meetingbrief.com" 
        : window.location.origin;
        
      const result = await authClient.subscription.upgrade({
        plan: "credits_addon",
        successUrl: `${baseUrl}/dashboard?success=true`,
        cancelUrl: `${baseUrl}/dashboard?canceled=true`,
      });

      if (result.error) {
        console.error("Add-on purchase failed:", result.error);
        alert(`Purchase failed: ${result.error.message}`);
      }
      // If successful, the user will be redirected to Stripe Checkout
    } catch (error) {
      console.error("Add-on purchase error:", error);
      alert("An error occurred during purchase");
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    );
  }

  if (!credits) {
    return null;
  }

  const originalLimit = credits.subscriptionCredits > 5 ? 50 : 5; // Determine if starter or free
  const subscriptionUsed = originalLimit - credits.subscriptionCredits;

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-900">
            You&apos;ve used {subscriptionUsed} of {originalLimit} monthly briefs
          </p>
          {credits.addonCredits > 0 && (
            <p className="text-sm text-gray-600">
              Plus {credits.addonCredits} add-on credits available
            </p>
          )}
        </div>
        <button
          onClick={handleGetMoreBriefs}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Get More Briefs
        </button>
      </div>
    </div>
  );
}