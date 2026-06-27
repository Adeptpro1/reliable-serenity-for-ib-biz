import Image from "next/image";
import React, { useState, useRef } from "react";
import { useMutation } from "@apollo/client";
import { UPDATE_BUSINESS } from "@/api/mutations/business/business";
import { UPLOAD_IMAGE, DELETE_IMAGE } from "@/api/mutations/common";
import toast from "react-hot-toast";
import { FaTrash, FaPlus, FaTimes } from "react-icons/fa";
import bnwLogo from "@/images/debisi_logo_bnw.png";
import { compressImage } from "@/utils/imageCompression";

const GalleryManagementModal = ({ business, onClose, onSuccess }) => {
  const [galleryImages, setGalleryImages] = useState(
    business.images?.filter((img) => !img.isLogo).map((img) => ({ url: img.imageUrl, file: null })) || []
  );
  const [uploading, setUploading] = useState(false);
  const [pendingDeletions, setPendingDeletions] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [imageToDelete, setImageToDelete] = useState(null);
  const fileInputRef = useRef(null);

  const [uploadImage] = useMutation(UPLOAD_IMAGE);
  const [deleteImage] = useMutation(DELETE_IMAGE);
  const [updateBusiness, { loading: updating }] = useMutation(UPDATE_BUSINESS, {
    onCompleted: async () => {
      toast.success("Gallery updated successfully!");
      if (onSuccess) onSuccess();
      onClose();
    },
    onError: (error) => {
      console.error("Error updating gallery:", error);
      toast.error(error.message || "Failed to update gallery");
    },
  });

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_FILE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
  ];

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (galleryImages.length + files.length > 4) {
      toast.error("Maximum 4 gallery images allowed");
      return;
    }

    const newImages = [...galleryImages];

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} is too large. Max size is 5MB.`);
        continue;
      }
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        toast.error(`${file.name} is not a valid image type.`);
        continue;
      }

      // Create a local preview
      const localUrl = URL.createObjectURL(file);
      newImages.push({ url: localUrl, file: file });
    }

    setGalleryImages(newImages);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (img) => {
    setImageToDelete(img);
    setShowDeleteConfirm(true);
  };

  const confirmRemove = () => {
    if (!imageToDelete) return;
    
    if (!imageToDelete.file) {
      // It's an existing image from DB/Bunny
      setPendingDeletions((prev) => [...prev, imageToDelete.url]);
    } else {
      // It's a newly added image (blob URL)
      URL.revokeObjectURL(imageToDelete.url);
    }
    
    setGalleryImages((prev) => prev.filter((img) => img.url !== imageToDelete.url));
    
    setShowDeleteConfirm(false);
    setImageToDelete(null);
  };

  const handleSave = async () => {
    setUploading(true);
    try {
      const finalImageUrls = [];
      const businessSlug = business.name.toLowerCase().replace(/[^a-z0-9]/g, "-");

      // 1. Process all images (upload new ones, keep existing ones)
      for (let i = 0; i < galleryImages.length; i++) {
        const img = galleryImages[i];
        if (img.file) {
          // It's a new file, upload it
          try {
            toast.loading(`Uploading image ${i + 1}...`, { id: "gallery-upload" });
            const compressedImage = await compressImage(img.file);
            const renamedFile = new File(
              [compressedImage],
              `${businessSlug}-gallery-${Date.now()}-${i + 1}.webp`,
              { type: "image/webp" }
            );

            const { data: uploadData } = await uploadImage({
              variables: { file: renamedFile },
            });
            
            if (uploadData?.uploadImage) {
              finalImageUrls.push(uploadData.uploadImage);
              // Revoke local URL
              URL.revokeObjectURL(img.url);
            }
          } catch (err) {
            console.error("Upload failed for one image:", err);
            toast.error("Failed to upload some images. Please try again.");
            setUploading(false);
            return; // Stop if upload fails
          }
        } else {
          // It's an existing image URL
          finalImageUrls.push(img.url);
        }
      }

      toast.success("All images ready", { id: "gallery-upload" });

      // 2. Update the business in DB with the final list of URLs
      await updateBusiness({
        variables: {
          id: business.id,
          input: {
            galleryImages: finalImageUrls,
          },
        },
      });

      // 3. Cleanup storage for removed images
      if (pendingDeletions.length > 0) {
        toast.loading("Cleaning up old storage...", { id: "cleanup" });
        for (const url of pendingDeletions) {
          try {
            await deleteImage({ variables: { url } });
          } catch (err) {
            console.error(`Failed to delete ${url} from storage:`, err);
          }
        }
        toast.success("Storage cleanup complete", { id: "cleanup" });
      }
    } catch (err) {
      console.error("Save failed:", err);
      // Error is handled by mutation onError
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "24px",
          width: "100%",
          maxWidth: "512px",
          overflow: "hidden",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "24px 32px",
            borderBottom: "1px solid #f0f0f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "#fafafa",
          }}
        >
          <div>
            <h2
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                color: "#1f2937",
                margin: 0,
              }}
            >
              Manage Gallery
            </h2>
            <p
              style={{
                fontSize: "14px",
                color: "#6b7280",
                marginTop: "4px",
                margin: 0,
              }}
            >
              Up to 4 images, max 5MB each
            </p>
            <p
              style={{
                fontSize: "12px",
                color: "#9ca3af",
                marginTop: "4px",
                margin: 0,
              }}
            >
              Showcase your Business Products or Services
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: "8px",
              backgroundColor: "transparent",
              border: "none",
              borderRadius: "9999px",
              cursor: "pointer",
              color: "#9ca3af",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => (e.target.style.color = "#4b5563")}
            onMouseLeave={(e) => (e.target.style.color = "#9ca3af")}
          >
            <FaTimes size={24} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: "32px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "24px",
            }}
          >
            {galleryImages.map((img, idx) => (
              <div
                key={idx}
                style={{
                  position: "relative",
                  aspectRatio: "1",
                  borderRadius: "16px",
                  overflow: "hidden",
                  border: "2px solid #f3f4f6",
                  boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                }}
              >
                <Image
                  src={img.url}
                  alt={`Gallery ${idx + 1}`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    pointerEvents: "none", // Prevent image from stealing hover
                  }}
                  width={800}
                  height={800}
                  onError={(e) => {
                    e.target.src = bnwLogo.src || bnwLogo;
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    backgroundColor: "rgba(0, 0, 0, 0.4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: 0,
                    transition: "opacity 0.2s",
                    cursor: "default",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = 0)}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(img);
                    }}
                    style={{
                      padding: "12px",
                      backgroundColor: "#ef4444",
                      color: "#fff",
                      border: "none",
                      borderRadius: "9999px",
                      cursor: "pointer",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                      transition: "transform 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.transform = "scale(1.1)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.transform = "scale(1)")
                    }
                    title="Remove Image"
                  >
                    <FaTrash size={18} />
                  </button>
                </div>
              </div>
            ))}

            {/* Upload Placeholder */}
            {galleryImages.length < 4 && (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                style={{
                  position: "relative",
                  aspectRatio: "1",
                  borderRadius: "16px",
                  border: "2px dashed #e5e7eb",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "12px",
                  backgroundColor: uploading ? "#f9fafb" : "transparent",
                  cursor: uploading ? "not-allowed" : "pointer",
                  opacity: uploading ? 0.5 : 1,
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (!uploading) {
                    e.target.style.borderColor = "#c084fc";
                    e.target.style.backgroundColor = "#f5f3ff";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!uploading) {
                    e.target.style.borderColor = "#e5e7eb";
                    e.target.style.backgroundColor = "transparent";
                  }
                }}
              >
                {uploading ? (
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      border: "4px solid #9333ea",
                      borderTopColor: "transparent",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite",
                    }}
                  ></div>
                ) : (
                  <>
                    <div
                      style={{
                        padding: "16px",
                        backgroundColor: "#f3e8ff",
                        color: "#9333ea",
                        borderRadius: "9999px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <FaPlus size={24} />
                    </div>
                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#6b7280",
                      }}
                    >
                      Add Image
                    </span>
                  </>
                )}
              </button>
            )}
          </div>

          {galleryImages.length === 0 && !uploading && (
            <div
              style={{
                textAlign: "center",
                padding: "20px",
                background: "#f8f9fa",
                borderRadius: "10px",
                border: "2px dashed #dee2e6",
                marginTop: "10px",
              }}
            >
              <p
                style={{
                  color: "#6c757d",
                  margin: 0,
                  fontSize: "14px",
                }}
              >
                No images uploaded
              </p>
            </div>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            multiple
            style={{ display: "none" }}
          />
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "24px 32px",
            backgroundColor: "#fafafa",
            borderTop: "1px solid #f0f0f0",
            display: "flex",
            gap: "16px",
          }}
        >
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "16px",
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              color: "#374151",
              fontWeight: "bold",
              borderRadius: "16px",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#f9fafb")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#fff")}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={updating || uploading}
            style={{
              flex: 1,
              padding: "16px",
              fontWeight: "bold",
              borderRadius: "16px",
              border: "none",
              color: "#fff",
              background:
                updating || uploading
                  ? "#d1d5db"
                  : "linear-gradient(135deg, #9333ea 0%, #4f46e5 100%)",
              cursor: updating || uploading ? "not-allowed" : "pointer",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              if (!updating && !uploading) {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow =
                  "0 20px 25px -5px rgba(0, 0, 0, 0.1)";
              }
            }}
            onMouseLeave={(e) => {
              if (!updating && !uploading) {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 10px 15px -3px rgba(0, 0, 0, 0.1)";
              }
            }}
          >
            {updating ? "Saving..." : uploading ? "Uploading..." : "Save Changes"}
          </button>
        </div>

        {/* Custom Confirmation Modal */}
        {showDeleteConfirm && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              backdropFilter: "blur(4px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 2000,
              padding: "20px",
            }}
          >
            <div
              style={{
                backgroundColor: "#fff",
                borderRadius: "24px",
                padding: "32px",
                maxWidth: "400px",
                width: "100%",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                textAlign: "center",
                animation: "modalFadeIn 0.3s ease-out",
              }}
            >
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  backgroundColor: "#fee2e2",
                  color: "#ef4444",
                  borderRadius: "9999px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                }}
              >
                <FaTrash size={28} />
              </div>
              <h3
                style={{
                  fontSize: "20px",
                  fontWeight: "700",
                  color: "#111827",
                  marginBottom: "12px",
                }}
              >
                Remove Image?
              </h3>
              <p
                style={{
                  fontSize: "15px",
                  color: "#6b7280",
                  lineHeight: "1.5",
                  marginBottom: "24px",
                }}
              >
                Are you sure you want to remove this image? This action will be finalized once you click <strong>Save Changes</strong>.
              </p>
              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setImageToDelete(null);
                  }}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: "12px",
                    border: "1px solid #e5e7eb",
                    backgroundColor: "#fff",
                    color: "#374151",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRemove}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: "12px",
                    border: "none",
                    backgroundColor: "#ef4444",
                    color: "#fff",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes modalFadeIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default GalleryManagementModal;
