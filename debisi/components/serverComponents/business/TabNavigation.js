"use client";
import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSwipeable } from "react-swipeable";
import { useQuery } from "@apollo/client";
import VideoCard from "./VideoCard";
import BusinessCard from "./BusinessCard";
import NoticeCard from "./NoticeCard";
import Search from "../../otherComponents/Search";
import CardWrapper from "../../otherComponents/CardWrapper";
import { GET_BUSINESSES_PAGINATED } from "@/api/queries/business/business";
import { GET_BUSINESS_VIDEOS } from "@/api/queries/business/videos";
import { GET_BUSINESS_NOTICES } from "@/api/queries/business/notice";
import { useAuth } from "../../../contexts/AuthContext";

const PAGE_SIZE = 24;

const tabs = [
  { id: "Directory", label: "Directory" },
  { id: "Showroom", label: "Showroom" },
  { id: "Noticeboard", label: "Noticeboard" },
];

// ─── Per-tab query wrapper — only mounts when its tab is active ───────────────
// This prevents firing all 3 queries on mount regardless of active tab.
function useTabQuery(query, variables, skip) {
  return useQuery(query, {
    variables,
    skip, // ← query does NOT run while tab is inactive
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
  });
}

export default function TabNavigation({
  initialBusinesses = [],
  initialVideos = [],
  initialNotices = [],
  initialSearch = "",
  initialCategory = "",
  initialTown = "",
  initialCity = "",
  initialLg = "",
}) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(tabs[0].id);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(
    initialCategory ? { name: initialCategory } : null,
  );
  const [selectedLocation, setSelectedLocation] = useState(
    initialTown || initialCity || initialLg
      ? {
          name: initialTown || initialCity || initialLg,
          town: initialTown || undefined,
          city: initialCity || undefined,
          lg: initialLg || undefined,
        }
      : null,
  );

  // Track which tabs have ever been visited (so we don't re-fetch unnecessarily)
  const [visitedTabs, setVisitedTabs] = useState(new Set([tabs[0].id]));

  const handleTabSwitch = (tabId) => {
    setActiveTab(tabId);
    setVisitedTabs((prev) => new Set([...prev, tabId]));
  };

  // ─── Pagination state per tab ─────────────────────────────────────────────
  const [bizSkip, setBizSkip] = useState(0);
  const [videoSkip, setVideoSkip] = useState(0);
  const [noticeSkip, setNoticeSkip] = useState(0);

  // Reset pagination when search/filters change
  useEffect(() => {
    setBizSkip(0);
    setVideoSkip(0);
    setNoticeSkip(0);
  }, [searchTerm, selectedCategory, selectedLocation]);

  // ─── User location from auth context ─────────────────────────────────────
  const userLocation = useMemo(() => {
    if (selectedLocation) {
      // Handle location from both Location component (has type array) and AI URL (has explicit town/city/lg)
      const isTown =
        selectedLocation.type?.includes("town") || selectedLocation.town;
      const isCity =
        selectedLocation.type?.includes("city") || selectedLocation.city;
      const isLg = selectedLocation.type?.includes("lg") || selectedLocation.lg;

      return {
        town: isTown
          ? selectedLocation.town || selectedLocation.name
          : undefined,
        city: isCity
          ? selectedLocation.city || selectedLocation.name
          : undefined,
        lg: isLg ? selectedLocation.lg || selectedLocation.name : undefined,
      };
    }
    if (user && (user.town || user.city || user.lg)) {
      return {
        town: user.town?.name || user.town || undefined,
        city: user.city?.name || user.city || undefined,
        lg: user.lg?.name || user.lg || undefined,
      };
    }
    return null;
  }, [selectedLocation, user]);

  const bizVariables = {
    pagination: { skip: bizSkip, take: PAGE_SIZE },
    userLocation,
    search: searchTerm || undefined,
    category: selectedCategory?.name || undefined,
  };
  const videoVariables = {
    pagination: { skip: videoSkip, take: PAGE_SIZE },
    userLocation,
    search: searchTerm || undefined,
  };
  const noticeVariables = {
    pagination: { skip: noticeSkip, take: PAGE_SIZE },
    userLocation,
    search: searchTerm || undefined,
  };

  // ─── Lazy tab queries ─────────────────────────────────────────────────────
  // Each query only fires when its tab has been visited at least once.
  // The Directory tab is pre-visited so its query runs immediately (but after
  // hydration — initialBusinesses is shown in the meantime, no spinner flash).
  const {
    data: bizData,
    loading: bizLoading,
    fetchMore: bizFetchMore,
  } = useTabQuery(
    GET_BUSINESSES_PAGINATED,
    bizVariables,
    !visitedTabs.has("Directory"),
  );
  const {
    data: videoData,
    loading: videoLoading,
    fetchMore: videoFetchMore,
  } = useTabQuery(
    GET_BUSINESS_VIDEOS,
    videoVariables,
    !visitedTabs.has("Showroom"),
  );
  const {
    data: noticeData,
    loading: noticeLoading,
    fetchMore: noticeFetchMore,
  } = useTabQuery(
    GET_BUSINESS_NOTICES,
    noticeVariables,
    !visitedTabs.has("Noticeboard"),
  );

  // ─── Merge server-rendered initial data with Apollo results ──────────────
  // Show initialData instantly. Once Apollo returns, switch to live data.
  // This eliminates the "spinner replaces pre-rendered content" flash.
  const businesses = bizData?.businessesPaginated ?? initialBusinesses;
  const videos = videoData?.businessVideos ?? initialVideos;
  const notices = noticeData?.noticeboards ?? initialNotices;

  // ─── Client-side filtering (applied on top of query results) ─────────────
  const filteredBusinesses = useMemo(() => {
    let items = businesses;
    if (searchTerm) {
      const terms = searchTerm.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
      items = items.filter((b) => {
        return terms.some(t => {
          const addressMatch = b.addresses?.some(
            (addr) =>
              addr.town?.toLowerCase().includes(t) ||
              addr.city?.toLowerCase().includes(t) ||
              addr.lg?.toLowerCase().includes(t) ||
              addr.address1?.toLowerCase().includes(t) ||
              addr.address2?.toLowerCase().includes(t),
          );
          return (
            b.name?.toLowerCase().includes(t) ||
            b.description?.toLowerCase().includes(t) ||
            b.category?.replace(/_/g, " ").toLowerCase().includes(t) ||
            addressMatch
          );
        });
      });
    }
    if (selectedCategory) {
      const cat = (
        selectedCategory.name ||
        selectedCategory.displayName ||
        ""
      ).toLowerCase();
      items = items.filter((b) => b.category?.toLowerCase() === cat);
    }
    if (selectedLocation) {
      const loc = (
        selectedLocation.town ||
        selectedLocation.name ||
        selectedLocation.city ||
        selectedLocation.lg ||
        ""
      ).toLowerCase();
      if (loc) {
        items = items.filter((b) =>
          b.addresses?.some(
            (addr) =>
              addr.town?.toLowerCase().includes(loc) ||
              addr.city?.toLowerCase().includes(loc) ||
              addr.lg?.toLowerCase().includes(loc),
          ),
        );
      }
    }
    return items;
  }, [businesses, searchTerm, selectedCategory, selectedLocation]);

  const filteredVideos = useMemo(() => {
    let items = videos;
    if (searchTerm) {
      const terms = searchTerm.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
      items = items.filter((v) =>
        terms.some(t =>
          v.business?.name?.toLowerCase().includes(t) ||
          v.business?.description?.toLowerCase().includes(t) ||
          v.business?.category?.replace(/_/g, " ").toLowerCase().includes(t) ||
          v.locationBoundary?.toLowerCase().includes(t)
        )
      );
    }
    return items;
  }, [videos, searchTerm]);

  const filteredNotices = useMemo(() => {
    let items = notices;
    if (searchTerm) {
      const terms = searchTerm.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
      items = items.filter((n) =>
        terms.some(t =>
          n.title?.toLowerCase().includes(t) ||
          n.content?.toLowerCase().includes(t) ||
          n.business?.name?.toLowerCase().includes(t) ||
          n.business?.category?.replace(/_/g, " ").toLowerCase().includes(t)
        )
      );
    }
    return items;
  }, [notices, searchTerm]);

  // ─── Load More handlers ───────────────────────────────────────────────────
  const loadMoreBusinesses = () => {
    const newSkip = bizSkip + PAGE_SIZE;
    setBizSkip(newSkip);
    bizFetchMore({
      variables: {
        ...bizVariables,
        pagination: { skip: newSkip, take: PAGE_SIZE },
      },
    });
  };

  const loadMoreVideos = () => {
    const newSkip = videoSkip + PAGE_SIZE;
    setVideoSkip(newSkip);
    videoFetchMore({
      variables: {
        ...videoVariables,
        pagination: { skip: newSkip, take: PAGE_SIZE },
      },
    });
  };

  const loadMoreNotices = () => {
    const newSkip = noticeSkip + PAGE_SIZE;
    setNoticeSkip(newSkip);
    noticeFetchMore({
      variables: {
        ...noticeVariables,
        pagination: { skip: newSkip, take: PAGE_SIZE },
      },
    });
  };

  // ─── Swipe ────────────────────────────────────────────────────────────────
  const switchTab = (direction) => {
    const currentIndex = tabs.findIndex((t) => t.id === activeTab);
    const newIndex = (currentIndex + direction + tabs.length) % tabs.length;
    handleTabSwitch(tabs[newIndex].id);
  };

  const handlers = useSwipeable({
    onSwipedLeft: () => switchTab(1),
    onSwipedRight: () => switchTab(-1),
    trackTouch: true,
    trackMouse: true,
  });

  // Active tab loading state — only show loading indicator within active tab
  const activeLoading =
    (activeTab === "Directory" &&
      bizLoading &&
      filteredBusinesses.length === 0) ||
    (activeTab === "Showroom" && videoLoading && filteredVideos.length === 0) ||
    (activeTab === "Noticeboard" &&
      noticeLoading &&
      filteredNotices.length === 0);

  // ─── Shared "Load More" Button ────────────────────────────────────────────
  const LoadMore = ({ onClick, loading, count }) =>
    count >= PAGE_SIZE ? (
      <div className="flex justify-center w-full" style={{ marginTop: "40px" }}>
        <button
          onClick={onClick}
          disabled={loading}
          className="bg-black text-white font-bold rounded-2xl hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-50"
          style={{ padding: "14px 40px", fontSize: "14px" }}
        >
          {loading ? "Loading..." : "Load More"}
        </button>
      </div>
    ) : null;

  // ─── Empty state ──────────────────────────────────────────────────────────
  const EmptyState = ({ title, message }) => (
    <div className="col-span-full py-20 text-center">
      <h3 className="text-lg font-bold text-gray-500">{title}</h3>
      <p className="text-sm text-gray-500 max-w-xs mx-auto mt-2">{message}</p>
    </div>
  );

  return (
    <div
      className="w-full"
      style={{ padding: "clamp(8px, 3vw, 16px)" }}
      {...handlers}
    >
      {/* Search */}
      <div
        className="flex flex-col items-center text-center"
        style={{ padding: "10px", margin: "10px" }}
      >
        <Search
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          setSelectedCategory={setSelectedCategory}
          setSelectedLocation={setSelectedLocation}
          selectedCategory={selectedCategory}
          selectedLocation={selectedLocation}
        />
      </div>

      {/* Tab switcher */}
      <div
        className="flex bg-black w-full rounded-xl overflow-hidden"
        style={{ padding: "10px", marginBottom: "24px" }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabSwitch(tab.id)}
            className={`relative flex-1 p-4 text-center font-bold text-sm transition-all duration-300 ${
              activeTab === tab.id ? "text-white" : "text-gray-500"
            }`}
          >
            {tab.label}
            {/* {activeTab === tab.id && (
              <motion.div layoutId="activeTabBar" className="absolute bottom-0 left-2 right-2 h-0.5 bg-white rounded-full" />
            )} */}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <CardWrapper>
        <AnimatePresence mode="wait">
          {activeLoading ? (
            // Only show skeleton on truly empty first load — not when refreshing over existing data
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 min-[450px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 w-full"
              style={{ gap: "16px md:24px" }}
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse bg-gray-100 rounded-2xl h-64 w-full"
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="w-full"
            >
              {/* ── Directory Tab ── */}
              {activeTab === "Directory" && (
                <>
                  <div className="grid grid-cols-1 min-[450px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    {filteredBusinesses.length > 0 ? (
                      filteredBusinesses.map((b) => (
                        <BusinessCard
                          key={b.id}
                          {...b}
                          img={b.images?.find((img) => img.isLogo)?.imageUrl}
                          location={
                            b.addresses?.[0]?.town || b.addresses?.[0]?.city
                          }
                          rating={
                            b.reviews?.length > 0
                              ? (
                                  b.reviews.reduce(
                                    (acc, r) => acc + r.rating,
                                    0,
                                  ) / b.reviews.length
                                ).toFixed(1)
                              : "N/A"
                          }
                          reviews={b.reviews?.length || 0}
                          galleryImages={
                            b.images
                              ?.filter((img) => !img.isLogo && img.imageUrl)
                              .map((img) => ({
                                id: img.id,
                                url: img.imageUrl,
                              })) || []
                          }
                          isVerified={b.isVerified}
                        />
                      ))
                    ) : (
                      <EmptyState
                        title="No businesses found"
                        message="We couldn't find any businesses matching your search. Try adjusting your filters."
                      />
                    )}
                  </div>
                  <LoadMore
                    onClick={loadMoreBusinesses}
                    loading={bizLoading}
                    count={filteredBusinesses.length}
                  />
                </>
              )}

              {/* ── Showroom Tab ── */}
              {activeTab === "Showroom" && (
                <>
                  <div className="grid grid-cols-1 min-[450px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    {filteredVideos.length > 0 ? (
                      filteredVideos.map((v) => (
                        <VideoCard
                          key={v.id}
                          {...v}
                          name={v.business?.name}
                          thumbnail={v.videoUrl}
                          totalViews={v.views?.toLocaleString() || "0"}
                          businessName={v.business?.name}
                        />
                      ))
                    ) : (
                      <EmptyState
                        title="Showroom is empty"
                        message="No business videos have been uploaded in this area yet. Check back soon!"
                      />
                    )}
                  </div>
                  <LoadMore
                    onClick={loadMoreVideos}
                    loading={videoLoading}
                    count={filteredVideos.length}
                  />
                </>
              )}

              {/* ── Noticeboard Tab ── */}
              {activeTab === "Noticeboard" && (
                <>
                  <div className="grid grid-cols-1 min-[450px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    {filteredNotices.length > 0 ? (
                      filteredNotices.map((n) => (
                        <NoticeCard
                          key={n.id}
                          {...n}
                          message={n.content}
                          date={new Date(n.createdAt).toLocaleDateString()}
                        />
                      ))
                    ) : (
                      <EmptyState
                        title="Quiet on the noticeboard"
                        message="There are no active notices or announcements in this locality right now. Check back soon!"
                      />
                    )}
                  </div>
                  <LoadMore
                    onClick={loadMoreNotices}
                    loading={noticeLoading}
                    count={filteredNotices.length}
                  />
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardWrapper>
    </div>
  );
}
