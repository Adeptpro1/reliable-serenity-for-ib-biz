"use client";

import React from "react";
import { useQuery } from "@apollo/client";
import { motion } from "framer-motion";
import {
  FaUsers,
  FaBriefcase,
  FaMoneyBillWave,
  FaArrowUp,
  FaArrowDown,
  FaChartLine,
  FaAd,
  FaHeart,
  FaChevronRight,
  FaCheckCircle,
  FaClock,
} from "react-icons/fa";
import { GET_ADMIN_OVERVIEW } from "../../api/queries/admin/overview";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(n) {
  if (!n && n !== 0) return "—";
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `₦${(n / 1_000).toFixed(1)}K`;
  return `₦${n.toLocaleString()}`;
}

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(Number(dateStr) || dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

const StatCard = ({ title, value, icon, sub, color, loading, index = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: index * 0.08 }}
    whileHover={{ y: -5, boxShadow: "0 12px 30px rgba(0,0,0,0.08)" }}
    className="bg-white rounded-2xl shadow-sm border border-gray-100 cursor-default"
    style={{ padding: "24px" }}
  >
    <div className="flex items-center justify-between" style={{ marginBottom: "16px" }}>
      <div
        className={`rounded-xl text-xl ${color}`}
        style={{ padding: "12px", opacity: 0.9 }}
      >
        {icon}
      </div>
      {sub && (
        <span className="text-xs font-semibold text-gray-400 bg-gray-50 rounded-full px-2 py-1">
          {sub}
        </span>
      )}
    </div>
    <p className="text-sm font-medium text-gray-500" style={{ marginBottom: "4px" }}>
      {title}
    </p>
    <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
      {loading ? (
        <span className="inline-block w-20 h-6 bg-gray-100 animate-pulse rounded-lg" />
      ) : (
        value
      )}
    </h3>
  </motion.div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const AdminOverview = () => {
  const { data, loading, error } = useQuery(GET_ADMIN_OVERVIEW, {
    fetchPolicy: "network-only",
  });

  // Derived counts
  const walletStats   = data?.adminWalletStats;
  const users         = data?.adminUsersPaginated || [];
  const businesses    = data?.adminBusinessesPaginated || [];
  const ads           = data?.ads || [];
  const therapy       = data?.therapyRequests || [];

  const totalUsers      = users.length;
  const totalBusinesses = businesses.length;
  const verifiedBiz     = businesses.filter((b) => b.isVerified).length;
  const pendingAds      = ads.filter((a) => a.status === "AWAITING_APPROVAL").length;
  const pendingTherapy  = therapy.filter((t) => t.status === "PENDING").length;

  const stats = [
    {
      title: "Total Revenue",
      value: formatCurrency(walletStats?.totalRevenue),
      icon: <FaMoneyBillWave className="text-blue-600" />,
      sub: `${walletStats?.totalTransactionsCount ?? "—"} txns`,
      color: "bg-blue-50",
    },
    {
      title: "Total Users",
      value: totalUsers.toLocaleString(),
      icon: <FaUsers className="text-purple-600" />,
      sub: `${users.filter(u => u.role === "ADMIN").length} admins`,
      color: "bg-purple-50",
    },
    {
      title: "Total Businesses",
      value: totalBusinesses.toLocaleString(),
      icon: <FaBriefcase className="text-amber-600" />,
      sub: `${verifiedBiz} verified`,
      color: "bg-amber-50",
    },
    {
      title: "Ads Pending",
      value: pendingAds,
      icon: <FaAd className="text-emerald-600" />,
      sub: `${ads.length} total ads`,
      color: "bg-emerald-50",
    },
  ];

  // ── Build a live recent activity feed ──────────────────────────────────────
  const recentActivity = [];

  // 5 newest users
  [...users]
    .sort((a, b) => Number(b.createdAt) - Number(a.createdAt))
    .slice(0, 3)
    .forEach((u) => {
      recentActivity.push({
        text: `New user registered: ${u.firstName || ""} ${u.lastName || ""}`.trim(),
        time: timeAgo(u.createdAt),
        icon: <FaUsers />,
        color: "text-purple-600 bg-purple-100",
      });
    });

  // 3 newest businesses
  [...businesses]
    .sort((a, b) => Number(b.createdAt) - Number(a.createdAt))
    .slice(0, 2)
    .forEach((b) => {
      recentActivity.push({
        text: `Business registered: ${b.name}`,
        time: timeAgo(b.createdAt),
        icon: <FaBriefcase />,
        color: "text-amber-600 bg-amber-100",
      });
    });

  // pending therapy
  therapy
    .filter((t) => t.status === "PENDING")
    .sort((a, b) => Number(b.createdAt) - Number(a.createdAt))
    .slice(0, 2)
    .forEach((t) => {
      recentActivity.push({
        text: `Therapy request from ${t.name}`,
        time: timeAgo(t.createdAt),
        icon: <FaHeart />,
        color: "text-rose-600 bg-rose-100",
      });
    });

  // Sort all by recency and take top 6
  const sortedActivity = recentActivity
    .slice(0, 8);

  // ── Revenue bar chart: derive from real transaction split ──────────────────
  // We show funding vs deduction vs total as context bars
  const totalTx   = walletStats?.totalTransactionsCount || 0;
  const fundingPct   = totalTx ? Math.round((walletStats.fundingCount / totalTx) * 100) : 0;
  const deductionPct = totalTx ? Math.round((walletStats.deductionCount / totalTx) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ paddingBottom: "48px" }}
    >
      {/* Welcome banner */}
      <div
        className="relative overflow-hidden bg-slate-900 rounded-3xl text-white shadow-2xl shadow-slate-900/20"
        style={{ padding: "32px", marginBottom: "32px" }}
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between" style={{ gap: "24px" }}>
          <div>
            <h2 className="text-3xl font-bold" style={{ marginBottom: "8px" }}>
              Platform Overview
            </h2>
            <p className="text-slate-400 max-w-md">
              Live data across the Debisi network.{" "}
              {loading ? "Loading…" : `${totalUsers} users · ${totalBusinesses} businesses · ${pendingAds} ads awaiting review.`}
            </p>
          </div>
          <div className="flex gap-3">
            <div className="bg-white/10 rounded-xl text-sm font-medium px-4 py-2 flex items-center gap-2">
              <FaClock size={12} className="text-slate-400" />
              <span className="text-slate-300">Live</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
          </div>
        </div>
        {/* Decorative blurs */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      {/* Error notice */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm font-medium">
          Could not load some stats: {error.message}
        </div>
      )}

      {/* Stat Cards */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        style={{ gap: "24px", marginBottom: "32px" }}
      >
        {stats.map((s, i) => (
          <StatCard key={i} {...s} loading={loading} index={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3" style={{ gap: "32px" }}>
        {/* Transaction breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          whileHover={{ y: -3 }}
          className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100"
          style={{ padding: "32px" }}
        >
          <div className="flex items-center justify-between" style={{ marginBottom: "28px" }}>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Transaction Breakdown</h3>
              <p className="text-sm text-gray-500">Funding vs deductions across all wallets</p>
            </div>
            <div className="text-sm font-semibold text-gray-500 bg-gray-50 rounded-xl px-4 py-2">
              {totalTx.toLocaleString()} total
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-gray-100 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Funding */}
              <div>
                <div className="flex justify-between text-sm font-semibold text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
                    Funding transactions
                  </span>
                  <span>{walletStats?.fundingCount ?? 0}</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 rounded-full transition-all duration-700"
                    style={{ width: `${fundingPct}%` }}
                  />
                </div>
              </div>
              {/* Deductions */}
              <div>
                <div className="flex justify-between text-sm font-semibold text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-400 inline-block" />
                    Deduction transactions
                  </span>
                  <span>{walletStats?.deductionCount ?? 0}</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-400 rounded-full transition-all duration-700"
                    style={{ width: `${deductionPct}%` }}
                  />
                </div>
              </div>

              {/* Summary tiles */}
              <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-gray-100">
                {[
                  { label: "Total Revenue", value: formatCurrency(walletStats?.totalRevenue), color: "text-blue-600" },
                  { label: "Verified Biz", value: verifiedBiz, color: "text-amber-600" },
                  { label: "Therapy Pending", value: pendingTherapy, color: "text-rose-600" },
                ].map((t) => (
                  <div key={t.label} className="text-center">
                    <p className={`text-xl font-black ${t.color}`}>{t.value}</p>
                    <p className="text-xs text-gray-400 font-medium mt-1">{t.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Live Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col"
          style={{ padding: "32px" }}
        >
          <div className="flex items-center gap-2" style={{ marginBottom: "24px" }}>
            <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          <div className="flex-1 space-y-4">
            {loading ? (
              [1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="w-9 h-9 rounded-full bg-gray-100 animate-pulse flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-gray-100 animate-pulse rounded w-full" />
                    <div className="h-2.5 bg-gray-100 animate-pulse rounded w-1/3" />
                  </div>
                </div>
              ))
            ) : sortedActivity.length === 0 ? (
              <div className="text-center py-8">
                <FaCheckCircle className="mx-auto text-gray-200 text-4xl mb-3" />
                <p className="text-sm text-gray-400">No recent activity</p>
              </div>
            ) : (
              sortedActivity.map((item, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm ${item.color}`}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800 leading-snug">
                      {item.text}
                    </p>
                    <span className="text-xs text-gray-400">{item.time}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AdminOverview;
