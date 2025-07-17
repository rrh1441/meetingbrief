"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

interface AuthFormProps {
  mode: "signin" | "signup";
  onSuccess?: () => void;
  initialEmail?: string | null;
}

export function AuthForm({ mode, onSuccess, initialEmail }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastLoginMethod, setLastLoginMethod] = useState<string | null>(null);
  const router = useRouter();

  // Set initial email if provided and get last login method
  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
    }
    
    // Get last login method from localStorage
    const storedMethod = localStorage.getItem('lastLoginMethod');
    setLastLoginMethod(storedMethod);
  }, [initialEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    console.log("Form submitted with:", { email, mode, hasPassword: !!password });

    try {
      if (mode === "signup") {
        const result = await authClient.signUp.email({
          email,
          password,
          name,
        });
        
        console.log("Signup result:", result);
        
        if (result.error) {
          const errorMessage = result.error.message?.toLowerCase() || "";
          
          // Check if the error indicates user already exists
          if (errorMessage.includes("already exists") || 
              errorMessage.includes("already registered") ||
              errorMessage.includes("user exists") ||
              errorMessage.includes("email is already taken")) {
            
            // Redirect to sign in with pre-filled email
            router.push(`/auth/signin?email=${encodeURIComponent(email)}&message=${encodeURIComponent("Account already exists. Please sign in instead.")}`);
            return;
          }
          
          setError(result.error.message || "An error occurred during signup");
        } else {
          // Store last login method
          localStorage.setItem('lastLoginMethod', 'email');
          onSuccess?.();
        }
      } else {
        const result = await authClient.signIn.email({
          email,
          password,
        });
        
        console.log("Signin result:", result);
        
        if (result.error) {
          console.error("Signin error:", result.error);
          setError(result.error.message || "An error occurred during signin");
        } else {
          // Store last login method
          localStorage.setItem('lastLoginMethod', 'email');
          console.log("Signin successful, calling onSuccess");
          onSuccess?.();
        }
      }
    } catch (err) {
      console.error("Auth error:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);

    try {
      // Store last login method before redirect
      localStorage.setItem('lastLoginMethod', 'google');
      
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard", // Redirect to dashboard after successful sign-in
      });
      
      if (result.error) {
        setError(result.error.message || "An error occurred with Google sign-in");
      }
      // Note: For OAuth, the redirect happens automatically, so onSuccess may not be called
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred with Google sign-in");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="space-y-4 w-full max-w-md">
      {/* Google OAuth Button */}
      <div className="relative">
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          className={`w-full flex justify-center items-center gap-2 py-2 px-4 border rounded-md shadow-sm text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
            lastLoginMethod === 'google' 
              ? 'border-blue-500 bg-blue-50 text-blue-700 hover:bg-blue-100 focus:ring-blue-500' 
              : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-blue-500'
          } focus:outline-none focus:ring-2 focus:ring-offset-2`}
        >
          {googleLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
          ) : (
            <>
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </>
          )}
        </button>
        
        {/* Arrow indicator for Google */}
        {mode === "signin" && lastLoginMethod === 'google' && (
          <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 translate-x-full flex items-center">
            <svg className="w-4 h-4 text-blue-600 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            <span className="text-xs text-blue-600 font-medium whitespace-nowrap">Last Used for Sign In</span>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-gray-50 text-gray-500">Or continue with email</span>
        </div>
      </div>

      {/* Email/Password Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="hidden">
          <input type="text" name="username" autoComplete="username" />
        </div>
        {mode === "signup" && (
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="relative">
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white disabled:opacity-50 ${
              lastLoginMethod === 'email' 
                ? 'bg-blue-700 hover:bg-blue-800 focus:ring-blue-600' 
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
            } focus:outline-none focus:ring-2 focus:ring-offset-2`}
          >
            {loading ? "Loading..." : mode === "signup" ? "Sign Up" : "Sign In"}
          </button>
          
          {/* Arrow indicator for Email */}
          {mode === "signin" && lastLoginMethod === 'email' && (
            <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 translate-x-full flex items-center">
              <svg className="w-4 h-4 text-blue-600 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              <span className="text-xs text-blue-600 font-medium whitespace-nowrap">Last Used for Sign In</span>
            </div>
          )}
        </div>
      </form>
    </div>
  );
} 