import { gql } from "apollo-server-express";

const followTypeDefs = gql`
  type Follow {
    id: ID!
    user: User
    business: Business!
    name: String!
    email: String
    phone: String
    createdAt: DateTime!
  }

  input FollowBusinessInput {
    businessId: ID!
    name: String!
    email: String
    phone: String
  }

  extend type Query {
    businessFollowers(businessId: ID!, pagination: PaginationInput): [Follow!]! @auth
    myFollows(pagination: PaginationInput): [Follow!]! @auth
    isFollowing(businessId: ID!): Boolean!
    followerCount(businessId: ID!): Int!
  }

  extend type Mutation {
    followBusiness(input: FollowBusinessInput!): Follow!
    unfollowBusiness(businessId: ID!): Boolean! @auth
  }
`;

export default followTypeDefs;
