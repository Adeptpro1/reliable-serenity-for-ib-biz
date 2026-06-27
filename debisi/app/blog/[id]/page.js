"use client";

import { useState, useEffect } from "react";
import ScrollFooter from "@/components/layoutComponents/ScrollFooter";
import DynamicHeader from "@/components/layoutComponents/DynamicHeader";
import { gql, useQuery, useMutation } from "@apollo/client";
import { useParams, useRouter } from "next/navigation";
import Footer from "@/components/layoutComponents/Footer";
import Image from "next/image";
import Link from "next/link";

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
  const router = useRouter();
  const { data, loading, error, refetch } = useQuery(GET_BLOG, { 
    variables: { id },
    skip: !id 
  });
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

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <DynamicHeader />
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <DynamicHeader />
        <div className="flex-1 flex flex-col justify-center items-center px-4 text-center">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md border border-purple-100">
            <div className="text-5xl mb-4">📡</div>
            <h2 className="text-2xl font-bold text-purple-900 mb-2">Connection Issue</h2>
            <p className="text-gray-600 mb-6">
              We&apos;re having trouble reaching our servers to load this story. Please check your connection.
            </p>
            <button 
              onClick={() => refetch()}
              className="px-6 py-2 bg-purple-600 text-white rounded-full font-bold hover:bg-purple-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!data?.blogPost) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <DynamicHeader />
        <div className="flex-1 flex flex-col justify-center items-center px-4 text-center">
          <div className="text-6xl mb-6">🔍</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Story Not Found</h2>
          <p className="text-gray-600 mb-8">
            The blog post you&apos;re looking for doesn&apos;t seem to exist or has been moved.
          </p>
          <Link href="/blog" className="px-6 py-2 bg-purple-600 text-white rounded-full font-bold hover:bg-purple-700 transition-colors">
            Back to Blog
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

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
          onClick={() => router.back()}
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
            <Image
              src={mediaUrls}
              alt="blog media"
              width={800}
              height={500}
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
          <div className="relative w-full h-full max-w-5xl max-h-[90vh]">
            <Image 
              src={mediaUrls} 
              alt="zoomed blog media" 
              fill
              className="object-contain rounded-lg"
            />
          </div>
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

