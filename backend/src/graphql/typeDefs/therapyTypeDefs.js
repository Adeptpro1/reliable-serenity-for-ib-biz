import { gql } from "apollo-server-express";

const therapyTypeDefs = gql`
  type TherapySessionRequest {
    id: ID!
    name: String!
    email: String!
    phone: String
    message: String!
    status: String!
    createdAt: String!
    updatedAt: String!
  }

  extend type Query {
    therapyRequests: [TherapySessionRequest!]!
  }

  extend type Mutation {
    requestTherapySession(
      name: String!
      email: String!
      phone: String
      message: String!
    ): TherapySessionRequest!

    updateTherapyRequestStatus(id: ID!, status: String!): TherapySessionRequest!
  }
`;

export default therapyTypeDefs;
