import React, { useState, useRef } from "react";
import { useMutation } from "@apollo/client";
import { UPDATE_BUSINESS } from "@/api/mutations/business/business";
import { UPLOAD_IMAGE } from "@/api/mutations/common";
import toast from "react-hot-toast";
import { FaTrash, FaPlus, FaTimes } from "react-icons/fa";
import bnwLogo from "@/images/debisi_logo_bnw.png";
import { compressImage } from "@/utils/imageCompression";

const GalleryManagementModal = ({ business, onClose, onSuccess }) => {
  const [galleryImages, setGalleryImages] = useState(
    business.images?.filter((img) => !img.isLogo).map((img) => img.imageUrl) || []
  );
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [uploadImage] = useMutation(UPLOAD_IMAGE);
  const [updateBusiness, { loading: updating }] = useMutation(UPDATE_BUSINESS, {
    onCompleted: () => {
      toast.success("Gallery updated successfully!");
      if (onSuccess) onSuccess();
      onClose();
    },
    onError: (error) => {
      console.error("Error updating gallery:", error);
      toast.error(error.message || "Failed to update gallery");
    },
  });

  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
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

    setUploading(true);
    const newImages = [...galleryImages];

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} is too large. Max size is 2MB.`);
        continue;
      }
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        toast.error(`${file.name} is not a valid image type.`);
        continue;
      }

      try {
        toast.loading(`Uploading ${file.name}...`, { id: "gallery-upload" });
        const compressedImage = await compressImage(file);
        const { data: uploadData } = await uploadImage({
          variables: { file: compressedImage },
        });
        toast.success(`Uploaded ${file.name}`, { id: "gallery-upload" });
        if (uploadData?.uploadImage) {
          newImages.push(uploadData.uploadImage);
        }
      } catch (err) {
        toast.error(`Failed to upload ${file.name}`);
        console.error(err);
      }
    }

    setGalleryImages(newImages);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    updateBusiness({
      variables: {
        id: business.id,
        input: {
          galleryImages: galleryImages,
        },
      },
    });
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
              Up to 4 images, max 2MB each
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
            {galleryImages.map((url, idx) => (
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
                <img
                  src={url}
                  alt={`Gallery ${idx + 1}`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
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
                  }}
                  onMouseEnter={(e) => (e.target.style.opacity = 1)}
                  onMouseLeave={(e) => (e.target.style.opacity = 0)}
                >
                  <button
                    onClick={() => removeImage(idx)}
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
                    onMouseEnter={(e) => (e.target.style.transform = "scale(1.1)")}
                    onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
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
                e.target.style.opacity = 0.9;
                e.target.style.transform = "translateY(-2px)";
              }
            }}
            onMouseLeave={(e) => {
              if (!updating && !uploading) {
                e.target.style.opacity = 1;
                e.target.style.transform = "translateY(0)";
              }
            }}
          >
            {updating ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GalleryManagementModal;
