import { gql } from "@apollo/client";

export const ADMIN_DELETE_BUSINESS = gql`
  mutation AdminDeleteBusiness($id: ID!) {
    adminDeleteBusiness(id: $id)
  }
`;

export const ADMIN_UPDATE_BUSINESS = gql`
  mutation AdminUpdateBusiness($id: ID!, $input: AdminUpdateBusinessInput!) {
    adminUpdateBusiness(id: $id, input: $input) {
      id
      name
      category
      isVerified
    }
  }
`;
