import { gql } from "@apollo/client";

export const ADMIN_DELETE_VIDEO = gql`
  mutation AdminDeleteVideo($id: ID!) {
    adminDeleteVideo(id: $id)
  }
`;

export const ADMIN_UPDATE_VIDEO = gql`
  mutation AdminUpdateVideo($id: ID!, $input: AdminUpdateVideoInput!) {
    adminUpdateVideo(id: $id, input: $input) {
      id
      boosted
      isSponsored
    }
  }
`;
