"use client";

import { useState, useEffect } from "react";

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

  const totalAvailable = credits.subscriptionCredits + credits.addonCredits;

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-base font-medium text-gray-900">
              You have {totalAvailable} Briefs Available
            </p>
          </div>
          <button
            onClick={handleGetMoreBriefs}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap"
          >
            Get More
          </button>
        </div>
      </div>
    </div>
  );
}