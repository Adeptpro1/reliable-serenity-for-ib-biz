"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

/**
 * FeedProductCard — compact product card for the home feed.
 * Clicking opens the full marketplace page with this product highlighted,
 * or opens a contact deeplink (WhatsApp/Phone) for the seller.
 *
 * Navigation on click:
 *   - Card body → /marketplace?highlight={id}  (shows product in marketplace context)
 *   - "Contact" button → primary contact URL or tel:// deep link
 */
export default function FeedProductCard({
  id,
  title,
  price,
  discount,
  isMadeInOyo,
  isBoosted,
  category,
  location,
  createdAt,
  business,
  images = [],
}) {
  const primaryImage =
    images.find((img) => img.isPrimary)?.imageUrl || images[0]?.imageUrl || null;

  // Bug fix: guard against null/undefined price — unguarded arithmetic produces NaN → "₦NaN"
  const discountedPrice =
    price != null && discount > 0 ? price - (price * discount) / 100 : null;

  const handleContact = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const primaryContact =
      business?.contactUrls?.find((c) => c.isPrimary) ||
      business?.contactUrls?.[0];
    if (primaryContact?.url) {
      window.open(primaryContact.url, "_blank");
    } else if (business?.phone) {
      window.open(`tel:${business.phone}`, "_self");
    }
  };

  const timeAgo = (dateStr) => {
    if (!dateStr) return "";
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: "0 12px 32px rgba(0,0,0,0.12)" }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      style={{
        borderRadius: "16px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        border: "1px solid transparent",
        background:
          "linear-gradient(white, white) padding-box, linear-gradient(to right, #4f46e5, #9333ea, #ec4899) border-box",
        cursor: "pointer",
      }}
    >
      <Link
        href={`/marketplace?highlight=${id}`}
        style={{ display: "flex", flexDirection: "column", flexGrow: 1, textDecoration: "none", color: "inherit" }}
      >
        {/* Image */}
        <div style={{ position: "relative", height: "160px", flexShrink: 0, background: "#f3f4f6" }}>
          {primaryImage ? (
            <Image
              src={primaryImage}
              alt={title || "Product image"}
              fill
              style={{ objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "32px",
                color: "#d1d5db",
              }}
            >
              🛍️
            </div>
          )}

          {/* Badges */}
          <div
            style={{
              position: "absolute",
              top: "8px",
              left: "8px",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            {isBoosted && (
              <span
                style={{
                  background: "linear-gradient(135deg, #f59e0b, #d97706)",
                  color: "#fff",
                  fontSize: "9px",
                  fontWeight: "800",
                  padding: "2px 7px",
                  borderRadius: "20px",
                  textTransform: "uppercase",
                  letterSpacing: "0.3px",
                }}
              >
                🔥 Featured
              </span>
            )}
            {isMadeInOyo && (
              <span
                style={{
                  background: "linear-gradient(135deg, #16a34a, #15803d)",
                  color: "#fff",
                  fontSize: "9px",
                  fontWeight: "700",
                  padding: "2px 7px",
                  borderRadius: "20px",
                }}
              >
                🌿 Made in Oyo
              </span>
            )}
          </div>

          {/* Discount ribbon */}
          {discount > 0 && (
            <div
              style={{
                position: "absolute",
                top: "8px",
                right: "8px",
                background: "#D22730",
                color: "#fff",
                fontSize: "10px",
                fontWeight: "800",
                padding: "3px 8px",
                borderRadius: "20px",
              }}
            >
              -{discount}%
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: "12px", flexGrow: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
          {/* Business name */}
          {business?.name && (
            <span style={{ fontSize: "10px", fontWeight: "700", color: "purple", textTransform: "uppercase", letterSpacing: "0.3px" }}>
              🏢 {business.name}
            </span>
          )}

          {/* Title */}
          <h3
            style={{
              fontSize: "14px",
              fontWeight: "700",
              color: "#1f2937",
              margin: 0,
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              lineHeight: "1.35",
            }}
          >
            {title}
          </h3>

          {/* Price */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
            <span style={{ fontSize: "15px", fontWeight: "800", color: "#111" }}>
              ₦{(discountedPrice ?? price)?.toLocaleString()}
            </span>
            {discountedPrice && (
              <span style={{ fontSize: "12px", color: "#9ca3af", textDecoration: "line-through" }}>
                ₦{price?.toLocaleString()}
              </span>
            )}
          </div>

          {/* Meta */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "auto",
              paddingTop: "8px",
              borderTop: "1px solid #f9fafb",
            }}
          >
            <span style={{ fontSize: "10px", color: "#9ca3af" }}>
              📍 {location || "Oyo State"}
            </span>
            <span style={{ fontSize: "10px", color: "#9ca3af" }}>
              {timeAgo(createdAt)}
            </span>
          </div>
        </div>
      </Link>

      {/* Action row */}
      <div
        style={{
          display: "flex",
          borderTop: "1px solid #f3f4f6",
        }}
      >
        <Link
          href={`/marketplace?highlight=${id}`}
          style={{
            flex: 1,
            padding: "10px",
            textAlign: "center",
            fontSize: "13px",
            fontWeight: "600",
            color: "purple",
            textDecoration: "none",
          }}
        >
          View
        </Link>
        <button
          onClick={handleContact}
          style={{
            flex: 1,
            padding: "10px",
            fontSize: "13px",
            fontWeight: "600",
            color: "#D22730",
            background: "none",
            border: "none",
            borderLeft: "1px solid #f3f4f6",
            cursor: "pointer",
          }}
        >
          Contact
        </button>
      </div>
    </motion.div>
  );
}
