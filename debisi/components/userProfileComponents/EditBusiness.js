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
} from "react-icons/fa";
import { HiOutlineGlobe, HiPhone, HiMail } from "react-icons/hi";
import bnwLogo from "@/images/debisi_logo_bnw.png";
import { useState, useEffect } from "react";
import Modal from "@/components/otherComponents/Modal";
import EditBusinessModal from "@/components/serverComponents/business/EditBusinessModal";
import GalleryManagementModal from "@/components/serverComponents/business/GalleryManagementModal";
import { withAuth } from "@/middlewares/withAuth";
import Link from "next/link";
import { useMutation, useQuery } from "@apollo/client";
import { TRACK_ACTIVITY } from "@/api/queries/business/business";

function EditBusiness({ userData }) {
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

  useEffect(() => {
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

  const handleShare = async (biz) => {
    const shareData = {
      title: biz?.name || "Check out this business",
      text: `Check out ${biz?.name} on Debisi! ${biz?.description || "They offer great services and have excellent customer ratings."}`,
      url: `https://debisi.ng/${biz?.slug}` || `https://debisi.ng/`,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        await trackActivity({
          variables: { input: { businessId: biz.id, activityType: "SHARE" } },
        });
        setShares((prev) => prev + 1);
        setShareMessage("Shared successfully!");
        setTimeout(() => setShareMessage(""), 3000);
      } else {
        setShowShareOptions(true); // fallback UI
      }
    } catch (error) {
      throw new Error(error.message);
    }
  };

  const copyToClipboard = async (biz) => {
    const shareData = `${biz?.name} - ${biz?.description || ""}\n\nCheck it out here: https://debisi.ng/${biz?.slug}`;
    try {
      await navigator.clipboard.writeText(shareData);
      await trackActivity({
        variables: { input: { businessId: biz.id, activityType: "SHARE" } },
      });
      setShareMessage("Link copied to clipboard!");
      setShares((prev) => prev + 1);
      setTimeout(() => setShareMessage(""), 3000);
      setShowShareOptions(false);
    } catch (error) {
      setShareMessage("Failed to copy link");
      setTimeout(() => setShareMessage(""), 3000);
    }
  };

  const shareOnWhatsApp = async (biz) => {
    const text = encodeURIComponent(
      `${biz?.name} - ${biz?.description || ""}\nCheck them out on Debisi: https://debisi.ng/${biz?.slug}`,
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
    await trackActivity({
      variables: { input: { businessId: biz.id, activityType: "SHARE" } },
    });
    setShares((prev) => prev + 1);
    setShareMessage("Opening WhatsApp...");
    setTimeout(() => setShareMessage(""), 3000);
    setShowShareOptions(false);
  };

  const shareOnFacebook = async (biz) => {
    const url = encodeURIComponent(`https://debisi.ng/${biz?.slug}`);
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      "_blank",
    );
    await trackActivity({
      variables: { input: { businessId: biz.id, activityType: "SHARE" } },
    });
    setShares((prev) => prev + 1);
    setShareMessage("Opening Facebook...");
    setTimeout(() => setShareMessage(""), 3000);
    setShowShareOptions(false);
  };

  const shareOnTwitter = async (biz) => {
    const text = encodeURIComponent(
      `${biz?.name} - ${biz?.description || "Check them out on Debisi!"}`,
    );
    const url = encodeURIComponent(`https://debisi.ng/${biz?.slug}`);
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      "_blank",
    );
    await trackActivity({
      variables: { input: { businessId: biz.id, activityType: "SHARE" } },
    });
    setShares((prev) => prev + 1);
    setShareMessage("Opening Twitter...");
    setTimeout(() => setShareMessage(""), 3000);
    setShowShareOptions(false);
  };

  const handlePromote = async (businessId) => {
    setIsPromoting(true);
    setPromoteMessage("Promoting your business...");

    try {
      // Simulate API call for promotion
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setPromoteMessage(
        "Business promoted successfully! Your business will now appear in the top list.",
      );
      setTimeout(() => {
        setPromoteMessage("");
        setShowPromoteModal(false);
        setIsPromoting(false);
      }, 3000);
    } catch (error) {
      setPromoteMessage("Failed to promote business. Please try again.");
      setTimeout(() => {
        setPromoteMessage("");
        setIsPromoting(false);
      }, 3000);
    }
  };

  const openPromoteModal = () => {
    setShowPromoteModal(true);
    setPromoteMessage("");
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
          You don't have any registered businesses yet. Create one on the
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
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 400px), 1fr))",
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
                    fontSize: "28px",
                    fontWeight: "bold",
                    margin: "0 0 10px 0",
                    textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
                  }}
                >
                  {biz.name}
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
                    onClick={openPromoteModal}
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
                    disabled={true}
                  >
                    <FaRocket style={{ fontSize: "14px" }} />
                    Promote
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

            {/* Share Options Modal */}
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
                onClick={() => setShowShareOptions(false)}
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
                    onClick={() => setShowShareOptions(false)}
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

            {/* Promote Business Modal */}
            {showPromoteModal && (
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
                onClick={() => !isPromoting && setShowPromoteModal(false)}
              >
                <div
                  style={{
                    background: "white",
                    borderRadius: "20px",
                    padding: "30px",
                    maxWidth: "400px",
                    width: "90%",
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
              </div>
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
                  src={
                    (() => {
                      const logoUrl = biz.images?.find((img) => img.isLogo)?.imageUrl;
                      return typeof logoUrl === "string" && logoUrl.trim() !== "" ? logoUrl : bnwLogo;
                    })()
                  }
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

              {biz.images?.filter((img) => !img.isLogo && img.imageUrl && img.imageUrl.trim() !== "").length > 0 ? (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                    gap: "15px",
                    justifyItems: "center",
                  }}
                >
                  {biz.images
                    .filter((img) => !img.isLogo && img.imageUrl && img.imageUrl.trim() !== "")
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
                        <img
                          src={image.imageUrl}
                          alt="Gallery Item"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
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

            {/* Edit Business Button */}
            <button
              type="button"
              style={{
                width: "100%",
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
                boxShadow: "0 5px 15px rgba(102, 126, 234, 0.3)",
              }}
              onClick={() => {
                setSelectedBusiness(biz);
                setShowEditBusinessModal(true);
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
              <FaEdit style={{ fontSize: "18px" }} />
              Edit Business
            </button>
          </div>
        ))}
      </div>

      {selectedBusiness && (
        <>
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
        </>
      )}
    </>
  );
}

export default withAuth(EditBusiness);
