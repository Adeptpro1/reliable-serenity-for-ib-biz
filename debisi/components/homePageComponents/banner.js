"use client";

import { useState, useEffect } from "react";
import { useQuery, gql } from "@apollo/client";
import Image from "next/image";

const GET_WEB_BANNERS = gql`
  query GetWebBanners($placement: String) {
    webBanners(placement: $placement) {
      id
      title
      text
      image
      url
      isVisible
      createdAt
    }
  }
`;

function HomeBanner() {
  const { data, loading, error } = useQuery(GET_WEB_BANNERS, {
    variables: { placement: "HOME_SLIDER" },
  });
  const banners = (data?.webBanners || []).filter((b) => b.isVisible && b.image);

  const [current, setCurrent] = useState(0);

  // Auto-slide every 4s
  useEffect(() => {
    if (!banners.length) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (loading || error || !banners.length) return null;

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-6">
      <div className="relative overflow-hidden rounded-2xl shadow-md border border-gray-100 bg-gray-900 group">
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {banners.map((banner) => (
            <a
              key={banner.id}
              href={banner.url || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="min-w-full flex-shrink-0 relative block"
            >
              {/* Responsive Banner Aspect Ratio — fixed height bug on mobile */}
              <div className="w-full h-[180px] sm:h-[240px] md:h-[320px] lg:h-[380px] relative">
                <Image
                  src={banner.image}
                  alt={banner.title || "Banner"}
                  fill
                  priority
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                {/* Gradient overlay for readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex flex-col justify-end p-4 sm:p-6 md:p-8">
                  {banner.title && (
                    <h2 className="text-white text-base sm:text-2xl md:text-3xl font-black drop-shadow-md leading-snug">
                      {banner.title}
                    </h2>
                  )}
                  {banner.text && (
                    <p className="text-gray-200 text-xs sm:text-sm md:text-base max-w-2xl mt-1 sm:mt-2 line-clamp-2 leading-relaxed">
                      {banner.text}
                    </p>
                  )}
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Carousel Dots */}
        {banners.length > 1 && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 z-10">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                aria-label={`Slide ${idx + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  current === idx ? "bg-white w-6" : "bg-white/50 w-2 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        )}

        {/* Navigation Arrows */}
        {banners.length > 1 && (
          <>
            <button
              onClick={() => setCurrent((prev) => (prev - 1 + banners.length) % banners.length)}
              aria-label="Previous Slide"
              className="absolute top-1/2 left-3 -translate-y-1/2 bg-black/40 text-white rounded-full p-2.5 backdrop-blur-xs opacity-80 sm:opacity-0 group-hover:opacity-100 transition-all hover:bg-black/70 z-10"
            >
              ❮
            </button>
            <button
              onClick={() => setCurrent((prev) => (prev + 1) % banners.length)}
              aria-label="Next Slide"
              className="absolute top-1/2 right-3 -translate-y-1/2 bg-black/40 text-white rounded-full p-2.5 backdrop-blur-xs opacity-80 sm:opacity-0 group-hover:opacity-100 transition-all hover:bg-black/70 z-10"
            >
              ❯
            </button>
          </>
        )}
      </div>
    </section>
  );
}

export default HomeBanner;
