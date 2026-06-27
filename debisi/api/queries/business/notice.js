import { gql } from "@apollo/client";

export const GET_BUSINESS_NOTICES = gql`
  query GetBusinessNotices($pagination: PaginationInput, $userLocation: LocationInput, $search: String) {
    noticeboards(pagination: $pagination, userLocation: $userLocation, search: $search) {
      id
      title
      content
      boosted
      boostTier
      boostExpiresAt
      callToAction
      likes
      shares
      leadFields
      images {
        id
        imageUrl
      }
      business {
        id
        name
        slug
      }
      createdAt
    }
  }
`;

export const GET_ADMIN_NOTICES = gql`
  query GetAdminNotices {
    noticeboards {
      id
      title
      content
      boosted
      boostTier
      boostExpiresAt
      callToAction
      likes
      shares
      leadFields
      images {
        id
        imageUrl
      }
      business {
        id
        name
        slug
      }
      createdAt
    }
  }
`;

export const GET_NOTICE_LEADS = gql`
  query GetNoticeLeads($noticeId: ID!) {
    contactSubmissions(noticeId: $noticeId) {
      id
      name
      email
      phone
      additionalData
      submittedAt
    }
  }
`;

export const CREATE_NOTICE = gql`
  mutation CreateNotice($input: CreateNoticeInput!) {
    createNotice(input: $input) {
      id
      title
      boosted
      boostExpiresAt
    }
  }
`;

export const BOOST_NOTICE = gql`
  mutation BoostNotice($noticeId: ID!, $days: Int!, $tier: BoostTier) {
    boostNotice(noticeId: $noticeId, days: $days, tier: $tier) {
      id
      boosted
      boostTier
      boostExpiresAt
    }
  }
`;

export const SUBMIT_NOTICE_LEAD = gql`
  mutation SubmitNoticeLead(
    $noticeId: ID!, 
    $name: String!, 
    $email: String!, 
    $phone: String, 
    $additionalData: JSON
  ) {
    submitNoticeLead(
      noticeId: $noticeId, 
      name: $name, 
      email: $email, 
      phone: $phone, 
      additionalData: $additionalData
    ) {
      id
      submittedAt
    }
  }
`;

export const DELETE_NOTICE = gql`
  mutation DeleteNotice($id: ID!) {
    deleteNotice(id: $id)
  }
`;
