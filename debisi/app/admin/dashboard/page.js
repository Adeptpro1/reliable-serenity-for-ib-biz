import React, { Suspense } from "react";
import AdminDashboardClient from "./AdminDashboardClient";

const TabSkeleton = () => (
  <div
    className="animate-pulse flex flex-col"
    style={{ gap: "20px", padding: "24px" }}
  >
    <div className="h-9 bg-slate-100 rounded-2xl w-1/4" />
    <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: "16px" }}>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-28 bg-slate-100 rounded-2xl" />
      ))}
    </div>
    <div className="h-64 bg-slate-100 rounded-2xl" />
  </div>
);

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<TabSkeleton />}>
      <AdminDashboardClient />
    </Suspense>
  );
}
