import { gql } from "@apollo/client";

export const GET_MY_LEADS = gql`
  query GetMyLeads($businessId: ID) {
    myLeads(businessId: $businessId) {
      id
      name
      email
      phone
      additionalData
      submittedAt
      business {
        id
        name
      }
      notice {
        id
        title
      }
      followerBusiness {
        id
        name
        slug
        isVerified
      }
    }
  }
`;
