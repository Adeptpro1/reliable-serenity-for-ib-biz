import { gql } from "apollo-server-express";

const eventTypeDefs = gql`
  type Event {
    id: ID!
    title: String!
    description: String!
    date: String!
    imageUrl: String
    link: String
    createdAt: String!
    updatedAt: String!
  }

  extend type Query {
    events: [Event!]!
    event(id: ID!): Event
  }

  extend type Mutation {
    createEvent(
      title: String!
      description: String!
      date: String!
      imageUrl: String
      link: String
    ): Event!

    updateEvent(
      id: ID!
      title: String
      description: String
      date: String
      imageUrl: String
      link: String
    ): Event!

    deleteEvent(id: ID!): Boolean!
  }
`;

export default eventTypeDefs;
