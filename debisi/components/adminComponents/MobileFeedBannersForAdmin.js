"use client";

import { useState } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import Table from "../otherComponents/Tables";
import { FiCheck, FiX, FiCalendar, FiEye } from "react-icons/fi";
import { toast } from "react-hot-toast";

const GET_MOBILE_FEED_BANNERS = gql`
  query GetMobileFeedBanners {
    mobileFeedBanners {
      id
      email
      title
      description
      images
      ctaUrl
      weeks
      price
      status
      startDate
      endDate
      paystackRef
      createdAt
    }
  }
`;

const APPROVE_MOBILE_FEED_BANNER = gql`
  mutation ApproveMobileFeedBanner($id: ID!, $startDate: String!, $endDate: String!) {
    approveMobileFeedBanner(id: $id, startDate: $startDate, endDate: $endDate) {
      id
      status
      startDate
      endDate
    }
  }
`;

const REJECT_MOBILE_FEED_BANNER = gql`
  mutation RejectMobileFeedBanner($id: ID!, $reason: String) {
    rejectMobileFeedBanner(id: $id, reason: $reason) {
      id
      status
    }
  }
`;

const MobileFeedBannersForAdmin = () => {
  const { data, loading, refetch } = useQuery(GET_MOBILE_FEED_BANNERS, {
    fetchPolicy: "network-only",
  });

  const [approveBanner] = useMutation(APPROVE_MOBILE_FEED_BANNER);
  const [rejectBanner] = useMutation(REJECT_MOBILE_FEED_BANNER);

  const banners = data?.mobileFeedBanners || [];

  // Approval Modal States
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [selectedBannerId, setSelectedBannerId] = useState(null);
  const [dates, setDates] = useState({ startDate: "", endDate: "" });

  // Preview Image States
  const [previewImages, setPreviewImages] = useState([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleOpenApprove = (id, weeks) => {
    setSelectedBannerId(id);
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + weeks * 7);

    setDates({
      startDate: start.toISOString().split("T")[0],
      endDate: end.toISOString().split("T")[0],
    });
    setIsApproveOpen(true);
  };

  const handleApproveConfirm = async () => {
    if (!dates.startDate || !dates.endDate) {
      toast.error("Please select both start and end dates");
      return;
    }

    try {
      await approveBanner({
        variables: {
          id: selectedBannerId,
          startDate: new Date(dates.startDate).toISOString(),
          endDate: new Date(dates.endDate).toISOString(),
        },
      });
      toast.success("Mobile feed banner approved and email sent!");
      setIsApproveOpen(false);
      refetch();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleReject = async (id) => {
    const reason = prompt("Enter rejection reason (optional):");
    if (reason !== null) {
      try {
        await rejectBanner({ variables: { id, reason } });
        toast.success("Mobile feed banner rejected");
        refetch();
      } catch (err) {
        toast.error(err.message);
      }
    }
  };

  const handlePreviewImages = (images) => {
    setPreviewImages(images || []);
    setIsPreviewOpen(true);
  };

  const columns = [
    { title: "Email", field: "email" },
    { title: "Title", field: "title" },
    { title: "CTA Link", field: "ctaUrl" },
    { title: "Weeks", field: "weeks" },
    {
      title: "Cost",
      field: "price",
      render: (row) => `₦${row.price.toLocaleString()}`,
    },
    {
      title: "Images",
      field: "images",
      render: (row) => (
        <button
          onClick={() => handlePreviewImages(row.images)}
          className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1 font-bold text-xs"
        >
          <FiEye /> View ({row.images?.length || 0})
        </button>
      ),
    },
    {
      title: "Status",
      field: "status",
      render: (row) => {
        const map = {
          APPROVED: ["#D1FAE5", "#065F46"],
          EXPIRED: ["#F3F4F6", "#374151"],
          REJECTED: ["#FEE2E2", "#991B1B"],
          AWAITING_APPROVAL: ["#FEF3C7", "#92400E"],
        };
        const [bg, color] = map[row.status] || ["#F3F4F6", "#6B7280"];
        return (
          <span style={{ background: bg, color, padding: "3px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: "bold" }}>
            {row.status}
          </span>
        );
      },
    },
    {
      title: "Actions",
      field: "actions",
      render: (row) =>
        row.status === "AWAITING_APPROVAL" ? (
          <div style={{ display: "flex", gap: "6px" }}>
            <button
              onClick={() => handleOpenApprove(row.id, row.weeks)}
              style={{ padding: "5px 10px", background: "#D1FAE5", color: "#065F46", borderRadius: "6px", border: "none", cursor: "pointer", fontWeight: "bold", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}
            >
              <FiCheck size={12} /> Approve
            </button>
            <button
              onClick={() => handleReject(row.id)}
              style={{ padding: "5px 10px", background: "#FEE2E2", color: "#991B1B", borderRadius: "6px", border: "none", cursor: "pointer", fontWeight: "bold", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}
            >
              <FiX size={12} /> Reject
            </button>
          </div>
        ) : row.status === "APPROVED" ? (
          <span className="text-[11px] text-gray-500 font-medium">
            Starts: {new Date(row.startDate).toLocaleDateString()}<br/>
            Ends: {new Date(row.endDate).toLocaleDateString()}
          </span>
        ) : null,
    },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between" style={{ gap: "16px", marginBottom: "24px" }}>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Mobile Feed Banners</h1>
          <p className="text-sm text-gray-500">Review, schedule, and approve mobile application homepage banners.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: "16px", marginBottom: "24px" }}>
        {[
          { label: "Total Applications", value: banners.length, bg: "#DBEAFE", icon: "📋" },
          { label: "Awaiting Review", value: banners.filter(a => a.status === "AWAITING_APPROVAL").length, bg: "#FEF3C7", icon: "⏳" },
          { label: "Currently Active", value: banners.filter(a => a.status === "APPROVED").length, bg: "#D1FAE5", icon: "✅" },
          { label: "Completed / Expired", value: banners.filter(a => a.status === "EXPIRED").length, bg: "#F3F4F6", icon: "🏁" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center" style={{ padding: "20px", gap: "12px" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: s.bg }}>{s.icon}</div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">{s.label}</p>
              <h2 className="text-2xl font-bold text-gray-900">{s.value}</h2>
            </div>
          </div>
        ))}
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-2 duration-700 bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <Table data={banners} columns={columns} isLoading={loading} />
      </div>

      {/* Approve Modal */}
      {isApproveOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FiCalendar className="text-red-600" /> Set Banner Schedule
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={dates.startDate}
                  onChange={(e) => setDates({ ...dates, startDate: e.target.value })}
                  className="w-full border rounded-xl p-3 focus:outline-none focus:border-red-600"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={dates.endDate}
                  onChange={(e) => setDates({ ...dates, endDate: e.target.value })}
                  className="w-full border rounded-xl p-3 focus:outline-none focus:border-red-600"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsApproveOpen(false)}
                className="px-4 py-2 border rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleApproveConfirm}
                className="px-5 py-2 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition"
              >
                Confirm Approval
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setIsPreviewOpen(false)}>
          <div className="bg-white rounded-2xl p-4 max-w-2xl w-full shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold text-gray-950">Creative Asset Previews</h4>
              <button onClick={() => setIsPreviewOpen(false)} className="text-gray-400 hover:text-gray-600 font-bold">Close</button>
            </div>
            <div className="flex gap-4 overflow-x-auto py-2">
              {previewImages.map((imgUrl, i) => (
                <div key={i} className="flex-shrink-0 relative rounded-xl overflow-hidden border" style={{ width: "280px", height: "280px" }}>
                  <img src={imgUrl} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
              {previewImages.length === 0 && (
                <p className="text-gray-500 py-6 text-center w-full">No image uploads available.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileFeedBannersForAdmin;
