import { gql } from "@apollo/client";

export const GET_ADMIN_TOP_LISTINGS = gql`
  query GetAdminTopListings($pagination: PaginationInput, $toplistad: TopListAd, $status: String) {
    adminAllTopListingAds(pagination: $pagination, toplistad: $toplistad, status: $status) {
      id
      toplistad
      startDate
      endDate
      createdAt
      business {
        id
        name
        slug
        user {
          id
          firstName
          lastName
          email
        }
      }
    }
  }
`;

export const ADMIN_CANCEL_TOP_LISTING = gql`
  mutation AdminCancelTopListing($id: ID!) {
    adminCancelTopListingAd(id: $id)
  }
`;
