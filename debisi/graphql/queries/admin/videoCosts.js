import { gql } from "@apollo/client";

export const GET_ADMIN_VIDEO_COSTS = gql`
  query GetAdminVideoCosts($pagination: PaginationInput) {
    adminVideoCostSummary {
      totalBandwidthGB
      totalEstimatedCost
      totalVideoRevenue
      netMargin
      marginPercentage
      activeVideosTracked
    }
    adminVideoCostLogs(pagination: $pagination) {
      id
      videoId
      businessId
      date
      bandwidthGB
      estimatedCost
      boostTier
      revenue
      profitMargin
      videoTitle
      businessName
    }
  }
`;
