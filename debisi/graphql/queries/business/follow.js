import { gql } from "@apollo/client";

export const IS_FOLLOWING = gql`
  query IsFollowing($businessId: ID!) {
    isFollowing(businessId: $businessId)
  }
`;

export const FOLLOWER_COUNT = gql`
  query FollowerCount($businessId: ID!) {
    followerCount(businessId: $businessId)
  }
`;

export const GET_MY_FOLLOWS = gql`
  query GetMyFollows($pagination: PaginationInput) {
    myFollows(pagination: $pagination) {
      id
      createdAt
      business {
        id
        name
        slug
        isVerified
        images {
          id
          imageUrl
          isLogo
        }
      }
    }
  }
`;
