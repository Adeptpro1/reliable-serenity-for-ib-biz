import { gql } from "@apollo/client";

export const CREATE_REACH_OUT = gql`
  mutation CreateReachOutRequest($input: CreateReachOutInput!) {
    createReachOutRequest(input: $input) {
      id
      title
      price
      status
    }
  }
`;

export const APPROVE_REACH_OUT = gql`
  mutation ApproveReachOutRequest($id: ID!) {
    approveReachOutRequest(id: $id) {
      id
      status
    }
  }
`;

export const REJECT_REACH_OUT = gql`
  mutation RejectReachOutRequest($id: ID!, $reason: String!) {
    rejectReachOutRequest(id: $id, reason: $reason) {
      id
      status
      rejectionReason
    }
  }
`;
