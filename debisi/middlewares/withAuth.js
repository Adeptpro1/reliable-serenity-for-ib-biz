import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import LoadingSpinner from "../components/otherComponents/LoadingSpinner";

export function withAuth(Component) {
  return function AuthenticatedComponent(props) {
    const { user, loading, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (loading) return; // Wait until auth state is resolved

      // Not logged in → go to admin login
      if (!isAuthenticated || !user) {
        router.replace("/admin");
        return;
      }

      // Logged in but NOT an admin → redirect away from admin area
      if (user.role !== "ADMIN") {
        router.replace("/");
      }
    }, [loading, isAuthenticated, user, router]);

    // Still resolving auth state
    if (loading) {
      return <LoadingSpinner />;
    }

    // Not authenticated or not admin — show nothing while redirecting
    if (!isAuthenticated || !user || user.role !== "ADMIN") {
      return null;
    }

    // Authenticated as ADMIN
    return <Component {...props} userData={user} />;
  };
}

