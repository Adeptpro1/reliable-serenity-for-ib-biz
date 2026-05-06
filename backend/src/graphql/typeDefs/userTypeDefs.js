import { gql } from "apollo-server-express";

const userTypeDefs = gql`
  type User {
    id: ID!
    firstName: String!
    lastName: String!
    email: String!
    isEmailVerified: Boolean!
    phone: String
    role: UserRole!
    dob: String
    gender: Gender
    lg: Lg
    city: City
    town: Town
    state: State
    agreedToPolicy: Boolean!
    businesses: [Business!]
    reviews: [Review!]
    notifications: [Notification!]
    ads: [Ad!]
    sponsored: [Sponsorship!]
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  input UpdateUserInput {
    firstName: String
    lastName: String
    phone: String
    dob: DateTime
    gender: Gender
    lg: Lg
    city: City
    town: Town
    state: State
  }

  extend type Query {
    users: [User!]
    user(id: ID!): User
    me: User @auth
    allUsers: [User!]!
    usersPaginated(pagination: PaginationInput): [User!]!
  }

  extend type Mutation {
    updateUser(input: UpdateUserInput!): User! @auth
  }
`;

export default userTypeDefs;
