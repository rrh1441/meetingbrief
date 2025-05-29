"use client";

import { authClient } from "@/lib/auth-client";

export function useAuth() {
  // Better Auth provides reactive session data
  const session = authClient.useSession();
  
  const signOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = "/";
        },
      },
    });
  };

  return {
    user: session.data?.user ?? null,
    session: session.data,
    loading: session.isPending,
    error: session.error,
    signOut,
  };
} 