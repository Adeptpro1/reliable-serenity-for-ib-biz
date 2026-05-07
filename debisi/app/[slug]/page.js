import DynamicHeader from "@/components/layoutComponents/DynamicHeader";
import Footer from "@/components/layoutComponents/Footer";
import BusinessView from "@/components/serverComponents/business/BusinessView";
import ScrollFooterWrapper from "@/components/layoutComponents/ScrollFooterWrapper";
import { notFound } from "next/navigation";
import { fetchGraphQL } from "@/lib/graphqlServer";
import { GET_BUSINESS_BY_SLUG } from "@/api/queries/business/business";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  if (!slug) return {};
  
  // Fetch business on server to get real name for title
  const { data } = await fetchGraphQL(GET_BUSINESS_BY_SLUG, { slug });
  const business = data?.businessBySlug;
  
  // Use business name if available, fallback to formatted slug
  const name = business?.name || slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  return {
    title: `${name} | Debisi Commercial Platform`,
    description: business?.description || `Discover services, products, and contact information for ${name} on Debisi Nigeria.`,
    openGraph: {
      title: `${name} on Debisi`,
      description: `View ${name}'s profile, gallery, and ratings.`,
    }
  };
}

export const revalidate = 60; // Cash the page for 60 seconds (ISR)

export default async function BusinessDetailPage({ params }) {
  const { slug } = await params;

  if (!slug) {
    notFound();
  }

  // Fetch business on server to handle 404
  const { data, errors } = await fetchGraphQL(GET_BUSINESS_BY_SLUG, { slug });
  
  if (errors || !data?.businessBySlug) {
    notFound();
  }

  const business = data.businessBySlug;

  // Pre-compute location to match BusinessView's internal logic
  const primaryAddr = business.addresses?.[0];
  const locationString = primaryAddr 
    ? `${primaryAddr.town || primaryAddr.city || ""} ${primaryAddr.lg || ""}`.trim() || "Location not available"
    : "Location not available";

  return (
    <>
      <DynamicHeader />
      <main className="min-h-[80vh] flex items-center justify-center no-limit-view" style={{padding: '20px'}} >
        <BusinessView 
          isFullPage={true}
          slug={slug} 
          id={business.id}
          userId={business.user?.id}
          name={business.name}
          description={business.description}
          location={locationString}
          logo={business.images?.find(img => img.isLogo)?.imageUrl}
          rating={business.reviews?.length > 0 
            ? (business.reviews.reduce((acc, r) => acc + r.rating, 0) / business.reviews.length).toFixed(1) 
            : "0.0"}
          reviews={business.reviews?.length || 0}
          category={business.category}
          isVerified={business.isVerified}
          phone={business.phone}
          addresses={business.addresses}
          contactUrls={business.contactUrls}
          galleryImages={business.images?.filter(img => !img.isLogo && img.imageUrl && img.imageUrl.trim() !== "").map(img => ({ id: img.id, url: img.imageUrl })) || []}
          videos={business.videos}
          notices={business.notices}
        />
      </main>
      <ScrollFooterWrapper />
      <Footer />
    </>
  );
}
