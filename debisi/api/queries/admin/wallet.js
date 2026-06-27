import { gql } from "@apollo/client";

export const GET_ADMIN_WALLET_STATS = gql`
  query GetAdminWalletStats {
    adminWalletStats {
      totalRevenue
      totalUserBalances
      totalTransactionsCount
      fundingCount
      deductionCount
    }
  }
`;

export const GET_ADMIN_ALL_TRANSACTIONS = gql`
  query GetAdminAllTransactions($pagination: PaginationInput) {
    adminAllWalletTransactions(pagination: $pagination) {
      id
      amount
      type
      purpose
      reference
      status
      createdAt
      wallet {
        user {
          firstName
          lastName
          email
        }
      }
      business {
        name
      }
    }
  }
`;
