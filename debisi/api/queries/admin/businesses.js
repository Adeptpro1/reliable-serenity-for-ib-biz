import { gql } from "@apollo/client";

export const GET_ADMIN_BUSINESSES = gql`
  query GetAdminBusinesses($skip: Int, $take: Int) {
    adminBusinessesPaginated(pagination: { skip: $skip, take: $take }) {
      id
      name
      category
      slug
      isVerified
      user {
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
