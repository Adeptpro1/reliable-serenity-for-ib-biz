"use client";

import { useState, useEffect } from "react";
import ScrollFooter from "@/components/layoutComponents/ScrollFooter";
import { gql, useQuery } from "@apollo/client";
import Link from "next/link";
import DynamicHeader from "@/components/layoutComponents/DynamicHeader";
import Footer from "@/components/layoutComponents/Footer";

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
  const { data, loading } = useQuery(GET_BLOGS);
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {data.blogPosts.map((post) => (
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
                    <div className="w-full h-52 bg-gray-100 flex items-center justify-center overflow-hidden cursor-pointer group">
                      <img
                        src={post.mediaUrls}
                        alt={post.title}
                        className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
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
      </div>
      {isScrollingUp && <ScrollFooter />}
      <Footer />
    </>
  );
}
