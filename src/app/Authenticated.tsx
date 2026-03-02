'use client';

import { useConvexAuth, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";
import { api } from "../../convex/_generated/api";

export function Authenticated({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const heartbeat = useMutation(api.users.heartbeat);
  const router = useRouter();

  // Heartbeat for presence
  useEffect(() => {
    if (isAuthenticated) {
        // Initial beat
        heartbeat();
        // Loop
        const interval = setInterval(() => {
            heartbeat();
        }, 1000 * 60); // Every 1 minute
        return () => clearInterval(interval);
    }
  }, [isAuthenticated, heartbeat]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-nav-black flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white/20 border-t-nav-lime rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  return <>{children}</>;
}
