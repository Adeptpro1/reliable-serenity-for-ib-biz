import { gql } from "@apollo/client";

export const GET_MY_REACH_OUTS = gql`
  query GetMyReachOuts($businessId: ID!) {
    myReachOutRequests(businessId: $businessId) {
      id
      title
      description
      images
      callToActionUrl
      deliveryTime
      isImmediate
      status
      price
      rejectionReason
      createdAt
    }
  }
`;

export const GET_ADMIN_REACH_OUTS = gql`
  query GetAdminReachOuts($status: ReachOutStatus) {
    adminReachOutRequests(status: $status) {
      id
      title
      description
      images
      callToActionUrl
      deliveryTime
      isImmediate
      status
      price
      rejectionReason
      createdAt
      business {
        id
        name
        slug
      }
    }
  }
`;
