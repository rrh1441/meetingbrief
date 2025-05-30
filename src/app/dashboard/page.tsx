"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SubscriptionManager } from "@/components/billing/SubscriptionManager";
import { BriefGenerator } from "@/components/dashboard/BriefGenerator";
import { BriefHistory } from "@/components/dashboard/BriefHistory";

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("generate");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/signin");
    }
  }, [user, loading, router]);

  useEffect(() => {
    // Check for success/canceled query params from Stripe
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("success") === "true") {
      alert("Subscription successful! Welcome to your new plan.");
      // Remove the query param
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (urlParams.get("canceled") === "true") {
      alert("Subscription canceled. You can try again anytime.");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  const tabs = [
    { id: "generate", name: "Generate Brief" },
    { id: "history", name: "Brief History" },
    { id: "billing", name: "Billing & Subscriptions" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Meeting Brief Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user.name || user.email}</span>
              <button
                onClick={signOut}
                className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === "generate" && (
            <div className="px-4 py-6 sm:px-0">
              <BriefGenerator />
            </div>
          )}

          {activeTab === "history" && (
            <div className="px-4 py-6 sm:px-0">
              <BriefHistory />
            </div>
          )}

          {activeTab === "billing" && <SubscriptionManager />}
        </div>
      </div>
    </div>
  );
} 