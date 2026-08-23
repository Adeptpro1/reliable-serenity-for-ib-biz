import React, { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_ADMIN_REACH_OUTS } from "@/graphql/queries/business/reachout";
import { APPROVE_REACH_OUT, REJECT_REACH_OUT } from "@/graphql/mutations/business/reachout";
import { toast } from "react-hot-toast";
import { FiCheck, FiX, FiClock, FiDollarSign, FiInfo } from "react-icons/fi";

const ReachOutForAdmin = () => {
  const [statusFilter, setStatusFilter] = useState("PENDING"); // "PENDING", "APPROVED", "REJECTED", "SENT", ""

  const { data, loading, refetch } = useQuery(GET_ADMIN_REACH_OUTS, {
    variables: { status: statusFilter || undefined },
    fetchPolicy: "cache-and-network",
  });

  const [approveCampaign, { loading: approving }] = useMutation(APPROVE_REACH_OUT);
  const [rejectCampaign, { loading: rejecting }] = useMutation(REJECT_REACH_OUT);

  const handleApprove = async (id, title) => {
    const confirm = window.confirm(`Are you sure you want to APPROVE the campaign "${title}"?`);
    if (!confirm) return;

    try {
      await approveCampaign({
        variables: { id },
      });
      toast.success(`Campaign "${title}" approved successfully!`);
      refetch();
    } catch (err) {
      toast.error(err.message || "Failed to approve campaign.");
    }
  };

  const handleReject = async (id, title) => {
    const reason = window.prompt(`Please enter the rejection reason for campaign "${title}":`);
    if (reason === null) return; // user cancelled

    if (!reason.trim()) {
      toast.error("Rejection reason is required.");
      return;
    }

    try {
      await rejectCampaign({
        variables: { id, reason: reason.trim() },
      });
      toast.success(`Campaign "${title}" rejected.`);
      refetch();
    } catch (err) {
      toast.error(err.message || "Failed to reject campaign.");
    }
  };

  const campaigns = data?.adminReachOutRequests || [];

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "PENDING":
        return "text-amber-700 bg-amber-50 border-amber-100";
      case "APPROVED":
        return "text-blue-700 bg-blue-50 border-blue-100";
      case "REJECTED":
        return "text-rose-700 bg-rose-50 border-rose-100";
      case "SENT":
        return "text-emerald-700 bg-emerald-50 border-emerald-100";
      default:
        return "text-slate-700 bg-slate-50 border-slate-100";
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm" style={{ padding: "24px" }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Reach Out Requests</h2>
          <p className="text-xs text-slate-500 mt-1">Review, approve, or reject follower email marketing campaigns.</p>
        </div>

        {/* Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-bold text-slate-700 outline-none cursor-pointer focus:border-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending Approval</option>
          <option value="APPROVED">Approved / Scheduled</option>
          <option value="REJECTED">Rejected</option>
          <option value="SENT">Sent / Dispatched</option>
        </select>
      </div>

      {/* Table List */}
      <div style={{ border: "1px solid #f1f5f9", borderRadius: "16px", overflow: "hidden" }} className="bg-white">
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
            <thead style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
              <tr>
                <th style={{ padding: "14px 16px" }}>Business</th>
                <th style={{ padding: "14px 16px" }}>Campaign details</th>
                <th style={{ padding: "14px 16px" }}>Delivery Time</th>
                <th style={{ padding: "14px 16px" }}>Price</th>
                <th style={{ padding: "14px 16px" }}>Status</th>
                <th style={{ padding: "14px 16px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => {
                const images = Array.isArray(c.images) ? c.images : [];
                return (
                  <tr key={c.id} style={{ borderBottom: "1px solid #f1f5f9" }} className="hover:bg-slate-50/40 transition-colors">
                    <td style={{ padding: "14px 16px", fontWeight: "600", color: "#1e293b" }}>
                      {c.business?.name || "Unknown Business"}
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                        Created on {new Date(c.createdAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td style={{ padding: "14px 16px", color: "#475569", maxWidth: "300px" }}>
                      <div className="font-bold text-slate-800 text-sm truncate">{c.title}</div>
                      <div className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed" title={c.description}>
                        {c.description}
                      </div>
                      {images.length > 0 && (
                        <div className="flex gap-1.5 mt-2">
                          {images.map((imgUrl, idx) => (
                            <a key={idx} href={imgUrl} target="_blank" rel="noreferrer" className="block relative w-9 h-9 rounded-lg border border-slate-200 overflow-hidden bg-slate-100">
                              <img src={imgUrl} alt="Campaign uploaded" className="w-full h-full object-cover" />
                            </a>
                          ))}
                        </div>
                      )}
                      {c.callToActionUrl && (
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1.5 truncate">
                          CTA Link: <a href={c.callToActionUrl} target="_blank" rel="noreferrer" className="underline">{c.callToActionUrl}</a>
                        </p>
                      )}
                      {c.rejectionReason && (
                        <div className="mt-2 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 rounded-lg p-2 leading-relaxed">
                          Rejection Reason: {c.rejectionReason}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "14px 16px", color: "#475569" }}>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                        <FiClock className="text-slate-400" />
                        {c.isImmediate ? (
                          <span className="text-purple-600 font-bold bg-purple-50 px-2 py-0.5 rounded-md">Immediate</span>
                        ) : (
                          <span>{new Date(c.deliveryTime).toLocaleString()}</span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: "14px 16px", color: "#1e293b", fontWeight: "700" }}>
                      <span className="flex items-center text-xs">
                        ₦{c.price.toLocaleString()}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusBadgeClass(c.status)}`}>
                        {c.status}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      {c.status === "PENDING" ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleApprove(c.id, c.title)}
                            disabled={approving || rejecting}
                            className="p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-all shadow-sm flex items-center justify-center"
                            title="Approve & Schedule"
                          >
                            <FiCheck size={14} />
                          </button>
                          <button
                            onClick={() => handleReject(c.id, c.title)}
                            disabled={approving || rejecting}
                            className="p-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition-all shadow-sm flex items-center justify-center"
                            title="Reject Campaign"
                          >
                            <FiX size={14} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium italic">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {campaigns.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} style={{ padding: "60px 0", textAlign: "center" }} className="text-slate-400">
                    <div style={{ fontSize: "32px", marginBottom: "8px" }}>📢</div>
                    <span className="font-semibold text-sm">No campaigns match filters</span>
                  </td>
                </tr>
              )}

              {loading && campaigns.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: "60px 0", textAlign: "center" }} className="text-slate-400">
                    <span className="font-medium text-sm">Loading campaigns...</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReachOutForAdmin;
