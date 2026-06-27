"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import Table from "../otherComponents/Tables";
import Modal from "../otherComponents/Modal";
import AdminSearch from "./AdminSearch";
import { FiCheckCircle, FiXCircle, FiFileText, FiEye } from "react-icons/fi";
import { toast } from "react-hot-toast";

const GET_ADMIN_VERIFICATIONS = gql`
  query GetAdminVerifications($status: VerificationStatus) {
    adminVerifications(status: $status) {
      id
      status
      submittedAt
      natureOfBusiness
      currentAddress
      certificationType
      primaryContactName
      primaryContactPhone
      primaryContactEmail
      cacCertificateUrl
      memoOfAssociationUrl
      paymentAmount
      business {
        id
        name
        isVerified
      }
    }
  }
`;

const REVIEW_VERIFICATION = gql`
  mutation ReviewBusinessVerification($input: ReviewVerificationInput!) {
    reviewBusinessVerification(input: $input) {
      id
      status
      reviewerNotes
      business {
        id
        name
        isVerified
      }
    }
  }
`;

const VerificationForAdmin = () => {
  const [statusFilter, setStatusFilter] = useState("");
  const [filteredList, setFilteredList] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  const { data, loading, error, refetch } = useQuery(GET_ADMIN_VERIFICATIONS, {
    variables: { status: statusFilter || null },
    fetchPolicy: "network-only"
  });

  const [reviewVerification, { loading: reviewing }] = useMutation(REVIEW_VERIFICATION);

  const requests = useMemo(() => data?.adminVerifications || [], [data?.adminVerifications]);

  useEffect(() => {
    setFilteredList(requests);
  }, [requests]);

  const handleApprove = async (request) => {
    if (!window.confirm(`Are you sure you want to APPROVE verification for "${request.business.name}"?`)) {
      return;
    }

    try {
      await reviewVerification({
        variables: {
          input: {
            verificationId: request.id,
            status: "APPROVED",
            reviewerNotes: "Approved by administrator"
          }
        }
      });
      toast.success("Verification request approved successfully!");
      refetch();
    } catch (err) {
      toast.error(err.message || "Failed to approve verification");
    }
  };

  const handleRejectClick = (request) => {
    setSelectedRequest(request);
    setRejectionReason("");
    setShowRejectModal(true);
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      toast.error("Please enter a reason for rejection.");
      return;
    }

    try {
      await reviewVerification({
        variables: {
          input: {
            verificationId: selectedRequest.id,
            status: "REJECTED",
            reviewerNotes: rejectionReason
          }
        }
      });
      toast.success("Verification request rejected and refunded.");
      setShowRejectModal(false);
      setSelectedRequest(null);
      refetch();
    } catch (err) {
      toast.error(err.message || "Failed to reject verification");
    }
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setShowViewModal(true);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "APPROVED":
        return "text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full font-bold text-xs";
      case "REJECTED":
        return "text-rose-600 bg-rose-50 px-2 py-1 rounded-full font-bold text-xs";
      case "PENDING":
        return "text-amber-600 bg-amber-50 px-2 py-1 rounded-full font-bold text-xs";
      default:
        return "text-gray-600 bg-gray-50 px-2 py-1 rounded-full font-bold text-xs";
    }
  };

  const columns = [
    {
      title: "Business",
      field: "businessName",
      render: (row) => <span className="font-semibold">{row.business?.name || "Unknown"}</span>
    },
    {
      title: "Type",
      field: "certificationType",
      render: (row) => <span className="text-xs uppercase bg-slate-100 px-2 py-1 rounded-md">{row.certificationType}</span>
    },
    {
      title: "Owner Name",
      field: "primaryContactName"
    },
    {
      title: "Submitted",
      field: "submittedAt",
      render: (row) => new Date(row.submittedAt).toLocaleDateString()
    },
    {
      title: "Fee Paid",
      field: "paymentAmount",
      render: (row) => <span>₦{(row.paymentAmount / 100).toLocaleString()}</span>
    },
    {
      title: "Status",
      field: "status",
      render: (row) => <span className={getStatusStyle(row.status)}>{row.status}</span>
    },
    {
      title: "Actions",
      field: "actions",
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleViewDetails(row)}
            className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
            title="View Details"
          >
            <FiEye size={14} />
          </button>
          {row.status === "PENDING" && (
            <>
              <button
                onClick={() => handleApprove(row)}
                className="p-1.5 bg-emerald-50 text-emerald-600 rounded hover:bg-emerald-100"
                title="Approve & Verify"
              >
                <FiCheckCircle size={14} />
              </button>
              <button
                onClick={() => handleRejectClick(row)}
                className="p-1.5 bg-rose-50 text-rose-600 rounded hover:bg-rose-100"
                title="Reject & Refund"
              >
                <FiXCircle size={14} />
              </button>
            </>
          )}
        </div>
      )
    }
  ];

  if (loading) return <div className="p-10 text-center">Loading verification requests...</div>;
  if (error) return <div className="p-10 text-center text-red-500">Error: {error.message}</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Business Verifications</h1>
          <p className="text-sm text-gray-500">Review submitted CAC documents, details, and approve/reject verification badges</p>
        </div>

        <div className="flex gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none shadow-sm font-medium"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <div className="mb-6">
          <AdminSearch data={requests} onFilter={setFilteredList} />
        </div>
        <Table data={filteredList} columns={columns} />
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <Modal title="Reject Verification Request" onClose={() => setShowRejectModal(false)}>
          <form onSubmit={handleConfirmReject} className="flex flex-col gap-4">
            <p className="text-sm text-gray-600">
              Please enter the reason for rejecting verification of <strong>{selectedRequest?.business?.name}</strong>. The verification fee of ₦{(selectedRequest?.paymentAmount / 100).toLocaleString()} will be automatically refunded to their wallet.
            </p>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Reason for Rejection *</label>
              <textarea
                required
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="E.g., CAC certificate document is blur or invalid."
                className="w-full border border-gray-300 rounded-xl py-2 px-3 focus:outline-none focus:ring-rose-500 focus:border-rose-500 text-sm"
                rows="4"
              />
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="bg-white py-2 px-4 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 mr-3"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={reviewing}
                className="py-2 px-4 border border-transparent shadow-sm text-sm font-semibold rounded-xl text-white bg-rose-600 hover:bg-rose-700"
              >
                {reviewing ? "Processing..." : "Confirm Rejection & Refund"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* View Details Modal */}
      {showViewModal && (
        <Modal title="Verification Details" onClose={() => setShowViewModal(false)}>
          <div className="flex flex-col gap-4 text-sm max-h-[70vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Business Name</span>
                <span className="font-semibold text-gray-800">{selectedRequest?.business?.name}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Certification Type</span>
                <span className="font-semibold text-gray-800 uppercase">{selectedRequest?.certificationType}</span>
              </div>
              <div className="col-span-2">
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Business Address</span>
                <span className="text-gray-700">{selectedRequest?.currentAddress}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Nature of Business</span>
              <p className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-gray-700 whitespace-pre-line">
                {selectedRequest?.natureOfBusiness}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Contact Name</span>
                <span className="text-gray-800 font-medium">{selectedRequest?.primaryContactName}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Contact Phone</span>
                <span className="text-gray-800 font-medium">{selectedRequest?.primaryContactPhone}</span>
              </div>
              <div className="col-span-2">
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Contact Email</span>
                <span className="text-gray-800 font-medium">{selectedRequest?.primaryContactEmail}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <span className="text-[10px] text-gray-400 font-bold uppercase block">Attached Documents</span>
              
              {selectedRequest?.cacCertificateUrl && (
                <a
                  href={selectedRequest.cacCertificateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-700 font-semibold transition-colors"
                >
                  <FiFileText size={18} />
                  <span>View CAC Certificate Document</span>
                </a>
              )}

              {selectedRequest?.memoOfAssociationUrl && (
                <a
                  href={selectedRequest.memoOfAssociationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-700 font-semibold transition-colors"
                >
                  <FiFileText size={18} />
                  <span>View Legal Document</span>
                </a>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowViewModal(false)}
                className="bg-slate-100 py-2 px-6 rounded-xl text-sm font-semibold text-gray-600 hover:bg-slate-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default VerificationForAdmin;
