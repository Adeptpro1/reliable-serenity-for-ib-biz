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
    variables: { placement: "HOME_SLIDER" }
  });
  const banners = (data?.webBanners || []).filter((b) => b.isVisible && b.image);

  const [current, setCurrent] = useState(0);

  // Auto-slide every 5s
  useEffect(() => {
    if (!banners.length) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (loading) return null;
  if (error) return null;
  if (!banners.length) return null;

  return (
    <div className="relative max-w-7xl overflow-hidden rounded-2xl shadow-lg" style={{ marginTop: '32px', marginBottom: '32px', marginRight: 'auto', marginLeft: 'auto', width: '90%' }}>
      <div className="flex transition-transform duration-700 ease-in-out" style={{ transform: `translateX(-${current * 100}%)` }}>
        {banners.map((banner) => (
          <a
            key={banner.id}
            href={banner.url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="min-w-full flex-shrink-0 relative"
          >
            <div className="w-full h-[120px] sm:h-[200px] md:h-[300px] relative">
              <Image src={banner.image} alt={banner.title || "Banner"} fill className="object-cover" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex flex-col justify-end p-6">
              <h2 className="text-white text-2xl sm:text-3xl md:text-4xl font-bold drop-shadow-lg">{banner.title}</h2>
              <p className="text-gray-200 text-sm sm:text-base max-w-2xl" style={{ marginTop: '8px' }}>{banner.text}</p>
            </div>
          </a>
        ))}
      </div>

      {/* Dots */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
        {banners.map((_, idx) => (
          <button key={idx} onClick={() => setCurrent(idx)} className={`w-3 h-3 rounded-full transition-all ${current === idx ? 'bg-purple-600 w-5' : 'bg-gray-400'}`} />
        ))}
      </div>

      {/* Prev/Next */}
      <button onClick={() => setCurrent((prev) => (prev - 1 + banners.length) % banners.length)} className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-black/40 text-white rounded-full hover:bg-black/60 transition p-2">
        ❮
      </button>
      <button onClick={() => setCurrent((prev) => (prev + 1) % banners.length)} className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-black/40 text-white rounded-full hover:bg-black/60 transition p-2">
        ❯
      </button>
    </div>
  );
}

export default HomeBanner;
