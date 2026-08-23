import { gql } from "@apollo/client";

export const CREATE_PRICING = gql`
  mutation CreatePricing($input: CreatePricingInput!) {
    createPricing(input: $input) {
      id
      title
      description
      category
      purpose
      amount
      currency
      benefit
      url
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_PRICING = gql`
  mutation UpdatePricing($input: UpdatePricingInput!) {
    updatePricing(input: $input) {
      id
      title
      description
      category
      purpose
      amount
      currency
      benefit
      url
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_PRICING = gql`
  mutation DeletePricing($id: ID!) {
    deletePricing(id: $id)
  }
`;

export const SEED_DEFAULT_PRICINGS = gql`
  mutation SeedDefaultPricings {
    seedDefaultPricings {
      id
      title
      description
      category
      purpose
      amount
      currency
      benefit
      url
      createdAt
      updatedAt
    }
  }
`;
