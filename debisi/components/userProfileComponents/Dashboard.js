"use client";
import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation } from "@apollo/client";
// import Footer from "@/components/Footer";
// import ScrollFooter from "@/components/ScrollFooter";
import RegisterBusiness from "@/components/serverComponents/business/RegisterBusiness";
import Modal from "@/components/otherComponents/Modal";
import {
  FaBuilding,
  FaChartLine,
  FaShareAlt,
  FaStar,
  FaCopy,
  FaWhatsapp,
  FaFacebook,
  FaTwitter,
  FaInfoCircle,
  FaEye,
  FaMousePointer,
  FaUsers,
} from "react-icons/fa";
import { withAuth } from "@/middlewares/withAuth";
import {
  GET_HEATMAP_ANALYTICS,
  GET_BUSINESS_ANALYTICS,
  GET_BUSINESS_STATS,
  TRACK_ACTIVITY,
} from "@/api/queries/business/business";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Dashboard Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h2
              className="text-2xl font-bold text-gray-900"
              style={{ marginBottom: "16px" }}
            >
              Something went wrong
            </h2>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function Dashboard({ userData }) {
  const router = useRouter();
  const params = useParams();
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [selectedBusinessId, setSelectedBusinessId] = useState(null);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [shareMessage, setShareMessage] = useState("");
  const [trackActivity] = useMutation(TRACK_ACTIVITY);

  // Get user's businesses from userData
  const userBusinesses = useMemo(() => {
    return userData?.businesses || [];
  }, [userData?.businesses]);

  // Set default selected business if user has businesses
  useEffect(() => {
    if (userBusinesses.length > 0 && !selectedBusinessId) {
      setSelectedBusinessId(userBusinesses[0].id);
    }
  }, [userBusinesses, selectedBusinessId]);

  // Query for business-specific analytics
  const {
    data: statsData,
    loading: statsLoading,
    error: statsError,
  } = useQuery(GET_BUSINESS_STATS, {
    variables: { businessId: selectedBusinessId || null },
    fetchPolicy: "network-only",
  });

  const analytics = useMemo(() => {
    const stats = statsData?.businessAnalytics || {};
    return {
      pageViews: stats.totalViews || 0,
      clicks: stats.totalClicks || 0,
      leads: stats.totalLeads || 0,
      shares: stats.totalShares || 0,
    };
  }, [statsData]);

  const heatmapLoading = statsLoading;
  const businessAnalyticsLoading = statsLoading;

  // Small memoized metric card to avoid repeating layout and to reduce re-renders
  const MetricCard = React.memo(function MetricCard({
    gradientFrom,
    gradientVia,
    gradientTo,
    icon: Icon,
    label,
    value,
    subtitle,
    textColorClass,
  }) {
    return (
      <div
        className={`relative overflow-hidden bg-gradient-to-br from-${gradientFrom} via-${gradientVia} to-${gradientTo} rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-300`}
      >
        <div
          className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full"
          style={{ marginRight: "-64px", marginTop: "-64px" }}
        ></div>
        <div className="text-white" style={{ padding: "24px" }}>
          <div
            className="flex items-center justify-between"
            style={{ marginBottom: "16px" }}
          >
            <div
              className="rounded-xl backdrop-blur-sm"
              style={{ padding: "12px" }}
            >
              <Icon
                className="h-6 w-6"
                style={{ color: "white", display: "block" }}
              />
            </div>
            <div className="text-right">
              <p className="text-xs font-medium uppercase tracking-wide">
                {label}
              </p>
            </div>
          </div>
          <p className="text-3xl font-bold">{value}</p>
          <div className="flex items-center" style={{ marginTop: "8px" }}>
            <div
              className="w-2 h-2 bg-green-400 rounded-full"
              style={{ marginRight: "8px" }}
            ></div>
            <span className={`text-sm ${textColorClass || "text-white"}`}>
              {subtitle}
            </span>
          </div>
        </div>
      </div>
    );
  });

  // Handle video upload
  const handleVideoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check if business is selected when user has businesses
      if (userBusinesses.length > 0 && !selectedBusinessId) {
        alert("Please select a business first to upload a video.");
        return;
      }

      const businessName = selectedBusinessId
        ? userBusinesses.find((b) => b.id === selectedBusinessId)?.name
        : "your business";
      alert(`Video upload for ${businessName} will be implemented soon!`);
    }
  };

  const selectedBusiness = useMemo(() => {
    return userBusinesses.find((b) => b.id === selectedBusinessId);
  }, [userBusinesses, selectedBusinessId]);

  const handleShare = async () => {
    if (!selectedBusiness) return;
    const shareData = {
      title: `${selectedBusiness.name} - Debisi`,
      text: `Check out ${selectedBusiness.name} on Debisi! ${selectedBusiness.description}`,
      url: `https://debisi.ng/${selectedBusiness.slug}`,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        await trackActivity({
          variables: {
            input: { businessId: selectedBusiness.id, activityType: "SHARE" },
          },
        });
        setShareMessage("Shared successfully!");
        setTimeout(() => setShareMessage(""), 3000);
      } else {
        setShowShareOptions(true);
      }
    } catch (error) {
      throw new Error(error.message);
    }
  };

  const copyToClipboard = async () => {
    if (!selectedBusiness) return;
    try {
      await navigator.clipboard.writeText(
        `https://debisi.ng/${selectedBusiness.slug}`,
      );
      setShareMessage("Link copied to clipboard!");
      await trackActivity({
        variables: {
          input: { businessId: selectedBusiness.id, activityType: "SHARE" },
        },
      });
      setTimeout(() => setShareMessage(""), 3000);
      setShowShareOptions(false);
    } catch (error) {
      setShareMessage("Failed to copy link");
      setTimeout(() => setShareMessage(""), 3000);
    }
  };

  const shareOnWhatsApp = () => {
    if (!selectedBusiness) return;
    const text = encodeURIComponent(
      `Check out ${selectedBusiness.name} on Debisi!`,
    );
    const url = encodeURIComponent(
      `https://debisi.ng/${selectedBusiness.slug}`,
    );
    window.open(`https://wa.me/?text=${text}%20${url}`, "_blank");
    trackActivity({
      variables: {
        input: { businessId: selectedBusiness.id, activityType: "SHARE" },
      },
    });
    setShareMessage("Opening WhatsApp...");
    setTimeout(() => setShareMessage(""), 3000);
    setShowShareOptions(false);
  };

  const shareOnFacebook = () => {
    if (!selectedBusiness) return;
    const url = encodeURIComponent(
      `https://debisi.ng/${selectedBusiness.slug}`,
    );
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      "_blank",
    );
    trackActivity({
      variables: {
        input: { businessId: selectedBusiness.id, activityType: "SHARE" },
      },
    });
    setShareMessage("Opening Facebook...");
    setTimeout(() => setShareMessage(""), 3000);
    setShowShareOptions(false);
  };

  const shareOnTwitter = () => {
    if (!selectedBusiness) return;
    const text = encodeURIComponent(
      `Check out ${selectedBusiness.name} on Debisi!`,
    );
    const url = encodeURIComponent(
      `https://debisi.ng/${selectedBusiness.slug}`,
    );
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      "_blank",
    );
    trackActivity({
      variables: {
        input: { businessId: selectedBusiness.id, activityType: "SHARE" },
      },
    });
    setShareMessage("Opening Twitter...");
    setTimeout(() => setShareMessage(""), 3000);
    setShowShareOptions(false);
  };

  const handleRegistrationSuccess = () => {
    setShowRegisterModal(false);
    // Redirect to edit business tab and refresh state if needed
    router.push(`/dashboard/${userData?.id}?tab=edit-business`);
    // Optionally trigger a window reload or refetch if userData doesn't update automatically
    window.location.reload();
  };

  return (
    <ErrorBoundary>
      <motion.main
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="min-h-screen bg-gray-50"
        style={{ marginTop: "2px" }}
      >
        {shareMessage && (
          <div
            className="bg-emerald-500 text-white text-center rounded-xl shadow-lg border border-emerald-400"
            style={{
              position: "fixed",
              bottom: "24px",
              left: "50%",
              transform: "translateX(-50%)",
              padding: "12px 24px",
              zIndex: 2000,
              fontWeight: "bold",
              animation: "slideUp 0.3s ease",
            }}
          >
            {shareMessage}
          </div>
        )}

        {/* Share Options Modal */}
        {showShareOptions && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 2000,
            }}
            onClick={() => setShowShareOptions(false)}
          >
            <div
              style={{
                background: "white",
                borderRadius: "24px",
                padding: "32px",
                maxWidth: "360px",
                width: "90%",
                textAlign: "center",
                boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3
                className="text-xl font-bold text-slate-900"
                style={{ marginBottom: "24px" }}
              >
                Share This Business
              </h3>

              <div
                className="grid grid-cols-2 gap-4"
                style={{ marginBottom: "24px" }}
              >
                <button
                  onClick={shareOnWhatsApp}
                  className="flex flex-col items-center gap-2 p-4 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100 hover:bg-emerald-100 transition-colors"
                >
                  <FaWhatsapp className="text-2xl" />
                  <span className="text-xs font-bold">WhatsApp</span>
                </button>

                <button
                  onClick={shareOnFacebook}
                  className="flex flex-col items-center gap-2 p-4 bg-blue-50 text-blue-700 rounded-2xl border border-blue-100 hover:bg-blue-100 transition-colors"
                >
                  <FaFacebook className="text-2xl" />
                  <span className="text-xs font-bold">Facebook</span>
                </button>

                <button
                  onClick={shareOnTwitter}
                  className="flex flex-col items-center gap-2 p-4 bg-sky-50 text-sky-700 rounded-2xl border border-sky-100 hover:bg-sky-100 transition-colors"
                >
                  <FaTwitter className="text-2xl" />
                  <span className="text-xs font-bold">Twitter</span>
                </button>

                <button
                  onClick={copyToClipboard}
                  className="flex flex-col items-center gap-2 p-4 bg-slate-50 text-slate-700 rounded-2xl border border-slate-100 hover:bg-slate-100 transition-colors"
                >
                  <FaCopy className="text-2xl" />
                  <span className="text-xs font-bold">Copy Link</span>
                </button>
              </div>

              <button
                onClick={() => setShowShareOptions(false)}
                className="w-full py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Dashboard Content */}
        <div
          style={{
            padding: "15px",
            width: "90%",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          {/* Business Selector */}
          {userBusinesses.length > 0 && (
            <div
              className="bg-blue-50/80 border border-blue-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300"
              style={{ padding: "12px 20px", marginBottom: "24px" }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3 w-full sm:w-auto overflow-hidden">
                  <div className="w-10 h-10 bg-indigo-100/50 text-indigo-700 rounded-xl flex items-center justify-center border border-indigo-200/50 flex-shrink-0">
                    <span className="text-xl">🏪</span>
                  </div>
                  <div className="flex flex-col justify-center flex-grow min-w-0">
                    <select
                      value={selectedBusinessId || ""}
                      onChange={(e) =>
                        setSelectedBusinessId(
                          e.target.value === "" ? null : e.target.value,
                        )
                      }
                      className="bg-transparent text-indigo-950 font-bold text-base outline-none cursor-pointer border-none focus:ring-0 p-0 m-0 w-full truncate"
                      style={{
                        WebkitAppearance: "none",
                        appearance: "none",
                        backgroundImage: "none",
                      }}
                    >
                      <option value="">All Businesses (Combined)</option>
                      {userBusinesses.map((business) => (
                        <option key={business.id} value={business.id}>
                          {business.name}
                        </option>
                      ))}
                    </select>
                    <p
                      className="hidden sm:flex text-[10px] font-semibold text-indigo-400 uppercase tracking-widest"
                      style={{
                        alignItems: "center",
                        gap: "3px",
                        marginTop: "2px",
                      }}
                    >
                      Selected Workspace
                      <svg
                        className="w-2.5 h-2.5 text-indigo-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-indigo-100/50">
                  {selectedBusiness && (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center" style={{ gap: "2px" }}>
                        <span className="text-sm font-bold text-amber-500">
                          {selectedBusiness.reviews?.length > 0
                            ? (
                                selectedBusiness.reviews.reduce(
                                  (acc, r) => acc + r.rating,
                                  0,
                                ) / selectedBusiness.reviews.length
                              ).toFixed(1)
                            : "0.0"}
                        </span>
                        <FaStar className="w-3 h-3 text-amber-400" />
                      </div>
                      <div className="w-px h-4 bg-slate-300 mx-1"></div>
                      <button
                        onClick={handleShare}
                        className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-sm"
                        style={{ padding: "6px 14px" }}
                      >
                        <FaShareAlt className="w-3 h-3" />
                        <span className="text-xs font-bold uppercase tracking-wider">
                          Share
                        </span>
                      </button>
                    </div>
                  )}

                  <div
                    style={{ padding: "6px 14px" }}
                    className={`hidden sm:block rounded-full text-xs font-bold tracking-wide whitespace-nowrap border flex-shrink-0 ${
                      userBusinesses.length >= 2
                        ? "bg-red-50 text-red-600 border-red-200"
                        : "bg-emerald-50 text-emerald-600 border-emerald-200"
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      {userBusinesses.length >= 2 ? (
                        <svg
                          className="w-3.5 h-3.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-3.5 h-3.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                      {userBusinesses.length}/2
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Performance Overview Section */}
          <div
            className="flex items-center gap-3"
            style={{ marginBottom: "20px", marginTop: "8px" }}
          >
            <div className="w-1.5 h-6 bg-indigo-600 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.3)]"></div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">
              Performance Overview
            </h2>
          </div>

          <div
            className="grid grid-cols-2 lg:grid-cols-4"
            style={{
              gap: "clamp(12px, 3vw, 24px)",
              marginBottom: "56px",
              marginTop: "0px",
            }}
          >
            {/* Page Views */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              whileHover={{ y: -6, boxShadow: "0 16px 40px rgba(0,0,0,0.08)" }}
              className="relative bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 rounded-3xl group hover:z-50"
              style={{ padding: "clamp(16px, 3vw, 24px)" }}
            >
              {/* Background Decoration Wrapper */}
              <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
                <div
                  className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-indigo-50 rounded-full"
                  style={{ marginRight: "-32px", marginTop: "-32px" }}
                ></div>
              </div>

              <div className="relative z-20">
                <div
                  className="flex items-center justify-between"
                  style={{ marginBottom: "16px" }}
                >
                  <div
                    className="bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shadow-inner"
                    style={{
                      width: "clamp(32px, 8vw, 40px)",
                      height: "clamp(32px, 8vw, 40px)",
                    }}
                  >
                    <FaEye className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="flex items-center gap-2 relative">
                    <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest text-right">
                      Views
                    </p>
                    <div className="group/tooltip relative">
                      <FaInfoCircle
                        className="text-slate-300 cursor-help hover:text-indigo-500 transition-colors"
                        size={12}
                      />
                      <div
                        className="absolute top-full right-[-10px] sm:right-0 hidden group-hover/tooltip:block w-40 sm:w-48 bg-slate-900/95 backdrop-blur-sm text-white text-[10px] leading-relaxed rounded-xl shadow-2xl z-[100] border border-white/10"
                        style={{ marginTop: "8px", padding: "12px" }}
                      >
                        <p
                          className="font-bold text-indigo-300"
                          style={{ marginBottom: "4px" }}
                        >
                          Traffic Overview
                        </p>
                        Total number of times your business profile, notices,
                        and videos have been viewed.
                        <div className="absolute -top-1 right-3 sm:right-1 w-2 h-2 bg-slate-900 rotate-45 border-l border-t border-white/10"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-800 tracking-tight">
                  {statsLoading
                    ? "..."
                    : (analytics.pageViews || 0).toLocaleString()}
                </p>
                <div
                  className="flex items-center"
                  style={{ marginTop: "12px" }}
                >
                  <div
                    className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-400 rounded-full animate-pulse flex-shrink-0"
                    style={{ marginRight: "6px" }}
                  ></div>
                  <span className="text-[10px] sm:text-sm font-medium text-slate-500 whitespace-nowrap overflow-hidden text-ellipsis">
                    Visibility
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Content Reach (Formerly Page Shares) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.18 }}
              whileHover={{ y: -6, boxShadow: "0 16px 40px rgba(0,0,0,0.08)" }}
              className="relative bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 rounded-3xl group hover:z-50"
              style={{ padding: "clamp(16px, 3vw, 24px)" }}
            >
              {/* Background Decoration Wrapper */}
              <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
                <div
                  className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-blue-50 rounded-full"
                  style={{ marginRight: "-32px", marginTop: "-32px" }}
                ></div>
              </div>

              <div className="relative z-20">
                <div
                  className="flex items-center justify-between"
                  style={{ marginBottom: "16px" }}
                >
                  <div
                    className="bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shadow-inner"
                    style={{
                      width: "clamp(32px, 8vw, 40px)",
                      height: "clamp(32px, 8vw, 40px)",
                    }}
                  >
                    <FaShareAlt className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="flex items-center gap-2 relative">
                    <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest text-right">
                      Shares
                    </p>
                    <div className="group/tooltip relative">
                      <FaInfoCircle
                        className="text-slate-300 cursor-help hover:text-blue-500 transition-colors"
                        size={12}
                      />
                      <div
                        className="absolute top-full right-[-10px] sm:right-0 hidden group-hover/tooltip:block w-40 sm:w-48 bg-slate-900/95 backdrop-blur-sm text-white text-[10px] leading-relaxed rounded-xl shadow-2xl z-[100] border border-white/10"
                        style={{ marginTop: "8px", padding: "12px" }}
                      >
                        <p
                          className="font-bold text-blue-300"
                          style={{ marginBottom: "4px" }}
                        >
                          Engagement Reach
                        </p>
                        Total number of times users have shared your business or
                        notices with others.
                        <div className="absolute -top-1 right-3 sm:right-1 w-2 h-2 bg-slate-900 rotate-45 border-l border-t border-white/10"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-800 tracking-tight">
                  {statsLoading
                    ? "..."
                    : (analytics.shares || 0).toLocaleString()}
                </p>
                <div
                  className="flex items-center"
                  style={{ marginTop: "12px" }}
                >
                  <div
                    className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-400 rounded-full flex-shrink-0"
                    style={{ marginRight: "6px" }}
                  ></div>
                  <span className="text-[10px] sm:text-sm font-medium text-slate-500 whitespace-nowrap overflow-hidden text-ellipsis">
                    Shares
                  </span>
                </div>
              </div>
            </motion.div>

            {/* URL Clicks */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.26 }}
              whileHover={{ y: -6, boxShadow: "0 16px 40px rgba(0,0,0,0.08)" }}
              className="relative bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 rounded-3xl group hover:z-50"
              style={{ padding: "clamp(16px, 3vw, 24px)" }}
            >
              {/* Background Decoration Wrapper */}
              <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
                <div
                  className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-amber-50 rounded-full"
                  style={{ marginRight: "-32px", marginTop: "-32px" }}
                ></div>
              </div>

              <div className="relative z-20">
                <div
                  className="flex items-center justify-between"
                  style={{ marginBottom: "16px" }}
                >
                  <div
                    className="bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center shadow-inner"
                    style={{
                      width: "clamp(32px, 8vw, 40px)",
                      height: "clamp(32px, 8vw, 40px)",
                    }}
                  >
                    <FaMousePointer className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="flex items-center gap-2 relative">
                    <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest text-right">
                      Clicks
                    </p>
                    <div className="group/tooltip relative">
                      <FaInfoCircle
                        className="text-slate-300 cursor-help hover:text-amber-500 transition-colors"
                        size={12}
                      />
                      <div
                        className="absolute top-full right-[-10px] sm:right-0 hidden group-hover/tooltip:block w-40 sm:w-48 bg-slate-900/95 backdrop-blur-sm text-white text-[10px] leading-relaxed rounded-xl shadow-2xl z-[100] border border-white/10"
                        style={{ marginTop: "8px", padding: "12px" }}
                      >
                        <p
                          className="font-bold text-amber-300"
                          style={{ marginBottom: "4px" }}
                        >
                          Link Interaction
                        </p>
                        Total clicks on your primary contact links, such as
                        Website, WhatsApp, or Social Media.
                        <div className="absolute -top-1 right-3 sm:right-1 w-2 h-2 bg-slate-900 rotate-45 border-l border-t border-white/10"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-800 tracking-tight">
                  {statsLoading
                    ? "..."
                    : (analytics.clicks || 0).toLocaleString()}
                </p>
                <div
                  className="flex items-center"
                  style={{ marginTop: "12px" }}
                >
                  <div
                    className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-amber-400 rounded-full flex-shrink-0"
                    style={{ marginRight: "6px" }}
                  ></div>
                  <span className="text-[10px] sm:text-sm font-medium text-slate-500 whitespace-nowrap overflow-hidden text-ellipsis">
                    Conversion
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Leads */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.34 }}
              whileHover={{ y: -6, boxShadow: "0 16px 40px rgba(0,0,0,0.08)" }}
              className="relative bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 rounded-3xl group hover:z-50"
              style={{ padding: "clamp(16px, 3vw, 24px)" }}
            >
              {/* Background Decoration Wrapper */}
              <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
                <div
                  className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-emerald-50 rounded-full"
                  style={{ marginRight: "-32px", marginTop: "-32px" }}
                ></div>
              </div>

              <div className="relative z-20">
                <div
                  className="flex items-center justify-between"
                  style={{ marginBottom: "16px" }}
                >
                  <div
                    className="bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shadow-inner"
                    style={{
                      width: "clamp(32px, 8vw, 40px)",
                      height: "clamp(32px, 8vw, 40px)",
                    }}
                  >
                    <FaUsers className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="flex items-center gap-2 relative">
                    <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest text-right">
                      Leads
                    </p>
                    <div className="group/tooltip relative">
                      <FaInfoCircle
                        className="text-slate-300 cursor-help hover:text-emerald-500 transition-colors"
                        size={12}
                      />
                      <div
                        className="absolute top-full right-[-10px] sm:right-0 hidden group-hover/tooltip:block w-44 sm:w-56 bg-slate-900/95 backdrop-blur-sm text-white text-[10px] leading-relaxed rounded-xl shadow-2xl z-[100] border border-white/10"
                        style={{ marginTop: "8px", padding: "12px" }}
                      >
                        <div
                          className="flex items-center justify-between"
                          style={{ marginBottom: "4px" }}
                        >
                          <p className="font-bold text-emerald-300">
                            Customer Intent
                          </p>
                        </div>
                        Total business followers and contact submissions from
                        your boosted notices and ads.
                        <div className="absolute -top-1 right-3 sm:right-1 w-2 h-2 bg-slate-900 rotate-45 border-l border-t border-white/10"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-800 tracking-tight">
                  {statsLoading
                    ? "..."
                    : (analytics.leads || 0).toLocaleString()}
                </p>
                <div
                  className="flex items-center"
                  style={{ marginTop: "12px" }}
                >
                  <div
                    className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-400 rounded-full flex-shrink-0"
                    style={{ marginRight: "6px" }}
                  ></div>
                  <span className="text-[10px] sm:text-sm font-medium text-slate-500 whitespace-nowrap overflow-hidden text-ellipsis">
                    Growth
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Active Status
            <div
              className="relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl shadow-lg transition-transform hover:-translate-y-1 duration-300"
              style={{ padding: "clamp(16px, 3vw, 24px)" }}
            >
              <div
                className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white/5 rounded-full"
                style={{ marginRight: "-32px", marginTop: "-32px" }}
              ></div>
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <p className="text-sm sm:text-lg font-bold text-white tracking-wide">
                    Status
                  </p>
                  <p
                    className="text-[10px] sm:text-sm text-slate-400"
                    style={{ marginTop: "2px" }}
                  >
                    Operational
                  </p>
                </div>
                <div
                  className="flex items-center bg-white/10 rounded-full w-max backdrop-blur-sm"
                  style={{ padding: "4px 12px", marginTop: "16px" }}
                >
                  <div
                    className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-400 rounded-full animate-pulse flex-shrink-0"
                    style={{ marginRight: "6px" }}
                  ></div>
                  <span className="text-[8px] sm:text-xs font-bold text-white tracking-widest uppercase">
                    Normal
                  </span>
                </div>
              </div>
            </div>*/}
          </div>

          {/* Quick Actions Section */}
          <div
            className="flex items-center gap-3"
            style={{ marginBottom: "20px", marginTop: "8px" }}
          >
            <div className="w-1.5 h-6 bg-purple-600 rounded-full shadow-[0_0_10px_rgba(147,51,234,0.3)]"></div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">
              Quick Actions
            </h2>
          </div>

          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            style={{ gap: "24px", marginTop: "0px" }}
          >
            {/* Register Business Custom Card */}
            <div
              className={`bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 flex flex-col ${userBusinesses.length >= 2 ? "opacity-80" : "hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300"}`}
              style={{ padding: "24px" }}
            >
              <div
                className="flex items-center"
                style={{ marginBottom: "16px" }}
              >
                <div
                  className="bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100"
                  style={{ width: "48px", height: "48px" }}
                >
                  <span className="text-2xl">🏪</span>
                </div>
                <h2
                  className="text-lg font-bold text-slate-800"
                  style={{ marginLeft: "16px" }}
                >
                  Register Business
                </h2>
              </div>
              <p
                className="text-sm font-medium text-slate-500 flex-grow"
                style={{ marginBottom: "24px", lineHeight: "1.6" }}
              >
                {userBusinesses.length >= 2
                  ? "You have reached the maximum limit of 2 businesses."
                  : "Not a business owner? Register your business now!"}
              </p>
              <button
                onClick={() => setShowRegisterModal(true)}
                disabled={userBusinesses.length >= 2}
                className={`w-full rounded-2xl font-bold transition-all shadow-sm border ${
                  userBusinesses.length >= 2
                    ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                    : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200"
                }`}
                style={{ padding: "12px" }}
              >
                {userBusinesses.length >= 2
                  ? "Limit Reached"
                  : "Register Business"}
              </button>
            </div>

            {[
              // {
              //   id: "current-videos",
              //   emoji: "🎬",
              //   title: "Videos",
              //   desc: "Manage your uploaded videos and showroom content.",
              //   btnBg:
              //     "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200",
              //   btnText: "Go to Videos",
              // },
              {
                id: "current-notices",
                emoji: "🔔",
                title: "Notices",
                desc: "Post important announcements to your customers.",
                btnBg:
                  "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200",
                btnText: "Go to Notices",
              },
              {
                id: "leads",
                emoji: "👥",
                title: "Leads & Contacts",
                desc: "View and manage your customer leads and contact submissions.",
                btnBg:
                  "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200",
                btnText: "Go to Leads",
              },
              {
                id: "marketplace",
                emoji: "🛍️",
                title: "Products & Ads",
                desc: "Manage products, analytics and advertising campaigns.",
                btnBg:
                  "bg-pink-50 text-pink-700 hover:bg-pink-100 border border-pink-200",
                btnText: "Go to Products",
              },
              {
                id: "verification",
                emoji: "✅",
                title: "Verification",
                desc: "Manage business verification documents and status.",
                btnBg:
                  "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200",
                btnText: "Go to Verification",
              },
              {
                id: "edit-business",
                emoji: "🏪",
                title: "Businesses",
                desc: "View and Edit each of your businesses details and settings.",
                btnBg:
                  "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200",
                btnText: "Edit Business",
              },
              {
                id: "wallet",
                emoji: "💳",
                title: "Wallet & Billing",
                desc: "Manage your global funds, top up, and view transaction history.",
                btnBg:
                  "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200",
                btnText: "Go to Wallet",
              },
              {
                id: "edit-profile",
                emoji: "👤",
                title: "Edit Profile",
                desc: "Keep your profile information up to date securely.",
                btnBg:
                  "bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200",
                btnText: "Edit Profile",
              },
            ].map((card) => (
              <div
                key={card.id}
                className="bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 flex flex-col"
                style={{ padding: "24px" }}
              >
                <div
                  className="flex items-center"
                  style={{ marginBottom: "16px" }}
                >
                  <div
                    className="bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100"
                    style={{ width: "48px", height: "48px" }}
                  >
                    <span className="text-2xl">{card.emoji}</span>
                  </div>
                  <h2
                    className="text-lg font-bold text-slate-800"
                    style={{ marginLeft: "16px" }}
                  >
                    {card.title}
                  </h2>
                </div>
                <p
                  className="text-sm font-medium text-slate-500 flex-grow"
                  style={{ marginBottom: "24px", lineHeight: "1.6" }}
                >
                  {card.desc}
                </p>
                <button
                  onClick={() =>
                    router.push(`/dashboard/${userData?.id}?tab=${card.id}`)
                  }
                  className={`w-full rounded-2xl font-bold transition-all shadow-sm ${card.btnBg}`}
                  style={{ padding: "12px" }}
                >
                  {card.btnText}
                </button>
              </div>
            ))}

            {/* Request Ad Custom Card
            <div
              className="bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 flex flex-col"
              style={{ padding: "24px" }}
            >
              <div
                className="flex items-center"
                style={{ marginBottom: "16px" }}
              >
                <div
                  className="bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100"
                  style={{ width: "48px", height: "48px" }}
                >
                  <span className="text-2xl">📈</span>
                </div>
                <h2
                  className="text-lg font-bold text-slate-800"
                  style={{ marginLeft: "16px" }}
                >
                  Request Ad
                </h2>
              </div>
              <p
                className="text-sm font-medium text-slate-500 flex-grow"
                style={{ marginBottom: "24px", lineHeight: "1.6" }}
              >
                Get a personalized advertising plan for your business.
              </p>
              <Link
                href={
                  selectedBusinessId
                    ? `/ad?businessId=${selectedBusinessId}`
                    : "/ad"
                }
                className={`block w-full ${userBusinesses.length > 0 && !selectedBusinessId ? "pointer-events-none" : ""}`}
                style={{ margin: 0, padding: 0 }}
              >
                <button
                  disabled={userBusinesses.length > 0 && !selectedBusinessId}
                  className={`w-full rounded-2xl font-bold transition-all shadow-sm border ${
                    userBusinesses.length > 0 && !selectedBusinessId
                      ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                      : "bg-red-50 text-red-700 hover:bg-red-100 border-red-200"
                  }`}
                  style={{ padding: "12px" }}
                >
                  {userBusinesses.length > 0 && !selectedBusinessId
                    ? "Select Business First"
                    : "Request Ad"}
                </button>
              </Link>
            </div> */}
          </div>
        </div>
      </motion.main>
      {showRegisterModal && (
        <Modal
          title={`Register Your Business (${userBusinesses.length}/2)`}
          onClose={() => setShowRegisterModal(false)}
        >
          <RegisterBusiness
            userId={userData?.id}
            onSuccess={handleRegistrationSuccess}
          />
        </Modal>
      )}
      {/* {isScrollingUp && <ScrollFooter />} */}
      {/* <Footer /> */}
    </ErrorBoundary>
  );
}

export default withAuth(Dashboard);
