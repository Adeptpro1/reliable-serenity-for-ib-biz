import { gql } from "apollo-server-express";

const verificationTypeDefs = gql`
  input SubmitVerificationInput {
    businessId: ID!
    natureOfBusiness: String!
    currentAddress: String!
    bankName: String!
    accountNumber: String!
    accountName: String!
    accountType: String!
    certificationType: String
    primaryContactName: String
    primaryContactPhone: String
    primaryContactEmail: String
    secondaryContactName: String
    secondaryContactPhone: String
    secondaryContactEmail: String
    cacCertificateUrl: String!
    memoOfAssociationUrl: String
    letterheadUrl: String
    chequeUrl: String
    paymentAmount: Int # in kobo, optional if default is used
  }

  input ReviewVerificationInput {
    verificationId: ID!
    status: VerificationStatus!
    reviewerNotes: String
  }

  extend type Query {
    # Get all verifications (Admin only)
    adminVerifications(status: VerificationStatus, pagination: PaginationInput): [BusinessVerification!]! @auth(roles: ["ADMIN"])
    
    # Get verification for a specific business
    businessVerification(businessId: ID!): BusinessVerification @auth
  }

  extend type Mutation {
    # Submit business for verification
    submitBusinessVerification(input: SubmitVerificationInput!): BusinessVerification! @auth
    
    # Admin review of a verification
    reviewBusinessVerification(input: ReviewVerificationInput!): BusinessVerification! @auth(roles: ["ADMIN"])
  }
`;

export default verificationTypeDefs;
