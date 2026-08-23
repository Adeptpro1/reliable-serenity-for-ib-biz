import { gql } from "@apollo/client";

export const GET_BUSINESS_VIDEOS = gql`
  query GetBusinessVideos($pagination: PaginationInput, $userLocation: LocationInput, $search: String) {
    businessVideos(pagination: $pagination, userLocation: $userLocation, search: $search) {
      id
      videoUrl
      title
      description
      likes
      downloads
      views
      boosted
      boostTier
      boostExpiresAt
      duration
      isSponsored
      locationBoundary
      expiresAt
      createdAt
      updatedAt
      business {
        id
        name
        slug
        description
        addresses {
          id
          town
          city
          lg
        }
        images {
          imageUrl
          isLogo
        }
      }
    }
  }
`;

export const GET_ADMIN_VIDEOS = gql`
  query GetAdminVideos($pagination: PaginationInput) {
    adminAllVideos(pagination: $pagination) {
      id
      videoUrl
      title
      description
      likes
      downloads
      views
      boosted
      duration
      isSponsored
      locationBoundary
      createdAt
      updatedAt
      business {
        id
        name
        slug
        description
      }
    }
  }
`;

export const GET_BUSINESS_VIDEOS_BY_BUSINESS = gql`
  query GetBusinessVideosByBusiness($businessId: ID!) {
    businessVideosByBusiness(businessId: $businessId) {
      id
      videoUrl
      title
      description
      likes
      downloads
      views
      boosted
      boostTier
      boostExpiresAt
      duration
      isSponsored
      locationBoundary
      expiresAt
      createdAt
      updatedAt
      business {
        id
        name
        slug
        description
        isVerified
      }
    }
  }
`;
