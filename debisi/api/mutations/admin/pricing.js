import { gql } from "@apollo/client";

export const CREATE_PRICING = gql`
  mutation CreatePricing($input: CreatePricingInput!) {
    createPricing(input: $input) {
      id
      title
      category
      purpose
      amount
      benefit
      url
    }
  }
`;

export const UPDATE_PRICING = gql`
  mutation UpdatePricing($input: UpdatePricingInput!) {
    updatePricing(input: $input) {
      id
      title
      amount
      category
      purpose
      benefit
      url
    }
  }
`;

export const DELETE_PRICING = gql`
  mutation DeletePricing($id: ID!) {
    deletePricing(id: $id)
  }
`;
