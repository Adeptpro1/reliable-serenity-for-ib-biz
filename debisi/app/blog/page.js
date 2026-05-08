"use client";

import { useState, useEffect } from "react";
import ScrollFooter from "@/components/layoutComponents/ScrollFooter";
import { gql, useQuery } from "@apollo/client";
import Link from "next/link";
import DynamicHeader from "@/components/layoutComponents/DynamicHeader";
import Footer from "@/components/layoutComponents/Footer";
import Image from "next/image";

const GET_BLOGS = gql`
  query {
    blogPosts {
      id
      title
      content
      mediaUrls
      createdAt
    }
  }
`;

export default function BlogPage() {
  const { data, loading, error, refetch } = useQuery(GET_BLOGS);
  const [isScrollingUp, setIsScrollingUp] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Restrict functionality to mobile screens (example: width less than 768px)
      if (window.innerWidth < 768) {
        if (currentScrollY < lastScrollY) {
          // Scrolling up
          setIsScrollingUp(true);
        } else {
          // Scrolling down
          setIsScrollingUp(false);
        }
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);

    // Cleanup event listener on component unmount
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
              We&apos;re having trouble reaching our servers. Please check your internet connection or try again later.
            </p>
            <button 
              onClick={() => refetch()}
              className="px-6 py-2 bg-purple-600 text-white rounded-full font-bold hover:bg-purple-700 transition-colors"
            >
              Retry Connection
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const blogPosts = data?.blogPosts || [];

  return (
    <>
      <DynamicHeader />
      <div
        className="bg-gray-50 min-h-screen"
        style={{ padding: "24px", marginTop: "20px" }}
      >
        <h1
          className="text-4xl font-black text-center"
          style={{ marginBottom: "48px", color: "purple" }}
        >
          Debisi Blog
        </h1>

        {blogPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center max-w-lg mx-auto">
            <div className="text-6xl mb-6">✍️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">No Stories Found</h2>
            <p className="text-gray-600">
              We&apos;re currently preparing some amazing stories for you. Please check back later for the latest updates!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {blogPosts.map((post) => (
              <div
                key={post.id}
                className="relative flex flex-col shadow-md transition-transform transform hover:scale-[1.03] hover:shadow-lg"
                style={{
                  height: "100%",
                  borderRadius: "12px",
                  border: "1px solid transparent",
                  background:
                    "linear-gradient(white, white) padding-box, linear-gradient(to right, #4f46e5, #9333ea, #ec4899) border-box",
                }}
              >
                <div
                  className="h-full flex flex-col overflow-hidden"
                  style={{ borderRadius: "11px" }}
                >
                  {post.mediaUrls && (
                    <Link href={`/blog/${post.id}`}>
                      <div className="relative w-full h-52 bg-gray-100 flex items-center justify-center overflow-hidden cursor-pointer group">
                        <Image
                          src={post.mediaUrls}
                          alt={post.title || "Blog image"}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      </div>
                    </Link>
                  )}
                  <div
                    className="flex-1 flex flex-col"
                    style={{ padding: "20px" }}
                  >
                    <div
                      className="flex items-start justify-between gap-3"
                      style={{ marginBottom: "12px" }}
                    >
                      <Link href={`/blog/${post.id}`} className="flex-1 min-w-0">
                        <h2
                          className="text-xl font-bold leading-tight hover:text-red-600 transition-colors line-clamp-2"
                          style={{ color: "purple" }}
                        >
                          {post.title}
                        </h2>
                      </Link>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] font-bold uppercase px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                        Editorial
                      </span>
                      <span className="text-xs text-gray-400">
                        {(() => {
                          const date = new Date(Number(post.createdAt));
                          return isNaN(date)
                            ? "-"
                            : date.toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              });
                        })()}
                      </span>
                    </div>

                    {post.content && (
                      <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed mb-4">
                        {post.content.length > 150
                          ? post.content.slice(0, 150) + "..."
                          : post.content}
                      </p>
                    )}

                    <Link
                      href={`/blog/${post.id}`}
                      className="mt-auto inline-flex items-center gap-2 text-sm font-bold text-red-600 hover:text-purple-700 transition-all group/link"
                    >
                      Read Full Story
                      <span className="transition-transform group-hover/link:translate-x-1">
                        →
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {isScrollingUp && <ScrollFooter />}
      <Footer />
    </>
  );
}
