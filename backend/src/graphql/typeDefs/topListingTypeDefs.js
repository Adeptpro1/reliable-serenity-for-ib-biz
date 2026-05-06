import { gql } from "apollo-server-express";

const topListingTypeDefs = gql`
  input PurchaseTopListingInput {
    businessId: ID!
    type: TopListAd!
    days: Int!
  }

  extend type Query {
    topLists(type: TopListAd): [TopListingAd!]!
    topListsByBusiness(businessId: ID!): [TopListingAd!]!
  }

  extend type Mutation {
    purchaseTopListing(input: PurchaseTopListingInput!): TopListingAd! @auth
  }
`;

export default topListingTypeDefs;
