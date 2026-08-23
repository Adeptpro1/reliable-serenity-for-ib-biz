import Image from "next/image";
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { FiTrash2, FiPlus, FiPlay, FiRefreshCw } from "react-icons/fi";
import { useQuery, useMutation } from "@apollo/client";
import { GET_BUSINESS_VIDEOS_BY_BUSINESS } from "../../graphql/queries/business/videos";
import { GET_MY_WALLET } from "../../graphql/queries/user/wallet";
import { GET_PRICINGS } from "@/graphql/queries/admin/pricing";
import {
  UPLOAD_BUSINESS_VIDEO,
  DELETE_BUSINESS_VIDEO,
  RELIST_BUSINESS_VIDEO,
} from "../../graphql/mutations/business/videos";
import { UPLOAD_VIDEO } from "../../graphql/mutations/common";
import Modal from "../otherComponents/Modal";
import Link from "next/link";
import { toast } from "react-hot-toast";

const getBunnyThumbnailUrl = (videoUrl) => {
  if (!videoUrl) return "/images/video-placeholder.jpg";
  const match = videoUrl.match(/embed\/(\d+)\/([a-zA-Z0-9-]+)/);
  if (match) {
    const [_, libraryId, videoId] = match;
    return `https://vz-${libraryId}.b-cdn.net/${videoId}/thumbnail.jpg`;
  }
  return videoUrl;
};

const VideosForProfile = ({ userData }) => {
  const { user } = useAuth();
  const userBusinesses = useMemo(
    () => user?.businesses || [],
    [user?.businesses],
  );

  const [showCreateVideoModal, setShowCreateVideoModal] = useState(false);
  const [showVideoPlayerModal, setShowVideoPlayerModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Form input states
  const [videoTitle, setVideoTitle] = useState("");
  const [videoDescription, setVideoDescription] = useState("");
  const [isBoosted, setIsBoosted] = useState(false);
  const [boostDays, setBoostDays] = useState(3);

  // Relisting states
  const [showRelistModal, setShowRelistModal] = useState(false);
  const [relistingVideo, setRelistingVideo] = useState(null);
  const [relistBoosted, setRelistBoosted] = useState(false);
  const [relistBoostDays, setRelistBoostDays] = useState(3);
  const [relistingLoading, setRelistingLoading] = useState(false);

  const selectedBusiness = userBusinesses.find((b) => b.id === selectedBusinessId) || userBusinesses[0];

  // Set default business
  useEffect(() => {
    if (userBusinesses.length > 0 && !selectedBusinessId) {
      setSelectedBusinessId(userBusinesses[0].id);
    }
  }, [userBusinesses, selectedBusinessId]);

  // Query videos
  const { data, loading, refetch } = useQuery(GET_BUSINESS_VIDEOS_BY_BUSINESS, {
    variables: { businessId: selectedBusinessId },
    skip: !selectedBusinessId,
    fetchPolicy: "network-only",
  });

  // Query wallet balance
  const { data: walletData, refetch: refetchWallet } = useQuery(GET_MY_WALLET, {
    fetchPolicy: "network-only",
  });
  const walletBalance = walletData?.myWallet?.balance || 0;

  // Query pricing
  const { data: pricingData } = useQuery(GET_PRICINGS, { fetchPolicy: "cache-and-network" });
  const dbPricings = pricingData?.pricings || [];
  const videoListingFee = dbPricings.find((p) => p.category === "SHOWROOM" && p.title.includes("Listing"))?.amount ?? 300;
  const boost3Rate = dbPricings.find((p) => p.category === "SHOWROOM" && p.title.includes("3 Days"))?.amount ?? 1000;
  const boost7Rate = dbPricings.find((p) => p.category === "SHOWROOM" && p.title.includes("7 Days"))?.amount ?? 2000;
  const boost14Rate = dbPricings.find((p) => p.category === "SHOWROOM" && p.title.includes("14 Days"))?.amount ?? 3500;

  const videos = data?.businessVideosByBusiness || [];

  // Mutations
  const [uploadVideoFile] = useMutation(UPLOAD_VIDEO);
  const [createBusinessVideo] = useMutation(UPLOAD_BUSINESS_VIDEO);
  const [deleteVideoMutation] = useMutation(DELETE_BUSINESS_VIDEO);
  const [relistVideoMutation] = useMutation(RELIST_BUSINESS_VIDEO);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this video?")) {
      try {
        await deleteVideoMutation({ variables: { id } });
        toast.success("Video deleted successfully");
        refetch();
      } catch (err) {
        if (
          err.message.includes("network-request-failed") ||
          err.message.includes("Failed to fetch")
        ) {
          toast.error("Network Error: Please check your connection");
        } else {
          toast.error(err.message || "Failed to delete video");
        }
      }
    }
  };

  const handleVideoClick = (video) => {
    setSelectedVideo(video);
    setShowVideoPlayerModal(true);
  };

  // Helper to extract duration from file
  const getVideoDuration = (file) =>
    new Promise((resolve) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        resolve(video.duration);
      };
      video.onerror = () => {
        resolve(30); // fallback
      };
      video.src = URL.createObjectURL(file);
    });

  const handleCreateVideo = async () => {
    if (!selectedBusinessId || !videoFile) {
      toast.error("Please select a business and upload a video");
      return;
    }

    const titleVal = videoTitle.trim();
    const descVal = videoDescription.trim();

    if (!titleVal) {
      toast.error("Please enter a video title");
      return;
    }

    if (!descVal) {
      toast.error("Please enter a video description");
      return;
    }

    // Client-side validations (MP4 format, 50MB size limit)
    if (videoFile.type !== "video/mp4" && !videoFile.name.toLowerCase().endsWith(".mp4")) {
      toast.error("Only MP4 format videos are allowed");
      return;
    }

    if (videoFile.size > 50 * 1024 * 1024) {
      toast.error("Video file size cannot exceed 50MB");
      return;
    }

    // Video duration validation (max 1 minute / 60 seconds)
    const duration = await getVideoDuration(videoFile);
    if (duration > 60) {
      toast.error(`Showroom videos cannot exceed 60 seconds (Selected: ${Math.round(duration)}s)`);
      return;
    }

    // Wallet balance validation
    let cost = videoListingFee;
    if (isBoosted) {
      if (!selectedBusiness?.isVerified) {
        toast.error("Video boosting is only available for verified businesses");
        return;
      }
      cost = boostDays === 3 ? boost3Rate : boostDays === 7 ? boost7Rate : boost14Rate;
    }

    if (walletBalance < cost) {
      toast.error(`Insufficient wallet balance. Cost is ₦${cost.toLocaleString()} but your balance is ₦${walletBalance.toLocaleString()}`);
      return;
    }

    setIsUploading(true);
    try {
      // 1. Upload file
      const { data: uploadData } = await uploadVideoFile({
        variables: { file: videoFile },
      });

      const videoUrl = uploadData.uploadVideo;

      // 2. Create business video record
      let boostTier = null;
      if (isBoosted) {
        boostTier = boostDays === 3 ? "TOWN" : boostDays === 7 ? "CITY" : "STATE";
      }

      await createBusinessVideo({
        variables: {
          input: {
            businessId: selectedBusinessId,
            videoUrl,
            title: titleVal,
            description: descVal,
            duration: Math.round(duration || 60),
            isBoosted,
            boostTier,
            boostDuration: isBoosted ? boostDays : null,
          },
        },
      });

      toast.success("Video uploaded successfully!");
      setShowCreateVideoModal(false);
      setVideoTitle("");
      setVideoDescription("");
      setVideoFile(null);
      setIsBoosted(false);
      refetch();
      refetchWallet?.();
    } catch (err) {
      if (
        err.message.includes("network-request-failed") ||
        err.message.includes("Failed to fetch")
      ) {
        toast.error("Network Error: Please check your connection");
      } else {
        toast.error(err.message || "Failed to upload video");
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleRelistVideo = async () => {
    if (!relistingVideo) return;

    // Determine cost
    let cost = videoListingFee;
    if (relistBoosted) {
      if (!selectedBusiness?.isVerified) {
        toast.error("Video boosting is only available for verified businesses");
        return;
      }
      cost = relistBoostDays === 3 ? boost3Rate : relistBoostDays === 7 ? boost7Rate : boost14Rate;
    }

    if (walletBalance < cost) {
      toast.error(`Insufficient wallet balance. Cost is ₦${cost.toLocaleString()} but your balance is ₦${walletBalance.toLocaleString()}`);
      return;
    };

    setRelistingLoading(true);
    try {
      let boostTier = null;
      if (relistBoosted) {
        boostTier = relistBoostDays === 3 ? "TOWN" : relistBoostDays === 7 ? "CITY" : "STATE";
      }

      await relistVideoMutation({
        variables: {
          videoId: relistingVideo.id,
          isBoosted: relistBoosted,
          boostTier,
          boostDuration: relistBoosted ? relistBoostDays : null,
        },
      });

      toast.success("Video relisted successfully");
      setShowRelistModal(false);
      setRelistingVideo(null);
      setRelistBoosted(false);
      setRelistBoostDays(3);
      refetch();
      refetchWallet();
    } catch (err) {
      toast.error(err.message || "Failed to relist video");
    } finally {
      setRelistingLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "#f8f9fa",
        borderRadius: "8px",
      }}
    >
      {/* Header with action buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h2
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            color: "#333",
          }}
        >
          Your Videos
        </h2>
        <div style={{ display: "flex", gap: "10px" }}>
          {userBusinesses.length > 0 && (
            <button
              onClick={() => setShowCreateVideoModal(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 16px",
                backgroundColor: "linear-gradient(to right, purple, #D22730)",
                background: "linear-gradient(to right, purple, #D22730)",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              <FiPlus size={16} />
              Add Video
            </button>
          )}
        </div>
      </div>

      {userBusinesses.length === 0 ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "40px",
            color: "#6b7280",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>🏢</div>
          <p
            style={{ fontSize: "18px", marginBottom: "12px", fontWeight: 600 }}
          >
            No businesses found
          </p>
          <p style={{ fontSize: "14px", marginBottom: "20px" }}>
            You need to register a business before you can upload showroom
            videos.
          </p>
          <Link href={`/dashboard/${userData?.id}`}>
            <button
              style={{
                padding: "10px 20px",
                backgroundColor: "linear-gradient(to right, purple, #D22730)",
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
          </Link>
        </div>
      ) : videos?.length > 0 ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "20px",
          }}
        >
          {videos?.map((video) => {
            const isExpired = video.expiresAt && new Date(video.expiresAt) < new Date();
            return (
              <div
                key={video.id}
                style={{
                  backgroundColor: "white",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  overflow: "hidden",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
                className="hover:shadow-lg hover:scale-105"
                onClick={() => handleVideoClick(video)}
              >
                <div>
                  {/* Video Thumbnail */}
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      height: "150px",
                    }}
                  >
                    <Image
                      src={getBunnyThumbnailUrl(video.videoUrl)}
                      alt={video.title || "Video thumbnail"}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                      width={800}
                      height={800}
                    />

                    {/* Play button overlay */}
                    <div
                      style={{
                        position: "absolute",
                        inset: "0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "rgba(0, 0, 0, 0.2)",
                        opacity: "0",
                        transition: "opacity 0.2s ease",
                      }}
                      className="hover:opacity-100"
                    >
                      <div
                        style={{
                          backgroundColor: "rgba(255, 255, 255, 0.9)",
                          borderRadius: "50%",
                          padding: "8px",
                        }}
                      >
                        <FiPlay style={{ color: "#2563eb" }} size={16} />
                      </div>
                    </div>

                    {/* Duration badge */}
                    <div
                      style={{
                        position: "absolute",
                        bottom: "8px",
                        right: "8px",
                        backgroundColor: "rgba(0, 0, 0, 0.75)",
                        color: "white",
                        fontSize: "12px",
                        padding: "4px 8px",
                        borderRadius: "4px",
                      }}
                    >
                      {video.duration}s
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(video.id);
                      }}
                      style={{
                        position: "absolute",
                        top: "8px",
                        right: "8px",
                        padding: "6px",
                        background: "rgba(220, 38, 38, 0.9)",
                        color: "white",
                        border: "none",
                        borderRadius: "50%",
                        cursor: "pointer",
                        width: "32px",
                        height: "32px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 10,
                      }}
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>

                  {/* Video Info */}
                  <div style={{ padding: "12px" }}>
                    <h3
                      style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#1f2937",
                        marginBottom: "4px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: "2",
                        WebkitBoxOrient: "vertical",
                        lineHeight: "1.3",
                      }}
                    >
                      {video.title || "Showroom Video"}
                    </h3>

                    <p
                      style={{
                        fontSize: "12px",
                        color: "#6b7280",
                        marginBottom: "8px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: "2",
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {video.description || "Watch our showroom video"}
                    </p>
                  </div>
                </div>

                {/* Status Badges & Relist Action */}
                <div style={{ padding: "12px", borderTop: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", gap: "6px" }}>
                    {isExpired ? (
                      <span style={{ fontSize: "11px", backgroundColor: "#fee2e2", color: "#b91c1c", padding: "2px 6px", borderRadius: "4px", fontWeight: "600" }}>
                        Expired
                      </span>
                    ) : (
                      <span style={{ fontSize: "11px", backgroundColor: "#d1fae5", color: "#065f46", padding: "2px 6px", borderRadius: "4px", fontWeight: "600" }}>
                        Active
                      </span>
                    )}

                    {video.boosted && (
                      <span style={{ fontSize: "11px", backgroundColor: "#f3e8ff", color: "#6b21a8", padding: "2px 6px", borderRadius: "4px", fontWeight: "600" }}>
                        ⚡ {video.boostTier || "Boosted"}
                      </span>
                    )}
                  </div>

                  {isExpired && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setRelistingVideo(video);
                        setRelistBoosted(false);
                        setRelistBoostDays(3);
                        setShowRelistModal(true);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "12px",
                        backgroundColor: "#059669",
                        color: "white",
                        border: "none",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontWeight: "600",
                      }}
                    >
                      <FiRefreshCw size={12} />
                      Relist
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div
          style={{
            textAlign: "center",
            padding: "40px 20px",
            color: "#666",
          }}
        >
          <p style={{ fontSize: "16px", marginBottom: "10px" }}>
            No videos uploaded yet.
          </p>
          <p style={{ fontSize: "14px", color: "#999" }}>
            Upload your first video to showcase your business!
          </p>
        </div>
      )}

      {/* Create Video Modal */}
      {showCreateVideoModal && (
        <Modal
          title="Upload New Video"
          onClose={() => setShowCreateVideoModal(false)}
        >
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "500",
                  color: "#374151",
                }}
              >
                Select Business
              </label>
              <select
                value={selectedBusinessId}
                onChange={(e) => setSelectedBusinessId(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "14px",
                }}
              >
                <option value="">Choose a business</option>
                {userBusinesses.map((business) => (
                  <option key={business.id} value={business.id}>
                    {business.name} - {business.category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "500",
                  color: "#374151",
                }}
              >
                Video Title
              </label>
              <input
                type="text"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                placeholder="Enter video title"
                maxLength={150}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "14px",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "500",
                  color: "#374151",
                }}
              >
                Video Description
              </label>
              <textarea
                value={videoDescription}
                onChange={(e) => setVideoDescription(e.target.value)}
                placeholder="Enter description of the products or service shown"
                maxLength={1000}
                rows={3}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "14px",
                  resize: "vertical",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "500",
                  color: "#374151",
                }}
              >
                Upload Video (MP4 only, max 50MB)
              </label>
              <input
                type="file"
                accept="video/mp4"
                onChange={(e) => setVideoFile(e.target.files[0])}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "14px",
                }}
              />
            </div>

            {/* Boost Switch Toggle */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "10px 0" }}>
              <span style={{ fontWeight: "500", color: "#374151" }}>🚀 Boost this video loop?</span>
              <input
                type="checkbox"
                checked={isBoosted}
                onChange={(e) => {
                  if (e.target.checked && !selectedBusiness?.isVerified) {
                    toast.error("Video boosting is only available for verified businesses");
                    return;
                  }
                  setIsBoosted(e.target.checked);
                }}
                style={{ width: "20px", height: "20px", cursor: "pointer" }}
              />
            </div>

            {isBoosted ? (
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", color: "#374151" }}>
                  Select Boost Duration
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                  <div
                    onClick={() => setBoostDays(3)}
                    style={{
                      border: boostDays === 3 ? "2px solid #7c3aed" : "1px solid #d1d5db",
                      backgroundColor: boostDays === 3 ? "#f5f3ff" : "white",
                      padding: "10px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: "20px" }}>📍</div>
                    <div style={{ fontWeight: "600", fontSize: "14px" }}>Town</div>
                    <div style={{ fontSize: "12px", color: "#6b7280" }}>3 Days</div>
                    <div style={{ fontWeight: "700", color: "#7c3aed", marginTop: "4px" }}>₦{boost3Rate.toLocaleString()}</div>
                  </div>

                  <div
                    onClick={() => setBoostDays(7)}
                    style={{
                      border: boostDays === 7 ? "2px solid #7c3aed" : "1px solid #d1d5db",
                      backgroundColor: boostDays === 7 ? "#f5f3ff" : "white",
                      padding: "10px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: "20px" }}>🏙️</div>
                    <div style={{ fontWeight: "600", fontSize: "14px" }}>City</div>
                    <div style={{ fontSize: "12px", color: "#6b7280" }}>7 Days</div>
                    <div style={{ fontWeight: "700", color: "#7c3aed", marginTop: "4px" }}>₦{boost7Rate.toLocaleString()}</div>
                  </div>

                  <div
                    onClick={() => setBoostDays(14)}
                    style={{
                      border: boostDays === 14 ? "2px solid #7c3aed" : "1px solid #d1d5db",
                      backgroundColor: boostDays === 14 ? "#f5f3ff" : "white",
                      padding: "10px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: "20px" }}>🌍</div>
                    <div style={{ fontWeight: "600", fontSize: "14px" }}>State</div>
                    <div style={{ fontSize: "12px", color: "#6b7280" }}>14 Days</div>
                    <div style={{ fontWeight: "700", color: "#7c3aed", marginTop: "4px" }}>₦{boost14Rate.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            ) : (
              <p style={{ fontSize: "12px", color: "#6b7280", fontStyle: "italic", textAlign: "center" }}>
                Standard upload costs ₦{videoListingFee.toLocaleString()} and will last for 3 days before expiration.
              </p>
            )}

            {/* Wallet Cost Info */}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px", backgroundColor: "#f3f4f6", borderRadius: "6px", fontSize: "12px" }}>
              <span>Expected Cost: <strong style={{ color: "#7c3aed" }}>₦{(isBoosted ? (boostDays === 3 ? boost3Rate : boostDays === 7 ? boost7Rate : boost14Rate) : videoListingFee).toLocaleString()}</strong></span>
              <span>Wallet Balance: <strong style={{ color: "#10b981" }}>₦{walletBalance.toLocaleString()}</strong></span>
            </div>

            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
                marginTop: "20px",
              }}
            >
              <button
                onClick={() => setShowCreateVideoModal(false)}
                style={{
                  padding: "10px 20px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  backgroundColor: "white",
                  color: "#374151",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateVideo}
                disabled={isUploading}
                style={{
                  padding: "10px 20px",
                  backgroundColor: isUploading
                    ? "#ccc"
                    : "linear-gradient(to right, purple, #D22730)",
                  background: isUploading
                    ? "#ccc"
                    : "linear-gradient(to right, purple, #D22730)",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: isUploading ? "not-allowed" : "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                {isUploading ? "Uploading..." : "Upload Video"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Relist Modal */}
      {showRelistModal && relistingVideo && (
        <Modal
          title="Relist Showroom Video"
          onClose={() => setShowRelistModal(false)}
        >
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <p style={{ fontSize: "14px", color: "#4b5563" }}>
              Relist and re-publish &quot;{relistingVideo.title}&quot; to show it back in the public Showroom feed.
            </p>

            {/* Boost Toggle */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "10px 0" }}>
              <span style={{ fontWeight: "500", color: "#374151" }}>🚀 Boost this relisted video?</span>
              <input
                type="checkbox"
                checked={relistBoosted}
                onChange={(e) => {
                  if (e.target.checked && !selectedBusiness?.isVerified) {
                    toast.error("Video boosting is only available for verified businesses");
                    return;
                  }
                  setRelistBoosted(e.target.checked);
                }}
                style={{ width: "20px", height: "20px", cursor: "pointer" }}
              />
            </div>

            {relistBoosted ? (
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", color: "#374151" }}>
                  Select Boost Duration
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                  <div
                    onClick={() => setRelistBoostDays(3)}
                    style={{
                      border: relistBoostDays === 3 ? "2px solid #7c3aed" : "1px solid #d1d5db",
                      backgroundColor: relistBoostDays === 3 ? "#f5f3ff" : "white",
                      padding: "10px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: "20px" }}>📍</div>
                    <div style={{ fontWeight: "600", fontSize: "14px" }}>Town</div>
                    <div style={{ fontSize: "12px", color: "#6b7280" }}>3 Days</div>
                    <div style={{ fontWeight: "700", color: "#7c3aed", marginTop: "4px" }}>₦{boost3Rate.toLocaleString()}</div>
                  </div>

                  <div
                    onClick={() => setRelistBoostDays(7)}
                    style={{
                      border: relistBoostDays === 7 ? "2px solid #7c3aed" : "1px solid #d1d5db",
                      backgroundColor: relistBoostDays === 7 ? "#f5f3ff" : "white",
                      padding: "10px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: "20px" }}>🏙️</div>
                    <div style={{ fontWeight: "600", fontSize: "14px" }}>City</div>
                    <div style={{ fontSize: "12px", color: "#6b7280" }}>7 Days</div>
                    <div style={{ fontWeight: "700", color: "#7c3aed", marginTop: "4px" }}>₦{boost7Rate.toLocaleString()}</div>
                  </div>

                  <div
                    onClick={() => setRelistBoostDays(14)}
                    style={{
                      border: relistBoostDays === 14 ? "2px solid #7c3aed" : "1px solid #d1d5db",
                      backgroundColor: relistBoostDays === 14 ? "#f5f3ff" : "white",
                      padding: "10px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: "20px" }}>🌍</div>
                    <div style={{ fontWeight: "600", fontSize: "14px" }}>State</div>
                    <div style={{ fontSize: "12px", color: "#6b7280" }}>14 Days</div>
                    <div style={{ fontWeight: "700", color: "#7c3aed", marginTop: "4px" }}>₦{boost14Rate.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            ) : (
              <p style={{ fontSize: "12px", color: "#6b7280", fontStyle: "italic", textAlign: "center" }}>
                Relisting without boost costs ₦{videoListingFee.toLocaleString()} and will last for 3 days before expiration.
              </p>
            )}

            {/* Wallet Cost Info */}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px", backgroundColor: "#f3f4f6", borderRadius: "6px", fontSize: "12px" }}>
              <span>Expected Cost: <strong style={{ color: "#7c3aed" }}>₦{(relistBoosted ? (relistBoostDays === 3 ? boost3Rate : relistBoostDays === 7 ? boost7Rate : boost14Rate) : videoListingFee).toLocaleString()}</strong></span>
              <span>Wallet Balance: <strong style={{ color: "#10b981" }}>₦{walletBalance.toLocaleString()}</strong></span>
            </div>

            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
                marginTop: "20px",
              }}
            >
              <button
                onClick={() => setShowRelistModal(false)}
                disabled={relistingLoading}
                style={{
                  padding: "10px 20px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  backgroundColor: "white",
                  color: "#374151",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleRelistVideo}
                disabled={relistingLoading}
                style={{
                  padding: "10px 20px",
                  backgroundColor: relistingLoading
                    ? "#ccc"
                    : "linear-gradient(to right, purple, #D22730)",
                  background: relistingLoading
                    ? "#ccc"
                    : "linear-gradient(to right, purple, #D22730)",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: relistingLoading ? "not-allowed" : "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                {relistingLoading ? "Processing..." : "Confirm Relist"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Video Player Modal */}
      {showVideoPlayerModal && selectedVideo && (
        <Modal
          title={selectedVideo.title || "Video Showcase"}
          onClose={() => setShowVideoPlayerModal(false)}
        >
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            {/* Video Player */}
            <div
              style={{
                width: "100%",
                maxWidth: "100%",
                borderRadius: "8px",
                overflow: "hidden",
                backgroundColor: "#000",
              }}
            >
              <iframe
                src={`${selectedVideo.videoUrl}?autoplay=false&loop=false&preload=true`}
                loading="lazy"
                style={{
                  border: 0,
                  width: "100%",
                  aspectRatio: "16/9",
                  display: "block",
                }}
                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Video Info */}
            <div style={{ padding: "16px 0" }}>
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#1f2937",
                  marginBottom: "8px",
                }}
              >
                {selectedVideo.title || "Showroom Video"}
              </h3>

              <p
                style={{
                  fontSize: "14px",
                  color: "#6b7280",
                  marginBottom: "8px",
                }}
              >
                {selectedVideo.description || "Watch our showroom video"}
              </p>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  fontSize: "14px",
                  color: "#4b5563",
                }}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <FiPlay
                    style={{ color: "#2563eb", marginRight: "4px" }}
                    size={14}
                  />
                  <span>{selectedVideo.views || 0} views</span>
                </div>
                <span>Duration: {selectedVideo.duration}s</span>
                {selectedVideo.boosted && (
                  <span
                    style={{
                      backgroundColor: "#fbbf24",
                      color: "#92400e",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      fontWeight: "500",
                    }}
                  >
                    ⚡ Boosted ({selectedVideo.boostTier})
                  </span>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default VideosForProfile;
