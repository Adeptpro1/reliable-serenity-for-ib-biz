import Image from "next/image";
import { useState } from "react";
import { FiShare2, FiHeart, FiClock, FiSend } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import Modal from "../../otherComponents/Modal";
import { useMutation } from "@apollo/client";
import { SUBMIT_NOTICE_LEAD } from "../../../api/queries/business/notice";
import { toast } from "react-hot-toast";

const NoticeCard = ({
  id,
  title,
  message,
  date,
  likes,
  boosted,
  boostExpiresAt,
  images,
  leadFields,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [submitLead, { loading: isSubmitting }] =
    useMutation(SUBMIT_NOTICE_LEAD);

  const now = new Date();
  const isBoostActive =
    boosted && boostExpiresAt && new Date(boostExpiresAt) > now;
  const fields = leadFields || ["name", "email"];

  const handleShare = async (e) => {
    e.stopPropagation();
    const shareUrl = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, text: message, url: shareUrl });
      } else {
        navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied to clipboard!");
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
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
      toast.success("We've sent your request to the business!");
      setContactForm({ name: "", email: "", phone: "", message: "" });
      setShowContactForm(false);
    } catch (error) {
      toast.error(error.message || "Failed to submit. Please try again.");
    }
  };

  return (
    <>
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
          height: "100%",
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
            {message}
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
                onClick={(e) => {
                  e.stopPropagation();
                  toast.success("Liked!");
                }}
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
                <FiHeart size={14} /> {likes || 0}
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
                <FiShare2 size={14} /> Share
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
              maxHeight: "80vh",
              overflowY: "auto",
              paddingRight: "10px",
            }}
          >
            {images && images.length > 0 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: images.length > 1 ? "1fr 1fr" : "1fr",
                  gap: "10px",
                }}
              >
                {images.map((img, i) => (
                  <Image
                    key={i}
                    src={img.imageUrl}
                    style={{
                      borderRadius: "15px",
                      width: "100%",
                      height: "200px",
                      objectFit: "cover",
                      border: "1px solid #eee",
                    }}
                    alt="Notice"
                  width={800} height={800} />
                ))}
              </div>
            )}

            <div>
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
                }}
              >
                {message}
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
                        gridTemplateColumns: "1fr 1fr",
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
                            required
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
    </>
  );
};

export default NoticeCard;
