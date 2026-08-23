'use client';

import { useQuery, gql } from '@apollo/client';
import Image from 'next/image';

const GET_BANNERS_BY_PLACEMENT = gql`
  query GetBanners($placement: String) {
    webBanners(placement: $placement) {
      id
      title
      text
      image
      videoUrl
      url
      isVisible
    }
  }
`;

export default function MosaicAds({ placement }) {
  const { data, loading, error } = useQuery(GET_BANNERS_BY_PLACEMENT, {
    variables: { placement },
  });

  const ads = (data?.webBanners || []).filter((b) => b.isVisible && (b.image || b.videoUrl)).slice(0, 3);

  if (loading || error || ads.length === 0) return null;

  // The Mosaic: 1 Large Left, 2 Small Stacked Right
  const mainAd = ads[0];
  const sideAds = ads.slice(1, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-auto md:h-[400px]">
        {/* Large Main Ad (2/3 on desktop) */}
        <div className="md:col-span-2 relative group overflow-hidden rounded-2xl shadow-md transition-all duration-300 hover:shadow-xl">
          <AdItem ad={mainAd} isLarge={true} />
        </div>

        {/* Side Ads (1/3 on desktop, stacked) */}
        {sideAds.length > 0 && (
          <div className="flex flex-col gap-4 h-full">
            {sideAds.map((ad) => (
              <div key={ad.id} className="flex-1 relative group overflow-hidden rounded-2xl shadow-md transition-all duration-300 hover:shadow-xl">
                <AdItem ad={ad} isLarge={false} />
              </div>
            ))}
            {/* If only 1 side ad exists, we might want a placeholder or just let it stretch */}
          </div>
        )}
      </div>
    </div>
  );
}

function AdItem({ ad, isLarge }) {
  return (
    <a 
      href={ad.url || '#'} 
      target="_blank" 
      rel="noopener noreferrer"
      className="block w-full h-full relative"
    >
      {ad.videoUrl ? (
        <video
          src={ad.videoUrl}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        />
      ) : (
        <Image 
          src={ad.image || '/placeholder-ad.png'} 
          alt={ad.title || 'Advertisement'} 
          fill 
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      )}
      
      {/* Overlay Content */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 md:p-6 opacity-90 group-hover:opacity-100 transition-opacity">
        <h3 className={`${isLarge ? 'text-xl md:text-2xl' : 'text-sm md:text-base'} font-bold text-white mb-1`}>
          {ad.title}
        </h3>
        {ad.text && (
          <p className={`${isLarge ? 'text-sm md:text-base' : 'text-xs md:text-sm'} text-gray-200 line-clamp-2`}>
            {ad.text}
          </p>
        )}
      </div>
    </a>
  );
}
