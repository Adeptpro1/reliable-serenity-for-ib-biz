"use client";

import { useState, useEffect } from "react";
import ScrollFooter from "@/components/layoutComponents/ScrollFooter";
import DynamicHeader from "@/components/layoutComponents/DynamicHeader";
import { gql, useQuery, useMutation } from "@apollo/client";
import { useParams } from "next/navigation";
import Footer from "@/components/layoutComponents/Footer";

const GET_BLOG = gql`
  query BlogPost($id: ID!) {
    blogPost(id: $id) {
      id
      title
      content
      mediaUrls
      likes
      shares
      createdAt
    }
  }
`;

const LIKE_POST = gql`
  mutation LikePost($id: ID!) {
    likeBlogPost(id: $id) {
      id
      likes
    }
  }
`;

const SHARE_POST = gql`
  mutation SharePost($id: ID!) {
    shareBlogPost(id: $id) {
      id
      shares
    }
  }
`;

export default function BlogDetailPage() {
  const { id } = useParams();
  const { data, loading, refetch } = useQuery(GET_BLOG, { variables: { id } });
  const [likePost] = useMutation(LIKE_POST);
  const [sharePost] = useMutation(SHARE_POST);
  const [isScrollingUp, setIsScrollingUp] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (window.innerWidth < 768) {
        if (currentScrollY < lastScrollY) {
          setIsScrollingUp(true);
        } else {
          setIsScrollingUp(false);
        }
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);

  if (loading) return <p className="text-center py-10">Loading...</p>;
  if (!data?.blogPost) return <p className="text-center py-10">Blog post not found.</p>;

  const { title, content, mediaUrls, likes, shares } = data.blogPost;

  const handleLike = async () => {
    try {
      await likePost({ variables: { id } });
      refetch();
    } catch (err) {
      console.error("Error liking post:", err);
    }
  };

  const handleShare = async () => {
    const shareLink = `https://debisi.ng/blog/${id}`;
    const shareData = {
      title: title,
      text: content.slice(0, 100) + "...",
      url: shareLink,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareLink);
        alert("Link copied to clipboard!");
      }
      await sharePost({ variables: { id } });
      refetch();
    } catch (err) {
      console.error("Error sharing post:", err);
    }
  };

  return (
    <>
      <DynamicHeader />
      <div className="max-w-3xl bg-white rounded-2xl shadow-md" style={{ padding: '24px', marginTop: '16px', marginBottom: '16px', marginLeft: 'auto', marginRight: 'auto' }}>
        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center hover:text-blue-800 font-medium transition-colors"
          style={{ marginBottom: '24px' }}
        >
          ← Back
        </button>

        {/* Title */}
        <h1 className="text-3xl font-extrabold" style={{ marginBottom: '16px', color: 'purple' }}>{title}</h1>

        {/* Content */}
        <div 
          className="text-gray-700 leading-relaxed" 
          style={{ 
            marginBottom: '24px', 
            whiteSpace: 'pre-wrap', 
            fontSize: '1.1rem' 
          }}
        >
          {content}
        </div>

        {/* Image */}
        {mediaUrls && (
          <div style={{ marginBottom: '24px' }}>
            <img
              src={mediaUrls}
              alt="blog media"
              className="rounded-xl w-full max-h-[500px] object-cover cursor-zoom-in transition-transform hover:scale-[1.02]"
              onClick={() => setIsZoomed(true)}
            />
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-4 mb-4">
          <button
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow transition-all active:scale-95"
            onClick={handleLike}
            style={{ padding: '10px 20px' }}
          >
            <span>👍</span> Like ({likes})
          </button>

          <button
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold shadow transition-all active:scale-95"
            onClick={handleShare}
            style={{ padding: '10px 20px' }}
          >
            <span>🔗</span> Share ({shares})
          </button>
        </div>
      </div>

      {/* Zoom Modal */}
      {isZoomed && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4 cursor-zoom-out"
          onClick={() => setIsZoomed(false)}
        >
          <img 
            src={mediaUrls} 
            alt="zoomed blog media" 
            className="max-w-full max-h-full object-contain rounded-lg"
          />
          <button 
            className="absolute top-4 right-4 text-white text-4xl font-bold"
            onClick={() => setIsZoomed(false)}
          >
            &times;
          </button>
        </div>
      )}

      {isScrollingUp && <ScrollFooter />}
      <Footer />
    </>
  );
}

