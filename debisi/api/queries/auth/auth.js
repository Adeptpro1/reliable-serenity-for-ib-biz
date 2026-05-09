import { gql } from "@apollo/client";

export const LOGIN_USER = gql`
  mutation Login($email: String!, $password: String!) {
    loginUser(email: $email, password: $password) {
      token
      refreshToken
      user {
        id
        email
        firstName
        lastName
        role
      }
    }
  }
`;

export const LOGIN_ADMIN = gql`
  mutation LoginAdmin($email: String!, $password: String!) {
    loginAdmin(email: $email, password: $password) {
      token
      refreshToken
      user {
        id
        email
        firstName
        lastName
        role
      }
    }
  }
`;

export const RESEND_VERIFICATION = gql`
  mutation ResendVerificationEmail($email: String!) {
    resendVerificationEmail(email: $email) {
      message
    }
  }
`;

export const FORGOT_PASSWORD = gql`
  mutation ForgotPassword($email: String!) {
    forgotPassword(email: $email)
  }
`;

export const RESET_PASSWORD = gql`
  mutation ResetPassword($token: String!, $newPassword: String!) {
    resetPassword(token: $token, newPassword: $newPassword)
  }
`;

export const CHANGE_PASSWORD = gql`
  mutation ChangePassword($oldPassword: String!, $newPassword: String!) {
    changePassword(oldPassword: $oldPassword, newPassword: $newPassword)
  }
`;

export const LOGOUT = gql`
  mutation Logout($token: String) {
    logout(token: $token)
  }
`;


export const REGISTER_USER = gql`
  mutation Register(
    $firstName: String!
    $lastName: String!
    $email: String!
    $firebaseUid: String!
    $phone: String
    $role: UserRole
    $dob: String
    $gender: Gender
    $lg: Lg
    $city: City
    $town: Town
    $state: State
    $agreedToPolicy: Boolean!
  ) {
    registerUser(
      firstName: $firstName
      lastName: $lastName
      email: $email
      firebaseUid: $firebaseUid
      phone: $phone
      role: $role
      dob: $dob
      gender: $gender
      lg: $lg
      city: $city
      town: $town
      state: $state
      agreedToPolicy: $agreedToPolicy
    ) {
      user {
        id
        email
        firstName
        lastName
        role
        phone
        dob
        gender
        state
        city
        town
        lg
      }
    }
  }
`;

