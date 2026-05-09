import React, { Suspense } from "react";
import AuthActionClient from "./AuthActionClient";

export default function UnifiedAuthActionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <AuthActionClient />
    </Suspense>
  );
}
