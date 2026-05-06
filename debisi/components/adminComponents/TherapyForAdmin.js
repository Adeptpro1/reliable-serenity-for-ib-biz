"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import {
  GET_THERAPY_REQUESTS,
  UPDATE_THERAPY_STATUS,
} from "@/api/queries/therapy";
import AdminSearch from "./AdminSearch";
import Table from "../otherComponents/Tables";
import { FiClipboard, FiCheckCircle, FiEdit2 } from "react-icons/fi";
import { toast } from "react-hot-toast";

const TherapyForAdmin = () => {
  const [filteredRequests, setFilteredRequests] = useState([]);

  const { data, loading, error, refetch } = useQuery(GET_THERAPY_REQUESTS, {
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (data?.therapyRequests) {
      setFilteredRequests(data.therapyRequests);
    }
  }, [data]);

  const [updateStatus] = useMutation(UPDATE_THERAPY_STATUS, {
    onCompleted: () => {
      toast.success("Status updated!");
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const requests = data?.therapyRequests || [];

  const handleStatusChange = (id, currentStatus) => {
    const nextStatus =
      currentStatus === "PENDING"
        ? "CONTACTED"
        : currentStatus === "CONTACTED"
          ? "RESOLVED"
          : "PENDING";

    if (confirm(`Change status to ${nextStatus}?`)) {
      updateStatus({ variables: { id, status: nextStatus } });
    }
  };

  const columns = [
    {
      title: "ID",
      field: "id",
      render: (row) => (
        <span className="text-[10px] text-gray-400">
          {row.id.slice(0, 8)}...
        </span>
      ),
    },
    {
      title: "Name",
      field: "name",
      render: (row) => <span style={{ fontWeight: 600 }}>{row.name}</span>,
    },
    {
      title: "Email",
      field: "email",
      render: (row) => (
        <a href={`mailto:${row.email}`} style={{ color: "#3B82F6" }}>
          {row.email}
        </a>
      ),
    },
    {
      title: "Phone",
      field: "phone",
      render: (row) => <span>{row.phone || "N/A"}</span>,
    },
    {
      title: "Message",
      field: "message",
      render: (row) => (
        <span
          style={{
            fontSize: "12px",
            color: "#6B7280",
            maxWidth: "200px",
            display: "inline-block",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={row.message}
        >
          {row.message}
        </span>
      ),
    },
    {
      title: "Status",
      field: "status",
      render: (row) => (
        <span
          style={{
            padding: "4px 8px",
            borderRadius: "9999px",
            fontSize: "12px",
            fontWeight: "bold",
            backgroundColor:
              row.status === "RESOLVED"
                ? "#D1FAE5"
                : row.status === "CONTACTED"
                  ? "#FEF3C7"
                  : "#FEE2E2",
            color:
              row.status === "RESOLVED"
                ? "#065F46"
                : row.status === "CONTACTED"
                  ? "#92400E"
                  : "#991B1B",
          }}
        >
          {row.status}
        </span>
      ),
    },
    {
      title: "Date",
      field: "createdAt",
      render: (row) => {
        const d = new Date(row.createdAt);
        return isNaN(d) ? "N/A" : d.toLocaleDateString();
      },
    },
    {
      title: "Update Status",
      field: "actions",
      render: (row) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => handleStatusChange(row.id, row.status)}
            style={{
              padding: "6px",
              backgroundColor: "#EFF6FF",
              color: "#2563EB",
              borderRadius: "4px",
              border: "none",
              cursor: "pointer",
            }}
            title="Update Status"
          >
            <FiEdit2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  if (loading)
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        Loading requests...
      </div>
    );
  if (error)
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#EF4444" }}>
        Error: {error.message}
      </div>
    );

  return (
    <div
      style={{
        padding: "24px",
        backgroundColor: "#F9FAFB",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <h1
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            color: "#1F2937",
            margin: 0,
          }}
        >
          Therapy Session Requests
        </h1>
        <div style={{ display: "flex", gap: "16px" }}>
          <div
            style={{
              backgroundColor: "#FFFFFF",
              padding: "8px 16px",
              borderRadius: "12px",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
              border: "1px solid #F3F4F6",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                padding: "8px",
                backgroundColor: "#F3E8FF",
                color: "#9333EA",
                borderRadius: "8px",
              }}
            >
              <FiClipboard size={18} />
            </div>
            <div>
              <p
                style={{
                  fontSize: "10px",
                  color: "#9CA3AF",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  margin: 0,
                }}
              >
                Total Requests
              </p>
              <h2
                style={{
                  fontSize: "20px",
                  fontWeight: "bold",
                  color: "#1F2937",
                  margin: 0,
                }}
              >
                {requests.length}
              </h2>
            </div>
          </div>
          <div
            style={{
              backgroundColor: "#FFFFFF",
              padding: "8px 16px",
              borderRadius: "12px",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
              border: "1px solid #F3F4F6",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                padding: "8px",
                backgroundColor: "#D1FAE5",
                color: "#059669",
                borderRadius: "8px",
              }}
            >
              <FiCheckCircle size={18} />
            </div>
            <div>
              <p
                style={{
                  fontSize: "10px",
                  color: "#9CA3AF",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  margin: 0,
                }}
              >
                Resolved
              </p>
              <h2
                style={{
                  fontSize: "20px",
                  fontWeight: "bold",
                  color: "#1F2937",
                  margin: 0,
                }}
              >
                {requests.filter((r) => r.status === "RESOLVED").length}
              </h2>
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          backgroundColor: "#FFFFFF",
          padding: "20px",
          borderRadius: "16px",
          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
          border: "1px solid #F3F4F6",
        }}
      >
        <div style={{ marginBottom: "24px" }}>
          <AdminSearch data={requests} onFilter={setFilteredRequests} />
        </div>
        <Table data={filteredRequests} columns={columns} />
      </div>
    </div>
  );
};

export default TherapyForAdmin;
