import { gql } from "apollo-server-express";

const adminTypeDefs = gql`
  input PaginationInput {
    skip: Int
    take: Int
  }

  input AdminUpdateUserInput {
    firstName: String
    lastName: String
    email: String
    role: String
    isEmailVerified: Boolean
  }

  input AdminUpdateBusinessInput {
    name: String
    category: String
    isVerified: Boolean
  }

  input AdminUpdateNoticeInput {
    title: String
    content: String
    boosted: Boolean
  }

  input AdminUpdateVideoInput {
    boosted: Boolean
    isSponsored: Boolean
  }


  extend type Query {
    adminUsersPaginated(pagination: PaginationInput): [User!]! @auth(roles: ["ADMIN"])
    adminBusinessesPaginated(pagination: PaginationInput): [Business!]! @auth(roles: ["ADMIN"])
    adminAllNotifications: [Notification!]! @auth(roles: ["ADMIN"])
  }

  extend type Mutation {
    adminDeleteUser(id: ID!): Boolean! @auth(roles: ["ADMIN"])
    adminDeleteBusiness(id: ID!): Boolean! @auth(roles: ["ADMIN"])
    adminDeleteNotice(id: ID!): Boolean! @auth(roles: ["ADMIN"])
    adminDeleteVideo(id: ID!): Boolean! @auth(roles: ["ADMIN"])
    
    adminUpdateUser(id: ID!, input: AdminUpdateUserInput!): User! @auth(roles: ["ADMIN"])
    adminUpdateBusiness(id: ID!, input: AdminUpdateBusinessInput!): Business! @auth(roles: ["ADMIN"])
    adminUpdateNotice(id: ID!, input: AdminUpdateNoticeInput!): Noticeboard! @auth(roles: ["ADMIN"])
    adminUpdateVideo(id: ID!, input: AdminUpdateVideoInput!): BusinessVideo! @auth(roles: ["ADMIN"])
    adminDeleteWebBanner(id: ID!): Boolean! @auth(roles: ["ADMIN"])
  }
`;

export default adminTypeDefs;
