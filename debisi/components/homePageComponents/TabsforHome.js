"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import BusinessCard from "../serverComponents/business/BusinessCard";
import NoticeCard from "../serverComponents/business/NoticeCard";
import VideoCard from "../serverComponents/business/VideoCard";
import MosaicAds from "./MosaicAds";
import { GET_BUSINESSES_PAGINATED } from "@/graphql/queries/business/business";
import { GET_BUSINESS_VIDEOS } from "@/graphql/queries/business/videos";
import { GET_BUSINESS_NOTICES } from "@/graphql/queries/business/notice";

// ─── Geolocation Hook ────────────────────────────────────────────────────────
// Reads the town/city/lg from user profile if logged in, or from localStorage
// (set by the directory page's location picker).
// Does not prompt browser location permission since coordinates are not used.
function useGeolocation() {
  const { user } = useAuth();
  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState("idle");

  useEffect(() => {
    // 1. If user is logged in and has location in profile, use it
    if (user && (user.town || user.city || user.lg)) {
      const profileLocation = {
        town: user.town?.name || user.town || undefined,
        city: user.city?.name || user.city || undefined,
        lg: user.lg?.name || user.lg || undefined,
      };
      setUserLocation(profileLocation);
      setLocationStatus("granted");
      return;
    }

    // 2. Otherwise, check localStorage for a previously set location
    const storedLocation = (() => {
      try {
        const raw = localStorage.getItem("userLocation");
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    })();

    if (storedLocation) {
      setUserLocation(storedLocation);
      setLocationStatus("granted");
    } else {
      setUserLocation(null);
      setLocationStatus("denied");
    }
  }, [user]);

  return { userLocation, locationStatus };
}

// ─── "Near you" pill ─────────────────────────────────────────────────────────
function NearYouPill() {
  return (
    <span style={{
      marginLeft: "8px",
      fontSize: "11px",
      fontWeight: "600",
      background: "#f0fdf4",
      color: "#16a34a",
      padding: "2px 8px",
      borderRadius: "50px",
      border: "1px solid #bbf7d0",
      verticalAlign: "middle",
    }}>
      📍 Near you
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function FeaturedSections({
  businesses: ssrBusinesses = [],
  videos: ssrVideos = [],
  notices: ssrNotices = [],
  loading = false,
}) {
  const { userLocation, locationStatus } = useGeolocation();
  const hasLocation = !!userLocation;

  // Re-fetch all three sections with location when geolocation resolves.
  // fetchPolicy: "network-only" ensures we always get fresh sorted data.
  const { data: bizData } = useQuery(GET_BUSINESSES_PAGINATED, {
    variables: { pagination: { take: 8 }, userLocation: userLocation || undefined },
    skip: !hasLocation,
    fetchPolicy: "network-only",
  });

  const { data: vidData } = useQuery(GET_BUSINESS_VIDEOS, {
    variables: { pagination: { take: 8 }, userLocation: userLocation || undefined },
    skip: !hasLocation,
    fetchPolicy: "network-only",
  });

  const { data: noticeData } = useQuery(GET_BUSINESS_NOTICES, {
    variables: { pagination: { take: 8 }, userLocation: userLocation || undefined },
    skip: !hasLocation,
    fetchPolicy: "network-only",
  });

  // Prefer location-aware data; fall back to SSR data while waiting or if denied
  const businesses = (hasLocation ? bizData?.businessesPaginated : null) ?? ssrBusinesses;
  const videos     = (hasLocation ? vidData?.businessVideos       : null) ?? ssrVideos;
  const notices    = (hasLocation ? noticeData?.noticeboards      : null) ?? ssrNotices;

  if (loading) {
    return (
      <div style={{ width: "100%", padding: "5rem 0", textAlign: "center" }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
        <p style={{ marginTop: "1rem" }} className="text-gray-600">Loading live updates...</p>
      </div>
    );
  }

  return (
    <>
      {/* ─── Business Listings ──────────────────────────────────────────────── */}
      <div style={{ backgroundColor: "#fff", color: "#333", padding: "10px" }}>
        <section>
          <div style={{ margin: "0 auto", padding: "2rem 1rem" }}>
            <div style={{ marginBottom: "1.5rem" }} className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">
                Business Listings
                {locationStatus === "granted" && <NearYouPill />}
              </h2>
              <Link href="/directory">
                <button className="text-blue-600 font-medium hover:text-blue-700 transition-colors duration-200">
                  See All
                </button>
              </Link>
            </div>

            <MosaicAds placement="BUSINESS_TOP" />

            {/* Business Cards Grid
                - Backend sort: BOTW pin (+1000) → proximity → trust → recency
                - BOTW businesses automatically surface first; remaining slots
                  fill with normal directory-sorted businesses.
                - Max 8 cards total.                                            */}
            <div className="grid grid-cols-1 min-[450px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mt-5">
              {businesses.slice(0, 8).map((business) => (
                <div key={business.id} style={{ position: "relative" }}>
                  {/* Business of the Week badge */}
                  {business.isBusinessOfTheWeek && (
                    <div style={{
                      position: "absolute",
                      top: "8px",
                      left: "8px",
                      zIndex: 10,
                      background: "linear-gradient(135deg, #f59e0b, #d97706)",
                      color: "#fff",
                      fontSize: "10px",
                      fontWeight: "700",
                      letterSpacing: "0.4px",
                      padding: "3px 8px",
                      borderRadius: "50px",
                      boxShadow: "0 2px 8px rgba(245,158,11,0.4)",
                      textTransform: "uppercase",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      whiteSpace: "nowrap",
                    }}>
                      ⭐ Business of the Week
                    </div>
                  )}
                  <BusinessCard
                    {...business}
                    img={business.images?.find((img) => img.isLogo)?.imageUrl}
                    location={business.addresses?.[0]?.town || business.addresses?.[0]?.city}
                    rating={business.reviews?.length > 0
                      ? (business.reviews.reduce((acc, r) => acc + r.rating, 0) / business.reviews.length).toFixed(1)
                      : "N/A"}
                    reviews={business.reviews?.length || 0}
                    galleryImages={business.images?.filter(img => !img.isLogo && img.imageUrl).map(img => ({ id: img.id, url: img.imageUrl })) || []}
                    isVerified={business.isVerified}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* ─── Showroom / Business Videos ─────────────────────────────────────── */}
      <div style={{ backgroundColor: "#fff", color: "#333", padding: "10px" }}>
        <section>
          <div style={{ margin: "0 auto", padding: "2rem 1rem" }}>
            <div style={{ marginBottom: "1.5rem" }} className="flex justify-between items-center">
              <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#1f2937" }}>
                Business Videos
                {locationStatus === "granted" && <NearYouPill />}
              </h2>
              <span style={{
                color: "#6b7280",
                fontWeight: "500",
                fontSize: "14px",
                background: "#f3f4f6",
                padding: "4px 12px",
                borderRadius: "50px",
              }}>
                Coming Soon
              </span>
            </div>

            <MosaicAds placement="VIDEO_TOP" />

            {/* Video Cards Grid
                - Backend sort: proximity → boost/sponsored → recency decay
                - Max 8 cards.                                                  */}
            <div
              className="grid grid-cols-1 min-[450px]:grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-3 md:gap-6"
              style={{ marginTop: "20px" }}
            >
              {videos.slice(0, 8).map((video) => (
                <VideoCard key={video.id} {...video} />
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* ─── Business Notices ───────────────────────────────────────────────── */}
      <div style={{ backgroundColor: "#fff", color: "#333", padding: "10px" }}>
        <section>
          <div style={{ margin: "0 auto", padding: "2rem 1rem" }}>
            <div className="flex justify-between items-center mb-6">
              <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#1f2937" }}>
                Business Notices
                {locationStatus === "granted" && <NearYouPill />}
              </h2>
              <Link href="/directory?tab=Noticeboard">
                <button className="text-blue-600 font-medium hover:text-blue-700 transition-colors duration-200">
                  See All
                </button>
              </Link>
            </div>

            <MosaicAds placement="NOTICE_TOP" />

            {/* Notice Masonry Layout
                Why CSS columns?
                - True masonry: shorter cards flow UP into empty vertical space.
                - Zero JS overhead — pure CSS, SSR-safe, React-friendly.
                - break-inside:avoid keeps every card intact (no mid-card splits).
                - Backend sort: STATE boost → CITY boost → TOWN boost → recency
                - Max 8 cards.                                                  */}
            <div className="notice-masonry" style={{ marginTop: "20px" }}>
              {notices.slice(0, 8).map((notice) => (
                <div key={notice.id} className="notice-masonry__item">
                  <NoticeCard {...notice} />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Extra bottom Mosaic */}
      <MosaicAds placement="EXTRA_TOP" />
    </>
  );
}

