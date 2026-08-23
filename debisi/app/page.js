import Footer from "@/components/layoutComponents/Footer";
import TopHeader from "@/components/layoutComponents/TopHeader";
import HeroSearch from "@/components/homePageComponents/Hero";
import SponsorsAndStats from "@/components/homePageComponents/sponsorandStat";
import HomeFeed from "@/components/homePageComponents/HomeFeed";
import DynamicHeader from "@/components/layoutComponents/DynamicHeader";
import HomeBanner from "@/components/homePageComponents/banner";
import ScrollFooterWrapper from "@/components/layoutComponents/ScrollFooterWrapper";

import { fetchGraphQL } from "@/lib/graphqlServer";
import { GET_BUSINESSES_PAGINATED } from "@/graphql/queries/business/business";
import { GET_BUSINESS_VIDEOS } from "@/graphql/queries/business/videos";
import { GET_BUSINESS_NOTICES } from "@/graphql/queries/business/notice";
import { GET_PRODUCTS_FEED } from "@/graphql/queries/business/productsFeed";

export const revalidate = 60; // ISR — revalidate every 60 seconds

export default async function HomePage() {
  // SSR — pre-fetch all 4 content pools in parallel for SEO + fast FCP.
  // The client HomeFeed will re-fetch with userLocation once it resolves,
  // replacing these with location-aware results transparently.
  const [businessesRes, videosRes, noticesRes, productsRes] = await Promise.all([
    fetchGraphQL(GET_BUSINESSES_PAGINATED, { pagination: { take: 12 } }, { revalidate: 60 }),
    fetchGraphQL(GET_BUSINESS_VIDEOS,      { pagination: { take: 8  } }, { revalidate: 60 }),
    fetchGraphQL(GET_BUSINESS_NOTICES,     { pagination: { take: 10 } }, { revalidate: 60 }),
    fetchGraphQL(GET_PRODUCTS_FEED,        { pagination: { take: 10 } }, { revalidate: 60 }),
  ]);

  const businesses = businessesRes?.data?.businessesPaginated || [];
  const videos     = videosRes?.data?.businessVideos          || [];
  const notices    = noticesRes?.data?.noticeboards           || [];
  const products   = productsRes?.data?.products              || [];

  return (
    <>
      <TopHeader />
      <DynamicHeader />
      {/* Hero with AI Search — kept as the primary entry point */}
      <HeroSearch />
      {/* Banner slider (admin-managed, placement: HOME_SLIDER) */}
      <HomeBanner />
      {/* Smart interleaved feed: businesses + videos + notices + products */}
      <HomeFeed
        businesses={businesses}
        videos={videos}
        notices={notices}
        products={products}
      />
      <SponsorsAndStats />
      <ScrollFooterWrapper />
      <Footer />
    </>
  );
}

