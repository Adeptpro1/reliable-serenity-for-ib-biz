"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@apollo/client";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

import BusinessCard from "../serverComponents/business/BusinessCard";
import NoticeCard from "../serverComponents/business/NoticeCard";
import VideoCard from "../serverComponents/business/VideoCard";
import FeedProductCard from "./FeedProductCard";
import MosaicAds from "./MosaicAds";
import StoriesBar from "./StoriesBar";

import { GET_BUSINESSES_PAGINATED } from "@/graphql/queries/business/business";
import { GET_BUSINESS_VIDEOS } from "@/graphql/queries/business/videos";
import { GET_BUSINESS_NOTICES } from "@/graphql/queries/business/notice";
import { GET_PRODUCTS_FEED } from "@/graphql/queries/business/productsFeed";
import { useAuth } from "@/contexts/AuthContext";

// ─── Brand Gradient Constant ───────────────────────────────────────────────
const BRAND_GRADIENT = "linear-gradient(to right, purple, #D22730)";

// ─── Location Hook ────────────────────────────────────────────────────────────
function useUserLocation() {
  const { user } = useAuth();
  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState("idle");

  useEffect(() => {
    if (user && (user.town || user.city || user.lg)) {
      setUserLocation({
        town: user.town?.name || user.town || undefined,
        city: user.city?.name || user.city || undefined,
        lg: user.lg?.name || user.lg || undefined,
      });
      setLocationStatus("granted");
      return;
    }
    try {
      const raw = localStorage.getItem("userLocation");
      const stored = raw ? JSON.parse(raw) : null;
      if (stored) {
        setUserLocation(stored);
        setLocationStatus("granted");
      } else {
        setLocationStatus("denied");
      }
    } catch {
      setLocationStatus("denied");
    }
  }, [user]);

  return { userLocation, locationStatus };
}

// ─── Feed Interleaving Logic ──────────────────────────────────────────────────
function buildFeed(businesses, videos, notices, products) {
  const biz = [...businesses];
  const vid = [...videos];
  const not = [...notices];
  const pro = [...products];

  const feed = [];
  let bi = 0, vi = 0, ni = 0, pi = 0;
  let slot = 0;

  while (bi < biz.length || vi < vid.length || ni < not.length || pi < pro.length) {
    const pos = slot % 12;

    if ((pos === 0 || pos === 1 || pos === 9) && bi < biz.length) {
      feed.push({ type: "business", data: biz[bi++] });
    } else if ((pos === 2 || pos === 8) && vi < vid.length) {
      feed.push({ type: "video", data: vid[vi++] });
    } else if ((pos === 3 || pos === 4 || pos === 10) && ni < not.length) {
      feed.push({ type: "notice", data: not[ni++] });
    } else if ((pos === 5 || pos === 11) && (bi < biz.length || vi < vid.length || ni < not.length || pi < pro.length)) {
      feed.push({ type: "ad", placement: pos === 5 ? "BUSINESS_TOP" : "NOTICE_TOP" });
    } else if ((pos === 6 || pos === 7) && pi < pro.length) {
      feed.push({ type: "product", data: pro[pi++] });
    } else {
      if (bi < biz.length) feed.push({ type: "business", data: biz[bi++] });
      else if (vi < vid.length) feed.push({ type: "video", data: vid[vi++] });
      else if (ni < not.length) feed.push({ type: "notice", data: not[ni++] });
      else if (pi < pro.length) feed.push({ type: "product", data: pro[pi++] });
      else break;
    }
    slot++;
  }

  return feed;
}

// ─── Shimmer Skeleton Card ───────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-3.5 shadow-xs flex flex-col gap-3 overflow-hidden">
      <div className="h-44 w-full rounded-xl bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] animate-shimmer" />
      <div className="flex flex-col gap-2">
        <div className="h-3.5 w-1/2 rounded bg-gray-200" />
        <div className="h-4 w-4/5 rounded bg-gray-200" />
        <div className="h-3 w-2/3 rounded bg-gray-100" />
      </div>
    </div>
  );
}

// ─── Location Pill ───────────────────────────────────────────────────────────
function NearYouPill() {
  return (
    <span className="inline-flex items-center gap-1 ml-2 text-xs font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200 align-middle">
      📍 Near you in Oyo State
    </span>
  );
}

// ─── Section Header Metadata ──────────────────────────────────────────────────
const TYPE_META = {
  business: { label: "SME Businesses", icon: "🏢", href: "/directory", cta: "See All Businesses" },
  video:    { label: "Showroom Reels", icon: "🎬", href: "/showroom",   cta: "Watch Showroom Clips" },
  notice:   { label: "Notices & Announcements", icon: "📢", href: "/directory?tab=Noticeboard", cta: "See All Notices" },
  product:  { label: "Marketplace Products", icon: "🛍️", href: "/marketplace", cta: "Shop Marketplace" },
};

// ─── Main Optimized HomeFeed Component ───────────────────────────────────────
export default function HomeFeed({
  businesses: ssrBusinesses = [],
  videos: ssrVideos = [],
  notices: ssrNotices = [],
  products: ssrProducts = [],
}) {
  const { userLocation, locationStatus } = useUserLocation();
  const hasLocation = !!userLocation;

  // Optimized cache-first policy
  const { data: bizData, loading: bizLoading } = useQuery(GET_BUSINESSES_PAGINATED, {
    variables: { pagination: { take: 12 }, userLocation: userLocation || undefined },
    skip: !hasLocation,
    fetchPolicy: "cache-first",
  });

  const { data: vidData, loading: vidLoading } = useQuery(GET_BUSINESS_VIDEOS, {
    variables: { pagination: { take: 8 }, userLocation: userLocation || undefined },
    skip: !hasLocation,
    fetchPolicy: "cache-first",
  });

  const { data: noticeData, loading: noticeLoading } = useQuery(GET_BUSINESS_NOTICES, {
    variables: { pagination: { take: 10 }, userLocation: userLocation || undefined },
    skip: !hasLocation,
    fetchPolicy: "cache-first",
  });

  const { data: productData, loading: productLoading } = useQuery(GET_PRODUCTS_FEED, {
    variables: { pagination: { take: 10 }, userLocation: userLocation || undefined },
    skip: !hasLocation,
    fetchPolicy: "cache-first",
  });

  const businesses = (hasLocation && bizData?.businessesPaginated?.length)
    ? bizData.businessesPaginated
    : ssrBusinesses;
  const videos = (hasLocation && vidData?.businessVideos?.length)
    ? vidData.businessVideos
    : ssrVideos;
  const notices = (hasLocation && noticeData?.noticeboards?.length)
    ? noticeData.noticeboards
    : ssrNotices;
  const products = (hasLocation && productData?.products?.length)
    ? productData.products
    : ssrProducts;

  const isRefetching = hasLocation && (bizLoading || vidLoading || noticeLoading || productLoading);

  const feed = useMemo(
    () => buildFeed(businesses, videos, notices, products),
    [businesses, videos, notices, products]
  );

  // Loading skeleton screen
  if (isRefetching && !feed.length) {
    return (
      <section className="bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </section>
    );
  }

  // Empty state
  if (!businesses.length && !videos.length && !notices.length && !products.length) {
    return (
      <section className="py-16 px-4 text-center text-gray-500 bg-white">
        <div className="text-6xl mb-4">🏙️</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Feed Content Yet</h3>
        <p className="text-sm max-w-md mx-auto text-gray-600">
          Be among the first businesses in Oyo State to showcase products, videos, and announcements on Debisi!
        </p>
        <Link
          href="/register"
          style={{ background: BRAND_GRADIENT }}
          className="inline-flex items-center gap-2 mt-6 px-6 py-3 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-105"
        >
          Register Your Business →
        </Link>
      </section>
    );
  }

  return (
    <section className="bg-gray-50/80 min-h-[600px] py-6">
      {/* ── Stories Bar ─────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <StoriesBar businesses={businesses} />
      </div>

      {/* ── Location refresh indicator ───────────────────────────── */}
      <AnimatePresence>
        {isRefetching && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="max-w-7xl mx-auto mb-4 px-4"
          >
            <div className="flex items-center justify-center gap-2 py-2 px-4 bg-purple-50 text-purple-700 text-xs font-semibold rounded-lg border border-purple-100 shadow-xs">
              <span className="animate-pulse">📍</span>
              Personalizing feed for your area in Oyo State...
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Feed Section Header ──────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center flex-wrap gap-1">
            Discover Oyo State SMEs & Marketplace
            {locationStatus === "granted" && <NearYouPill />}
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">
            Interleaved live feed of verified businesses, products, showroom reels, and announcements
          </p>
        </div>
        <Link
          href="/directory"
          className="text-xs sm:text-sm text-purple-700 hover:text-[#D22730] font-bold transition-colors shrink-0"
        >
          Explore All Directory →
        </Link>
      </div>

      {/* ── Interleaved Feed Grid (Responsive Desktop & Mobile Layout) ──── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {renderFeedRows(feed)}
      </div>

      {/* ── CTA Footer Navigation ──────────────────────────────────── */}
      <div className="border-t border-gray-100 bg-white py-12 px-4 text-center shadow-xs">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-lg font-black text-gray-900 mb-1">Explore Debisi Ecosystem</h3>
          <p className="text-xs sm:text-sm text-gray-500 mb-6">
            Discover thousands of local businesses, products, videos, and noticeboards across Ibadan, Oyo, Ogbomosho, Iseyin, and Saki.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            {Object.values(TYPE_META).map(({ href, cta }) => (
              <Link
                key={href}
                href={href}
                style={{ background: BRAND_GRADIENT }}
                className="px-5 py-3 rounded-xl text-white font-bold text-xs sm:text-sm shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200"
              >
                {cta}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Helper: Render Interleaved Rows ──────────────────────────────────────────
function renderFeedRows(feed) {
  const rows = [];
  let i = 0;

  while (i < feed.length) {
    const item = feed[i];

    // Full-width ad placement banner
    if (item.type === "ad") {
      rows.push(
        <motion.div
          key={`ad-${i}`}
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.35 }}
          className="my-6"
        >
          <MosaicAds placement={item.placement} />
        </motion.div>
      );
      i++;
      continue;
    }

    // Pair items of the same type into responsive grid rows
    const next = feed[i + 1];
    const usePair = next && next.type === item.type;

    const showLabel = i === 0 || feed[i - 1].type !== item.type;
    const meta = TYPE_META[item.type];

    const row = (
      <div key={`row-${i}`} className="mb-6">
        {showLabel && (
          <div className="flex justify-between items-center pt-4 pb-3 border-b border-gray-100 mb-3">
            <span className="text-sm font-extrabold text-gray-800 flex items-center gap-2">
              <span className="text-base">{meta.icon}</span>
              <span>{meta.label}</span>
            </span>
            <Link
              href={meta.href}
              className="text-xs text-purple-700 hover:text-[#D22730] font-bold transition-colors"
            >
              {meta.cta} →
            </Link>
          </div>
        )}

        {/* Responsive Grid: 1-col on mobile, 2-col on tablet/desktop when paired */}
        <div
          className={`grid gap-4 sm:gap-6 ${
            usePair
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-2"
              : "grid-cols-1"
          }`}
        >
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            <FeedItem item={item} />
          </motion.div>

          {usePair && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.3, delay: 0.08 }}
              className="h-full"
            >
              <FeedItem item={next} />
            </motion.div>
          )}
        </div>
      </div>
    );

    rows.push(row);
    i += usePair ? 2 : 1;
  }

  return rows;
}

// ─── Helper: Render Single Feed Item Component ────────────────────────────────
function FeedItem({ item }) {
  if (item.type === "business") {
    const b = item.data;
    return (
      <BusinessCard
        {...b}
        img={b.images?.find((img) => img.isLogo)?.imageUrl}
        location={b.addresses?.[0]?.town || b.addresses?.[0]?.city}
        rating={
          b.reviews?.length > 0
            ? (b.reviews.reduce((a, r) => a + r.rating, 0) / b.reviews.length).toFixed(1)
            : "N/A"
        }
        reviews={b.reviews?.length || 0}
        galleryImages={
          b.images
            ?.filter((img) => !img.isLogo && img.imageUrl)
            .map((img) => ({ id: img.id, url: img.imageUrl })) || []
        }
        isVerified={b.isVerified}
      />
    );
  }

  if (item.type === "video") {
    return <VideoCard {...item.data} />;
  }

  if (item.type === "notice") {
    return <NoticeCard {...item.data} />;
  }

  if (item.type === "product") {
    return <FeedProductCard {...item.data} />;
  }

  return null;
}
