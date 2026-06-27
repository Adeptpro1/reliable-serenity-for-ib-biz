import Image from "next/image";
import { useState, useEffect } from "react";
import { FiShare2, FiHeart, FiClock, FiSend } from "react-icons/fi";
import { FaWhatsapp, FaFacebook, FaTwitter, FaCopy } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import Modal from "../../otherComponents/Modal";
import Link from "next/link";
import { useMutation } from "@apollo/client";
import { SUBMIT_NOTICE_LEAD } from "../../../graphql/queries/business/notice";
import { TRACK_ACTIVITY } from "../../../graphql/queries/business/business";
import { toast } from "react-hot-toast";
import { useAuth } from "../../../contexts/AuthContext";

const NoticeCard = ({
  id,
  title,
  content,
  message,
  date,
  likes,
  shares,
  boosted,
  boostExpiresAt,
  images,
  leadFields,
  business,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const { user: currentUser } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(likes || 0);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [sharesCount, setSharesCount] = useState(shares || 0);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState(null);

  useEffect(() => {
    const key = currentUser ? `submitted_notices_${currentUser.id}` : "submitted_notices_guest";
    const submittedNotices = JSON.parse(localStorage.getItem(key) || "[]");
    if (submittedNotices.includes(id)) {
      setHasSubmitted(true);
    } else {
      setHasSubmitted(false);
    }
  }, [id, currentUser]);

  const [submitLead, { loading: isSubmitting }] =
    useMutation(SUBMIT_NOTICE_LEAD);
  const [trackActivity] = useMutation(TRACK_ACTIVITY);

  const now = new Date();
  const isBoostActive =
    boosted && boostExpiresAt && new Date(boostExpiresAt) > now;
  const fields = leadFields || ["name", "email"];
  const noticeContent = content || message;

  // Derive a short snippet (≤ 140 chars) for share previews
  const noticeSnippet = noticeContent
    ? noticeContent.slice(0, 140) + (noticeContent.length > 140 ? "…" : "")
    : "";
  // First notice image URL (cover image)
  const coverImageUrl = images?.[0]?.imageUrl || null;

  const origin = typeof window !== "undefined" && !window.location.hostname.includes("localhost")
    ? window.location.origin
    : "https://debisi.ng";
  const shareUrl = business?.slug
    ? `${origin}/${business.slug}`
    : `${origin}/directory?search=${encodeURIComponent(business?.name || "")}&tab=Noticeboard`;

  const handleLike = async (e) => {
    e.stopPropagation();
    if (liked) {
      toast.error("You already liked this notice!");
      return;
    }
    try {
      await trackActivity({
        variables: {
          input: {
            businessId: business?.id,
            noticeId: id,
            activityType: "LIKE",
          },
        },
      });
      setLiked(true);
      setLikesCount((prev) => prev + 1);
      toast.success("Liked notice!");
    } catch (err) {
      toast.error(err.message || "Failed to like notice");
    }
  };

  // Helper to format Notice sharing messages
  const formatNoticeShareText = (options = {}) => {
    const bizName = business?.name || "a business";
    const snippetText = noticeSnippet ? `"${noticeSnippet}"` : "";

    if (options.isTwitter) {
      return `🔔 Notice Alert: "${title}" by ${bizName} on Debisi!\n\n📌 Read details & connect:\n🔗 ${shareUrl}\n\n#Debisi #SupportLocal #LocalBusiness`;
    }

    if (options.isWhatsApp) {
      const parts = [
        `🔔 *Notice Alert from ${bizName}* 🏢`,
        "",
        `*${title}*`,
        "",
        snippetText || null,
        "",
        `📌 *Read the full details and connect here:*`,
        `🔗 ${shareUrl}`,
        coverImageUrl ? `🖼️ *Preview:* ${coverImageUrl}` : null,
        "",
        `---`,
        `💡 _Grow your business too! Register on Debisi to reach thousands of customers._ 🚀`,
      ];
      return parts.filter((p) => p !== null).join("\n").replace(/\n{3,}/g, "\n\n");
    }

    if (options.isFacebook) {
      const parts = [
        `🔔 Notice Alert from ${bizName} on Debisi!`,
        "",
        `"${title}"`,
        "",
        snippetText || null,
        "",
        `📌 Click here to read the full details and contact them:`,
        shareUrl,
        "",
        `---`,
        `💡 Grow your business too! Register on Debisi to reach thousands of customers. 🚀`,
      ];
      return parts.filter((p) => p !== null).join("\n").replace(/\n{3,}/g, "\n\n");
    }

    // Default / Clipboard / Native share
    const parts = [
      `🔔 Notice Alert from ${bizName}`,
      "",
      title,
      "",
      snippetText || null,
      "",
      `📌 Read the full details and connect with them here:`,
      `🔗 ${shareUrl}`,
      "",
      `---`,
      `💡 Grow your business too! Register on Debisi to reach thousands of customers. 🚀`,
    ];
    return parts.filter((p) => p !== null).join("\n").replace(/\n{3,}/g, "\n\n");
  };

  // ── Native Web Share (with image file if available) ─────────────────────
  const handleShare = async (e) => {
    e.stopPropagation();
    try {
      if (navigator.share) {
        const shareData = {
          title,
          text: formatNoticeShareText(),
        };

        await navigator.share(shareData);
        setSharesCount((prev) => prev + 1);
        await trackActivity({
          variables: {
            input: { businessId: business?.id, noticeId: id, activityType: "SHARE" },
          },
        });
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
    const text = formatNoticeShareText();
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Link copied to clipboard!");
      setSharesCount((prev) => prev + 1);
      await trackActivity({
        variables: {
          input: { businessId: business?.id, noticeId: id, activityType: "SHARE" },
        },
      });
      setShowShareOptions(false);
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  // ── WhatsApp: relatable format with bold title ───────────────────────────
  const shareOnWhatsApp = () => {
    const text = formatNoticeShareText({ isWhatsApp: true });
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    setSharesCount((prev) => prev + 1);
    trackActivity({
      variables: {
        input: { businessId: business?.id, noticeId: id, activityType: "SHARE" },
      },
    }).catch(console.error);
    setShowShareOptions(false);
  };

  // ── Facebook: URL + quote for richer preview ─────────────────────────────
  const shareOnFacebook = () => {
    const quote = encodeURIComponent(formatNoticeShareText({ isFacebook: true }));
    const url = encodeURIComponent(shareUrl);
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${quote}`,
      "_blank",
    );
    setSharesCount((prev) => prev + 1);
    trackActivity({
      variables: {
        input: { businessId: business?.id, noticeId: id, activityType: "SHARE" },
      },
    }).catch(console.error);
    setShowShareOptions(false);
  };

  // ── Twitter/X: relatable format ────────────────────────────────────────
  const shareOnTwitter = () => {
    const tweetText = encodeURIComponent(formatNoticeShareText({ isTwitter: true }));
    window.open(
      `https://twitter.com/intent/tweet?text=${tweetText}`,
      "_blank",
    );
    setSharesCount((prev) => prev + 1);
    trackActivity({
      variables: {
        input: { businessId: business?.id, noticeId: id, activityType: "SHARE" },
      },
    }).catch(console.error);
    setShowShareOptions(false);
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    try {
      await submitLead({
        variables: {
          noticeId: id,
          name: contactForm.name,
          email: contactForm.email,
          phone: contactForm.phone,
          additionalData: { comment: contactForm.message },
        },
      });
      const key = currentUser ? `submitted_notices_${currentUser.id}` : "submitted_notices_guest";
      const submittedNotices = JSON.parse(localStorage.getItem(key) || "[]");
      localStorage.setItem(key, JSON.stringify([...submittedNotices, id]));
      setHasSubmitted(true);

      toast.success("We've sent your request to the business!");
      setContactForm({ name: "", email: "", phone: "", message: "" });
      setShowContactForm(false);
    } catch (error) {
      toast.error(error.message || "Failed to submit. Please try again.");
    }
  };

  return (
    <>
      {fullScreenImage && (
        <div
          style={{
            position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
            backgroundColor: "rgba(0,0,0,0.9)", zIndex: 9999, display: "flex",
            alignItems: "center", justifyContent: "center", cursor: "zoom-out"
          }}
          onClick={() => setFullScreenImage(null)}
        >
          <img src={fullScreenImage} style={{ maxWidth: "90%", maxHeight: "90%", objectFit: "contain" }} alt="Full Screen" />
        </div>
      )}
      <motion.div
        whileHover={{ y: -5 }}
        onClick={() => setIsModalOpen(true)}
        style={{
          borderRadius: "20px",
          overflow: "hidden",
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          transition: "all 0.3s",
          border: "1px solid transparent",
          background: "linear-gradient(white, white) padding-box, linear-gradient(to right, #4f46e5, #9333ea, #ec4899) border-box",
          boxShadow: "0 4px 6px rgba(0,0,0,0.02)",
        }}
      >
        {/* Notice Images Preview */}
        {images && images.length > 0 && (
          <div
            style={{
              position: "relative",
              height: "160px",
              overflow: "hidden",
            }}
          >
            <Image
              src={images[0].imageUrl}
              alt={title}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            width={800} height={800} />
            {boosted && (
              <div
                style={{
                  position: "absolute",
                  top: "12px",
                  right: "12px",
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  padding: "4px 8px",
                  borderRadius: "20px",
                  fontSize: "10px",
                  fontWeight: "700",
                  color: "#f97316",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                🔥 PREMIUM
              </div>
            )}
          </div>
        )}

        <div
          style={{
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
          }}
        >
          {business?.name && (
            <Link
              href={`/${business.slug}`}
              onClick={(e) => e.stopPropagation()}
              style={{
                fontSize: "11px",
                fontWeight: "700",
                color: "purple",
                textDecoration: "none",
                marginBottom: "6px",
                display: "inline-block",
              }}
              className="hover:underline"
            >
              🏢 {business.name}
            </Link>
          )}

          <h3
            style={{
              fontSize: "16px",
              fontWeight: "800",
              color: "#333",
              margin: "0 0 10px 0",
              lineHeight: "1.3",
              height: "42px",
              overflow: "hidden",
            }}
          >
            {title}
          </h3>

          <p
            style={{
              fontSize: "13px",
              color: "#777",
              margin: "0 0 15px 0",
              flexGrow: 1,
              lineHeight: "1.5",
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: "3",
              WebkitBoxOrient: "vertical",
            }}
          >
            {noticeContent}
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingTop: "15px",
              borderTop: "1px solid #f9f9f9",
              marginTop: "auto",
            }}
          >
            <div
              style={{
                fontSize: "10px",
                color: "#bbb",
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <FiClock size={12} /> {date || "Recently"}
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={handleLike}
                style={{
                  background: "none",
                  border: "none",
                  color: liked ? "#D22730" : "#bbb",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: "11px",
                  transition: "color 0.2s",
                }}
              >
                <FiHeart size={14} fill={liked ? "#D22730" : "none"} /> {likesCount}
              </button>
              <button
                onClick={handleShare}
                style={{
                  background: "none",
                  border: "none",
                  color: "#bbb",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: "11px",
                }}
              >
                <FiShare2 size={14} /> Share {sharesCount > 0 ? `(${sharesCount})` : ""}
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Detail Modal */}
      {isModalOpen && (
        <Modal title="Notice Board" onClose={() => setIsModalOpen(false)}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "25px",
            }}
          >
            {images && images.length > 0 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: images.length > 1 ? "repeat(2, 1fr)" : "1fr",
                  gap: "10px",
                }}
              >
                {images.map((img, i) => (
                  <Image
                    key={i}
                    src={img.imageUrl}
                    onClick={() => setFullScreenImage(img.imageUrl)}
                    style={{
                      borderRadius: "15px",
                      width: "100%",
                      height: "160px",
                      objectFit: "cover",
                      border: "1px solid #eee",
                      cursor: "zoom-in"
                    }}
                    alt="Notice"
                  width={800} height={800} />
                ))}
              </div>
            )}

            <div>
              {business?.name && (
                <Link
                  href={`/${business.slug}`}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    fontSize: "13px",
                    fontWeight: "800",
                    color: "purple",
                    textDecoration: "none",
                    marginBottom: "8px",
                    display: "inline-block",
                  }}
                  className="hover:underline"
                >
                  🏢 {business.name}
                </Link>
              )}
              <h2
                style={{
                  fontSize: "24px",
                  fontWeight: "900",
                  color: "#333",
                  margin: "0 0 10px 0",
                }}
              >
                {title}
              </h2>
              <p
                style={{
                  fontSize: "15px",
                  color: "#555",
                  lineHeight: "1.7",
                  margin: "0",
                  whiteSpace: "pre-wrap",
                  wordWrap: "break-word",
                  overflowWrap: "break-word",
                  wordBreak: "break-word"
                }}
              >
                {noticeContent}
              </p>
            </div>

            {isBoostActive && (
              <div
                style={{
                  padding: "20px",
                  borderRadius: "20px",
                  background:
                    "linear-gradient(bottom right, rgba(128, 0, 128, 0.05), rgba(210, 39, 48, 0.05))",
                  border: "1px solid rgba(128, 0, 128, 0.1)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "15px",
                    marginBottom: "20px",
                  }}
                >
                  <div
                    style={{
                      padding: "10px",
                      background: "linear-gradient(to right, purple, #D22730)",
                      color: "white",
                      borderRadius: "12px",
                      boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                    }}
                  >
                    <FiSend size={18} />
                  </div>
                  <div>
                    <h4
                      style={{
                        margin: "0",
                        fontSize: "16px",
                        fontWeight: "800",
                        color: "#333",
                      }}
                    >
                      Interested?
                    </h4>
                    <p
                      style={{
                        margin: "2px 0 0 0",
                        fontSize: "11px",
                        color: "purple",
                        fontWeight: "700",
                      }}
                    >
                      DIRECT CONTACT REQUEST ENABLED
                    </p>
                  </div>
                </div>

                {!showContactForm ? (
                  <button
                    onClick={() => setShowContactForm(true)}
                    style={{
                      width: "100%",
                      padding: "15px",
                      backgroundColor: "white",
                      color: "purple",
                      fontWeight: "800",
                      borderRadius: "15px",
                      border: "2px solid rgba(128, 0, 128, 0.2)",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    Send Contact Request
                  </button>
                ) : hasSubmitted ? (
                  <div style={{ textAlign: "center", padding: "20px", background: "#f0fdf4", borderRadius: "15px", border: "1px solid #bbf7d0", color: "#166534" }}>
                    <p style={{ fontWeight: "600", fontSize: "14px", margin: 0 }}>✅ Request Sent!</p>
                    <p style={{ fontSize: "12px", marginTop: "5px" }}>You have already sent a request for this notice.</p>
                  </div>
                ) : (
                  <motion.form
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onSubmit={handleContactSubmit}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "15px",
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                        gap: "10px",
                      }}
                    >
                      {fields.includes("name") && (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "5px",
                          }}
                        >
                          <label
                            style={{
                              fontSize: "10px",
                              fontWeight: "700",
                              color: "#aaa",
                              textTransform: "uppercase",
                              marginLeft: "5px",
                            }}
                          >
                            Your Name
                          </label>
                          <input
                            type="text"
                            required
                            minLength={2}
                            pattern="^[a-zA-Z\s\-\']+$"
                            title="Please enter a valid name (letters, spaces, hyphens, or apostrophes only)"
                            style={{
                              padding: "12px",
                              borderRadius: "10px",
                              border: "1px solid #eee",
                              fontSize: "13px",
                            }}
                            value={contactForm.name}
                            onChange={(e) =>
                              setContactForm({
                                ...contactForm,
                                name: e.target.value,
                              })
                            }
                          />
                        </div>
                      )}
                      {fields.includes("email") && (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "5px",
                          }}
                        >
                          <label
                            style={{
                              fontSize: "10px",
                              fontWeight: "700",
                              color: "#aaa",
                              textTransform: "uppercase",
                              marginLeft: "5px",
                            }}
                          >
                            Email
                          </label>
                          <input
                            type="email"
                            required={!contactForm.phone}
                            style={{
                              padding: "12px",
                              borderRadius: "10px",
                              border: "1px solid #eee",
                              fontSize: "13px",
                            }}
                            value={contactForm.email}
                            onChange={(e) =>
                              setContactForm({
                                ...contactForm,
                                email: e.target.value,
                              })
                            }
                          />
                        </div>
                      )}
                    </div>

                    <div style={{ display: "flex", gap: "10px" }}>
                      {fields.includes("phone") && (
                        <div
                          style={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            gap: "5px",
                          }}
                        >
                          <label
                            style={{
                              fontSize: "10px",
                              fontWeight: "700",
                              color: "#aaa",
                              textTransform: "uppercase",
                              marginLeft: "5px",
                            }}
                          >
                            Phone
                          </label>
                          <input
                            type="tel"
                            required={!contactForm.email}
                            pattern="^\+?[0-9\s\-\(\)]+$"
                            title="Please enter a valid phone number (digits, spaces, hyphens, or parentheses)"
                            style={{
                              width: "100%",
                              padding: "12px",
                              borderRadius: "10px",
                              border: "1px solid #eee",
                              fontSize: "13px",
                            }}
                            value={contactForm.phone}
                            onChange={(e) =>
                              setContactForm({
                                ...contactForm,
                                phone: e.target.value,
                              })
                            }
                          />
                        </div>
                      )}
                    </div>

                    {fields.includes("message") && (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "5px",
                        }}
                      >
                        <label
                          style={{
                            fontSize: "10px",
                            fontWeight: "700",
                            color: "#aaa",
                            textTransform: "uppercase",
                            marginLeft: "5px",
                          }}
                        >
                          Message
                        </label>
                        <textarea
                          rows="3"
                          minLength={5}
                          maxLength={100}
                          style={{
                            padding: "12px",
                            borderRadius: "10px",
                            border: "1px solid #eee",
                            fontSize: "13px",
                            resize: "none",
                          }}
                          value={contactForm.message}
                          onChange={(e) =>
                            setContactForm({
                              ...contactForm,
                              message: e.target.value,
                            })
                          }
                        />
                      </div>
                    )}

                    <div
                      style={{
                        background: "#fff8e1",
                        border: "1px solid #f59e0b",
                        borderRadius: "10px",
                        padding: "10px 14px",
                        fontSize: "12px",
                        color: "#92400e",
                        lineHeight: "1.4"
                      }}
                    >
                      ⚠️ <strong>Warning:</strong> Details dropped on notice boost may be used as the business wishes. Make sure you know and are interested in a business before dropping your contact details.
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        marginTop: "10px",
                      }}
                    >
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        style={{
                          flex: 1,
                          padding: "15px",
                          background:
                            "linear-gradient(to right, purple, #D22730)",
                          color: "white",
                          fontWeight: "800",
                          borderRadius: "15px",
                          border: "none",
                          cursor: "pointer",
                          opacity: isSubmitting ? 0.7 : 1,
                        }}
                      >
                        {isSubmitting ? "Sending..." : "Submit Request"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowContactForm(false)}
                        style={{
                          padding: "15px 20px",
                          backgroundColor: "#f0f0f0",
                          color: "#888",
                          fontWeight: "800",
                          borderRadius: "15px",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.form>
                )}
              </div>
            )}

            {!isBoostActive && boosted && (
              <div
                style={{
                  padding: "15px",
                  borderRadius: "15px",
                  backgroundColor: "#f9f9f9",
                  textAlign: "center",
                  border: "1px solid #eee",
                }}
              >
                <p
                  style={{
                    margin: "0",
                    fontSize: "11px",
                    color: "#999",
                    fontStyle: "italic",
                  }}
                >
                  Contact collection for this notice has expired.
                </p>
              </div>
            )}
          </div>
        </Modal>
      )}

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
            zIndex: 10000,
          }}
          onClick={(e) => {
            e.stopPropagation();
            setShowShareOptions(false);
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "20px",
              padding: "30px",
              maxWidth: "320px",
              width: "90%",
              textAlign: "center",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                fontSize: "18px",
                fontWeight: "700",
                color: "#333",
                margin: "0 0 20px 0",
              }}
            >
              Share This Notice
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
                  padding: "12px",
                  background: "linear-gradient(135deg, #25d366 0%, #128c7e 100%)",
                  border: "none",
                  borderRadius: "12px",
                  color: "white",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
                }}
              >
                <FaWhatsapp style={{ fontSize: "20px" }} />
                WhatsApp
              </button>

              <button
                onClick={shareOnFacebook}
                style={{
                  padding: "12px",
                  background: "linear-gradient(135deg, #1877f2 0%, #0d6efd 100%)",
                  border: "none",
                  borderRadius: "12px",
                  color: "white",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
                }}
              >
                <FaFacebook style={{ fontSize: "20px" }} />
                Facebook
              </button>

              <button
                onClick={shareOnTwitter}
                style={{
                  padding: "12px",
                  background: "linear-gradient(135deg, #1da1f2 0%, #0ea5e9 100%)",
                  border: "none",
                  borderRadius: "12px",
                  color: "white",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
                }}
              >
                <FaTwitter style={{ fontSize: "20px" }} />
                Twitter
              </button>

              <button
                onClick={copyToClipboard}
                style={{
                  padding: "12px",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  border: "none",
                  borderRadius: "12px",
                  color: "white",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
                }}
              >
                <FaCopy style={{ fontSize: "20px" }} />
                Copy Link
              </button>
            </div>

            <button
              onClick={() => setShowShareOptions(false)}
              style={{
                padding: "10px",
                background: "#f1f5f9",
                border: "none",
                borderRadius: "10px",
                color: "#475569",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
                width: "100%",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default NoticeCard;
