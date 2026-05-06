import { useState, useEffect } from "react";
import {
  FiEdit,
  FiTrash,
  FiPlus,
  FiTrendingUp,
  FiUsers,
  FiDownload,
  FiImage,
  FiClock,
  FiRefreshCw,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import Modal from "../otherComponents/Modal";
import { useQuery, useMutation, useApolloClient } from "@apollo/client";
import { GET_CURRENT_USER } from "@/api/queries/user/user";
import {
  CREATE_NOTICE,
  BOOST_NOTICE,
  DELETE_NOTICE,
  GET_NOTICE_LEADS,
} from "@/api/queries/business/notice";
import { GET_MY_WALLET } from "@/api/queries/user/wallet";
import { UPLOAD_IMAGE } from "@/api/mutations/common";
import { toast } from "react-hot-toast";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { compressImage } from "@/utils/imageCompression";

const NoticeForProfile = ({ userData }) => {
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showLeadsModal, setShowLeadsModal] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [activeTab, setActiveTab] = useState("all");

  const client = useApolloClient();
  const userBusinesses = userData?.businesses || [];

  const [createNotice] = useMutation(CREATE_NOTICE);
  const [boostNoticeMutation] = useMutation(BOOST_NOTICE);
  const [deleteNoticeMutation] = useMutation(DELETE_NOTICE);
  const { data: walletData } = useQuery(GET_MY_WALLET);
  const walletBalance = walletData?.myWallet?.balance || 0;
  const BOOST_COST_PER_DAY = 100;

  const [noticeForm, setNoticeForm] = useState({
    businessId: "",
    title: "",
    content: "",
    callToAction: "",
    link: "",
    images: [],
    leadFields: ["name", "email"],
    boostDays: 0,
  });

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (userBusinesses.length > 0 && !selectedBusinessId) {
      setSelectedBusinessId(userBusinesses[0].id);
      setNoticeForm((prev) => ({ ...prev, businessId: userBusinesses[0].id }));
    }
  }, [userBusinesses]);

  const allNotices = userBusinesses
    .flatMap((biz) =>
      (biz.notices || []).map((n) => ({ ...n, businessName: biz.name })),
    )
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const filteredNotices = allNotices.filter((n) => {
    const bizMatch =
      !selectedBusinessId || n.business.id === selectedBusinessId;
    const now = new Date();
    const isExpired = n.endDate && new Date(n.endDate) < now;

    if (activeTab === "boosted") return bizMatch && n.boosted && !isExpired;
    if (activeTab === "expired") return bizMatch && isExpired;
    return bizMatch;
  });

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length + noticeForm.images.length > 2) {
      toast.error("Max 2 images allowed");
      return;
    }

    setUploading(true);
    try {
      toast.loading("Uploading images...", { id: "notice-upload" });
      const uploadedUrls = await Promise.all(
        files.map(async (file) => {
          if (file.size > 2 * 1024 * 1024)
            throw new Error(`${file.name} exceeds 2MB limit`);
          const compressedImage = await compressImage(file);
          const { data } = await client.mutate({
            mutation: UPLOAD_IMAGE,
            variables: { file: compressedImage },
          });
          return data.uploadImage;
        }),
      );
      setNoticeForm((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls],
      }));
      toast.success("Images uploaded", { id: "notice-upload" });
    } catch (err) {
      toast.error(err.message || "Upload failed", { id: "notice-upload" });
    } finally {
      setUploading(false);
    }
  };

  const handleCreateNotice = async (e) => {
    e.preventDefault();
    if (!noticeForm.businessId) return toast.error("Select a business");
    
    const boostCost = (parseInt(noticeForm.boostDays) || 0) * BOOST_COST_PER_DAY;
    if (boostCost > 0 && walletBalance < boostCost) {
      if (confirm(`Insufficient wallet balance for boost. You need ₦${boostCost.toLocaleString()} but have ₦${walletBalance.toLocaleString()}. Go to wallet to fund?`)) {
        window.location.href = `/dashboard/${userData?.id}?tab=Wallet`;
      }
      return;
    }

    try {
      await createNotice({
        variables: {
          input: {
            ...noticeForm,
            boostDays: parseInt(noticeForm.boostDays) || 0,
          },
        },
        refetchQueries: [{ query: GET_CURRENT_USER }],
      });
      toast.success("Notice created successfully!");
      setShowCreateModal(false);
      resetForm();
    } catch (err) {
      if (err.message.includes("network-request-failed") || err.message.includes("Failed to fetch")) {
        toast.error("Network Error: Please check your connection");
      } else {
        toast.error(err.message);
      }
    }
  };

  const handleBoostNotice = async (noticeId, days) => {
    const boostCost = parseInt(days) * BOOST_COST_PER_DAY;
    if (walletBalance < boostCost) {
      if (confirm(`Insufficient wallet balance. You need ₦${boostCost.toLocaleString()} but have ₦${walletBalance.toLocaleString()}. Go to wallet to fund?`)) {
        window.location.href = `/dashboard/${userData?.id}?tab=Wallet`;
      }
      return;
    }

    try {
      await boostNoticeMutation({
        variables: { noticeId, days: parseInt(days) },
        refetchQueries: [{ query: GET_CURRENT_USER }],
      });
      toast.success(`Notice boosted for ${days} days!`);
    } catch (err) {
      if (err.message.includes("network-request-failed") || err.message.includes("Failed to fetch")) {
        toast.error("Network Error: Please check your connection");
      } else {
        toast.error(err.message);
      }
    }
  };

  const handleDeleteNotice = async (id) => {
    if (!confirm("Are you sure you want to delete this notice?")) return;
    try {
      await deleteNoticeMutation({
        variables: { id },
        refetchQueries: [{ query: GET_CURRENT_USER }],
      });
      toast.success("Notice deleted");
    } catch (err) {
      if (err.message.includes("network-request-failed") || err.message.includes("Failed to fetch")) {
        toast.error("Network Error: Please check your connection");
      } else {
        toast.error(err.message);
      }
    }
  };

  const resetForm = () => {
    setNoticeForm({
      businessId: selectedBusinessId,
      title: "",
      content: "",
      callToAction: "",
      link: "",
      images: [],
      leadFields: ["name", "email"],
      boostDays: 0,
    });
  };

  const exportLeadsToXLS = (leads, noticeTitle) => {
    const ws = XLSX.utils.json_to_sheet(
      leads.map((l) => ({
        Name: l.name,
        Email: l.email,
        Phone: l.phone || "N/A",
        ...l.additionalData,
        Date: new Date(l.submittedAt).toLocaleDateString(),
      })),
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Leads");
    XLSX.writeFile(wb, `${noticeTitle}_Leads.xlsx`);
  };

  const exportLeadsToPDF = (leads, noticeTitle) => {
    const doc = new jsPDF();
    doc.text(`Leads for: ${noticeTitle}`, 14, 15);
    const tableData = leads.map((l) => [
      l.name,
      l.email,
      l.phone || "N/A",
      new Date(l.submittedAt).toLocaleDateString(),
    ]);
    doc.autoTable({
      head: [["Name", "Email", "Phone", "Date"]],
      body: tableData,
      startY: 25,
    });
    doc.save(`${noticeTitle}_Leads.pdf`);
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
    padding: "20px",
    background: "rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(12px)",
    borderRadius: "20px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
    margin: "10px 0",
  };

  return (
    <div style={glassStyle}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
          gap: "10px",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: "800",
              margin: "0",
              color: "#333",
            }}
          >
            Notice Manager
          </h1>
          <p style={{ margin: "5px 0 0 0", fontSize: "12px", color: "#777" }}>
            Manage your business announcements and leads.
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <select
            value={selectedBusinessId}
            onChange={(e) => setSelectedBusinessId(e.target.value)}
            style={{
              padding: "10px",
              borderRadius: "12px",
              border: "1px solid #eee",
              fontSize: "13px",
              minWidth: "160px",
              outline: "none",
              backgroundColor: "white",
            }}
          >
            <option value="">All Businesses</option>
            {userBusinesses.map((biz) => (
              <option key={biz.id} value={biz.id}>
                {biz.name}
              </option>
            ))}
          </select>

          <button onClick={() => setShowCreateModal(true)} style={btnStyle}>
            <FiPlus style={{ verticalAlign: "middle", marginRight: "5px" }} />{" "}
            New Notice
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: "20px",
          marginBottom: "25px",
          borderBottom: "1px solid #eee",
        }}
      >
        {["all", "boosted", "expired"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "12px 5px",
              fontSize: "13px",
              fontWeight: "600",
              border: "none",
              background: "none",
              cursor: "pointer",
              color: activeTab === tab ? "purple" : "#aaa",
              borderBottom: activeTab === tab ? "2px solid purple" : "none",
              transition: "all 0.2s",
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Notice Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "25px",
        }}
      >
        <AnimatePresence mode="popLayout">
          {filteredNotices.map((notice) => (
            <NoticeAdminCard
              key={notice.id}
              notice={notice}
              onDelete={() => handleDeleteNotice(notice.id)}
              onViewLeads={() => {
                setSelectedNotice(notice);
                setShowLeadsModal(true);
              }}
              onBoost={(days) => handleBoostNotice(notice.id, days)}
              btnStyle={btnStyle}
            />
          ))}
        </AnimatePresence>

        {filteredNotices.length === 0 && (
          <div
            style={{
              gridColumn: "1/-1",
              padding: "40px 0",
              textAlign: "center",
              color: "#6b7280",
            }}
          >
            <p style={{ fontSize: "14px", fontWeight: "500" }}>No notices found.</p>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <Modal
          title="Create Business Notice"
          onClose={() => setShowCreateModal(false)}
        >
          <form
            onSubmit={handleCreateNotice}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              maxHeight: "75vh",
              overflowY: "auto",
              paddingRight: "5px",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "15px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "10px",
                    fontWeight: "700",
                    color: "#999",
                    marginBottom: "5px",
                    textTransform: "uppercase",
                  }}
                >
                  Business
                </label>
                <select
                  value={noticeForm.businessId}
                  onChange={(e) =>
                    setNoticeForm({ ...noticeForm, businessId: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "12px",
                    border: "1px solid #eee",
                    fontSize: "13px",
                  }}
                  required
                >
                  <option value="">Select Business</option>
                  {userBusinesses.map((biz) => (
                    <option key={biz.id} value={biz.id}>
                      {biz.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "10px",
                    fontWeight: "700",
                    color: "#999",
                    marginBottom: "5px",
                    textTransform: "uppercase",
                  }}
                >
                  Title
                </label>
                <input
                  type="text"
                  value={noticeForm.title}
                  onChange={(e) =>
                    setNoticeForm({ ...noticeForm, title: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "12px",
                    border: "1px solid #eee",
                    fontSize: "13px",
                  }}
                  placeholder="Notice Title"
                  required
                />
              </div>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "10px",
                  fontWeight: "700",
                  color: "#999",
                  marginBottom: "5px",
                  textTransform: "uppercase",
                }}
              >
                Content
              </label>
              <textarea
                value={noticeForm.content}
                onChange={(e) =>
                  setNoticeForm({ ...noticeForm, content: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "12px",
                  border: "1px solid #eee",
                  fontSize: "13px",
                  minHeight: "100px",
                  resize: "none",
                }}
                placeholder="What is this notice about?"
                required
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "15px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "10px",
                    fontWeight: "700",
                    color: "#999",
                    marginBottom: "5px",
                    textTransform: "uppercase",
                  }}
                >
                  CTA Label
                </label>
                <input
                  type="text"
                  value={noticeForm.callToAction}
                  onChange={(e) =>
                    setNoticeForm({
                      ...noticeForm,
                      callToAction: e.target.value,
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "12px",
                    border: "1px solid #eee",
                    fontSize: "13px",
                  }}
                  placeholder="Click Here / Register"
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "10px",
                    fontWeight: "700",
                    color: "#999",
                    marginBottom: "5px",
                    textTransform: "uppercase",
                  }}
                >
                  Link (Optional)
                </label>
                <input
                  type="url"
                  value={noticeForm.link}
                  onChange={(e) =>
                    setNoticeForm({ ...noticeForm, link: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "12px",
                    border: "1px solid #eee",
                    fontSize: "13px",
                  }}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div
              style={{
                padding: "15px",
                borderRadius: "15px",
                backgroundColor: "rgba(128, 0, 128, 0.03)",
                border: "1px solid rgba(128, 0, 128, 0.1)",
              }}
            >
              <label
                style={{
                  display: "block",
                  fontSize: "10px",
                  fontWeight: "800",
                  color: "purple",
                  marginBottom: "12px",
                  textTransform: "uppercase",
                }}
              >
                Lead Collection Fields
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "15px" }}>
                {["name", "email", "phone", "message"].map((field) => (
                  <label
                    key={field}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      cursor: "pointer",
                      fontSize: "13px",
                      color: "#444",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={noticeForm.leadFields.includes(field)}
                      disabled={field === "name" || field === "email"}
                      onChange={() => {
                        const newFields = noticeForm.leadFields.includes(field)
                          ? noticeForm.leadFields.filter((f) => f !== field)
                          : [...noticeForm.leadFields, field];
                        setNoticeForm({ ...noticeForm, leadFields: newFields });
                      }}
                    />
                    <span style={{ textTransform: "capitalize" }}>{field}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "10px",
                  fontWeight: "700",
                  color: "#999",
                  marginBottom: "10px",
                  textTransform: "uppercase",
                }}
              >
                Initial Boost (100 NGN/day)
              </label>
              <div
                style={{ display: "flex", alignItems: "center", gap: "15px" }}
              >
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={noticeForm.boostDays}
                  onChange={(e) =>
                    setNoticeForm({ ...noticeForm, boostDays: e.target.value })
                  }
                  style={{
                    width: "80px",
                    padding: "10px",
                    borderRadius: "10px",
                    border: "1px solid #eee",
                    textAlign: "center",
                  }}
                />
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: "700",
                    color: "purple",
                  }}
                >
                  Total: {noticeForm.boostDays * 100} NGN
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={uploading}
              style={{
                ...btnStyle,
                width: "100%",
                marginTop: "10px",
                padding: "15px",
              }}
            >
              {uploading ? "Uploading..." : "Publish Notice"}
            </button>
          </form>
        </Modal>
      )}

      {/* Leads Modal */}
      {showLeadsModal && selectedNotice && (
        <LeadsManager
          notice={selectedNotice}
          onClose={() => setShowLeadsModal(false)}
          onExportXLS={exportLeadsToXLS}
          onExportPDF={exportLeadsToPDF}
          btnStyle={btnStyle}
        />
      )}
    </div>
  );
};

const NoticeAdminCard = ({
  notice,
  onDelete,
  onViewLeads,
  onBoost,
  btnStyle,
}) => {
  const [showBoostPrompt, setShowBoostPrompt] = useState(false);
  const [boostDays, setBoostDays] = useState(3);
  const now = new Date();
  const isExpired = notice.endDate && new Date(notice.endDate) < now;
  const isBoostActive =
    notice.boosted &&
    notice.boostExpiresAt &&
    new Date(notice.boostExpiresAt) > now;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        padding: "18px",
        backgroundColor: "white",
        borderRadius: "20px",
        border: "1px solid #f0f0f0",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div style={{ flex: 1 }}>
          <span
            style={{
              fontSize: "10px",
              fontWeight: "800",
              color: "#bbb",
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            {notice.businessName}
          </span>
          <h3
            style={{
              fontSize: "16px",
              fontWeight: "700",
              color: "#333",
              margin: "5px 0",
            }}
          >
            {notice.title}
          </h3>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {isBoostActive ? (
            <div
              style={{
                padding: "8px",
                borderRadius: "10px",
                backgroundColor: "#f0f7ff",
                color: "#0070f3",
              }}
            >
              <FiTrendingUp size={14} />
            </div>
          ) : (
            <button
              onClick={() => setShowBoostPrompt(true)}
              style={{
                padding: "8px",
                borderRadius: "10px",
                backgroundColor: "#f9f9f9",
                color: "#aaa",
                border: "none",
                cursor: "pointer",
              }}
            >
              <FiTrendingUp size={14} />
            </button>
          )}
          <button
            onClick={onDelete}
            style={{
              padding: "8px",
              borderRadius: "10px",
              backgroundColor: "#fff5f5",
              color: "#ff4d4f",
              border: "none",
              cursor: "pointer",
            }}
          >
            <FiTrash size={14} />
          </button>
        </div>
      </div>

      <p
        style={{
          fontSize: "13px",
          color: "#666",
          lineHeight: "1.5",
          margin: "0",
          display: "-webkit-box",
          WebkitLineClamp: "3",
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {notice.content}
      </p>

      {notice.images?.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: "8px",
            overflowX: "auto",
            paddingBottom: "5px",
          }}
        >
          {notice.images.map((img) => (
            <img
              key={img.id}
              src={img.imageUrl}
              style={{
                width: "45px",
                height: "45px",
                borderRadius: "8px",
                objectCover: "cover",
                flexShrink: "0",
              }}
              alt="Notice"
            />
          ))}
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: "12px",
          borderTop: "1px solid #f9f9f9",
          marginTop: "auto",
        }}
      >
        <div
          style={{
            fontSize: "10px",
            color: "#bbb",
            display: "flex",
            flexDirection: "column",
            gap: "3px",
          }}
        >
          <span>
            <FiClock style={{ marginRight: "4px" }} />{" "}
            {new Date(notice.createdAt).toLocaleDateString()}
          </span>
          <span
            style={{
              color: isExpired ? "#ffa39e" : "#b7eb8f",
              fontWeight: "800",
            }}
          >
            {isExpired ? "EXPIRED" : "ACTIVE"}
          </span>
        </div>
        <button
          onClick={onViewLeads}
          style={{
            ...btnStyle,
            padding: "8px 12px",
            fontSize: "11px",
            display: "flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          <FiUsers /> Leads
        </button>
      </div>

      <AnimatePresence>
        {showBoostPrompt && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{
              overflow: "hidden",
              marginTop: "10px",
              paddingTop: "10px",
              borderTop: "1px dashed #eee",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "10px",
              }}
            >
              <span
                style={{ fontSize: "11px", fontWeight: "600", color: "#777" }}
              >
                Days to boost
              </span>
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={boostDays}
                  onChange={(e) => setBoostDays(e.target.value)}
                  style={{
                    width: "50px",
                    padding: "5px",
                    border: "1px solid #eee",
                    borderRadius: "5px",
                    fontSize: "12px",
                    textAlign: "center",
                  }}
                />
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: "800",
                    color: "purple",
                  }}
                >
                  {boostDays * 100} NGN
                </span>
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => {
                  onBoost(boostDays);
                  setShowBoostPrompt(false);
                }}
                style={{
                  flex: 1,
                  padding: "8px",
                  backgroundColor: "purple",
                  color: "white",
                  borderRadius: "8px",
                  border: "none",
                  fontSize: "11px",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                Confirm
              </button>
              <button
                onClick={() => setShowBoostPrompt(false)}
                style={{
                  padding: "8px 15px",
                  backgroundColor: "#f0f0f0",
                  color: "#888",
                  borderRadius: "8px",
                  border: "none",
                  fontSize: "11px",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const LeadsManager = ({
  notice,
  onClose,
  onExportXLS,
  onExportPDF,
  btnStyle,
}) => {
  const { data, loading } = useQuery(GET_NOTICE_LEADS, {
    variables: { noticeId: notice.id },
    fetchPolicy: "network-only",
  });
  const leads = data?.contactSubmissions || [];

  return (
    <Modal title={`Leads: ${notice.title}`} onClose={onClose}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "25px",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        <div>
          <span
            style={{ fontSize: "28px", fontWeight: "900", color: "purple" }}
          >
            {leads.length}
          </span>
          <span style={{ fontSize: "13px", color: "#999", marginLeft: "10px" }}>
            Contacts Collected
          </span>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            disabled={leads.length === 0}
            onClick={() => onExportXLS(leads, notice.title)}
            style={{
              ...btnStyle,
              backgroundColor: "white",
              color: "#22c55e",
              border: "1px solid #22c55e",
              padding: "8px 12px",
              fontSize: "12px",
              opacity: leads.length === 0 ? 0.5 : 1,
            }}
          >
            <FiDownload style={{ marginRight: "5px" }} /> XLSX
          </button>
          <button
            disabled={leads.length === 0}
            onClick={() => onExportPDF(leads, notice.title)}
            style={{
              ...btnStyle,
              backgroundColor: "white",
              color: "#ef4444",
              border: "1px solid #ef4444",
              padding: "8px 12px",
              fontSize: "12px",
              opacity: leads.length === 0 ? 0.5 : 1,
            }}
          >
            <FiDownload style={{ marginRight: "5px" }} /> PDF
          </button>
        </div>
      </div>

      <div
        style={{
          maxHeight: "50vh",
          overflowY: "auto",
          border: "1px solid #f0f0f0",
          borderRadius: "15px",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "13px",
            textAlign: "left",
          }}
        >
          <thead
            style={{
              position: "sticky",
              top: 0,
              backgroundColor: "#fafafa",
              borderBottom: "1px solid #f0f0f0",
            }}
          >
            <tr>
              <th style={{ padding: "12px" }}>Name</th>
              <th style={{ padding: "12px" }}>Contact</th>
              <th style={{ padding: "12px" }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} style={{ borderBottom: "1px solid #f9f9f9" }}>
                <td style={{ padding: "12px", fontWeight: "600" }}>
                  {lead.name}
                </td>
                <td style={{ padding: "12px" }}>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span>{lead.email}</span>
                    {lead.phone && (
                      <span style={{ fontSize: "11px", color: "#aaa" }}>
                        {lead.phone}
                      </span>
                    )}
                  </div>
                </td>
                <td
                  style={{ padding: "12px", color: "#bbb", fontSize: "11px" }}
                >
                  {new Date(lead.submittedAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {!loading && leads.length === 0 && (
              <tr>
                <td
                  colSpan="3"
                  style={{
                    padding: "40px",
                    textAlign: "center",
                    color: "#ccc",
                  }}
                >
                  No leads yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Modal>
  );
};

export default NoticeForProfile;
