"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation"; 
import { FaHeart, FaShareAlt, FaDownload, FaArrowLeft } from "react-icons/fa";
import { useSwipeable } from "react-swipeable";
import { useQuery } from "@apollo/client";
import { GET_BUSINESS_VIDEOS } from "@/api/queries/business/videos";
import LoadingSpinner from "@/components/otherComponents/LoadingSpinner";

const VideoPlayer = () => {
  const router = useRouter(); 
  const { data, loading, error } = useQuery(GET_BUSINESS_VIDEOS, {
    variables: { pagination: { take: 20 } }
  });

  const videos = data?.businessVideos || [];
  const backUrl = "/directory"; 

  const [currentIndex, setCurrentIndex] = useState(0);
  const [screenHeight, setScreenHeight] = useState("100vh");

  /** Fix mobile height issues */
  useEffect(() => {
    const updateHeight = () => {
      setScreenHeight(`${window.innerHeight}px`);
    };

    updateHeight(); 
    window.addEventListener("resize", updateHeight);

    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  /** Handle Swipes */
  const handleSwipe = (direction) => {
    if (direction === "up" && currentIndex < videos.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else if (direction === "down" && currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else if (direction === "left" || direction === "right") {
      router.push(backUrl); 
    }
  };

  /** Handle Keyboard Arrows (For Desktop) */
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "ArrowUp") handleSwipe("up");
      if (e.key === "ArrowDown") handleSwipe("down");
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") router.push(backUrl);
    },
    [currentIndex, videos.length]
  );

  /** Handle Mouse Scroll (For Desktop) */
  const handleScroll = useCallback(
    (e) => {
      if (e.deltaY < 0) handleSwipe("down");
      if (e.deltaY > 0) handleSwipe("up");
    },
    [currentIndex, videos.length]
  );

  /** Attach Event Listeners for Keyboard & Scroll */
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("wheel", handleScroll);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("wheel", handleScroll);
    };
  }, [handleKeyDown, handleScroll]);

  /** Swipe Gestures */
  const handlers = useSwipeable({
    onSwipedUp: () => handleSwipe("up"),
    onSwipedDown: () => handleSwipe("down"),
    onSwipedLeft: () => handleSwipe("left"),
    onSwipedRight: () => handleSwipe("right"),
    preventScrollOnSwipe: true,
  });

  /** Handle Like */
  const handleLike = () => {
    alert("Video liked!");
  };

  /** Handle Share */
  const handleShare = async () => {
    const name = videos[currentIndex]?.business?.name || "Abraham";
    const shareUrl = "https://www.debisi.ng/";
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Debisi NG",
          text: `Hey I'm ${name}, I am using Debisi to drive more customers worldwide, it's great and I'd like you to try it out.`,
          url: shareUrl,
        });
      } else {
        alert(`Share this link: ${shareUrl}`);
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  /** Handle Download */
  const handleDownload = () => {
    if (!videos[currentIndex]) return;
    const link = document.createElement("a");
    link.href = videos[currentIndex].videoUrl;
    link.download = videos[currentIndex].business?.name || "video";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return (
    <div style={{ height: screenHeight, backgroundColor: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', textAlign: 'center' }}>
      <p>Unable to load videos. Please check your connection.</p>
    </div>
  );

  if (videos.length === 0) {
    return (
      <div style={{ height: screenHeight, backgroundColor: '#000', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', textAlign: 'center' }}>
        <p>No videos found in the showroom yet.</p>
        <button 
          onClick={() => router.push(backUrl)}
          style={{ marginTop: '20px', backgroundColor: '#9333ea', color: '#fff', padding: '10px 20px', borderRadius: '9999px' }}
        >
          Go Back
        </button>
      </div>
    );
  }

  const currentVideo = videos[currentIndex];

  return (
    <div
      className="relative w-full flex items-center justify-center bg-black overflow-hidden"
      style={{ height: screenHeight }}
      {...handlers}
    >
      {/* Back Button */}
      <button
        style={{ position: 'absolute', top: '20px', left: '20px', padding: '10px', backgroundColor: 'rgba(17, 24, 39, 0.5)', borderRadius: '9999px', color: '#fff', fontSize: '20px', zIndex: 50, border: 'none', cursor: 'pointer' }}
        onClick={() => router.push(backUrl)}
      >
        <FaArrowLeft />
      </button>

      {/* Video Player */}
      <video
        key={currentVideo.id}
        src={currentVideo.videoUrl}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        autoPlay
        loop
        controls={false}
      />

      {/* Overlay Details */}
      <div style={{ position: 'absolute', bottom: '100px', left: '20px', color: '#fff', zIndex: 50 }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0' }}>{currentVideo.business?.name}</h2>
        <p style={{ fontSize: '14px', opacity: 0.8, marginTop: '8px', maxWidth: '300px' }}>
          {currentVideo.business?.description?.substring(0, 100)}...
        </p>
        <button 
          onClick={() => router.push(`/business/${currentVideo.business?.slug}`)}
          style={{ marginTop: '16px', backgroundColor: '#9333ea', color: '#fff', padding: '10px 24px', borderRadius: '9999px', border: 'none', cursor: 'pointer', fontWeight: '600' }}
        >
          Learn More
        </button>
      </div>

      {/* Side Buttons */}
      <div style={{ position: 'absolute', right: '20px', bottom: '100px', display: 'flex', flexDirection: 'column', gap: '16px', color: '#fff', zIndex: 50 }}>
        <button style={{ padding: '12px', backgroundColor: 'rgba(31, 41, 55, 0.8)', borderRadius: '9999px', border: 'none', cursor: 'pointer', color: '#fff' }} onClick={handleLike}>
          <FaHeart style={{ fontSize: '24px' }} />
        </button>
        <button style={{ padding: '12px', backgroundColor: 'rgba(31, 41, 55, 0.8)', borderRadius: '9999px', border: 'none', cursor: 'pointer', color: '#fff' }} onClick={handleShare}>
          <FaShareAlt style={{ fontSize: '24px' }} />
        </button>
        <button style={{ padding: '12px', backgroundColor: 'rgba(31, 41, 55, 0.8)', borderRadius: '9999px', border: 'none', cursor: 'pointer', color: '#fff' }} onClick={handleDownload}>
          <FaDownload style={{ fontSize: '24px' }} />
        </button>
      </div>
    </div>
  );
};

export default VideoPlayer;
