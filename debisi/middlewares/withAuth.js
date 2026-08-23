"use client";
import React, { useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import LoadingSpinner from "../components/otherComponents/LoadingSpinner";
import { toast } from "react-hot-toast";

export function withAuth(Component) {
  return function AuthenticatedComponent(props) {
    const { user, loading, isAuthenticated } = useAuth();
    const pathname = usePathname();
    const isAdminRoute = pathname.startsWith("/admin");
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
      if (loading) return; // Wait until auth state is resolved

      // 1. Not logged in → go to login
      if (!isAuthenticated || !user) {
        router.replace(isAdminRoute ? "/admin" : "/login");
        return;
      }

      // 2. Admin route but not an admin → redirect home
      if (isAdminRoute && user.role !== "ADMIN") {
        router.replace("/");
        return;
      }

      // 3. Profile incomplete sync check (Recover from failed registration sync)
      // Only check for regular users on their dashboard
      const isDashboardPage = pathname.includes("/dashboard/");
      const isEditProfileTab = searchParams.get("tab") === "edit-profile";

      if (user && !user.isProfileComplete && isDashboardPage && !isEditProfileTab && user.role !== "ADMIN") {
        toast("Welcome! Please complete your profile details to continue.", {
          icon: "👋",
          id: "incomplete-profile-toast",
        });
        router.replace(`/dashboard/${user.id}?tab=edit-profile`);
      }
    }, [loading, isAuthenticated, user, router, pathname, isAdminRoute, searchParams]);

    // Still resolving auth state
    if (loading) {
      return <LoadingSpinner />;
    }

    // Block if not authenticated OR if it's an admin route but user is not an admin
    if (!isAuthenticated || !user || (isAdminRoute && user.role !== "ADMIN")) {
      return null;
    }

    // Authenticated as ADMIN
    return <Component {...props} userData={user} />;
  };
}

