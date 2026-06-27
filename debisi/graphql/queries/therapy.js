import { gql } from "@apollo/client";

export const GET_THERAPY_REQUESTS = gql`
  query GetTherapyRequests {
    therapyRequests {
      id
      name
      email
      phone
      message
      status
      createdAt
      updatedAt
    }
  }
`;

export const REQUEST_THERAPY_SESSION = gql`
  mutation RequestTherapySession($name: String!, $email: String!, $phone: String, $message: String!) {
    requestTherapySession(name: $name, email: $email, phone: $phone, message: $message) {
      id
      name
      status
    }
  }
`;

export const UPDATE_THERAPY_STATUS = gql`
  mutation UpdateTherapyRequestStatus($id: ID!, $status: String!) {
    updateTherapyRequestStatus(id: $id, status: $status) {
      id
      status
    }
  }
`;
