import MarketplaceClient from "@/components/marketplace/MarketplaceClient";
import { fetchGraphQL } from "@/lib/graphqlServer";
import { GET_PRODUCTS } from "@/graphql/queries/business/products";
import ScrollFooterWrapper from "@/components/layoutComponents/ScrollFooterWrapper";

export const revalidate = 60; // ISR — revalidate every 60 seconds

export const metadata = {
  title: "Marketplace | Debisi Commercial Platform",
  description: "Discover and buy products from verified businesses in Oyo State",
};

export default async function MarketplacePage({ searchParams }) {
  const params = await searchParams;
  // ?highlight=<productId> — set by FeedProductCard "View" links on the homepage
  const highlightId = params?.highlight || null;

  const res = await fetchGraphQL(GET_PRODUCTS, {}, { revalidate: 60 });
  const initialProducts = res?.data?.products || [];

  return (
    <>
      <MarketplaceClient
        initialProducts={initialProducts}
        highlightId={highlightId}
      />
      <ScrollFooterWrapper />
    </>
  );
}

