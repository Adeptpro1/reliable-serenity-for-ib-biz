"use client";

import AuthHeader from "./AuthHeader";
import GuestHeader from "./GuestHeader";
import { useAuth } from "../../contexts/AuthContext";

export default function DynamicHeader({ hideProfile = false }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <GuestHeader />;
  }

  if (user) {
    return <AuthHeader userData={user} hideProfile={hideProfile} />;
  }

  return <GuestHeader />;
}
