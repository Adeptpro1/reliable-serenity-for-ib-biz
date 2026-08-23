"use client";

import { useQuery } from "@apollo/client";
import { GET_ADMIN_VIDEO_COSTS } from "@/graphql/queries/admin/videoCosts";
import Tables from "../otherComponents/Tables";
import { 
  FiVideo, 
  FiActivity, 
  FiDollarSign, 
  FiTrendingUp, 
  FiTrendingDown,
  FiHardDrive,
  FiCalendar
} from "react-icons/fi";

export default function VideoCostsForAdmin() {
  const { data, loading, error } = useQuery(GET_ADMIN_VIDEO_COSTS, {
    variables: {
      pagination: { take: 100 },
    },
    fetchPolicy: "network-only",
  });

  const summary = data?.adminVideoCostSummary || {
    totalBandwidthGB: 0,
    totalEstimatedCost: 0,
    totalVideoRevenue: 0,
    netMargin: 0,
    marginPercentage: 0,
    activeVideosTracked: 0,
  };

  const rawLogs = data?.adminVideoCostLogs || [];

  const formatBoostTier = (tier) => {
    switch (tier) {
      case "TOWN":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600">Town Boost</span>;
      case "CITY":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-600">City Boost</span>;
      case "STATE":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600">State Boost</span>;
      case "SPONSORED":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600">Sponsored</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">Standard</span>;
    }
  };

  const tableData = rawLogs.map((log) => {
    const isProfitable = log.profitMargin >= 0;
    return {
      ...log,
      dateFormatted: new Date(log.date).toLocaleDateString(),
      bandwidthFormatted: `${log.bandwidthGB} GB`,
      costFormatted: `₦${log.estimatedCost.toLocaleString()}`,
      revenueFormatted: `₦${log.revenue.toLocaleString()}`,
      marginFormatted: `₦${log.profitMargin.toLocaleString()}`,
      boostBadge: formatBoostTier(log.boostTier),
      marginPill: (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
            isProfitable
              ? "bg-emerald-50 text-emerald-600"
              : "bg-rose-50 text-rose-600"
          }`}
        >
          {isProfitable ? <FiTrendingUp size={12} /> : <FiTrendingDown size={12} />}
          {isProfitable ? `+₦${log.profitMargin.toLocaleString()}` : `-₦${Math.abs(log.profitMargin).toLocaleString()}`}
        </span>
      ),
    };
  });

  const columns = [
    {
      title: "Date",
      field: "dateFormatted",
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
          <FiCalendar size={13} className="text-slate-400" />
          {row.dateFormatted}
        </div>
      ),
    },
    {
      title: "Showroom Video & Business",
      field: "videoTitle",
      render: (row) => (
        <div>
          <p className="font-bold text-slate-800 line-clamp-1">{row.videoTitle}</p>
          <p className="text-xs text-slate-400 font-medium">{row.businessName}</p>
        </div>
      ),
    },
    {
      title: "Bandwidth Egress",
      field: "bandwidthFormatted",
      render: (row) => (
        <span className="font-semibold text-slate-800 text-xs">
          {row.bandwidthFormatted}
        </span>
      ),
    },
    {
      title: "CDN Cost (Bunny)",
      field: "costFormatted",
      render: (row) => (
        <span className="font-semibold text-rose-600 text-xs">
          {row.costFormatted}
        </span>
      ),
    },
    {
      title: "Promotion Revenue",
      field: "revenueFormatted",
      render: (row) => (
        <span className="font-semibold text-emerald-600 text-xs">
          {row.revenueFormatted}
        </span>
      ),
    },
    {
      title: "Net Margin",
      field: "marginPill",
    },
    {
      title: "Tier",
      field: "boostBadge",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner / Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">CDN Video Margins & Bandwidth</h1>
          <p className="text-sm text-slate-500">Live auditing of Bunny.net video egress bandwidth versus promotion revenue</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 text-sm rounded-xl mb-4 border border-red-100">
          Failed to load video cost data: {error.message}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl">
            <FiHardDrive />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Bandwidth</p>
            <h3 className="text-2xl font-extrabold text-slate-800">{summary.totalBandwidthGB} GB</h3>
            <p className="text-[11px] text-slate-400 mt-1">{summary.activeVideosTracked} videos tracked</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-xl">
            <FiActivity />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Estimated CDN Bill</p>
            <h3 className="text-2xl font-extrabold text-slate-800">₦{summary.totalEstimatedCost.toLocaleString()}</h3>
            <p className="text-[11px] text-slate-400 mt-1">@ ₦90/GB Africa egress</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">
            <FiDollarSign />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Video Revenue</p>
            <h3 className="text-2xl font-extrabold text-slate-800">₦{summary.totalVideoRevenue.toLocaleString()}</h3>
            <p className="text-[11px] text-slate-400 mt-1">Uploads & boosts</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${
            summary.netMargin >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
          }`}>
            {summary.netMargin >= 0 ? <FiTrendingUp /> : <FiTrendingDown />}
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Net Profit Margin</p>
            <h3 className={`text-2xl font-extrabold ${summary.netMargin >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
              ₦{summary.netMargin.toLocaleString()}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1 font-semibold">
              {summary.marginPercentage > 0 ? `+${summary.marginPercentage}% margin` : "Break-even / Base"}
            </p>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
        {error && (
          <div className="p-4 bg-red-50 text-red-700 text-sm rounded-xl mb-4">
            Failed to load video cost logs: {error.message}
          </div>
        )}

        <Tables
          columns={columns}
          data={tableData}
          isLoading={loading}
          hideSearch={false}
        />
      </div>
    </div>
  );
}
