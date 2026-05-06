import { gql } from "apollo-server-express";

const sponsorSettingTypeDefs = gql`

type Sponsorship {
  id: ID!
  userId: String
  user: User
  businessIds: [String]     # list of all businesses connected
  businessName: String!
  businessEmail: String!
  phone: String!
  website: String
  logo: String
  amount: Float
  startDate: DateTime
  endDate: DateTime
  createdAt: DateTime
  updatedAt: DateTime
}

input SponsorshipInput {
  businessName: String!
  businessEmail: String!
  phone: String!
  website: String
  logo: String
  amount: Float
  startDate: DateTime
  endDate: DateTime
}
  
type Query {
  sponsorships: [Sponsorship!]!
  sponsorship(id: ID!): Sponsorship
}

type Mutation {
  createSponsorship(input: SponsorshipInput!): Sponsorship!
  updateSponsorship(id: ID!, input: SponsorshipInput!): Sponsorship!
  deleteSponsorship(id: ID!): Boolean!
}
  `

export default sponsorSettingTypeDefs;
