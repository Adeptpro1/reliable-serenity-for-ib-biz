import { gql } from "@apollo/client";

export const UPLOAD_BUSINESS_VIDEO = gql`
  mutation UploadBusinessVideo($input: UploadVideoInput!) {
    uploadBusinessVideo(input: $input) {
      id
      videoUrl
      duration
      createdAt
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
