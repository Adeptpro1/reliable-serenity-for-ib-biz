"use client";

import { useQuery, useMutation } from "@apollo/client";
import { GET_ADMIN_ADS, APPROVE_AD, REJECT_AD } from "../../api/queries/business/ads";
import Table from "../otherComponents/Tables";
import { FiMonitor, FiCheck, FiX } from "react-icons/fi";
import { toast } from "react-hot-toast";

const AdsForAdmin = () => {
  const { data, loading, error, refetch } = useQuery(GET_ADMIN_ADS, {
    fetchPolicy: "network-only",
  });

  const [approveAdMutation] = useMutation(APPROVE_AD);
  const [rejectAdMutation] = useMutation(REJECT_AD);

  const ads = data?.ads || [];

  const handleApprove = async (id) => {
    try {
      await approveAdMutation({ variables: { id } });
      toast.success("Ad approved!");
      refetch();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleReject = async (id) => {
    const reason = prompt("Enter rejection reason (optional):");
    if (reason !== null) {
      try {
        await rejectAdMutation({ variables: { id, reason } });
        toast.success("Ad rejected");
        refetch();
      } catch (err) {
        toast.error(err.message);
      }
    }
  };

  const flatAds = ads.map((ad) => ({
    ...ad,
    businessName: ad.business?.name || "—",
  }));

  const columns = [
    { title: "ID", field: "id", hideOnMobile: true },
    { title: "Title", field: "title" },
    { title: "Business", field: "businessName", hideOnMobile: true },
    { title: "Type", field: "type", hideOnMobile: true },
    { title: "Clicks", field: "clicks", hideOnMobile: true },
    {
      title: "Status",
      field: "status",
      render: (row) => {
        const map = {
          APPROVED: ["#D1FAE5", "#065F46"],
          PUBLISHED: ["#D1FAE5", "#065F46"],
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
      title: "Approval",
      field: "approvals",
      render: (row) =>
        row.status === "AWAITING_APPROVAL" ? (
          <div style={{ display: "flex", gap: "6px" }}>
            <button
              onClick={() => handleApprove(row.id)}
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
        ) : null,
    },
  ];

  if (error) {
    return (
      <div style={{ padding: "24px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "16px", color: "#991B1B" }}>
        <strong>Error loading ads:</strong> {error.message}
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between" style={{ gap: "16px", marginBottom: "24px" }}>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Ad Management</h1>
          <p className="text-sm text-gray-500">Review, approve, and manage all platform advertisements</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: "16px", marginBottom: "24px" }}>
        {[
          { label: "Total", value: ads.length, bg: "#DBEAFE", icon: "📋" },
          { label: "Awaiting", value: ads.filter(a => a.status === "AWAITING_APPROVAL").length, bg: "#FEF3C7", icon: "⏳" },
          { label: "Approved", value: ads.filter(a => ["APPROVED","PUBLISHED"].includes(a.status)).length, bg: "#D1FAE5", icon: "✅" },
          { label: "Rejected", value: ads.filter(a => a.status === "REJECTED").length, bg: "#FEE2E2", icon: "❌" },
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

      <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
        <Table data={flatAds} columns={columns} isLoading={loading} />
      </div>
    </div>
  );
};

export default AdsForAdmin;
