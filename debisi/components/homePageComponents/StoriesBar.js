"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import bnwLogo from "@/images/debisi_logo_bnw.png";

/**
 * StoriesBar — horizontal scrollable ring of featured businesses.
 * Responsive sizing: compact on mobile, scaled up & prominent on desktop.
 * Pinned first slot: Business of the Week (gold ring).
 */
export default function StoriesBar({ businesses = [] }) {
  const scrollRef = useRef(null);

  // Filter exclusively for Business of the Week (BOTW)
  const botwBusinesses = businesses.filter((biz) => biz.isBusinessOfTheWeek);

  if (!botwBusinesses.length) return null;

  return (
    <div className="py-4 border-b border-gray-100 bg-white">
      <div
        ref={scrollRef}
        className="flex gap-4 sm:gap-6 overflow-x-auto px-4 sm:px-6 py-2 scrollbar-none hide-scrollbar"
      >
        {botwBusinesses.map((biz) => {
          const logo = biz.images?.find((img) => img.isLogo)?.imageUrl || null;
          const isBOTW = biz.isBusinessOfTheWeek;
          const href = biz.slug ? `/${biz.slug}` : "/directory";

          return (
            <Link
              key={biz.id}
              href={href}
              className="flex flex-col items-center gap-1.5 shrink-0 no-underline group w-16 sm:w-20 md:w-24 transition-transform hover:scale-105"
            >
              {/* Ring Container — bigger on sm/md screens */}
              <div
                className={`p-0.5 rounded-full transition-all duration-300 ${
                  isBOTW
                    ? "bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 shadow-md shadow-amber-500/30"
                    : "bg-gradient-to-tr from-purple-700 to-[#D22730] group-hover:shadow-md"
                }`}
              >
                <div className="w-13 h-13 sm:w-17 sm:h-17 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-white relative bg-gray-100">
                  <Image
                    src={logo || bnwLogo}
                    alt={biz.name || "Business"}
                    fill
                    sizes="(max-width: 640px) 52px, (max-width: 768px) 68px, 80px"
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src = bnwLogo.src || bnwLogo;
                    }}
                  />
                </div>
              </div>

              {/* Name Label */}
              <span
                className={`text-[10px] sm:text-xs md:text-sm font-medium text-center truncate max-w-full leading-snug ${
                  isBOTW ? "font-bold text-amber-600" : "text-gray-700 group-hover:text-purple-700"
                }`}
              >
                {isBOTW ? "⭐ BOTW" : biz.name}
              </span>
            </Link>
          );
        })}
      </div>

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
