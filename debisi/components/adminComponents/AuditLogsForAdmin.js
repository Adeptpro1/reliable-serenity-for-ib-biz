"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { FiActivity, FiUsers, FiBriefcase } from "react-icons/fi";
import Table from "../otherComponents/Tables";
import { GET_ADMIN_AUDIT_LOGS } from "../../graphql/queries/admin/auditLogs";
import AdminSearch from "./AdminSearch";

const AuditLogsForAdmin = () => {
  const [filteredLogs, setFilteredLogs] = useState([]);

  // Fetch audit logs
  const { data, loading, error } = useQuery(GET_ADMIN_AUDIT_LOGS, {
    fetchPolicy: "network-only",
  });

  // Flat and prepare logs for the Table component (JSON metadata is flattened for premium rendering)
  const preparedLogs = (data?.adminAuditLogs || []).map((log) => {
    let flatMetadata = "";
    if (log.details) {
      try {
        const parsed = typeof log.details === "string" ? JSON.parse(log.details) : log.details;
        flatMetadata = Object.entries(parsed)
          .map(([k, v]) => {
            const formattedKey = k.replace(/([A-Z])/g, " $1").trim().toUpperCase();
            if (typeof v === "object" && v !== null) {
              if (Array.isArray(v)) {
                return `${formattedKey}: [${v.map(item => typeof item === 'object' ? JSON.stringify(item) : String(item)).join(", ")}]`;
              }
              return `${formattedKey}: ${JSON.stringify(v)}`;
            }
            return `${formattedKey}: ${v}`;
          })
          .join(" | ");
      } catch (e) {
        flatMetadata = String(log.details);
      }
    }

    return {
      ...log,
      metadata: flatMetadata || "No extra metadata",
      formattedDate: new Date(log.createdAt).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  });

  // Sync to state for searching
  useEffect(() => {
    if (data?.adminAuditLogs) {
      setFilteredLogs(preparedLogs);
    }
  }, [data]);

  if (loading) return <p className="p-6 text-gray-500">Loading audit logs...</p>;
  if (error) return <p className="p-6 text-red-500">Error loading audit logs: {error.message}</p>;

  const logs = data?.adminAuditLogs || [];
  const userDeletions = logs.filter((l) => l.action === "DELETE_USER").length;
  const businessDeletions = logs.filter((l) => l.action === "DELETE_BUSINESS").length;

  const columns = [
    {
      title: "Action",
      field: "action",
      render: (row) =>
        row.action === "DELETE_USER" ? (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black bg-red-50 text-red-700 border border-red-100">
            DELETE USER
          </span>
        ) : (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-700 border border-amber-100">
            DELETE BUSINESS
          </span>
        ),
    },
    { title: "Target Resource", field: "targetName" },
    { title: "Performed By", field: "performedBy" },
    { title: "Metadata Summary", field: "metadata", hideOnMobile: true },
    { title: "Timestamp", field: "formattedDate" },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between" style={{ gap: "16px", marginBottom: "24px" }}>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Audit Logs</h1>
          <p className="text-sm text-gray-500">Immutable trace trail for all deletion actions</p>
        </div>
      </div>

      {/* KPI Stats widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: "24px", marginBottom: "24px" }}>
        {/* Total Logs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center hover:shadow-md transition-shadow" style={{ padding: "24px", gap: "16px" }}>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-xl">
            <FiActivity />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Actions</p>
            <h2 className="text-3xl font-bold text-gray-900">{logs.length}</h2>
          </div>
        </div>

        {/* Deleted Users */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center hover:shadow-md transition-shadow" style={{ padding: "24px", gap: "16px" }}>
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center text-xl">
            <FiUsers />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Deleted Users</p>
            <h2 className="text-3xl font-bold text-rose-600">{userDeletions}</h2>
          </div>
        </div>

        {/* Deleted Businesses */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center hover:shadow-md transition-shadow" style={{ padding: "24px", gap: "16px" }}>
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center text-xl">
            <FiBriefcase />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Deleted Businesses</p>
            <h2 className="text-3xl font-bold text-amber-600">{businessDeletions}</h2>
          </div>
        </div>
      </div>

      {/* Table section */}
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
        <div className="mb-6">
          <AdminSearch data={preparedLogs} onFilter={setFilteredLogs} />
        </div>
        <Table data={filteredLogs} columns={columns} isLoading={loading} />
      </div>
    </div>
  );
};

export default AuditLogsForAdmin;
