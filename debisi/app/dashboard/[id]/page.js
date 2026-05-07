"use client";

import React, { useState, useEffect, lazy, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  FaUserEdit,
  FaBriefcase,
  FaVideo,
  FaClipboardList,
  FaTrash,
  FaSignOutAlt,
  FaBell,
  FaBars,
  FaTimes,
  FaCheck,
  FaStore,
  FaRocket,
  FaHeart,
  FaCalendar,
} from "react-icons/fa";
import { TbHome } from "react-icons/tb";
import Footer from "../../../components/layoutComponents/Footer";
import ScrollFooterWrapper from "@/components/layoutComponents/ScrollFooterWrapper";
import { withAuth } from "@/middlewares/withAuth";
import DynamicHeader from "@/components/layoutComponents/DynamicHeader";
import { useAuth } from "../../../contexts/AuthContext";

// ─── Lazy-loaded tab components ───────────────────────────────────────────────
// Each component is only downloaded when the user first navigates to that tab,
// dramatically reducing the initial JS bundle size.
const Dashboard = lazy(
  () => import("@/components/userProfileComponents/Dashboard"),
);
const EditProfile = lazy(
  () => import("@/components/userProfileComponents/EditProfile"),
);
const EditBusiness = lazy(
  () => import("@/components/userProfileComponents/EditBusiness"),
);
const VideosForProfile = lazy(
  () => import("@/components/userProfileComponents/VideosForProfile"),
);
const NoticesForProfile = lazy(
  () => import("@/components/userProfileComponents/NoticeForProfile"),
);
const AdsManager = lazy(
  () => import("@/components/userProfileComponents/AdsManager"),
);
const UserNotification = lazy(
  () => import("@/components/userProfileComponents/UserNotification"),
);
const BusinessVerification = lazy(
  () => import("@/components/userProfileComponents/Verification"),
);
const MarketplaceManager = lazy(
  () => import("@/components/userProfileComponents/MarketplaceManager"),
);
const TherapyRequestForm = lazy(
  () => import("@/components/userProfileComponents/TherapyRequestForm"),
);
const EventsList = lazy(
  () => import("@/components/userProfileComponents/EventsList"),
);
const WalletManager = lazy(
  () => import("@/components/userProfileComponents/WalletManager"),
);

// ─── Shared tab skeleton ──────────────────────────────────────────────────────
const TabSkeleton = () => (
  <div
    className="animate-pulse flex flex-col"
    style={{ gap: "16px", padding: "24px" }}
  >
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

// ─── Menu ─────────────────────────────────────────────────────────────────────
const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: <TbHome /> },
  // { id: "wallet", label: "Wallet", icon: <FaBriefcase /> },
  { id: "edit-profile", label: "Edit Profile", icon: <FaUserEdit /> },
  { id: "edit-business", label: "My Business", icon: <FaBriefcase /> },
  // { id: "marketplace", label: "My Products", icon: <FaStore /> },
  // { id: "current-videos", label: "My Videos", icon: <FaVideo /> },
  // { id: "current-notices", label: "My Notices", icon: <FaBell /> },
  // { id: "ads", label: "My Ads", icon: <FaRocket /> },
  // { id: "verification", label: "Verification", icon: <FaCheck /> },
  // { id: "therapy", label: "Request Therapy", icon: <FaHeart /> },
  // { id: "events", label: "Platform Events", icon: <FaCalendar /> },
  { id: "notifications", label: "Notifications", icon: <FaBell /> },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
const ProfilePage = ({ userData }) => {
  const { logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  const activeComponent = searchParams.get("tab") || "dashboard";

  const handleMenuClick = (component) => {
    setIsSidebarOpen(false);
    router.push(`/dashboard/${userData?.id}?tab=${component}`);
  };

  const renderComponent = () => {
    switch (activeComponent) {
      case "dashboard":
        return <Dashboard userData={userData} />;
      case "wallet":
        return <WalletManager userData={userData} />;
      case "edit-profile":
        return <EditProfile />;
      case "edit-business":
        return <EditBusiness />;
      case "marketplace":
        return <MarketplaceManager />;
      case "current-videos":
        return <VideosForProfile />;
      case "current-notices":
        return <NoticesForProfile />;
      case "ads":
        return <AdsManager />;
      case "verification":
        return <BusinessVerification />;
      case "therapy":
        return <TherapyRequestForm />;
      case "events":
        return <EventsList />;
      case "notifications":
        return <UserNotification />;
      default:
        return (
          <div
            className="text-gray-500 font-medium"
            style={{ padding: "20px", textAlign: "center" }}
          >
            Select an option from the sidebar
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      <div className="flex flex-1 relative">
        {/* Sidebar Overlay (mobile) */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div
          className={`fixed top-0 bottom-0 left-0 z-50 w-64 text-white transform ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } transition-transform duration-300 ease-in-out md:translate-x-0 flex flex-col shadow-2xl md:shadow-xl md:sticky md:top-0 md:h-screen`}
          style={{
            background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
          }}
        >
          <div
            className="flex items-center justify-between border-b border-slate-700/50"
            style={{ padding: "24px 20px" }}
          >
            <div className="flex items-center" style={{ gap: "12px" }}>
              <div
                className="bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/30"
                style={{ width: "36px", height: "36px" }}
              >
                <span className="text-white font-bold text-lg">D</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-200">
                Debisi
              </h1>
            </div>
            <button
              className="md:hidden text-slate-300 hover:text-white transition-colors bg-slate-800 rounded-lg flex items-center justify-center"
              onClick={() => setIsSidebarOpen(false)}
              style={{ width: "32px", height: "32px" }}
            >
              <FaTimes size={16} />
            </button>
          </div>

          <div
            className="flex-1 overflow-y-auto"
            style={{ padding: "24px 16px" }}
          >
            <p
              className="text-xs font-bold text-slate-400 uppercase tracking-widest"
              style={{ marginBottom: "16px", paddingLeft: "12px" }}
            >
              Dashboard Menu
            </p>
            <ul
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              {menuItems.map(({ id, label, icon }) => {
                const isActive = activeComponent === id;
                return (
                  <li key={id}>
                    <button
                      className={`w-full flex items-center rounded-xl font-medium transition-all duration-200 group border ${
                        isActive
                          ? "text-white border-white/10 shadow-[0_4px_15px_rgba(0,0,0,0.1)] relative overflow-hidden"
                          : "text-slate-400 border-transparent hover:text-white hover:bg-white/5"
                      }`}
                      style={{
                        padding: "14px 16px",
                        background: isActive
                          ? "rgba(255, 255, 255, 0.08)"
                          : "transparent",
                        backdropFilter: isActive ? "blur(10px)" : "none",
                      }}
                      onClick={() => handleMenuClick(id)}
                    >
                      <span
                        className={`transition-colors duration-200 flex items-center justify-center ${isActive ? "text-purple-400" : "text-slate-500 group-hover:text-purple-400"}`}
                        style={{
                          marginRight: "14px",
                          fontSize: "18px",
                          width: "24px",
                        }}
                      >
                        {icon}
                      </span>
                      {label}
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-3/5 bg-purple-400 rounded-r-full shadow-[0_0_8px_rgba(167,139,250,0.6)]" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* User snippet at sidebar bottom */}
          <div
            className="border-t border-slate-700/50 flex items-center justify-between bg-slate-900/40"
            style={{ padding: "20px 16px", gap: "12px" }}
          >
            <div className="flex items-center min-w-0" style={{ gap: "12px" }}>
              <div
                className="bg-gradient-to-tr from-slate-600 to-slate-500 rounded-full flex items-center justify-center text-sm font-bold shadow-inner"
                style={{ width: "40px", height: "40px", flexShrink: 0 }}
              >
                {userData?.firstName?.charAt(0) || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate text-white">
                  {userData?.firstName || "User"} {userData?.lastName || ""}
                </p>
                <p className="text-xs text-slate-400 truncate mt-0.5">
                  {userData?.email || "user@debisi.com"}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              className="text-slate-400 hover:text-rose-400 transition-colors bg-slate-800/50 p-2 rounded-lg border border-slate-700/50"
              title="Logout"
            >
              <FaSignOutAlt size={18} />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          <DynamicHeader />

          {/* Mobile header */}
          <div
            className="md:hidden flex items-center justify-between bg-white shadow-sm border-b border-slate-200 sticky top-0 z-40"
            style={{ padding: "16px 20px" }}
          >
            <div className="flex items-center" style={{ gap: "16px" }}>
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="text-slate-600 hover:text-purple-600 transition-colors bg-slate-50 rounded-lg flex items-center justify-center border border-slate-200 shadow-sm"
                style={{ width: "40px", height: "40px" }}
              >
                <FaBars size={18} />
              </button>
              <h2 className="text-lg font-bold text-slate-800">
                {menuItems.find((item) => item.id === activeComponent)?.label ||
                  "Dashboard"}
              </h2>
            </div>
          </div>

          {/* Desktop welcome header */}
          <div
            className="hidden md:flex bg-white border-b border-slate-100 z-40 sticky top-0 shadow-sm justify-between items-center"
            style={{ padding: "28px 32px" }}
          >
            <div>
              <h1
                className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center"
                style={{ gap: "12px" }}
              >
                {menuItems.find((item) => item.id === activeComponent)?.label ||
                  "Dashboard"}
              </h1>
              <p
                className="text-sm text-slate-500 font-medium"
                style={{ marginTop: "6px" }}
              >
                Welcome back,{" "}
                <span className="font-bold text-purple-600">
                  {userData?.firstName || "User"}
                </span>
                ! Here&apos;s your overview.
              </p>
            </div>
          </div>

          {/* Tab render area — wrapped in Suspense for lazy loading */}
          <div
            className="flex-1 pb-10"
            style={{ padding: "clamp(20px, 4vw, 40px)" }}
          >
            <div className="max-w-7xl mx-auto w-full transition-all duration-300 ease-in-out">
              <Suspense fallback={<TabSkeleton />}>
                {renderComponent()}
              </Suspense>
            </div>
          </div>

          <ScrollFooterWrapper />
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default withAuth(ProfilePage);
