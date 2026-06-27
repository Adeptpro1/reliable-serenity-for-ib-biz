import React, { Suspense } from "react";
import ProfileClient from "./ProfileClient";

const TabSkeleton = () => (
  <div className="animate-pulse flex flex-col" style={{ gap: "16px", padding: "24px" }}>
    <div className="h-8 bg-slate-200 rounded-xl w-1/3" />
    <div className="h-4 bg-slate-100 rounded-xl w-2/3" />
    <div className="h-48 bg-slate-100 rounded-2xl w-full" />
    <div className="grid grid-cols-3" style={{ gap: "16px" }}>
      <div className="h-24 bg-slate-100 rounded-xl" />
      <div className="h-24 bg-slate-100 rounded-xl" />
      <div className="h-24 bg-slate-100 rounded-xl" />
    </div>
  </div>
);

export default function UserProfilePage() {
  return (
    <Suspense fallback={<TabSkeleton />}>
      <ProfileClient />
    </Suspense>
  );
}
