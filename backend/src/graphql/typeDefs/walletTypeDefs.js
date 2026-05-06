import { gql } from "apollo-server-express";

const walletTypeDefs = gql`
  type Wallet {
    id: ID!
    user: User!
    balance: Float!
    transactions: [WalletTransaction!]
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type WalletTransaction {
    id: ID!
    wallet: Wallet!
    amount: Float!
    type: TransactionType!
    purpose: PaymentPurpose!
    reference: String
    business: Business
    status: TransactionStatus!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  enum TransactionType {
    FUNDING
    DEDUCTION
  }

  enum TransactionStatus {
    PENDING
    SUCCESS
    FAILED
  }

  extend type User {
    wallet: Wallet
  }

  type AdminWalletStats {
    totalRevenue: Float!
    totalUserBalances: Float!
    totalTransactionsCount: Int!
    fundingCount: Int!
    deductionCount: Int!
  }

  extend type Query {
    myWallet: Wallet @auth
    walletTransactions(businessId: ID, pagination: PaginationInput): [WalletTransaction!] @auth
    adminWalletStats: AdminWalletStats! @auth(roles: ["ADMIN"])
    adminAllWalletTransactions(pagination: PaginationInput): [WalletTransaction!] @auth(roles: ["ADMIN"])
  }

  extend type Mutation {
    initializeWalletFunding(amount: Float!): PaystackInitializationResponse! @auth
    verifyWalletFunding(reference: String!): Wallet! @auth
  }

  type PaystackInitializationResponse {
    authorization_url: String!
    access_code: String!
    reference: String!
  }
`;

export default walletTypeDefs;
