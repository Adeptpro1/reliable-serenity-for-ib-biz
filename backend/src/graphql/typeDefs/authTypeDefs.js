import { gql } from "apollo-server-express";

const authTypeDefs = gql`
  type AuthPayload {
    token: String
    refreshToken: String    # returned alongside the main token
    user: User!
  }

  type MessageResponse {
    message: String!
  }

  extend type Mutation {
    registerUser(
      firstName: String!
      lastName: String!
      email: String!
      password: String!
      firebaseUid: String!
      phone: String
      role: UserRole
      dob: String
      gender: Gender
      lg: Lg
      town: Town
      city: City
      state: State
      agreedToPolicy: Boolean!
    ): AuthPayload!

    loginUser(email: String!, password: String!): AuthPayload!
    loginAdmin(email: String!, password: String!): AuthPayload!
    refreshToken(token: String!): AuthPayload!

    resendVerificationEmail(email: String!): MessageResponse!
    verifyEmail(token: String!): AuthPayload!

    forgotPassword(email: String!): Boolean!
    resetPassword(token: String!, newPassword: String!): Boolean!
    changePassword(oldPassword: String!, newPassword: String!): Boolean!

    logout(token: String): Boolean!
  }
`;

export default authTypeDefs;
