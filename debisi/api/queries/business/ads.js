import { gql } from "@apollo/client";

export const GET_ADS = gql`
  query GetAds($status: AdStatus, $pagination: PaginationInput) {
    ads(status: $status, pagination: $pagination) {
      id
      type
      status
      title
      imageUrl
      videoUrl
      startDate
      endDate
      impressions
      clicks
      business {
        id
        name
      }
    }
  }
`;

// Dedicated admin query — no optional variables to avoid 400 errors
export const GET_ADMIN_ADS = gql`
  query GetAdminAds {
    ads {
      id
      type
      status
      title
      impressions
      clicks
      business {
        id
        name
      }
    }
  }
`;


export const GET_ADS_BY_BUSINESS = gql`
  query GetAdsByBusiness($businessId: ID!) {
    adsByBusiness(businessId: $businessId) {
      id
      type
      status
      title
      imageUrl
      videoUrl
      startDate
      endDate
      impressions
      clicks
    }
  }
`;

export const REQUEST_AD = gql`
  mutation RequestAd($input: RequestAdInput!) {
    requestAd(input: $input) {
      id
      title
      status
    }
  }
`;

export const APPROVE_AD = gql`
  mutation ApproveAd($id: ID!) {
    approveAd(id: $id) {
      id
      status
    }
  }
`;

export const REJECT_AD = gql`
  mutation RejectAd($id: ID!, $reason: String) {
    rejectAd(id: $id, reason: $reason) {
      id
      status
    }
  }
`;

export const GET_PUBLIC_ADS = gql`
  query GetPublicAds($type: AdType, $limit: Int) {
    publicAds(type: $type, limit: $limit) {
      id
      type
      title
      imageUrl
      targetUrl
      business {
        id
        name
      }
    }
  }
`;
