import { gql } from "apollo-server-express";

const sponsorSettingTypeDefs = gql`

type Sponsor {
  id: ID!
  title: String!
  image: String!
  url: String!
  createdAt: String!
  updatedAt: String!
}

type Query {
  sponsors: [Sponsor!]!
  sponsor(id: ID!): Sponsor
}

type Mutation {
  createSponsor(title: String!, image: String!, url: String!): Sponsor!
  updateSponsor(id: ID!, title: String, image: String, url: String): Sponsor!
  deleteSponsor(id: ID!): Boolean!
}
`;

export default sponsorSettingTypeDefs;