import React from "react";
import { useQuery } from "@apollo/client";
import { GET_ADS } from "@/graphql/queries/business/ads";
import Image from "next/image";
import { motion } from "framer-motion";

const PublicAds = ({ type = "WEB_BANNER", limit = 1 }) => {
  const { data, loading, error } = useQuery(GET_ADS, {
    variables: { 
      status: "PUBLISHED", 
      pagination: { skip: 0, take: limit } 
    },
    pollInterval: 30000, // Refresh every 30 seconds
  });

  if (loading) return (
    <div className="w-full bg-gray-100 animate-pulse rounded-xl flex items-center justify-center" style={{ padding: "32px" }}>
      <p className="text-gray-400 text-sm">Loading ads...</p>
    </div>
  );

  if (error || !data?.ads?.length) return null;

  // Filter by type if needed (WEB_BANNER, IN_APP_NOTIFICATION, etc.)
  const filteredAds = data.ads.filter(ad => ad.type === type);
  
  if (!filteredAds.length) return null;

  return (
    <div className="w-full space-y-4">
      {filteredAds.map((ad) => (
        <motion.div
          key={ad.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative group cursor-pointer overflow-hidden rounded-2xl shadow-lg border border-gray-100 bg-white"
          onClick={() => ad.targetUrl && window.open(ad.targetUrl, "_blank")}
        >
          {ad.imageUrl ? (
            <div className="relative aspect-[16/6] w-full overflow-hidden">
              <Image
                src={ad.imageUrl}
                alt={ad.title || "Ad image"}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ) : (
            <div className="bg-gradient-to-br from-purple-600 to-red-600 text-white min-h-[120px] flex flex-col justify-center p-6">
              <h4 className="text-lg font-bold leading-tight">{ad.title}</h4>
              <p className="text-xs opacity-80 uppercase tracking-wider font-semibold mt-1">{"Sponsored"}</p>
            </div>
          )}
          
          <div className="absolute backdrop-blur-sm rounded-md text-[10px] font-black text-gray-500 shadow-sm uppercase tracking-tighter bg-white/90 px-2 py-1" style={{ top: "12px", right: "12px" }}>
            Ad
          </div>

          <div className="flex justify-between items-center group-hover:bg-gray-50 transition-colors p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-xs uppercase">
                {ad.business?.name?.charAt(0)}
              </div>
              <div>
                <p className="text-xs font-bold text-gray-800 line-clamp-1">{ad.title}</p>
                <p className="text-[10px] text-gray-400 font-medium uppercase">{ad.business?.name}</p>
              </div>
            </div>
            <button className="text-xs font-bold text-purple-600 hover:text-purple-700 transition-colors">
              View
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default PublicAds;
