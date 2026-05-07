import Footer from "@/components/layoutComponents/Footer";
import TopHeader from "@/components/layoutComponents/TopHeader";
import HeroSearch from "@/components/homePageComponents/Hero";
import HowItWorks from "@/components/homePageComponents/HowItWorks";
import SponsorsAndStats from "@/components/homePageComponents/sponsorandStat";
import FeaturedSections from "@/components/homePageComponents/TabsforHome";
import DynamicHeader from "@/components/layoutComponents/DynamicHeader";
import HomeBanner from "@/components/homePageComponents/banner";
import ScrollFooterWrapper from "@/components/layoutComponents/ScrollFooterWrapper";

import { fetchGraphQL } from "@/lib/graphqlServer";
import { GET_BUSINESSES_PAGINATED } from "@/api/queries/business/business";
import { GET_BUSINESS_VIDEOS } from "@/api/queries/business/videos";
import { GET_BUSINESS_NOTICES } from "@/api/queries/business/notice";

export const revalidate = 60; // Cash the page for 60 seconds (ISR)

export default async function HomePage() {
  // Fetch Live Data on the Server for amazing SEO
  const [businessesRes, videosRes, noticesRes] = await Promise.all([
    fetchGraphQL(GET_BUSINESSES_PAGINATED, { pagination: { take: 8 } }, { revalidate: 60 }),
    fetchGraphQL(GET_BUSINESS_VIDEOS, { pagination: { take: 6 } }, { revalidate: 60 }),
    fetchGraphQL(GET_BUSINESS_NOTICES, { pagination: { take: 8 } }, { revalidate: 60 })
  ]);

  const businesses = businessesRes?.data?.businessesPaginated || [];
  const videos = videosRes?.data?.businessVideos || [];
  const notices = noticesRes?.data?.noticeboards || [];

  return (
    <>
      <TopHeader />
      <DynamicHeader />
      <HeroSearch />  
      <HowItWorks />
      <HomeBanner />
      <FeaturedSections 
        businesses={businesses}
        videos={videos}
        notices={notices}
        loading={false} // Data is pre-fetched on the server!
      />
      <SponsorsAndStats />
      <ScrollFooterWrapper />
      <Footer />
    </>
  );
}
