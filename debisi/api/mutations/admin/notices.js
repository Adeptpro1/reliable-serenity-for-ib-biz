import { gql } from "@apollo/client";

export const ADMIN_DELETE_NOTICE = gql`
  mutation AdminDeleteNotice($id: ID!) {
    adminDeleteNotice(id: $id)
  }
`;

export const ADMIN_UPDATE_NOTICE = gql`
  mutation AdminUpdateNotice($id: ID!, $input: AdminUpdateNoticeInput!) {
    adminUpdateNotice(id: $id, input: $input) {
      id
      title
      content
      boosted
    }
  }
`;
