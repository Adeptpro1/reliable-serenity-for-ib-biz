// GET_PRODUCTS_FEED — lightweight query for the home feed
// Reuses the existing `products` resolver which supports userLocation + pagination.
import { gql } from "@apollo/client";

export const GET_PRODUCTS_FEED = gql`
  query GetProductsFeed(
    $pagination: PaginationInput
    $userLocation: LocationInput
  ) {
    products(pagination: $pagination, userLocation: $userLocation) {
      id
      title
      price
      discount
      isMadeInOyo
      isBoosted
      boostTier
      category
      location
      createdAt
      business {
        id
        name
        slug
        phone
        contactUrls {
          id
          url
          type
          isPrimary
        }
      }
      images {
        id
        imageUrl
        isPrimary
      }
    }
  }
`;
