import Footer from "@/components/layoutComponents/Footer";
import TabNavigation from "@/components/serverComponents/business/TabNavigation";
import DynamicHeader from "@/components/layoutComponents/DynamicHeader";
import ScrollFooterWrapper from "@/components/layoutComponents/ScrollFooterWrapper";

import { fetchGraphQL } from "@/lib/graphqlServer";
import { GET_BUSINESSES_PAGINATED } from "@/graphql/queries/business/business";
import { GET_BUSINESS_VIDEOS } from "@/graphql/queries/business/videos";
import { GET_BUSINESS_NOTICES } from "@/graphql/queries/business/notice";

export const revalidate = 60; // Cash the page for 60 seconds (ISR)

export default async function Directory({ searchParams }) {
  const params = await searchParams;
  const search = params?.search || "";
  const category = params?.category || "";
  const town = params?.town || "";
  const city = params?.city || "";
  const lg = params?.lg || "";
  const tab = params?.tab || "Directory";
  const business = params?.business || "";

  const commonVariables = { 
    pagination: { skip: 0, take: 24 }, 
    userLocation: (town || city || lg) ? { 
      town: town || undefined, 
      city: city || undefined, 
      lg: lg || undefined 
    } : null,
    search: search || undefined
  };

  const bizVariables = {
    ...commonVariables,
    category: category || undefined
  };

  const [businessesRes, videosRes, noticesRes] = await Promise.all([
    fetchGraphQL(GET_BUSINESSES_PAGINATED, bizVariables, { revalidate: 60 }),
    fetchGraphQL(GET_BUSINESS_VIDEOS, commonVariables, { revalidate: 60 }),
    fetchGraphQL(GET_BUSINESS_NOTICES, commonVariables, { revalidate: 60 })
  ]);

  const initialBusinesses = businessesRes?.data?.businessesPaginated || [];
  const initialVideos = videosRes?.data?.businessVideos || [];
  const initialNotices = noticesRes?.data?.noticeboards || [];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <DynamicHeader />
      
      <main className="flex-grow w-full max-w-[1600px]" style={{ marginLeft: "auto", marginRight: "auto", padding: "32px 16px", paddingLeft: "max(16px, env(safe-area-inset-left))", paddingRight: "max(16px, env(safe-area-inset-right))" }}>
        <TabNavigation 
          initialBusinesses={initialBusinesses}
          initialVideos={initialVideos}
          initialNotices={initialNotices}
          initialSearch={search}
          initialCategory={category}
          initialTown={town}
          initialCity={city}
          initialLg={lg}
          initialTab={tab}
          initialBusiness={business}
        />
      </main>

      <ScrollFooterWrapper />
      <Footer />
    </div>
  );
}
