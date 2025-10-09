"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { loadUser } from "@/features/auth/authSlice";

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRoles?: Array<"guest" | "customer" | "staff" | "support" | "admin">;
  redirectTo?: string;
}

export function AuthGuard({ children, requiredRoles, redirectTo = "/login" }: AuthGuardProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, loading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Try to load user from stored token
    if (!user && !loading) {
      dispatch(loadUser());
    }
  }, [dispatch, user, loading]);

  useEffect(() => {
    // If not loading and no user, redirect to login
    if (!loading && !user) {
      router.push(redirectTo);
      return;
    }

    // If user doesn't have required role, redirect
    if (!loading && user && requiredRoles && !requiredRoles.includes(user.role)) {
      router.push("/");
    }
  }, [user, loading, router, requiredRoles, redirectTo]);

  // Show loading state
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // User is authenticated and has required role
  return <>{children}</>;
}
