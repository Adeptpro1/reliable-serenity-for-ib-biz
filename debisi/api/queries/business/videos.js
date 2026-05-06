import { gql } from "@apollo/client";

export const GET_BUSINESS_VIDEOS = gql`
  query GetBusinessVideos($pagination: PaginationInput, $userLocation: LocationInput, $search: String) {
    businessVideos(pagination: $pagination, userLocation: $userLocation, search: $search) {
      id
      videoUrl
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

export const GET_ADMIN_VIDEOS = gql`
  query GetAdminVideos {
    businessVideos {
      id
      videoUrl
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
