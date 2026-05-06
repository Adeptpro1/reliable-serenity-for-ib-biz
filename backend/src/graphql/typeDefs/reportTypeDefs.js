import { gql } from "apollo-server-express";

const reportTypeDefs = gql`
  extend type Query {
    exportLeadsCSV(noticeId: ID!): String!
  }
`;

export default reportTypeDefs;
