import { gql } from "@apollo/client";

export const GET_ADMIN_BUSINESSES = gql`
  query GetAdminBusinesses($skip: Int, $take: Int, $search: String) {
    adminBusinessesCount(search: $search)
    adminBusinessesPaginated(pagination: { skip: $skip, take: $take }, search: $search) {
      id
      name
      category
      slug
      isVerified
      user {
        id
        firstName
        lastName
        email
      }
      addresses {
        town
        city
      }
    }
  }
`;
