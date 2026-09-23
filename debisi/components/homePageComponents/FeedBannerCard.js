"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client";
import { motion } from "framer-motion";
import { FaExternalLinkAlt, FaChevronLeft, FaChevronRight, FaBullhorn } from "react-icons/fa";
import {
  CLICK_FEED_BANNER,
  RECORD_FEED_BANNER_IMPRESSION,
} from "@/graphql/queries/business/feedBanners";

// R3: Single source of truth for the ad slot pricing copy
const AD_SLOT_PRICE_LABEL = "₦30,000 / week";

// I3: Auto-advance interval in milliseconds
const CAROUSEL_INTERVAL_MS = 3500;

/**
 * FeedBannerCard — Responsive web in-feed sponsored banner card
 * Matches the native look and feel of the Debisi feed cards while
 * handling impression recording and pay-per-click redirection.
 */
export function FeedBannerCard({ banner }) {
  const router = useRouter();
  const cardRef = useRef(null);
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const isHovering = useRef(false);

  // B3: Per-instance impression flag (not a shared module-level Set)
  // This fires once per component mount lifecycle, not once per browser session.
  const impressionFired = useRef(false);

  const [clickBanner] = useMutation(CLICK_FEED_BANNER);
  const [recordImpression] = useMutation(RECORD_FEED_BANNER_IMPRESSION);

  // Viewport-based impression recording (fires once per mount per banner)
  useEffect(() => {
    if (!banner?.id || impressionFired.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !impressionFired.current) {
          impressionFired.current = true;
          recordImpression({ variables: { id: banner.id } }).catch(() => {});
        }
      },
      { threshold: 0.3 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [banner?.id, recordImpression]);

  // I3: Auto-advance carousel, pauses when user is hovering
  const images = Array.isArray(banner?.images) ? banner.images : [];
  const hasMultipleImages = images.length > 1;

  useEffect(() => {
    if (!hasMultipleImages) return;
    const interval = setInterval(() => {
      if (!isHovering.current) {
        setActiveImgIndex((prev) => (prev + 1) % images.length);
      }
    }, CAROUSEL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [hasMultipleImages, images.length]);

  // B4: Route internal Debisi URLs with next/router; open external URLs in new tab
  const handleClick = () => {
    if (banner?.id) {
      clickBanner({ variables: { id: banner.id } }).catch(() => {});
    }
    if (!banner?.ctaUrl) return;
    const isInternal =
      banner.ctaUrl.startsWith("/") ||
      banner.ctaUrl.includes("debisi.ng");
    if (isInternal) {
      const path = banner.ctaUrl.startsWith("/")
        ? banner.ctaUrl
        : new URL(banner.ctaUrl).pathname;
      router.push(path);
    } else {
      window.open(banner.ctaUrl, "_blank", "noopener,noreferrer");
    }
  };

  const nextImage = (e) => {
    e.stopPropagation();
    setActiveImgIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setActiveImgIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // B5: Region copy reads from banner data; falls back to generic label
  const regionLabel = banner?.region || "Featured Partner";

  return (
    <motion.div
      ref={cardRef}
      whileHover={{ y: -3, boxShadow: "0 16px 36px -8px rgba(0, 0, 0, 0.12)" }}
      transition={{ duration: 0.25 }}
      onClick={handleClick}
      onMouseEnter={() => { isHovering.current = true; }}
      onMouseLeave={() => { isHovering.current = false; }}
      className="relative flex flex-col md:flex-row w-full rounded-2xl border border-purple-100/90 bg-white overflow-hidden shadow-xs hover:border-purple-300 transition-all cursor-pointer group"
    >
      {/* Left Info & CTA Content */}
      <div className="p-6 md:p-8 flex-1 flex flex-col justify-between order-2 md:order-1">
        <div>
          <div className="flex items-center justify-between gap-3 mb-3">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold tracking-wider uppercase px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200/70">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse" />
              Sponsored Ad
            </span>
            <span className="text-xs text-gray-400 flex items-center gap-1 group-hover:text-purple-600 transition-colors">
              Visit Sponsor <FaExternalLinkAlt className="text-[10px]" />
            </span>
          </div>

          <h3 className="text-lg sm:text-xl md:text-2xl font-black text-gray-900 group-hover:text-purple-700 transition-colors line-clamp-2 leading-snug">
            {banner?.title}
          </h3>

          {banner?.description && (
            <p className="text-xs sm:text-sm text-gray-600 mt-2.5 line-clamp-3 leading-relaxed">
              {banner.description}
            </p>
          )}
        </div>

        {/* Action Button & Details */}
        <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500">
            {regionLabel}
          </span>
          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 text-white text-xs sm:text-sm font-bold shadow-xs hover:bg-purple-700 group-hover:shadow-md transition-all group-hover:scale-102"
          >
            <span>Learn More</span>
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </button>
        </div>
      </div>

      {/* Right Media / Carousel Area */}
      {images.length > 0 && (
        <div className="relative w-full md:w-5/12 min-h-[220px] sm:min-h-[260px] md:min-h-[300px] bg-gray-100 overflow-hidden order-1 md:order-2">
          <Image
            src={images[activeImgIndex]}
            alt={banner?.title || "Sponsored banner image"}
            fill
            sizes="(max-width: 768px) 100vw, 45vw"
            className="object-cover group-hover:scale-103 transition-transform duration-700"
          />

          {/* Navigation Controls for multiple images */}
          {hasMultipleImages && (
            <>
              <button
                type="button"
                onClick={prevImage}
                aria-label="Previous image"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/45 hover:bg-black/75 text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 z-10 cursor-pointer shadow-sm"
              >
                <FaChevronLeft className="text-xs" />
              </button>
              <button
                type="button"
                onClick={nextImage}
                aria-label="Next image"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/45 hover:bg-black/75 text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 z-10 cursor-pointer shadow-sm"
              >
                <FaChevronRight className="text-xs" />
              </button>

              {/* Indicator Dots */}
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImgIndex(idx);
                    }}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      activeImgIndex === idx ? "bg-white w-5" : "bg-white/60 w-1.5"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </motion.div>
  );
}

/**
 * FallbackAdCard — When no active dynamic banner is available for an ad slot.
 * Matches the fallback sketch from MOBILE_FEED_BANNER_SKETCH.md
 * and guides business owners to /ad to book the slot.
 */
export function FallbackAdCard() {
  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: "0 12px 28px -6px rgba(0, 0, 0, 0.08)" }}
      transition={{ duration: 0.2 }}
      className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6 w-full rounded-2xl border border-dashed border-purple-200 bg-gradient-to-r from-purple-50/70 via-white to-pink-50/50 p-6 sm:p-8 shadow-xs overflow-hidden group"
    >
      <div className="max-w-2xl">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-purple-700 bg-purple-100/80 px-2.5 py-0.5 rounded-full border border-purple-200/50">
            Ad Space
          </span>
          <span className="text-xs text-gray-400 font-semibold flex items-center gap-1">
            <FaBullhorn className="text-[10px] text-purple-500" /> Slot Open
          </span>
        </div>

        <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 leading-snug">
          ✨ Promote your business across Oyo State
        </h3>
        <p className="text-xs sm:text-sm text-gray-600 mt-1.5 leading-relaxed">
          Put your brand directly in front of thousands of active buyers, clients, and partners in our live web &amp; mobile feed.
        </p>
      </div>

      <div className="flex flex-col sm:items-end gap-2 shrink-0">
        {/* R3: Price sourced from named constant */}
        <span className="text-xs font-bold text-purple-700">
          Only {AD_SLOT_PRICE_LABEL}
        </span>
        <Link
          href="/ad"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition-all group-hover:scale-102"
        >
          <span>Book This Ad Slot</span>
          <span>→</span>
        </Link>
      </div>
    </motion.div>
  );
}

export default FeedBannerCard;
