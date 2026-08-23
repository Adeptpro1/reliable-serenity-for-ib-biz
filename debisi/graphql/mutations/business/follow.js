import { gql } from "@apollo/client";

export const FOLLOW_BUSINESS = gql`
  mutation FollowBusiness($input: FollowBusinessInput!) {
    followBusiness(input: $input) {
      id
      name
      email
      phone
      createdAt
    }
  }
`;

export const UNFOLLOW_BUSINESS = gql`
  mutation UnfollowBusiness($businessId: ID!) {
    unfollowBusiness(businessId: $businessId)
  }
`;
