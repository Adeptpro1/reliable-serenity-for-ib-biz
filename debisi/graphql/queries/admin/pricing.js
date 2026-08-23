import { gql } from "@apollo/client";

export const GET_PRICINGS = gql`
  query GetPricings {
    pricings {
      id
      category
      title
      description
      purpose
      amount
      currency
      benefit
      url
      createdAt
    }
  }
`;

