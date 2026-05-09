import { gql } from "@apollo/client";

export const GET_CURRENT_USER = gql`
  query Me {
    me {
      id
      email
      firstName
      lastName
      role
      phone
      dob
      gender
      state
      city
      town
      lg
      isProfileComplete
      businesses {
        id
        name
        description
        phone
        isMadeInOyo
        slug
        category
        shares
        addresses {
          id
          address1
          address2
          town
          city
          lg
        }
        contactUrls {
          id
          type
          url
          isPrimary
        }
        images {
          id
          imageUrl
          isLogo
        }
        notices {
          id
          title
          content
          startDate
          endDate
          callToAction
          link
          boosted
          boostExpiresAt
          leadFields
          createdAt
          images {
            id
            imageUrl
          }
        }
        reviews {
          id
          rating
        }
      }
    }
  }
`;
