import { gql } from "@apollo/client";

export const UPLOAD_BUSINESS_VIDEO = gql`
  mutation UploadBusinessVideo($input: UploadVideoInput!) {
    uploadBusinessVideo(input: $input) {
      id
      videoUrl
      title
      description
      duration
      expiresAt
      boosted
      boostTier
      boostExpiresAt
      createdAt
    }
  }
`;

export const RELIST_BUSINESS_VIDEO = gql`
  mutation RelistBusinessVideo(
    $videoId: ID!
    $isBoosted: Boolean!
    $boostTier: BoostTier
    $boostDuration: Int
  ) {
    relistBusinessVideo(
      videoId: $videoId
      isBoosted: $isBoosted
      boostTier: $boostTier
      boostDuration: $boostDuration
    ) {
      id
      expiresAt
      boosted
      boostTier
      boostExpiresAt
    }
  }
`;

export const DELETE_BUSINESS_VIDEO = gql`
  mutation DeleteBusinessVideo($id: ID!) {
    deleteBusinessVideo(id: $id)
  }
`;

export const VIEW_VIDEO = gql`
  mutation ViewVideo($id: ID!) {
    viewVideo(id: $id) {
      id
      views
    }
  }
`;

export const LIKE_VIDEO = gql`
  mutation LikeVideo($id: ID!) {
    likeVideo(id: $id) {
      id
      likes
    }
  }
`;

export const SPONSOR_VIDEO = gql`
  mutation SponsorVideo($videoId: ID!, $amount: Float!) {
    sponsorVideo(videoId: $videoId, amount: $amount) {
      id
      isSponsored
    }
  }
`;
