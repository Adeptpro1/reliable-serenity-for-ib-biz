// "use client";
// import { useState, useEffect, useCallback } from "react";
// import { useRouter } from "next/navigation"; 
// import { FaHeart, FaShareAlt, FaDownload, FaArrowLeft, FaPlay } from "react-icons/fa";
// import { useSwipeable } from "react-swipeable";
// import { useQuery, useMutation } from "@apollo/client";
// import Image from "next/image";
// import { GET_BUSINESS_VIDEOS } from "@/graphql/queries/business/videos";
// import { VIEW_VIDEO, LIKE_VIDEO } from "@/graphql/mutations/business/videos";
// import LoadingSpinner from "@/components/otherComponents/LoadingSpinner";

// const VideoPlayer = () => {
//   const router = useRouter(); 
//   const { data, loading, error } = useQuery(GET_BUSINESS_VIDEOS, {
//     variables: { pagination: { take: 20 } }
//   });
//   const [viewVideo] = useMutation(VIEW_VIDEO);
//   const [likeVideo] = useMutation(LIKE_VIDEO);

//   const videos = data?.businessVideos || [];
//   const backUrl = "/directory"; 

//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [screenHeight, setScreenHeight] = useState("100vh");
//   const [isStarted, setIsStarted] = useState(false);
//   const [viewedIds, setViewedIds] = useState(new Set());
//   const [likedIds, setLikedIds] = useState(new Set());

//   const currentVideo = videos[currentIndex];

//   // Record view when video playback starts
//   useEffect(() => {
//     if (isStarted && currentVideo?.id && !viewedIds.has(currentVideo.id)) {
//       setViewedIds((prev) => new Set(prev).add(currentVideo.id));
//       viewVideo({ variables: { id: currentVideo.id } }).catch((err) => {
//         console.error("Failed to record video view:", err);
//       });
//     }
//   }, [isStarted, currentVideo?.id, viewedIds, viewVideo]);

//   // Sync likedIds from server isLiked and localStorage
//   useEffect(() => {
//     try {
//       const stored = localStorage.getItem("debisi_liked_videos");
//       const localLiked = stored ? JSON.parse(stored) : [];
//       const set = new Set(localLiked);
//       videos.forEach((v) => {
//         if (v.isLiked) set.add(v.id);
//       });
//       setLikedIds(set);
//     } catch {
//       const set = new Set();
//       videos.forEach((v) => {
//         if (v.isLiked) set.add(v.id);
//       });
//       setLikedIds(set);
//     }
//   }, [videos]);

//   // Reset play state when video changes
//   useEffect(() => {
//     setIsStarted(false);
//   }, [currentIndex]);

//   /** Fix mobile height issues */
//   useEffect(() => {
//     const updateHeight = () => {
//       setScreenHeight(`${window.innerHeight}px`);
//     };

//     updateHeight(); 
//     window.addEventListener("resize", updateHeight);

//     return () => window.removeEventListener("resize", updateHeight);
//   }, []);

//   /** Handle Swipes */
//   const handleSwipe = useCallback((direction) => {
//     if (direction === "up" && currentIndex < videos.length - 1) {
//       setCurrentIndex((prev) => prev + 1);
//     } else if (direction === "down" && currentIndex > 0) {
//       setCurrentIndex((prev) => prev - 1);
//     } else if (direction === "left" || direction === "right") {
//       router.push(backUrl); 
//     }
//   }, [currentIndex, videos.length, router, backUrl]);

//   /** Handle Keyboard Arrows (For Desktop) */
//   const handleKeyDown = useCallback(
//     (e) => {
//       if (e.key === "ArrowUp") handleSwipe("up");
//       if (e.key === "ArrowDown") handleSwipe("down");
//       if (e.key === "ArrowLeft" || e.key === "ArrowRight") router.push(backUrl);
//     },
//     [handleSwipe, router, backUrl]
//   );

//   /** Handle Mouse Scroll (For Desktop) */
//   const handleScroll = useCallback(
//     (e) => {
//       if (e.deltaY < 0) handleSwipe("down");
//       if (e.deltaY > 0) handleSwipe("up");
//     },
//     [handleSwipe]
//   );

//   /** Attach Event Listeners for Keyboard & Scroll */
//   useEffect(() => {
//     window.addEventListener("keydown", handleKeyDown);
//     window.addEventListener("wheel", handleScroll);
//     return () => {
//       window.removeEventListener("keydown", handleKeyDown);
//       window.removeEventListener("wheel", handleScroll);
//     };
//   }, [handleKeyDown, handleScroll]);

//   /** Swipe Gestures */
//   const handlers = useSwipeable({
//     onSwipedUp: () => handleSwipe("up"),
//     onSwipedDown: () => handleSwipe("down"),
//     onSwipedLeft: () => handleSwipe("left"),
//     onSwipedRight: () => handleSwipe("right"),
//     preventScrollOnSwipe: true,
//   });

//   /** Handle Like */
//   const handleLike = async () => {
//     if (!currentVideo?.id) return;
//     const isCurrentlyLiked = likedIds.has(currentVideo.id);

//     setLikedIds((prev) => {
//       const next = new Set(prev);
//       if (isCurrentlyLiked) {
//         next.delete(currentVideo.id);
//       } else {
//         next.add(currentVideo.id);
//       }
//       try {
//         localStorage.setItem("debisi_liked_videos", JSON.stringify(Array.from(next)));
//       } catch {}
//       return next;
//     });

//     try {
//       await likeVideo({ variables: { id: currentVideo.id } });
//     } catch (error) {
//       console.error("Error toggling video like:", error);
//     }
//   };

//   /** Handle Share */
//   const handleShare = async () => {
//     const name = videos[currentIndex]?.business?.name || "Abraham";
//     const shareUrl = "https://www.debisi.ng/";
//     try {
//       if (navigator.share) {
//         await navigator.share({
//           title: "Debisi NG",
//           text: `Hey I'm ${name}, I am using Debisi to drive more customers worldwide, it's great and I'd like you to try it out.`,
//           url: shareUrl,
//         });
//       } else {
//         alert(`Share this link: ${shareUrl}`);
//       }
//     } catch (error) {
//       console.error("Error sharing:", error);
//     }
//   };

//   /** Handle Download */
//   const handleDownload = () => {
//     if (!videos[currentIndex]) return;
//     const link = document.createElement("a");
//     link.href = videos[currentIndex].videoUrl;
//     link.download = videos[currentIndex].business?.name || "video";
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   if (loading) return <LoadingSpinner />;
//   if (error) return (
//     <div style={{ height: screenHeight, backgroundColor: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', textAlign: 'center' }}>
//       <p>Unable to load videos. Please check your connection.</p>
//     </div>
//   );

//   if (videos.length === 0) {
//     return (
//       <div style={{ height: screenHeight, backgroundColor: '#000', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', textAlign: 'center' }}>
//         <p>No videos found in the showroom yet.</p>
//         <button 
//           onClick={() => router.push(backUrl)}
//           style={{ marginTop: '20px', backgroundColor: '#9333ea', color: '#fff', padding: '10px 20px', borderRadius: '9999px' }}
//         >
//           Go Back
//         </button>
//       </div>
//     );
//   }

//   const getBunnyThumbnailUrl = (videoUrl) => {
//     if (!videoUrl) return "";
//     const match = videoUrl.match(/embed\/(\d+)\/([a-zA-Z0-9-]+)/);
//     if (match) {
//       const [_, libraryId, videoId] = match;
//       return `https://vz-${libraryId}.b-cdn.net/${videoId}/thumbnail.jpg`;
//     }
//     return videoUrl;
//   };

//   const primaryAddress = currentVideo.business?.addresses?.[0];
//   const locationText = primaryAddress
//     ? `${primaryAddress.town || primaryAddress.city || ""}, ${primaryAddress.state || ""}`.trim().replace(/^,\s*/, "")
//     : "Oyo State";

//   return (
//     <div
//       className="relative w-full flex items-center justify-center bg-black overflow-hidden"
//       style={{ height: screenHeight }}
//       {...handlers}
//     >
//       {/* Back Button */}
//       <button
//         style={{ position: 'absolute', top: '20px', left: '20px', padding: '10px', backgroundColor: 'rgba(17, 24, 39, 0.5)', borderRadius: '9999px', color: '#fff', fontSize: '20px', zIndex: 50, border: 'none', cursor: 'pointer' }}
//         onClick={() => router.push(backUrl)}
//       >
//         <FaArrowLeft />
//       </button>

//       {/* Video Player / Cover poster & Play overlay */}
//       {!isStarted ? (
//         <div style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
//           <div 
//             onClick={() => setIsStarted(true)}
//             style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyText: 'center', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 10, cursor: 'pointer' }}
//           >
//             <div 
//               style={{ 
//                 backgroundColor: 'rgba(255,255,255,0.25)', 
//                 backdropFilter: 'blur(4px)', 
//                 padding: '20px', 
//                 borderRadius: '50%', 
//                 color: '#fff', 
//                 fontSize: '36px', 
//                 display: 'flex', 
//                 alignItems: 'center', 
//                 justifyContent: 'center', 
//                 width: '80px', 
//                 height: '80px', 
//                 border: '2px solid rgba(255,255,255,0.6)' 
//               }} 
//               className="hover:scale-110 transition-transform duration-200"
//             >
//               <FaPlay style={{ marginLeft: '6px' }} />
//             </div>
//           </div>
//           <Image
//             src={getBunnyThumbnailUrl(currentVideo.videoUrl)}
//             alt="video poster"
//             fill
//             sizes="100vw"
//             style={{ objectFit: 'cover' }}
//           />
//         </div>
//       ) : (
//         <iframe
//           key={currentVideo.id}
//           src={`${currentVideo.videoUrl}?autoplay=true&loop=false&preload=true`}
//           loading="lazy"
//           style={{
//             width: '100%',
//             height: '100%',
//             border: 0,
//             position: 'absolute',
//             top: 0,
//             left: 0,
//           }}
//           allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
//           allowFullScreen
//         />
//       )}

//       {/* Overlay Details */}
//       <div style={{ position: 'absolute', bottom: '100px', left: '20px', color: '#fff', zIndex: 50, textShadow: '1px 1px 4px rgba(0,0,0,0.8)' }}>
//         <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
//           <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0' }}>{currentVideo.business?.name}</h2>
//           {currentVideo.boosted ? (
//             <span style={{ backgroundColor: '#7c3aed', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '700' }}>
//               ⚡ Sponsored
//             </span>
//           ) : currentVideo.isFreeUpload ? (
//             <span style={{ backgroundColor: '#059669', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '700' }}>
//               ⚡ Free ({currentVideo.views || 0}/50 views)
//             </span>
//           ) : null}
//         </div>
//         <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#cbd5e1', marginTop: '4px' }}>
//           <span>🎬 {currentVideo.views || 0} views</span>
//           {locationText && <span>• 📍 {locationText}</span>}
//         </div>
//         <h3 style={{ fontSize: '16px', fontWeight: '600', marginTop: '12px', marginBottom: '4px' }}>
//           {currentVideo.title || "Showroom Video"}
//         </h3>
//         <p style={{ fontSize: '14px', opacity: 0.9, marginTop: '4px', maxWidth: '400px', lineHeight: '1.4' }}>
//           {currentVideo.description || currentVideo.business?.description || "Watch our showroom video"}
//         </p>
//         <button 
//           onClick={() => router.push(`/business/${currentVideo.business?.slug}`)}
//           style={{ marginTop: '16px', backgroundColor: '#9333ea', color: '#fff', padding: '10px 24px', borderRadius: '9999px', border: 'none', cursor: 'pointer', fontWeight: '600' }}
//         >
//           Learn More
//         </button>
//       </div>

//       {/* Side Buttons */}
//       <div style={{ position: 'absolute', right: '20px', bottom: '100px', display: 'flex', flexDirection: 'column', gap: '16px', color: '#fff', zIndex: 50 }}>
//         <button 
//           style={{ 
//             padding: '12px', 
//             backgroundColor: likedIds.has(currentVideo.id) ? 'rgba(239, 68, 68, 0.9)' : 'rgba(31, 41, 55, 0.8)', 
//             borderRadius: '9999px', 
//             border: 'none', 
//             cursor: 'pointer', 
//             color: '#fff',
//             transition: 'all 0.2s ease'
//           }} 
//           onClick={handleLike}
//         >
//           <FaHeart style={{ fontSize: '24px' }} />
//         </button>
//         <button style={{ padding: '12px', backgroundColor: 'rgba(31, 41, 55, 0.8)', borderRadius: '9999px', border: 'none', cursor: 'pointer', color: '#fff' }} onClick={handleShare}>
//           <FaShareAlt style={{ fontSize: '24px' }} />
//         </button>
//         <button style={{ padding: '12px', backgroundColor: 'rgba(31, 41, 55, 0.8)', borderRadius: '9999px', border: 'none', cursor: 'pointer', color: '#fff' }} onClick={handleDownload}>
//           <FaDownload style={{ fontSize: '24px' }} />
//         </button>
//       </div>
//     </div>
//   );
// };

// export default VideoPlayer;




"use client";

import React from "react";
import Link from "next/link";
import DynamicHeader from "@/components/layoutComponents/DynamicHeader";
import Footer from "@/components/layoutComponents/Footer";
import { FaPlay, FaHeart, FaBolt, FaArrowRight } from "react-icons/fa";

export default function ShowroomWebPlaceholder() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-white">
      <DynamicHeader />

      <main className="flex-1 flex flex-col justify-center items-center px-4 py-16 sm:py-24 relative overflow-hidden">
        {/* Subtle Ambient Glows */}
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(circle, #7c3aed 0%, #D22730 100%)" }}
        />
        <div
          className="absolute bottom-10 right-10 w-72 h-72 rounded-full blur-3xl opacity-15 pointer-events-none"
          style={{ background: "#7c3aed" }}
        />

        <div className="max-w-4xl w-full mx-auto text-center z-10">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-900/40 border border-purple-500/30 text-purple-300 text-xs sm:text-sm font-semibold mb-8 backdrop-blur-md">
            <FaBolt className="text-amber-400" />
            <span>Mobile-Only Experience</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight mb-6">
            Debisi Showroom is Exclusively on the{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(135deg, #a855f7 0%, #ec4899 50%, #ef4444 100%)" }}
            >
              Mobile App
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed mb-10">
            Immerse yourself in full-screen vertical video reels. Discover verified Oyo State SMEs,
            watch live product demonstrations, and connect with business owners directly from your phone.
          </p>

          {/* Interactive Feature Pills */}
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-12">
            <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-200">
              <FaPlay className="text-purple-400 text-xs" />
              <span>Full-Screen Videos</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-200">
              <FaHeart className="text-rose-400 text-xs" />
              <span>Instant Likes & Saves</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-200">
              <span className="text-emerald-400 font-bold">₦0</span>
              <span>Free Upload for Verified Businesses</span>
            </div>
          </div>

          {/* App Store Download Badges */}
          <div className="flex flex-wrap justify-center items-center gap-4 mb-12">
            {/* Google Play Store Badge */}
            <a
              href="https://play.google.com/store/apps/details?id=com.adepttechnologies.debising"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-white hover:bg-slate-100 text-slate-900 rounded-2xl px-6 py-3.5 shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 font-semibold"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-7 h-7 flex-shrink-0" fill="currentColor">
                <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l232.6-232.6L47 0zm414 218.7l-55.1-31.7-60.1 60.1 60.1 60.1 55.8-32.1c15.9-9.1 15.9-33.1-.7-56.4zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z" />
              </svg>
              <div className="text-left">
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 leading-none">
                  GET IT ON
                </div>
                <div className="text-base sm:text-lg font-bold leading-tight">Google Play</div>
              </div>
            </a>

            {/* Apple App Store Badge */}
            <div
              className="flex items-center gap-3 bg-slate-900 border border-slate-700/80 rounded-2xl px-6 py-3.5 shadow-lg select-none text-slate-300"
              title="iOS App Store release coming soon"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" className="w-7 h-7 flex-shrink-0" fill="currentColor">
                <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-16.9 75.8-16.9 31.8 0 48.3 16.9 75.8 16.9 48.4-.7 93.1-83.7 105.5-120.5-67.5-32-101-93.3-64-91.7zm-89-221.2c27.2-32.2 24.1-61.7 23.2-72.1-23.1 1.4-50 15.7-65.2 33.2-16.7 18.9-26.1 42.4-24.1 68.5 25 1.9 47.7-11.9 66.1-29.6z" />
              </svg>
              <div className="text-left">
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 leading-none">
                  Download on the
                </div>
                <div className="text-base sm:text-lg font-bold leading-tight text-white flex items-center gap-1.5">
                  App Store
                  <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-400/30 px-1.5 py-0.5 rounded font-semibold">
                    Soon
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Back to Web Directory Link */}
          <div>
            <Link
              href="/directory"
              className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors underline-offset-4 hover:underline"
            >
              <span>Explore Businesses on Web Directory</span>
              <FaArrowRight className="text-xs" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
