"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { 
  GET_ADMIN_TOP_LISTINGS, 
  ADMIN_CANCEL_TOP_LISTING 
} from "@/graphql/queries/admin/topListings";
import Tables from "../otherComponents/Tables";
import { toast } from "react-hot-toast";
import { 
  FiStar, 
  FiBriefcase, 
  FiShoppingBag, 
  FiClipboard, 
  FiClock, 
  FiCheckCircle, 
  FiXCircle,
  FiSlash
} from "react-icons/fi";

export default function TopListingsForAdmin() {
  const [filterType, setFilterType] = useState("ALL"); // ALL, ACTIVE, EXPIRED, BUSINESS, PRODUCT, NOTICE

  const toplistadArg = 
    filterType === "BUSINESS" ? "BUSINESS_TOPLIST" :
    filterType === "PRODUCT" ? "PRODUCT_TOPLIST" :
    filterType === "NOTICE" ? "NOTICE_TOPLIST" : undefined;

  const statusArg = 
    filterType === "ACTIVE" ? "ACTIVE" :
    filterType === "EXPIRED" ? "EXPIRED" : undefined;

  const { data, loading, error, refetch } = useQuery(GET_ADMIN_TOP_LISTINGS, {
    variables: {
      pagination: { take: 100 },
      toplistad: toplistadArg,
      status: statusArg,
    },
    fetchPolicy: "network-only",
  });

  const [cancelTopListing, { loading: cancelling }] = useMutation(ADMIN_CANCEL_TOP_LISTING, {
    onCompleted: () => {
      toast.success("Top Listing campaign cancelled");
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const rawListings = data?.adminAllTopListingAds || [];
  const now = new Date();

  const handleCancel = async (row) => {
    if (window.confirm(`Are you sure you want to early-cancel the search top listing for "${row.business?.name}"?`)) {
      try {
        await cancelTopListing({ variables: { id: row.id } });
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Aggregated Counters
  const totalCount = rawListings.length;
  const activeCount = rawListings.filter((l) => new Date(l.endDate) >= now).length;
  const businessPins = rawListings.filter((l) => l.toplistad === "BUSINESS_TOPLIST").length;
  const itemPins = rawListings.filter((l) => l.toplistad !== "BUSINESS_TOPLIST").length;

  const formatPlacement = (type) => {
    switch (type) {
      case "BUSINESS_TOPLIST":
        return { label: "Business Directory Pin", color: "bg-blue-50 text-blue-700", icon: <FiBriefcase size={12} /> };
      case "PRODUCT_TOPLIST":
        return { label: "Marketplace Product Top", color: "bg-purple-50 text-purple-700", icon: <FiShoppingBag size={12} /> };
      case "NOTICE_TOPLIST":
        return { label: "Noticeboard Top", color: "bg-amber-50 text-amber-700", icon: <FiClipboard size={12} /> };
      default:
        return { label: type || "Top List", color: "bg-slate-50 text-slate-700", icon: <FiStar size={12} /> };
    }
  };

  const getTimeRemaining = (endDateStr) => {
    const end = new Date(endDateStr);
    const diffMs = end - now;
    if (diffMs <= 0) return "Expired";
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays > 0) return `${diffDays}d ${diffHours % 24}h remaining`;
    return `${diffHours}h remaining`;
  };

  const tableData = rawListings.map((l) => {
    const isLive = new Date(l.endDate) >= now;
    const placement = formatPlacement(l.toplistad);

    return {
      ...l,
      isLive,
      businessName: l.business?.name || "Unknown Business",
      merchantEmail: l.business?.user?.email || "No email",
      timeRemaining: getTimeRemaining(l.endDate),
      placementBadge: (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${placement.color}`}>
          {placement.icon}
          {placement.label}
        </span>
      ),
      statusPill: (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
          isLive ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"
        }`}>
          {isLive ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Active Pin
            </>
          ) : (
            <>
              <FiXCircle size={12} />
              Expired
            </>
          )}
        </span>
      ),
    };
  });

  const columns = [
    {
      title: "Merchant & Business",
      field: "businessName",
      render: (row) => (
        <div>
          <p className="font-bold text-slate-800">{row.businessName}</p>
          <p className="text-xs text-slate-400 font-medium">{row.merchantEmail}</p>
        </div>
      ),
    },
    {
      title: "Placement Type",
      field: "placementBadge",
    },
    {
      title: "Time Remaining",
      field: "timeRemaining",
      render: (row) => (
        <div className="flex items-center gap-1 text-xs font-semibold text-slate-700">
          <FiClock size={13} className={row.isLive ? "text-blue-500" : "text-slate-400"} />
          {row.timeRemaining}
        </div>
      ),
    },
    {
      title: "Start Date",
      field: "startDate",
      render: (row) => (
        <span className="text-xs text-slate-500 font-medium">
          {new Date(row.startDate).toLocaleDateString()}
        </span>
      ),
    },
    {
      title: "End Date",
      field: "endDate",
      render: (row) => (
        <span className="text-xs text-slate-500 font-medium">
          {new Date(row.endDate).toLocaleDateString()}
        </span>
      ),
    },
    {
      title: "Status",
      field: "statusPill",
    },
    {
      title: "Actions",
      field: "id",
      render: (row) => (
        row.isLive ? (
          <button
            onClick={() => handleCancel(row)}
            disabled={cancelling}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
            title="Cancel top listing promotion early"
          >
            <FiSlash size={12} />
            Cancel Pin
          </button>
        ) : (
          <span className="text-xs text-slate-400 font-medium italic">Ended</span>
        )
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Top-Listing Search Boosts</h1>
          <p className="text-sm text-slate-500">Monitor and moderate paid top-placement search ads across the platform</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl">
            <FiStar />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Campaigns</p>
            <h3 className="text-2xl font-extrabold text-slate-800">{totalCount}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">
            <FiCheckCircle />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Search Pins</p>
            <h3 className="text-2xl font-extrabold text-slate-800">{activeCount}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl">
            <FiBriefcase />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Business Pins</p>
            <h3 className="text-2xl font-extrabold text-slate-800">{businessPins}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl">
            <FiShoppingBag />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Product & Notice</p>
            <h3 className="text-2xl font-extrabold text-slate-800">{itemPins}</h3>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 rounded-2xl w-fit">
        {[
          { id: "ALL", label: "All Campaigns" },
          { id: "ACTIVE", label: `Active (${activeCount})` },
          { id: "EXPIRED", label: "Expired" },
          { id: "BUSINESS", label: "Business Pins" },
          { id: "PRODUCT", label: "Product Pins" },
          { id: "NOTICE", label: "Notice Pins" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filterType === tab.id
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
        {error && (
          <div className="p-4 bg-red-50 text-red-700 text-sm rounded-xl mb-4">
            Failed to load top listings: {error.message}
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
