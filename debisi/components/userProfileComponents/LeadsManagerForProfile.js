import React, { useState, useMemo } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { FiDownload, FiSearch, FiFileText, FiUserPlus, FiMail } from "react-icons/fi";
import { GET_MY_LEADS } from "@/graphql/queries/business/leads";
import { GET_MY_FOLLOWS } from "@/graphql/queries/business/follow";
import { FOLLOW_BUSINESS } from "@/graphql/mutations/business/follow";

import ReachOutModal from "./ReachOutModal";
import * as XLSX from "xlsx";
import { toast } from "react-hot-toast";

const LeadsManagerForProfile = ({ userData }) => {
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [selectedNoticeId, setSelectedNoticeId] = useState("");
  const [selectedSourceType, setSelectedSourceType] = useState(""); // "", "notice", "follower"
  const [searchTerm, setSearchTerm] = useState("");
  const [showReachOutModal, setShowReachOutModal] = useState(false);

  const userBusinesses = useMemo(() => userData?.businesses || [], [userData?.businesses]);

  const { data, loading, refetch } = useQuery(GET_MY_LEADS, {
    variables: { businessId: selectedBusinessId || undefined },
    fetchPolicy: "cache-and-network",
  });

  const { data: followsData, refetch: refetchFollows } = useQuery(GET_MY_FOLLOWS, {
    fetchPolicy: "cache-and-network",
  });

  const followedBusinessIds = useMemo(() => {
    const list = followsData?.myFollows || [];
    return new Set(list.map(f => f.business.id));
  }, [followsData]);

  const [followBusiness, { loading: followingBack }] = useMutation(FOLLOW_BUSINESS);

  const handleFollowBack = async (businessId, businessName) => {
    try {
      await followBusiness({
        variables: {
          input: {
            businessId,
            name: `${userData?.firstName || ""} ${userData?.lastName || ""}`.trim() || "Follower"
          }
        }
      });
      toast.success(`You are now following back ${businessName}!`);
      refetchFollows();
    } catch (err) {
      toast.error(err.message || "Failed to follow back.");
    }
  };

  // Derived unique notices list for the notice filter dropdown based on selected business
  const noticesForFilter = useMemo(() => {
    if (selectedBusinessId) {
      const biz = userBusinesses.find(b => b.id === selectedBusinessId);
      return biz?.notices || [];
    }
    // If no specific business is selected, pool all notices from all user's businesses
    return userBusinesses.flatMap(b => b.notices || []);
  }, [selectedBusinessId, userBusinesses]);

  // Filter leads client-side for immediate responsiveness
  const filteredLeads = useMemo(() => {
    const rawLeads = data?.myLeads || [];
    return rawLeads.filter((lead) => {
      // 1. Business filter
      const bizMatch = !selectedBusinessId || lead.business?.id === selectedBusinessId;

      // 2. Source Type filter
      const sourceMatch =
        !selectedSourceType ||
        (selectedSourceType === "notice" && lead.notice !== null) ||
        (selectedSourceType === "follower" && lead.notice === null);

      // 3. Notice filter
      const noticeMatch = !selectedNoticeId || lead.notice?.id === selectedNoticeId;

      // 4. Search text filter (Name, Email, or Additional Data message)
      const query = searchTerm.toLowerCase().trim();
      const textMatch =
        !query ||
        lead.name?.toLowerCase().includes(query) ||
        (lead.notice && (
          lead.email?.toLowerCase().includes(query) ||
          lead.phone?.toLowerCase().includes(query)
        )) ||
        lead.additionalData?.comment?.toLowerCase().includes(query) ||
        (lead.notice 
          ? lead.notice.title?.toLowerCase().includes(query) 
          : "follower lead".includes(query));

      return bizMatch && sourceMatch && noticeMatch && textMatch;
    });
  }, [data?.myLeads, selectedBusinessId, selectedSourceType, selectedNoticeId, searchTerm]);

  // Stats calculation
  const stats = useMemo(() => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    let weekCount = 0;
    let monthCount = 0;

    filteredLeads.forEach(lead => {
      const submittedDate = new Date(lead.submittedAt);
      if (submittedDate >= oneWeekAgo) weekCount++;
      if (submittedDate >= oneMonthAgo) monthCount++;
    });

    return {
      total: filteredLeads.length,
      thisWeek: weekCount,
      thisMonth: monthCount
    };
  }, [filteredLeads]);

  // Export filtered leads to XLSX
  const exportToXLSX = () => {
    const hasFollowerLeads = filteredLeads.some(l => l.notice === null);
    const leadsToExport = filteredLeads.filter(l => l.notice !== null);

    if (leadsToExport.length === 0) {
      toast.error("Followers list and details cannot be exported.");
      return;
    }

    const ws = XLSX.utils.json_to_sheet(
      leadsToExport.map((l) => ({
        Name: l.name,
        Email: l.email || "N/A",
        Phone: l.phone || "N/A",
        Message: l.additionalData?.comment || "N/A",
        "Source Notice": l.notice?.title || "Notice Lead",
        "Business Name": l.business?.name || "Unknown Business",
        Date: new Date(l.submittedAt).toLocaleDateString() + " " + new Date(l.submittedAt).toLocaleTimeString(),
      })),
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Leads");
    
    // File name format: debisi_leads_YYYY_MM_DD.xlsx
    const dateStr = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `debisi_leads_${dateStr}.xlsx`);

    if (hasFollowerLeads) {
      toast.success("Notice leads exported. Follower details were excluded for privacy.");
    } else {
      toast.success("Leads exported successfully!");
    }
  };

  const btnStyle = {
    padding: "10px 16px",
    background: "linear-gradient(to right, purple, #D22730)",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    transition: "all 0.2s",
  };

  const glassStyle = {
    background: "rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(12px)",
    borderRadius: "20px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
    margin: "10px 0",
  };

  if (!userBusinesses || userBusinesses.length === 0) {
    return (
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          margin: "20px auto",
          background: "white",
          borderRadius: "12px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
          padding: "32px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "48px", marginBottom: "12px" }}>🏢</div>
        <p style={{ fontSize: "18px", color: "#333", marginBottom: "12px", fontWeight: 600 }}>
          No businesses found
        </p>
        <p style={{ color: "#6b7280", marginBottom: "16px" }}>
          Register a business first to start collecting leads and managing contacts.
        </p>
      </div>
    );
  }

  return (
    <div style={glassStyle} className="p-3 sm:p-5 rounded-xl sm:rounded-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "800", margin: "0", color: "#333" }}>
            Leads & Contacts
          </h1>
          <p style={{ margin: "5px 0 0 0", fontSize: "12px", color: "#777" }}>
            View, filter, and export contacts collected from your notice boards.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button
            onClick={() => setShowReachOutModal(true)}
            style={{
              ...btnStyle,
              background: "linear-gradient(to right, #7c3aed, #db2777)",
            }}
            className="w-full sm:w-auto justify-center flex items-center shadow-sm"
          >
            <FiMail style={{ marginRight: "5px" }} /> Reach Out to Followers
          </button>

          <button
            disabled={filteredLeads.length === 0 || selectedSourceType === "follower"}
            onClick={exportToXLSX}
            style={{
              ...btnStyle,
              backgroundColor: "white",
              color: "#22c55e",
              border: "1px solid #22c55e",
              opacity: (filteredLeads.length === 0 || selectedSourceType === "follower") ? 0.5 : 1,
              cursor: selectedSourceType === "follower" ? "not-allowed" : "pointer",
            }}
            className="w-full sm:w-auto justify-center flex items-center shadow-sm"
            title={selectedSourceType === "follower" ? "Followers list cannot be exported" : ""}
          >
            <FiDownload style={{ marginRight: "5px" }} /> Export Filtered to Excel
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-purple-50/50 border border-purple-100 rounded-2xl flex flex-col justify-center">
          <span style={{ fontSize: "24px", fontWeight: "900", color: "purple" }}>
            {stats.total}
          </span>
          <span style={{ fontSize: "12px", color: "#666", fontWeight: "500", marginTop: "4px" }}>
            Total Leads Collected
          </span>
        </div>
        <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl flex flex-col justify-center">
          <span style={{ fontSize: "24px", fontWeight: "900", color: "#1d4ed8" }}>
            {stats.thisWeek}
          </span>
          <span style={{ fontSize: "12px", color: "#666", fontWeight: "500", marginTop: "4px" }}>
            Collected This Week
          </span>
        </div>
        <div className="p-4 bg-green-50/50 border border-green-100 rounded-2xl flex flex-col justify-center">
          <span style={{ fontSize: "24px", fontWeight: "900", color: "#15803d" }}>
            {stats.thisMonth}
          </span>
          <span style={{ fontSize: "12px", color: "#666", fontWeight: "500", marginTop: "4px" }}>
            Collected This Month
          </span>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 bg-slate-50/50 border border-slate-100 rounded-2xl">
        {/* Search */}
        <div className="relative flex items-center bg-white border border-slate-200 rounded-xl px-3">
          <FiSearch className="text-slate-400 mr-2" />
          <input
            type="text"
            placeholder="Search leads by name, contact, message..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent outline-none text-sm font-medium"
            style={{ padding: "10px 0" }}
          />
        </div>

        {/* Business Filter */}
        <select
          value={selectedBusinessId}
          onChange={(e) => {
            setSelectedBusinessId(e.target.value);
            setSelectedNoticeId(""); // Reset notice filter when business changes
          }}
          style={{
            padding: "10px",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            fontSize: "13px",
            outline: "none",
            backgroundColor: "white",
          }}
          className="w-full font-medium text-slate-700"
        >
          <option value="">All Businesses</option>
          {userBusinesses.map((biz) => (
            <option key={biz.id} value={biz.id}>
              {biz.name}
            </option>
          ))}
        </select>

        {/* Source Type Filter */}
        <select
          value={selectedSourceType}
          onChange={(e) => {
            setSelectedSourceType(e.target.value);
            if (e.target.value === "follower") {
              setSelectedNoticeId(""); // Reset notice filter for followers
            }
          }}
          style={{
            padding: "10px",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            fontSize: "13px",
            outline: "none",
            backgroundColor: "white",
          }}
          className="w-full font-medium text-slate-700"
        >
          <option value="">All Sources</option>
          <option value="notice">Notice Board Leads</option>
          <option value="follower">Followers List</option>
        </select>

        {/* Notice Filter */}
        <select
          value={selectedNoticeId}
          onChange={(e) => setSelectedNoticeId(e.target.value)}
          disabled={selectedSourceType === "follower"}
          style={{
            padding: "10px",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            fontSize: "13px",
            outline: "none",
            backgroundColor: selectedSourceType === "follower" ? "#f1f5f9" : "white",
            cursor: selectedSourceType === "follower" ? "not-allowed" : "default",
          }}
          className="w-full font-medium text-slate-700"
        >
          <option value="">All Notices</option>
          {noticesForFilter.map((notice) => (
            <option key={notice.id} value={notice.id}>
              {notice.title}
            </option>
          ))}
        </select>
      </div>

      {/* Leads Table - Desktop View */}
      <div style={{ border: "1px solid #f0f0f0", borderRadius: "15px", overflow: "hidden" }} className="hidden md:block bg-white">
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
            <thead style={{ backgroundColor: "#fafafa", borderBottom: "1px solid #f0f0f0" }}>
              <tr>
                <th style={{ padding: "14px 16px" }}>Name</th>
                <th style={{ padding: "14px 16px" }}>Contact details</th>
                <th style={{ padding: "14px 16px" }}>Message / Comment</th>
                <th style={{ padding: "14px 16px" }}>Source Notice</th>
                <th style={{ padding: "14px 16px" }}>Business</th>
                <th style={{ padding: "14px 16px" }}>Date Collected</th>
                <th style={{ padding: "14px 16px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead) => (
                <tr key={lead.id} style={{ borderBottom: "1px solid #f9f9f9" }} className="hover:bg-slate-50/50 transition-colors">
                  <td style={{ padding: "14px 16px", fontWeight: "600", color: "#1e293b" }}>
                    {lead.name}
                  </td>
                  <td style={{ padding: "14px 16px", color: "#475569" }}>
                    <div className="flex flex-col gap-0.5">
                      {lead.notice ? (
                        <>
                          {lead.email && <span className="text-xs">{lead.email}</span>}
                          {lead.phone && <span className="text-xs font-semibold text-slate-500">{lead.phone}</span>}
                          {!lead.email && !lead.phone && <span className="text-xs text-slate-400">-</span>}
                        </>
                      ) : (
                        <span className="text-xs text-slate-400 italic">[Hidden for Privacy]</span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px", color: "#475569", maxWidth: "250px" }}>
                    <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={lead.additionalData?.comment}>
                      {lead.additionalData?.comment || <span className="text-slate-400 font-normal italic">No message</span>}
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px", color: "#475569" }}>
                    <div className="flex items-center gap-1.5">
                      <FiFileText className={lead.notice ? "text-purple-500" : "text-emerald-500"} />
                      <span className={`font-semibold text-xs px-2 py-0.5 rounded-md ${
                        lead.notice 
                          ? "text-purple-700 bg-purple-50" 
                          : "text-emerald-700 bg-emerald-50"
                      }`}>
                        {lead.notice?.title || "Follower Lead"}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px", color: "#64748b", fontSize: "12px", fontWeight: "500" }}>
                    {lead.business?.name || "Unknown Business"}
                  </td>
                  <td style={{ padding: "14px 16px", color: "#94a3b8", fontSize: "11px" }}>
                    {new Date(lead.submittedAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    {lead.followerBusiness ? (
                      followedBusinessIds.has(lead.followerBusiness.id) ? (
                        <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1.5 rounded-lg">
                          Following Back
                        </span>
                      ) : (
                        <button
                          onClick={() => handleFollowBack(lead.followerBusiness.id, lead.followerBusiness.name)}
                          disabled={followingBack}
                          className="flex items-center gap-1 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-2.5 py-1.5 rounded-lg transition-all shadow-sm"
                        >
                          <FiUserPlus /> Follow Back
                        </button>
                      )
                    ) : (
                      <span className="text-xs text-slate-400 font-medium italic">-</span>
                    )}
                  </td>
                </tr>
              ))}
              
              {filteredLeads.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} style={{ padding: "60px 0", textAlign: "center" }} className="text-slate-400">
                    <div style={{ fontSize: "32px", marginBottom: "8px" }}>📋</div>
                    <span className="font-medium text-sm">No leads match the filters</span>
                  </td>
                </tr>
              )}

              {loading && filteredLeads.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: "60px 0", textAlign: "center" }} className="text-slate-400">
                    <span className="font-medium text-sm">Loading leads data...</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Leads Cards - Mobile View */}
      <div className="block md:hidden space-y-4">
        {filteredLeads.map((lead) => (
          <div key={lead.id} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
            <div className="flex justify-between items-start mb-3 border-b border-slate-50 pb-2">
              <div>
                <span className="font-bold text-sm text-slate-800">{lead.name}</span>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {new Date(lead.submittedAt).toLocaleDateString()}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <FiFileText className={lead.notice ? "text-purple-500" : "text-emerald-500"} />
                <span className={`font-semibold text-[10px] px-2 py-0.5 rounded-md ${
                  lead.notice 
                    ? "text-purple-700 bg-purple-50" 
                    : "text-emerald-700 bg-emerald-50"
                }`}>
                  {lead.notice?.title || "Follower"}
                </span>
              </div>
            </div>
            
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-slate-400 font-medium">Business:</span>{" "}
                <span className="text-slate-700 font-semibold">{lead.business?.name || "Unknown"}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Contact:</span>{" "}
                {lead.notice ? (
                  <div className="inline-flex flex-col ml-1 align-top">
                    {lead.email && <span className="text-slate-600 font-medium">{lead.email}</span>}
                    {lead.phone && <span className="text-slate-600 font-medium">{lead.phone}</span>}
                    {!lead.email && !lead.phone && <span className="text-slate-400 italic">-</span>}
                  </div>
                ) : (
                  <span className="text-slate-400 italic ml-1">[Hidden for Privacy]</span>
                )}
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl mt-1">
                <div className="text-[11px] text-slate-400 font-semibold mb-0.5">Message / Comment:</div>
                <div className="text-slate-600 leading-relaxed break-words whitespace-pre-wrap">
                  {lead.additionalData?.comment || <span className="text-slate-400 italic font-normal">No message</span>}
                </div>
              </div>
            </div>

            {lead.followerBusiness && (
              <div className="mt-3 pt-2 border-t border-slate-50 flex justify-end">
                {followedBusinessIds.has(lead.followerBusiness.id) ? (
                  <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1.5 rounded-lg w-full text-center">
                    Following Back
                  </span>
                ) : (
                  <button
                    onClick={() => handleFollowBack(lead.followerBusiness.id, lead.followerBusiness.name)}
                    disabled={followingBack}
                    className="flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-2 rounded-xl transition-all shadow-sm w-full"
                  >
                    <FiUserPlus /> Follow Back
                  </button>
                )}
              </div>
            )}
          </div>
        ))}

        {filteredLeads.length === 0 && !loading && (
          <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center text-slate-400">
            <div className="text-3xl mb-2">📋</div>
            <span className="font-medium text-sm">No leads match the filters</span>
          </div>
        )}

        {loading && filteredLeads.length === 0 && (
          <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center text-slate-400">
            <span className="font-medium text-sm">Loading leads data...</span>
          </div>
        )}
      </div>
      {showReachOutModal && (
        <ReachOutModal
          userData={userData}
          onClose={() => setShowReachOutModal(false)}
        />
      )}
    </div>
  );
};

export default LeadsManagerForProfile;
