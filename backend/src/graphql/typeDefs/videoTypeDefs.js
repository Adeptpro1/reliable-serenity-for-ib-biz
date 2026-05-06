import { gql } from "apollo-server-express";

const videoTypeDefs = gql`
  input UploadVideoInput {
    businessId: ID!
    videoUrl: String!
    duration: Int
  }

  extend type Query {
    businessVideos(pagination: PaginationInput, userLocation: LocationInput, search: String): [BusinessVideo!]!
    businessVideosByBusiness(businessId: ID!): [BusinessVideo!]!
  }

  extend type Mutation {
    uploadBusinessVideo(input: UploadVideoInput!): BusinessVideo! @auth
    sponsorVideo(videoId: ID!, amount: Float!): BusinessVideo! @auth
    deleteBusinessVideo(id: ID!): Boolean! @auth
    viewVideo(id: ID!): BusinessVideo!
    likeVideo(id: ID!): BusinessVideo!
  }
`;

export default videoTypeDefs;
