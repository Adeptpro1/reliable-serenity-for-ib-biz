import { gql } from "@apollo/client";

export const GET_MY_WALLET = gql`
  query GetMyWallet {
    myWallet {
      id
      balance
      transactions {
        id
        amount
        type
        purpose
        status
        createdAt
        business {
          id
          name
        }
      }
    }
  }
`;

export const INITIALIZE_WALLET_FUNDING = gql`
  mutation InitializeWalletFunding($amount: Float!, $callbackUrl: String) {
    initializeWalletFunding(amount: $amount, callbackUrl: $callbackUrl) {
      authorization_url
      access_code
      reference
    }
  }
`;

export const VERIFY_WALLET_FUNDING = gql`
  mutation VerifyWalletFunding($reference: String!) {
    verifyWalletFunding(reference: $reference) {
      id
      balance
    }
  }
`;

export const GET_WALLET_TRANSACTIONS = gql`
  query GetWalletTransactions($businessId: ID, $pagination: PaginationInput) {
    walletTransactions(businessId: $businessId, pagination: $pagination) {
      id
      amount
      type
      purpose
      status
      createdAt
      business {
        id
        name
      }
    }
  }
`;
