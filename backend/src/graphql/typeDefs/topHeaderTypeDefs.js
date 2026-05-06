import { gql } from "apollo-server-express";

const topHeaderTypeDefs = gql`

type TopHeaderSetting {
  id: ID!
  text: String
  link: String
  isVisible: Boolean!
  createdAt: String!
  updatedAt: String!
}

type Query {
  topHeaderSetting: TopHeaderSetting
}

type Mutation {
  updateTopHeaderSetting(text: String, link: String, isVisible: Boolean): TopHeaderSetting
}
`;

export default topHeaderTypeDefs;