import { gql } from "apollo-server-express";

const adTypeDefs = gql`
  input RequestAdInput {
    businessId: ID!
    type: AdType!
    title: String!
    image: String
    videoUrl: String
    startDate: String
    endDate: String
    amount: Float!
  }

  extend type Query {
    ads(status: AdStatus, pagination: PaginationInput): [Ad!]!
    adsByBusiness(businessId: ID!): [Ad!]! @auth
  }

  extend type Mutation {
    requestAd(input: RequestAdInput!): Ad! @auth
    approveAd(id: ID!): Ad! @auth(roles: ["ADMIN"])
    rejectAd(id: ID!, reason: String): Ad! @auth(roles: ["ADMIN"])
    publishAd(id: ID!): Ad! @auth(roles: ["ADMIN"])
    clickAd(id: ID!): Ad!
  }
`;

export default adTypeDefs;
