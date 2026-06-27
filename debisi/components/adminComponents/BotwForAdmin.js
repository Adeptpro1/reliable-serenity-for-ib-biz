"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import {
  ADMIN_GET_BOTW_CYCLES,
  APPROVE_BOTW_APPLICATIONS,
  MANUAL_PUBLISH_BOTW_CYCLE,
} from "../../api/queries/botw";
import Table from "../otherComponents/Tables";
import { FiCheck, FiPlay, FiStar, FiCalendar, FiUsers } from "react-icons/fi";
import { toast } from "react-hot-toast";

const BotwForAdmin = () => {
  const { data, loading, error, refetch } = useQuery(ADMIN_GET_BOTW_CYCLES, {
    fetchPolicy: "network-only",
  });

  const [publishCycle] = useMutation(MANUAL_PUBLISH_BOTW_CYCLE);
  const [approveApplications] = useMutation(APPROVE_BOTW_APPLICATIONS);

  const [selectedAppIds, setSelectedAppIds] = useState([]);

  const cycles = data?.adminBotwCycles || [];

  // Find the open/active cycle (if any)
  const activeCycle = cycles.find((c) => c.isOpen);

  // Paid applications for the active cycle
  const activePaidApplications = activeCycle
    ? activeCycle.applications.filter((app) => app.status === "PAID")
    : [];

  const handlePublish = async () => {
    try {
      await publishCycle();
      toast.success("BOTW cycle published successfully!");
      refetch();
    } catch (err) {
      toast.error(err.message || "Failed to publish cycle");
    }
  };

  const handleCheckboxChange = (id) => {
    setSelectedAppIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((appId) => appId !== id);
      } else {
        if (prev.length >= 8) {
          toast.error("You can select a maximum of 8 businesses!");
          return prev;
        }
        return [...prev, id];
      }
    });
  };

  const handleApproveSelected = async () => {
    if (selectedAppIds.length === 0) {
      toast.error("Please select at least one business.");
      return;
    }
    if (selectedAppIds.length > 8) {
      toast.error("You cannot approve more than 8 businesses.");
      return;
    }

    try {
      const confirmApprove = window.confirm(
        `Are you sure you want to approve these ${selectedAppIds.length} businesses as Business of the Week? This will close the current application cycle.`
      );
      if (!confirmApprove) return;

      await approveApplications({
        variables: { applicationIds: selectedAppIds },
      });
      toast.success("Selected businesses approved successfully!");
      setSelectedAppIds([]);
      refetch();
    } catch (err) {
      toast.error(err.message || "Approval failed.");
    }
  };

  const columns = [
    { title: "Business Name", field: "businessName" },
    {
      title: "Status",
      field: "status",
      render: (row) => {
        const map = {
          APPROVED: ["#D1FAE5", "#065F46"],
          PAID: ["#EEF2FF", "#4F46E5"],
          PENDING_PAYMENT: ["#FEF3C7", "#92400E"],
          EXPIRED: ["#F3F4F6", "#6B7280"],
        };
        const [bg, color] = map[row.status] || ["#F3F4F6", "#6B7280"];
        return (
          <span
            style={{
              background: bg,
              color,
              padding: "4px 12px",
              borderRadius: "999px",
              fontSize: "11px",
              fontWeight: "bold",
            }}
          >
            {row.status === "PAID" ? "Paid (Under Review)" : row.status}
          </span>
        );
      },
    },
    { title: "Paid At", field: "paidAtDate" },
    {
      title: "Actions",
      field: "actions",
      render: (row) => {
        if (row.status !== "PAID") return null;
        const isChecked = selectedAppIds.includes(row.id);
        return (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={() => handleCheckboxChange(row.id)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-xs font-semibold text-gray-700">
              {isChecked ? "Selected" : "Select"}
            </span>
          </label>
        );
      },
    },
  ];

  const flatActiveApps = activePaidApplications.map((app) => ({
    id: app.id,
    businessName: app.business?.name || "—",
    status: app.status,
    paidAtDate: app.paidAt ? new Date(app.paidAt).toLocaleString() : "—",
  }));

  const cycleHistoryColumns = [
    {
      title: "Cycle Period",
      field: "period",
      render: (row) => (
        <div>
          <p className="font-bold text-gray-900">{row.period}</p>
          <p className="text-[10px] text-gray-400">ID: {row.id}</p>
        </div>
      ),
    },
    {
      title: "Status",
      field: "isOpen",
      render: (row) =>
        row.isOpen ? (
          <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold">
            OPEN
          </span>
        ) : (
          <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-semibold">
            CLOSED
          </span>
        ),
    },
    { title: "Published At", field: "publishedAtDate" },
    { title: "Paid Count", field: "paidCount" },
    { title: "Approved Count", field: "approvedCount" },
  ];

  const flatCycles = cycles.map((c) => {
    const start = new Date(c.weekStart).toLocaleDateString("en-NG", {
      month: "short",
      day: "numeric",
    });
    const end = new Date(c.weekEnd).toLocaleDateString("en-NG", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const approvedCount = c.applications.filter((a) => a.status === "APPROVED").length;

    return {
      id: c.id,
      period: `${start} – ${end}`,
      isOpen: c.isOpen,
      publishedAtDate: c.publishedAt ? new Date(c.publishedAt).toLocaleString() : "—",
      paidCount: c.paidCount,
      approvedCount,
    };
  });

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-red-700">
        <strong>Error loading BOTW details:</strong> {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <FiStar className="text-amber-500 fill-amber-500" /> Business of the Week (BOTW)
          </h1>
          <p className="text-sm text-gray-500">
            Publish weekly open calls and manage verified business applications
          </p>
        </div>
        <div>
          <button
            onClick={handlePublish}
            disabled={!!activeCycle}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm shadow-md transition-all ${
              activeCycle
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            <FiPlay size={14} /> Publish Open Call
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500">
            <FiStar size={24} className="fill-amber-100" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">
              Active Cycle
            </p>
            <h2 className="text-lg font-bold text-gray-900">
              {activeCycle
                ? `${new Date(activeCycle.weekStart).toLocaleDateString("en-NG", {
                    month: "short",
                    day: "numeric",
                  })} - ${new Date(activeCycle.weekEnd).toLocaleDateString("en-NG", {
                    month: "short",
                    day: "numeric",
                  })}`
                : "No active cycle"}
            </h2>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500">
            <FiUsers size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">
              Paid Applicants (Current)
            </p>
            <h2 className="text-2xl font-bold text-gray-900">
              {activeCycle ? activeCycle.paidCount : 0}
            </h2>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500">
            <FiCalendar size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">
              Total Cycles
            </p>
            <h2 className="text-2xl font-bold text-gray-900">{cycles.length}</h2>
          </div>
        </div>
      </div>

      {/* Review Section */}
      {activeCycle && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Saturday Selection Panel</h2>
              <p className="text-sm text-gray-500">
                Select up to 8 paid businesses to display on the homepage
              </p>
            </div>
            {activePaidApplications.length > 0 && (
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-gray-600">
                  {selectedAppIds.length} / 8 selected
                </span>
                <button
                  onClick={handleApproveSelected}
                  disabled={selectedAppIds.length === 0}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                    selectedAppIds.length === 0
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
                  }`}
                >
                  <FiCheck size={14} /> Approve Selected
                </button>
              </div>
            )}
          </div>

          {activePaidApplications.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              No paid applications for the active cycle yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table data={flatActiveApps} columns={columns} isLoading={loading} />
            </div>
          )}
        </div>
      )}

      {/* History Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Cycles History</h2>
          <p className="text-sm text-gray-500">View audit logs of past weekly cycles</p>
        </div>
        <div className="overflow-x-auto">
          <Table
            data={flatCycles}
            columns={cycleHistoryColumns}
            isLoading={loading}
          />
        </div>
      </div>
    </div>
  );
};

export default BotwForAdmin;
