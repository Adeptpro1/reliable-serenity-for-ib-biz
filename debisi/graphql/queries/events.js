import { gql } from "@apollo/client";

export const GET_EVENTS = gql`
  query GetEvents {
    events {
      id
      title
      description
      date
      imageUrl
      link
      createdAt
    }
  }
`;

export const CREATE_EVENT = gql`
  mutation CreateEvent($title: String!, $description: String!, $date: String!, $imageUrl: String, $link: String) {
    createEvent(title: $title, description: $description, date: $date, imageUrl: $imageUrl, link: $link) {
      id
      title
    }
  }
`;

export const DELETE_EVENT = gql`
  mutation DeleteEvent($id: ID!) {
    deleteEvent(id: $id)
  }
`;

export const UPDATE_EVENT = gql`
  mutation UpdateEvent($id: ID!, $title: String, $description: String, $date: String, $imageUrl: String, $link: String) {
    updateEvent(id: $id, title: $title, description: $description, date: $date, imageUrl: $imageUrl, link: $link) {
      id
      title
      description
      date
      imageUrl
      link
    }
  }
`;
