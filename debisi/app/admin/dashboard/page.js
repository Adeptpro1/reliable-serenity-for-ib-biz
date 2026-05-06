"use client";

import React, { useState, lazy, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  FaUsers, FaBriefcase, FaClipboardList, FaVideo, FaBullhorn,
  FaBell, FaAd, FaTag, FaBars, FaTimes, FaHammer, FaHeart,
  FaCalendar, FaNewspaper, FaSignOutAlt
} from "react-icons/fa";
import { withAuth } from "../../../middlewares/withAuth";
import { useAuth } from "../../../contexts/AuthContext";
import DynamicHeader from "@/components/layoutComponents/DynamicHeader";

const AdminOverview        = lazy(() => import("@/components/adminComponents/AdminOverview"));
const UsersForAdmin        = lazy(() => import("@/components/adminComponents/UsersForAdmin"));
const BusinessesForAdmin   = lazy(() => import("@/components/adminComponents/BusinessesForAdmin"));
const NoticesForAdmin      = lazy(() => import("@/components/adminComponents/NoticesForAdmin"));
const VideosForAdmin       = lazy(() => import("@/components/adminComponents/VideosForAdmin"));
const NotificationsForAdmin = lazy(() => import("@/components/adminComponents/Notification"));
const SponsorsForAdmin     = lazy(() => import("@/components/adminComponents/SponsorsForAdmin"));
const AdsForAdmin          = lazy(() => import("@/components/adminComponents/AdsForAdmin"));
const PricingForAdmin      = lazy(() => import("@/components/adminComponents/PricingForAdmin"));
const AdminSettings        = lazy(() => import("@/components/adminComponents/AdminSettings"));
const BlogSettings         = lazy(() => import("@/components/adminComponents/BlogSettings"));
const SponsorSetting       = lazy(() => import("@/components/adminComponents/SponsorSetting"));
const WebBanner            = lazy(() => import("@/components/adminComponents/WebBanner"));
const AdminWalletManager   = lazy(() => import("@/components/adminComponents/AdminWalletManager"));
const TherapyForAdmin      = lazy(() => import("@/components/adminComponents/TherapyForAdmin"));
const EventsForAdmin       = lazy(() => import("@/components/adminComponents/EventsForAdmin"));

const TabSkeleton = () => (
  <div className="animate-pulse flex flex-col" style={{ gap: "20px", padding: "24px" }}>
    <div className="h-9 bg-slate-100 rounded-2xl w-1/4" />
    <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: "16px" }}>
      {[1,2,3,4].map(i => <div key={i} className="h-28 bg-slate-100 rounded-2xl" />)}
    </div>
    <div className="h-64 bg-slate-100 rounded-2xl" />
  </div>
);

const menuGroups = [
  { group: "Main", items: [{ id: "overview", label: "Overview", icon: <FaHammer /> }] },
  {
    group: "User Management",
    items: [
      { id: "users", label: "Users", icon: <FaUsers /> },
      { id: "business", label: "Business", icon: <FaBriefcase /> },
    ],
  },
  {
    group: "Content & Community",
    items: [
      { id: "notices", label: "Notices", icon: <FaClipboardList /> },
      { id: "videos", label: "Videos", icon: <FaVideo /> },
      { id: "therapy", label: "Therapy", icon: <FaHeart /> },
      { id: "events", label: "Events", icon: <FaCalendar /> },
      { id: "blogSettings", label: "Blog", icon: <FaNewspaper /> },
    ],
  },
  {
    group: "Financials",
    items: [
      { id: "wallet", label: "Wallet & Revenue", icon: <FaBriefcase /> },
      { id: "pricing", label: "Pricing", icon: <FaTag /> },
    ],
  },
  {
    group: "Marketing",
    items: [
      { id: "ad", label: "Ad", icon: <FaAd /> },
      { id: "sponsors", label: "Sponsors", icon: <FaBullhorn /> },
      { id: "webBanner", label: "Banner", icon: <FaAd /> },
    ],
  },
  {
    group: "Settings",
    items: [
      { id: "notifications", label: "Notifications", icon: <FaBell /> },
      { id: "topHeader", label: "Top Header", icon: <FaHammer /> },
      { id: "sponsorSetting", label: "Sponsor", icon: <FaHeart /> },
    ],
  },
];

const AdminPage = ({ userData }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { logout } = useAuth();
  const activeComponent = searchParams.get("tab") || "overview";

  const adminName =
    userData
      ? `${userData.firstName || ""} ${userData.lastName || ""}`.trim() || "Admin"
      : "Admin";
  const adminInitial = adminName[0]?.toUpperCase() || "A";

  const handleMenuClick = (id) => {
    setIsSidebarOpen(false);
    router.push(`/admin/dashboard?tab=${id}`);
  };

  const renderComponent = () => {
    switch (activeComponent) {
      case "overview":       return <AdminOverview />;
      case "users":          return <UsersForAdmin />;
      case "business":       return <BusinessesForAdmin />;
      case "notices":        return <NoticesForAdmin />;
      case "videos":         return <VideosForAdmin />;
      case "sponsors":       return <SponsorsForAdmin />;
      case "therapy":        return <TherapyForAdmin />;
      case "events":         return <EventsForAdmin />;
      case "notifications":  return <NotificationsForAdmin />;
      case "ad":             return <AdsForAdmin />;
      case "pricing":        return <PricingForAdmin />;
      case "wallet":         return <AdminWalletManager />;
      case "topHeader":      return <AdminSettings />;
      case "blogSettings":   return <BlogSettings />;
      case "sponsorSetting": return <SponsorSetting />;
      case "webBanner":      return <WebBanner />;
      default:
        return (
          <div className="p-6 text-gray-500">Select an option from the sidebar.</div>
        );
    }
  };

  return (
    // Root: fills the full viewport — sidebar + main scroll independently
    <div className="flex h-screen overflow-hidden bg-gray-50">

      {/* Mobile backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ──────── Sidebar ──────── */}
      <aside
        style={{ width: "17rem" }}
        className={[
          "fixed inset-y-0 left-0 z-50",
          "flex flex-col flex-shrink-0",
          "bg-slate-900 text-slate-300",
          "border-r border-slate-800 shadow-xl",
          "transform transition-transform duration-300 ease-in-out",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
          "md:relative md:translate-x-0",
        ].join(" ")}
      >
        {/* Brand header — fixed height */}
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              D
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-tight">Debisi Admin</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">Control Panel</p>
            </div>
          </div>
          <button
            className="md:hidden text-slate-400 hover:text-white p-1 rounded"
            onClick={() => setIsSidebarOpen(false)}
          >
            <FaTimes size={18} />
          </button>
        </div>

        {/* Nav — grows + scrolls */}
        <nav className="flex-1 overflow-y-auto py-3">
          {menuGroups.map((group) => (
            <div key={group.group} className="mb-3 px-3">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2 mb-1.5">
                {group.group}
              </p>
              <ul className="space-y-0.5">
                {group.items.map(({ id, label, icon }) => (
                  <li key={id}>
                    <button
                      className={[
                        "flex items-center w-full gap-3 px-3 py-2.5 rounded-xl",
                        "text-sm font-medium transition-all duration-150",
                        activeComponent === id
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-900/30"
                          : "text-slate-400 hover:bg-slate-800 hover:text-white",
                      ].join(" ")}
                      onClick={() => handleMenuClick(id)}
                    >
                      <span
                        className={`text-base flex-shrink-0 ${
                          activeComponent === id ? "text-white" : "text-slate-500"
                        }`}
                      >
                        {icon}
                      </span>
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Logout — pinned to bottom */}
        <div className="flex-shrink-0 border-t border-slate-800 p-3">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-900/40 hover:text-red-400 transition-all"
          >
            <FaSignOutAlt />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ──────── Main column ──────── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        <DynamicHeader hideProfile={true} />

        {/* Top bar — fixed height */}
        <header className="flex-shrink-0 bg-white border-b border-gray-200 shadow-sm z-30 mt-1">
          <div className="flex items-center justify-between px-4 py-3 md:px-6">
            {/* Left: hamburger + breadcrumb */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 md:hidden transition-colors"
              >
                <FaBars size={18} />
              </button>
              <div>
                <p className="text-xs text-gray-400 font-medium">
                  Admin /{" "}
                  <span className="text-gray-600 capitalize">
                    {activeComponent.replace(/([A-Z])/g, " $1").trim()}
                  </span>
                </p>
                <h1 className="text-base font-bold text-gray-900 hidden sm:block leading-tight">
                  {activeComponent === "overview"
                    ? "Welcome Back, Admin"
                    : activeComponent.replace(/([A-Z])/g, " $1").trim()}
                </h1>
              </div>
            </div>

            {/* Right: admin identity */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-bold text-gray-900">{adminName}</span>
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                  Super Admin
                </span>
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                {adminInitial}
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-4 md:p-6">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Suspense fallback={<TabSkeleton />}>
                {renderComponent()}
              </Suspense>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default withAuth(AdminPage);
