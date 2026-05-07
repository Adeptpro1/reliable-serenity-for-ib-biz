import { gql } from "@apollo/client";

export const GET_ADMIN_USERS = gql`
  query GetAdminUsers($pagination: PaginationInput) {
    adminUsersPaginated(pagination: $pagination) {
      id
      firstName
      lastName
      email
      role
      isEmailVerified
      createdAt
      businesses {
        name
      }
      createdAt
    }
  }
`;


