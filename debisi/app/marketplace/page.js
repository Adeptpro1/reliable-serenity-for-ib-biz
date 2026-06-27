import MarketplaceClient from "@/components/marketplace/MarketplaceClient";
import { fetchGraphQL } from "@/lib/graphqlServer";
import { GET_PRODUCTS } from "@/graphql/queries/business/products";
import ScrollFooterWrapper from "@/components/layoutComponents/ScrollFooterWrapper";

export const revalidate = 60; // Cash the page for 60 seconds (ISR)

export const metadata = {
  title: "Marketplace | Debisi Commercial Platform",
  description: "Discover and buy products from verified businesses in Oyo State",
};

export default async function MarketplacePage() {
  // Pre-fetch the first page of products on the server
  // Note: GET_PRODUCTS does not support a $pagination variable in its schema.
  const variables = {};
  const res = await fetchGraphQL(GET_PRODUCTS, variables, { revalidate: 60 });
  const initialProducts = res?.data?.products || [];

  return (
    <>
      <MarketplaceClient initialProducts={initialProducts} />
      <ScrollFooterWrapper />
    </>
  );
}
