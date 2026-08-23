import { gql } from "@apollo/client";

export const UPDATE_USER_PROFILE = gql`
  mutation UpdateUser($input: UpdateUserInput!) {
    updateUser(input: $input) {
      id
      firstName
      lastName
      phone
      lg
      city
      town
      state
      gender
      dob
    }
  }
`;

export const DELETE_USER = gql`
  mutation DeleteUser {
    deleteUser
  }
`;
