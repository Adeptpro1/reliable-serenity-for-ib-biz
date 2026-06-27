import { gql } from "@apollo/client";

// ─── Fragments ────────────────────────────────────────────────────────────────

export const BOTW_APPLICATION_FRAGMENT = gql`
  fragment BotwApplicationFields on BotwApplication {
    id
    cycleId
    businessId
    status
    paystackRef
    appliedAt
    paidAt
    approvedAt
    business {
      id
      name
      slug
      isVerified
      isBusinessOfTheWeek
    }
  }
`;

export const BOTW_CYCLE_FRAGMENT = gql`
  fragment BotwCycleFields on BotwCycle {
    id
    weekStart
    weekEnd
    isOpen
    publishedAt
    paidCount
    spotsRemaining
  }
`;

// ─── Queries ──────────────────────────────────────────────────────────────────

export const GET_ACTIVE_BOTW_CYCLE = gql`
  query GetActiveBotwCycle {
    activeBotwCycle {
      ...BotwCycleFields
    }
  }
  ${BOTW_CYCLE_FRAGMENT}
`;

export const GET_BOTW_ELIGIBILITY = gql`
  query GetBotwEligibility($businessId: ID!, $cycleId: ID!) {
    botwEligibility(businessId: $businessId, cycleId: $cycleId) {
      eligible
      reason
      paidCount
      spotsRemaining
    }
  }
`;

export const GET_MY_BOTW_APPLICATION = gql`
  query GetMyBotwApplication($businessId: ID!, $cycleId: ID!) {
    myBotwApplication(businessId: $businessId, cycleId: $cycleId) {
      ...BotwApplicationFields
    }
  }
  ${BOTW_APPLICATION_FRAGMENT}
`;

export const ADMIN_GET_BOTW_CYCLES = gql`
  query AdminGetBotwCycles($take: Int, $skip: Int) {
    adminBotwCycles(take: $take, skip: $skip) {
      ...BotwCycleFields
      applications {
        ...BotwApplicationFields
      }
    }
  }
  ${BOTW_CYCLE_FRAGMENT}
  ${BOTW_APPLICATION_FRAGMENT}
`;

export const ADMIN_GET_BOTW_APPLICATIONS = gql`
  query AdminGetBotwApplications($cycleId: ID, $status: BotwAppStatus) {
    adminBotwApplications(cycleId: $cycleId, status: $status) {
      ...BotwApplicationFields
    }
  }
  ${BOTW_APPLICATION_FRAGMENT}
`;

// ─── Mutations ────────────────────────────────────────────────────────────────

export const APPLY_FOR_BOTW = gql`
  mutation ApplyForBotw($businessId: ID!, $cycleId: ID!, $callbackUrl: String!) {
    applyForBotw(businessId: $businessId, cycleId: $cycleId, callbackUrl: $callbackUrl)
  }
`;

export const VERIFY_BOTW_PAYMENT = gql`
  mutation VerifyBotwPayment($reference: String!) {
    verifyBotwPayment(reference: $reference) {
      ...BotwApplicationFields
    }
  }
  ${BOTW_APPLICATION_FRAGMENT}
`;

export const APPROVE_BOTW_APPLICATIONS = gql`
  mutation ApproveBotwApplications($applicationIds: [ID!]!) {
    approveBotwApplications(applicationIds: $applicationIds) {
      ...BotwApplicationFields
    }
  }
  ${BOTW_APPLICATION_FRAGMENT}
`;

export const MANUAL_PUBLISH_BOTW_CYCLE = gql`
  mutation ManualPublishBotwCycle {
    manualPublishBotwCycle {
      ...BotwCycleFields
    }
  }
  ${BOTW_CYCLE_FRAGMENT}
`;
