import { gql } from "@apollo/client";

/**
 * Fetches all the counts and recent items needed for the Admin Overview dashboard.
 * Uses queries that already exist in the schema.
 */
export const GET_ADMIN_OVERVIEW = gql`
  query GetAdminOverview {
    adminWalletStats {
      totalRevenue
      totalTransactionsCount
      fundingCount
      deductionCount
    }
    adminUsersPaginated {
      id
      firstName
      lastName
      role
      createdAt
    }
    adminBusinessesPaginated {
      id
      name
      category
      isVerified
      createdAt
    }
    ads {
      id
      status
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
