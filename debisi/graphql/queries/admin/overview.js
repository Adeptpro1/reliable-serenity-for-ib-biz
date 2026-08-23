import { gql } from "@apollo/client";

/**
 * Fetches all the counts and recent items needed for the Admin Overview dashboard.
 * Uses aggregated adminOverviewStats for 100% accurate system-wide numbers.
 */
export const GET_ADMIN_OVERVIEW = gql`
  query GetAdminOverview {
    adminOverviewStats {
      totalUsersCount
      totalAdminsCount
      usersWithBusinessCount
      totalBusinessesCount
      verifiedBusinessesCount
      totalNoticesCount
      boostedNoticesCount
      totalVideosCount
      totalAdsCount
      pendingAdsCount
      totalTherapyRequestsCount
      pendingTherapyRequestsCount
      totalRevenue
      totalUserBalances
      totalTransactionsCount
      fundingCount
      deductionCount
    }
    adminUsersPaginated(pagination: { take: 5 }) {
      id
      firstName
      lastName
      role
      createdAt
    }
    adminBusinessesPaginated(pagination: { take: 5 }) {
      id
      name
      category
      isVerified
      createdAt
    }
    therapyRequests {
      id
      name
      status
      createdAt
    }
  }
`;
