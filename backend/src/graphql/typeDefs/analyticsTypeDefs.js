import { gql } from "apollo-server-express";

const analyticsTypeDefs = gql`
  type TimeSeriesData {
    date: String!
    count: Int!
  }

  type BusinessAnalytics {
    totalViews: Int!
    totalClicks: Int!
    totalLeads: Int!
    totalShares: Int!
    viewsOverTime: [TimeSeriesData!]!
    leadsOverTime: [TimeSeriesData!]!
    sharesOverTime: [TimeSeriesData!]!
  }

  enum ActivityType {
    VIEW
    CLICK
    LIKE
    DOWNLOAD
    SHARE
  }

  input TrackActivityInput {
    businessId: ID
    videoId: ID
    noticeId: ID
    productId: ID
    activityType: ActivityType!
  }

  extend type Query {
    businessAnalytics(businessId: ID): BusinessAnalytics! @auth
  }

  extend type Mutation {
    trackActivity(input: TrackActivityInput!): Boolean!
  }
`;

export default analyticsTypeDefs;
