"use client";
import Image from "next/image";
import {
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaStar,
  FaMapMarkerAlt,
  FaEye,
  FaShare,
  FaPlay,
  FaCopy,
  FaWhatsapp,
  FaBoxOpen,
  FaImages,
  FaTiktok,
  FaTelegram,
  FaArrowRight,
} from "react-icons/fa";
import { HiOutlineGlobe, HiPhone } from "react-icons/hi";
import { CiShare1 } from "react-icons/ci";
import { useRouter } from "next/navigation";
import Link from "next/link";
import NoticeCard from "./NoticeCard";
import {
  GET_BUSINESS_BY_SLUG,
  TRACK_ACTIVITY,
  GET_BUSINESS_SHARES,
} from "@/graphql/queries/business/business";
import { GET_BUSINESS_PRODUCTS } from "@/graphql/queries/business/products";
import { useAuth } from "@/contexts/AuthContext";
import { gql, useQuery, useMutation } from "@apollo/client";
import { useState, useEffect, useMemo } from "react";
import bnwLogo from "@/images/debisi_logo_bnw.png";
import { toast } from "react-hot-toast";
import { FOLLOW_BUSINESS, UNFOLLOW_BUSINESS } from "@/graphql/mutations/business/follow";
import { IS_FOLLOWING, FOLLOWER_COUNT } from "@/graphql/queries/business/follow";

const CREATE_REVIEW = gql`
  mutation CreateReview($businessId: ID!, $rating: Int!) {
    createReview(businessId: $businessId, rating: $rating) {
      id
      rating
    }
  }
`;

const GalleryImage = ({ src, alt }) => {
  const [imgSrc, setImgSrc] = useState(src || bnwLogo);

  useEffect(() => {
    setImgSrc(src || bnwLogo);
  }, [src]);

  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill
      unoptimized
      style={{ objectFit: "cover" }}
      onError={() => setImgSrc(bnwLogo)}
    />
  );
};

function BusinessView({
  name: propName,
  description: propDescription,
  logo: propLogo,
  rating: propRating = "0",
  reviews: propReviews = "0",
  location: propLocation = "Location not available",
  category: propCategory,
  status: propStatus,
  isVerified: propIsVerified,
  galleryImages: propGalleryImages = [],
  addresses: propAddresses = [],
  contactUrls: propContactUrls = [],
  phone: propPhone,
  slug,
  id: propId,
  userId: propUserId,
  isFullPage = false,
  videos: propVideos = [],
  notices: propNotices = [],
  followerCount: propFollowerCount = 0,
  followLeadFields: propFollowLeadFields = [],
}) {
  const router = useRouter();
  const [name, setName] = useState(propName || "Brand Name");
  const [description, setDescription] = useState(
    propDescription ||
      "Your business description goes here with amazing details",
  );
  const [logo, setLogo] = useState(propLogo);
  const [rating, setRating] = useState(propRating);
  const [reviews, setReviews] = useState(propReviews);
  const [location, setLocation] = useState(propLocation);
  const [category, setCategory] = useState(propCategory);
  const [status, setStatus] = useState(propStatus);
  const [isVerified, setIsVerified] = useState(propIsVerified);
  const [galleryImages, setGalleryImages] = useState(propGalleryImages);
  const [addresses, setAddresses] = useState(propAddresses);
  const [contactUrls, setContactUrls] = useState(propContactUrls);
  const [phone, setPhone] = useState(propPhone);
  const [businessId, setBusinessId] = useState(propId || null);

  const [followerCount, setFollowerCount] = useState(propFollowerCount);

  const [currentRating, setCurrentRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [userRating, setUserRating] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pageViews, setPageViews] = useState(0);
  const [videoViews, setVideoViews] = useState(0);
  const [noticeViews, setNoticeViews] = useState(0);
  const [shares, setShares] = useState(0);
  const [totalRatings, setTotalRatings] = useState(reviews || 0);
  const [currentVideos, setCurrentVideos] = useState(propVideos);
  const [ownerId, setOwnerId] = useState(propUserId || null);
  const { user: currentUser, loading: authLoading } = useAuth();
  const [hasTrackedView, setHasTrackedView] = useState(false);

  const isOwner = useMemo(() => {
    const cid = currentUser?.id;
    // Prefer ownerId state, fallback to propUserId
    const oid = ownerId || propUserId;

    if (!cid || !oid) return false;

    const currentUserMatched =
      String(cid).toLowerCase() === String(oid).toLowerCase();

    if (currentUserMatched) return true;

    // Check if current user has this business in their list (backup check)
    if (currentUser?.businesses && currentUser.businesses.length > 0) {
      const bMatched = currentUser.businesses.some(
        (b) =>
          String(b.id).toLowerCase() ===
          String(businessId || propId || "").toLowerCase(),
      );
      if (bMatched) return true;
    }

    return false;
  }, [currentUser, ownerId, propUserId, businessId, propId]);

  const [currentNotices, setCurrentNotices] = useState(propNotices);
  const [imgSrc, setImgSrc] = useState(logo || bnwLogo);
  const [currentProducts, setCurrentProducts] = useState([]);
  const [currentImages, setCurrentImages] = useState(
    galleryImages.length > 0 ? galleryImages : [],
  );
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [shareMessage, setShareMessage] = useState("");

  const descriptionSnippet = description
    ? description.slice(0, 160) + (description.length > 160 ? "…" : "")
    : "";

  const origin = typeof window !== "undefined" && !window.location.hostname.includes("localhost")
    ? window.location.origin
    : "https://debisi.ng";
  const shareUrl = `${origin}/${slug}`;

  // Find a cover image: first look at logo (if it's a remote URL), then fallback to first gallery image
  const coverImageUrl = logo && typeof logo === "string" && logo.startsWith("http")
    ? logo
    : (galleryImages?.[0]?.url && typeof galleryImages[0].url === "string" && galleryImages[0].url.startsWith("http")
        ? galleryImages[0].url
        : null);

  // Helper to format Business sharing messages
  const formatBusinessShareText = (options = {}) => {
    const ratingText = totalRatings > 0
      ? `⭐ *Rating:* ${rating}/5 (${totalRatings} ${totalRatings === 1 ? 'review' : 'reviews'})`
      : `⭐ *Rating:* Be the first to review!`;

    const categoryText = category ? `📁 *Category:* ${category}` : "";
    const locationText = location && location !== "Location not available" ? `📍 *Location:* ${location}` : "";
    const aboutText = descriptionSnippet ? `📝 *About:*\n"${descriptionSnippet}"` : "";

    if (options.isTwitter) {
      return `Discover ${name} on Debisi! 🏢\n${ratingText.replace(/\*/g, "")}\n${category ? `📁 ${category} ` : ""}${location && location !== "Location not available" ? `📍 ${location}` : ""}\n\n${descriptionSnippet.slice(0, 100)}`;
    }

    if (options.isWhatsApp) {
      const parts = [
        `✨ *Discover ${name} on Debisi!* 🏢`,
        "",
        ratingText,
        categoryText || null,
        locationText || null,
        "",
        aboutText || null,
        "",
        `📞 *View details & contact them here:*`,
        `🔗 ${shareUrl}`,
        "",
        `---`,
        `💡 _List your business on Debisi today to get noticed and grow!_ 🚀`,
      ];
      return parts.filter((p) => p !== null).join("\n").replace(/\n{3,}/g, "\n\n");
    }

    if (options.isFacebook) {
      const parts = [
        `✨ Discover ${name} on Debisi! 🏢`,
        "",
        ratingText.replace(/\*/g, ""),
        categoryText.replace(/\*/g, "") || null,
        locationText.replace(/\*/g, "") || null,
        "",
        aboutText.replace(/\*/g, "") || null,
        "",
        `📌 Click below to view details and contact them:`,
        shareUrl,
        "",
        `---`,
        `💡 Grow your business too! Register on Debisi to reach thousands of customers. 🚀`,
      ];
      return parts.filter((p) => p !== null).join("\n").replace(/\n{3,}/g, "\n\n");
    }

    // Default / Clipboard / Native share
    const parts = [
      `✨ Discover ${name} on Debisi! 🏢`,
      "",
      ratingText.replace(/\*/g, ""),
      categoryText.replace(/\*/g, "") || null,
      locationText.replace(/\*/g, "") || null,
      "",
      aboutText.replace(/\*/g, "") || null,
      "",
      `📌 View details & contact them here:`,
      `🔗 ${shareUrl}`,
      "",
      `---`,
      `💡 Grow your business too! Register on Debisi to reach thousands of customers. 🚀`,
    ];
    return parts.filter((p) => p !== null).join("\n").replace(/\n{3,}/g, "\n\n");
  };

  const {
    data: qData,
    loading: qLoading,
    error: qError,
  } = useQuery(GET_BUSINESS_BY_SLUG, {
    variables: { slug },
    skip: !slug || isFullPage,
  });

  // Client-side fetch for fresh share count (bypasses ISR cache)
  const { data: shareData } = useQuery(GET_BUSINESS_SHARES, {
    variables: { slug },
    skip: !slug,
    fetchPolicy: "network-only", // Ensure we get fresh data from DB
  });

  const { data: pData } = useQuery(GET_BUSINESS_PRODUCTS, {
    variables: {
      businessId: qData?.businessBySlug?.id || businessId || propId,
    },
    skip: !(qData?.businessBySlug?.id || businessId || propId),
  });

  const [createReview] = useMutation(CREATE_REVIEW);
  const [trackActivity] = useMutation(TRACK_ACTIVITY);

  // Activity Tracking
  useEffect(() => {
    const idToTrack = businessId || propId;
    if (idToTrack && !hasTrackedView) {
      trackActivity({
        variables: { input: { businessId: idToTrack, activityType: "VIEW" } },
      }).catch(() => {});
      setHasTrackedView(true);
    }
  }, [businessId, propId, hasTrackedView, trackActivity]);

  useEffect(() => {
    if (shareData?.businessBySlug) {
      setShares(shareData.businessBySlug.shares);
    }
  }, [shareData]);

  if (qError) {
    console.error("GraphQL Error in BusinessView:", qError);
  }

  useEffect(() => {
    if (!authLoading) {
      setIsAuthenticated(!!currentUser);
    }
  }, [currentUser, authLoading]);

  useEffect(() => {
    if (qData?.businessBySlug) {
      const biz = qData.businessBySlug;
      setBusinessId(biz.id);
      setName(biz.name);
      setDescription(biz.description);
      setOwnerId(biz.user?.id);

      const logoImg = biz.images?.find((img) => img.isLogo)?.imageUrl;
      setLogo(logoImg);

      setCategory(biz.category);
      setIsVerified(biz.isVerified);
      setPhone(biz.phone);

      const avgRating =
        biz.reviews?.length > 0
          ? (
              biz.reviews.reduce((acc, r) => acc + r.rating, 0) /
              biz.reviews.length
            ).toFixed(1)
          : "0.0";
      setRating(avgRating);
      setReviews(biz.reviews?.length || 0);
      setTotalRatings(biz.reviews?.length || 0);

      // Initialize user's existing rating
      if (currentUser && biz.reviews) {
        const myReview = biz.reviews.find(
          (r) => r.userId === currentUser.id || r.user?.id === currentUser.id,
        );
        if (myReview) {
          setUserRating(myReview.rating);
        }
      }

      const addr = biz.addresses?.[0];
      if (addr) {
        setLocation(
          `${addr.town || addr.city || ""} ${addr.lg || ""}`.trim() ||
            "Location not available",
        );
      }
      if (biz.addresses) {
        setAddresses(biz.addresses);
      }
      if (biz.contactUrls) {
        setContactUrls(biz.contactUrls);
      }

      const imgs =
        biz.images
          ?.filter(
            (img) => !img.isLogo && img.imageUrl && img.imageUrl.trim() !== "",
          )
          .map((img) => ({ id: img.id, url: img.imageUrl })) || [];

      setGalleryImages(imgs);
      setCurrentImages(imgs);
      if (biz.shares !== undefined) {
        setShares(biz.shares);
      }
      if (biz.followerCount !== undefined) {
        setFollowerCount(biz.followerCount);
      }
      if (biz.videos) {
        setCurrentVideos(biz.videos);
      }
      if (biz.notices) {
        setCurrentNotices(biz.notices);
      }
    }
  }, [qData, hasTrackedView, currentUser]);

  // Sync props to state if props change (important for hydrated SSR)
  useEffect(() => {
    if (propId) setBusinessId(propId);
    if (propUserId) setOwnerId(propUserId);
    if (propName && propName !== "Brand Name") setName(propName);
    if (
      propDescription &&
      propDescription !==
        "Your business description goes here with amazing details"
    )
      setDescription(propDescription);
    if (propLogo) setLogo(propLogo);
    if (propRating) setRating(propRating);
    if (propReviews) {
      setReviews(propReviews);
      setTotalRatings(propReviews);
    }
    if (propLocation && propLocation !== "Location not available")
      setLocation(propLocation);
    if (propCategory) setCategory(propCategory);
    if (propStatus) setStatus(propStatus);
    if (propIsVerified !== undefined) setIsVerified(propIsVerified);
    if (propGalleryImages) {
      setGalleryImages(propGalleryImages);
      setCurrentImages(propGalleryImages);
    }
    if (propAddresses?.length > 0) setAddresses(propAddresses);
    if (propContactUrls?.length > 0) setContactUrls(propContactUrls);
    if (propPhone) setPhone(propPhone);
    if (propVideos?.length > 0) setCurrentVideos(propVideos);
    if (propNotices?.length > 0) setCurrentNotices(propNotices);
  }, [
    propId,
    propUserId,
    propName,
    propDescription,
    propLogo,
    propRating,
    propReviews,
    propLocation,
    propCategory,
    propStatus,
    propIsVerified,
    propGalleryImages,
    propAddresses,
    propContactUrls,
    propPhone,
    propVideos,
    propNotices,
  ]);

  useEffect(() => {
    if (pData?.businessProducts) {
      setCurrentProducts(
        pData.businessProducts.map((p) => ({
          id: p.id,
          name: p.title,
          price: `₦${p.price?.toLocaleString()}`,
          image: p.images?.[0]?.imageUrl || bnwLogo,
        })),
      );
    }
  }, [pData]);

  useEffect(() => {
    const validImg =
      typeof logo === "string" && logo.trim() !== "" ? logo : bnwLogo;
    setImgSrc(validImg);
  }, [logo]);

  const { data: followStatusData, refetch: refetchFollowStatus } = useQuery(IS_FOLLOWING, {
    variables: { businessId },
    skip: !currentUser || !businessId,
  });

  const { data: followerCountData, refetch: refetchFollowerCount } = useQuery(FOLLOWER_COUNT, {
    variables: { businessId },
    skip: !businessId,
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (followerCountData?.followerCount !== undefined) {
      setFollowerCount(followerCountData.followerCount);
    }
  }, [followerCountData]);

  const isFollowingUser = followStatusData?.isFollowing || false;

  const [followBusiness] = useMutation(FOLLOW_BUSINESS);
  const [unfollowBusiness] = useMutation(UNFOLLOW_BUSINESS);

  if (qLoading) {
    return (
      <div className="flex justify-center items-center h-64 w-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const handleRating = async (selectedRating) => {
    const effectiveBusinessId = businessId || propId;
    // Re-verify owner status at time of click
    const currentUserId = currentUser?.id;
    const effectiveOwnerId = ownerId || propUserId;
    const effectiveIsOwner =
      isOwner ||
      (currentUserId && effectiveOwnerId
        ? String(currentUserId).toLowerCase() ===
          String(effectiveOwnerId).toLowerCase()
        : false);

    if (!effectiveBusinessId) {
      setError(
        "Business ID missing. Please refresh the page or contact support.",
      );
      console.error("Missing Business ID:", { businessId, propId, slug });
      return;
    }
    if (effectiveIsOwner) {
      toast.error("Owners cannot rate their own business");
      return;
    }
    try {
      setIsSubmitting(true);
      setError(null);
      await createReview({
        variables: { businessId: effectiveBusinessId, rating: selectedRating },
      });

      // Only increment total count if it's a new review
      if (userRating === null) {
        setTotalRatings((prev) => prev + 1);
      }

      setUserRating(selectedRating);
      toast.success("Thank you for your rating!");
    } catch (err) {
      if (
        err.message.includes("network-request-failed") ||
        err.message.includes("Failed to fetch")
      ) {
        toast.error("Network Error: Please check your connection");
      } else {
        toast.error(
          err.message || "Failed to submit rating. Please login first.",
        );
      }
      setError(err.message || "Failed to submit rating. Please login first.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!currentUser) {
      toast.error("Please login to follow");
      return;
    }

    if (isFollowingUser) {
      // Unfollow
      const confirmUnfollow = window.confirm("Are you sure you want to unfollow this business?");
      if (!confirmUnfollow) return;

      try {
        await unfollowBusiness({
          variables: { businessId },
        });
        refetchFollowStatus();
        refetchFollowerCount();
        toast.success("You have unfollowed this business.");
      } catch (err) {
        toast.error(err.message || "Failed to unfollow.");
      }
    } else {
      await executeFollowDirectly();
    }
  };

  const executeFollowDirectly = async () => {
    try {
      await followBusiness({
        variables: {
          input: { businessId },
        },
      });
      refetchFollowStatus();
      refetchFollowerCount();
      toast.success("You are now following this business!");
    } catch (err) {
      toast.error(err.message || "Failed to follow business.");
    }
  };

  const handleContact = () => {
    const primaryContact =
      contactUrls?.find((c) => c.isPrimary) || contactUrls?.[0];

    // Track click activity
    if (businessId || propId) {
      trackActivity({
        variables: {
          input: { businessId: businessId || propId, activityType: "CLICK" },
        },
      }).catch(() => {});
    }

    if (primaryContact?.url) {
      window.open(primaryContact.url, "_blank");
    } else if (phone) {
      window.open(`tel:${phone}`, "_self");
    }
  };

  const getSocialIcon = (type, url) => {
    const baseProps = {
      href: url,
      target: "_blank",
      rel: "noopener noreferrer",
    };
    const iconStyle = {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "50px",
      height: "50px",
      borderRadius: "50%",
      color: "white",
      fontSize: "20px",
      textDecoration: "none",
      transition: "all 0.3s ease",
      boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
    };
    const hoverStyle = {
      transform: "translateY(-3px) scale(1.1)",
      boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
    };
    const makeHover = (shadowColor) => ({
      onMouseEnter: (e) => {
        e.currentTarget.style.transform = hoverStyle.transform;
        e.currentTarget.style.boxShadow = `0 8px 20px ${shadowColor}`;
      },
      onMouseLeave: (e) => {
        e.currentTarget.style.transform = "translateY(0) scale(1)";
        e.currentTarget.style.boxShadow = `0 5px 15px ${shadowColor}`;
      },
      onClick: () => {
        if (businessId || propId) {
          trackActivity({
            variables: {
              input: {
                businessId: businessId || propId,
                activityType: "CLICK",
              },
            },
          }).catch(() => {});
        }
      },
    });
    switch (type) {
      case "INSTAGRAM":
        return (
          <a
            {...baseProps}
            style={{
              ...iconStyle,
              background: "linear-gradient(135deg, #e4405f 0%, #c13584 100%)",
              boxShadow: "0 5px 15px rgba(228, 64, 95, 0.3)",
            }}
            {...makeHover("rgba(228, 64, 95, 0.4)")}
          >
            <FaInstagram />
          </a>
        );
      case "FACEBOOK":
        return (
          <a
            {...baseProps}
            style={{
              ...iconStyle,
              background: "linear-gradient(135deg, #1877f2 0%, #0d6efd 100%)",
              boxShadow: "0 5px 15px rgba(24, 119, 242, 0.3)",
            }}
            {...makeHover("rgba(24, 119, 242, 0.4)")}
          >
            <FaFacebook />
          </a>
        );
      case "TWITTER":
        return (
          <a
            {...baseProps}
            style={{
              ...iconStyle,
              background: "linear-gradient(135deg, #1da1f2 0%, #0ea5e9 100%)",
              boxShadow: "0 5px 15px rgba(29, 161, 242, 0.3)",
            }}
            {...makeHover("rgba(29, 161, 242, 0.4)")}
          >
            <FaTwitter />
          </a>
        );
      case "TIKTOK":
        return (
          <a
            {...baseProps}
            style={{
              ...iconStyle,
              background: "linear-gradient(135deg, #000000 0%, #25f4ee 100%)",
              boxShadow: "0 5px 15px rgba(0, 0, 0, 0.3)",
            }}
            {...makeHover("rgba(0, 0, 0, 0.4)")}
          >
            <FaTiktok />
          </a>
        );
      case "WHATSAPP":
        return (
          <a
            {...baseProps}
            style={{
              ...iconStyle,
              background: "linear-gradient(135deg, #25d366 0%, #128c7e 100%)",
              boxShadow: "0 5px 15px rgba(37, 211, 102, 0.3)",
            }}
            {...makeHover("rgba(37, 211, 102, 0.4)")}
          >
            <FaWhatsapp />
          </a>
        );
      case "TELEGRAM":
        return (
          <a
            {...baseProps}
            style={{
              ...iconStyle,
              background: "linear-gradient(135deg, #0088cc 0%, #229ed9 100%)",
              boxShadow: "0 5px 15px rgba(0, 136, 204, 0.3)",
            }}
            {...makeHover("rgba(0, 136, 204, 0.4)")}
          >
            <FaTelegram />
          </a>
        );
      case "WEBSITE":
        return (
          <a
            {...baseProps}
            style={{
              ...iconStyle,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              boxShadow: "0 5px 15px rgba(102, 126, 234, 0.3)",
            }}
            {...makeHover("rgba(102, 126, 234, 0.4)")}
          >
            <HiOutlineGlobe />
          </a>
        );
      default:
        return null;
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: `${name} - Debisi`,
      text: formatBusinessShareText(),
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setShares((prev) => prev + 1);
        try {
          await trackActivity({
            variables: { input: { businessId, activityType: "SHARE" } },
          });
        } catch (err) {
          console.error("Track activity failed:", err);
        }
        setShareMessage("Shared successfully!");
        setTimeout(() => setShareMessage(""), 3000);
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
    const text = formatBusinessShareText();
    try {
      await navigator.clipboard.writeText(text);
      setShareMessage("Link copied to clipboard!");
      setShares((prev) => prev + 1);
      try {
        await trackActivity({
          variables: { input: { businessId, activityType: "SHARE" } },
        });
      } catch (err) {
        console.error("Track activity failed:", err);
      }
      setTimeout(() => setShareMessage(""), 3000);
      setShowShareOptions(false);
    } catch (error) {
      setShareMessage("Failed to copy link");
      setTimeout(() => setShareMessage(""), 3000);
    }
  };

  const shareOnWhatsApp = () => {
    const text = formatBusinessShareText({ isWhatsApp: true });
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    setShares((prev) => prev + 1);
    try {
      trackActivity({
        variables: { input: { businessId, activityType: "SHARE" } },
      });
    } catch (err) {
      console.error("Track activity failed:", err);
    }
    setShareMessage("Opening WhatsApp...");
    setTimeout(() => setShareMessage(""), 3000);
    setShowShareOptions(false);
  };

  const shareOnFacebook = () => {
    const quote = encodeURIComponent(formatBusinessShareText({ isFacebook: true }));
    const url = encodeURIComponent(shareUrl);
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${quote}`,
      "_blank",
    );
    setShares((prev) => prev + 1);
    try {
      trackActivity({
        variables: { input: { businessId, activityType: "SHARE" } },
      });
    } catch (err) {
      console.error("Track activity failed:", err);
    }
    setShareMessage("Opening Facebook...");
    setTimeout(() => setShareMessage(""), 3000);
    setShowShareOptions(false);
  };

  const shareOnTwitter = () => {
    const tweetText = encodeURIComponent(formatBusinessShareText({ isTwitter: true }));
    const url = encodeURIComponent(shareUrl);
    window.open(
      `https://twitter.com/intent/tweet?text=${tweetText}&url=${url}`,
      "_blank",
    );
    setShares((prev) => prev + 1);
    try {
      trackActivity({
        variables: { input: { businessId, activityType: "SHARE" } },
      });
    } catch (err) {
      console.error("Track activity failed:", err);
    }
    setShareMessage("Opening Twitter...");
    setTimeout(() => setShareMessage(""), 3000);
    setShowShareOptions(false);
  };

  const handleSlug = () => {
    if (slug && slug.trim() !== "") {
      router.push(`/${slug}`);
    } else {
      router.push("/");
    }
  };

  const handleNoticeboardClick = () => {
    router.push(`/directory?search=${encodeURIComponent(name)}&business=${encodeURIComponent(slug)}&tab=Noticeboard`);
  };

  const handleShowroomClick = () => {
    router.push(`/directory?search=${encodeURIComponent(name)}&business=${encodeURIComponent(slug)}&tab=Showroom`);
  };

  const handleProductsClick = () => {
    router.push(`/marketplace`);
  };

  return (
    <div className="business-view">
      {/* Hero Section with Gradient Overlay */}
      <div
        style={{
          position: "relative",
          padding: "40px 30px",
          textAlign: "center",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
        }}
      >
        {/* Go To Icon Button - Hidden if on full page */}
        {!isFullPage && (
          <button
            className="shareBtn-Icon"
            onClick={handleSlug}
            style={{
              position: "absolute",
              top: 18,
              right: 18,
              zIndex: 3,
              background: "rgba(255,255,255,0.15)",
              border: "none",
              borderRadius: "50%",
              width: 40,
              height: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "background 0.2s",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
            title="Go to business page"
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(255,255,255,0.25)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "rgba(255,255,255,0.15)")
            }
          >
            <CiShare1 style={{ color: "white", fontSize: 20 }} />
          </button>
        )}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.3)",
            zIndex: 1,
          }}
        ></div>

        <div style={{ position: "relative", zIndex: 2 }}>
          <h1
            style={{
              fontSize: "clamp(20px, 5vw, 28px)",
              fontWeight: "bold",
              margin: "0 0 10px 0",
              textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              width: "100%",
            }}
          >
            <span
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: isFullPage ? "none" : "calc(100% - 40px)",
                display: "inline-block",
              }}
              title={name}
            >
              {name}
            </span>
            {!!isVerified && (
              <span
                className="flex-shrink-0"
                style={{
                  color: "#60a5fa",
                  display: "inline-flex",
                  alignItems: "center",
                }}
                title="Verified Business"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.64.304 1.25.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            )}
          </h1>
          <p
            style={{
              fontSize: "16px",
              margin: "0 0 15px 0",
              opacity: 0.9,
              lineHeight: "1.5",
            }}
          >
            {description}
          </p>

          {(isVerified || followerCount > 0) && (
            <p
              style={{
                fontSize: "14px",
                margin: "0 0 25px 0",
                fontWeight: "600",
                color: "#e0e7ff",
                textShadow: "1px 1px 2px rgba(0,0,0,0.2)",
              }}
            >
              👥 {followerCount || 0} {followerCount === 1 ? "Follower" : "Followers"}
            </p>
          )}

          <div
            style={{
              display: "flex",
              gap: "15px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={handleContact}
              style={{
                padding: "12px 30px",
                background: "rgba(255,255,255,0.2)",
                border: "2px solid rgba(255,255,255,0.3)",
                borderRadius: "25px",
                color: "white",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.3s ease",
                backdropFilter: "blur(10px)",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "rgba(255,255,255,0.3)";
                e.target.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "rgba(255,255,255,0.2)";
                e.target.style.transform = "translateY(0)";
              }}
            >
              Contact Us
            </button>

            {!isOwner && (
              isVerified ? (
                <button
                  onClick={handleFollowToggle}
                  style={{
                    padding: "12px 30px",
                    background: isFollowingUser
                      ? "transparent"
                      : "linear-gradient(to right, #10b981, #059669)",
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderRadius: "25px",
                    color: "white",
                    fontSize: "16px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    backdropFilter: "blur(10px)",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = isFollowingUser ? "rgba(255,255,255,0.1)" : "linear-gradient(to right, #34d399, #10b981)";
                    e.target.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = isFollowingUser ? "transparent" : "linear-gradient(to right, #10b981, #059669)";
                    e.target.style.transform = "translateY(0)";
                  }}
                >
                  {isFollowingUser ? "✓ Following" : "Follow"}
                </button>
              ) : (
                isFollowingUser && (
                  <button
                    onClick={handleFollowToggle}
                    style={{
                      padding: "12px 30px",
                      background: "transparent",
                      border: "2px solid rgba(255,255,255,0.15)",
                      borderRadius: "25px",
                      color: "white",
                      fontSize: "16px",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      backdropFilter: "blur(10px)",
                    }}
                  >
                    ✓ Following (Unfollow)
                  </button>
                )
              )
            )}
          </div>

          {shareMessage && (
            <div
              style={{
                marginTop: "15px",
                padding: "8px 16px",
                background: "rgba(255,255,255,0.9)",
                color: "#333",
                borderRadius: "20px",
                fontSize: "14px",
                fontWeight: "500",
                animation: "fadeIn 0.3s ease",
              }}
            >
              {shareMessage}
            </div>
          )}
        </div>
      </div>

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
            zIndex: 1000,
          }}
          onClick={() => setShowShareOptions(false)}
        >
          <div
            style={{
              background: "white",
              borderRadius: "20px",
              padding: "30px",
              maxWidth: "300px",
              width: "90%",
              textAlign: "center",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                fontSize: "20px",
                fontWeight: "600",
                color: "#333",
                margin: "0 0 20px 0",
              }}
            >
              Share This Business
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
                  padding: "15px",
                  background:
                    "linear-gradient(135deg, #25d366 0%, #128c7e 100%)",
                  border: "none",
                  borderRadius: "15px",
                  color: "white",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)";
                }}
              >
                <FaWhatsapp style={{ fontSize: "24px" }} />
                WhatsApp
              </button>

              <button
                onClick={shareOnFacebook}
                style={{
                  padding: "15px",
                  background:
                    "linear-gradient(135deg, #1877f2 0%, #0d6efd 100%)",
                  border: "none",
                  borderRadius: "15px",
                  color: "white",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)";
                }}
              >
                <FaFacebook style={{ fontSize: "24px" }} />
                Facebook
              </button>

              <button
                onClick={shareOnTwitter}
                style={{
                  padding: "15px",
                  background:
                    "linear-gradient(135deg, #1da1f2 0%, #0ea5e9 100%)",
                  border: "none",
                  borderRadius: "15px",
                  color: "white",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)";
                }}
              >
                <FaTwitter style={{ fontSize: "24px" }} />
                Twitter
              </button>

              <button
                onClick={copyToClipboard}
                style={{
                  padding: "15px",
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  border: "none",
                  borderRadius: "15px",
                  color: "white",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)";
                }}
              >
                <FaCopy style={{ fontSize: "24px" }} />
                Copy Link
              </button>
            </div>

            <button
              onClick={() => setShowShareOptions(false)}
              style={{
                padding: "10px 20px",
                background: "#f8f9fa",
                border: "1px solid #dee2e6",
                borderRadius: "10px",
                color: "#6c757d",
                fontSize: "14px",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "#e9ecef";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "#f8f9fa";
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Main Image Section */}
      <div
        style={{
          padding: "40px 20px",
          background: "linear-gradient(to bottom, #ffffff, #f9fafb)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            position: "relative",
            maxWidth: "600px",
            margin: "0 auto",
            borderRadius: "24px",
            overflow: "hidden",
            boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
            border: "6px solid white",
            transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-10px) scale(1.02)";
            e.currentTarget.style.boxShadow = "0 30px 60px rgba(0,0,0,0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0) scale(1)";
            e.currentTarget.style.boxShadow = "0 20px 50px rgba(0,0,0,0.15)";
          }}
        >
          <Image
            src={imgSrc}
            alt={name || "Business"}
            width={600}
            height={400}
            style={{
              width: "100%",
              height: "auto",
              objectFit: "cover",
              display: "block",
            }}
            onError={() => setImgSrc(bnwLogo)}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to top, rgba(0,0,0,0.2), transparent)",
              pointerEvents: "none",
            }}
          />
        </div>
      </div>

      {/* Gallery/Images Section */}
      <div
        style={{
          padding: "25px 30px",
          background: "white",
          textAlign: "center",
          borderTop: "1px solid #f0f0f0",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "20px",
          }}
        >
          <FaImages
            style={{ color: "#667eea", marginRight: "10px", fontSize: "20px" }}
          />
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "600",
              color: "#333",
              margin: 0,
            }}
          >
            Gallery
          </h2>
        </div>
        {currentImages.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: "15px",
              justifyItems: "center",
            }}
          >
            {currentImages.map((image) => (
              <div
                key={image.id}
                style={{
                  width: "100%",
                  aspectRatio: "1",
                  position: "relative",
                  borderRadius: "15px",
                  overflow: "hidden",
                  boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
                  cursor: "pointer",
                  transition: "transform 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                <GalleryImage src={image.url} alt="Gallery Item" />
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "20px",
              background: "#f8f9fa",
              borderRadius: "10px",
              border: "2px dashed #dee2e6",
            }}
          >
            <p style={{ color: "#6c757d", margin: 0, fontSize: "14px" }}>
              No images uploaded
            </p>
          </div>
        )}
      </div>

      {/* Address Section */}
      <div
        style={{
          padding: "25px 30px",
          background: "white",
          textAlign: "center",
          borderTop: "1px solid #f0f0f0",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "15px",
          }}
        >
          <FaMapMarkerAlt
            style={{ color: "#667eea", marginRight: "8px", fontSize: "20px" }}
          />
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "600",
              color: "#333",
              margin: 0,
            }}
          >
            Our Location
          </h2>
        </div>
        {addresses.map((addr, idx) => (
          <div
            key={idx}
            style={{
              color: "#666",
              margin: "0 0 10px 0",
              fontSize: "16px",
              lineHeight: "1.5",
            }}
          >
            {addr.address1 && (
              <p style={{ margin: "0 0 5px 0" }}>
                Headquarters: {addr.address1}
              </p>
            )}
            {addr.address2 && (
              <p style={{ margin: "0 0 5px 0" }}>Branch: {addr.address2}</p>
            )}
          </div>
        ))}
        {addresses?.[0]?.address1 && (
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              addresses[0].address1,
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              padding: "12px 25px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              borderRadius: "25px",
              textDecoration: "none",
              fontWeight: "600",
              fontSize: "14px",
              transition: "all 0.3s ease",
              boxShadow: "0 5px 15px rgba(102, 126, 234, 0.3)",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 8px 20px rgba(102, 126, 234, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 5px 15px rgba(102, 126, 234, 0.3)";
            }}
            onClick={() => {
              if (businessId || propId) {
                trackActivity({
                  variables: {
                    input: {
                      businessId: businessId || propId,
                      activityType: "CLICK",
                    },
                  },
                }).catch(() => {});
              }
            }}
          >
            View on Google Maps
          </a>
        )}
      </div>

      {/* Social URLs Section */}
      <div
        style={{
          padding: "25px 30px",
          background: "white",
          textAlign: "center",
          borderTop: "1px solid #f0f0f0",
        }}
      >
        <h2
          style={{
            fontSize: "20px",
            fontWeight: "600",
            color: "#333",
            margin: "0 0 20px 0",
          }}
        >
          Follow Us
        </h2>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          {contactUrls?.map((link, idx) => (
            <span key={idx}>{getSocialIcon(link.type, link.url)}</span>
          ))}
        </div>
      </div>

      {/* Content Stats Section */}
      <div
        style={{
          padding: "25px 30px",
          background: "white",
          borderTop: "1px solid #f0f0f0",
        }}
      >
        <h2
          style={{
            fontSize: "20px",
            fontWeight: "600",
            color: "#333",
            textAlign: "center",
            margin: "0 0 25px 0",
          }}
        >
          Your Content
        </h2>

        {/* Videos Section */}
        <div style={{ marginBottom: "25px" }}>
          <div
            onClick={!isFullPage ? handleShowroomClick : undefined}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: !isFullPage ? "space-between" : "flex-start",
              marginBottom: "15px",
              cursor: !isFullPage ? "pointer" : "default",
              padding: !isFullPage ? "12px 15px" : "0",
              background: !isFullPage ? "#f8fafc" : "transparent",
              borderRadius: !isFullPage ? "12px" : "0",
              border: !isFullPage ? "1px solid #e2e8f0" : "none",
              transition: "all 0.2s",
            }}
            className={!isFullPage ? "hover:bg-gray-50 hover:border-purple-300" : ""}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <FaPlay
                style={{
                  color: "#667eea",
                  marginRight: "10px",
                  fontSize: "18px",
                }}
              />
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "#333",
                  margin: 0,
                }}
              >
                Showroom Videos ({currentVideos.length})
              </h3>
            </div>
            {!isFullPage && (
              <span style={{ fontSize: "12px", color: "purple", fontWeight: "700" }}>
                View All &rarr;
              </span>
            )}
          </div>

          {isFullPage && (
            <>
              {currentVideos.length > 0 ? (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: "10px" }}
                >
                  {currentVideos.slice(0, 2).map((video) => (
                    <div
                      key={video.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "12px 15px",
                        background: "#f8f9fa",
                        borderRadius: "10px",
                        border: "1px solid #e9ecef",
                      }}
                    >
                      <span
                        style={{
                          color: "#495057",
                          fontSize: "14px",
                          fontWeight: "500",
                          flex: 1,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {video.title}
                      </span>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          color: "#6c757d",
                          fontSize: "12px",
                        }}
                      >
                        <FaEye style={{ marginRight: "5px" }} />
                        {video.views} views
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: "20px",
                    background: "#f8f9fa",
                    borderRadius: "10px",
                    border: "2px dashed #dee2e6",
                  }}
                >
                  <p
                    style={{
                      color: "#6c757d",
                      margin: 0,
                      fontSize: "14px",
                    }}
                  >
                    No videos in showroom
                  </p>
                </div>
              )}

              {currentVideos.length > 2 && (
                <div style={{ display: "flex", justifyContent: "center", marginTop: "15px" }}>
                  <button
                    onClick={handleShowroomClick}
                    style={{
                      padding: "8px 20px",
                      background: "transparent",
                      border: "1px solid #667eea",
                      borderRadius: "20px",
                      color: "#667eea",
                      fontSize: "14px",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = "#667eea";
                      e.target.style.color = "white";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "transparent";
                      e.target.style.color = "#667eea";
                    }}
                  >
                    See All &rarr;
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Notices Section */}
        <div style={{ marginBottom: "25px" }}>
          <div
            onClick={!isFullPage ? handleNoticeboardClick : undefined}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: !isFullPage ? "space-between" : "flex-start",
              marginBottom: "15px",
              cursor: !isFullPage ? "pointer" : "default",
              padding: !isFullPage ? "12px 15px" : "0",
              background: !isFullPage ? "#f8fafc" : "transparent",
              borderRadius: !isFullPage ? "12px" : "0",
              border: !isFullPage ? "1px solid #e2e8f0" : "none",
              transition: "all 0.2s",
            }}
            className={!isFullPage ? "hover:bg-gray-50 hover:border-purple-300" : ""}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <FaEye
                style={{
                  color: "#667eea",
                  marginRight: "10px",
                  fontSize: "18px",
                }}
              />
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "#333",
                  margin: 0,
                }}
              >
                Notice Board ({currentNotices.length})
              </h3>
            </div>
            {!isFullPage && (
              <span style={{ fontSize: "12px", color: "purple", fontWeight: "700" }}>
                View All &rarr;
              </span>
            )}
          </div>

          {isFullPage && (
            <>
              {currentNotices.length > 0 ? (
                <div
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                  style={{ marginTop: "15px" }}
                >
                  {currentNotices.slice(0, 2).map((notice) => (
                    <NoticeCard
                      key={notice.id}
                      {...notice}
                      business={{ id: businessId, name, slug }}
                      date={new Date(notice.createdAt).toLocaleDateString()}
                    />
                  ))}
                </div>
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: "20px",
                    background: "#f8f9fa",
                    borderRadius: "10px",
                    border: "2px dashed #dee2e6",
                  }}
                >
                  <p
                    style={{
                      color: "#6c757d",
                      margin: 0,
                      fontSize: "14px",
                    }}
                  >
                    No notices on board
                  </p>
                </div>
              )}

              {currentNotices.length > 2 && (
                <div style={{ display: "flex", justifyContent: "center", marginTop: "15px" }}>
                  <button
                    onClick={handleNoticeboardClick}
                    style={{
                      padding: "8px 20px",
                      background: "transparent",
                      border: "1px solid #667eea",
                      borderRadius: "20px",
                      color: "#667eea",
                      fontSize: "14px",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = "#667eea";
                      e.target.style.color = "white";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "transparent";
                      e.target.style.color = "#667eea";
                    }}
                  >
                    See All &rarr;
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Products Section */}
        <div style={{ marginTop: "25px" }}>
          <div
            onClick={!isFullPage ? handleProductsClick : undefined}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: !isFullPage ? "space-between" : "flex-start",
              marginBottom: "15px",
              cursor: !isFullPage ? "pointer" : "default",
              padding: !isFullPage ? "12px 15px" : "0",
              background: !isFullPage ? "#f8fafc" : "transparent",
              borderRadius: !isFullPage ? "12px" : "0",
              border: !isFullPage ? "1px solid #e2e8f0" : "none",
              transition: "all 0.2s",
            }}
            className={!isFullPage ? "hover:bg-gray-50 hover:border-purple-300" : ""}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <FaBoxOpen
                style={{
                  color: "#667eea",
                  marginRight: "10px",
                  fontSize: "18px",
                }}
              />
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "#333",
                  margin: 0,
                }}
              >
                Featured Products ({currentProducts.length})
              </h3>
            </div>
            {!isFullPage && (
              <span style={{ fontSize: "12px", color: "purple", fontWeight: "700" }}>
                View All &rarr;
              </span>
            )}
          </div>

          {isFullPage && (
            <>
              {currentProducts.length > 0 ? (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "15px",
                  }}
                >
                  {currentProducts.slice(0, 2).map((product) => (
                    <div
                      key={product.id}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        background: "#f8f9fa",
                        borderRadius: "15px",
                        border: "1px solid #e9ecef",
                        overflow: "hidden",
                        transition: "all 0.3s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-5px)";
                        e.currentTarget.style.boxShadow =
                          "0 10px 20px rgba(0,0,0,0.05)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      <div
                        style={{
                          position: "relative",
                          height: "140px",
                          width: "100%",
                        }}
                      >
                        <GalleryImage src={product.image} alt={product.name} />
                      </div>
                      <div style={{ padding: "12px", textAlign: "left" }}>
                        <h4
                          style={{
                            margin: "0 0 5px 0",
                            fontSize: "14px",
                            color: "#333",
                            fontWeight: "600",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {product.name}
                        </h4>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "14px",
                            color: "#667eea",
                            fontWeight: "bold",
                          }}
                        >
                          {product.price}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: "20px",
                    background: "#f8f9fa",
                    borderRadius: "10px",
                    border: "2px dashed #dee2e6",
                  }}
                >
                  <p style={{ color: "#6c757d", margin: 0, fontSize: "14px" }}>
                    No products available
                  </p>
                </div>
              )}

              {currentProducts.length > 2 && (
                <div style={{ display: "flex", justifyContent: "center", marginTop: "15px" }}>
                  <button
                    onClick={handleProductsClick}
                    style={{
                      padding: "8px 20px",
                      background: "transparent",
                      border: "1px solid #667eea",
                      borderRadius: "20px",
                      color: "#667eea",
                      fontSize: "14px",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = "#667eea";
                      e.target.style.color = "white";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "transparent";
                      e.target.style.color = "#667eea";
                    }}
                  >
                    See All &rarr;
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Shares Section */}
      <div
        style={{
          padding: "25px 30px",
          background: "white",
          textAlign: "center",
          borderTop: "1px solid #f0f0f0",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "15px",
          }}
        >
          <FaShare
            style={{ color: "#667eea", marginRight: "10px", fontSize: "20px" }}
          />
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "600",
              color: "#333",
              margin: 0,
            }}
          >
            Share
          </h2>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "15px",
          }}
        >
          <div
            style={{
              display: "inline-block",
              padding: "15px 30px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              borderRadius: "15px",
              color: "white",
              fontSize: "18px",
              fontWeight: "bold",
              boxShadow: "0 5px 15px rgba(102, 126, 234, 0.3)",
            }}
          >
            {shares} Total Shares
          </div>

          <button
            onClick={handleShare}
            style={{
              padding: "8px 16px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              border: "none",
              borderRadius: "20px",
              color: "white",
              fontSize: "12px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s ease",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: "0 3px 10px rgba(102, 126, 234, 0.3)",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px) scale(1.05)";
              e.target.style.boxShadow = "0 5px 15px rgba(102, 126, 234, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0) scale(1)";
              e.target.style.boxShadow = "0 3px 10px rgba(102, 126, 234, 0.3)";
            }}
          >
            <FaShare style={{ fontSize: "10px" }} />
            Share Now
          </button>
        </div>
      </div>

      {/* Ratings Section */}
      <div
        style={{
          padding: "25px 30px",
          background: "white",
          textAlign: "center",
          borderTop: "1px solid #f0f0f0",
        }}
      >
        <h2
          style={{
            fontSize: "20px",
            fontWeight: "600",
            color: "#333",
            margin: "0 0 15px 0",
          }}
        >
          Customer Ratings
        </h2>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "10px",
            fontSize: "24px",
            color: "#ffd700",
          }}
        >
          {[1, 2, 3, 4, 5].map((star) => (
            <FaStar
              key={star}
              style={{
                color:
                  star <= Math.floor(parseFloat(rating)) ? "#ffd700" : "#ddd",
                margin: "0 2px",
              }}
            />
          ))}
        </div>

        <p
          style={{
            color: "#666",
            margin: "0 0 5px 0",
            fontSize: "16px",
            fontWeight: "500",
          }}
        >
          Rated {rating}/5 by customers
        </p>

        <p
          style={{
            color: "#888",
            margin: "0 0 20px 0",
            fontSize: "14px",
          }}
        >
          Total Ratings: {totalRatings}
        </p>

        {/* Rating Input - Only for visitors, not owners */}
        {!isOwner && (
          <div>
            <p
              style={{
                fontSize: "14px",
                color: "#666",
                margin: "0 0 15px 0",
              }}
            >
              Rate this business:
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "8px",
                marginBottom: "15px",
              }}
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  style={{
                    fontSize: "28px",
                    color:
                      isAuthenticated && !isOwner && (hover || rating) >= star
                        ? "#ffd700"
                        : "#ddd",
                    background: "none",
                    border: "none",
                    cursor:
                      isAuthenticated && !isOwner ? "pointer" : "not-allowed",
                    transition: "all 0.2s ease",
                    transform:
                      isAuthenticated && !isOwner ? "scale(1)" : "scale(1)",
                    filter:
                      isAuthenticated && !isOwner ? "none" : "grayscale(100%)",
                  }}
                  onClick={() => handleRating(star)}
                  onMouseEnter={() =>
                    isAuthenticated && !isOwner && setHover(star)
                  }
                  onMouseLeave={() =>
                    isAuthenticated && !isOwner && setHover(0)
                  }
                  disabled={isSubmitting || !isAuthenticated || isOwner}
                >
                  <FaStar />
                </button>
              ))}
            </div>

            {error && (
              <p
                style={{
                  color: "#dc3545",
                  fontSize: "14px",
                  margin: "10px 0 0 0",
                  padding: "8px 12px",
                  background: "#f8d7da",
                  borderRadius: "8px",
                  border: "1px solid #f5c6cb",
                }}
              >
                {error}
              </p>
            )}

            {userRating && (
              <p
                style={{
                  color: "#28a745",
                  fontSize: "14px",
                  margin: "10px 0 0 0",
                  padding: "8px 12px",
                  background: "#d4edda",
                  borderRadius: "8px",
                  border: "1px solid #c3e6cb",
                }}
              >
                Thank you for rating!
              </p>
            )}

            {!isAuthenticated && !error && (
              <p
                style={{
                  color: "#667eea",
                  fontSize: "14px",
                  margin: "10px 0 0 0",
                  padding: "8px 12px",
                  background: "#e3f2fd",
                  borderRadius: "8px",
                  border: "1px solid #bbdefb",
                }}
              >
                Please login to rate this business
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default BusinessView;
