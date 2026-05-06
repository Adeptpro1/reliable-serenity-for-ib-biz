import { gql } from "apollo-server-express";

export const pricingTypeDefs = gql`

  type Pricing {
    id: ID!
    category: PricingCategory!
    title: String!
    description: String
    purpose: PaymentPurpose!
    amount: Float!
    currency: String!
    benefit: String!
    url: String!
    createdAt: String!
    updatedAt: String!
  }

  input CreatePricingInput {
    category: PricingCategory!
    title: String!
    description: String
    purpose: PaymentPurpose!
    amount: Float!
    currency: String
    benefit: String!
    url: String!
  }

  input UpdatePricingInput {
    id: ID!
    category: PricingCategory
    title: String
    description: String
    purpose: PaymentPurpose
    amount: Float
    currency: String
    benefit: String!
    url: String!
  }

  type Query {
    pricings: [Pricing!]!
    pricing(id: ID!): Pricing
  }

  type Mutation {
    createPricing(input: CreatePricingInput!): Pricing!
    updatePricing(input: UpdatePricingInput!): Pricing!
    deletePricing(id: ID!): Boolean!
  }
`;
export default pricingTypeDefs;