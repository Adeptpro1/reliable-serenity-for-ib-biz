import { gql } from "apollo-server-express";

const blogPostTypeDefs = gql`
type BlogPost {
  id: ID!
  title: String!
  content: String!
  mediaUrls: String!
  likes: Int!
  shares: Int!
  createdAt: String!
  updatedAt: String!
}

type Query {
  blogPosts: [BlogPost!]!
  blogPost(id: ID!): BlogPost
}

type Mutation {
  createBlogPost(title: String!, content: String!, mediaUrls: String!): BlogPost
  updateBlogPost(id: ID!, title: String, content: String, mediaUrls: String!): BlogPost
  deleteBlogPost(id: ID!): Boolean
  likeBlogPost(id: ID!): BlogPost
  shareBlogPost(id: ID!): BlogPost
}
`;

export default blogPostTypeDefs;