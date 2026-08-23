import { gql } from "@apollo/client";

export const GET_ADMIN_USERS = gql`
  query GetAdminUsers($pagination: PaginationInput, $search: String) {
    adminUsersCount(search: $search)
    adminUsersPaginated(pagination: $pagination, search: $search) {
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
    }
  }
`;


