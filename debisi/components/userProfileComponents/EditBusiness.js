import Image from "next/image";
import {
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaStar,
  FaTiktok,
  FaWhatsapp,
  FaTelegram,
  FaMapMarkerAlt,
  FaEye,
  FaPlay,
  FaImages,
  FaEdit,
  FaShare,
  FaCopy,
  FaRocket,
  FaTrash,
} from "react-icons/fa";
import { HiOutlineGlobe, HiPhone, HiMail } from "react-icons/hi";
import bnwLogo from "@/images/debisi_logo_bnw.png";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Modal from "@/components/otherComponents/Modal";
import EditBusinessModal from "@/components/serverComponents/business/EditBusinessModal";
import GalleryManagementModal from "@/components/serverComponents/business/GalleryManagementModal";
import { withAuth } from "@/middlewares/withAuth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@apollo/client";
import { TRACK_ACTIVITY, PURCHASE_TOP_LISTING } from "@/graphql/queries/business/business";
import { DELETE_BUSINESS } from "@/graphql/mutations/business/business";
import { GET_MY_WALLET } from "@/graphql/queries/user/wallet";
import toast from "react-hot-toast";

function EditBusiness({ userData }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [businesses, setBusinesses] = useState([]);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [userRating, setUserRating] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pageViews, setPageViews] = useState(0);
  const [videoViews, setVideoViews] = useState(0);
  const [noticeViews, setNoticeViews] = useState(0);
  const [shares, setShares] = useState(0);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [shareMessage, setShareMessage] = useState("");
  const [trackActivity] = useMutation(TRACK_ACTIVITY);
  const [totalRatings, setTotalRatings] = useState(0);
  const [currentVideos, setCurrentVideos] = useState([]);
  const [currentNotices, setCurrentNotices] = useState([]);
  const [showEditBusinessModal, setShowEditBusinessModal] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [promoteMessage, setPromoteMessage] = useState("");
  const [isPromoting, setIsPromoting] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState(null);
  const [promoteDays, setPromoteDays] = useState(7);

  const { data: walletData, refetch: refetchWallet } = useQuery(GET_MY_WALLET, {
    fetchPolicy: "network-only",
  });
  const walletBalance = walletData?.myWallet?.balance || 0;

  const [purchaseTopListing] = useMutation(PURCHASE_TOP_LISTING, {
    onCompleted: () => {
      toast.success("Business promoted successfully!");
      refetchWallet?.();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to promote business.");
    },
  });

  const getPromoCost = (days) => {
    const cost = days * 500;
    if (days === 7) return cost * 0.9;
    if (days === 14) return cost * 0.85;
    if (days === 30) return cost * 0.8;
    return cost;
  };
  const [showDeleteBusinessModal, setShowDeleteBusinessModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const [deleteBusiness, { loading: deletingBusiness }] = useMutation(DELETE_BUSINESS, {
    onCompleted: (data) => {
      if (data?.deleteBusiness) {
        toast.success("Business deleted successfully.");
        window.location.reload();
      } else {
        toast.error("Failed to delete business.");
      }
    },
    onError: (error) => {
      toast.error(error.message || "An error occurred while deleting the business.");
    },
  });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (userData?.businesses) {
      setBusinesses(userData.businesses);
      setLoading(false);
    }
  }, [userData]);

  const getSocialIcon = (type, url) => {
    const baseProps = {
      href: url,
      target: "_blank",
      rel: "noopener noreferrer",
    };

    const iconStyle = {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "50px",
      height: "50px",
      borderRadius: "50%",
      color: "white",
      fontSize: "20px",
      textDecoration: "none",
      transition: "all 0.3s ease",
      boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
    };

    const hoverStyle = {
      transform: "translateY(-3px) scale(1.1)",
      boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
    };

    switch (type) {
      case "INSTAGRAM":
        return (
          <a
            {...baseProps}
            style={{
              ...iconStyle,
              background: "linear-gradient(135deg, #e4405f 0%, #c13584 100%)",
              boxShadow: "0 5px 15px rgba(228, 64, 95, 0.3)",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = hoverStyle.transform;
              e.target.style.boxShadow = "0 8px 20px rgba(228, 64, 95, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0) scale(1)";
              e.target.style.boxShadow = "0 5px 15px rgba(228, 64, 95, 0.3)";
            }}
          >
            <FaInstagram />
          </a>
        );
      case "FACEBOOK":
        return (
          <a
            {...baseProps}
            style={{
              ...iconStyle,
              background: "linear-gradient(135deg, #1877f2 0%, #0d6efd 100%)",
              boxShadow: "0 5px 15px rgba(24, 119, 242, 0.3)",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = hoverStyle.transform;
              e.target.style.boxShadow = "0 8px 20px rgba(24, 119, 242, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0) scale(1)";
              e.target.style.boxShadow = "0 5px 15px rgba(24, 119, 242, 0.3)";
            }}
          >
            <FaFacebook />
          </a>
        );
      case "TWITTER":
        return (
          <a
            {...baseProps}
            style={{
              ...iconStyle,
              background: "linear-gradient(135deg, #1da1f2 0%, #0ea5e9 100%)",
              boxShadow: "0 5px 15px rgba(29, 161, 242, 0.3)",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = hoverStyle.transform;
              e.target.style.boxShadow = "0 8px 20px rgba(29, 161, 242, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0) scale(1)";
              e.target.style.boxShadow = "0 5px 15px rgba(29, 161, 242, 0.3)";
            }}
          >
            <FaTwitter />
          </a>
        );
      case "TIKTOK":
        return (
          <a
            {...baseProps}
            style={{
              ...iconStyle,
              background: "linear-gradient(135deg, #000000 0%, #25f4ee 100%)",
              boxShadow: "0 5px 15px rgba(0, 0, 0, 0.3)",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = hoverStyle.transform;
              e.target.style.boxShadow = "0 8px 20px rgba(0, 0, 0, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0) scale(1)";
              e.target.style.boxShadow = "0 5px 15px rgba(0, 0, 0, 0.3)";
            }}
          >
            <FaTiktok />
          </a>
        );
      case "WHATSAPP":
        return (
          <a
            {...baseProps}
            style={{
              ...iconStyle,
              background: "linear-gradient(135deg, #25d366 0%, #128c7e 100%)",
              boxShadow: "0 5px 15px rgba(37, 211, 102, 0.3)",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = hoverStyle.transform;
              e.target.style.boxShadow = "0 8px 20px rgba(37, 211, 102, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0) scale(1)";
              e.target.style.boxShadow = "0 5px 15px rgba(37, 211, 102, 0.3)";
            }}
          >
            <FaWhatsapp />
          </a>
        );
      case "TELEGRAM":
        return (
          <a
            {...baseProps}
            style={{
              ...iconStyle,
              background: "linear-gradient(135deg, #0088cc 0%, #229ed9 100%)",
              boxShadow: "0 5px 15px rgba(0, 136, 204, 0.3)",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = hoverStyle.transform;
              e.target.style.boxShadow = "0 8px 20px rgba(0, 136, 204, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0) scale(1)";
              e.target.style.boxShadow = "0 5px 15px rgba(0, 136, 204, 0.3)";
            }}
          >
            <FaTelegram />
          </a>
        );
      case "WEBSITE":
        return (
          <a
            {...baseProps}
            style={{
              ...iconStyle,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              boxShadow: "0 5px 15px rgba(102, 126, 234, 0.3)",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = hoverStyle.transform;
              e.target.style.boxShadow = "0 8px 20px rgba(102, 126, 234, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0) scale(1)";
              e.target.style.boxShadow = "0 5px 15px rgba(102, 126, 234, 0.3)";
            }}
          >
            <HiOutlineGlobe />
          </a>
        );
      default:
        return null;
    }
  };

  const handleCopy = (slug) => {
    navigator.clipboard.writeText(`https://debisi.ng/${slug}`);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 1500);
  };

  const getBusinessUrl = (biz) => `https://debisi.ng/${biz.slug}`;

  // Helper to format Business sharing messages, matching BusinessView.js style
  const formatBusinessShareText = (biz, options = {}) => {
    const ratingList = biz?.reviews || [];
    const totalRatings = ratingList.length;
    const avgRating =
      totalRatings > 0
        ? (
            ratingList.reduce((acc, r) => acc + Number(r.rating || 0), 0) /
            totalRatings
          ).toFixed(1)
        : "0.0";

    const ratingText = totalRatings > 0
      ? `⭐ *Rating:* ${avgRating}/5 (${totalRatings} ${totalRatings === 1 ? 'review' : 'reviews'})`
      : `⭐ *Rating:* Be the first to review!`;

    const categoryText = biz?.category ? `📁 *Category:* ${biz.category}` : "";
    
    const addr = biz?.addresses?.[0];
    const location = addr
      ? `${addr.town || addr.city || ""} ${addr.lg || ""}`.trim() || "Location not available"
      : "Location not available";
    const locationText = location && location !== "Location not available" ? `📍 *Location:* ${location}` : "";
    
    const descriptionSnippet = biz?.description
      ? biz.description.slice(0, 160) + (biz.description.length > 160 ? "…" : "")
      : "";
    const aboutText = descriptionSnippet ? `📝 *About:*\n"${descriptionSnippet}"` : "";

    const shareUrl = `https://debisi.ng/${biz?.slug || ""}`;

    if (options.isTwitter) {
      return `Discover ${biz?.name} on Debisi! 🏢\n${ratingText.replace(/\*/g, "")}\n${biz?.category ? `📁 ${biz.category} ` : ""}${location && location !== "Location not available" ? `📍 ${location}` : ""}\n\n${descriptionSnippet.slice(0, 100)}`;
    }

    if (options.isWhatsApp) {
      const parts = [
        `✨ *Discover ${biz?.name} on Debisi!* 🏢`,
        "",
        ratingText,
        categoryText || null,
        locationText || null,
        "",
        aboutText || null,
        "",
        `📞 *View details & contact them here:*`,
        `🔗 ${shareUrl}`,
        "",
        `---`,
        `💡 _List your business on Debisi today to get noticed and grow!_ 🚀`,
      ];
      return parts.filter((p) => p !== null).join("\n").replace(/\n{3,}/g, "\n\n");
    }

    if (options.isFacebook) {
      const parts = [
        `✨ Discover ${biz?.name} on Debisi! 🏢`,
        "",
        ratingText.replace(/\*/g, ""),
        categoryText.replace(/\*/g, "") || null,
        locationText.replace(/\*/g, "") || null,
        "",
        aboutText.replace(/\*/g, "") || null,
        "",
        `📌 Click below to view details and contact them:`,
        shareUrl,
        "",
        `---`,
        `💡 Grow your business too! Register on Debisi to reach thousands of customers. 🚀`,
      ];
      return parts.filter((p) => p !== null).join("\n").replace(/\n{3,}/g, "\n\n");
    }

    // Default / Clipboard / Native share
    const parts = [
      `✨ Discover ${biz?.name} on Debisi! 🏢`,
      "",
      ratingText.replace(/\*/g, ""),
      categoryText.replace(/\*/g, "") || null,
      locationText.replace(/\*/g, "") || null,
      "",
      aboutText.replace(/\*/g, "") || null,
      "",
      `📌 View details & contact them here:`,
      `🔗 ${shareUrl}`,
      "",
      `---`,
      `💡 Grow your business too! Register on Debisi to reach thousands of customers. 🚀`,
    ];
    return parts.filter((p) => p !== null).join("\n").replace(/\n{3,}/g, "\n\n");
  };

  const handleShare = async (biz) => {
    setSelectedBusiness(biz);
    const text = formatBusinessShareText(biz);
    const shareUrl = `https://debisi.ng/${biz?.slug || ""}`;
    const shareData = {
      title: `${biz?.name} - Debisi`,
      text: text,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        
        try {
          await trackActivity({
            variables: { input: { businessId: biz.id, activityType: "SHARE" } },
          });
        } catch (err) {
          console.error("Track activity failed:", err);
        }

        // Update local shares count state
        setBusinesses((prev) =>
          prev.map((b) =>
            b.id === biz.id ? { ...b, shares: (b.shares || 0) + 1 } : b
          )
        );
        setShares((prev) => prev + 1);
        setShareMessage("Shared successfully!");
        setTimeout(() => setShareMessage(""), 3000);
      } else {
        setShowShareOptions(true);
      }
    } catch (error) {
      if (error?.name !== "AbortError") {
        setShowShareOptions(true);
      }
    }
  };

  const copyToClipboard = async () => {
    if (!selectedBusiness) return;
    const text = formatBusinessShareText(selectedBusiness);
    try {
      await navigator.clipboard.writeText(text);
      try {
        await trackActivity({
          variables: { input: { businessId: selectedBusiness.id, activityType: "SHARE" } },
        });
      } catch (err) {
        console.error("Track activity failed:", err);
      }
      
      setBusinesses((prev) =>
        prev.map((b) =>
          b.id === selectedBusiness.id ? { ...b, shares: (b.shares || 0) + 1 } : b
        )
      );
      setShares((prev) => prev + 1);
      setShareMessage("Link copied to clipboard!");
      setTimeout(() => setShareMessage(""), 3000);
      setShowShareOptions(false);
    } catch (error) {
      setShareMessage("Failed to copy link");
      setTimeout(() => setShareMessage(""), 3000);
    }
  };

  const shareOnWhatsApp = async () => {
    if (!selectedBusiness) return;
    const text = formatBusinessShareText(selectedBusiness, { isWhatsApp: true });
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    try {
      await trackActivity({
        variables: { input: { businessId: selectedBusiness.id, activityType: "SHARE" } },
      });
    } catch (err) {
      console.error("Track activity failed:", err);
    }
    
    setBusinesses((prev) =>
      prev.map((b) =>
        b.id === selectedBusiness.id ? { ...b, shares: (b.shares || 0) + 1 } : b
      )
    );
    setShares((prev) => prev + 1);
    setShareMessage("Opening WhatsApp...");
    setTimeout(() => setShareMessage(""), 3000);
    setShowShareOptions(false);
  };

  const shareOnFacebook = async () => {
    if (!selectedBusiness) return;
    const quote = encodeURIComponent(formatBusinessShareText(selectedBusiness, { isFacebook: true }));
    const url = encodeURIComponent(`https://debisi.ng/${selectedBusiness.slug || ""}`);
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${quote}`,
      "_blank",
    );
    try {
      await trackActivity({
        variables: { input: { businessId: selectedBusiness.id, activityType: "SHARE" } },
      });
    } catch (err) {
      console.error("Track activity failed:", err);
    }
    
    setBusinesses((prev) =>
      prev.map((b) =>
        b.id === selectedBusiness.id ? { ...b, shares: (b.shares || 0) + 1 } : b
      )
    );
    setShares((prev) => prev + 1);
    setShareMessage("Opening Facebook...");
    setTimeout(() => setShareMessage(""), 3000);
    setShowShareOptions(false);
  };

  const shareOnTwitter = async () => {
    if (!selectedBusiness) return;
    const tweetText = encodeURIComponent(formatBusinessShareText(selectedBusiness, { isTwitter: true }));
    const url = encodeURIComponent(`https://debisi.ng/${selectedBusiness.slug || ""}`);
    window.open(
      `https://twitter.com/intent/tweet?text=${tweetText}&url=${url}`,
      "_blank",
    );
    try {
      await trackActivity({
        variables: { input: { businessId: selectedBusiness.id, activityType: "SHARE" } },
      });
    } catch (err) {
      console.error("Track activity failed:", err);
    }
    
    setBusinesses((prev) =>
      prev.map((b) =>
        b.id === selectedBusiness.id ? { ...b, shares: (b.shares || 0) + 1 } : b
      )
    );
    setShares((prev) => prev + 1);
    setShareMessage("Opening Twitter...");
    setTimeout(() => setShareMessage(""), 3000);
    setShowShareOptions(false);
  };

  const openPromoteModal = (business) => {
    setSelectedBusiness(business);
    setPromoteDays(7);
    setShowPromoteModal(true);
    setPromoteMessage("");
  };

  const handlePromote = async (businessId) => {
    const cost = getPromoCost(promoteDays);
    if (walletBalance < cost) {
      toast.error("Insufficient wallet balance. Please fund your wallet first.");
      return;
    }

    setIsPromoting(true);
    setPromoteMessage("Processing promotion...");

    try {
      await purchaseTopListing({
        variables: {
          input: {
            businessId,
            type: "BUSINESS_TOPLIST",
            days: parseInt(promoteDays),
          },
        },
      });

      setPromoteMessage(
        "Business promoted successfully! Your business will now appear in the top list.",
      );
      setTimeout(() => {
        setPromoteMessage("");
        setShowPromoteModal(false);
        setIsPromoting(false);
      }, 3000);
    } catch (error) {
      setPromoteMessage(error.message || "Failed to promote business. Please try again.");
      setTimeout(() => {
        setPromoteMessage("");
        setIsPromoting(false);
      }, 3000);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          margin: "0 auto",
          background: "white",
          borderRadius: "20px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
          padding: "40px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "18px",
            color: "#667eea",
            fontWeight: "600",
          }}
        >
          Loading businesses...
        </div>
      </div>
    );
  }

  if (!businesses || businesses.length === 0) {
    return (
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          margin: "0 auto",
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
          dashboard to manage and promote it.
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
    );
  }

  return (
    <>
      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(min(100%, 400px), 1fr))",
          gap: "20px",
          padding: "15px",
        }}
      >
        {businesses.map((biz, index) => (
          <div
            key={biz.id || index}
            style={{
              width: "100%",
              maxWidth: "400px",
              margin: "0 auto",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              borderRadius: "20px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
              overflow: "hidden",
              position: "relative",
            }}
          >
            {/* Hero Section with Gradient Overlay */}
            <div
              style={{
                position: "relative",
                padding: "40px 30px",
                textAlign: "center",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
              }}
            >
              {/* Go To Icon Button */}
              {/* <Link href={`/${biz.slug}`}>
        <button
          style={{
            position: 'absolute',
            top: 18,
            right: 18,
            zIndex: 3,
            background: 'rgba(255,255,255,0.15)',
            border: 'none',
            borderRadius: '50%',
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background 0.2s',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}
          title="Go to business page"
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
        >
          <CiShare1 style={{ color: 'white', fontSize: 20 }} />
        </button></Link> */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "rgba(0,0,0,0.3)",
                  zIndex: 1,
                }}
              ></div>

              <div style={{ position: "relative", zIndex: 2 }}>
                <h1
                  style={{
                    fontSize: "clamp(20px, 5vw, 28px)",
                    fontWeight: "bold",
                    margin: "0 0 10px 0",
                    textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    width: "100%",
                    minWidth: 0,
                    overflow: "hidden",
                  }}
                >
                  <span
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      flex: "1 1 0",
                      minWidth: 0,
                      maxWidth: biz.isVerified ? "calc(100% - 32px)" : "100%",
                    }}
                    title={biz.name}
                  >
                    {biz.name}
                  </span>
                  {biz.isVerified && (
                    <span
                      style={{
                        color: "#60a5fa",
                        display: "inline-flex",
                        alignItems: "center",
                        flexShrink: 0,
                      }}
                      title="Verified Business"
                    >
                      <svg
                        style={{ width: "24px", height: "24px" }}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.64.304 1.25.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  )}
                </h1>
                <p
                  style={{
                    fontSize: "16px",
                    margin: "0 0 25px 0",
                    opacity: 0.9,
                    lineHeight: "1.5",
                  }}
                >
                  {biz.description}
                </p>

                <div
                  style={{
                    display: "flex",
                    gap: "15px",
                    justifyContent: "center",
                    flexWrap: "wrap",
                  }}
                >
                  {biz.contactUrls && (
                    <a
                      href={
                        biz.contactUrls.find((contact) => contact.isPrimary)
                          ?.url || "#"
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: "12px 30px",
                        background: "rgba(255,255,255,0.2)",
                        border: "2px solid rgba(255,255,255,0.3)",
                        borderRadius: "25px",
                        color: "white",
                        fontSize: "16px",
                        fontWeight: "600",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        backdropFilter: "blur(10px)",
                        textDecoration: "none",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = "rgba(255,255,255,0.3)";
                        e.target.style.transform = "translateY(-2px)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = "rgba(255,255,255,0.2)";
                        e.target.style.transform = "translateY(0)";
                      }}
                    >
                      Contact Us
                    </a>
                  )}

                  <button
                    onClick={
                      biz.isVerified
                        ? () => openPromoteModal(biz)
                        : () =>
                            router.push(
                              `/dashboard/${userData?.id}?tab=verification&businessId=${biz.id}`,
                            )
                    }
                    style={{
                      padding: "12px 30px",
                      background:
                        "linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)",
                      border: "2px solid rgba(255,255,255,0.3)",
                      borderRadius: "25px",
                      color: "white",
                      fontSize: "16px",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      backdropFilter: "blur(10px)",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = "translateY(-2px)";
                      e.target.style.boxShadow =
                        "0 8px 20px rgba(255, 107, 107, 0.4)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow = "none";
                    }}
                  >
                    <FaRocket style={{ fontSize: "14px" }} />
                    {biz.isVerified ? "Promote" : "Verify before Promote"}
                  </button>
                </div>

                {shareMessage && (
                  <div
                    style={{
                      marginTop: "15px",
                      padding: "8px 16px",
                      background: "rgba(255,255,255,0.9)",
                      color: "#333",
                      borderRadius: "20px",
                      fontSize: "14px",
                      fontWeight: "500",
                      animation: "fadeIn 0.3s ease",
                    }}
                  >
                    {shareMessage}
                  </div>
                )}
              </div>
            </div>



            {/* Promote Business Modal */}
            {mounted && showPromoteModal && selectedBusiness?.id === biz.id && createPortal(
              <div
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "rgba(0,0,0,0.55)",
                  backdropFilter: "blur(4px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 999999,
                }}
                onClick={() => !isPromoting && setShowPromoteModal(false)}
              >
                <div
                  style={{
                    background: "white",
                    borderRadius: "20px",
                    padding: "30px",
                    maxWidth: "400px",
                    width: "90%",
                    maxHeight: "90dvh",
                    overflowY: "auto",
                    textAlign: "center",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "20px",
                    }}
                  >
                    <FaRocket
                      style={{
                        fontSize: "32px",
                        color: "#ff6b6b",
                        marginRight: "10px",
                      }}
                    />
                    <h3
                      style={{
                        fontSize: "24px",
                        fontWeight: "600",
                        color: "#333",
                        margin: 0,
                      }}
                    >
                      Promote Your Business
                    </h3>
                  </div>

                  <p
                    style={{
                      fontSize: "16px",
                      color: "#666",
                      lineHeight: "1.6",
                      marginBottom: "25px",
                    }}
                  >
                    Boost your business visibility! Promote your business to
                    appear in the top list where other users can discover you.
                  </p>

                  <div
                    style={{
                      background:
                        "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
                      borderRadius: "15px",
                      padding: "20px",
                      marginBottom: "25px",
                      border: "2px solid #dee2e6",
                    }}
                  >
                    <h4
                      style={{
                        fontSize: "18px",
                        fontWeight: "600",
                        color: "#333",
                        margin: "0 0 15px 0",
                      }}
                    >
                      Promotion Benefits:
                    </h4>
                    <ul
                      style={{
                        textAlign: "left",
                        margin: 0,
                        paddingLeft: "20px",
                        color: "#555",
                      }}
                    >
                      <li style={{ marginBottom: "8px" }}>
                        Featured in top business listings
                      </li>
                      <li style={{ marginBottom: "8px" }}>
                        Increased visibility to potential customers
                      </li>
                      <li style={{ marginBottom: "8px" }}>
                        Higher chance of getting discovered
                      </li>
                      <li style={{ marginBottom: "8px" }}>
                        Priority placement in search results
                      </li>
                    </ul>
                  </div>

                  <div style={{ marginBottom: "20px", textAlign: "left" }}>
                    <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#333", marginBottom: "8px" }}>
                      Select Promotion Duration
                    </label>
                    <select
                      value={promoteDays}
                      onChange={(e) => setPromoteDays(parseInt(e.target.value))}
                      style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: "10px",
                        border: "1px solid #dee2e6",
                        background: "#fff",
                        fontSize: "15px",
                        fontWeight: "500",
                        color: "#495057"
                      }}
                    >
                      <option value={7}>7 Days (10% Discount) — ₦3,150</option>
                      <option value={14}>14 Days (15% Discount) — ₦5,950</option>
                      <option value={30}>30 Days (20% Discount) — ₦12,000</option>
                    </select>
                  </div>

                  {/* Display balance & cost */}
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#555",
                    marginBottom: "20px",
                    padding: "10px 14px",
                    background: "#f1f3f5",
                    borderRadius: "10px"
                  }}>
                    <div>
                      <span>Wallet Balance: </span>
                      <span style={{ color: walletBalance >= getPromoCost(promoteDays) ? "#2b8a3e" : "#c92a2a" }}>
                        ₦{walletBalance.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span>Total Cost: </span>
                      <span style={{ color: "#1c7ed6" }}>
                        ₦{getPromoCost(promoteDays).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {walletBalance < getPromoCost(promoteDays) && (
                    <div style={{
                      padding: "12px",
                      background: "#fff5f5",
                      color: "#c92a2a",
                      borderRadius: "10px",
                      fontSize: "13px",
                      fontWeight: "500",
                      marginBottom: "20px",
                      border: "1px solid #ffc9c9",
                      textAlign: "left"
                    }}>
                      ⚠️ Insufficient wallet balance. Please fund your wallet to proceed.
                    </div>
                  )}

                  {promoteMessage && (
                    <div
                      style={{
                        padding: "12px 16px",
                        background: promoteMessage.includes("successfully")
                          ? "#d4edda"
                          : "#f8d7da",
                        color: promoteMessage.includes("successfully")
                          ? "#155724"
                          : "#721c24",
                        borderRadius: "10px",
                        marginBottom: "20px",
                        fontSize: "14px",
                        fontWeight: "500",
                      }}
                    >
                      {promoteMessage}
                    </div>
                  )}

                  <div
                    style={{
                      display: "flex",
                      gap: "15px",
                      justifyContent: "center",
                    }}
                  >
                    {walletBalance >= getPromoCost(promoteDays) ? (
                      <button
                        onClick={() => handlePromote(biz.id)}
                        disabled={isPromoting}
                        style={{
                          padding: "12px 30px",
                          background: isPromoting
                            ? "#ccc"
                            : "linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)",
                          border: "none",
                          borderRadius: "15px",
                          color: "white",
                          fontSize: "16px",
                          fontWeight: "600",
                          cursor: isPromoting ? "not-allowed" : "pointer",
                          transition: "all 0.3s ease",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          opacity: isPromoting ? 0.7 : 1,
                        }}
                        onMouseEnter={(e) => {
                          if (!isPromoting) {
                            e.target.style.transform = "translateY(-2px)";
                            e.target.style.boxShadow =
                              "0 8px 20px rgba(255, 107, 107, 0.4)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isPromoting) {
                            e.target.style.transform = "translateY(0)";
                            e.target.style.boxShadow = "none";
                          }
                        }}
                      >
                        {isPromoting ? (
                          <>
                            <div
                              style={{
                                width: "16px",
                                height: "16px",
                                border: "2px solid #fff",
                                borderTop: "2px solid transparent",
                                borderRadius: "50%",
                                animation: "spin 1s linear infinite",
                              }}
                            ></div>
                            Promoting...
                          </>
                        ) : (
                          <>
                            <FaRocket style={{ fontSize: "14px" }} />
                            Promote Now
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setShowPromoteModal(false);
                          router.push(`/dashboard/${userData?.id}?tab=wallet`);
                        }}
                        style={{
                          padding: "12px 30px",
                          background: "#e0e0e0",
                          border: "none",
                          borderRadius: "15px",
                          color: "#555",
                          fontSize: "16px",
                          fontWeight: "600",
                          cursor: "pointer",
                          transition: "all 0.3s ease"
                        }}
                      >
                        Fund Wallet
                      </button>
                    )}

                    <button
                      onClick={() => setShowPromoteModal(false)}
                      disabled={isPromoting}
                      style={{
                        padding: "12px 30px",
                        background: "#f8f9fa",
                        border: "1px solid #dee2e6",
                        borderRadius: "15px",
                        color: "#6c757d",
                        fontSize: "16px",
                        fontWeight: "600",
                        cursor: isPromoting ? "not-allowed" : "pointer",
                        transition: "all 0.3s ease",
                        opacity: isPromoting ? 0.7 : 1,
                      }}
                      onMouseEnter={(e) => {
                        if (!isPromoting) {
                          e.target.style.background = "#e9ecef";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isPromoting) {
                          e.target.style.background = "#f8f9fa";
                        }
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>,
              document.body
            )}

            {/* Main Image Section */}
            <div
              style={{
                padding: "30px",
                background: "white",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  position: "relative",
                  borderRadius: "15px",
                  overflow: "hidden",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                  aspectRatio: "16/9",
                }}
              >
                <Image
                  src={(() => {
                    const logoUrl = biz.images?.find(
                      (img) => img.isLogo,
                    )?.imageUrl;
                    return typeof logoUrl === "string" && logoUrl.trim() !== ""
                      ? logoUrl
                      : bnwLogo;
                  })()}
                  alt={biz.name}
                  fill
                  unoptimized
                  style={{
                    borderRadius: "15px",
                    objectFit: "cover",
                  }}
                  onError={(e) => {
                    e.currentTarget.src = bnwLogo.src || bnwLogo;
                  }}
                />
              </div>
            </div>

            {/* Address Section */}
            <div
              style={{
                padding: "25px 30px",
                background: "white",
                textAlign: "center",
                borderTop: "1px solid #f0f0f0",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "15px",
                }}
              >
                <FaMapMarkerAlt
                  style={{
                    color: "#667eea",
                    marginRight: "8px",
                    fontSize: "20px",
                  }}
                />
                <h2
                  style={{
                    fontSize: "20px",
                    fontWeight: "600",
                    color: "#333",
                    margin: 0,
                  }}
                >
                  Our Location
                </h2>
              </div>
              {biz.addresses?.map((addr, idx) => (
                <div
                  key={idx}
                  style={{
                    color: "#666",
                    margin: "0 0 10px 0",
                    fontSize: "16px",
                    lineHeight: "1.5",
                  }}
                >
                  {addr.address1 && (
                    <p style={{ margin: "0 0 5px 0" }}>
                      Headquarters: {addr.address1}
                    </p>
                  )}
                  {addr.address2 && (
                    <p style={{ margin: "0 0 5px 0" }}>
                      Branch: {addr.address2}
                    </p>
                  )}
                </div>
              ))}
              {biz.addresses?.[0]?.address1 && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    biz.addresses[0].address1,
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-block",
                    padding: "12px 25px",
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                    borderRadius: "25px",
                    textDecoration: "none",
                    fontWeight: "600",
                    fontSize: "14px",
                    transition: "all 0.3s ease",
                    boxShadow: "0 5px 15px rgba(102, 126, 234, 0.3)",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow =
                      "0 8px 20px rgba(102, 126, 234, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow =
                      "0 5px 15px rgba(102, 126, 234, 0.3)";
                  }}
                >
                  View on Google Maps
                </a>
              )}
            </div>

            {/* Social URLs Section */}
            <div
              style={{
                padding: "25px 30px",
                background: "white",
                textAlign: "center",
                borderTop: "1px solid #f0f0f0",
              }}
            >
              <h2
                style={{
                  fontSize: "20px",
                  fontWeight: "600",
                  color: "#333",
                  margin: "0 0 20px 0",
                }}
              >
                Follow Us
              </h2>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "20px",
                  flexWrap: "wrap",
                }}
              >
                {biz.contactUrls?.map((link, idx) => (
                  <span key={idx}>{getSocialIcon(link.type, link.url)}</span>
                ))}
              </div>
            </div>

            {/* Shares Section */}
            <div
              style={{
                padding: "25px 30px",
                background: "white",
                textAlign: "center",
                borderTop: "1px solid #f0f0f0",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "15px",
                }}
              >
                <FaShare
                  style={{
                    color: "#667eea",
                    marginRight: "10px",
                    fontSize: "20px",
                  }}
                />
                <h2
                  style={{
                    fontSize: "20px",
                    fontWeight: "600",
                    color: "#333",
                    margin: 0,
                  }}
                >
                  Share
                </h2>
              </div>
              <div
                style={{
                  textAlign: "center",
                  padding: "20px",
                  background: "#f8f9fa",
                  borderRadius: "10px",
                  border: "2px dashed #dee2e6",
                  marginBottom: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                <p
                  style={{
                    color: "#6c757d",
                    margin: 0,
                    fontSize: "14px",
                  }}
                >
                  https://debisi.ng/{biz.slug}
                </p>

                <FaCopy
                  onClick={() => handleCopy(biz.slug)}
                  style={{ cursor: "pointer", color: "#6c757d" }}
                  title="Copy to clipboard"
                />

                {copiedSlug === biz.slug && (
                  <span style={{ fontSize: "12px", color: "green" }}>
                    Copied!
                  </span>
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "15px",
                }}
              >
                <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", justifyContent: "center" }}>
                  <div
                    style={{
                      display: "inline-block",
                      padding: "15px 30px",
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      borderRadius: "15px",
                      color: "white",
                      fontSize: "18px",
                      fontWeight: "bold",
                      boxShadow: "0 5px 15px rgba(102, 126, 234, 0.3)",
                    }}
                  >
                    {biz.shares || 0} Total Shares
                  </div>

                  {(biz.isVerified || (biz.followerCount > 0)) && (
                    <div
                      style={{
                        display: "inline-block",
                        padding: "15px 30px",
                        background:
                          "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                        borderRadius: "15px",
                        color: "white",
                        fontSize: "18px",
                        fontWeight: "bold",
                        boxShadow: "0 5px 15px rgba(16, 185, 129, 0.3)",
                      }}
                    >
                      {biz.followerCount || 0} Followers
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleShare(biz)}
                  style={{
                    padding: "8px 16px",
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    border: "none",
                    borderRadius: "20px",
                    color: "white",
                    fontSize: "12px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    boxShadow: "0 3px 10px rgba(102, 126, 234, 0.3)",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "translateY(-2px) scale(1.05)";
                    e.target.style.boxShadow =
                      "0 5px 15px rgba(102, 126, 234, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0) scale(1)";
                    e.target.style.boxShadow =
                      "0 3px 10px rgba(102, 126, 234, 0.3)";
                  }}
                >
                  <FaShare style={{ fontSize: "10px" }} />
                  Share Now
                </button>
              </div>
            </div>

            {/* Gallery Section */}
            <div
              style={{
                padding: "25px 30px",
                background: "white",
                borderTop: "1px solid #f0f0f0",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "20px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <FaImages
                    style={{
                      color: "#667eea",
                      marginRight: "10px",
                      fontSize: "20px",
                    }}
                  />
                  <h2
                    style={{
                      fontSize: "20px",
                      fontWeight: "600",
                      color: "#333",
                      margin: 0,
                    }}
                  >
                    Gallery
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setSelectedBusiness(biz);
                    setShowGalleryModal(true);
                  }}
                  style={{
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                    border: "none",
                    borderRadius: "50%",
                    width: "30px",
                    height: "30px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(102, 126, 234, 0.3)",
                    fontSize: "18px",
                    fontWeight: "bold",
                  }}
                  title="Manage Gallery"
                >
                  +
                </button>
              </div>

              {biz.images?.filter(
                (img) =>
                  !img.isLogo && img.imageUrl && img.imageUrl.trim() !== "",
              ).length > 0 ? (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                    gap: "15px",
                    justifyItems: "center",
                  }}
                >
                  {biz.images
                    .filter(
                      (img) =>
                        !img.isLogo &&
                        img.imageUrl &&
                        img.imageUrl.trim() !== "",
                    )
                    .slice(0, 4)
                    .map((image) => (
                      <div
                        key={image.id}
                        style={{
                          width: "100%",
                          aspectRatio: "1",
                          position: "relative",
                          borderRadius: "15px",
                          overflow: "hidden",
                          boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
                          cursor: "pointer",
                          transition: "transform 0.3s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "scale(1.05)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "scale(1)";
                        }}
                      >
                        <Image
                          src={image.imageUrl}
                          alt="Gallery Item"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                          width={800}
                          height={800}
                          onError={(e) => {
                            e.target.src = bnwLogo.src || bnwLogo;
                          }}
                        />
                      </div>
                    ))}
                </div>
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: "20px",
                    background: "#f8f9fa",
                    borderRadius: "10px",
                    border: "2px dashed #dee2e6",
                  }}
                >
                  <p style={{ color: "#6c757d", margin: 0, fontSize: "14px" }}>
                    No images uploaded
                  </p>
                </div>
              )}
            </div>

            {/* Ratings Section */}
            {(() => {
              const reviewsList = biz.reviews || [];
              const bizRating =
                reviewsList.length > 0
                  ? reviewsList.reduce(
                      (acc, r) => acc + Number(r.rating || 0),
                      0,
                    ) / reviewsList.length
                  : 0;
              const bizTotalReviews = reviewsList.length;

              return (
                <div
                  style={{
                    padding: "25px 30px",
                    background: "white",
                    textAlign: "center",
                    borderTop: "1px solid #f0f0f0",
                  }}
                >
                  <h2
                    style={{
                      fontSize: "20px",
                      fontWeight: "600",
                      color: "#333",
                      margin: "0 0 15px 0",
                    }}
                  >
                    Customer Ratings
                  </h2>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      marginBottom: "10px",
                      fontSize: "24px",
                      color: "#ffd700",
                    }}
                  >
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar
                        key={star}
                        style={{
                          color:
                            star <= Math.floor(bizRating) ? "#ffd700" : "#ddd",
                          margin: "0 2px",
                        }}
                      />
                    ))}
                  </div>

                  <p
                    style={{
                      color: "#666",
                      margin: "0 0 5px 0",
                      fontSize: "16px",
                      fontWeight: "500",
                    }}
                  >
                    Rated {bizRating.toFixed(1)}/5 by customers
                  </p>

                  <p
                    style={{
                      color: "#888",
                      margin: "0 0 20px 0",
                      fontSize: "14px",
                    }}
                  >
                    Total Ratings: {bizTotalReviews}
                  </p>
                </div>
              );
            })()}

            {/* Action Buttons */}
            <div style={{ display: "flex", width: "100%" }}>
              {/* Edit Business Button */}
              <button
                type="button"
                style={{
                  flex: 1,
                  padding: "15px",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  border: "none",
                  color: "white",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  boxShadow: "0 5px 15px rgba(102, 126, 234, 0.2)",
                  borderRight: "1px solid rgba(255, 255, 255, 0.1)",
                }}
                onClick={() => {
                  setSelectedBusiness(biz);
                  setShowEditBusinessModal(true);
                }}
                onMouseEnter={(e) => {
                  e.target.style.filter = "brightness(1.1)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.filter = "none";
                }}
              >
                <FaEdit style={{ fontSize: "18px" }} />
                Edit
              </button>

              {/* Delete Business Button */}
              <button
                type="button"
                style={{
                  flex: 1,
                  padding: "15px",
                  background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)",
                  border: "none",
                  color: "white",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  boxShadow: "0 5px 15px rgba(255, 107, 107, 0.2)",
                }}
                onClick={() => {
                  setSelectedBusiness(biz);
                  setShowDeleteBusinessModal(true);
                }}
                onMouseEnter={(e) => {
                  e.target.style.filter = "brightness(1.1)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.filter = "none";
                }}
              >
                <FaTrash style={{ fontSize: "18px" }} />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedBusiness && (
        <>
          {showShareOptions && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(0,0,0,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
              }}
              onClick={() => {
                setShowShareOptions(false);
                setSelectedBusiness(null);
              }}
            >
              <div
                style={{
                  background: "white",
                  borderRadius: "20px",
                  padding: "30px",
                  maxWidth: "300px",
                  width: "90%",
                  textAlign: "center",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <h3
                  style={{
                    fontSize: "20px",
                    fontWeight: "600",
                    color: "#333",
                    margin: "0 0 20px 0",
                  }}
                >
                  Share This Business
                </h3>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "15px",
                    marginBottom: "20px",
                  }}
                >
                  <button
                    onClick={shareOnWhatsApp}
                    style={{
                      padding: "15px",
                      background:
                        "linear-gradient(135deg, #25d366 0%, #128c7e 100%)",
                      border: "none",
                      borderRadius: "15px",
                      color: "white",
                      fontSize: "16px",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "8px",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = "translateY(0)";
                    }}
                  >
                    <FaWhatsapp style={{ fontSize: "24px" }} />
                    WhatsApp
                  </button>

                  <button
                    onClick={shareOnFacebook}
                    style={{
                      padding: "15px",
                      background:
                        "linear-gradient(135deg, #1877f2 0%, #0d6efd 100%)",
                      border: "none",
                      borderRadius: "15px",
                      color: "white",
                      fontSize: "16px",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "8px",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = "translateY(0)";
                    }}
                  >
                    <FaFacebook style={{ fontSize: "24px" }} />
                    Facebook
                  </button>

                  <button
                    onClick={shareOnTwitter}
                    style={{
                      padding: "15px",
                      background:
                        "linear-gradient(135deg, #1da1f2 0%, #0ea5e9 100%)",
                      border: "none",
                      borderRadius: "15px",
                      color: "white",
                      fontSize: "16px",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "8px",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = "translateY(0)";
                    }}
                  >
                    <FaTwitter style={{ fontSize: "24px" }} />
                    Twitter
                  </button>

                  <button
                    onClick={copyToClipboard}
                    style={{
                      padding: "15px",
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      border: "none",
                      borderRadius: "15px",
                      color: "white",
                      fontSize: "16px",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "8px",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = "translateY(0)";
                    }}
                  >
                    <FaCopy style={{ fontSize: "24px" }} />
                    Copy Link
                  </button>
                </div>

                <button
                  onClick={() => {
                    setShowShareOptions(false);
                    setSelectedBusiness(null);
                  }}
                  style={{
                    padding: "10px 20px",
                    background: "#f8f9fa",
                    border: "1px solid #dee2e6",
                    borderRadius: "10px",
                    color: "#6c757d",
                    fontSize: "14px",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = "#e9ecef";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "#f8f9fa";
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {showEditBusinessModal && (
            <Modal
              title="Update Your Business"
              onClose={() => {
                setShowEditBusinessModal(false);
                setSelectedBusiness(null);
              }}
            >
              <EditBusinessModal
                business={selectedBusiness}
                onClose={() => {
                  setShowEditBusinessModal(false);
                  setSelectedBusiness(null);
                }}
                onSuccess={() => {
                  setShowEditBusinessModal(false);
                  setSelectedBusiness(null);
                  window.location.reload();
                }}
              />
            </Modal>
          )}

          {showGalleryModal && (
            <GalleryManagementModal
              business={selectedBusiness}
              onClose={() => {
                setShowGalleryModal(false);
                setSelectedBusiness(null);
              }}
              onSuccess={() => {
                window.location.reload();
              }}
            />
          )}

          {showDeleteBusinessModal && (
            <Modal
              title="Delete Business?"
              onClose={() => {
                setShowDeleteBusinessModal(false);
                setSelectedBusiness(null);
                setDeleteConfirmText("");
              }}
            >
              <div style={{ padding: "20px" }}>
                <p style={{ fontSize: "16px", color: "#333", marginBottom: "15px", lineHeight: "1.5" }}>
                  Are you sure you want to delete <strong style={{ color: "#d32f2f" }}>{selectedBusiness?.name}</strong>?
                </p>
                <p style={{ fontSize: "14px", color: "#666", marginBottom: "20px", lineHeight: "1.5" }}>
                  This will permanently delete the business, its address, reviews, notice listings, products, analytics, and all associated images and videos from our servers and storage (including Bunny storage & stream). This action is irreversible!
                </p>

                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#555", textTransform: "uppercase", marginBottom: "8px" }}>
                    Type <strong style={{ color: "#d32f2f" }}>DELETE</strong> to confirm
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="DELETE"
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "8px",
                      border: "1px solid #ccc",
                      fontSize: "14px",
                      outline: "none",
                      transition: "border 0.2s",
                    }}
                  />
                </div>

                <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowDeleteBusinessModal(false);
                      setSelectedBusiness(null);
                      setDeleteConfirmText("");
                    }}
                    disabled={deletingBusiness}
                    style={{
                      padding: "10px 20px",
                      background: "#f8f9fa",
                      border: "1px solid #dee2e6",
                      borderRadius: "8px",
                      color: "#6c757d",
                      fontSize: "14px",
                      fontWeight: "600",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (deleteConfirmText !== "DELETE") {
                        toast.error("Please type DELETE to confirm");
                        return;
                      }
                      await deleteBusiness({
                        variables: { id: selectedBusiness.id }
                      });
                    }}
                    disabled={deletingBusiness || deleteConfirmText !== "DELETE"}
                    style={{
                      padding: "10px 20px",
                      background: deleteConfirmText === "DELETE" && !deletingBusiness
                        ? "linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)"
                        : "#ffb3b3",
                      border: "none",
                      borderRadius: "8px",
                      color: "white",
                      fontSize: "14px",
                      fontWeight: "600",
                      cursor: deleteConfirmText === "DELETE" && !deletingBusiness ? "pointer" : "not-allowed",
                    }}
                  >
                    {deletingBusiness ? "Deleting..." : "Delete Permanently"}
                  </button>
                </div>
              </div>
            </Modal>
          )}
        </>
      )}
    </>
  );
}

export default withAuth(EditBusiness);
