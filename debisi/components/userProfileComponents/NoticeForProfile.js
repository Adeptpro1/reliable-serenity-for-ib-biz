import Image from "next/image";
import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
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
import { UPLOAD_IMAGE, DELETE_IMAGE } from "@/api/mutations/common";
import { toast } from "react-hot-toast";
import * as XLSX from "xlsx";

import { compressImage } from "@/utils/imageCompression";

const NoticeForProfile = ({ userData }) => {
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showLeadsModal, setShowLeadsModal] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [noticeToDelete, setNoticeToDelete] = useState(null);

  const client = useApolloClient();
  const userBusinesses = useMemo(() => userData?.businesses || [], [userData?.businesses]);

  const [createNotice] = useMutation(CREATE_NOTICE);
  const [boostNoticeMutation] = useMutation(BOOST_NOTICE);
  const [deleteNoticeMutation] = useMutation(DELETE_NOTICE);
  const [deleteImage] = useMutation(DELETE_IMAGE);

  const { data: walletData } = useQuery(GET_MY_WALLET);
  const walletBalance = walletData?.myWallet?.balance || 0;
  const BOOST_COST_PER_DAY = 100;

  const [noticeForm, setNoticeForm] = useState({
    businessId: "",
    title: "",
    content: "",
    callToAction: "",
    images: [],
    leadFields: ["name", "email"],
    boostDays: 0,
    boostTier: "TOWN",
  });

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (userBusinesses.length > 0 && !selectedBusinessId) {
      setSelectedBusinessId(userBusinesses[0].id);
      setNoticeForm((prev) => ({ ...prev, businessId: userBusinesses[0].id }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userBusinesses]);

  useEffect(() => {
    if (noticeForm.boostDays === 0) {
      setNoticeForm((prev) => ({
        ...prev,
        images: [],
        leadFields: ["name", "email"],
      }));
    }
  }, [noticeForm.boostDays]);

  const allNotices = userBusinesses
    .flatMap((biz) =>
      (biz.notices || []).map((n) => ({ ...n, businessName: biz.name, businessId: biz.id, isVerified: biz.isVerified })),
    )
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const filteredNotices = allNotices.filter((n) => {
    const bizMatch =
      !selectedBusinessId || n.businessId === selectedBusinessId;
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

    const business = userBusinesses.find((b) => b.id === noticeForm.businessId);
    const businessSlug = business?.name
      ? business.name.toLowerCase().replace(/[^a-z0-9]/g, "-")
      : "notice";

    setUploading(true);
    try {
      toast.loading("Processing images...", { id: "notice-upload" });
      const newImages = await Promise.all(
        files.map(async (file, index) => {
          if (file.size > 5 * 1024 * 1024)
            throw new Error(`${file.name} exceeds 5MB limit`);
          const compressedImage = await compressImage(file);

          // Rename file for SEO: business-name-notice-1.webp
          const renamedFile = new File(
            [compressedImage],
            `${businessSlug}-notice-${
              noticeForm.images.length + index + 1
            }.webp`,
            { type: "image/webp" },
          );

          const localUrl = URL.createObjectURL(renamedFile);
          return { url: localUrl, file: renamedFile };
        }),
      );
      setNoticeForm((prev) => ({
        ...prev,
        images: [...prev.images, ...newImages],
      }));
      toast.success("Images ready for upload", { id: "notice-upload" });
    } catch (err) {
      toast.error(err.message || "Upload failed", { id: "notice-upload" });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (imgToRemove) => {
    URL.revokeObjectURL(imgToRemove.url);
    setNoticeForm(prev => ({
      ...prev,
      images: prev.images.filter(img => img.url !== imgToRemove.url)
    }));
  };

  const handleCreateNotice = async (e) => {
    e.preventDefault();
    if (!noticeForm.businessId) return toast.error("Select a business");
    
    if (noticeForm.boostDays > 0) {
      if (!noticeForm.leadFields.includes("email") && !noticeForm.leadFields.includes("phone")) {
        return toast.error("Please select at least Email or Phone for contact collection.");
      }
    }
    
    const COSTS = { TOWN: 100, CITY: 200, STATE: 300 };
    const tier = noticeForm.boostTier || "TOWN";
    const costPerDay = COSTS[tier] || 100;
    const boostCost = (parseInt(noticeForm.boostDays) || 0) * costPerDay;
    if (boostCost > 0 && walletBalance < boostCost) {
      if (confirm(`Insufficient wallet balance for boost. You need ₦${boostCost.toLocaleString()} but have ₦${walletBalance.toLocaleString()}. Go to wallet to fund?`)) {
        window.location.href = `/dashboard/${userData?.id}?tab=Wallet`;
      }
      return;
    }

    try {
      // 1. Upload Images to Bunny.net first
      const uploadedUrls = [];
      if (noticeForm.images.length > 0) {
        toast.loading("Uploading images...", { id: "notice-publish" });
        for (const imgObj of noticeForm.images) {
          if (imgObj.file) {
            const { data } = await client.mutate({
              mutation: UPLOAD_IMAGE,
              variables: { file: imgObj.file },
            });
            uploadedUrls.push(data.uploadImage);
          }
        }
      }

      toast.loading("Publishing notice...", { id: "notice-publish" });
      await createNotice({
        variables: {
          input: {
            ...noticeForm,
            images: uploadedUrls,
            boostDays: parseInt(noticeForm.boostDays) || 0,
          },
        },
        refetchQueries: [{ query: GET_CURRENT_USER }],
      });
      toast.success("Notice created successfully!", { id: "notice-publish" });
      setShowCreateModal(false);
      setNoticeForm({
        businessId: noticeForm.businessId, // keep the same business selected
        title: "",
        content: "",
        callToAction: "",
        images: [],
        leadFields: ["name", "email"],
        boostDays: 0,
        boostTier: "TOWN",
      });
    } catch (err) {
      if (err.message.includes("network-request-failed") || err.message.includes("Failed to fetch")) {
        toast.error("Network Error: Please check your connection", { id: "notice-publish" });
      } else {
        toast.error(err.message, { id: "notice-publish" });
      }
    }
  };

  const handleBoostNotice = async (noticeId, days, tier) => {
    const COSTS = { TOWN: 100, CITY: 200, STATE: 300 };
    const boostCost = parseInt(days) * (COSTS[tier] || 100);
    if (walletBalance < boostCost) {
      if (confirm(`Insufficient wallet balance. You need ₦${boostCost.toLocaleString()} but have ₦${walletBalance.toLocaleString()}. Go to wallet to fund?`)) {
        window.location.href = `/dashboard/${userData?.id}?tab=wallet`;
      }
      return;
    }

    try {
      await boostNoticeMutation({
        variables: { noticeId, days: parseInt(days), tier },
        refetchQueries: [{ query: GET_CURRENT_USER }],
      });
      toast.success(`Notice boosted (${tier}) for ${days} days!`);
    } catch (err) {
      if (err.message.includes("network-request-failed") || err.message.includes("Failed to fetch")) {
        toast.error("Network Error: Please check your connection");
      } else {
        toast.error(err.message);
      }
    }
  };

  const handleDeleteNotice = async (notice) => {
    setNoticeToDelete(notice);
  };

  const confirmDeleteNotice = async () => {
    if (!noticeToDelete) return;
    const notice = noticeToDelete;
    try {
      // Cleanup images from Bunny.net storage
      if (notice.images && notice.images.length > 0) {
        for (const image of notice.images) {
          try {
            const url = typeof image === "string" ? image : image.imageUrl;
            if (url) {
              await deleteImage({ variables: { url } });
            }
          } catch (err) {
            console.error("Failed to delete notice image:", image, err);
          }
        }
      }

      await deleteNoticeMutation({
        variables: { id: notice.id },
        refetchQueries: [{ query: GET_CURRENT_USER }],
      });
      toast.success("Notice deleted");
    } catch (err) {
      if (
        err.message.includes("network-request-failed") ||
        err.message.includes("Failed to fetch")
      ) {
        toast.error("Network Error: Please check your connection");
      } else {
        toast.error(err.message);
      }
    } finally {
      setNoticeToDelete(null);
    }
  };

  const resetForm = () => {
    setNoticeForm({
      businessId: selectedBusinessId,
      title: "",
      content: "",
      callToAction: "",
      images: [],
      leadFields: ["name", "email"],
      boostDays: 0,
      boostTier: "TOWN",
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
        <p
          style={{
            fontSize: "18px",
            color: "#333",
            marginBottom: "12px",
            fontWeight: 600,
          }}
        >
          No businesses found
        </p>
        <p style={{ color: "#6b7280", marginBottom: "16px" }}>
          You don&apos;t have any registered businesses yet. Create one on the
          dashboard to post notices and manage leads.
        </p>
        <a href={`/dashboard/${userData?.id}`}>
          <button
            style={{
              padding: "10px 20px",
              background: "linear-gradient(to right, purple, #D22730)",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            Register Business
          </button>
        </a>
      </div>
    );
  }

  return (
    <div style={glassStyle} className="p-3 sm:p-5 rounded-xl sm:rounded-2xl">
      {/* Header */}
      <div
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6"
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

        <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedBusinessId}
            onChange={(e) => setSelectedBusinessId(e.target.value)}
            className="w-full xs:w-auto min-w-0 xs:min-w-[160px]"
            style={{
              padding: "10px",
              borderRadius: "12px",
              border: "1px solid #eee",
              fontSize: "13px",
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

          <button onClick={() => setShowCreateModal(true)} style={btnStyle} className="w-full xs:w-auto justify-center flex items-center">
            <FiPlus style={{ verticalAlign: "middle", marginRight: "5px" }} />{" "}
            New Notice
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div
        className="flex gap-4 sm:gap-6 overflow-x-auto pb-1 mb-6 border-b border-gray-100"
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
            className="flex-shrink-0"
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Notice Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(min(280px, 100%), 1fr))",
          gap: "20px",
        }}
      >
        <AnimatePresence mode="popLayout">
          {filteredNotices.map((notice) => (
            <NoticeAdminCard
              key={notice.id}
              notice={notice}
              onDelete={() => handleDeleteNotice(notice)}
              onViewLeads={() => {
                setSelectedNotice(notice);
                setShowLeadsModal(true);
              }}
              onBoost={(days, tier) => handleBoostNotice(notice.id, days, tier)}
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
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(min(200px, 100%), 1fr))",
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
                  pattern=".*[a-zA-Z].*"
                  title="Notice title must contain at least one letter (cannot be numbers only)."
                  maxLength={50}
                />
                <div style={{ textAlign: "right", fontSize: "10px", color: noticeForm.title.length >= 50 ? "red" : "#999", marginTop: "4px" }}>
                  {noticeForm.title.length}/50
                </div>
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
                minLength={10}
                maxLength={1000}
              />
              <div style={{ textAlign: "right", fontSize: "10px", color: noticeForm.content.length >= 1000 ? "red" : "#999", marginTop: "4px" }}>
                {noticeForm.content.length}/1000
              </div>
            </div>


            {noticeForm.boostDays > 0 ? (
              <>
                {/* Notice Images */}
                <div>
                  <label style={{ display: "block", fontSize: "10px", fontWeight: "700", color: "#999", marginBottom: "8px", textTransform: "uppercase" }}>
                    Notice Images (Max 2)
                  </label>
                  <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                    {noticeForm.images.map((imgObj, idx) => (
                      <div key={idx} style={{ position: "relative", width: "80px", height: "80px", borderRadius: "12px", overflow: "hidden", border: "1px solid #eee" }}>
                        <Image src={imgObj.url} alt="Notice preview" fill style={{ objectFit: "cover" }} />
                        {idx === 0 && (
                          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(128,0,128,0.8)", color: "white", fontSize: "9px", textAlign: "center", padding: "2px 0", fontWeight: "bold" }}>
                            COVER
                          </div>
                        )}
                        {idx > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              const newImages = [...noticeForm.images];
                              const temp = newImages[0];
                              newImages[0] = newImages[idx];
                              newImages[idx] = temp;
                              setNoticeForm({ ...noticeForm, images: newImages });
                            }}
                            style={{ position: "absolute", bottom: "4px", left: "4px", background: "rgba(0,0,0,0.6)", color: "white", fontSize: "9px", padding: "2px 4px", borderRadius: "4px", border: "none", cursor: "pointer", fontWeight: "bold" }}
                          >
                            Set Cover
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(imgObj)}
                          style={{ position: "absolute", top: "4px", right: "4px", backgroundColor: "rgba(255,0,0,0.8)", color: "white", border: "none", borderRadius: "50%", width: "20px", height: "20px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px" }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    {noticeForm.images.length < 2 && (
                      <label style={{ width: "80px", height: "80px", border: "2px dashed #eee", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#aaa" }}>
                        <input type="file" multiple accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />
                        <FiImage size={20} />
                      </label>
                    )}
                  </div>
                </div>

                {/* Lead Collection Fields */}
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
                      marginBottom: "4px",
                      textTransform: "uppercase",
                    }}
                  >
                    Lead Collection Fields
                  </label>
                  <p style={{ fontSize: "10px", color: "#64748b", margin: "0 0 12px 0", fontStyle: "italic" }}>
                    * Either Email or Phone is allowed per notice, but not both.
                  </p>
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
                          disabled={
                            field === "name" ||
                            (field === "email" && noticeForm.leadFields.includes("phone")) ||
                            (field === "phone" && noticeForm.leadFields.includes("email"))
                          }
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
              </>
            ) : (
              <div
                style={{
                  padding: "15px",
                  borderRadius: "15px",
                  backgroundColor: "#f8fafc",
                  border: "1px dashed #cbd5e1",
                  textAlign: "center",
                }}
              >
                <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>
                  💡 <strong>Notice images and lead collection forms</strong> are premium features available only for <strong>boosted notices</strong>.
                </p>
                <p style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px", marginBottom: 0 }}>
                  Set your initial boost duration below to unlock them.
                </p>
              </div>
            )}

            {(() => {
              const selectedBizForForm = userBusinesses.find((b) => b.id === noticeForm.businessId);
              const isBizVerified = selectedBizForForm?.isVerified || false;

              if (!isBizVerified) {
                return (
                  <div
                    style={{
                      padding: "16px",
                      borderRadius: "16px",
                      backgroundColor: "#fff5f5",
                      border: "1px dashed #ffa39e",
                      textAlign: "center",
                    }}
                  >
                    <p style={{ fontSize: "12px", color: "#ff4d4f", fontWeight: "700", margin: 0 }}>
                      ⚠️ Notice boosting is only available for verified businesses.
                    </p>
                    <p style={{ fontSize: "11px", color: "#8c8c8c", marginTop: "4px", marginBottom: 0 }}>
                      Please verify your business under the Verification tab to unlock boosting.
                    </p>
                  </div>
                );
              }

              return (
                <div
                  style={{
                    padding: "16px",
                    borderRadius: "16px",
                    backgroundColor: "rgba(139, 92, 246, 0.03)",
                    border: "1px solid rgba(139, 92, 246, 0.1)",
                  }}
                >
                  <label
                    style={{
                      display: "block",
                      fontSize: "10px",
                      fontWeight: "800",
                      color: "#8b5cf6",
                      marginBottom: "12px",
                      textTransform: "uppercase",
                    }}
                  >
                    🚀 Initial Boost (Optional)
                  </label>
                  
                  <div style={{ display: "flex", gap: "8px", marginBottom: "15px", flexWrap: "wrap" }}>
                    {BOOST_TIERS.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setNoticeForm({ ...noticeForm, boostTier: t.id })}
                        style={{
                          flex: "1 1 80px",
                          minWidth: "80px",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "6px",
                          padding: "10px 6px",
                          borderRadius: "12px",
                          border: `2px solid ${noticeForm.boostTier === t.id ? t.color : "#eee"}`,
                          background: noticeForm.boostTier === t.id ? t.bg : "white",
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                      >
                        <span style={{ fontSize: "20px" }}>{t.emoji}</span>
                        <span style={{ fontSize: "11px", fontWeight: "700", color: "#333" }}>{t.label}</span>
                        <span style={{ fontSize: "10px", fontWeight: "800", color: t.color }}>₦{t.costPerDay}/d</span>
                      </button>
                    ))}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontSize: "12px", fontWeight: "600", color: "#666" }}>Days:</span>
                      <input
                        type="number"
                        min="0"
                        max="30"
                        value={noticeForm.boostDays}
                        onChange={(e) =>
                          setNoticeForm({ ...noticeForm, boostDays: parseInt(e.target.value) || 0 })
                        }
                        style={{
                          width: "70px",
                          padding: "8px",
                          borderRadius: "10px",
                          border: "1px solid #eee",
                          textAlign: "center",
                          fontSize: "13px",
                          fontWeight: "600",
                        }}
                      />
                    </div>
                    
                    {noticeForm.boostDays > 0 && (
                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight: "800",
                          color: "#8b5cf6",
                        }}
                      >
                        Total: ₦{(noticeForm.boostDays * (BOOST_TIERS.find(t => t.id === noticeForm.boostTier)?.costPerDay || 100)).toLocaleString()}
                      </span>
                    )}
                  </div>
                  
                  {noticeForm.boostDays > 0 && (
                    <div style={{ marginTop: "10px", fontSize: "11px", color: "#64748b", display: "flex", flexDirection: "column", gap: "2px" }}>
                      <span>📡 <strong>Scope:</strong> {BOOST_TIERS.find(t => t.id === noticeForm.boostTier)?.scope}</span>
                      <span>👥 <strong>Est. Reach:</strong> {BOOST_TIERS.find(t => t.id === noticeForm.boostTier)?.reach}</span>
                    </div>
                  )}
                </div>
              );
            })()}

            <div style={{ padding: "10px", backgroundColor: "#fffbeb", borderRadius: "10px", border: "1px solid #fef3c7", margin: "10px 0" }}>
              <p style={{ fontSize: "11px", color: "#d97706", margin: 0, textAlign: "center", fontWeight: "600" }}>
                ⚠️ Please review your notice carefully. Notices cannot be edited once published.
              </p>
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
          btnStyle={btnStyle}
        />
      )}

      {/* Delete Confirmation Modal */}
      {noticeToDelete && (
        <Modal title="Delete Notice" onClose={() => setNoticeToDelete(null)}>
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <h3 style={{ fontSize: "18px", color: "#333", marginBottom: "15px" }}>Are you sure you want to delete this notice?</h3>
            <p style={{ color: "#777", fontSize: "14px", marginBottom: "25px" }}>This action cannot be undone.</p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button
                onClick={() => setNoticeToDelete(null)}
                style={{ padding: "10px 20px", borderRadius: "10px", border: "1px solid #ccc", background: "white", cursor: "pointer", fontWeight: "600" }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteNotice}
                style={{ padding: "10px 20px", borderRadius: "10px", border: "none", background: "#ef4444", color: "white", cursor: "pointer", fontWeight: "600" }}
              >
                Delete Notice
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ─── Boost Tier Config ───────────────────────────────────────────────────────
const BOOST_TIERS = [
  {
    id: "TOWN",
    label: "Town Boost",
    emoji: "📍",
    scope: "Local Government (LG) wide",
    reach: "250 – 1.25k viewers/day",
    costPerDay: 100,
    color: "#f59e0b",
    bg: "rgba(245, 158, 11, 0.08)",
    border: "rgba(245, 158, 11, 0.25)",
  },
  {
    id: "CITY",
    label: "City Boost",
    emoji: "🏙️",
    scope: "City-wide",
    reach: "1.25k – 5k viewers/day",
    costPerDay: 200,
    color: "#3b82f6",
    bg: "rgba(59, 130, 246, 0.08)",
    border: "rgba(59, 130, 246, 0.25)",
  },
  {
    id: "STATE",
    label: "State Boost",
    emoji: "🌍",
    scope: "State-wide",
    reach: "5k – 25k viewers/day",
    costPerDay: 300,
    color: "#8b5cf6",
    bg: "rgba(139, 92, 246, 0.08)",
    border: "rgba(139, 92, 246, 0.25)",
  },
];

const TIER_BADGE_STYLE = {
  TOWN:  { bg: "#fef3c7", color: "#92400e", label: "📍 TOWN" },
  CITY:  { bg: "#dbeafe", color: "#1e40af", label: "🏙️ CITY" },
  STATE: { bg: "#ede9fe", color: "#5b21b6", label: "🌍 STATE" },
};

// ─── Boost Tier Modal ─────────────────────────────────────────────────────────
const BoostTierModal = ({ walletBalance, onBoost, onClose }) => {
  const [selectedTier, setSelectedTier] = useState(null);
  const [days, setDays] = useState(3);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const tier = BOOST_TIERS.find(t => t.id === selectedTier);
  const totalCost = tier ? days * tier.costPerDay : 0;
  const canAfford = walletBalance >= totalCost;

  if (!mounted) return null;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed", inset: 0, zIndex: 999999,
        background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: "16px",
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }}
        style={{
          background: "white", borderRadius: "24px",
          padding: "clamp(16px, 5vw, 28px)",
          maxWidth: "420px", width: "100%",
          maxHeight: "90dvh",
          overflowY: "auto",
          boxShadow: "0 25px 60px rgba(0,0,0,0.18)",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ marginBottom: "20px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#1e293b", margin: 0 }}>
            🚀 Boost Your Notice
          </h3>
          <p style={{ fontSize: "12px", color: "#94a3b8", margin: "6px 0 0" }}>
            Choose your reach and duration. Wallet: <strong style={{ color: canAfford ? "#16a34a" : "#dc2626" }}>₦{walletBalance.toLocaleString()}</strong>
          </p>
        </div>

        {/* Tier Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
          {BOOST_TIERS.map(t => (
            <button
              key={t.id}
              onClick={() => setSelectedTier(t.id)}
              style={{
                display: "flex", alignItems: "center", gap: "14px",
                padding: "14px 16px", borderRadius: "14px",
                border: `2px solid ${selectedTier === t.id ? t.color : "#f1f5f9"}`,
                background: selectedTier === t.id ? t.bg : "#f8fafc",
                cursor: "pointer", textAlign: "left", transition: "all 0.18s",
              }}
            >
              <span style={{ fontSize: "24px" }}>{t.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "13px", fontWeight: "800", color: selectedTier === t.id ? t.color : "#334155" }}>
                    {t.label}
                  </span>
                  <span style={{
                    fontSize: "11px", fontWeight: "800", color: t.color,
                    background: t.bg, border: `1px solid ${t.border}`,
                    borderRadius: "20px", padding: "2px 10px",
                  }}>
                    ₦{t.costPerDay}/day
                  </span>
                </div>
                <div style={{ display: "flex", gap: "12px", marginTop: "4px" }}>
                  <span style={{ fontSize: "11px", color: "#64748b" }}>📡 {t.scope}</span>
                  <span style={{ fontSize: "11px", color: "#64748b" }}>👥 {t.reach}</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Days Selector */}
        {selectedTier && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: "#f8fafc", borderRadius: "14px", padding: "16px",
              marginBottom: "16px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <span style={{ fontSize: "12px", fontWeight: "700", color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Duration
              </span>
              <span style={{ fontSize: "18px", fontWeight: "900", color: canAfford ? tier.color : "#dc2626" }}>
                ₦{totalCost.toLocaleString()}
              </span>
            </div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {[1, 3, 7, 14, 30].map(d => (
                <button
                  key={d}
                  onClick={() => setDays(d)}
                  style={{
                    padding: "7px 14px", borderRadius: "10px", fontSize: "12px", fontWeight: "700",
                    border: `2px solid ${days === d ? tier.color : "#e2e8f0"}`,
                    background: days === d ? tier.bg : "white",
                    color: days === d ? tier.color : "#64748b",
                    cursor: "pointer", transition: "all 0.15s",
                  }}
                >{d}d</button>
              ))}
            </div>
            {!canAfford && (
              <p style={{ fontSize: "11px", color: "#dc2626", marginTop: "10px", fontWeight: "600" }}>
                ⚠️ Insufficient balance. Fund your wallet first.
              </p>
            )}
          </motion.div>
        )}

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            disabled={!selectedTier || !canAfford}
            onClick={() => { onBoost(days, selectedTier); onClose(); }}
            style={{
              flex: 1, padding: "13px", borderRadius: "12px", border: "none",
              background: selectedTier && canAfford
                ? `linear-gradient(135deg, ${tier?.color}, ${tier?.color}cc)`
                : "#e2e8f0",
              color: selectedTier && canAfford ? "white" : "#94a3b8",
              fontWeight: "800", fontSize: "13px",
              cursor: selectedTier && canAfford ? "pointer" : "not-allowed",
              transition: "all 0.2s",
            }}
          >
            {!selectedTier ? "Select a Tier" : !canAfford ? "Insufficient Balance" : `Boost for ₦${totalCost.toLocaleString()}`}
          </button>
          <button
            onClick={onClose}
            style={{
              padding: "13px 16px", borderRadius: "12px", border: "2px solid #e2e8f0",
              background: "white", color: "#64748b", fontWeight: "700", fontSize: "13px",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
};

const NoticeAdminCard = ({
  notice,
  onDelete,
  onViewLeads,
  onBoost,
  btnStyle,
}) => {
  const [showBoostModal, setShowBoostModal] = useState(false);
  const { data: walletData } = useQuery(GET_MY_WALLET);
  const walletBalance = walletData?.myWallet?.balance || 0;
  const now = new Date();
  const isExpired = notice.endDate && new Date(notice.endDate) < now;
  const isBoostActive =
    notice.boosted &&
    notice.boostExpiresAt &&
    new Date(notice.boostExpiresAt) > now;
  const tierBadge = isBoostActive && notice.boostTier ? TIER_BADGE_STYLE[notice.boostTier] : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 sm:p-5 flex flex-col gap-3"
      style={{
        backgroundColor: "white",
        borderRadius: "20px",
        border: isBoostActive ? `1.5px solid ${BOOST_TIERS.find(t => t.id === notice.boostTier)?.color || "#a78bfa"}` : "1px solid #f0f0f0",
        boxShadow: isBoostActive ? "0 4px 20px rgba(139,92,246,0.08)" : "0 4px 12px rgba(0,0,0,0.02)",
      }}
    >
      <div className="flex flex-col gap-1">
        <span
          style={{
            fontSize: "10px",
            fontWeight: "800",
            color: "#bbb",
            textTransform: "uppercase",
            letterSpacing: "1px",
          }}
          className="block truncate"
        >
          {notice.businessName}
        </span>
        <div className="flex justify-between items-start gap-3">
          <h3
            style={{
              fontSize: "16px",
              fontWeight: "700",
              color: "#333",
              margin: "0",
            }}
            className="break-words flex-1"
          >
            {notice.title}
          </h3>
          <div className="flex items-center gap-2 flex-shrink-0">
            {isBoostActive ? (
              <button
                onClick={() => notice.isVerified ? setShowBoostModal(true) : toast.error("Verification required to boost notices")}
                title={notice.isVerified ? "Extend boost" : "Verify business to boost notice"}
                style={{
                  padding: "8px 12px",
                  borderRadius: "10px",
                  backgroundColor: BOOST_TIERS.find(t => t.id === notice.boostTier)?.bg || "#f0f7ff",
                  color: BOOST_TIERS.find(t => t.id === notice.boostTier)?.color || "#0070f3",
                  border: "none",
                  cursor: notice.isVerified ? "pointer" : "not-allowed",
                  fontSize: "10px",
                  fontWeight: "800",
                  opacity: notice.isVerified ? 1 : 0.6,
                }}
              >
                <FiRefreshCw size={12} style={{ marginRight: "4px", verticalAlign: "middle" }} />
                Extend
              </button>
            ) : (
              <button
                onClick={() => notice.isVerified ? setShowBoostModal(true) : toast.error("Verification required to boost notices")}
                style={{
                  padding: "8px",
                  borderRadius: "10px",
                  backgroundColor: "#f9f9f9",
                  color: notice.isVerified ? "#aaa" : "#ccc",
                  border: "none",
                  cursor: notice.isVerified ? "pointer" : "not-allowed",
                  opacity: notice.isVerified ? 1 : 0.6,
                }}
                title={notice.isVerified ? "Boost this notice" : "Verify business to boost notice"}
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
        {tierBadge && (
          <div style={{ marginTop: "4px" }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: "4px",
              fontSize: "9px", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.8px",
              background: tierBadge.bg, color: tierBadge.color,
              borderRadius: "20px", padding: "3px 10px",
            }}>
              {tierBadge.label} · Boosted
            </span>
          </div>
        )}
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
            <Image
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
            width={800} height={800} />
          ))}
        </div>
      )}

      <div
        className="flex justify-between items-center gap-3 pt-3 border-t border-gray-50 mt-auto"
      >
        <div
          className="flex flex-col gap-1 text-[10px] text-gray-400"
        >
          <span>
            <FiClock className="inline mr-1" />{" "}
            {new Date(notice.createdAt).toLocaleDateString()}
          </span>
          {isBoostActive && notice.boostExpiresAt && (
            <span className="text-green-600 font-bold">
              Boost ends {new Date(notice.boostExpiresAt).toLocaleDateString()}
            </span>
          )}
          <span
            className={isExpired ? "text-red-400 font-bold" : "text-green-400 font-bold"}
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
          className="flex-shrink-0"
        >
          <FiUsers /> Leads
        </button>
      </div>

      {/* Boost Tier Modal */}
      <AnimatePresence>
        {showBoostModal && (
          <BoostTierModal
            walletBalance={walletBalance}
            onBoost={(days, tier) => {
              onBoost(days, tier);
              setShowBoostModal(false);
            }}
            onClose={() => setShowBoostModal(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const LeadsManager = ({
  notice,
  onClose,
  onExportXLS,
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
        className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-3 mb-6"
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
        <div className="flex gap-2 w-full xs:w-auto">
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
            className="flex-1 xs:flex-none justify-center flex items-center"
          >
            <FiDownload style={{ marginRight: "5px" }} /> Export XLSX
          </button>
        </div>
      </div>

      <div
        style={{
          maxHeight: "50vh",
          overflowY: "auto",
          overflowX: "auto",
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
              {notice.leadFields?.includes("email") && <th style={{ padding: "12px" }}>Email</th>}
              {notice.leadFields?.includes("phone") && <th style={{ padding: "12px" }}>Phone</th>}
              {notice.leadFields?.includes("message") && <th style={{ padding: "12px" }}>Message</th>}
              <th style={{ padding: "12px" }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} style={{ borderBottom: "1px solid #f9f9f9" }}>
                <td style={{ padding: "12px", fontWeight: "600" }}>
                  {lead.name}
                </td>
                {notice.leadFields?.includes("email") && (
                  <td style={{ padding: "12px" }}>{lead.email || "-"}</td>
                )}
                {notice.leadFields?.includes("phone") && (
                  <td style={{ padding: "12px" }}>{lead.phone || "-"}</td>
                )}
                {notice.leadFields?.includes("message") && (
                  <td 
                    style={{ padding: "12px", maxWidth: "200px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} 
                    title={lead.additionalData?.comment}
                  >
                    {lead.additionalData?.comment || "-"}
                  </td>
                )}
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
                  colSpan={2 + (notice.leadFields?.includes("email") ? 1 : 0) + (notice.leadFields?.includes("phone") ? 1 : 0) + (notice.leadFields?.includes("message") ? 1 : 0)}
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
