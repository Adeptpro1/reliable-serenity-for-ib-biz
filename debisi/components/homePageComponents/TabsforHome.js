"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
// import VideoCard from "./serverComponents/VideoCard";
// import NoticeCard from "./serverComponents/NoticeCard";
import Image from "next/image";
import Link from "next/link";
import {
  FaHandshake,
  FaUser,
  FaStar,
  FaComments,
  FaUsers,
  FaPlay,
} from "react-icons/fa";
import BusinessCard from "../serverComponents/business/BusinessCard";
import NoticeCard from "../serverComponents/business/NoticeCard";
import VideoCard from "../serverComponents/business/VideoCard";

export default function FeaturedSections({
  businesses = [],
  videos = [],
  notices = [],
  loading = false
}) {
  const [scrollX, setScrollX] = useState(0);

  useEffect(() => {
    if (notices.length > 0) {
      const interval = setInterval(() => {
        setScrollX((prev) => (prev - 1) % (notices.length * 250));
      }, 50);
      return () => clearInterval(interval);
    }
  }, [notices.length]);

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
      <div style={{ backgroundColor: "#fff", color: "#333", padding: "10px" }}>
        <section>
          <div style={{ margin: "0 auto", padding: "2rem 1rem" }}>
            {/* Header with See All button */}
            <div style={{ marginBottom: "1.5rem" }} className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">
                Business Listings
              </h2>
              <Link href="/directory">
                <button className="text-blue-600 font-medium hover:text-blue-700 transition-colors duration-200">
                  See All
                </button>
              </Link>
            </div>

            {/* Business Cards Grid */}
            <div className="grid grid-cols-1 min-[450px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mt-5">
              {businesses.map((business) => (
                <BusinessCard 
                  key={business.id} 
                  {...business} 
                  img={business.images?.find((img) => img.isLogo)?.imageUrl}
                  location={business.addresses?.[0]?.town || business.addresses?.[0]?.city}
                  rating={business.reviews?.length > 0 ? (business.reviews.reduce((acc, r) => acc + r.rating, 0) / business.reviews.length).toFixed(1) : "N/A"}
                  reviews={business.reviews?.length || 0}
                  galleryImages={business.images?.filter(img => !img.isLogo && img.imageUrl).map(img => ({ id: img.id, url: img.imageUrl })) || []}
                  isVerified={business.isVerified}
                />
              ))}
            </div>
          </div>
        </section>
      </div>


    <div style={{ backgroundColor: "#fff", color: "#333", padding: "10px" }}>
      {/* Featured Video Listings */}
      <section>
        <div style={{ margin: "0 auto", padding: "2rem 1rem" }}>
          {/* Header with See All button */}
          <div
            style={{ marginBottom: "1.5rem" }}
            className="flex justify-between items-center"
          >
            <h2
              style={{ fontSize: "20px", fontWeight: "700", color: "#1f2937" }}
            >
              Business Videos
            </h2>
            <span
              style={{
                color: "#6b7280",
                fontWeight: "500",
                fontSize: "14px",
                background: "#f3f4f6",
                padding: "4px 12px",
                borderRadius: "50px"
              }}
            >
              Coming Soon
            </span>
          </div>

          <div>
            {/* Video Cards Grid */}
            <div
              className="
                grid 
                grid-cols-1 
                min-[450px]:grid-cols-2 
                sm:grid-cols-4 
                md:grid-cols-4 
                lg:grid-cols-4 
                xl:grid-cols-4 
                gap-3
                md:gap-6
              "
              style={{ marginTop: "20px" }}
            >
              {videos.slice(0, 6).map((video) => (
                <VideoCard key={video.id} {...video}/>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>

      {/* Notices */}
      <div style={{ backgroundColor: "#fff", color: "#333", padding: "10px" }}>
        <section>
          <div style={{ margin: "0 auto", padding: "2rem 1rem" }}>
            {/* Header with See All button */}
            <div 
              className="flex justify-between items-center mb-6"
            >
              <h2 
                style={{ fontSize: "20px", fontWeight: "700", color: "#1f2937" }}
              >
                Business Notices
              </h2>
              <span
                style={{
                  color: "#6b7280",
                  fontWeight: "500",
                  fontSize: "14px",
                  background: "#f3f4f6",
                  padding: "4px 12px",
                  borderRadius: "50px"
                }}
              >
                Coming Soon
              </span>
            </div>

            <div>
              {/* Notice Cards Grid */}
              <div
                className="
                  grid 
                  grid-cols-1 
                  min-[450px]:grid-cols-2 
                  sm:grid-cols-4 
                  md:grid-cols-4 
                  lg:grid-cols-4 
                  xl:grid-cols-4 
                  gap-3
                  md:gap-6
                "
                style={{ marginTop: "20px" }}
              >
                {notices.slice(0, 8).map((notice) => (
                 <NoticeCard key={notice.id} {...notice} />
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
